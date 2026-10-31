import { v, ConvexError } from 'convex/values';
import { mutation, query } from './_generated/server.js';
import { internal } from './_generated/api.js';
import { requireUser, requireAdmin, canReturnLoan } from './lib/auth.js';

/**
 * Borrow request initiation.
 * Validates tool availability, prohibits self-borrowing,
 * validates date range, and creates a borrowRequest with status "pending".
 */
export const createBorrowRequest = mutation({
    args: {
        toolId: v.id('tools'),
        startDate: v.string(), // ISO format YYYY-MM-DD
        endDate: v.string(), // ISO format YYYY-MM-DD
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        // 1. Fetch the requested tool
        const tool = await ctx.db.get(args.toolId);
        if (!tool) {
            throw new ConvexError('Tool not found');
        }

        // 2. Prohibit borrowing own tool
        if (tool.ownerId === user._id) {
            throw new ConvexError(
                'Validation error: You cannot borrow a tool you listed yourself',
            );
        }

        // 3. Prohibit requesting unavailable tool
        if (tool.status !== 'available') {
            throw new ConvexError(
                `Tool is currently unavailable for borrowing (status: ${tool.status})`,
            );
        }

        // 4. Validate date range
        const trimmedStart = args.startDate.trim();
        const trimmedEnd = args.endDate.trim();
        if (!trimmedStart || !trimmedEnd) {
            throw new ConvexError('Start date and end date are required');
        }

        const startTimestamp = new Date(trimmedStart).getTime();
        const endTimestamp = new Date(trimmedEnd).getTime();

        if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
            throw new ConvexError(
                'Invalid date format provided for borrow request',
            );
        }

        if (endTimestamp < startTimestamp) {
            throw new ConvexError(
                'Date validation error: End date cannot be earlier than start date',
            );
        }

        const now = Date.now();

        // 5. Insert new borrow request in "pending" status
        const requestId = await ctx.db.insert('borrowRequests', {
            toolId: tool._id,
            borrowerId: user._id,
            lenderId: tool.ownerId,
            startDate: trimmedStart,
            endDate: trimmedEnd,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
        });

        // Trigger outbound webhook notification to n8n via scheduler
        try {
            await ctx.scheduler.runAfter(
                0,
                internal.automation.notifyStatusChange,
                {
                    requestId,
                    eventType: 'request.created',
                },
            );
        } catch {
            // Continues cleanly in environments without active scheduler
        }

        return requestId;
    },
});

/**
 * Lender request approval and rejection.
 * Allows only the tool owner (or admin) to approve or decline pending borrow requests.
 * When approved:
 *  - Request status -> "approved"
 *  - Tool status -> "loaned"
 *  - Other conflicting pending requests for this tool -> "declined"
 * When declined:
 *  - Request status -> "declined"
 *  - Tool status remains unchanged
 */
