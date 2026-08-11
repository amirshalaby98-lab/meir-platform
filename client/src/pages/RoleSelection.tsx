import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Wrench, Car, Store } from "lucide-react";

type UserType = "customer" | "technician" | "service_provider";

interface RoleOption {
  type: UserType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const roleOptions: RoleOption[] = [
  {
    type: "customer",
    title: "عميل",
    description: "أبغى أطلب خدمة صيانة أو فني لسيارتي",
    icon: <Car className="w-10 h-10" />,
    color: "from-blue-500 to-blue-600",
  },
  {
    type: "technician",
    title: "فني سيارات",
    description: "أنا فني وأبغى أقدم خدماتي للعملاء",
    icon: <Wrench className="w-10 h-10" />,
    color: "from-yellow-500 to-yellow-600",
  },
  {
    type: "service_provider",
    title: "مزود خدمة",
    description: "عندي ورشة أو محل قطع غيار أو سطحة",
    icon: <Store className="w-10 h-10" />,
    color: "from-green-500 to-green-600",
  },
];

export default function RoleSelection() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<UserType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const utils = trpc.useUtils();
  const setUserTypeMutation = trpc.auth.setUserType.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  // إذا المستخدم عنده نوع محدد مسبقاً، وجهه للصفحة المناسبة
  if (user?.userType) {
    if (user.userType === "customer") {
      setLocation("/service-request");
    } else if (user.userType === "technician") {
      setLocation("/technician-dashboard");
    } else if (user.userType === "service_provider") {
      setLocation("/vendor-dashboard");
    }
    return null;
  }

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await setUserTypeMutation.mutateAsync({ userType: selected });
      // توجيه حسب الاختيار
      if (selected === "customer") {
        setLocation("/service-request");
      } else if (selected === "technician") {
        setLocation("/technician-registration");
      } else if (selected === "service_provider") {
        setLocation("/vendor-registration");
      }
    } catch (error) {
      console.error("Failed to set user type:", error);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-2xl mb-4">
            <span className="text-black font-bold text-lg">Meir</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            أهلاً {user?.name || "بك"}! 👋
          </h1>
          <p className="text-gray-400 text-sm">
            كيف تبغى تستخدم مير؟ اختر نوع حسابك
          </p>
        </div>

        {/* Role Options */}
        <div className="space-y-3">
          {roleOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => setSelected(option.type)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-right flex items-center gap-4 ${
                selected === option.type
                  ? "border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20"
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800"
              }`}
            >
              <div
                className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center text-white`}
              >
                {option.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg">{option.title}</h3>
                <p className="text-gray-400 text-sm mt-0.5">{option.description}</p>
              </div>
              {selected === option.type && (
                <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!selected || submitting}
          className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
            selected && !submitting
              ? "bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/30"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              جاري الحفظ...
            </span>
          ) : (
            "متابعة"
          )}
        </button>

        {/* Note for technicians */}
        {selected === "technician" && (
          <p className="text-center text-yellow-500/80 text-xs mt-3">
            * سيتم مراجعة طلبك من قبل الإدارة قبل تفعيل حسابك كفني
          </p>
        )}
        {selected === "service_provider" && (
          <p className="text-center text-green-500/80 text-xs mt-3">
            * ستحتاج لتعبئة بيانات منشأتك بعد هذه الخطوة
          </p>
        )}
      </div>
    </div>
  );
}
