import { v, ConvexError } from 'convex/values';
import {
    internalAction,
    internalMutation,
    internalQuery,
    query,
} from './_generated/server.js';
import { internal } from './_generated/api.js';
import { requireUser, requireAdmin } from './lib/auth.js';
import { generateHmacSignature } from './lib/crypto.js';

/**
 * Internal query to gather data-minimized details for webhook payload.
 */
export const getRequestDetailsForWebhook = internalQuery({
    args: {
        requestId: v.id('borrowRequests'),
    },
    handler: async (ctx, args) => {
        const request = await ctx.db.get(args.requestId);
        if (!request) {
            return null;
        }

        const tool = await ctx.db.get(request.toolId);
        const borrower = await ctx.db.get(request.borrowerId);
        const lender = await ctx.db.get(request.lenderId);

        return {
            requestId: request._id,
            toolName: tool?.name ?? 'Unknown Tool',
            startDate: request.startDate,
            endDate: request.endDate,
            status: request.status,
            borrowerName: borrower?.name ?? 'Borrower',
            borrowerEmail: borrower?.email ?? '',
            lenderName: lender?.name ?? 'Lender',
            lenderEmail: lender?.email ?? '',
        };
    },
});

/**
 * Internal mutation to log automation execution results into automationLogs.
 */
export const recordAutomationLog = internalMutation({
    args: {
        loanId: v.optional(v.id('borrowRequests')),
        actionType: v.union(
            v.literal('request_notification'),
            v.literal('overdue_reminder'),
            v.literal('status_sync'),
        ),
        status: v.union(v.literal('success'), v.literal('failed')),
        idempotencyKey: v.string(),
        summary: v.string(),
        timestamp: v.number(),
    },
    handler: async (ctx, args) => {
        // Prevent duplicate log insertion for the exact same idempotency key
        const existing = await ctx.db
            .query('automationLogs')
            .withIndex('by_idempotency_key', (q) =>
                q.eq('idempotencyKey', args.idempotencyKey),
            )
            .first();

        if (existing) {
            return existing._id;
        }

        return await ctx.db.insert('automationLogs', {
            loanId: args.loanId,
            actionType: args.actionType,
            status: args.status,
            idempotencyKey: args.idempotencyKey,
            summary: args.summary,
            timestamp: args.timestamp,
        });
    },
});

/**
 * Outbound Webhook Action (`internal.automation.notifyStatusChange`).
 * Sends an HMAC-signed, data-minimized webhook payload to n8n on request creation
 * and status transitions.
 */
export const notifyStatusChange = internalAction({
    args: {
        requestId: v.id('borrowRequests'),
        eventType: v.union(
            v.literal('request.created'),
            v.literal('request.approved'),
            v.literal('request.declined'),
            v.literal('request.returned'),
            v.literal('request.cancelled'),
        ),
    },
    handler: async (ctx, args) => {
        const details = await ctx.runQuery(
            internal.automation.getRequestDetailsForWebhook,
            { requestId: args.requestId },
        );

        if (!details) {
            return { sent: false, reason: 'Request details not found' };
        }

        // Determine recipient & actor based on event type
        const isLenderRecipient = args.eventType === 'request.created';
        const recipientEmail = isLenderRecipient
            ? details.lenderEmail
            : details.borrowerEmail;
        const recipientName = isLenderRecipient
            ? details.lenderName
            : details.borrowerName;
        const actorName = isLenderRecipient
            ? details.borrowerName
            : details.lenderName;

        const timestamp = Date.now();
        const eventId = `evt_${timestamp}_${Math.random().toString(36).substring(2, 9)}`;

        // Data-minimized payload omitting database internals and private credentials
        const payload = {
            eventId,
            eventType: args.eventType,
            timestamp,
            requestId: args.requestId,
            toolName: details.toolName,
            startDate: details.startDate,
            endDate: details.endDate,
            recipientEmail,
            recipientName,
            actorName,
            status: details.status,
        };

        const payloadString = JSON.stringify(payload);
        const secret =
            process.env.N8N_WEBHOOK_SECRET || 'lendloop_default_shared_secret';
        const signature = await generateHmacSignature(payloadString, secret);

        const webhookUrl = process.env.N8N_WEBHOOK_URL;
        if (!webhookUrl) {
            // When URL is not configured (e.g. in local development without active n8n),
            // log the event for auditing without crashing
            await ctx.runMutation(internal.automation.recordAutomationLog, {
                loanId: args.requestId,
                actionType: 'request_notification',
                status: 'success',
                idempotencyKey: eventId,
                summary: `Simulated notification dispatch for ${args.eventType} (${details.toolName})`,
                timestamp,
            });

            return {
                sent: false,
                simulated: true,
                eventId,
                signature,
            };
        }

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-signature': signature,
                    'X-LendLoop-Signature': signature,
                    'X-LendLoop-Timestamp': timestamp.toString(),
                },
                body: payloadString,
            });

            const success = response.ok;
            await ctx.runMutation(internal.automation.recordAutomationLog, {
                loanId: args.requestId,
                actionType: 'request_notification',
                status: success ? 'success' : 'failed',
                idempotencyKey: eventId,
                summary: success
                    ? `Dispatched ${args.eventType} notification to n8n for ${details.toolName}`
                    : `Failed dispatching ${args.eventType} to n8n (HTTP ${response.status})`,
                timestamp,
            });

            return { sent: success, eventId, status: response.status };
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);

            await ctx.runMutation(internal.automation.recordAutomationLog, {
                loanId: args.requestId,
                actionType: 'request_notification',
                status: 'failed',
                idempotencyKey: eventId,
                summary: `Webhook delivery error for ${args.eventType}: ${errorMessage}`,
                timestamp,
            });

            return { sent: false, error: errorMessage };
        }
    },
});

