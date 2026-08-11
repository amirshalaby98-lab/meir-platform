import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../../_core/trpc";
import { getDb } from "../../shared/database";
import {
  conversations,
  messages,
  priceOffers,
  chatParticipants,
  chatNotifications,
} from "../../../drizzle/schema";
import { eq, and, or, desc } from "drizzle-orm";

export const chatRouter = router({
  // Get all conversations for a user
  getConversations: protectedProcedure
    .input(z.object({ userType: z.enum(["customer", "vendor"]) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userConversations = await db
        .select()
        .from(conversations)
        .where(
          input.userType === "customer"
            ? eq(conversations.customerId, ctx.user.id)
            : eq(conversations.vendorId, ctx.user.id)
        )
        .orderBy(desc(conversations.lastMessageAt));

      return userConversations;
    }),

  // Get conversation details with messages
  getConversation: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const conversation = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, input.conversationId))
        .limit(1);

      if (conversation.length === 0) {
        throw new Error("Conversation not found");
      }

      const conv = conversation[0];

      // Check if user is part of this conversation
      if (
        ctx.user.id !== conv.customerId &&
        ctx.user.id !== conv.vendorId
      ) {
        throw new Error("Unauthorized");
      }

      // Get messages
      const conversationMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, input.conversationId))
        .orderBy(messages.createdAt);

      return {
        conversation: conv,
        messages: conversationMessages,
      };
    }),

  // Create a new conversation
  createConversation: protectedProcedure
    .input(
      z.object({
        recipientId: z.number(),
        userType: z.enum(["customer", "vendor"]),
        subject: z.string(),
        bookingId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const customerId =
        input.userType === "customer" ? ctx.user.id : input.recipientId;
      const vendorId =
        input.userType === "vendor" ? ctx.user.id : input.recipientId;

      // Check if conversation already exists
      const existing = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.customerId, customerId),
            eq(conversations.vendorId, vendorId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return existing[0];
      }

      // Create new conversation
      const [result] = await db
        .insert(conversations)
        .values({
          customerId,
          vendorId,
          subject: input.subject,
          bookingId: input.bookingId,
        })
        .execute();

      const conversationId = (result as any).insertId;

      // Add participants
      await db
        .insert(chatParticipants)
        .values([
          {
            conversationId,
            userId: customerId,
            userType: "customer",
          },
          {
            conversationId,
            userId: vendorId,
            userType: "vendor",
          },
        ])
        .execute();

      return {
        id: conversationId,
        customerId,
        vendorId,
        subject: input.subject,
        bookingId: input.bookingId,
        status: "active",
        createdAt: new Date(),
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      };
    }),

  // Send a message
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        content: z.string(),
        userType: z.enum(["customer", "vendor"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify user is part of conversation
      const conv = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, input.conversationId))
        .limit(1);

      if (conv.length === 0) throw new Error("Conversation not found");

      const conversation = conv[0];
      if (
        (input.userType === "customer" &&
          ctx.user.id !== conversation.customerId) ||
        (input.userType === "vendor" && ctx.user.id !== conversation.vendorId)
      ) {
        throw new Error("Unauthorized");
      }

      // Save message
      const [result] = await db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          senderId: ctx.user.id,
          senderType: input.userType,
          content: input.content,
          messageType: "text",
        })
        .execute();

      const messageId = (result as any).insertId;

      // Update conversation last message time
      await db
        .update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, input.conversationId))
        .execute();

      return {
        id: messageId,
        conversationId: input.conversationId,
        senderId: ctx.user.id,
        senderType: input.userType,
        content: input.content,
        messageType: "text",
        isRead: false,
        createdAt: new Date(),
      };
    }),

  // Create price offer
  createPriceOffer: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        userType: z.enum(["customer", "vendor"]),
        description: z.string(),
        originalPrice: z.number(),
        offeredPrice: z.number(),
        discountPercentage: z.number().optional(),
        laborHours: z.number().optional(),
        parts: z.array(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get conversation
      const conv = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, input.conversationId))
        .limit(1);

      if (conv.length === 0) throw new Error("Conversation not found");

      const conversation = conv[0];

      // Only vendor can create offers
      if (input.userType !== "vendor" || ctx.user.id !== conversation.vendorId) {
        throw new Error("Only vendor can create offers");
      }

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Create offer
      const [result] = await db
        .insert(priceOffers)
        .values({
          conversationId: input.conversationId,
          vendorId: ctx.user.id,
          customerId: conversation.customerId,
          bookingId: conversation.bookingId || undefined,
          description: input.description,
          originalPrice: String(input.originalPrice),
          offeredPrice: String(input.offeredPrice),
          discountPercentage: String(input.discountPercentage || 0),
          laborHours: input.laborHours ? String(input.laborHours) : undefined,
          parts: JSON.stringify(input.parts || []),
          status: "pending",
          expiresAt,
        })
        .execute();

      const offerId = (result as any).insertId;

      // Create offer message
      await db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          senderId: ctx.user.id,
          senderType: "vendor",
          content: `عرض سعر: ${input.description} - ${input.offeredPrice} ريال`,
          messageType: "offer",
          offerId,
        })
        .execute();

      return {
        id: offerId,
        conversationId: input.conversationId,
        vendorId: ctx.user.id,
        customerId: conversation.customerId,
        description: input.description,
        originalPrice: Number(input.originalPrice),
        offeredPrice: Number(input.offeredPrice),
        discountPercentage: Number(input.discountPercentage || 0),
        status: "pending",
        expiresAt,
        createdAt: new Date(),
      };
    }),

  // Accept or reject offer
  respondToOffer: protectedProcedure
    .input(
      z.object({
        offerId: z.number(),
        response: z.enum(["accepted", "rejected"]),
        rejectionReason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get offer
      const offer = await db
        .select()
        .from(priceOffers)
        .where(eq(priceOffers.id, input.offerId))
        .limit(1);

      if (offer.length === 0) throw new Error("Offer not found");

      const priceOffer = offer[0];

      // Only customer can respond
      if (ctx.user.id !== priceOffer.customerId) {
        throw new Error("Only customer can respond to offer");
      }

      const timestamp = new Date();
      const updateData: any = {
        status: input.response,
      };

      if (input.response === "accepted") {
        updateData.acceptedAt = timestamp;
      } else {
        updateData.rejectedAt = timestamp;
        if (input.rejectionReason) {
          updateData.rejectionReason = input.rejectionReason;
        }
      }

      await db
        .update(priceOffers)
        .set(updateData)
        .where(eq(priceOffers.id, input.offerId))
        .execute();

      return {
        id: input.offerId,
        status: input.response,
        [input.response === "accepted" ? "acceptedAt" : "rejectedAt"]: timestamp,
      };
    }),

  // Get price offers for a conversation
  getPriceOffers: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const offers = await db
        .select()
        .from(priceOffers)
        .where(eq(priceOffers.conversationId, input.conversationId))
        .orderBy(desc(priceOffers.createdAt));

      return offers;
    }),

  // Mark messages as read
  markMessagesAsRead: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(messages)
        .set({ isRead: true, readAt: new Date() })
        .where(
          and(
            eq(messages.conversationId, input.conversationId),
            eq(messages.isRead, false)
          )
        )
        .execute();

      return { success: true };
    }),

  // Get unread message count
  getUnreadCount: protectedProcedure
    .input(z.object({ userType: z.enum(["customer", "vendor"]) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get user's conversations
      const userConversations = await db
        .select()
        .from(conversations)
        .where(
          input.userType === "customer"
            ? eq(conversations.customerId, ctx.user.id)
            : eq(conversations.vendorId, ctx.user.id)
        );

      if (userConversations.length === 0) return { unreadCount: 0 };

      const conversationIds = userConversations.map((c) => c.id);

      // Count unread messages
      const unreadMessages = await db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.isRead, false),
            // Messages not sent by current user
            input.userType === "customer"
              ? eq(messages.senderType, "vendor")
              : eq(messages.senderType, "customer")
          )
        );

      return {
        unreadCount: unreadMessages.filter((m) =>
          conversationIds.includes(m.conversationId)
        ).length,
      };
    }),

  // Close conversation
  closeConversation: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify user is part of conversation
      const conv = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, input.conversationId))
        .limit(1);

      if (conv.length === 0) throw new Error("Conversation not found");

      const conversation = conv[0];
      if (
        ctx.user.id !== conversation.customerId &&
        ctx.user.id !== conversation.vendorId
      ) {
        throw new Error("Unauthorized");
      }

      await db
        .update(conversations)
        .set({ status: "closed" })
        .where(eq(conversations.id, input.conversationId))
        .execute();

      return { success: true };
    }),
});
