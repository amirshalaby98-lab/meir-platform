import { useEffect, useCallback, useRef } from "react";
import { useToast } from "./use-toast";

export interface QuoteNotification {
  id: string;
  quoteId: string;
  customerId: number;
  technicianName: string;
  technicianPhone: string;
  quoteAmount: number;
  validUntil: string;
  conversationId: number;
  timestamp: Date;
  read: boolean;
}

/**
 * Hook للاستماع إلى إشعارات عروض الأسعار الجديدة
 */
export function useQuoteNotifications(customerId?: number) {
  const { toast } = useToast();
  const notificationsRef = useRef<QuoteNotification[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  /**
   * تشغيل إشعار صوتي
   */
  const playNotificationSound = useCallback(() => {
    try {
      // إنشاء صوت بسيط باستخدام Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // تردد 800 Hz
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  }, []);

  /**
   * إرسال إشعار المتصفح
   */
  const sendBrowserNotification = useCallback((notification: QuoteNotification) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("عرض سعر جديد من مير", {
        body: `تلقيت عرض سعر جديد من ${notification.technicianName} بقيمة ${notification.quoteAmount} ر.س`,
        icon: "/mier-icon.png",
        badge: "/mier-badge.png",
        tag: `quote-${notification.quoteId}`,
        requireInteraction: true,
      });
    }
  }, []);

  /**
   * إرسال إشعار Toast
   */
  const sendToastNotification = useCallback((notification: QuoteNotification) => {
    toast({
      title: "عرض سعر جديد! 🎉",
      description: `من ${notification.technicianName}: ${notification.quoteAmount} ر.س`,
    });
  }, [toast]);

  /**
   * معالجة إشعار جديد
   */
  const handleNewQuoteNotification = useCallback(
    (notification: QuoteNotification) => {
      // إضافة الإشعار إلى القائمة
      notificationsRef.current.push(notification);

      // تشغيل الإشعارات المختلفة
      playNotificationSound();
      sendBrowserNotification(notification);
      sendToastNotification(notification);

      // اهتزاز الجهاز إن أمكن
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    },
    [playNotificationSound, sendBrowserNotification, sendToastNotification]
  );

  /**
   * الاتصال بـ WebSocket للاستماع إلى الإشعارات الفعلية
   */
  useEffect(() => {
    if (!customerId) return;

    // طلب إذن الإشعارات من المتصفح
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // الاتصال بـ WebSocket
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/quotes/${customerId}`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("✅ Connected to quote notifications WebSocket");
      };

      wsRef.current.onmessage = (event) => {
        try {
          const notification: QuoteNotification = JSON.parse(event.data);
          handleNewQuoteNotification(notification);
        } catch (error) {
          console.error("Error parsing notification:", error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
      };

      wsRef.current.onclose = () => {
        console.log("🔌 Disconnected from quote notifications WebSocket");
      };
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [customerId, handleNewQuoteNotification]);

  /**
   * الحصول على الإشعارات غير المقروءة
   */
  const getUnreadNotifications = useCallback(() => {
    return notificationsRef.current.filter((n) => !n.read);
  }, []);

  /**
   * تحديد إشعار كمقروء
   */
  const markAsRead = useCallback((quoteId: string) => {
    const notification = notificationsRef.current.find((n) => n.quoteId === quoteId);
    if (notification) {
      notification.read = true;
    }
  }, []);

  /**
   * حذف إشعار
   */
  const deleteNotification = useCallback((quoteId: string) => {
    notificationsRef.current = notificationsRef.current.filter((n) => n.quoteId !== quoteId);
  }, []);

  return {
    notifications: notificationsRef.current,
    unreadCount: getUnreadNotifications().length,
    getUnreadNotifications,
    markAsRead,
    deleteNotification,
  };
}

export default useQuoteNotifications;
