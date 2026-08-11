import { useState, useEffect } from "react";

interface TechnicianTrackerProps {
  bookingId?: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function TechnicianTracker({ bookingId, isVisible, onClose }: TechnicianTrackerProps) {
  const [status, setStatus] = useState<"assigned" | "on_way" | "arrived" | "working" | "done">("on_way");
  const [eta, setEta] = useState(15);
  const [techName] = useState("أحمد محمد");

  useEffect(() => {
    if (!isVisible) return;
    // Simulate ETA countdown
    const timer = setInterval(() => {
      setEta((prev) => {
        if (prev <= 1) {
          setStatus("arrived");
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Every minute

    return () => clearInterval(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  const steps = [
    { key: "assigned", label: "تم تعيين الفني", icon: "👨‍🔧" },
    { key: "on_way", label: "في الطريق إليك", icon: "🚗" },
    { key: "arrived", label: "وصل الفني", icon: "📍" },
    { key: "working", label: "جاري العمل", icon: "🔧" },
    { key: "done", label: "تمت الخدمة", icon: "✅" },
  ];

  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="font-bold text-gray-900">تتبع الفني</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        {/* Technician Info */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👨‍🔧</span>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900">{techName}</h4>
              <p className="text-sm text-gray-500">فني معتمد • تقييم 4.9 ⭐</p>
            </div>
            <a
              href="https://wa.me/966543257872"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* ETA */}
        {status === "on_way" && (
          <div className="p-4 bg-yellow-50 border-b">
            <div className="text-center">
              <p className="text-sm text-gray-600">الوقت المتوقع للوصول</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{eta} دقيقة</p>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="p-6">
          <div className="relative">
            {steps.map((step, i) => (
              <div key={step.key} className="flex items-start gap-4 mb-6 last:mb-0">
                <div className="relative flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 ${
                    i <= currentIndex ? "bg-yellow-400" : "bg-gray-200"
                  }`}>
                    {step.icon}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-0.5 h-8 mt-1 ${i < currentIndex ? "bg-yellow-400" : "bg-gray-200"}`}></div>
                  )}
                </div>
                <div className="pt-2">
                  <p className={`font-semibold text-sm ${i <= currentIndex ? "text-gray-900" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                  {i === currentIndex && (
                    <p className="text-xs text-yellow-600 mt-0.5 animate-pulse">الحالة الحالية</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-3">
            <a
              href="tel:+966543257872"
              className="flex-1 bg-gray-900 text-white text-center font-bold py-3 rounded-xl hover:bg-gray-800 transition text-sm"
            >
              اتصال بالفني
            </a>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition text-sm"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
