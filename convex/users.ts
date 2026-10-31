import { v } from 'convex/values';
import { mutation, query } from './_generated/server.js';
import { requireAdmin, getCurrentUser } from './lib/auth.js';
import { ConvexError } from 'convex/values';

/**
 * Stores or updates the authenticated Clerk user in the Convex database.
 * Returns the user's Convex ID.
 */
export const storeUser = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError('Unauthorized: Authentication required');
        }

        const existingUser = await ctx.db
            .query('users')
            .withIndex('by_tokenIdentifier', (q) =>
                q.eq('tokenIdentifier', identity.tokenIdentifier),
            )
            .first();

        const name =
            identity.name ??
            identity.nickname ??
            identity.givenName ??
            'Community Member';
        const email = identity.email ?? '';

        if (existingUser !== null) {
            // Update name or email if they have changed in Clerk
            if (existingUser.name !== name || existingUser.email !== email) {
                await ctx.db.patch(existingUser._id, {
                    name,
                    email,
                });
            }
            return existingUser._id;
        }

        // New user registration
        const newUserId = await ctx.db.insert('users', {
            tokenIdentifier: identity.tokenIdentifier,
            name,
            email,
            role: 'user',
            isTrustedLender: false,
            createdAt: Date.now(),
        });

        return newUserId;
    },
});

/**
 * Retrieves the current authenticated user's profile, or null if unauthenticated.
 */
export const currentUser = query({
    args: {},
    handler: async (ctx) => {
        return await getCurrentUser(ctx);
    },
});

/**
 * Retrieves a user's public profile information by ID.
 */
export const getUserById = query({
    args: {
        userId: v.id('users'),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) {
            return null;
        }

        // Return safe profile data
        return {
            _id: user._id,
            name: user.name,
            isTrustedLender: user.isTrustedLender,
            createdAt: user.createdAt,
        };
    },
});

/**
 * Admin query: Returns all registered users across the platform.
 */
export const getAllUsersAdmin = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        return await ctx.db.query('users').collect();
    },
});

/**
 * Admin mutation: Sets the 'isTrustedLender' status for a specific user.
 */
export const setTrustedLender = mutation({
    args: {
        userId: v.id('users'),
        isTrustedLender: v.boolean(),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const targetUser = await ctx.db.get(args.userId);
        if (!targetUser) {
            throw new ConvexError('User not found');
        }

        await ctx.db.patch(args.userId, {
            isTrustedLender: args.isTrustedLender,
        });

        return {
            userId: args.userId,
            isTrustedLender: args.isTrustedLender,
        };
    },
});

/**
 * Admin mutation: Toggles the 'isTrustedLender' status for a specific user.
 */
export const toggleTrustedLender = mutation({
    args: {
        userId: v.id('users'),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const targetUser = await ctx.db.get(args.userId);
        if (!targetUser) {
            throw new ConvexError('User not found');
        }

        const updatedStatus = !targetUser.isTrustedLender;
        await ctx.db.patch(args.userId, {
            isTrustedLender: updatedStatus,
        });

        return {
            userId: args.userId,
            isTrustedLender: updatedStatus,
        };
    },
});

/**
 * Admin mutation: Modifies a user's role (user <-> admin).
 */
export const setUserRole = mutation({
    args: {
        userId: v.id('users'),
        role: v.union(v.literal('user'), v.literal('admin')),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const targetUser = await ctx.db.get(args.userId);
        if (!targetUser) {
            throw new ConvexError('User not found');
        }

        await ctx.db.patch(args.userId, {
            role: args.role,
        });

        return {
            userId: args.userId,
            role: args.role,
        };
    },
});
