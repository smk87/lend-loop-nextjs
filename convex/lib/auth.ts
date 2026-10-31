import { ConvexError } from "convex/values";
import type { QueryCtx, MutationCtx } from "../_generated/server.js";
import type { Doc, Id } from "../_generated/dataModel.js";

/**
 * Extracts and returns the authenticated Clerk identity, or null if unauthenticated.
 */
export async function getIdentity(ctx: QueryCtx | MutationCtx) {
  return await ctx.auth.getUserIdentity();
}

/**
 * Retrieves the current authenticated user record from the database, or null if unauthenticated or not found.
 */
export async function getCurrentUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users"> | null> {
  const identity = await getIdentity(ctx);
  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .first();

  return user;
}

/**
 * Enforces that the caller is authenticated and exists in the users table.
 * Throws an Unauthorized ConvexError if not authenticated or not registered.
 */
export async function requireUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  const identity = await getIdentity(ctx);
  if (!identity) {
    throw new ConvexError("Unauthorized: Authentication required");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .first();

  if (!user) {
    throw new ConvexError("Unauthorized: User account not registered");
  }

  return user;
}

/**
 * Enforces that the caller is authenticated and has the 'admin' role.
 * Throws an Unauthorized or Forbidden ConvexError if unauthenticated or not an admin.
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  const user = await requireUser(ctx);
  if (user.role !== "admin") {
    throw new ConvexError("Forbidden: Admin privileges required");
  }
  return user;
}

/**
 * Checks whether a user has permission to manage a tool (owner or admin).
 */
export function canManageTool(
  user: Doc<"users">,
  toolOwnerId: Id<"users">
): boolean {
  return user._id === toolOwnerId || user.role === "admin";
}

/**
 * Checks whether a user can mark a loan as returned (borrower, lender, or admin).
 */
export function canReturnLoan(
  user: Doc<"users">,
  borrowerId: Id<"users">,
  lenderId: Id<"users">
): boolean {
  return (
    user._id === borrowerId ||
    user._id === lenderId ||
    user.role === "admin"
  );
}
