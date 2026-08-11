import { useState } from "react";
import { Bell, X } from "lucide-react";
import { useQuoteNotifications } from "@/hooks/useQuoteNotifications";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface QuoteNotificationBellProps {
  customerId?: number;
}

/**
 * مكون جرس الإشعارات لعروض الأسعار
 */
export function QuoteNotificationBell({ customerId }: QuoteNotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, deleteNotification } =
    useQuoteNotifications(customerId);

  if (!customerId) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-yellow-100 transition-colors"
        >
          <Bell className="h-5 w-5 text-yellow-600" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-bold text-lg mb-4 text-right">عروض الأسعار</h3>

          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>لا توجد إشعارات حالياً</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.quoteId}
                  className={`p-3 rounded-lg border transition-all ${
                    notification.read
                      ? "bg-gray-50 border-gray-200"
                      : "bg-yellow-50 border-yellow-300"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 text-right">
                      <p className="font-semibold text-sm">
                        {notification.technicianName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(notification.timestamp).toLocaleString("ar-SA")}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteNotification(notification.quoteId)}
                      className="text-gray-400 hover:text-gray-600 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="bg-white p-2 rounded mb-2 text-right">
                    <p className="text-sm font-bold text-yellow-600">
                      {notification.quoteAmount} ر.س
                    </p>
                    <p className="text-xs text-gray-600">
                      صلاحية: {new Date(notification.validUntil).toLocaleDateString("ar-SA")}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`/chat/${notification.conversationId}`}
                      className="flex-1 text-center bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-1 rounded transition-colors"
                      onClick={() => markAsRead(notification.quoteId)}
                    >
                      عرض العرض
                    </a>
                    <a
                      href={`tel:${notification.technicianPhone}`}
                      className="flex-1 text-center bg-green-500 hover:bg-green-600 text-white text-xs py-1 rounded transition-colors"
                    >
                      اتصال
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default QuoteNotificationBell;