export const updateRequestStatus = mutation({
    args: {
        requestId: v.id('borrowRequests'),
        status: v.union(
            v.literal('approved'),
            v.literal('declined'),
            v.literal('cancelled'),
        ),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        const request = await ctx.db.get(args.requestId);
        if (!request) {
            throw new ConvexError('Borrow request not found');
        }

        // Cancellation: borrower may cancel their own pending request
        if (args.status === 'cancelled') {
            if (request.borrowerId !== user._id && user.role !== 'admin') {
                throw new ConvexError(
                    'Forbidden: Only the borrower or an admin can cancel this request',
                );
            }
            if (request.status !== 'pending') {
                throw new ConvexError('Only pending requests can be cancelled');
            }
            const now = Date.now();
            await ctx.db.patch(request._id, {
                status: 'cancelled',
                updatedAt: now,
            });
            return request._id;
        }

        // Approval / Decline: Only the tool owner (or admin) can approve or decline
        if (request.lenderId !== user._id && user.role !== 'admin') {
            throw new ConvexError(
                'Forbidden: Only the tool owner or an administrator can approve or decline this request',
            );
        }

        if (request.status !== 'pending') {
            throw new ConvexError(
                `Cannot change status of a request that is already ${request.status}`,
            );
        }

        const now = Date.now();

        if (args.status === 'approved') {
            // 1. Transition this request to approved
            await ctx.db.patch(request._id, {
                status: 'approved',
                updatedAt: now,
            });

            // 2. Transition the tool status to "loaned"
            await ctx.db.patch(request.toolId, {
                status: 'loaned',
            });

            // 3. Automatically decline other pending requests for the same tool
            const conflictingRequests = await ctx.db
                .query('borrowRequests')
                .withIndex('by_tool', (q) => q.eq('toolId', request.toolId))
                .filter((q) => q.eq(q.field('status'), 'pending'))
                .collect();

            for (const conflicting of conflictingRequests) {
                if (conflicting._id !== request._id) {
                    await ctx.db.patch(conflicting._id, {
                        status: 'declined',
                        updatedAt: now,
                    });
                }
            }
        } else if (args.status === 'declined') {
            // Transition this request to declined
            await ctx.db.patch(request._id, {
                status: 'declined',
                updatedAt: now,
            });
        }

        // Trigger outbound webhook notification to n8n via scheduler
        const eventType =
            args.status === 'approved'
                ? 'request.approved'
                : args.status === 'declined'
                  ? 'request.declined'
                  : 'request.cancelled';

        try {
            await ctx.scheduler.runAfter(
                0,
                internal.automation.notifyStatusChange,
                {
                    requestId: request._id,
                    eventType,
                },
            );
        } catch {
            // Continues cleanly in environments without active scheduler
        }

        return request._id;
    },
});

/**
 * Loan completion and return tracking.
 * Allows the tool owner or borrower (or admin) to finalize an active loan.
 * Transitions request to "returned" and tool status back to "available".
 */
export const markReturned = mutation({
    args: {
        requestId: v.id('borrowRequests'),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        const request = await ctx.db.get(args.requestId);
        if (!request) {
            throw new ConvexError('Borrow request not found');
        }

        if (request.status !== 'approved') {
            throw new ConvexError(
                `Only approved active loans can be marked as returned (current status: ${request.status})`,
            );
        }

        // Verify caller is borrower, lender, or admin
        if (!canReturnLoan(user, request.borrowerId, request.lenderId)) {
            throw new ConvexError(
                'Forbidden: Only the borrower, lender, or an administrator can mark this tool as returned',
            );
        }

        const now = Date.now();

        // 1. Transition loan request to returned
        await ctx.db.patch(request._id, {
            status: 'returned',
            updatedAt: now,
        });

        // 2. Revert tool availability to "available"
        await ctx.db.patch(request.toolId, {
            status: 'available',
        });

        // Trigger outbound webhook notification to n8n via scheduler
        try {
            await ctx.scheduler.runAfter(
                0,
                internal.automation.notifyStatusChange,
                {
                    requestId: request._id,
                    eventType: 'request.returned',
                },
            );
        } catch {
            // Continues cleanly in environments without active scheduler
        }

        return {
            success: true,
            requestId: request._id,
            returnedAt: now,
        };
    },
});

/**
 * Segregated Query: "My Requests"
 * Displays all borrow requests initiated by the authenticated user,
 * enriched with tool information and lender metadata.
 */
export const getMyRequests = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireUser(ctx);

        const requests = await ctx.db
            .query('borrowRequests')
            .withIndex('by_borrower', (q) => q.eq('borrowerId', user._id))
            .order('desc')
            .collect();

        return await Promise.all(
            requests.map(async (req) => {
                const tool = await ctx.db.get(req.toolId);
                const lender = await ctx.db.get(req.lenderId);

                return {
                    ...req,
                    tool: tool
                        ? {
                              _id: tool._id,
                              name: tool.name,
                              category: tool.category,
                              condition: tool.condition,
                              status: tool.status,
                          }
                        : null,
                    lenderName: lender?.name ?? 'Community Neighbor',
                    lenderEmail: lender?.email ?? '',
                    isTrustedLender: lender?.isTrustedLender ?? false,
                };
            }),
        );
    },
});

/**
 * Segregated Query: "Incoming Requests"
 * Displays all borrow requests received by the authenticated user for their listed tools,
 * enriched with tool details and borrower contact info.
 */