/**
 * Query overdue active loans for n8n cron synchronization.
 */
export const getOverdueLoansQuery = internalQuery({
    args: {},
    handler: async (ctx) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const now = Date.now();
        const startOfToday = new Date().setHours(0, 0, 0, 0);

        // Fetch all approved (active) loans
        const approvedLoans = await ctx.db
            .query('borrowRequests')
            .withIndex('by_status', (q) => q.eq('status', 'approved'))
            .collect();

        // Filter loans where endDate is strictly prior to today and not yet reminded today
        const overdueLoans = [];
        for (const loan of approvedLoans) {
            if (loan.endDate < todayStr) {
                // If reminder already sent today, skip to ensure daily idempotency
                if (
                    loan.lastReminderSentAt &&
                    loan.lastReminderSentAt >= startOfToday
                ) {
                    continue;
                }

                const tool = await ctx.db.get(loan.toolId);
                const borrower = await ctx.db.get(loan.borrowerId);
                const lender = await ctx.db.get(loan.lenderId);

                // Compute days overdue
                const endDateTime = new Date(loan.endDate).getTime();
                const daysOverdue = Math.max(
                    1,
                    Math.floor((now - endDateTime) / (1000 * 60 * 60 * 24)),
                );

                overdueLoans.push({
                    loanId: loan._id,
                    toolName: tool?.name ?? 'Unknown Tool',
                    borrowerName: borrower?.name ?? 'Borrower',
                    borrowerEmail: borrower?.email ?? '',
                    lenderName: lender?.name ?? 'Lender',
                    startDate: loan.startDate,
                    endDate: loan.endDate,
                    daysOverdue,
                    lastReminderSentAt: loan.lastReminderSentAt,
                });
            }
        }

        return overdueLoans;
    },
});

/**
 * Idempotent Reminder Write-back Mutation.
 * Records reminder dispatch in borrowRequests and logs the action in automationLogs.
 */
export const recordReminderAck = internalMutation({
    args: {
        loanId: v.id('borrowRequests'),
        idempotencyKey: v.string(),
        channel: v.optional(v.string()),
        reminderDate: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. Check idempotency key to prevent duplicate reminders upon retry
        const existing = await ctx.db
            .query('automationLogs')
            .withIndex('by_idempotency_key', (q) =>
                q.eq('idempotencyKey', args.idempotencyKey),
            )
            .first();

        if (existing) {
            return {
                duplicate: true,
                message: 'Duplicate acknowledgment ignored',
                logId: existing._id,
            };
        }

        // 2. Fetch the target loan
        const loan = await ctx.db.get(args.loanId);
        if (!loan) {
            throw new ConvexError('Loan not found');
        }

        const now = Date.now();

        // 3. Update the loan's last reminder timestamp
        await ctx.db.patch(args.loanId, {
            lastReminderSentAt: now,
            updatedAt: now,
        });

        // 4. Record automation log
        const logId = await ctx.db.insert('automationLogs', {
            loanId: args.loanId,
            actionType: 'overdue_reminder',
            status: 'success',
            idempotencyKey: args.idempotencyKey,
            summary: `Overdue reminder dispatched via ${args.channel ?? 'email'} on ${args.reminderDate ?? new Date().toISOString()}`,
            timestamp: now,
        });

        return {
            duplicate: false,
            acknowledged: true,
            logId,
        };
    },
});

/**
 * Recent Automation Activity Query Helper.
 * Exposes reminder and notification history for a loan card.
 */
export const getAutomationActivity = query({
    args: {
        loanId: v.id('borrowRequests'),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        const request = await ctx.db.get(args.loanId);
        if (!request) {
            return [];
        }

        // Verify caller is borrower, lender, or admin
        if (
            request.borrowerId !== user._id &&
            request.lenderId !== user._id &&
            user.role !== 'admin'
        ) {
            throw new ConvexError(
                'Forbidden: You are not authorized to view automation logs for this loan',
            );
        }

        const logs = await ctx.db
            .query('automationLogs')
            .withIndex('by_loan', (q) => q.eq('loanId', args.loanId))
            .collect();

        // Sort descending by timestamp
        logs.sort((a, b) => b.timestamp - a.timestamp);

        const now = Date.now();

        return logs.map((log) => {
            const elapsedMs = now - log.timestamp;
            const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
            const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));

            let relativeTime = 'Just now';
            if (elapsedDays > 1) {
                relativeTime = `${elapsedDays} days ago`;
            } else if (elapsedDays === 1) {
                relativeTime = 'Yesterday';
            } else if (elapsedHours > 0) {
                relativeTime = `${elapsedHours}h ago`;
            }

            let badgeText = log.summary;
            if (log.actionType === 'overdue_reminder') {
                badgeText = `Reminder sent ${relativeTime}`;
            } else if (log.actionType === 'request_notification') {
                badgeText = `Notification dispatched ${relativeTime}`;
            }

            return {
                ...log,
                relativeTime,
                badgeText,
            };
        });
    },
});

/**
 * Admin query to inspect all platform-wide automation logs.
 */
export const getAllAutomationLogsAdmin = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);

        const logs = await ctx.db.query('automationLogs').collect();
        logs.sort((a, b) => b.timestamp - a.timestamp);
        return logs;
    },
});
