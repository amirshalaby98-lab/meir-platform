/**
 * AI Diagnosis Tab Component - تبويب التشخيص بالذكاء الاصطناعي
 * ═══════════════════════════════════════════════════════
 * يعرض نتائج تحليل AI Engine: صحة المحرك، التوصيات، TSB، الصيانة
 * مفصول من OBDScanner.tsx لتسهيل الصيانة
 */

import { useMemo } from "react";

// ═══ Types ═══
export interface AIRecommendation {
  action: string;
  actionAr: string;
  priority: "critical" | "high" | "medium" | "low";
  priorityAr: string;
  estimatedCost: string;
  timeframe: string;
  timeframeAr: string;
  confidence: number;
}

export interface AIDiagnosisResult {
  overallHealth: number;
  confidence: number;
  engineCondition: string;
  engineConditionAr: string;
  recommendations: AIRecommendation[];
  correlations: Array<{ codes: string[]; explanation: string; explanationAr: string; severity: string }>;
  tsbMatches: Array<{ id: string; title: string; titleAr: string; description: string; descriptionAr: string; affectedModels: string[] }>;
  predictiveMaintenance: Array<{ component: string; componentAr: string; remainingLife: number; urgency: string; urgencyAr: string }>;
  vibrationAnalysis?: { overallLevel: string; dominantFrequency: string; possibleCause: string; possibleCauseAr: string };
}

interface AITabProps {
  aiDiagnosis: AIDiagnosisResult | null;
  aiRunning: boolean;
  onRunDiagnosis: () => void;
}

// ═══ Sub-Components ═══
function HealthScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-400" : score >= 50 ? "text-yellow-400" : "text-red-400";
  const bgColor = score >= 80 ? "border-green-500/30" : score >= 50 ? "border-yellow-500/30" : "border-red-500/30";
  return (
    <div className={`w-24 h-24 rounded-full border-4 ${bgColor} flex items-center justify-center`}>
      <span className={`text-3xl font-bold font-mono ${color}`}>{score}%</span>
    </div>
  );
}