export const getIncomingRequests = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireUser(ctx);

        const requests = await ctx.db
            .query('borrowRequests')
            .withIndex('by_lender', (q) => q.eq('lenderId', user._id))
            .order('desc')
            .collect();

        return await Promise.all(
            requests.map(async (req) => {
                const tool = await ctx.db.get(req.toolId);
                const borrower = await ctx.db.get(req.borrowerId);

                return {
                    ...req,
                    tool: tool
                        ? {
                              _id: tool._id,
                              name: tool.name,
                              category: tool.category,
                              condition: tool.condition,
                              status: tool.status,
                          }
                        : null,
                    borrowerName: borrower?.name ?? 'Community Neighbor',
                    borrowerEmail: borrower?.email ?? '',
                };
            }),
        );
    },
});

/**
 * Segregated Query: "My Listings"
 * Displays all tools listed by the authenticated user, their current loan status,
 * active loan / borrower details if currently loaned, and pending request count.
 */
export const getMyListings = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireUser(ctx);

        const tools = await ctx.db
            .query('tools')
            .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
            .collect();

        return await Promise.all(
            tools.map(async (tool) => {
                let activeLoan: {
                    requestId: typeof tool._id;
                    startDate: string;
                    endDate: string;
                    borrowerName: string;
                    borrowerEmail: string;
                } | null = null;

                if (tool.status === 'loaned') {
                    const loan = await ctx.db
                        .query('borrowRequests')
                        .withIndex('by_tool', (q) => q.eq('toolId', tool._id))
                        .filter((q) => q.eq(q.field('status'), 'approved'))
                        .first();

                    if (loan) {
                        const borrower = await ctx.db.get(loan.borrowerId);
                        activeLoan = {
                            requestId: loan._id as unknown as typeof tool._id,
                            startDate: loan.startDate,
                            endDate: loan.endDate,
                            borrowerName:
                                borrower?.name ?? 'Community Neighbor',
                            borrowerEmail: borrower?.email ?? '',
                        };
                    }
                }

                const pendingRequests = await ctx.db
                    .query('borrowRequests')
                    .withIndex('by_tool', (q) => q.eq('toolId', tool._id))
                    .filter((q) => q.eq(q.field('status'), 'pending'))
                    .collect();

                return {
                    ...tool,
                    activeLoan,
                    pendingCount: pendingRequests.length,
                };
            }),
        );
    },
});

/**
 * Segregated Query: "All Loans (Admin)"
 * Exclusively accessible to administrators via requireAdmin(ctx).
 * Returns all borrow requests across the entire community with full borrower and lender details.
 */
export const getAllLoansAdmin = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);

        const requests = await ctx.db.query('borrowRequests').collect();

        return await Promise.all(
            requests.map(async (req) => {
                const tool = await ctx.db.get(req.toolId);
                const borrower = await ctx.db.get(req.borrowerId);
                const lender = await ctx.db.get(req.lenderId);

                return {
                    ...req,
                    toolName: tool?.name ?? 'Unknown Tool',
                    toolCategory: tool?.category ?? 'other',
                    borrowerName: borrower?.name ?? 'Unknown Borrower',
                    borrowerEmail: borrower?.email ?? '',
                    lenderName: lender?.name ?? 'Unknown Lender',
                    lenderEmail: lender?.email ?? '',
                    isTrustedLender: lender?.isTrustedLender ?? false,
                };
            }),
        );
    },
});

/**
 * Query to inspect a single borrow request by ID.
 * Allowed only for participants (borrower or lender) or admins.
 */
export const getRequestById = query({
    args: {
        requestId: v.id('borrowRequests'),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        const request = await ctx.db.get(args.requestId);
        if (!request) {
            return null;
        }

        if (
            request.borrowerId !== user._id &&
            request.lenderId !== user._id &&
            user.role !== 'admin'
        ) {
            throw new ConvexError(
                'Forbidden: You are not authorized to view this borrow request',
            );
        }

        const tool = await ctx.db.get(request.toolId);
        const borrower = await ctx.db.get(request.borrowerId);
        const lender = await ctx.db.get(request.lenderId);

        return {
            ...request,
            tool,
            borrower,
            lender,
        };
    },
});
