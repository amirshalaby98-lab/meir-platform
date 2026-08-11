import { useState } from "react";
import { useLocation } from "wouter";
import Header from "../components/Header";
import { trpc } from "../lib/trpc";
import { useAuth } from "../_core/hooks/useAuth";
import { FileText, Car, Calendar, AlertTriangle, CheckCircle, Clock, ArrowLeft, ChevronDown, ChevronUp, Activity, Wrench } from "lucide-react";

type ReviewStatus = "pending" | "reviewed" | "action_required";

const statusConfig: Record<ReviewStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: "قيد المراجعة",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  reviewed: {
    label: "تمت المراجعة",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  action_required: {
    label: "يحتاج إجراء",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
};

function HealthScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-sm font-bold ${score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600"}`}>
        {score}%
      </span>
    </div>
  );
}

interface DtcCode {
  code: string;
  description?: string;
  severity?: string;
  system?: string;
}

function ReportCard({ report }: { report: any }) {
  const [expanded, setExpanded] = useState(false);
  const dtcCodes = (report.dtcCodes as DtcCode[] | null) ?? [];
  const status = (report.reviewStatus as ReviewStatus) ?? "pending";
  const statusInfo = statusConfig[status];
  const vehicleLabel = [report.make, report.model, report.year].filter(Boolean).join(" ");
  const scanDate = new Date(report.scanDate || report.createdAt);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">
                {vehicleLabel || "سيارة غير محددة"}
              </h3>
              <p className="text-xs text-gray-400">
                {scanDate.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                {" · "}
                {scanDate.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${statusInfo.color}`}>
            {statusInfo.icon}
            {statusInfo.label}
          </div>
        </div>

        {/* نسبة صحة المحرك */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">صحة المحرك</p>
          <HealthScoreBar score={report.healthScore ?? 0} />
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-red-500">{dtcCodes.length}</div>
            <div className="text-[10px] text-gray-400">أكواد أعطال</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-gray-700">{report.protocol || "—"}</div>
            <div className="text-[10px] text-gray-400">البروتوكول</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-gray-700">
              {report.mileage ? report.mileage.toLocaleString("ar-SA") : "—"}
            </div>
            <div className="text-[10px] text-gray-400">الكيلومترات</div>
          </div>
        </div>

        {/* VIN */}
        {report.vin && (
          <div className="bg-gray-50 rounded-lg p-2 mb-3">
            <span className="text-xs text-gray-400">VIN: </span>
            <span className="text-xs font-mono text-gray-700 tracking-wider">{report.vin}</span>
          </div>
        )}

        {/* ملاحظات الفني */}
        {report.technicianNotes && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Wrench className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-bold text-blue-700">ملاحظات الفني</span>
            </div>
            <p className="text-sm text-blue-800">{report.technicianNotes}</p>
          </div>
        )}

        {/* زر التفاصيل */}
        {dtcCodes.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 py-1 transition"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? "إخفاء الأعطال" : `عرض ${dtcCodes.length} كود عطل`}
          </button>
        )}
      </div>

      {/* قائمة الأعطال */}
      {expanded && dtcCodes.length > 0 && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <h4 className="text-xs font-bold text-gray-600 mb-2">أكواد الأعطال</h4>
          <div className="space-y-2">
            {dtcCodes.map((dtc, i) => (
              <div key={i} className="flex items-start gap-2 bg-white rounded-lg p-2.5 border border-gray-100">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  dtc.severity === "high" ? "bg-red-100 text-red-700" :
                  dtc.severity === "medium" ? "bg-orange-100 text-orange-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {dtc.code}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 leading-relaxed">{dtc.description || "—"}</p>
                  {dtc.system && (
                    <span className="text-[10px] text-gray-400">{dtc.system}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyOBDReports() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const limit = 10;

  const reportsQuery = trpc.obdReports.getMyReports.useQuery(
    { limit, offset: page * limit },
    { enabled: !!user }
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">يجب تسجيل الدخول</h2>
          <p className="text-gray-500 mb-6">سجّل دخولك لعرض تقارير فحص سياراتك</p>
          <button
            onClick={() => navigate("/select-role")}
            className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl hover:bg-yellow-500 transition"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/obd-scanner")}
            className="p-2 rounded-lg hover:bg-gray-200 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تقاريري</h1>
            <p className="text-sm text-gray-500">سجل فحوصات OBD لسياراتك</p>
          </div>
        </div>

        {/* Reports */}
        {reportsQuery.isLoading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            جاري التحميل...
          </div>
        ) : reportsQuery.data && reportsQuery.data.length > 0 ? (
          <>
            <div className="space-y-4">
              {reportsQuery.data.map(report => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-3 mt-6">
              {page > 0 && (
                <button
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition"
                >
                  السابق
                </button>
              )}
              {reportsQuery.data.length === limit && (
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition"
                >
                  التالي
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Activity className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">لا توجد تقارير بعد</h3>
            <p className="text-gray-400 text-sm mb-6">
              أجرِ فحصاً باستخدام OBD Scanner وسيظهر التقرير هنا
            </p>
            <button
              onClick={() => navigate("/obd-scanner")}
              className="bg-yellow-400 text-black font-bold px-6 py-2.5 rounded-xl hover:bg-yellow-500 transition"
            >
              ابدأ فحص OBD
            </button>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/obd-scanner")}
            className="flex items-center justify-center gap-2 bg-black text-white font-medium py-3 rounded-xl hover:bg-gray-900 transition"
          >
            <Activity className="w-4 h-4" />
            فحص OBD
          </button>
          <button
            onClick={() => navigate("/my-vehicles")}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition"
          >
            <Car className="w-4 h-4" />
            سياراتي
          </button>
        </div>
      </div>
    </div>
  );
}
