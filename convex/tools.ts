import { v, ConvexError } from 'convex/values';
import { mutation, query } from './_generated/server.js';
import { requireUser, requireAdmin, canManageTool } from './lib/auth.js';

/**
 * Valid category values conforming to the schema.
 */
export const toolCategoryValidator = v.union(
    v.literal('power tools'),
    v.literal('garden'),
    v.literal('kitchen'),
    v.literal('camping'),
    v.literal('hand tools'),
    v.literal('other'),
);

/**
 * Valid condition ratings conforming to the schema.
 */
export const toolConditionValidator = v.union(
    v.literal('new'),
    v.literal('like-new'),
    v.literal('good'),
    v.literal('fair'),
);

/**
 * Valid tool availability status values conforming to the schema.
 */
export const toolStatusValidator = v.union(
    v.literal('available'),
    v.literal('loaned'),
    v.literal('maintenance'),
);

/**
 * Public unauthenticated query.
 * Exposes available tools with strict data minimization:
 * ONLY exposes _id, name, category, condition, and status.
 * Explicitly excludes ownerId, user IDs, names, emails, and exact timestamps.
 */
export const getPublicAvailable = query({
    args: {},
    handler: async (ctx) => {
        const tools = await ctx.db
            .query('tools')
            .withIndex('by_status', (q) => q.eq('status', 'available'))
            .collect();

        return tools.map((tool) => ({
            _id: tool._id,
            name: tool.name,
            category: tool.category,
            condition: tool.condition,
            status: tool.status,
        }));
    },
});

/**
 * Authenticated query for tool catalog.
 * Supports optional category filtering and enriches each tool
 * with owner metadata and Trusted Lender badge status.
 */
export const getAllTools = query({
    args: {
        category: v.optional(toolCategoryValidator),
    },
    handler: async (ctx, args) => {
        await requireUser(ctx);

        const tools = args.category
            ? await ctx.db
                  .query('tools')
                  .withIndex('by_category', (q) =>
                      q.eq('category', args.category!),
                  )
                  .collect()
            : await ctx.db.query('tools').collect();

        // Enrich tools with lender name and Trusted Lender badge
        const enrichedTools = await Promise.all(
            tools.map(async (tool) => {
                const owner = await ctx.db.get(tool.ownerId);
                return {
                    ...tool,
                    ownerName: owner?.name ?? 'Community Neighbor',
                    isTrustedLender: owner?.isTrustedLender ?? false,
                    owner: owner
                        ? {
                              _id: owner._id,
                              name: owner.name,
                              isTrustedLender: owner.isTrustedLender,
                          }
                        : null,
                };
            }),
        );

        return enrichedTools;
    },
});

// Alias for convenience
export const getAll = getAllTools;

/**
 * Authenticated query to retrieve a single tool's details by ID.
 */
export const getToolById = query({
    args: {
        toolId: v.id('tools'),
    },
    handler: async (ctx, args) => {
        await requireUser(ctx);

        const tool = await ctx.db.get(args.toolId);
        if (!tool) {
            return null;
        }

        const owner = await ctx.db.get(tool.ownerId);
        return {
            ...tool,
            ownerName: owner?.name ?? 'Community Neighbor',
            isTrustedLender: owner?.isTrustedLender ?? false,
            owner: owner
                ? {
                      _id: owner._id,
                      name: owner.name,
                      isTrustedLender: owner.isTrustedLender,
                  }
                : null,
        };
    },
});

/**
 * Authenticated query to retrieve all tools owned by the current user.
 */
export const getMyTools = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireUser(ctx);

        const tools = await ctx.db
            .query('tools')
            .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
            .collect();

        return tools.map((tool) => ({
            ...tool,
            ownerName: user.name,
            isTrustedLender: user.isTrustedLender,
        }));
    },
});

/**
 * Tool listing creation.
 * Authenticated user can publish a new tool listing.
 */
export const createTool = mutation({
    args: {
        name: v.string(),
        category: toolCategoryValidator,
        condition: toolConditionValidator,
        description: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        const trimmedName = args.name.trim();
        if (!trimmedName) {
            throw new ConvexError(
                'Validation error: Tool name cannot be empty',
            );
        }

        const toolId = await ctx.db.insert('tools', {
            ownerId: user._id,
            name: trimmedName,
            category: args.category,
            condition: args.condition,
            description: args.description.trim(),
            status: 'available',
            createdAt: Date.now(),
        });

        return toolId;
    },
});

/**
 * Tool listing update.
 * Enforces server-side ownership check (canManageTool) before applying changes.
 */
export const updateTool = mutation({
    args: {
        toolId: v.id('tools'),
        name: v.optional(v.string()),
        category: v.optional(toolCategoryValidator),
        condition: v.optional(toolConditionValidator),
        description: v.optional(v.string()),
        status: v.optional(toolStatusValidator),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        const tool = await ctx.db.get(args.toolId);
        if (!tool) {
            throw new ConvexError('Tool not found');
        }

        if (!canManageTool(user, tool.ownerId)) {
            throw new ConvexError(
                'Forbidden: You are not authorized to modify this tool',
            );
        }

        const patch: Partial<{
            name: string;
            category: typeof args.category;
            condition: typeof args.condition;
            description: string;
            status: typeof args.status;
        }> = {};

        if (args.name !== undefined) {
            const trimmed = args.name.trim();
            if (!trimmed) {
                throw new ConvexError(
                    'Validation error: Tool name cannot be empty',
                );
            }
            patch.name = trimmed;
        }

        if (args.category !== undefined) {
            patch.category = args.category;
        }

        if (args.condition !== undefined) {
            patch.condition = args.condition;
        }

        if (args.description !== undefined) {
            patch.description = args.description.trim();
        }

        if (args.status !== undefined) {
            patch.status = args.status;
        }

        await ctx.db.patch(args.toolId, patch);
        return args.toolId;
    },
});

/**
 * Tool listing deletion.
 * Enforces server-side ownership check (canManageTool).
 * Prohibits deleting tools that are currently loaned out.
 */
export const deleteTool = mutation({
    args: {
        toolId: v.id('tools'),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        const tool = await ctx.db.get(args.toolId);
        if (!tool) {
            throw new ConvexError('Tool not found');
        }

        if (!canManageTool(user, tool.ownerId)) {
            throw new ConvexError(
                'Forbidden: You are not authorized to delete this tool',
            );
        }

        if (tool.status === 'loaned') {
            throw new ConvexError(
                'Cannot delete a tool while it is currently loaned out',
            );
        }

        await ctx.db.delete(args.toolId);
        return { success: true, deletedId: args.toolId };
    },
});

/**
 * Admin listing moderation.
 * Allows users with admin role to delete any tool listing.
 * Denies execution for standard non-admin users.
 */
export const adminDeleteTool = mutation({
    args: {
        toolId: v.id('tools'),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const tool = await ctx.db.get(args.toolId);
        if (!tool) {
            throw new ConvexError('Tool not found');
        }

        await ctx.db.delete(args.toolId);
        return {
            success: true,
            deletedId: args.toolId,
            reason: args.reason ?? 'Administrative moderation',
        };
    },
});
