/**
 * DTC Tab Component - تبويب أكواد الأعطال
 * ═══════════════════════════════════════════════════════
 * مفصول من OBDScanner.tsx لتسهيل الصيانة
 */

import { useCallback, useMemo } from "react";
import { searchDTCs, getMegaDTCCount, type MegaDTCEntry } from "../../lib/dtcMegaDatabase";

// ═══ Types ═══
interface DTCEntry {
  code: string;
  fullCode?: string;
  description: string;
  severity: string;
  category?: string;
  system?: string;
  module?: string;
  moduleAr?: string;
  causes: string[];
  solution?: string;
  estimatedCost?: string;
  subCode?: string;
}

interface DTCTabProps {
  dtcCodes: DTCEntry[];
  pendingDtcs: DTCEntry[];
  dtcSearchQuery: string;
  dtcSearchResults: DTCEntry[];
  onSearchChange: (query: string, results: DTCEntry[]) => void;
  onReadDTCs: () => void;
  onClearDTCs: () => void;
  onSelectDtc: (dtc: DTCEntry) => void;
  severityColor: (s: string) => string;
  severityText: (s: string) => string;
}

// ═══ Helper Functions ═══
type DTCSystem = "engine" | "transmission" | "abs" | "airbag" | "network" | "body";

function getDTCSystem(code: string): DTCSystem {
  const prefix = code[0];
  const num = parseInt(code.substring(1, 3), 16);
  if (prefix === "P") return num < 6 ? "engine" : "transmission";
  if (prefix === "C") return "abs";
  if (prefix === "B") return "body";
  if (prefix === "U") return "network";
  return "engine";
}

function getSystemIcon(sys: DTCSystem | string): string {
  const icons: Record<string, string> = {
    engine: "⚙️", transmission: "🔧", abs: "🛞", airbag: "🎈", network: "🔌", body: "🚗",
  };
  return icons[sys] || "⚙️";
}

function getSystemLabelAr(sys: DTCSystem | string): string {
  const labels: Record<string, string> = {
    engine: "المحرك", transmission: "ناقل الحركة", abs: "الفرامل ABS",
    airbag: "الوسائد الهوائية", network: "شبكة CAN", body: "الهيكل",
  };
  return labels[sys] || "عام";
}

