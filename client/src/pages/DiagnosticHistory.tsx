import { useState } from "react";
import { useLocation } from "wouter";
import Header from "../components/Header";
import { trpc } from "../lib/trpc";

export default function DiagnosticHistory() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"sessions" | "reports">("sessions");

  const sessions = trpc.diagnostics.getSessionHistory.useQuery({ limit: 20, offset: 0 });
  const reports = trpc.diagnostics.getAiReports.useQuery({ limit: 20, offset: 0 });

  const formatDate = (d: string | Date | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6 pt-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">سجل الفحوصات</h1>
            <p className="text-gray-400 text-sm">جميع جلسات الفحص والتشخيصات السابقة</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/obd-scanner")} className="bg-gray-800 hover:bg-gray-700 text-yellow-400 border border-yellow-400/30 px-4 py-2 rounded-lg text-sm">
              ماسح OBD2
            </button>
            <button onClick={() => navigate("/ai-diagnosis")} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded-lg text-sm">
              تشخيص جديد
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === "sessions" ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
          >
            جلسات OBD ({sessions.data?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === "reports" ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
          >
            تقارير AI ({reports.data?.length || 0})
          </button>
        </div>

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div className="space-y-3">
            {sessions.isLoading ? (
              <div className="text-center py-12 text-gray-500">جاري التحميل...</div>
            ) : !sessions.data?.length ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                <div className="text-4xl mb-3">&#128270;</div>
                <h3 className="text-lg font-bold text-gray-400">لا توجد جلسات فحص</h3>
                <p className="text-gray-500 text-sm mt-1">ابدأ فحص جديد من ماسح OBD2</p>
                <button onClick={() => navigate("/obd-scanner")} className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-2 rounded-lg">
                  بدء فحص
                </button>
              </div>
            ) : (
              sessions.data.map((s: any) => (
                <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${s.status === "completed" ? "bg-green-500" : s.status === "in_progress" ? "bg-yellow-500 animate-pulse" : "bg-red-500"}`} />
                      <div>
                        <div className="font-medium text-sm">
                          {s.vehicleMake || "سيارة"} {s.vehicleModel || ""} {s.vehicleYear || ""}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {s.sessionType === "full_scan" ? "فحص شامل" : s.sessionType === "dtc_read" ? "قراءة أعطال" : s.sessionType === "ai_diagnosis" ? "تشخيص AI" : s.sessionType || "فحص"}
                          {s.vin && <span className="mr-2 font-mono">VIN: {s.vin}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-gray-400">{formatDate(s.createdAt)}</div>
                      {s.dtcCount > 0 && (
                        <div className="text-xs text-red-400 mt-0.5">{s.dtcCount} كود عطل</div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-3">
            {reports.isLoading ? (
              <div className="text-center py-12 text-gray-500">جاري التحميل...</div>
            ) : !reports.data?.length ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                <div className="text-4xl mb-3">&#9889;</div>
                <h3 className="text-lg font-bold text-gray-400">لا توجد تقارير</h3>
                <p className="text-gray-500 text-sm mt-1">استخدم التشخيص الذكي للحصول على تقارير</p>
                <button onClick={() => navigate("/ai-diagnosis")} className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-2 rounded-lg">
                  تشخيص جديد
                </button>
              </div>
            ) : (
              reports.data.map((r: any) => (
                <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        r.requestType === "obd_code" ? "bg-cyan-500/20 text-cyan-400" :
                        r.requestType === "symptom_description" ? "bg-purple-500/20 text-purple-400" :
                        "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {r.requestType === "obd_code" ? "كود OBD" : r.requestType === "symptom_description" ? "وصف أعراض" : "تقرير شامل"}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${r.status === "completed" ? "bg-green-500" : r.status === "processing" ? "bg-yellow-500 animate-pulse" : "bg-red-500"}`} />
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(r.createdAt)}</span>
                  </div>
                  <div className="text-sm text-gray-300 font-mono mb-2">{r.inputData?.slice(0, 100)}{(r.inputData?.length || 0) > 100 ? "..." : ""}</div>
                  {r.diagnosis && (
                    <div className="text-xs text-gray-500 line-clamp-2">{r.diagnosis.slice(0, 200)}...</div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
