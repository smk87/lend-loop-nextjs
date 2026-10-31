import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("user"), v.literal("admin")),
    isTrustedLender: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_role", ["role"]),

  tools: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    category: v.union(
      v.literal("power tools"),
      v.literal("garden"),
      v.literal("kitchen"),
      v.literal("camping"),
      v.literal("hand tools"),
      v.literal("other")
    ),
    condition: v.union(
      v.literal("new"),
      v.literal("like-new"),
      v.literal("good"),
      v.literal("fair")
    ),
    description: v.string(),
    status: v.union(
      v.literal("available"),
      v.literal("loaned"),
      v.literal("maintenance")
    ),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_status", ["status"])
    .index("by_category", ["category"]),

  borrowRequests: defineTable({
    toolId: v.id("tools"),
    borrowerId: v.id("users"),
    lenderId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("declined"),
      v.literal("returned"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastReminderSentAt: v.optional(v.number()),
  })
    .index("by_tool", ["toolId"])
    .index("by_borrower", ["borrowerId"])
    .index("by_lender", ["lenderId"])
    .index("by_status", ["status"]),

  automationLogs: defineTable({
    loanId: v.optional(v.id("borrowRequests")),
    actionType: v.union(
      v.literal("request_notification"),
      v.literal("overdue_reminder"),
      v.literal("status_sync")
    ),
    status: v.union(v.literal("success"), v.literal("failed")),
    idempotencyKey: v.string(),
    summary: v.string(),
    timestamp: v.number(),
  })
    .index("by_idempotency_key", ["idempotencyKey"])
    .index("by_loan", ["loanId"]),
});
