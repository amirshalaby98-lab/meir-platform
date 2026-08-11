import { useState, useCallback, useEffect } from "react";
import type { Notification } from "../components/NotificationCenter";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Add a new notification
  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotification: Notification = {
        ...notification,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // Auto-remove notification after 10 seconds if not interacted
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== newNotification.id)
        );
      }, 10000);

      return newNotification;
    },
    []
  );

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Remove a specific notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  // Listen to WebSocket events
  useEffect(() => {
    if (isListening) {
      // This would connect to WebSocket in a real implementation
      // For now, we'll set up the listener structure
      const handleBookingNotification = (event: CustomEvent) => {
        const { booking } = event.detail;
        addNotification({
          type: "booking",
          title: "حجز جديد!",
          message: `لديك حجز جديد من ${booking.customerName}`,
          data: { bookingId: booking.id },
        });

        // Play notification sound
        playNotificationSound();

        // Show browser notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("حجز جديد!", {
            body: `لديك حجز جديد من ${booking.customerName}`,
            icon: "/logo.png",
            tag: "booking-notification",
            requireInteraction: true,
          });
        }
      };

      const handleMessageNotification = (event: CustomEvent) => {
        const { message } = event.detail;
        addNotification({
          type: "message",
          title: "رسالة جديدة!",
          message: `رسالة جديدة من ${message.senderName}`,
          data: { conversationId: message.conversationId },
        });

        // Play notification sound
        playNotificationSound();

        // Show browser notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("رسالة جديدة!", {
            body: `رسالة جديدة من ${message.senderName}`,
            icon: "/logo.png",
            tag: "message-notification",
            requireInteraction: false,
          });
        }
      };

      window.addEventListener(
        "booking-notification",
        handleBookingNotification as EventListener
      );
      window.addEventListener(
        "message-notification",
        handleMessageNotification as EventListener
      );

      return () => {
        window.removeEventListener(
          "booking-notification",
          handleBookingNotification as EventListener
        );
        window.removeEventListener(
          "message-notification",
          handleMessageNotification as EventListener
        );
      };
    }
  }, [isListening, addNotification]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setIsListening(true);
      } else if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setIsListening(true);
        }
      }
    }
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    const audio = new Audio(
      "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=="
    );
    audio.play().catch(() => {
      // Silently fail if audio can't play
    });
  }, []);

  return {
    notifications,
    addNotification,
    markAsRead,
    clearAll,
    removeNotification,
    isListening,
    requestNotificationPermission,
    playNotificationSound,
  };
}

export default useNotifications;
