import { useState, useEffect } from "react";

interface Notification {
  id: string;
  type: "booking_confirmed" | "technician_assigned" | "technician_arriving" | "service_complete";
  title: string;
  message: string;
  time: Date;
  read: boolean;
}

export function useBookingNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem("booking_notifications");
    if (stored) {
      const parsed = JSON.parse(stored).map((n: any) => ({ ...n, time: new Date(n.time) }));
      setNotifications(parsed);
      setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
    }
  }, []);

  const addNotification = (type: Notification["type"], title: string, message: string) => {
    const newNotif: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      time: new Date(),
      read: false,
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    setUnreadCount(prev => prev + 1);
    localStorage.setItem("booking_notifications", JSON.stringify(updated));

    // Browser notification if permission granted
    if (Notification.permission === "granted") {
      new Notification(title, { body: message, icon: "/icons/icon-192x192.png" });
    }
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    localStorage.setItem("booking_notifications", JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setUnreadCount(0);
    localStorage.setItem("booking_notifications", JSON.stringify(updated));
  };

  return { notifications, unreadCount, addNotification, markAsRead, markAllAsRead };
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationPanel({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead }: NotificationPanelProps) {
  if (!isOpen) return null;

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "booking_confirmed": return "✅";
      case "technician_assigned": return "👨‍🔧";
      case "technician_arriving": return "🚗";
      case "service_complete": return "🎉";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "الآن";
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl max-h-[70vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-gray-900">الإشعارات</h3>
          <div className="flex items-center gap-3">
            {notifications.some(n => !n.read) && (
              <button onClick={onMarkAllAsRead} className="text-xs text-blue-600 hover:text-blue-700">
                قراءة الكل
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[55vh]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <div className="text-3xl mb-2">🔔</div>
              <p className="text-sm">لا توجد إشعارات</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => onMarkAsRead(notif.id)}
                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition ${!notif.read ? "bg-blue-50/50" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{getIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-gray-900">{notif.title}</p>
                      {!notif.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{formatTime(notif.time)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
