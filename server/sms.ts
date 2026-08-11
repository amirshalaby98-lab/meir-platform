import { createLogger } from "./_core/logger";
const log = createLogger("sms");
/**
 * SMS Notification System for Meir
 * 
 * This module provides SMS notification functionality for customer updates.
 * Supports multiple SMS providers: Mock (testing), Unifonic, Twilio, SMS Misr
 * 
 * To enable Unifonic (recommended for Saudi Arabia):
 * 1. Sign up at https://www.unifonic.com/ar/
 * 2. Get your App SID from Settings → API Keys
 * 3. Add UNIFONIC_APP_SID to Settings → Secrets in the management UI
 * 4. The system will automatically use Unifonic when App SID is present
 * 
 * See UNIFONIC_SETUP.md for detailed setup instructions.
 */

interface SMSMessage {
  to: string;
  message: string;
}

// SMS Provider Configuration
// Auto-detect: Uses Unifonic if App SID is present, otherwise uses mock
const SMS_PROVIDER = process.env.UNIFONIC_APP_SID ? "unifonic" : "mock";

// Unifonic Configuration
const UNIFONIC_APP_SID = process.env.UNIFONIC_APP_SID || "";
const UNIFONIC_SENDER_ID = "UNIFONIC"; // Change to "Meir" or "مير" after approval
const UNIFONIC_API_URL = "https://api.unifonic.com/rest/SMS/messages";

/**
 * Send SMS via Unifonic
 */
async function sendViaUnifonic({ to, message }: SMSMessage): Promise<boolean> {
  try {
    const response = await fetch(UNIFONIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        AppSid: UNIFONIC_APP_SID,
        SenderID: UNIFONIC_SENDER_ID,
        Recipient: to,
        Body: message,
      }),
    });

    const data = await response.json();

    if (data.success === "true" || data.success === true) {
      log.info(`✅ SMS sent via Unifonic to ${to}`);
      return true;
    } else {
      log.error(`❌ Unifonic error:`, data);
      return false;
    }
  } catch (error) {
    log.error("❌ Error sending SMS via Unifonic:", error);
    return false;
  }
}

/**
 * Send SMS via Mock (for testing)
 */
async function sendViaMock({ to, message }: SMSMessage): Promise<boolean> {
  log.info("📱 [MOCK] SMS Notification:");
  log.info(`To: ${to}`);
  log.info(`Message: ${message}`);
  log.info("---");
  return true;
}

/**
 * Send SMS notification to customer
 * @param to - Customer phone number (format: 966XXXXXXXXX)
 * @param message - SMS message content
 */
export async function sendSMS({ to, message }: SMSMessage): Promise<boolean> {
  try {
    // Validate phone number format
    if (!to.match(/^966[0-9]{9}$/)) {
      log.error(`Invalid phone number format: ${to}`);
      return false;
    }

    // Route to appropriate provider
    switch (SMS_PROVIDER) {
      case "unifonic":
        return await sendViaUnifonic({ to, message });
      case "mock":
      default:
        return await sendViaMock({ to, message });
    }
  } catch (error) {
    log.error("Error sending SMS:", error);
    return false;
  }
}

/**
 * Send booking confirmation SMS
 */
export async function sendBookingConfirmationSMS(
  phone: string,
  name: string,
  bookingId: number,
  service: string,
  date: string,
  time: string
): Promise<boolean> {
  const message = `مرحباً ${name}،

تم تأكيد حجزك في مير! 🚗

رقم الحجز: #${bookingId}
الخدمة: ${service}
التاريخ: ${date}
الوقت: ${time}

سيتواصل معك فنينا قريباً.

مير - خدمة صيانة متنقلة`;

  return await sendSMS({ to: phone, message });
}

/**
 * Send technician assignment SMS
 */
export async function sendTechnicianAssignmentSMS(
  phone: string,
  name: string,
  technicianName: string,
  technicianPhone: string,
  date: string,
  time: string
): Promise<boolean> {
  const message = `مرحباً ${name}،

تم تخصيص فني لحجزك! 👨‍🔧

الفني: ${technicianName}
هاتف الفني: ${technicianPhone}
الموعد: ${date} - ${time}

سيتواصل معك الفني قريباً.

مير - خدمة صيانة متنقلة`;

  return await sendSMS({ to: phone, message });
}

/**
 * Send booking completion SMS
 */
export async function sendBookingCompletionSMS(
  phone: string,
  name: string,
  bookingId: number
): Promise<boolean> {
  const message = `مرحباً ${name}،

تم إنجاز خدمتك بنجاح! ✅

رقم الحجز: #${bookingId}

نتمنى أن تكون راضياً عن الخدمة.
يمكنك تقييم تجربتك على:
https://meir.sa/add-review

شكراً لثقتك في مير 🚗`;

  return await sendSMS({ to: phone, message });
}

/**
 * Send booking cancellation SMS
 */
export async function sendBookingCancellationSMS(
  phone: string,
  name: string,
  bookingId: number
): Promise<boolean> {
  const message = `مرحباً ${name}،

تم إلغاء حجزك #${bookingId}.

إذا كان هناك خطأ، يرجى التواصل معنا:
📞 0543257872
💬 واتساب: wa.me/966543257872

مير - خدمة صيانة متنقلة`;

  return await sendSMS({ to: phone, message });
}

/**
 * Format phone number to international format
 * Converts 05XXXXXXXX to 9665XXXXXXXX
 */
export function formatPhoneNumber(phone: string): string {
  // Remove any spaces, dashes, or special characters
  phone = phone.replace(/[\s\-\(\)]/g, "");

  // If starts with 05, replace with 9665
  if (phone.startsWith("05")) {
    return "966" + phone.slice(1);
  }

  // If starts with 5, add 966
  if (phone.startsWith("5")) {
    return "966" + phone;
  }

  // If already starts with 966, return as is
  if (phone.startsWith("966")) {
    return phone;
  }

  // Default: assume it's a local number starting with 5
  return "966" + phone;
}
