import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const forgotPasswordMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setStep("reset");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: async () => {
      toast.success("تم تغيير كلمة المرور بنجاح");
      await utils.auth.me.invalidate();
      setLocation("/select-role");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("يرجى إدخال البريد الإلكتروني");
      return;
    }
    forgotPasswordMutation.mutate({ email });
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !newPassword) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    resetPasswordMutation.mutate({ email, code, newPassword });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-100 p-8">
        {step === "email" ? (
          <>
            <h1 className="text-2xl font-bold text-black text-center mb-2">
              نسيت كلمة المرور؟
            </h1>
            <p className="text-center text-gray-500 mb-8">
              أدخل بريدك الإلكتروني وسنرسل لك رمز تحقق
            </p>
            <form onSubmit={handleSendCode} className="space-y-4">
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                dir="ltr"
                disabled={forgotPasswordMutation.isPending}
                required
              />
              <Button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 transition-all"
              >
                {forgotPasswordMutation.isPending ? "جاري الإرسال..." : "إرسال رمز التحقق"}
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-black text-center mb-2">
              إعادة تعيين كلمة المرور
            </h1>
            <p className="text-center text-gray-500 mb-8">
              أدخل رمز التحقق المرسل إلى {email} وكلمة المرور الجديدة
            </p>
            <form onSubmit={handleReset} className="space-y-4">
              <input
                type="text"
                placeholder="رمز التحقق"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all text-center tracking-widest"
                dir="ltr"
                disabled={resetPasswordMutation.isPending}
                required
              />
              <input
                type="password"
                placeholder="كلمة المرور الجديدة (8 أحرف على الأقل)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                dir="ltr"
                disabled={resetPasswordMutation.isPending}
                required
              />
              <Button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 transition-all"
              >
                {resetPasswordMutation.isPending ? "جاري التحديث..." : "تغيير كلمة المرور"}
              </Button>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-center text-gray-500 hover:underline text-sm"
              >
                لم يصلك الرمز؟ إعادة الإرسال
              </button>
            </form>
          </>
        )}

        <p className="text-center text-gray-500 mt-6">
          تذكرت كلمة المرور؟{" "}
          <Link href="/login" className="text-yellow-600 font-semibold hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
