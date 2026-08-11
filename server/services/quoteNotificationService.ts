import { createLogger } from "../_core/logger";
const log = createLogger("quote-notification");
import { eq, and } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";

// سيتم تمرير db كمعامل في الدوال
let dbInstance: MySql2Database<Record<string, unknown>> | null = null;

export function setDbInstance(db: MySql2Database<Record<string, unknown>>) {
  dbInstance = db;
}

export interface QuoteNotificationPayload {
  quoteId: string;
  customerId: number;
  technicianName: string;
  technicianPhone: string;
  quoteAmount: number;
  validUntil: string;
  conversationId: number;
  bookingId?: number;
}

/**
 * خدمة الإشعارات للعملاء عند استقبال عرض سعر جديد
 */
export class QuoteNotificationService {
  /**
   * إرسال إشعار في الوقت الفعلي عبر WebSocket
   */
  static async sendRealtimeNotification(payload: QuoteNotificationPayload) {
    try {
      // في الإنتاج، سيتم إرسال الإشعار عبر WebSocket
      log.info("📢 Real-time notification sent:", {
        customerId: payload.customerId,
        message: `تلقيت عرض سعر جديد من ${payload.technicianName}`,
        amount: payload.quoteAmount,
      });

      // يمكن إضافة إشعار في قاعدة البيانات
      return true;
    } catch (error) {
      log.error("Error sending realtime notification:", error);
      return false;
    }
  }

  /**
   * إرسال إشعار بريد إلكتروني للعميل
   */
  static async sendEmailNotification(payload: QuoteNotificationPayload) {
    try {
      if (!dbInstance) {
        log.warn("Database instance not initialized");
        return false;
      }

      // جلب بيانات العميل
      // const customer = await dbInstance.query.users.findFirst({
      //   where: eq(users.id, payload.customerId),
      // });

      // محاكاة جلب بيانات العميل
      const customer = {
        email: `customer${payload.customerId}@example.com`,
        name: "العميل",
      };

      if (!customer || !customer.email) {
        log.warn(`No email found for customer ${payload.customerId}`);
        return false;
      }

      // في الإنتاج، سيتم استخدام خدمة بريد حقيقية مثل SendGrid أو AWS SES
      const emailContent = this.generateEmailContent(payload, customer.name || "العميل");

      log.info("📧 Email notification prepared:", {
        to: customer.email,
        subject: emailContent.subject,
        preview: emailContent.preview,
      });

      // محاكاة إرسال البريد
      // await sendEmail({
      //   to: customer.email,
      //   subject: emailContent.subject,
      //   html: emailContent.html,
      // });

      return true;
    } catch (error) {
      log.error("Error sending email notification:", error);
      return false;
    }
  }

  /**
   * إرسال رسالة نصية SMS للعميل
   */
  static async sendSMSNotification(payload: QuoteNotificationPayload) {
    try {
      if (!dbInstance) {
        log.warn("Database instance not initialized");
        return false;
      }

      // جلب بيانات العميل
      // const customer = await dbInstance.query.users.findFirst({
      //   where: eq(users.id, payload.customerId),
      // });

      // محاكاة جلب بيانات العميل
      const customer = {
        phone: "0543257872",
        name: "العميل",
      };

      if (!customer || !customer.phone) {
        log.warn(`No phone found for customer ${payload.customerId}`);
        return false;
      }

      const smsMessage = `مرحباً ${customer.name}، تلقيت عرض سعر جديد من ${payload.technicianName} بقيمة ${payload.quoteAmount} ر.س. صلاحية العرض حتى ${payload.validUntil}. للمزيد، تفضل بزيارة تطبيقنا.`;

      log.info("📱 SMS notification prepared:", {
        to: customer.phone,
        message: smsMessage,
      });

      // في الإنتاج، سيتم استخدام خدمة SMS حقيقية مثل Twilio أو Unifonic
      // await sendSMS({
      //   to: customer.phone,
      //   message: smsMessage,
      // });

      return true;
    } catch (error) {
      log.error("Error sending SMS notification:", error);
      return false;
    }
  }

