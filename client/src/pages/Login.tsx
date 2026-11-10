import { useEffect } from "react";
import { useSearch } from "wouter";
import { toast } from "sonner";

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_state: "انتهت صلاحية محاولة الدخول، حاول مرة أخرى",
  google_not_configured: "تسجيل الدخول بجوجل غير مُفعّل حاليًا",
  google_token: "تعذر إكمال تسجيل الدخول بجوجل، حاول مرة أخرى",
  google_userinfo: "تعذر جلب بيانات الحساب من جوجل",
  google_no_sub: "تعذر التعرف على حساب جوجل",
  google_failed: "حدث خطأ أثناء تسجيل الدخول بجوجل",
};

export default function Login() {
  const search = useSearch();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const error = params.get("error");
    if (error) {
      toast.error(GOOGLE_ERROR_MESSAGES[error] || "حدث خطأ أثناء تسجيل الدخول");
    }
  }, [search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-black text-center mb-2">
          تسجيل الدخول
        </h1>
        <p className="text-center text-gray-500 mb-8">
          مرحباً بعودتك إلى مير
        </p>

        <a
          href="/api/auth/google"
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-lg transition-all shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.84z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.02c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11C3.24 21.3 7.3 24 12 24z" />
            <path fill="#FBBC05" d="M5.27 14.27A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.27V6.62H1.26A11.97 11.97 0 0 0 0 12c0 1.93.46 3.76 1.26 5.38l4.01-3.11z" />
            <path fill="#EA4335" d="M12 4.77c1.77 0 3.35.6 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.3 0 3.24 2.7 1.26 6.62l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77z" />
          </svg>
          تسجيل الدخول عبر Google
        </a>
      </div>
    </div>
  );
}
