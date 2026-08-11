import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { useAuth } from "../_core/hooks/useAuth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Loader2, Send, Clock, Check, CheckCheck } from "lucide-react";

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderType: "customer" | "vendor";
  content: string;
  messageType: "text" | "offer";
  offerId?: number;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

interface PriceOffer {
  id: number;
  description: string;
  originalPrice: string | number;
  offeredPrice: string | number;
  discountPercentage: string | number | null;
  laborHours?: string | number | null;
  status: string;
  expiresAt: Date | string;
  createdAt: Date | string;
}

export function Chat() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [offers, setOffers] = useState<PriceOffer[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const convId = conversationId ? parseInt(conversationId) : 0;

  // Fetch conversation data
  const { data: conversationData, isLoading } = trpc.chat.getConversation.useQuery(
    { conversationId: convId },
    { enabled: !!convId && !!user }
  );

  // Fetch price offers
  const { data: offersData } = trpc.chat.getPriceOffers.useQuery(
    { conversationId: convId },
    { enabled: !!convId && !!user }
  );

  // Mark messages as read
  const markAsReadMutation = trpc.chat.markMessagesAsRead.useMutation();

  // Send message mutation
  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      setNewMessage("");
      setMessages((prev) => [...prev, data as Message]);
      scrollToBottom();
    },
  });

  // Respond to offer mutation
  const respondToOfferMutation = trpc.chat.respondToOffer.useMutation({
    onSuccess: () => {
      // Refresh offers
      window.location.reload();
    },
  });

  // Initialize WebSocket
  useEffect(() => {
    if (!user || !convId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      setIsConnected(true);
      console.log("[Chat] WebSocket connected");

      // Join conversation
      websocket.send(
        JSON.stringify({
          type: "join",
          conversationId: convId,
          userId: user.id,
          userType: user.role === "admin" ? "vendor" : "customer",
        })
      );
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "new_message") {
          setMessages((prev) => [
            ...prev,
            {
              id: data.messageId,
              conversationId: data.conversationId,
              senderId: data.senderId,
              senderType: data.senderType,
              content: data.content,
              messageType: data.messageType || "text",
              isRead: false,
              createdAt: new Date(data.createdAt),
            },
          ]);
          scrollToBottom();
        } else if (data.type === "new_offer") {
          setOffers((prev) => [...prev, data.offer]);
        } else if (data.type === "offer_response") {
          setOffers((prev) =>
            prev.map((o) =>
              o.id === data.offerId ? { ...o, status: data.response } : o
            )
          );
        }
      } catch (error) {
        console.error("[Chat] Error parsing message:", error);
      }
    };

    websocket.onerror = (error) => {
      console.error("[Chat] WebSocket error:", error);
      setIsConnected(false);
    };

    websocket.onclose = () => {
      setIsConnected(false);
      console.log("[Chat] WebSocket disconnected");
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [user, convId]);

  // Update local messages when fetched
  useEffect(() => {
    if (conversationData?.messages) {
      setMessages(conversationData.messages as Message[]);
      scrollToBottom();

      // Mark as read
      if (user) {
        markAsReadMutation.mutate({ conversationId: convId });
      }
    }
  }, [conversationData]);

  // Update offers
  useEffect(() => {
    if (offersData) {
      setOffers(offersData as PriceOffer[]);
    }
  }, [offersData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    sendMessageMutation.mutate({
      conversationId: convId,
      content: newMessage,
      userType: user.role === "admin" ? "vendor" : "customer",
    });
  };

  const handleAcceptOffer = (offerId: number) => {
    respondToOfferMutation.mutate({
      offerId,
      response: "accepted",
    });
  };

  const handleRejectOffer = (offerId: number) => {
    respondToOfferMutation.mutate({
      offerId,
      response: "rejected",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!conversationData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">المحادثة غير موجودة</p>
              <Button onClick={() => setLocation("/chat")} className="mt-4">
                العودة إلى المحادثات
              </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {conversationData.conversation.subject}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isConnected ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    متصل
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    غير متصل
                  </span>
                )}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setLocation("/chat")}
            >
              العودة
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full px-4 py-6">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === user?.id
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                {message.messageType === "text" ? (
                  <>
                    <p className="break-words">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.createdAt).toLocaleTimeString("ar-SA")}
                    </p>
                  </>
                ) : (
                  <div className="text-sm">
                    <p className="font-semibold">عرض سعر</p>
                    <p>{message.content}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Price Offers */}
      {offers.length > 0 && (
        <div className="max-w-4xl mx-auto w-full px-4 py-4 border-t">
          <h3 className="font-semibold text-gray-900 mb-3">عروض الأسعار</h3>
          <div className="space-y-3">
            {offers.map((offer) => (
              <Card key={offer.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {offer.description}
                    </p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p className="text-gray-600">
                        السعر الأصلي:{" "}
                        <span className="line-through">
                          {offer.originalPrice} ريال
                        </span>
                      </p>
                      <p className="text-yellow-600 font-semibold">
                        السعر المعروض: {offer.offeredPrice} ريال
                      </p>
                      {Number(offer.discountPercentage || 0) > 0 && (
                        <p className="text-green-600">
                          خصم: {offer.discountPercentage}%
                        </p>
                      )}
                      {offer.laborHours && (
                        <p className="text-gray-600">
                          ساعات العمل: {offer.laborHours}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      ينتهي في:{" "}
                      {new Date(offer.expiresAt).toLocaleString("ar-SA")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {offer.status === "pending" ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAcceptOffer(offer.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          قبول
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectOffer(offer.id)}
                        >
                          رفض
                        </Button>
                      </>
                    ) : (
                      <span
                        className={`text-sm font-semibold ${
                          offer.status === "accepted"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {offer.status === "accepted" ? "مقبول" : "مرفوض"}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="اكتب رسالتك..."
              disabled={sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
