import React, { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { useAuth } from "../_core/hooks/useAuth";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Loader2, MessageSquare, Plus } from "lucide-react";

interface Conversation {
  id: number;
  customerId: number;
  vendorId: number;
  subject: string;
  status: string;
  bookingId?: number;
  createdAt: Date;
  lastMessageAt: Date;
}

export function ChatList() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [subject, setSubject] = useState("");

  const userType = user?.role === "admin" ? "vendor" : "customer";

  // Get conversations
  const { data: conversations, isLoading } = trpc.chat.getConversations.useQuery(
    { userType },
    { enabled: !!user }
  );

  // Get unread count
  const { data: unreadData } = trpc.chat.getUnreadCount.useQuery(
    { userType },
    { enabled: !!user }
  );

  // Create conversation mutation
  const createConversationMutation = trpc.chat.createConversation.useMutation({
    onSuccess: (data) => {
      setLocation(`/chat/${data.id}`);
      setShowNewChat(false);
      setRecipientId("");
      setSubject("");
    },
  });

  const handleCreateChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientId || !subject.trim() || !user) return;

    createConversationMutation.mutate({
      recipientId: parseInt(recipientId),
      userType,
      subject,
    });
  };

  const filteredConversations = (conversations || []).filter((conv) =>
    conv.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-8 h-8 text-yellow-500" />
                المحادثات
              </h1>
              {unreadData && unreadData.unreadCount > 0 && (
                <p className="text-sm text-yellow-600 mt-1">
                  لديك {unreadData.unreadCount} رسالة غير مقروءة
                </p>
              )}
            </div>
            <Button
              onClick={() => setShowNewChat(!showNewChat)}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              محادثة جديدة
            </Button>
          </div>

          {/* Search */}
          <Input
            placeholder="ابحث عن محادثة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* New Chat Form */}
        {showNewChat && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ابدأ محادثة جديدة
            </h2>
            <form onSubmit={handleCreateChat} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  معرّف المستقبل
                </label>
                <Input
                  type="number"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  placeholder="أدخل معرّف البائع أو العميل"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الموضوع
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="موضوع المحادثة"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createConversationMutation.isPending}
                  className="bg-yellow-500 hover:bg-yellow-600"
                >
                  {createConversationMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "إنشاء"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewChat(false)}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Conversations List */}
        <div className="space-y-3">
          {filteredConversations.length === 0 ? (
            <Card className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد محادثات حالياً</p>
              <Button
                onClick={() => setShowNewChat(true)}
                className="mt-4 bg-yellow-500 hover:bg-yellow-600"
              >
                ابدأ محادثة جديدة
              </Button>
            </Card>
          ) : (
            filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setLocation(`/chat/${conversation.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {conversation.subject}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {conversation.status === "active" ? (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          نشط
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          مغلق
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(conversation.lastMessageAt).toLocaleDateString(
                        "ar-SA"
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(conversation.lastMessageAt).toLocaleTimeString(
                        "ar-SA",
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
