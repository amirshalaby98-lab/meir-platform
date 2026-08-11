import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "../components/Header";
import { trpc } from "../lib/trpc";

type DiagMode = "obd_code" | "symptom_description" | "full_report";

export default function AIDiagnosis() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<DiagMode>("obd_code");
  const [inputData, setInputData] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [engineType, setEngineType] = useState("");
  const [vin, setVin] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Read code from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      setMode("obd_code");
      setInputData(code);
    }
  }, []);

  // DTC lookup (local)
  const dtcLookup = trpc.diagnostics.lookupDTC.useQuery(
    { code: inputData.toUpperCase() },
    { enabled: mode === "obd_code" && inputData.length >= 5 }
  );

  // AI Diagnosis mutation
  const aiDiagnose = trpc.diagnostics.aiDiagnose.useMutation({
    onSuccess: (data) => {
      setDiagnosis(data.diagnosis);
      setLoading(false);
    },
    onError: () => {
      setError("حدث خطأ أثناء التشخيص. يرجى المحاولة مرة أخرى.");
      setLoading(false);
    },
  });

  const handleDiagnose = () => {
    if (!inputData.trim()) return;
    setLoading(true);
    setError("");
    setDiagnosis("");

    // Build enhanced input with VIN and engine type
    let enhancedInput = inputData.trim();
    if (mode === "full_report" && vin) {
      enhancedInput += `\n• VIN: ${vin}`;
    }
    if (engineType) {
      enhancedInput += `\n• نوع المحرك: ${engineType}`;
    }

    aiDiagnose.mutate({
      requestType: mode,
      inputData: enhancedInput,
      vehicleInfo: {
        make: vehicleMake || undefined,
        model: vehicleModel || undefined,
        year: vehicleYear || undefined,
        engineType: engineType || undefined,
      },
    });
  };

  const modes: { key: DiagMode; label: string; desc: string; placeholder: string; icon: string }[] = [
    { key: "obd_code", label: "كود DTC", desc: "تحليل كود عطل OBD-II", placeholder: "مثال: P0300", icon: "🔍" },
    { key: "symptom_description", label: "وصف الأعراض", desc: "تشخيص من وصف المشكلة", placeholder: "صف المشكلة بالتفصيل: متى تحدث؟ ما الصوت؟ هل تظهر لمبة؟...", icon: "📋" },
    { key: "full_report", label: "تقرير شامل", desc: "تحليل بيانات Live Data كاملة", placeholder: "أدخل بيانات الفحص: أكواد + قراءات حية + ملاحظات...", icon: "📊" },
  ];

  const protocols = [
    { name: "CAN Bus", desc: "ISO 15765-4" },
    { name: "KWP2000", desc: "ISO 14230" },
    { name: "UDS", desc: "ISO 14229" },
    { name: "DoIP", desc: "ISO 13400" },
    { name: "J1850", desc: "SAE J1850" },
    { name: "LIN", desc: "ISO 17987" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      <Header />
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 pt-20 sm:pt-24">
        {/* Header Section */}
        <div className="bg-gradient-to-l from-yellow-500/10 via-gray-900 to-gray-900 border border-yellow-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-black font-bold text-base sm:text-lg shrink-0">M</div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-yellow-400">OBDMeir AI</h1>
                  <p className="text-gray-400 text-[11px] sm:text-xs">منصة التشخيص الذكية المتقدمة</p>
                </div>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm mt-2 leading-relaxed">
                تشخيص احترافي عبر بروتوكولات OBD-II, CAN Bus, UDS, DoIP مع تنبؤ بالأعطال المستقبلية
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => navigate("/obd-scanner")} className="bg-gray-800 hover:bg-gray-700 text-yellow-400 border border-yellow-400/30 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap">
                ماسح OBD2
              </button>
              <button onClick={() => navigate("/diagnostic-history")} className="bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap">
                السجل
              </button>
            </div>
          </div>

          {/* Supported Protocols */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-800">
            {protocols.map((p) => (
              <span key={p.name} className="bg-gray-800/80 text-gray-400 text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-gray-700">
                {p.name} <span className="text-gray-600">({p.desc})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); setDiagnosis(""); setError(""); }}
              className={`p-3 sm:p-4 rounded-xl text-center transition border ${
                mode === m.key
                  ? "bg-yellow-500/10 border-yellow-500 text-yellow-400"
                  : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600"
              }`}
            >
              <div className="text-xl sm:text-2xl mb-1">{m.icon}</div>
              <div className="text-sm font-bold">{m.label}</div>
              <div className="text-[11px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{m.desc}</div>
            </button>
          ))}
        </div>

        {/* Vehicle Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
          <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            معلومات المركبة
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            <input
              type="text"
              placeholder="الماركة"
              value={vehicleMake}
              onChange={(e) => setVehicleMake(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:border-yellow-500 outline-none w-full"
            />
            <input
              type="text"
              placeholder="الموديل"
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:border-yellow-500 outline-none w-full"
            />
            <input
              type="text"
              placeholder="السنة"
              value={vehicleYear}
              onChange={(e) => setVehicleYear(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:border-yellow-500 outline-none w-full"
            />
            <input
              type="text"
              placeholder="نوع المحرك"
              value={engineType}
              onChange={(e) => setEngineType(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:border-yellow-500 outline-none w-full"
            />
            <input
              type="text"
              placeholder="VIN (اختياري)"
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              maxLength={17}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm font-mono focus:border-yellow-500 outline-none w-full col-span-2 sm:col-span-1"
            />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
          <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            {mode === "obd_code" ? "كود العطل DTC" : mode === "symptom_description" ? "وصف المشكلة" : "بيانات الفحص"}
          </h3>

          {mode === "obd_code" ? (
            <input
              type="text"
              placeholder={modes.find((m) => m.key === mode)?.placeholder}
              value={inputData}
              onChange={(e) => setInputData(e.target.value.toUpperCase())}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-base sm:text-lg font-mono focus:border-yellow-500 outline-none"
              maxLength={10}
            />
          ) : (
            <textarea
              placeholder={modes.find((m) => m.key === mode)?.placeholder}
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-3 text-sm focus:border-yellow-500 outline-none resize-none"
            />
          )}

          {/* Quick DTC lookup */}
          {mode === "obd_code" && dtcLookup.data && (
            <div className="mt-3 bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-yellow-500 text-black font-mono font-bold px-2 py-0.5 rounded text-xs">{dtcLookup.data.code}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  dtcLookup.data.severity === "high" ? "bg-red-500/20 text-red-400" :
                  dtcLookup.data.severity === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-blue-500/20 text-blue-400"
                }`}>
                  {dtcLookup.data.severity === "high" ? "خطورة عالية" : dtcLookup.data.severity === "medium" ? "متوسطة" : "منخفضة"}
                </span>
                <span className="text-xs text-gray-500">{dtcLookup.data.system}</span>
              </div>
              <p className="text-sm text-gray-300">{dtcLookup.data.description}</p>
              <p className="text-xs text-gray-500 mt-1">الأسباب: {dtcLookup.data.causes?.join(" | ")}</p>
              {dtcLookup.data.estimatedCost && (
                <p className="text-xs text-green-400 mt-1">التكلفة التقديرية: {dtcLookup.data.estimatedCost}</p>
              )}
            </div>
          )}

          <button
            onClick={handleDiagnose}
            disabled={loading || !inputData.trim()}
            className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                جاري التحليل عبر OBDMeir AI...
              </>
            ) : (
              <>
                <span>⚡</span>
                تشخيص بـ OBDMeir AI
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* AI Diagnosis Result */}
        {diagnosis && (
          <div className="bg-gray-900 border border-yellow-500/30 rounded-xl overflow-hidden mb-3 sm:mb-4">
            {/* Report Header */}
            <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-3 sm:px-6 py-3 sm:py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-black font-bold text-xs sm:text-sm shrink-0">M</div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-lg font-bold text-yellow-400 truncate">تقرير التشخيص - OBDMeir AI</h3>
                    <p className="text-[11px] sm:text-xs text-gray-400">
                      {new Date().toLocaleDateString("ar-SA")} | {vehicleMake} {vehicleModel} {vehicleYear}
                    </p>
                  </div>
                </div>
                <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full self-start sm:self-auto shrink-0">مكتمل</span>
              </div>
            </div>

            {/* Report Body */}
            <div className="p-3 sm:p-6">
              <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap text-xs sm:text-sm">
                {diagnosis}
              </div>
            </div>

            {/* Report Footer */}
            <div className="border-t border-gray-800 px-3 sm:px-6 py-3 sm:py-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => navigate("/book-technician")}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2.5 rounded-lg text-sm"
                >
                  احجز فني الآن
                </button>
                <button
                  onClick={() => navigate("/consultations")}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-yellow-400 border border-yellow-500/30 py-2.5 rounded-lg text-sm"
                >
                  طلب استشارة هندسية
                </button>
                <button
                  onClick={() => { setDiagnosis(""); setInputData(""); }}
                  className="sm:flex-none bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg text-sm"
                >
                  تشخيص جديد
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Common DTCs Quick Access */}
        {!diagnosis && !loading && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4">
            <h3 className="text-sm font-bold text-gray-300 mb-3">أكواد شائعة - اضغط للتشخيص السريع</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {[
                { code: "P0300", desc: "عشوائية احتراق" },
                { code: "P0420", desc: "كفاءة المحول الحفاز" },
                { code: "P0171", desc: "خليط فقير Bank 1" },
                { code: "P0130", desc: "حساس أوكسجين" },
                { code: "P0442", desc: "تسريب نظام EVAP" },
                { code: "P0340", desc: "حساس عمود الكامات" },
                { code: "P0401", desc: "تدفق EGR غير كافي" },
                { code: "P0128", desc: "ثرموستات" },
                { code: "B1000", desc: "عطل ECU داخلي" },
                { code: "C0035", desc: "حساس ABS" },
                { code: "U0100", desc: "فقدان اتصال CAN" },
                { code: "P0507", desc: "RPM عالي بالخمول" },
              ].map((item) => (
                <button
                  key={item.code}
                  onClick={() => { setMode("obd_code"); setInputData(item.code); }}
                  className="bg-gray-800 hover:bg-gray-700 text-right px-3 py-2.5 rounded-lg border border-gray-700 hover:border-yellow-500/30 transition"
                >
                  <span className="text-yellow-400 font-mono text-sm font-bold">{item.code}</span>
                  <span className="text-gray-500 text-[11px] sm:text-xs block mt-0.5">{item.desc}</span>
                </button>
              ))}
            </div>

            {/* Capabilities Info */}
            <div className="mt-4 pt-4 border-t border-gray-800">
              <h4 className="text-xs font-bold text-gray-500 mb-2">قدرات OBDMeir AI</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"></span>
                  تحليل CAN Bus Logs
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"></span>
                  برمجة ECU/TCM/BCM
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"></span>
                  خوارزميات Seed-Key
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"></span>
                  تنبؤ الأعطال المستقبلية
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"></span>
                  دعم Autel/Launch/Topdon
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"></span>
                  قراءة EEPROM
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"></span>
                  UDS / DoIP
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"></span>
                  BLE / Wi-Fi / USB
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
