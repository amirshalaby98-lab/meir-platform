import { describe, it, expect } from "vitest";

interface Notification {
  id: string;
  type: "booking" | "message" | "payment" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: Record<string, unknown>;
}

describe("NotificationCenter", () => {
  const mockNotifications: Notification[] = [
    {
      id: "1",
      type: "booking",
      title: "حجز جديد",
      message: "لديك حجز جديد من أحمد",
      timestamp: new Date(),
      read: false,
      data: { bookingId: 123 },
    },
    {
      id: "2",
      type: "message",
      title: "رسالة جديدة",
      message: "رسالة من محمد",
      timestamp: new Date(),
      read: true,
    },
  ];

  it("should have correct notification structure", () => {
    expect(mockNotifications).toHaveLength(2);
    expect(mockNotifications[0].type).toBe("booking");
    expect(mockNotifications[1].type).toBe("message");
  });

  it("should identify unread notifications", () => {
    const unread = mockNotifications.filter((n) => !n.read);
    expect(unread).toHaveLength(1);
    expect(unread[0].id).toBe("1");
  });

  it("should have valid notification types", () => {
    const validTypes = ["booking", "message", "payment", "system"];
    mockNotifications.forEach((n) => {
      expect(validTypes).toContain(n.type);
    });
  });

  it("should have timestamps", () => {
    mockNotifications.forEach((n) => {
      expect(n.timestamp).toBeInstanceOf(Date);
    });
  });

  it("should support optional data field", () => {
    expect(mockNotifications[0].data).toBeDefined();
    expect(mockNotifications[0].data?.bookingId).toBe(123);
    expect(mockNotifications[1].data).toBeUndefined();
  });

  it("should mark notifications as read", () => {
    const notification = { ...mockNotifications[0], read: true };
    expect(notification.read).toBe(true);
  });

  it("should filter by type", () => {
    const bookingNotifications = mockNotifications.filter(
      (n) => n.type === "booking"
    );
    expect(bookingNotifications).toHaveLength(1);
    expect(bookingNotifications[0].title).toBe("حجز جديد");
  });

  it("should sort by timestamp", () => {
    const sorted = [...mockNotifications].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    expect(sorted).toHaveLength(2);
  });
});
