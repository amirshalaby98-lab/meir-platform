import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

export default function Register() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      setLocation("/select-role");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إنشاء الحساب");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    registerMutation.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || undefined,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-black text-center mb-2">
          إنشاء حساب جديد
        </h1>
        <p className="text-center text-gray-500 mb-8">
          انضم إلى مير في دقيقة واحدة
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="الاسم الكامل"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
            disabled={registerMutation.isPending}
            required
          />
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
            dir="ltr"
            disabled={registerMutation.isPending}
            required
          />
          <input
            type="tel"
            placeholder="رقم الهاتف (اختياري)"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
            dir="ltr"
            disabled={registerMutation.isPending}
          />
          <input
            type="password"
            placeholder="كلمة المرور (8 أحرف على الأقل)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
            dir="ltr"
            disabled={registerMutation.isPending}
            required
          />
          <Button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 transition-all"
          >
            {registerMutation.isPending ? "جاري الإنشاء..." : "إنشاء الحساب"}
          </Button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="text-yellow-600 font-semibold hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
