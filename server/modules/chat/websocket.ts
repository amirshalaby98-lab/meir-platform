import { createLogger } from "../../_core/logger";
const log = createLogger("websocket");
import { WebSocketServer, WebSocket } from "ws";
import { Server as HTTPServer } from "http";
import { getDb } from "../../shared/database";
import { messages, conversations, chatNotifications, priceOffers } from "../../../drizzle/schema";
import { eq, and } from "drizzle-orm";

interface WebSocketMessage {
  type: "message" | "offer" | "typing" | "read" | "offer_response";
  conversationId: number;
  userId: number;
  userType: "customer" | "vendor";
  content?: string;
  messageId?: number;
  offerId?: number;
  offerData?: any;
  response?: "accepted" | "rejected";
}

interface ConnectedUser {
  userId: number;
  userType: "customer" | "vendor";
  conversationIds: Set<number>;
  ws: WebSocket;
}

const connectedUsers = new Map<string, ConnectedUser>();

export function setupWebSocket(server: HTTPServer) {
  const wss = new WebSocketServer({ server, path: "/api/ws" });

  wss.on("connection", (ws: WebSocket) => {
    log.info("[WebSocket] New connection established");

    ws.on("message", async (data: string) => {
      try {
        const message: WebSocketMessage = JSON.parse(data);
        const clientId = `${message.userId}-${message.userType}`;

        // تسجيل المستخدم
        if (!connectedUsers.has(clientId)) {
          connectedUsers.set(clientId, {
            userId: message.userId,
            userType: message.userType,
            conversationIds: new Set(),
            ws,
          });
        }

        const user = connectedUsers.get(clientId)!;
        user.conversationIds.add(message.conversationId);

        // معالجة أنواع الرسائل المختلفة
        switch (message.type) {
          case "message":
            await handleNewMessage(message, wss);
            break;
          case "offer":
            await handlePriceOffer(message, wss);
            break;
          case "typing":
            broadcastToConversation(wss, message.conversationId, {
              type: "user_typing",
              userId: message.userId,
              userType: message.userType,
              conversationId: message.conversationId,
            });
            break;
          case "read":
            await handleMessageRead(message);
            break;
          case "offer_response":
            await handleOfferResponse(message, wss);
            break;
        }
      } catch (error) {
        log.error("[WebSocket] Error processing message:", error);
        ws.send(JSON.stringify({ type: "error", message: "خطأ في معالجة الرسالة" }));
      }
    });

    ws.on("close", () => {
      // إزالة المستخدم عند قطع الاتصال
      const entries = Array.from(connectedUsers.entries());
      for (const [clientId, user] of entries) {
        if (user.ws === ws) {
          connectedUsers.delete(clientId);
          log.info(`[WebSocket] User ${clientId} disconnected`);
          break;
        }
      }
    });

    ws.on("error", (error: any) => {
      log.error("[WebSocket] Error:", error);
    });
  });

  return wss;
}

async function handleNewMessage(message: WebSocketMessage, wss: WebSocketServer) {
  if (!message.content) return;

  try {
    const db = await getDb();
    if (!db) {
      log.error("[WebSocket] Database not available");
      return;
    }

    // حفظ الرسالة في قاعدة البيانات
    const [savedMessage] = await db
      .insert(messages)
      .values({
        conversationId: message.conversationId,
        senderId: message.userId,
        senderType: message.userType,
        content: message.content,
        messageType: "text",
      })
      .execute();

    // الحصول على معرّف الرسالة المحفوظة
    const messageId = (savedMessage as any).insertId;

    // بث الرسالة إلى جميع المشاركين في المحادثة
    broadcastToConversation(wss, message.conversationId, {
      type: "new_message",
      messageId,
      conversationId: message.conversationId,
      senderId: message.userId,
      senderType: message.userType,
      content: message.content,
      createdAt: new Date().toISOString(),
    });

    // إنشاء إشعار للمستقبل
    const conversation = await db!
      .select()
      .from(conversations)
      .where(eq(conversations.id, message.conversationId))
      .limit(1);

    if (conversation.length > 0) {
      const conv = conversation[0];
      const recipientId = message.userType === "customer" ? conv.vendorId : conv.customerId;

      await db
        .insert(chatNotifications)
        .values({
          userId: recipientId,
          conversationId: message.conversationId,
          messageId,
          type: "new_message",
          title: `رسالة جديدة في المحادثة: ${conv.subject}`,
          body: message.content.substring(0, 100),
        })
        .execute();

      // إرسال الإشعار عبر WebSocket إن كان المستخدم متصلاً
      const recipientClientId = `${recipientId}-${message.userType === "customer" ? "vendor" : "customer"}`;
      const recipientUser = connectedUsers.get(recipientClientId);
      if (recipientUser) {
        recipientUser.ws.send(
          JSON.stringify({
            type: "notification",
            title: `رسالة جديدة في المحادثة: ${conv.subject}`,
            body: message.content.substring(0, 100),
            conversationId: message.conversationId,
          })
        );
      }
    }
  } catch (error) {
    log.error("[WebSocket] Error saving message:", error);
  }
}

