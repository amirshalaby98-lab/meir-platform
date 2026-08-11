/**
 * Live Data Tab Component - تبويب البيانات الحية
 * ═══════════════════════════════════════════════════════
 * يعرض قراءات المحرك الحية: RPM, سرعة, حرارة, وقود...
 * مفصول من OBDScanner.tsx لتسهيل الصيانة
 */

import { useMemo } from "react";

// ═══ Types ═══
export interface OBDLiveDataDisplay {
  rpm: number;
  speed: number;
  coolantTemp: number;
  voltage: number;
  throttlePos: number;
  engineLoad: number;
  mafRate: number;
  shortFuelTrim: number;
  longFuelTrim: number;
  intakeTemp: number;
  timingAdvance: number;
  fuelLevel: number;
  fuelPressure: number;
  intakeManifold: number;
  catalystTemp: number;
  oilTemp: number;
  ambientTemp: number;
  boostPressure: number;
  [key: string]: number;
}

interface LiveDataTabProps {
  liveData: OBDLiveDataDisplay;
  isReading: boolean;
  proMode: boolean;
  showFactoryValues: boolean;
  showCustomDashboard: boolean;
  customDashboardPids: string[];
  onToggleFactoryValues: () => void;
  onToggleCustomDashboard: () => void;
  onSetCustomPids: (updater: (prev: string[]) => string[]) => void;
  onStartReading: () => void;
  onStopReading: () => void;
}

// ═══ Constants ═══
const PID_OPTIONS = [
  { key: "rpm", label: "دورات RPM" },
  { key: "speed", label: "السرعة" },
  { key: "coolantTemp", label: "حرارة المحرك" },
  { key: "voltage", label: "جهد البطارية" },
  { key: "throttlePos", label: "الخانق" },
  { key: "engineLoad", label: "حمل المحرك" },
  { key: "mafRate", label: "MAF" },
  { key: "shortFuelTrim", label: "Short FT" },
  { key: "longFuelTrim", label: "Long FT" },
  { key: "intakeTemp", label: "حرارة السحب" },
  { key: "timingAdvance", label: "الإشعال" },
  { key: "fuelLevel", label: "الوقود" },
];

const PID_UNITS: Record<string, string> = {
  rpm: "RPM", speed: "km/h", coolantTemp: "°C", voltage: "V",
  throttlePos: "%", engineLoad: "%", mafRate: "g/s",
  shortFuelTrim: "%", longFuelTrim: "%", intakeTemp: "°C",
  timingAdvance: "°", fuelLevel: "%",
};

const PID_NAMES: Record<string, string> = {
  rpm: "دورات", speed: "سرعة", coolantTemp: "حرارة", voltage: "جهد",
  throttlePos: "خانق", engineLoad: "حمل", mafRate: "MAF",
  shortFuelTrim: "STFT", longFuelTrim: "LTFT", intakeTemp: "سحب",
  timingAdvance: "إشعال", fuelLevel: "وقود",
};

const FACTORY_RANGES: Record<string, [number, number]> = {
  rpm: [700, 800], speed: [0, 300], coolantTemp: [80, 105],
  voltage: [13.5, 14.5], throttlePos: [0, 100], engineLoad: [0, 100],
  mafRate: [2, 25], shortFuelTrim: [-5, 5], longFuelTrim: [-5, 5],
  intakeTemp: [10, 50], timingAdvance: [8, 20], fuelLevel: [0, 100],
};

