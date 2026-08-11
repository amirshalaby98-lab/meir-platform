import { createLogger } from "../../_core/logger";
const log = createLogger("email");

/**
 * Email sending. Currently mock-only (no SMTP credentials configured) -
 * logs instead of actually delivering. To wire up real delivery later,
 * add SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS env vars and an
 * `EMAIL_PROVIDER = process.env.SMTP_HOST ? "smtp" : "mock"` branch here,
 * mirroring how modules/sms/repository.ts auto-detects Unifonic.
 */
async function sendViaMock(to: string, subject: string, body: string): Promise<boolean> {
  log.info("📧 [MOCK] Email:");
  log.info(`To: ${to}`);
  log.info(`Subject: ${subject}`);
  log.info(`Body: ${body}`);
  log.info("---");
  return true;
}

export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  return sendViaMock(to, subject, body);
}

export async function sendPasswordResetEmail(to: string, code: string): Promise<boolean> {
  return sendEmail(
    to,
    "رمز إعادة تعيين كلمة المرور - مير",
    `رمز إعادة تعيين كلمة المرور الخاص بك هو: ${code}\n\nهذا الرمز صالح لمدة 10 دقائق. إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذه الرسالة.`
  );
}