async function handlePriceOffer(message: WebSocketMessage, wss: WebSocketServer) {
  if (!message.offerData) return;

  try {
    const db = await getDb();
    if (!db) {
      log.error("[WebSocket] Database not available");
      return;
    }

    const conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, message.conversationId))
      .limit(1);

    if (conversation.length === 0) return;

    const conv = conversation[0];
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // صلاحية 24 ساعة

    // حفظ عرض السعر
    const [savedOffer] = await db
      .insert(priceOffers)
      .values({
        conversationId: message.conversationId,
        vendorId: message.userType === "vendor" ? message.userId : conv.vendorId,
        customerId: message.userType === "customer" ? message.userId : conv.customerId,
        bookingId: conv.bookingId || undefined,
        description: message.offerData.description,
        originalPrice: message.offerData.originalPrice,
        offeredPrice: message.offerData.offeredPrice,
        discountPercentage: message.offerData.discountPercentage || 0,
        laborHours: message.offerData.laborHours,
        parts: JSON.stringify(message.offerData.parts || []),
        status: "pending",
        expiresAt,
      })
      .execute();

    const offerId = (savedOffer as any).insertId;

    // حفظ رسالة العرض
    await db
      .insert(messages)
      .values({
        conversationId: message.conversationId,
        senderId: message.userId,
        senderType: message.userType,
        content: `عرض سعر: ${message.offerData.description} - ${message.offerData.offeredPrice} ريال`,
        messageType: "offer",
        offerId,
      })
      .execute();

    // بث عرض السعر إلى المحادثة
    broadcastToConversation(wss, message.conversationId, {
      type: "price_offer",
      offerId,
      conversationId: message.conversationId,
      senderId: message.userId,
      senderType: message.userType,
      offer: message.offerData,
      expiresAt: expiresAt.toISOString(),
    });

    // إنشاء إشعار
    const recipientId = message.userType === "vendor" ? conv.customerId : conv.vendorId;
    await db
      .insert(chatNotifications)
      .values({
        userId: recipientId,
        conversationId: message.conversationId,
        messageId: 0, // سيتم تحديثه لاحقاً
        type: "offer_received",
        title: "عرض سعر جديد",
        body: `${message.offerData.description} - ${message.offerData.offeredPrice} ريال`,
      })
      .execute();
  } catch (error) {
    log.error("[WebSocket] Error saving offer:", error);
  }
}

async function handleMessageRead(message: WebSocketMessage) {
  if (!message.messageId) return;

  try {
    const db = await getDb();
    if (!db) return;

    await db
      .update(messages)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(messages.id, message.messageId))
      .execute();
  } catch (error) {
    log.error("[WebSocket] Error marking message as read:", error);
  }
}

async function handleOfferResponse(message: WebSocketMessage, wss: WebSocketServer) {
  if (!message.offerId || !message.response) return;

  try {
    const db = await getDb();
    if (!db) {
      log.error("[WebSocket] Database not available");
      return;
    }

    const status = message.response === "accepted" ? "accepted" : "rejected";
    const timestamp = new Date();

    await db
      .update(priceOffers)
      .set({
        status,
        [message.response === "accepted" ? "acceptedAt" : "rejectedAt"]: timestamp,
      })
      .where(eq(priceOffers.id, message.offerId))
      .execute();

    // بث رد العرض
    broadcastToConversation(wss, message.conversationId, {
      type: "offer_response",
      offerId: message.offerId,
      conversationId: message.conversationId,
      response: message.response,
      respondedBy: message.userId,
      respondedAt: timestamp.toISOString(),
    });

    // إنشاء إشعار
    const conversation = await db!
      .select()
      .from(conversations)
      .where(eq(conversations.id, message.conversationId))
      .limit(1);

    if (conversation.length > 0) {
      const conv = conversation[0];
      const recipientId = message.userType === "vendor" ? conv.customerId : conv.vendorId;
      const notificationType = message.response === "accepted" ? "offer_accepted" : "offer_rejected";

      await db
        .insert(chatNotifications)
        .values({
          userId: recipientId,
          conversationId: message.conversationId,
          messageId: 0,
          type: notificationType,
          title: message.response === "accepted" ? "تم قبول العرض ✓" : "تم رفض العرض ✗",
          body: `تم ${message.response === "accepted" ? "قبول" : "رفض"} عرض السعر`,
        })
        .execute();
    }
  } catch (error) {
    log.error("[WebSocket] Error processing offer response:", error);
  }
}

function broadcastToConversation(wss: WebSocketServer, conversationId: number, data: any) {
  wss.clients.forEach((client: any) => {
    if (client.readyState === WebSocket.OPEN) {
      // تحقق ما إذا كان العميل مشترك في هذه المحادثة
      const users = Array.from(connectedUsers.values());
      for (const user of users) {
        if (user.ws === client && user.conversationIds.has(conversationId)) {
          client.send(JSON.stringify(data));
          break;
        }
      }
    }
  });
}

export function getConnectedUsers() {
  return Array.from(connectedUsers.values()).map((user) => ({
    userId: user.userId,
    userType: user.userType,
    conversationIds: Array.from(user.conversationIds),
  }));
}