  /**
   * إرسال رسالة في المحادثة
   */
  static async sendChatNotification(payload: QuoteNotificationPayload) {
    try {
      const notificationMessage = `📊 عرض سعر جديد من ${payload.technicianName}\n\nالمبلغ: ${payload.quoteAmount} ر.س\nصلاحية العرض: ${payload.validUntil}\n\nيرجى مراجعة التفاصيل الكاملة للعرض.`;

      // إضافة رسالة في المحادثة
      // if (dbInstance) {
      //   await dbInstance.insert(messages).values({
      //     conversationId: payload.conversationId,
      //     senderId: 0, // System message
      //     content: notificationMessage,
      //     type: "notification",
      //     createdAt: new Date(),
      //   });
      // }

      log.info("💬 Chat notification prepared:", {
        conversationId: payload.conversationId,
        message: notificationMessage,
      });

      return true;
    } catch (error) {
      log.error("Error sending chat notification:", error);
      return false;
    }
  }

  /**
   * إرسال جميع الإشعارات
   */
  static async sendAllNotifications(payload: QuoteNotificationPayload) {
    log.info("🔔 Sending all notifications for quote", { quoteId: payload.quoteId });

    const results = await Promise.all([
      this.sendRealtimeNotification(payload),
      this.sendEmailNotification(payload),
      this.sendSMSNotification(payload),
      this.sendChatNotification(payload),
    ]);

    const successCount = results.filter(Boolean).length;
    log.info(`✅ Notifications sent: ${successCount}/${results.length}`);

    return {
      realtime: results[0],
      email: results[1],
      sms: results[2],
      chat: results[3],
    };
  }

  /**
   * توليد محتوى البريد الإلكتروني
   */
  private static generateEmailContent(
    payload: QuoteNotificationPayload,
    customerName: string
  ) {
    const validDate = new Date(payload.validUntil).toLocaleDateString("ar-SA");

    return {
      subject: `عرض سعر جديد من ${payload.technicianName} - مير`,
      preview: `تلقيت عرض سعر جديد بقيمة ${payload.quoteAmount} ر.س`,
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background-color: #f5f5f5; padding: 20px;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #FFD700; padding-bottom: 20px;">
              <h1 style="color: #333; margin: 0; font-size: 24px;">عرض سعر جديد</h1>
              <p style="color: #666; margin: 10px 0 0 0;">منصة مير للخدمات</p>
            </div>

            <!-- Content -->
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              مرحباً <strong>${customerName}</strong>،
            </p>

            <p style="color: #555; font-size: 14px; line-height: 1.8; margin-bottom: 20px;">
              تلقيت عرض سعر جديد من الفني <strong>${payload.technicianName}</strong>
            </p>

            <!-- Quote Details -->
            <div style="background-color: #f9f9f9; border-right: 4px solid #FFD700; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <span style="color: #666;">المبلغ الإجمالي:</span>
                <span style="color: #333; font-weight: bold; font-size: 18px;">${payload.quoteAmount} ر.س</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <span style="color: #666;">صلاحية العرض:</span>
                <span style="color: #333;">${validDate}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #666;">رقم الفني:</span>
                <span style="color: #333;"><a href="tel:${payload.technicianPhone}" style="color: #FFD700; text-decoration: none;">${payload.technicianPhone}</a></span>
              </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://meir.manus.space/chat/${payload.conversationId}" 
                 style="background-color: #FFD700; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                عرض التفاصيل الكاملة
              </a>
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #999; font-size: 12px; text-align: center;">
              <p>هذا البريد تم إرساله من منصة مير للخدمات</p>
              <p>إذا كنت لا تريد تلقي هذه الرسائل، يمكنك تعديل إعدادات الإشعارات في حسابك</p>
            </div>
          </div>
        </div>
      `,
    };
  }
}

export default QuoteNotificationService;