// ═══ Component ═══
export function AITab({ aiDiagnosis, aiRunning, onRunDiagnosis }: AITabProps) {

  const priorityColors: Record<string, string> = {
    critical: "bg-red-600",
    high: "bg-orange-600",
    medium: "bg-yellow-600",
    low: "bg-blue-600",
  };

  const urgencyColors: Record<string, string> = {
    critical: "text-red-400",
    high: "text-orange-400",
    medium: "text-yellow-400",
    low: "text-green-400",
  };

  return (
    <div className="space-y-5">
      {/* AI Header */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              محرك الذكاء الاصطناعي للتشخيص
            </h3>
            <p className="text-xs text-gray-400 mt-1">تحليل الأنماط - ارتباط الأعطال - التنبؤ بالصيانة - نشرات TSB - تحليل الاهتزازات</p>
          </div>
          <button onClick={onRunDiagnosis} disabled={aiRunning} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition disabled:opacity-50 flex items-center gap-2">
            {aiRunning ? <><span className="animate-spin">⚙️</span>جاري التحليل...</> : <>🔄 إعادة التحليل</>}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {aiRunning && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
          <div className="animate-pulse space-y-4">
            <div className="text-4xl">🧠</div>
            <p className="text-gray-300 font-medium">جاري تحليل بيانات السيارة...</p>
            <div className="flex justify-center gap-1">
              {["قراءة الحساسات", "تحليل الأنماط", "مطابقة TSB", "حساب الاحتمالات"].map((step, i) => (
                <span key={i} className="text-[10px] bg-gray-800 px-2 py-1 rounded text-gray-400">{step}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {aiDiagnosis && !aiRunning && (
        <>
          {/* Overall Health + Confidence */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col items-center">
              <HealthScoreRing score={aiDiagnosis.overallHealth} />
              <span className="text-xs text-gray-400 mt-2">صحة المحرك</span>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-purple-400">{aiDiagnosis.confidence}%</div>
              <span className="text-xs text-gray-400 mt-1">دقة التحليل</span>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col items-center justify-center">
              <div className="text-lg font-bold text-cyan-400">{aiDiagnosis.engineConditionAr}</div>
              <span className="text-xs text-gray-400 mt-1">حالة المحرك</span>
            </div>
          </div>

          {/* Recommendations */}
          {aiDiagnosis.recommendations.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h4 className="text-sm font-bold text-yellow-400 mb-3">📋 التوصيات ({aiDiagnosis.recommendations.length})</h4>
              <div className="space-y-2">
                {aiDiagnosis.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
                    <span className={`${priorityColors[rec.priority]} text-white text-[10px] px-2 py-0.5 rounded-full shrink-0 mt-0.5`}>
                      {rec.priorityAr}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{rec.actionAr}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-gray-500">💰 {rec.estimatedCost}</span>
                        <span className="text-[10px] text-gray-500">⏱ {rec.timeframeAr}</span>
                        <span className="text-[10px] text-gray-500">📊 {rec.confidence}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Correlations */}
          {aiDiagnosis.correlations.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h4 className="text-sm font-bold text-cyan-400 mb-3">🔗 ارتباطات الأعطال</h4>
              <div className="space-y-2">
                {aiDiagnosis.correlations.map((corr, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {corr.codes.map(c => (
                        <span key={c} className="font-mono text-xs bg-gray-700 px-2 py-0.5 rounded text-yellow-400">{c}</span>
                      ))}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        corr.severity === "high" ? "bg-red-900/50 text-red-400" : "bg-yellow-900/50 text-yellow-400"
                      }`}>{corr.severity}</span>
                    </div>
                    <p className="text-xs text-gray-300">{corr.explanationAr}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TSB Matches */}
          {aiDiagnosis.tsbMatches.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h4 className="text-sm font-bold text-orange-400 mb-3">📄 نشرات TSB ذات صلة</h4>
              <div className="space-y-2">
                {aiDiagnosis.tsbMatches.map((tsb, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] bg-orange-900/50 text-orange-400 px-2 py-0.5 rounded">{tsb.id}</span>
                      <span className="text-sm font-medium text-white">{tsb.titleAr}</span>
                    </div>
                    <p className="text-xs text-gray-400">{tsb.descriptionAr}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Predictive Maintenance */}
          {aiDiagnosis.predictiveMaintenance.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h4 className="text-sm font-bold text-green-400 mb-3">🔮 الصيانة التنبؤية</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {aiDiagnosis.predictiveMaintenance.map((item, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-white">{item.componentAr}</p>
                      <p className={`text-xs ${urgencyColors[item.urgency] || "text-gray-400"}`}>{item.urgencyAr}</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold font-mono ${item.remainingLife > 70 ? "text-green-400" : item.remainingLife > 40 ? "text-yellow-400" : "text-red-400"}`}>
                        {item.remainingLife}%
                      </div>
                      <span className="text-[9px] text-gray-500">عمر متبقي</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vibration Analysis */}
          {aiDiagnosis.vibrationAnalysis && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h4 className="text-sm font-bold text-pink-400 mb-3">📳 تحليل الاهتزازات</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-pink-400">{aiDiagnosis.vibrationAnalysis.overallLevel}</div>
                  <span className="text-[10px] text-gray-500">مستوى الاهتزاز</span>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">{aiDiagnosis.vibrationAnalysis.dominantFrequency}</div>
                  <span className="text-[10px] text-gray-500">التردد السائد</span>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-cyan-400">{aiDiagnosis.vibrationAnalysis.possibleCauseAr}</div>
                  <span className="text-[10px] text-gray-500">السبب المحتمل</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* No Results State */}
      {!aiDiagnosis && !aiRunning && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
          <div className="text-4xl mb-3">🧠</div>
          <h3 className="text-lg font-bold text-gray-400">لم يتم التحليل بعد</h3>
          <p className="text-gray-500 text-xs mt-1">اضغط "إعادة التحليل" لبدء تشخيص AI</p>
        </div>
      )}
    </div>
  );
}

export default AITab;
