/**
 * Notification Service
 * Handles browser notifications, sounds, and real-time alerts
 */

export class NotificationService {
  private static audioContext: AudioContext | null = null;
  private static isSupported = {
    notification: "Notification" in window,
    audio: "AudioContext" in window || "webkitAudioContext" in window,
  };

  /**
   * Request permission for browser notifications
   */
  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported.notification) {
      console.warn("Browser notifications not supported");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }

  /**
   * Show a browser notification
   */
  static showNotification(
    title: string,
    options?: NotificationOptions & { duration?: number }
  ): Notification | null {
    if (!this.isSupported.notification || Notification.permission !== "granted") {
      return null;
    }

    const notification = new Notification(title, {
      icon: "/logo.png",
      badge: "/logo.png",
      ...options,
    });

    // Auto-close notification after duration
    if (options?.duration) {
      setTimeout(() => notification.close(), options.duration);
    }

    return notification;
  }

  /**
   * Play a notification sound
   */
  static playNotificationSound(type: "booking" | "message" | "payment" = "message") {
    if (!this.isSupported.audio) {
      console.warn("Audio not supported");
      return;
    }

    try {
      const audioContext =
        this.audioContext ||
        new (window.AudioContext || (window as any).webkitAudioContext)();
      this.audioContext = audioContext;

      const now = audioContext.currentTime;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different sounds for different notification types
      switch (type) {
        case "booking":
          // Higher pitch for bookings
          oscillator.frequency.setValueAtTime(800, now);
          oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1);
          gainNode.gain.setValueAtTime(0.3, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          oscillator.start(now);
          oscillator.stop(now + 0.1);
          break;

        case "message":
          // Medium pitch for messages
          oscillator.frequency.setValueAtTime(600, now);
          oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.15);
          gainNode.gain.setValueAtTime(0.2, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          oscillator.start(now);
          oscillator.stop(now + 0.15);
          break;

        case "payment":
          // Success sound - two tones
          oscillator.frequency.setValueAtTime(800, now);
          oscillator.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
          gainNode.gain.setValueAtTime(0.25, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          oscillator.start(now);
          oscillator.stop(now + 0.1);

          // Second tone
          const oscillator2 = audioContext.createOscillator();
          oscillator2.connect(gainNode);
          oscillator2.frequency.setValueAtTime(1200, now + 0.15);
          oscillator2.frequency.exponentialRampToValueAtTime(1000, now + 0.25);
          gainNode.gain.setValueAtTime(0.25, now + 0.15);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
          oscillator2.start(now + 0.15);
          oscillator2.stop(now + 0.25);
          break;
      }
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  }

  /**
   * Send a vibration notification (if supported)
   */
  static vibrate(pattern: number | number[] = 200) {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }

  /**
   * Create a desktop notification with sound and vibration
   */
  static notifyBooking(customerName: string, serviceType: string) {
    // Show notification
    this.showNotification("حجز جديد!", {
      body: `لديك حجز جديد من ${customerName} - ${serviceType}`,
      tag: "booking-notification",
      requireInteraction: true,
      duration: 10000,
    });

    // Play sound
    this.playNotificationSound("booking");

    // Vibrate
    this.vibrate([100, 50, 100, 50, 200]);
  }

  /**
   * Create a message notification
   */
  static notifyMessage(senderName: string, message: string) {
    // Show notification
    this.showNotification("رسالة جديدة!", {
      body: `من ${senderName}: ${message.substring(0, 50)}...`,
      tag: "message-notification",
      requireInteraction: false,
      duration: 8000,
    });

    // Play sound
    this.playNotificationSound("message");

    // Vibrate
    this.vibrate([50, 50, 50]);
  }

  /**
   * Create a payment notification
   */
  static notifyPayment(amount: number) {
    // Show notification
    this.showNotification("تم استلام الدفع!", {
      body: `تم استلام دفعة بقيمة ${amount} ر.س`,
      tag: "payment-notification",
      requireInteraction: false,
      duration: 6000,
    });

    // Play sound
    this.playNotificationSound("payment");

    // Vibrate
    this.vibrate([100, 100, 100]);
  }

  /**
   * Get notification permission status
   */
  static getPermissionStatus(): NotificationPermission {
    return Notification.permission || "default";
  }

  /**
   * Check if notifications are supported
   */
  static isNotificationSupported(): boolean {
    return this.isSupported.notification;
  }

  /**
   * Check if audio is supported
   */
  static isAudioSupported(): boolean {
    return this.isSupported.audio;
  }
}

export default NotificationService;