// ═══ Component ═══
export function DTCTab({
  dtcCodes, pendingDtcs, dtcSearchQuery, dtcSearchResults,
  onSearchChange, onReadDTCs, onClearDTCs, onSelectDtc,
  severityColor, severityText,
}: DTCTabProps) {

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    if (q.length >= 2) {
      const results = searchDTCs(q);
      onSearchChange(q, results.map((r: MegaDTCEntry) => ({
        code: r.code,
        description: r.description,
        severity: r.severity === "critical" ? "high" : r.severity as any,
        category: r.code[0] as any,
        system: r.module,
        causes: [r.fix],
        solution: r.fix,
        estimatedCost: "يحتاج تقييم",
      })));
    } else {
      onSearchChange(q, []);
    }
  }, [onSearchChange]);

  const bySystem = useMemo(() => {
    return dtcCodes.reduce((acc, d) => {
      const sys = getDTCSystem(d.code);
      acc[sys] = (acc[sys] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [dtcCodes]);

  const sysColors: Record<string, string> = {
    engine: "border-orange-500/30 hover:border-orange-500/60",
    transmission: "border-blue-500/30 hover:border-blue-500/60",
    abs: "border-red-500/30 hover:border-red-500/60",
    airbag: "border-purple-500/30 hover:border-purple-500/60",
    network: "border-cyan-500/30 hover:border-cyan-500/60",
    body: "border-green-500/30 hover:border-green-500/60",
  };

  const sysTagColors: Record<string, string> = {
    engine: "bg-orange-900/30 text-orange-400",
    transmission: "bg-blue-900/30 text-blue-400",
    abs: "bg-red-900/30 text-red-400",
    airbag: "bg-purple-900/30 text-purple-400",
    network: "bg-cyan-900/30 text-cyan-400",
    body: "bg-green-900/30 text-green-400",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">أكواد الأعطال ({dtcCodes.length}){pendingDtcs.length > 0 && ` + ${pendingDtcs.length} معلق`}</h3>
          <p className="text-[10px] text-gray-500">محرك - ناقل حركة - ABS - وسائد هوائية - شبكة CAN</p>
        </div>
        <div className="flex gap-2">
          {dtcCodes.length > 0 && <button onClick={onClearDTCs} className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg">مسح الأكواد</button>}
          <button onClick={onReadDTCs} className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-3 py-1.5 rounded-lg">تحديث</button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={dtcSearchQuery}
          onChange={handleSearch}
          placeholder="🔍 ابحث عن كود عطل (مثل P0300, P1320, P2135)..."
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
        />
        <span className="absolute left-3 top-2.5 text-[10px] text-gray-600">{getMegaDTCCount()}+ كود</span>
      </div>

      {/* Search Results */}
      {dtcSearchResults.length > 0 && (
        <div className="bg-gray-900/50 border border-yellow-500/20 rounded-xl p-3 space-y-2">
          <h4 className="text-xs font-bold text-yellow-400 mb-2">نتائج البحث ({dtcSearchResults.length})</h4>
          {dtcSearchResults.slice(0, 20).map((dtc) => {
            const sys = getDTCSystem(dtc.code);
            return (
              <div key={`s-${dtc.code}`} onClick={() => onSelectDtc(dtc)} className="bg-gray-800 border border-gray-700 rounded-lg p-3 cursor-pointer hover:border-yellow-500/40 transition">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getSystemIcon(sys)}</span>
                  <span className="font-mono font-bold text-yellow-400 text-xs bg-gray-900 px-2 py-0.5 rounded">{dtc.code}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-white">{dtc.description}</span>
                    <span className="text-[10px] text-gray-500 block">{getSystemLabelAr(sys)} - {dtc.solution}</span>
                  </div>
                  <span className={`${dtc.severity === "high" ? "bg-red-600" : dtc.severity === "medium" ? "bg-orange-600" : "bg-green-600"} text-white text-[10px] px-2 py-0.5 rounded-full`}>
                    {dtc.severity === "high" ? "حرج" : dtc.severity === "medium" ? "متوسط" : "منخفض"}
                  </span>
                </div>
              </div>
            );
          })}
          {dtcSearchResults.length > 20 && <p className="text-[10px] text-gray-500 text-center">... و{dtcSearchResults.length - 20} نتيجة أخرى</p>}
        </div>
      )}

      {/* System Breakdown */}
      {dtcCodes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(bySystem).map(([sys, count]) => (
            <span key={sys} className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-full px-3 py-1 text-xs">
              <span>{getSystemIcon(sys)}</span>
              <span className="text-gray-300">{getSystemLabelAr(sys)}</span>
              <span className="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">{count}</span>
            </span>
          ))}
        </div>
      )}

      {/* DTC List or Empty State */}
      {dtcCodes.length === 0 && pendingDtcs.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
          <div className="text-green-400 text-5xl mb-3">✓</div>
          <h3 className="text-lg font-bold text-green-400">لا توجد أعطال</h3>
          <p className="text-gray-500 text-xs mt-1">جميع الأنظمة سليمة - لا توجد أكواد DTC</p>
          <p className="text-gray-600 text-[10px] mt-1">محرك - ناقل حركة - ABS - وسائد هوائية - شبكة CAN</p>
        </div>
      ) : (
        <div className="space-y-2">
          {dtcCodes.map((dtc) => {
            const sys = getDTCSystem(dtc.code);
            return (
              <div key={dtc.code} onClick={() => onSelectDtc(dtc)} className={`bg-gray-900 border rounded-xl p-4 cursor-pointer transition ${sysColors[sys] || "border-gray-800 hover:border-yellow-500/30"}`}>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">{getSystemIcon(sys)}</span>
                    <span className="font-mono font-bold text-yellow-400 text-xs bg-gray-800 px-2 py-0.5 rounded">{dtc.fullCode || dtc.code}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-sm">{dtc.description}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${sysTagColors[sys] || "bg-gray-700 text-gray-300"}`}>{getSystemLabelAr(sys)}</span>
                      {dtc.moduleAr && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300 border border-blue-500/30">{dtc.module} — {dtc.moduleAr}</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs mt-1 truncate">{dtc.causes[0]}{dtc.causes[1] ? ` - ${dtc.causes[1]}` : ""}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-gray-600 text-[10px]">{dtc.estimatedCost}</p>
                      {dtc.subCode && <span className="text-[9px] bg-purple-900/30 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/20">Sub: {dtc.subCode}</span>}
                    </div>
                  </div>
                  <span className={`${severityColor(dtc.severity)} text-white text-[10px] px-2 py-0.5 rounded-full shrink-0`}>{severityText(dtc.severity)}</span>
                </div>
              </div>
            );
          })}

          {/* Pending DTCs */}
          {pendingDtcs.length > 0 && (<>
            <h4 className="text-xs font-bold text-orange-400 mt-3 pt-3 border-t border-gray-800">⏳ أكواد معلقة (Pending - Mode 07)</h4>
            {pendingDtcs.map((dtc) => {
              const sys = getDTCSystem(dtc.code);
              return (
                <div key={`p-${dtc.code}`} onClick={() => onSelectDtc(dtc)} className="bg-gray-900 border border-orange-500/20 rounded-xl p-3 cursor-pointer hover:border-orange-500/40 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getSystemIcon(sys)}</span>
                    <span className="bg-orange-900/30 text-orange-400 font-mono font-bold px-2 py-0.5 rounded text-xs">{dtc.code}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm">{dtc.description}</span>
                      <span className="text-[10px] text-gray-500 block">{getSystemLabelAr(sys)}</span>
                    </div>
                    <span className="text-orange-400 text-[10px]">معلق</span>
                  </div>
                </div>
              );
            })}
          </>)}
        </div>
      )}
    </div>
  );
}

export default DTCTab;