// ═══ Component ═══
export function LiveDataTab({
  liveData, isReading, proMode, showFactoryValues, showCustomDashboard,
  customDashboardPids, onToggleFactoryValues, onToggleCustomDashboard,
  onSetCustomPids, onStartReading, onStopReading,
}: LiveDataTabProps) {

  const factoryComparison = useMemo(() => [
    { name: "RPM خمول", current: Math.round(liveData.rpm), normal: "600-900", min: 600, max: 900 },
    { name: "حرارة المحرك", current: Math.round(liveData.coolantTemp), normal: "80-105", min: 80, max: 105 },
    { name: "جهد البطارية", current: parseFloat(liveData.voltage.toFixed(1)), normal: "13.5-14.5", min: 13.5, max: 14.5 },
    { name: "Short Fuel Trim", current: parseFloat(liveData.shortFuelTrim.toFixed(1)), normal: "-5 إلى +5", min: -5, max: 5 },
    { name: "Long Fuel Trim", current: parseFloat(liveData.longFuelTrim.toFixed(1)), normal: "-10 إلى +10", min: -10, max: 10 },
    { name: "تقديم الإشعال", current: parseFloat(liveData.timingAdvance.toFixed(1)), normal: "8-20", min: 8, max: 20 },
    { name: "MAF خمول", current: parseFloat(liveData.mafRate.toFixed(1)), normal: "2-7", min: 2, max: 7 },
    { name: "حرارة السحب", current: Math.round(liveData.intakeTemp), normal: "10-50", min: 10, max: 50 },
  ], [liveData]);

  return (
    <div className="space-y-5">

      {/* Pro Mode Banner */}
      {proMode && (
        <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-xl p-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 font-bold text-sm">⚡ وضع الفني المحترف مفعّل</span>
              <span className="text-gray-400 text-xs">— جميع القراءات المتقدمة ظاهرة</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleFactoryValues}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                  showFactoryValues ? "bg-green-600 text-white border-green-500" : "bg-gray-800 text-gray-400 border-gray-600"
                }`}
              >
                {showFactoryValues ? "✓ قيم المصنع" : "قيم المصنع"}
              </button>
              <button
                onClick={onToggleCustomDashboard}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                  showCustomDashboard ? "bg-blue-600 text-white border-blue-500" : "bg-gray-800 text-gray-400 border-gray-600"
                }`}
              >
                {showCustomDashboard ? "✓ لوحة مخصصة" : "لوحة مخصصة"}
              </button>
            </div>
          </div>

          {/* Custom Dashboard Selector */}
          {showCustomDashboard && (
            <div className="mt-3 border-t border-yellow-500/20 pt-3">
              <p className="text-gray-400 text-xs mb-2">اختر القراءات التي تريد عرضها في لوحتك المخصصة:</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
                {PID_OPTIONS.map(pid => (
                  <button
                    key={pid.key}
                    onClick={() => onSetCustomPids(prev =>
                      prev.includes(pid.key) ? prev.filter(p => p !== pid.key) : [...prev, pid.key]
                    )}
                    className={`px-2 py-1 rounded text-xs font-medium transition border ${
                      customDashboardPids.includes(pid.key)
                        ? "bg-yellow-500 text-black border-yellow-400"
                        : "bg-gray-800 text-gray-400 border-gray-700"
                    }`}
                  >
                    {pid.label}
                  </button>
                ))}
              </div>
              {/* Custom Dashboard Display */}
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-3">
                {customDashboardPids.map(key => {
                  const val = liveData[key];
                  const range = FACTORY_RANGES[key];
                  const numVal = typeof val === "number" ? val : parseFloat(String(val));
                  const inRange = range ? numVal >= range[0] && numVal <= range[1] : true;
                  return (
                    <div key={key} className={`rounded-lg p-2 text-center border ${
                      showFactoryValues && !inRange ? "bg-red-900/30 border-red-500/50" : "bg-gray-900 border-gray-700"
                    }`}>
                      <div className={`text-lg font-bold font-mono ${
                        showFactoryValues ? (inRange ? "text-green-400" : "text-red-400") : "text-yellow-400"
                      }`}>
                        {typeof val === "number" ? (Number.isInteger(val) ? val : val.toFixed(1)) : val}
                      </div>
                      <div className="text-[9px] text-gray-500">{PID_UNITS[key]}</div>
                      <div className="text-[10px] text-gray-400">{PID_NAMES[key]}</div>
                      {showFactoryValues && range && (
                        <div className={`text-[8px] mt-0.5 ${inRange ? "text-green-500" : "text-red-400"}`}>
                          {inRange ? "✓ طبيعي" : `⚠ خارج [${range[0]}-${range[1]}]`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Factory Values Comparison Table */}
          {showFactoryValues && !showCustomDashboard && (
            <div className="mt-3 border-t border-yellow-500/20 pt-3">
              <p className="text-yellow-400 text-xs font-bold mb-2">مقارنة القراءات مع قيم المصنع:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {factoryComparison.map(item => {
                  const ok = item.current >= item.min && item.current <= item.max;
                  return (
                    <div key={item.name} className={`rounded-lg p-2 border text-center ${
                      ok ? "bg-green-900/20 border-green-500/30" : "bg-red-900/30 border-red-500/50"
                    }`}>
                      <div className={`text-sm font-bold font-mono ${ok ? "text-green-400" : "text-red-400"}`}>
                        {item.current}
                      </div>
                      <div className="text-[9px] text-gray-400">{item.name}</div>
                      <div className={`text-[8px] mt-0.5 ${ok ? "text-green-500" : "text-red-400"}`}>
                        {ok ? "✓ طبيعي" : `⚠ خارج`} | مصنع: {item.normal}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Gauges - RPM, Speed, Temp */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900 border-2 border-red-500/30 rounded-xl p-4 text-center">
          <div className="text-red-400 text-xs font-medium mb-1">دورات المحرك</div>
          <div className="text-red-400 text-4xl md:text-5xl font-bold font-mono leading-none">{Math.round(liveData.rpm).toLocaleString()}</div>
          <div className="text-red-400/60 text-sm mt-1">RPM</div>
        </div>
        <div className="bg-gray-900 border-2 border-green-500/30 rounded-xl p-4 text-center">
          <div className="text-green-400 text-xs font-medium mb-1">السرعة</div>
          <div className="text-green-400 text-4xl md:text-5xl font-bold font-mono leading-none">{Math.round(liveData.speed)}</div>
          <div className="text-green-400/60 text-sm mt-1">km/h</div>
        </div>
        <div className="bg-gray-900 border-2 border-blue-500/30 rounded-xl p-4 text-center">
          <div className="text-blue-400 text-xs font-medium mb-1">حرارة المحرك</div>
          <div className={`text-4xl md:text-5xl font-bold font-mono leading-none ${liveData.coolantTemp > 105 ? "text-red-400" : "text-blue-400"}`}>{Math.round(liveData.coolantTemp)}</div>
          <div className="text-blue-400/60 text-sm mt-1">°C</div>
        </div>
      </div>

      {/* Reading Control */}
      <div className="flex justify-center">
        {isReading ? (
          <button onClick={onStopReading} className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-xl text-sm transition">
            ⏹ إيقاف القراءة
          </button>
        ) : (
          <button onClick={onStartReading} className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-xl text-sm transition">
            ▶ بدء القراءة الحية
          </button>
        )}
      </div>
    </div>
  );
}

export default LiveDataTab;
