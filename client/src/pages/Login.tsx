import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      setLocation("/select-role");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تسجيل الدخول");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-black text-center mb-2">
          تسجيل الدخول
        </h1>
        <p className="text-center text-gray-500 mb-8">
          مرحباً بعودتك إلى مير
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
            dir="ltr"
            disabled={loginMutation.isPending}
            required
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
            dir="ltr"
            disabled={loginMutation.isPending}
            required
          />
          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 transition-all"
          >
            {loginMutation.isPending ? "جاري الدخول..." : "تسجيل الدخول"}
          </Button>
        </form>

        <p className="text-center mt-4">
          <Link href="/forgot-password" className="text-gray-500 hover:underline text-sm">
            نسيت كلمة المرور؟
          </Link>
        </p>

        <p className="text-center text-gray-500 mt-6">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="text-yellow-600 font-semibold hover:underline">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </div>
  );
}
