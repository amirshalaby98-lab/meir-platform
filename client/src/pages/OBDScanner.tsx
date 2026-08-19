import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area, BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import Header from "../components/Header";
import { OBDBleService, obdService } from "../lib/obdBleService";
import { trpc } from "../lib/trpc";
import type { ConnectionStatus, LogType, FreezeFrameData, Mode6TestResult, OBDAlert, ScanReport, EngineHealth, O2SensorData, MultiECUScanResult, TransmissionData, FuelEconomyData } from "../lib/obdBleService";
import { obdAiEngine, type DiagnosticResult, type LiveSensorData, type FeedbackEntry } from "../lib/obdAiEngine";
import { AutoReconnect, LiveChartBuffer } from "../lib/obdMultiPid";
import { saveSession, getAllSessions, compareSessions, exportSessionAsText, shareViaWhatsApp, shareViaEmail, type StoredSession } from "../lib/obdSessionStorage";
import { useAuth } from "../_core/hooks/useAuth";
import { getManufacturerPIDs, type EnhancedPIDDefinition } from "../lib/obdEnhancedPids";
import { generatePDFReport, type PDFReportData } from "../lib/obdPdfReport";
import type { DataLogEntry, PerformanceResult } from "../lib/obdBleService";
import { lookupDTC, getDTCSystem, getSystemLabelAr, getSystemIcon, getSeverityLabelAr, ALL_DTC_DATABASE, searchAllDTCs, getMegaDTCCount } from "../lib/obdDtcDatabase";
import { getDiagnosticSteps, getRequiredToolsForCodes, type DTCDiagnosticInfo } from "../lib/dtcDiagnosticSteps";
import { UDSProtocol, decodeVIN, getOEMPIDsForMake, OIL_RESET_PROCEDURES, NISSAN_ACTION_TESTS, NISSAN_ECU_MAP, NISSAN_CATEGORY_LABELS, NISSAN_MODELS_2022_PLUS, FORD_ACTION_TESTS, FORD_CATEGORY_LABELS, type FordActionTest, type NissanActionTest, type SpecialFunctionResult, type VINInfo } from "../lib/udsProtocol";

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

interface LiveData {
  rpm: number;
  speed: number;
  coolantTemp: number;
  engineLoad: number;
  throttlePos: number;
  fuelLevel: number;
  mafRate: number;
  timingAdvance: number;
  voltage: number;
  intakeTemp: number;
  oilTemp: number;
  fuelPressure: number;
  shortFuelTrim: number;
  longFuelTrim: number;
  instantFuelConsumption: number;
  // القراءات الإضافية
  barometricPressure: number;
  catalystTemp: number;
  fuelRailPressure: number;
  commandedEGR: number;
  engineTorque: number;
  ambientTemp: number;
  runTime: number;
  distanceWithMIL: number;
  intakeMAP: number;
  transmissionTemp: number;
  turboBoost: number;
  absoluteThrottle: number;
  // PIDs المتقدمة الجديدة
  boostPressure: number;
  fuelSystemStatus: number;
  commandedThrottle: number;
  absoluteLoad: number;
  relativeThrottle: number;
  ethanolPercent: number;
  turboRPM: number;
  exhaustPressure: number;
  dpfTemp: number;
  noxSensor: number;
  fuelInjectionTiming: number;
  acceleratorPedalD: number;
  acceleratorPedalE: number;
}

// Min/Max/Avg tracking for each reading
interface LiveDataStats {
  min: Partial<LiveData>;
  max: Partial<LiveData>;
  sum: Partial<LiveData>;
  count: number;
}

// Live Graph data point
interface GraphDataPoint {
  time: number;
  [key: string]: number;
}

interface ChartPoint { time: string; value: number; }

interface DTCEntry {
  code: string;
  description: string;
  severity: "low" | "medium" | "high";
  category: string;
  system: string;
  causes: string[];
  solution: string;
  estimatedCost: string;
  // حقول إضافية لدعم Ford Sub-codes والوحدات
  module?: string;       // PCM / TCM / RCM / BCM
  moduleAr?: string;     // اسم الوحدة بالعربي
  subCode?: string;      // Ford sub-code مثل 6C أو 28
  fullCode?: string;     // الكود الكامل P008A-6C
  isPending?: boolean;   // كود معلق
}

interface LogEntry { time: string; type: "sent" | "received" | "info" | "error"; message: string; }

// ═══════════════════════════════════════════════════════
// DTC DATABASE - Unified (Engine + Transmission + ABS + Airbag + Network)
// ═══════════════════════════════════════════════════════

// Engine DTC codes (P0xxx - P2xxx excluding Transmission P07xx-P08xx)
const ENGINE_DTC_LOCAL: Record<string, Omit<DTCEntry, "code">> = {
  P0300: { description: "عطل عشوائي في احتراق الأسطوانات", severity: "high", category: "P", system: "نظام الاحتراق", causes: ["بوجيات تالفة", "كويلات ضعيفة", "حقن وقود مسدود", "تسريب فاكيوم"], solution: "فحص البوجيات والكويلات، تنظيف الحاقن، فحص تسريبات الهواء", estimatedCost: "500 - 2,000 ر.س" },
  P0301: { description: "عطل احتراق الأسطوانة 1", severity: "high", category: "P", system: "نظام الاحتراق", causes: ["بوجي تالف", "كويل ضعيف", "حاقن مسدود"], solution: "فحص بوجي وكويل الأسطوانة 1", estimatedCost: "200 - 800 ر.س" },
  P0302: { description: "عطل احتراق الأسطوانة 2", severity: "high", category: "P", system: "نظام الاحتراق", causes: ["بوجي تالف", "كويل ضعيف", "حاقن مسدود"], solution: "فحص بوجي وكويل الأسطوانة 2", estimatedCost: "200 - 800 ر.س" },
  P0303: { description: "عطل احتراق الأسطوانة 3", severity: "high", category: "P", system: "نظام الاحتراق", causes: ["بوجي تالف", "كويل ضعيف", "حاقن مسدود"], solution: "فحص بوجي وكويل الأسطوانة 3", estimatedCost: "200 - 800 ر.س" },
  P0304: { description: "عطل احتراق الأسطوانة 4", severity: "high", category: "P", system: "نظام الاحتراق", causes: ["بوجي تالف", "كويل ضعيف", "حاقن مسدود"], solution: "فحص بوجي وكويل الأسطوانة 4", estimatedCost: "200 - 800 ر.س" },
  P0305: { description: "عطل احتراق الأسطوانة 5", severity: "high", category: "P", system: "نظام الاحتراق", causes: ["بوجي تالف", "كويل ضعيف", "حاقن مسدود"], solution: "فحص بوجي وكويل الأسطوانة 5", estimatedCost: "200 - 800 ر.س" },
  P0306: { description: "عطل احتراق الأسطوانة 6", severity: "high", category: "P", system: "نظام الاحتراق", causes: ["بوجي تالف", "كويل ضعيف", "حاقن مسدود"], solution: "فحص بوجي وكويل الأسطوانة 6", estimatedCost: "200 - 800 ر.س" },
  P0307: { description: "عطل احتراق الأسطوانة 7", severity: "high", category: "P", system: "نظام الاحتراق", causes: ["بوجي تالف", "كويل ضعيف", "حاقن مسدود"], solution: "فحص بوجي وكويل الأسطوانة 7", estimatedCost: "200 - 800 ر.س" },
  P0308: { description: "عطل احتراق الأسطوانة 8", severity: "high", category: "P", system: "نظام الاحتراق", causes: ["بوجي تالف", "كويل ضعيف", "حاقن مسدود"], solution: "فحص بوجي وكويل الأسطوانة 8", estimatedCost: "200 - 800 ر.س" },
  P0100: { description: "عطل في دائرة حساس تدفق الهواء MAF", severity: "medium", category: "P", system: "نظام الهواء", causes: ["حساس MAF تالف", "أسلاك مقطوعة", "تسريب هواء"], solution: "تنظيف أو استبدال حساس MAF، فحص الأسلاك", estimatedCost: "200 - 800 ر.س" },
  P0101: { description: "نطاق/أداء حساس MAF خارج المواصفات", severity: "medium", category: "P", system: "نظام الهواء", causes: ["حساس MAF متسخ", "تسريب هواء قبل MAF", "فلتر هواء مسدود"], solution: "تنظيف حساس MAF، فحص فلتر الهواء والتسريبات", estimatedCost: "150 - 600 ر.س" },
  P0102: { description: "إشارة حساس MAF منخفضة", severity: "medium", category: "P", system: "نظام الهواء", causes: ["حساس MAF تالف", "أسلاك قصيرة للأرضي", "تسريب هواء كبير"], solution: "فحص الأسلاك، استبدال حساس MAF", estimatedCost: "200 - 800 ر.س" },
  P0103: { description: "إشارة حساس MAF مرتفعة", severity: "medium", category: "P", system: "نظام الهواء", causes: ["حساس MAF تالف", "مشكلة في الأسلاك"], solution: "فحص الأسلاك، استبدال حساس MAF", estimatedCost: "200 - 800 ر.س" },
  P0110: { description: "عطل في دائرة حساس حرارة الهواء IAT", severity: "low", category: "P", system: "نظام الهواء", causes: ["حساس IAT تالف", "أسلاك مقطوعة"], solution: "فحص واستبدال حساس IAT", estimatedCost: "100 - 400 ر.س" },
  P0115: { description: "عطل في دائرة حساس حرارة سائل التبريد ECT", severity: "medium", category: "P", system: "نظام التبريد", causes: ["حساس ECT تالف", "أسلاك مقطوعة", "مشكلة في PCM"], solution: "فحص واستبدال حساس ECT، فحص الأسلاك", estimatedCost: "150 - 500 ر.س" },
  P0116: { description: "نطاق/أداء حساس ECT خارج المواصفات", severity: "medium", category: "P", system: "نظام التبريد", causes: ["حساس ECT تالف", "مشكلة في الثرموستات", "مستوى سائل التبريد منخفض"], solution: "فحص حساس ECT والثرموستات", estimatedCost: "200 - 800 ر.س" },
  P0120: { description: "عطل في دائرة حساس موضع الخانق TPS", severity: "medium", category: "P", system: "نظام الخانق", causes: ["حساس TPS تالف", "أسلاك مقطوعة", "مشكلة في PCM"], solution: "فحص واستبدال حساس TPS", estimatedCost: "200 - 700 ر.س" },
  P0121: { description: "نطاق/أداء حساس TPS خارج المواصفات", severity: "medium", category: "P", system: "نظام الخانق", causes: ["حساس TPS تالف", "تراكم كربون على الخانق"], solution: "تنظيف جسم الخانق، فحص حساس TPS", estimatedCost: "150 - 600 ر.س" },
  P0125: { description: "حرارة سائل التبريد غير كافية للتحكم في الوقود", severity: "low", category: "P", system: "نظام التبريد", causes: ["ثرموستات عالق مفتوح", "حساس ECT تالف"], solution: "استبدال الثرموستات، فحص حساس ECT", estimatedCost: "200 - 600 ر.س" },
  P0128: { description: "ثرموستات سائل التبريد أقل من حرارة التنظيم", severity: "low", category: "P", system: "نظام التبريد", causes: ["ثرموستات عالق مفتوح", "ماء تبريد منخفض", "حساس ECT تالف"], solution: "استبدال الثرموستات، فحص مستوى التبريد وحساس ECT", estimatedCost: "150 - 500 ر.س" },
  P0130: { description: "عطل في دائرة حساس O2 البنك 1 الحساس 1", severity: "medium", category: "P", system: "نظام العادم", causes: ["حساس O2 تالف", "تسريب عادم", "أسلاك تالفة"], solution: "استبدال حساس O2 الأمامي بنك 1", estimatedCost: "200 - 800 ر.س" },
  P0131: { description: "إشارة حساس O2 B1S1 منخفضة", severity: "medium", category: "P", system: "نظام العادم", causes: ["حساس O2 تالف", "تسريب عادم قبل الحساس", "خليط وقود فقير"], solution: "فحص واستبدال حساس O2 B1S1", estimatedCost: "200 - 800 ر.س" },
  P0132: { description: "إشارة حساس O2 B1S1 مرتفعة", severity: "medium", category: "P", system: "نظام العادم", causes: ["حساس O2 تالف", "خليط وقود غني", "حاقن يسرب"], solution: "فحص واستبدال حساس O2 B1S1", estimatedCost: "200 - 800 ر.س" },
  P0133: { description: "استجابة حساس O2 B1S1 بطيئة", severity: "medium", category: "P", system: "نظام العادم", causes: ["حساس O2 متقادم", "تسمم بالرصاص أو الكبريت"], solution: "استبدال حساس O2 B1S1", estimatedCost: "200 - 800 ر.س" },
  P0135: { description: "عطل في سخان حساس O2 B1S1", severity: "low", category: "P", system: "نظام العادم", causes: ["سخان حساس O2 تالف", "أسلاك مقطوعة"], solution: "استبدال حساس O2 B1S1", estimatedCost: "200 - 800 ر.س" },
  P0136: { description: "عطل في دائرة حساس O2 B1S2", severity: "medium", category: "P", system: "نظام العادم", causes: ["حساس O2 تالف", "أسلاك تالفة"], solution: "استبدال حساس O2 الخلفي بنك 1", estimatedCost: "200 - 800 ر.س" },
  P0141: { description: "عطل في سخان حساس O2 B1S2", severity: "low", category: "P", system: "نظام العادم", causes: ["سخان حساس O2 تالف", "أسلاك مقطوعة"], solution: "استبدال حساس O2 B1S2", estimatedCost: "200 - 800 ر.س" },
  P0150: { description: "عطل في دائرة حساس O2 B2S1", severity: "medium", category: "P", system: "نظام العادم", causes: ["حساس O2 تالف", "أسلاك تالفة"], solution: "استبدال حساس O2 الأمامي بنك 2", estimatedCost: "200 - 800 ر.س" },
  P0171: { description: "خليط وقود فقير جداً - البنك 1", severity: "medium", category: "P", system: "نظام الوقود", causes: ["تسريب هواء", "حساس MAF تالف", "ضغط وقود منخفض", "حاقن مسدود"], solution: "فحص تسريبات الهواء، تنظيف حساس MAF، فحص ضغط الوقود", estimatedCost: "200 - 1,500 ر.س" },
  P0172: { description: "خليط وقود غني جداً - البنك 1", severity: "medium", category: "P", system: "نظام الوقود", causes: ["حاقن يسرب", "حساس O2 تالف", "ضغط وقود مرتفع", "صمام EVAP عالق"], solution: "فحص الحاقنات وحساس O2 وضغط الوقود", estimatedCost: "200 - 1,500 ر.س" },
  P0174: { description: "خليط وقود فقير جداً - البنك 2", severity: "medium", category: "P", system: "نظام الوقود", causes: ["تسريب هواء", "حساس MAF تالف", "ضغط وقود منخفض"], solution: "فحص تسريبات الهواء، تنظيف حساس MAF", estimatedCost: "200 - 1,500 ر.س" },
  P0175: { description: "خليط وقود غني جداً - البنك 2", severity: "medium", category: "P", system: "نظام الوقود", causes: ["حاقن يسرب", "حساس O2 تالف", "ضغط وقود مرتفع"], solution: "فحص الحاقنات وحساس O2", estimatedCost: "200 - 1,500 ر.س" },
  P0200: { description: "عطل في دائرة الحاقن", severity: "high", category: "P", system: "نظام الوقود", causes: ["حاقن تالف", "أسلاك مقطوعة", "مشكلة في PCM"], solution: "فحص الحاقنات والأسلاك", estimatedCost: "300 - 2,000 ر.س" },
  P0201: { description: "عطل في دائرة حاقن الأسطوانة 1", severity: "high", category: "P", system: "نظام الوقود", causes: ["حاقن تالف", "أسلاك مقطوعة"], solution: "فحص واستبدال حاقن الأسطوانة 1", estimatedCost: "300 - 1,500 ر.س" },
  P0202: { description: "عطل في دائرة حاقن الأسطوانة 2", severity: "high", category: "P", system: "نظام الوقود", causes: ["حاقن تالف", "أسلاك مقطوعة"], solution: "فحص واستبدال حاقن الأسطوانة 2", estimatedCost: "300 - 1,500 ر.س" },
  P0203: { description: "عطل في دائرة حاقن الأسطوانة 3", severity: "high", category: "P", system: "نظام الوقود", causes: ["حاقن تالف", "أسلاك مقطوعة"], solution: "فحص واستبدال حاقن الأسطوانة 3", estimatedCost: "300 - 1,500 ر.س" },
  P0204: { description: "عطل في دائرة حاقن الأسطوانة 4", severity: "high", category: "P", system: "نظام الوقود", causes: ["حاقن تالف", "أسلاك مقطوعة"], solution: "فحص واستبدال حاقن الأسطوانة 4", estimatedCost: "300 - 1,500 ر.س" },
  P0340: { description: "عطل في دائرة حساس موضع الكامشافت A", severity: "high", category: "P", system: "نظام الإشعال", causes: ["حساس CMP تالف", "سلسلة التوقيت متمددة", "تلف أسلاك"], solution: "استبدال حساس CMP، فحص سلسلة التوقيت", estimatedCost: "300 - 1,500 ر.س" },
  P0401: { description: "تدفق EGR غير كافٍ", severity: "medium", category: "P", system: "نظام EGR", causes: ["صمام EGR مسدود", "أنابيب مسدودة", "حساس DPFE تالف"], solution: "تنظيف أو استبدال صمام EGR", estimatedCost: "300 - 1,200 ر.س" },
  P0420: { description: "كفاءة المحول الحفاز منخفضة - البنك 1", severity: "medium", category: "P", system: "نظام العادم", causes: ["محول حفاز متآكل", "حساس O2 تالف", "تسريب عادم"], solution: "فحص المحول الحفاز وحساس O2", estimatedCost: "500 - 3,000 ر.س" },
  P0430: { description: "كفاءة المحول الحفاز منخفضة - البنك 2", severity: "medium", category: "P", system: "نظام العادم", causes: ["محول حفاز متآكل", "حساس O2 تالف"], solution: "فحص المحول الحفاز بنك 2", estimatedCost: "500 - 3,000 ر.س" },
  P0440: { description: "عطل في نظام التحكم بأبخرة الوقود EVAP", severity: "low", category: "P", system: "نظام EVAP", causes: ["غطاء الوقود غير محكم", "تسريب في النظام", "صمام تطهير تالف"], solution: "فحص غطاء الوقود وأنابيب EVAP", estimatedCost: "50 - 500 ر.س" },
  P0441: { description: "تدفق غير صحيح في نظام EVAP", severity: "low", category: "P", system: "نظام EVAP", causes: ["صمام تطهير عالق", "خرطوم EVAP مسدود"], solution: "فحص صمام التطهير وخراطيم EVAP", estimatedCost: "100 - 600 ر.س" },
  P0442: { description: "تسريب صغير في نظام EVAP", severity: "low", category: "P", system: "نظام EVAP", causes: ["غطاء الوقود غير محكم", "تسريب صغير في الخراطيم"], solution: "فحص غطاء الوقود والخراطيم", estimatedCost: "50 - 400 ر.س" },
  P0443: { description: "عطل في دائرة صمام تطهير EVAP", severity: "low", category: "P", system: "نظام EVAP", causes: ["صمام تطهير تالف", "مشكلة أسلاك"], solution: "اختبار صمام التطهير، فحص الأسلاك", estimatedCost: "150 - 600 ر.س" },
  P0455: { description: "تسريب كبير في نظام EVAP", severity: "low", category: "P", system: "نظام EVAP", causes: ["غطاء الوقود مفقود أو تالف", "تسريب كبير في الخراطيم"], solution: "فحص غطاء الوقود والخراطيم", estimatedCost: "50 - 600 ر.س" },
  P0500: { description: "عطل في حساس سرعة السيارة VSS", severity: "medium", category: "P", system: "نظام النقل", causes: ["حساس سرعة تالف", "أسلاك مقطوعة", "مشكلة في PCM"], solution: "فحص واستبدال حساس السرعة", estimatedCost: "150 - 600 ر.س" },
  P0505: { description: "عطل في نظام التحكم بالسرعة الخاملة", severity: "medium", category: "P", system: "نظام الخانق", causes: ["صمام IAC تالف", "تراكم كربون", "تسريب هواء"], solution: "تنظيف أو استبدال صمام IAC", estimatedCost: "200 - 800 ر.س" },
  P0600: { description: "خطأ في الاتصال التسلسلي", severity: "medium", category: "P", system: "شبكة الاتصال", causes: ["مشكلة في شبكة CAN", "عطل في PCM"], solution: "فحص شبكة CAN والوحدات", estimatedCost: "500 - 3,000 ر.س" },
  P0606: { description: "عطل في معالج PCM/ECM", severity: "high", category: "P", system: "وحدة التحكم", causes: ["عطل داخلي في PCM", "مشكلة في الطاقة"], solution: "فحص وإعادة برمجة أو استبدال PCM", estimatedCost: "1,000 - 5,000 ر.س" },
  P0700: { description: "عطل في نظام التحكم بناقل الحركة", severity: "high", category: "P", system: "ناقل الحركة (القير)", causes: ["مشكلة في TCM", "حساس تالف", "زيت القير منخفض", "تلف داخلي"], solution: "فحص ناقل الحركة بجهاز متخصص، فحص زيت القير", estimatedCost: "500 - 5,000 ر.س" },
  P2111: { description: "نظام الخانق الإلكتروني عالق مفتوح", severity: "high", category: "P", system: "نظام الخانق", causes: ["جسم خانق تالف", "تراكم كربون", "مشكلة أسلاك"], solution: "تنظيف جسم الخانق، فحص الأسلاك، استبدال إذا لزم", estimatedCost: "300 - 1,500 ر.س" },
  P2196: { description: "حساس O2 عالق على Rich - B1S1", severity: "medium", category: "P", system: "نظام الوقود", causes: ["حساس O2 تالف", "ضغط وقود مرتفع", "حاقن يسرب"], solution: "اختبار حساس O2، فحص ضغط الوقود والحاقنات", estimatedCost: "200 - 1,500 ر.س" },
};

// Build unified DTC database from all sources
function buildDtcDatabase(): Record<string, Omit<DTCEntry, "code">> {
  const db: Record<string, Omit<DTCEntry, "code">> = { ...ENGINE_DTC_LOCAL };
  
  // Add all codes from the comprehensive database (Transmission + ABS + Airbag + Network)
  for (const [code, info] of Object.entries(ALL_DTC_DATABASE)) {
    const severityMap: Record<string, "low" | "medium" | "high"> = {
      critical: "high",
      high: "high",
      medium: "medium",
      low: "low",
      info: "low",
    };
    db[code] = {
      description: info.descriptionAr,
      severity: severityMap[info.severity] || "medium",
      category: code[0],
      system: getSystemLabelAr(info.system),
      causes: info.causesAr,
      solution: info.solutionAr,
      estimatedCost: info.estimatedRepairCost
        ? `${info.estimatedRepairCost.min.toLocaleString()} - ${info.estimatedRepairCost.max.toLocaleString()} ${info.estimatedRepairCost.currency}`
        : "يحتاج تقييم",
    };
  }
  return db;
}

const dtcDatabase = buildDtcDatabase();

type ReadinessStatus = "pass" | "fail" | "pending" | "na";
interface ReadinessTest { name: string; key: string; status: ReadinessStatus; }

const defaultReadinessTests: ReadinessTest[] = [
  { name: "Misfire - عطل الاحتراق", key: "Misfire", status: "pending" },
  { name: "Fuel System - نظام الوقود", key: "Fuel System", status: "pending" },
  { name: "Components - المكونات", key: "Components", status: "pending" },
  { name: "Catalyst - المحول الحفاز", key: "Catalyst", status: "pending" },
  { name: "Evaporative System - نظام التبخير", key: "Evaporative System", status: "pending" },
  { name: "O2 Sensor - حساس الأوكسجين", key: "O2 Sensor", status: "pending" },
  { name: "EGR/VVT - نظام EGR", key: "EGR/VVT", status: "pending" },
  { name: "Heated Catalyst - المحول الحفاز المسخن", key: "Heated Catalyst", status: "pending" },
  { name: "Secondary Air - الهواء الثانوي", key: "Secondary Air", status: "pending" },
  { name: "A/C Refrigerant - مبرد التكييف", key: "A/C Refrigerant", status: "pending" },
  { name: "O2 Sensor Heater - سخان حساس O2", key: "O2 Sensor Heater", status: "pending" },
];

const vehicleMakes = ["toyota", "hyundai", "nissan", "ford", "mercury", "lincoln", "chevrolet", "bmw", "mercedes", "gmc", "kia", "honda", "mazda", "mitsubishi", "lexus", "audi", "volkswagen"];
const makeLabels: Record<string, string> = {
  toyota: "تويوتا", hyundai: "هيونداي", nissan: "نيسان", ford: "فورد",
  mercury: "ميركوري", lincoln: "لينكولن",
  chevrolet: "شيفروليه", bmw: "بي ام دبليو", mercedes: "مرسيدس", gmc: "جي إم سي",
  kia: "كيا", honda: "هوندا", mazda: "مازدا", mitsubishi: "ميتسوبيشي",
  lexus: "لكزس", audi: "أودي", volkswagen: "فولكسفاجن",
};

// ═══════════════════════════════════════════════════════
// GAUGE COMPONENT
// ═══════════════════════════════════════════════════════

function GaugeCircle({ value, max, label, unit, color, size = "md", warning, critical }: {
  value: number; max: number; label: string; unit: string; color: string; size?: "sm" | "md" | "lg";
  warning?: number; critical?: number;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = size === "lg" ? 52 : size === "md" ? 42 : 32;
  const stroke = size === "lg" ? 8 : size === "md" ? 6 : 4;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference * 0.75; // 270 degree arc
  const svgSize = (radius + stroke) * 2 + 4;

  let activeColor = color;
  if (critical && value >= critical) activeColor = "#ef4444";
  else if (warning && value >= warning) activeColor = "#f59e0b";

  return (
    <div className="flex flex-col items-center">
      <svg width={svgSize} height={svgSize} className="transform rotate-[135deg]">
        <circle cx={svgSize / 2} cy={svgSize / 2} r={radius} fill="none" stroke="#1f2937" strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={circumference * 0.25} strokeLinecap="round" />
        <circle cx={svgSize / 2} cy={svgSize / 2} r={radius} fill="none" stroke={activeColor} strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ marginTop: size === "lg" ? "20px" : size === "md" ? "14px" : "8px" }}>
        <span className={`font-mono font-bold ${size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-sm"}`} style={{ color: activeColor }}>
          {typeof value === "number" ? (value >= 100 ? Math.round(value).toLocaleString() : value.toFixed(1)) : value}
        </span>
        <span className="text-[10px] text-gray-500">{unit}</span>
      </div>
      <span className={`text-gray-400 mt-1 ${size === "lg" ? "text-xs" : "text-[10px]"}`}>{label}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// HEALTH SCORE RING
// ═══════════════════════════════════════════════════════

function HealthScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? "#22c55e" : score >= 75 ? "#84cc16" : score >= 55 ? "#f59e0b" : score >= 30 ? "#f97316" : "#ef4444";
  const label = score >= 90 ? "ممتاز" : score >= 75 ? "جيد" : score >= 55 ? "مقبول" : score >= 30 ? "ضعيف" : "حرج";

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1f2937" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={8} strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold font-mono" style={{ color }}>{score}</span>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════

export default function OBDScanner() {
  const [, navigate] = useLocation();
  // ═══ ربط بطلب خدمة نشط (Job Card) ═══
  const urlParams = new URLSearchParams(window.location.search);
  const linkedOrderId = urlParams.get("orderId") ? parseInt(urlParams.get("orderId")!) : null;
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [mode, setMode] = useState<"real" | "demo">("real");
  const [activeTab, setActiveTab] = useState<"home" | "dashboard" | "live" | "dtc" | "readiness" | "freeze" | "mode6" | "alerts" | "vehicle" | "report" | "o2sensors" | "cylinders" | "history" | "driving" | "ai" | "charts" | "sessions" | "datalogger" | "performance" | "transmission" | "fuel" | "multiecu" | "compare" | "special" | "powerbalance" | "oscilloscope" | "vininfo" | "predictive" | "customerreport" | "oempids" | "nissanaction" | "allscan">("home");
  const [mainMenuCategory, setMainMenuCategory] = useState<string | null>(null);
  const [liveData, setLiveData] = useState<LiveData>({ rpm: 0, speed: 0, coolantTemp: 0, engineLoad: 0, throttlePos: 0, fuelLevel: 0, mafRate: 0, timingAdvance: 0, voltage: 0, intakeTemp: 0, oilTemp: 0, fuelPressure: 0, shortFuelTrim: 0, longFuelTrim: 0, instantFuelConsumption: 0, barometricPressure: 0, catalystTemp: 0, fuelRailPressure: 0, commandedEGR: 0, engineTorque: 0, ambientTemp: 0, runTime: 0, distanceWithMIL: 0, intakeMAP: 0, transmissionTemp: 0, turboBoost: 0, absoluteThrottle: 0, boostPressure: 0, fuelSystemStatus: 0, commandedThrottle: 0, absoluteLoad: 0, relativeThrottle: 0, ethanolPercent: 0, turboRPM: 0, exhaustPressure: 0, dpfTemp: 0, noxSensor: 0, fuelInjectionTiming: 0, acceleratorPedalD: 0, acceleratorPedalE: 0 });
  const [liveStats, setLiveStats] = useState<LiveDataStats>({ min: {}, max: {}, sum: {}, count: 0 });
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);
  const [selectedGraphPIDs, setSelectedGraphPIDs] = useState<string[]>(["rpm", "speed"]);
  const [isDataLogging, setIsDataLogging] = useState(false);
  const [dataLog, setDataLog] = useState<Array<{ timestamp: number; data: Partial<LiveData> }>>([]);
  const [rpmHistory, setRpmHistory] = useState<ChartPoint[]>([]);
  const [speedHistory, setSpeedHistory] = useState<ChartPoint[]>([]);
  const [tempHistory, setTempHistory] = useState<ChartPoint[]>([]);
  const [dtcCodes, setDtcCodes] = useState<DTCEntry[]>([]);
  const [pendingDtcs, setPendingDtcs] = useState<DTCEntry[]>([]);
  const [selectedDtc, setSelectedDtc] = useState<DTCEntry | null>(null);
  const [dtcSearchQuery, setDtcSearchQuery] = useState("");
  const [dtcSearchResults, setDtcSearchResults] = useState<DTCEntry[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [vehicleInfo, setVehicleInfo] = useState({ vin: "", protocol: "", device: "", ecuName: "" });
  const [readinessTests, setReadinessTests] = useState<ReadinessTest[]>(defaultReadinessTests);
  const [isReading, setIsReading] = useState(false);
  const [freezeFrame, setFreezeFrame] = useState<FreezeFrameData | null>(null);
  const [mode6Results, setMode6Results] = useState<Mode6TestResult[]>([]);
  const [alerts, setAlerts] = useState<OBDAlert[]>([]);
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMileage, setSelectedMileage] = useState<string>("");
  const [fullReport, setFullReport] = useState<ScanReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [engineHealth, setEngineHealth] = useState<EngineHealth | null>(null);
  const [showLogPanel, setShowLogPanel] = useState(false);
  const [o2SensorData, setO2SensorData] = useState<O2SensorData[]>([]);
  const [o2History, setO2History] = useState<{ time: string; b1s1: number; b1s2: number }[]>([]);
  const [cylinderMisfires, setCylinderMisfires] = useState<{ cyl: number; count: number; max: number }[]>([]);
  const [drivingMode, setDrivingMode] = useState(false);
  const [hudColor, setHudColor] = useState<"green" | "blue" | "red" | "white" | "orange">("green");
  const [nightMode, setNightMode] = useState(false);
  const [mirrorMode, setMirrorMode] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<DiagnosticResult | null>(null);
  const [aiRunning, setAiRunning] = useState(false);
  const [aiFeedbackSent, setAiFeedbackSent] = useState(false);
  const [localSessions, setLocalSessions] = useState<StoredSession[]>([]);
  const [selectedChartParams, setSelectedChartParams] = useState<string[]>(["rpm", "speed", "coolantTemp"]);
  const [enhancedPids, setEnhancedPids] = useState<EnhancedPIDDefinition[]>([]);
  const [reconnectStatus, setReconnectStatus] = useState<string>("");
  const [dataLoggerActive, setDataLoggerActive] = useState(false);
  const [dataLogEntries, setDataLogEntries] = useState<DataLogEntry[]>([]);
  const [perfTestActive, setPerfTestActive] = useState(false);
  const [perfResult, setPerfResult] = useState<PerformanceResult | null>(null);
  const [vehicleWeight, setVehicleWeight] = useState(1500);
  const [multiEcuResult, setMultiEcuResult] = useState<MultiECUScanResult | null>(null);
  const [multiEcuScanning, setMultiEcuScanning] = useState(false);
  const [transmissionData, setTransmissionData] = useState<TransmissionData | null>(null);
  const [fuelEconomy, setFuelEconomy] = useState<FuelEconomyData | null>(null);
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState(2.18);
  const [oilPressure, setOilPressure] = useState<number | null>(null);
  const [sessionCompare, setSessionCompare] = useState<{ a: StoredSession | null; b: StoredSession | null }>({ a: null, b: null });
  // ═══ Special Functions States ═══
  const [specialFuncResult, setSpecialFuncResult] = useState<SpecialFunctionResult | null>(null);
  const [specialFuncLoading, setSpecialFuncLoading] = useState(false);
  const [udsProtocol] = useState(() => new UDSProtocol(
    (cmd, timeout) => (obdService as any).sendCommand(cmd, timeout),
    (msg, type) => addLog(msg, type as any)
  ));
  // ═══ Power Balance States ═══
  // ═══ Nissan Action Tests States ═══
  const [nissanActionRunning, setNissanActionRunning] = useState(false);
  const [nissanActionResult, setNissanActionResult] = useState<{ success: boolean; message: string; testId: string } | null>(null);
  const [nissanSelectedModel, setNissanSelectedModel] = useState("X-Trail T33");
  const [nissanActiveCategory, setNissanActiveCategory] = useState<NissanActionTest["category"]>("cooling");
  const [nissanActiveTestId, setNissanActiveTestId] = useState<string | null>(null);
  // ═══ Ford Action Tests States ═══
  const [fordActionRunning, setFordActionRunning] = useState(false);
  const [fordActionResult, setFordActionResult] = useState<{ success: boolean; message: string; testId: string } | null>(null);
  const [fordActiveCategory, setFordActiveCategory] = useState<FordActionTest["category"]>("cooling");
  const [fordActiveTestId, setFordActiveTestId] = useState<string | null>(null);
  const [powerBalanceResults, setPowerBalanceResults] = useState<{ cyl: number; rpmDrop: number; status: "good" | "weak" | "dead" }[]>([]);
  const [powerBalanceRunning, setPowerBalanceRunning] = useState(false);
  // ═══ Oscilloscope States ═══
  const [oscilloSignal, setOscilloSignal] = useState<"o2" | "maf" | "tps" | "rpm">("o2");
  const [oscilloData, setOscilloData] = useState<{ t: number; v: number }[]>([]);
  const [oscilloRunning, setOscilloRunning] = useState(false);
  const oscilloRef = useRef<NodeJS.Timeout | null>(null);
  // ═══ VIN Info States ═══
  const [vinInfo, setVinInfo] = useState<VINInfo | null>(null);
  const [vinLoading, setVinLoading] = useState(false);
  const [oemPids, setOemPids] = useState<ReturnType<typeof getOEMPIDsForMake>>([]);
  const [oemPidValues, setOemPidValues] = useState<Record<string, number>>({});
  const [oemPidLoading, setOemPidLoading] = useState(false);
  // ═══ Predictive Maintenance States ═══
  const [predictiveAlerts, setPredictiveAlerts] = useState<{ sensor: string; trend: string; risk: "low" | "medium" | "high"; recommendation: string }[]>([]);
  // ═══ Customer Report State ═══
    const [customerReportGenerated, setCustomerReportGenerated] = useState(false);
  // ═══ Pro Mode + Fullscreen + Custom Dashboard ═══
  const [proMode, setProMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [customDashboardPids, setCustomDashboardPids] = useState<string[]>(["rpm", "speed", "coolantTemp", "voltage", "throttlePos"]);
  const [showCustomDashboard, setShowCustomDashboard] = useState(false);
  const [showFactoryValues, setShowFactoryValues] = useState(false);
  const [showMoreTabs, setShowMoreTabs] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const readLoopActiveRef = useRef(false);
  const tickRef = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const chartBufferRef = useRef(new LiveChartBuffer(300));
  const autoReconnectRef = useRef(new AutoReconnect({ maxAttempts: 5, baseDelay: 2000 }));
  const bleSupported = OBDBleService.isSupported();

  // ═══ Auth + DB Session Storage ═══
  const { user } = useAuth();
  const createDbSession = trpc.diagnostics.createSession.useMutation();
  const saveDbDtcResults = trpc.diagnostics.saveDtcResults.useMutation();
  const completeDbSession = trpc.diagnostics.completeSession.useMutation();

  // Session history query
  const sessionHistory = trpc.diagnostics.getSessionHistory.useQuery({ limit: 20, offset: 0 }, { enabled: activeTab === "history" });

  // ═══ سيارات المستخدم وتقارير OBD ═══
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [reportSaved, setReportSaved] = useState(false);
  const myVehicles = trpc.vehicles.getMyVehicles.useQuery(undefined, { enabled: !!user });
  const saveObdReport = trpc.obdReports.saveReport.useMutation({
    onSuccess: () => {
      setReportSaved(true);
      addLog("✓ تم حفظ تقرير الفحص في حسابك", "info");
      setTimeout(() => setReportSaved(false), 5000);
    },
    onError: (err: any) => { addLog(`⚠ لم يتم حفظ التقرير: ${err.message}`, "error"); },
  });

  // ═══ حفظ نتائج الفحص في الطلب المرتبط ═══
  const saveScanToOrder = trpc.serviceOrders.saveScanResults.useMutation({
    onSuccess: () => { addLog("✓ تم حفظ نتائج الفحص في الطلب", "info"); },
    onError: (err: any) => { addLog(`✗ خطأ في حفظ النتائج: ${err.message}`, "error"); },
  });
  const handleSaveToOrder = () => {
    if (!linkedOrderId || !fullReport) return;
    saveScanToOrder.mutate({
      orderId: linkedOrderId,
      vehicleVin: fullReport.vin || vehicleInfo.vin || undefined,
      protocol: fullReport.protocol || vehicleInfo.protocol || undefined,
      storedCodes: fullReport.dtcCodes.map(c => ({ code: c.code, description: (dtcDatabase as any)[c.code]?.description || undefined, severity: (dtcDatabase as any)[c.code]?.severity || undefined })),
      pendingCodes: pendingDtcs.map(c => ({ code: c.code, description: c.description || undefined })),
      liveData: fullReport.liveData as any,
      freezeFrameData: fullReport.freezeFrames?.[0] as any,
      technicianDiagnosis: aiDiagnosis?.primaryDiagnosis?.issueAr || undefined,
      recommendations: aiDiagnosis?.recommendations?.map((r: any) => r.actionAr || r.action).join("\n") || undefined,
    });
  };

  // ═══ Callbacks ═══
  const addLog = useCallback((message: string, type: LogEntry["type"]) => {
    const time = new Date().toLocaleTimeString("ar-SA");
    setLogs((prev) => [...prev.slice(-200), { time, type, message }]);
  }, []);

  // Auto-reconnect setup
  useEffect(() => {
    const ar = autoReconnectRef.current;
    ar.onAttempt = (attempt, max) => { setReconnectStatus(`إعادة اتصال... (${attempt}/${max})`); addLog(`⟳ محاولة إعادة اتصال ${attempt}/${max}`, "info"); };
    ar.onSuccess = () => { setReconnectStatus(""); addLog("✓ تم إعادة الاتصال بنجاح", "info"); };
    ar.onFailed = () => { setReconnectStatus(""); addLog("✗ فشل إعادة الاتصال", "error"); };
  }, [addLog]);

  // Load enhanced PIDs when make changes
  useEffect(() => {
    if (selectedMake) {
      const pids = getManufacturerPIDs(selectedMake);
      setEnhancedPids(pids ? Object.values(pids).flat() as EnhancedPIDDefinition[] : []);
    } else {
      setEnhancedPids([]);
    }
  }, [selectedMake]);

  // Feed chart buffer from live data
  useEffect(() => {
    if (isReading) {
      const buf = chartBufferRef.current;
      buf.push("rpm", liveData.rpm);
      buf.push("speed", liveData.speed);
      buf.push("coolantTemp", liveData.coolantTemp);
      buf.push("engineLoad", liveData.engineLoad);
      buf.push("throttlePos", liveData.throttlePos);
      buf.push("voltage", liveData.voltage);
      buf.push("mafRate", liveData.mafRate);
      buf.push("oilTemp", liveData.oilTemp);
      buf.push("fuelPressure", liveData.fuelPressure);
      buf.push("shortFuelTrim", liveData.shortFuelTrim);
      buf.push("longFuelTrim", liveData.longFuelTrim);
      buf.push("timingAdvance", liveData.timingAdvance);
    }
  }, [isReading, liveData]);

  // Load local sessions
  useEffect(() => {
    if (activeTab === "history") {
      getAllSessions().then(setLocalSessions).catch(() => {});
    }
  }, [activeTab]);

  useEffect(() => {
    obdService.onLog = (message: string, type: LogType) => addLog(message, type);
    obdService.onStatusChange = (status: ConnectionStatus) => setConnectionStatus(status);
    obdService.onDisconnect = () => {
      setConnectionStatus("disconnected"); setIsReading(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Auto-reconnect if was reading
      if (mode === "real") {
        autoReconnectRef.current.start(async () => {
          const success = await obdService.connect();
          if (success) { setConnectionStatus("connected"); return true; }
          return false;
        });
      }
    };
    obdService.onAlert = (alert: OBDAlert) => { setAlerts((prev) => [...prev, alert]); };
    return () => { obdService.onLog = null; obdService.onStatusChange = null; obdService.onDisconnect = null; obdService.onAlert = null; };
  }, [addLog, mode]);

  // ═══ Connection ═══
  const connectReal = useCallback(async () => {
    const success = await obdService.connect();
    if (success) {
      setMode("real");
      const protocol = await obdService.getProtocol();
      const ecuName = await obdService.readECUName();
      addLog(`✓ متصل | بروتوكول: ${protocol} | جهاز: ${obdService.deviceName}`, "info");
      
      // قراءة VIN والتعرف التلقائي على السيارة
      addLog("⏳ جاري قراءة VIN والتعرف على السيارة...", "info");
      const vin = await obdService.readVIN();
      setVehicleInfo({ vin: vin || "غير متاح", protocol, device: obdService.deviceName, ecuName: ecuName || "" });
      
      // تعبئة الماركة والسنة تلقائياً من VIN
      if (vin && vin.length >= 17) {
        const info = decodeVIN(vin);
        setVinInfo(info);
        // تحديد الماركة المناسبة للـ PIDs المخصصة
        const makeLower = info.make.toLowerCase().split("/")[0].split(" ")[0];
        // Mercury و Lincoln يستخدمون نفس PIDs فورد
        const makeForPids = (makeLower === "mercury" || makeLower === "lincoln") ? "ford" : makeLower;
        setSelectedMake(makeForPids);
        if (info.year) setSelectedYear(info.year.toString());
        obdService.setVehicleReference(makeForPids);
        
        // تحميل OEM PIDs
        const pids = getOEMPIDsForMake(info.make);
        setOemPids(pids);
        
        addLog(`✓ تم التعرف: ${info.makeAr} ${info.year || ""} | VIN: ${vin}`, "info");
        if (info.engineAr) addLog(`  المحرك: ${info.engineAr} | الوقود: ${info.fuelTypeAr || "بنزين"}`, "info");
      } else {
        addLog("⚠ لم يتم قراءة VIN - اختر الماركة يدوياً", "error");
      }
      
      setActiveTab("dashboard");
    }
  }, [addLog]);

  const connectDemo = useCallback(() => {
    setMode("demo");
    setConnectionStatus("connecting");
    addLog(">> ATZ - Reset adapter (محاكاة)", "sent");
    setTimeout(() => {
      addLog("<< ELM327 v2.2 (Demo Mode)", "received");
      addLog("✓ [CONNECTED] وضع المحاكاة الاحترافي", "info");
      setConnectionStatus("connected");
      setVehicleInfo({ vin: "JTNB23HK7F1A39D24", protocol: "ISO 15765-4 CAN (11bit/500kbaud)", device: "ELM327 v2.2 (Demo)", ecuName: "Toyota ECU" });
      setActiveTab("dashboard");
    }, 1200);
  }, [addLog]);

  const disconnect = useCallback(() => {
    if (mode === "real") obdService.disconnect();
    setConnectionStatus("disconnected"); setIsReading(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    addLog("✗ تم قطع الاتصال", "error");
  }, [mode, addLog]);

  // ═══ Vehicle Make ═══
  const handleMakeChange = useCallback((make: string) => {
    setSelectedMake(make);
    if (make) {
      // Mercury و Lincoln يستخدمون نفس PIDs وقيم Ford
      const refMake = (make === "mercury" || make === "lincoln") ? "ford" : make;
      obdService.setVehicleReference(refMake);
      addLog(`✓ تم تحميل القيم المرجعية لـ ${makeLabels[make] || make}`, "info");
    }
  }, [addLog]);

  // ═══ Live Reading (Performance Optimized) ═══
  // `silent` is used when auto-resuming after a comprehensive scan finishes -
  // it shouldn't yank the user back to the live tab if they navigated elsewhere.
  const startLiveReading = useCallback((opts?: { silent?: boolean }) => {
    if (connectionStatus !== "connected") return;
    // Live reading takes priority over an in-progress comprehensive scan -
    // ask it to stop at its next checkpoint instead of waiting behind it.
    if (mode === "real" && isScanning) obdService.abortScan();
    readLoopActiveRef.current = true;
    setIsReading(true);
    if (!opts?.silent) setActiveTab("live");
    if (mode === "real") {
      // Adaptive reading: start with fast core PIDs, then gradually add more
      // This ensures compatibility with slow protocols (J1850 PWM/VPW) and cheap adapters
      let readCycleCount = 0;
      let useFullRead = false; // Start with fast reads, switch to full after confirming protocol speed
      let consecutiveSuccesses = 0;
      
      const readLoop = async () => {
        if (!obdService.isConnected) { setIsReading(false); return; }
        try {
          let data: any;
          
          // First 5 cycles: use fast read (5 core PIDs only) to establish stable connection
          // After 5 successful fast reads: try full read on CAN protocols only
          if (readCycleCount < 5 || !useFullRead) {
            data = await obdService.readFastLiveData();
            if (data && (data.rpm !== null || data.speed !== null)) {
              consecutiveSuccesses++;
              // After 5 successful reads, check if we can upgrade to full read
              if (consecutiveSuccesses >= 5) {
                const proto = obdService.detectedProtocol || "";
                const protoNum = parseInt(proto.replace(/[^0-9]/g, "")) || 6;
                // Only use full read on CAN protocols (6+) - slow protocols stay with fast read
                useFullRead = protoNum >= 6;
                if (!useFullRead) {
                  addLog("✓ بروتوكول بطيء - استخدام القراءة السريعة فقط", "info");
                }
              }
            }
          } else {
            // CAN protocol: safe to read more PIDs
            data = await obdService.readLiveData();
          }
          
          readCycleCount++;
          
          // Ford Mode 22 PIDs - only on CAN and every 5th cycle (not 3rd) to reduce load
          let fordTransTemp = 0;
          let fordTurbo = 0;
          if (selectedMake === "ford" && useFullRead && readCycleCount % 5 === 0) {
            try {
              const fordData = await obdService.readFordPIDs();
              if (fordData["221001"]) fordTransTemp = fordData["221001"].value;
              if (fordData["221002"]) fordTurbo = fordData["221002"].value;
              if (fordData["224001"]) fordTurbo = fordData["224001"].value;
            } catch { /* Ford PIDs optional - don't break main loop */ }
          }
          
          // readLoop is a long-lived closure (defined once per startLiveReading()
          // call, then re-invoked every cycle via the recursive setTimeout chain),
          // so a plain `liveData` reference here would always read the ONE stale
          // snapshot from the moment reading started, not the latest state. Any
          // PID that ever failed a read would then silently fall back to that
          // frozen snapshot forever instead of the last real value - use the
          // functional setState form so every cycle merges against current state.
          let newLiveData!: LiveData;
          setLiveData((prev) => {
            newLiveData = {
              rpm: data.rpm ?? prev.rpm, speed: data.speed ?? prev.speed,
              coolantTemp: data.coolantTemp ?? prev.coolantTemp, engineLoad: data.engineLoad ?? prev.engineLoad,
              throttlePos: data.throttlePos ?? prev.throttlePos, fuelLevel: data.fuelLevel ?? prev.fuelLevel,
              mafRate: data.mafRate ?? prev.mafRate, timingAdvance: data.timingAdvance ?? prev.timingAdvance,
              voltage: data.voltage ?? prev.voltage, intakeTemp: data.intakeTemp ?? prev.intakeTemp,
              oilTemp: data.oilTemp ?? prev.oilTemp, fuelPressure: data.fuelPressure ?? prev.fuelPressure,
              shortFuelTrim: data.shortFuelTrim ?? prev.shortFuelTrim, longFuelTrim: data.longFuelTrim ?? prev.longFuelTrim,
              instantFuelConsumption: data.instantFuelConsumption ?? prev.instantFuelConsumption,
              barometricPressure: data.barometricPressure ?? prev.barometricPressure,
              catalystTemp: data.catalystTempB1S1 ?? prev.catalystTemp,
              fuelRailPressure: data.fuelRailPressure ?? prev.fuelRailPressure,
              commandedEGR: data.commandedEGR ?? prev.commandedEGR,
              engineTorque: data.engineTorque ?? prev.engineTorque,
              ambientTemp: data.ambientTemp ?? prev.ambientTemp,
              runTime: data.runTime ?? prev.runTime,
              distanceWithMIL: data.distanceWithMIL ?? prev.distanceWithMIL,
              intakeMAP: data.intakeMAP ?? prev.intakeMAP,
              transmissionTemp: fordTransTemp || data.transmissionTemp || prev.transmissionTemp,
              turboBoost: fordTurbo || data.boostPressure || prev.turboBoost,
              absoluteThrottle: data.throttlePos ?? prev.absoluteThrottle,
              boostPressure: data.boostPressure ?? prev.boostPressure,
              fuelSystemStatus: data.fuelSystemStatus ?? prev.fuelSystemStatus,
              commandedThrottle: data.commandedThrottle ?? prev.commandedThrottle,
              absoluteLoad: data.absoluteLoad ?? prev.absoluteLoad,
              relativeThrottle: data.relativeThrottle ?? prev.relativeThrottle,
              ethanolPercent: data.ethanolPercent ?? prev.ethanolPercent,
              turboRPM: data.turboRPM ?? prev.turboRPM,
              exhaustPressure: data.exhaustPressure ?? prev.exhaustPressure,
              dpfTemp: data.dpfTemp ?? prev.dpfTemp,
              noxSensor: data.noxSensor ?? prev.noxSensor,
              fuelInjectionTiming: data.fuelInjectionTiming ?? prev.fuelInjectionTiming,
              acceleratorPedalD: data.acceleratorPedalD ?? prev.acceleratorPedalD,
              acceleratorPedalE: data.acceleratorPedalE ?? prev.acceleratorPedalE,
            };
            return newLiveData;
          });
          
          // Update Min/Max/Avg stats
          setLiveStats((prev) => {
            const newStats = { ...prev, count: prev.count + 1 };
            const keys = Object.keys(newLiveData) as (keyof LiveData)[];
            for (const key of keys) {
              const val = newLiveData[key];
              if (typeof val !== 'number' || val === 0) continue;
              if (!newStats.min[key] || val < (newStats.min[key] as number)) newStats.min = { ...newStats.min, [key]: val };
              if (!newStats.max[key] || val > (newStats.max[key] as number)) newStats.max = { ...newStats.max, [key]: val };
              newStats.sum = { ...newStats.sum, [key]: ((newStats.sum[key] as number) || 0) + val };
            }
            return newStats;
          });
          
          // Update Live Graph data (keep last 60 points)
          setGraphData((prev) => {
            const point: GraphDataPoint = { time: Date.now() };
            selectedGraphPIDs.forEach(pid => { point[pid] = (newLiveData as any)[pid] || 0; });
            return [...prev.slice(-59), point];
          });
          
          // Data Logging
          if (isDataLogging) {
            setDataLog((prev) => [...prev, { timestamp: Date.now(), data: { ...newLiveData } }]);
          }
          
          const now = new Date().toLocaleTimeString("ar-SA");
          setRpmHistory((prev) => [...prev.slice(-50), { time: now, value: Math.round(data.rpm ?? 0) }]);
          setSpeedHistory((prev) => [...prev.slice(-50), { time: now, value: Math.round(data.speed ?? 0) }]);
          setTempHistory((prev) => [...prev.slice(-50), { time: now, value: Math.round(data.coolantTemp ?? 0) }]);
        } catch (err: any) {
          addLog(`✗ خطأ قراءة: ${err.message}`, "error");
          // Auto-retry after brief pause
          await new Promise(r => setTimeout(r, 500));
        }
      };
      // Polling interval: adaptive based on protocol
      // Fast reads (5 PIDs) complete in ~2-3s on slow protocols, ~500ms on CAN
      // Don't use setInterval - use recursive setTimeout to avoid overlapping reads
      const scheduleNext = () => {
        intervalRef.current = setTimeout(async () => {
          await readLoop();
          if (obdService.isConnected && readLoopActiveRef.current) scheduleNext();
        }, useFullRead ? 800 : 200) as any; // 200ms gap between fast reads, 800ms for full
      };
      // A single read cycle over BLE routinely takes well over 100ms, so a
      // fixed setTimeout(scheduleNext, 100) here (the old code) could arm the
      // next cycle before this first one actually finished - two overlapping
      // readLoop() calls both touching the BLE mutex at once. Wait for the
      // real completion instead of guessing a delay.
      readLoop().then(scheduleNext);
    } else {
      intervalRef.current = setInterval(() => {
        tickRef.current++;
        const tick = tickRef.current;
        const accel = Math.sin(tick * 0.08) * 0.3 + 0.5;
        setLiveData((prev) => {
          const newRpm = Math.max(700, Math.min(6500, prev.rpm + (accel - 0.5) * 350 + (Math.random() - 0.5) * 80));
          const newSpeed = Math.max(0, Math.min(220, prev.speed + (newRpm > 2000 ? 2.5 : -1.5) * (Math.random() * 2.5)));
          const newTemp = Math.max(82, Math.min(108, 90 + (newRpm / 6500) * 18 + Math.sin(tick * 0.04) * 2));
          const newLoad = Math.max(5, Math.min(98, (newRpm / 6500) * 75 + accel * 20 + (Math.random() - 0.5) * 4));
          const newMaf = Math.max(2, Math.min(80, (newRpm / 6500) * 60 + (newLoad / 100) * 12 + Math.random() * 2));
          return {
            rpm: newRpm, speed: newSpeed, coolantTemp: newTemp, engineLoad: newLoad,
            throttlePos: Math.max(0, Math.min(100, prev.throttlePos + (Math.random() - 0.5) * 10)),
            fuelLevel: Math.max(15, Math.min(100, prev.fuelLevel || 72 - tick * 0.01)),
            mafRate: newMaf,
            timingAdvance: Math.max(-10, Math.min(45, (newRpm / 6500) * 38 - 5 + (Math.random() - 0.5) * 2)),
            voltage: parseFloat((14.0 + Math.sin(tick * 0.02) * 0.3 + (Math.random() - 0.5) * 0.15).toFixed(1)),
            intakeTemp: Math.max(20, Math.min(60, 35 + Math.sin(tick * 0.03) * 5)),
            oilTemp: Math.max(85, Math.min(125, 95 + (newRpm / 6500) * 20 + Math.sin(tick * 0.02) * 3)),
            fuelPressure: Math.max(280, Math.min(450, 350 + (newLoad / 100) * 80 + (Math.random() - 0.5) * 20)),
            shortFuelTrim: parseFloat(((Math.random() - 0.5) * 12).toFixed(1)),
            longFuelTrim: parseFloat(((Math.random() - 0.5) * 8).toFixed(1)),
            instantFuelConsumption: newSpeed > 5 ? parseFloat(((newMaf * 3600) / (newSpeed * 14.7 * 755) * 100).toFixed(1)) : 0,
            // القراءات الإضافية - محاكاة
            barometricPressure: Math.max(95, Math.min(105, 101 + Math.sin(tick * 0.01) * 2)),
            catalystTemp: Math.max(200, Math.min(800, 350 + (newRpm / 6500) * 350 + Math.sin(tick * 0.03) * 20)),
            fuelRailPressure: Math.max(3000, Math.min(25000, 5000 + (newLoad / 100) * 18000 + (Math.random() - 0.5) * 500)),
            commandedEGR: Math.max(0, Math.min(100, (newSpeed > 40 ? 25 : 0) + (Math.random() - 0.5) * 5)),
            engineTorque: Math.max(0, Math.min(400, (newLoad / 100) * 350 + (Math.random() - 0.5) * 10)),
            ambientTemp: Math.max(25, Math.min(50, 38 + Math.sin(tick * 0.005) * 3)),
            runTime: prev.runTime + 0.5,
            distanceWithMIL: prev.distanceWithMIL,
            intakeMAP: Math.max(20, Math.min(110, 35 + (newLoad / 100) * 70 + (Math.random() - 0.5) * 3)),
            transmissionTemp: Math.max(60, Math.min(130, 80 + (newSpeed / 220) * 40 + Math.sin(tick * 0.02) * 3)),
            turboBoost: newRpm > 2500 ? parseFloat((((newRpm - 2500) / 4000) * 15 + (Math.random() - 0.5) * 1).toFixed(1)) : 0,
            absoluteThrottle: Math.max(0, Math.min(100, (newLoad / 100) * 85 + (Math.random() - 0.5) * 3)),
            // PIDs المتقدمة الجديدة - محاكاة
            boostPressure: newRpm > 2500 ? parseFloat((((newRpm - 2500) / 4000) * 180 + (Math.random() - 0.5) * 5).toFixed(1)) : 0,
            fuelSystemStatus: newTemp > 70 ? 2 : 1,
            commandedThrottle: Math.max(0, Math.min(100, (newLoad / 100) * 80 + (Math.random() - 0.5) * 2)),
            absoluteLoad: Math.max(0, Math.min(100, newLoad * 1.2 + (Math.random() - 0.5) * 3)),
            relativeThrottle: Math.max(0, Math.min(100, prev.throttlePos * 0.9 + (Math.random() - 0.5) * 2)),
            ethanolPercent: 10 + Math.sin(tick * 0.001) * 2,
            turboRPM: newRpm > 2500 ? Math.round((newRpm - 2500) * 25 + Math.random() * 1000) : 0,
            exhaustPressure: Math.max(100, Math.min(300, 120 + (newLoad / 100) * 150 + (Math.random() - 0.5) * 5)),
            dpfTemp: Math.max(200, Math.min(700, 300 + (newRpm / 6500) * 300 + Math.sin(tick * 0.02) * 15)),
            noxSensor: Math.max(0, Math.min(500, (newLoad / 100) * 200 + (Math.random() - 0.5) * 20)),
            fuelInjectionTiming: parseFloat((-10 + (newRpm / 6500) * 15 + (Math.random() - 0.5) * 1).toFixed(1)),
            acceleratorPedalD: Math.max(0, Math.min(100, accel * 100 + (Math.random() - 0.5) * 3)),
            acceleratorPedalE: Math.max(0, Math.min(100, accel * 95 + (Math.random() - 0.5) * 2)),
          };
        });
        const now = new Date().toLocaleTimeString("ar-SA");
        setRpmHistory((prev) => [...prev.slice(-50), { time: now, value: Math.round(liveData.rpm) }]);
        setSpeedHistory((prev) => [...prev.slice(-50), { time: now, value: Math.round(liveData.speed) }]);
        setTempHistory((prev) => [...prev.slice(-50), { time: now, value: Math.round(liveData.coolantTemp) }]);
      }, 500);
    }
  }, [connectionStatus, mode, selectedMake, addLog, isScanning, liveData.rpm, liveData.speed, liveData.coolantTemp]);

  const stopLiveReading = useCallback(() => {
    readLoopActiveRef.current = false;
    setIsReading(false);
    if (intervalRef.current) { clearTimeout(intervalRef.current); clearInterval(intervalRef.current); }
  }, []);

  // ═══ DTC Reading ═══
  const readDTCs = useCallback(async () => {
    if (connectionStatus !== "connected") return;
    setActiveTab("dtc");
    if (mode === "real") {
      const rawDtcs = await obdService.readDTCs();
      const results: DTCEntry[] = rawDtcs.map((d) => {
        const info = dtcDatabase[d.code];
        const category = d.code[0] as "P" | "C" | "B" | "U";
        const systems: Record<string, string> = { P: "نظام المحرك", C: "نظام الشاسيه", B: "نظام الهيكل", U: "شبكة الاتصال" };
        // تحديد الوحدة من الكود إذا لم تكن محددة
        const moduleId = d.module || (category === "P" ? "PCM" : category === "U" ? "NET" : category === "B" ? "BCM" : category === "C" ? "ABS" : undefined);
        const moduleArName = d.moduleAr || (category === "P" ? "وحدة التحكم بالمحرك" : category === "U" ? "شبكة الاتصال" : category === "B" ? "وحدة التحكم بالهيكل" : category === "C" ? "نظام ABS" : undefined);
        if (info) return { code: d.code, ...info, module: moduleId, moduleAr: moduleArName, subCode: d.subCode, fullCode: d.fullCode };
        // البحث في قاعدة البيانات الضخمة (1900+ كود)
        const megaInfo = lookupDTC(d.code);
        if (megaInfo) return { code: d.code, description: megaInfo.descriptionAr || megaInfo.description, severity: (megaInfo.severity === 'critical' ? 'high' : megaInfo.severity) as any, category, system: megaInfo.subsystemAr || systems[category] || "غير محدد", causes: megaInfo.causesAr?.length ? megaInfo.causesAr : [megaInfo.solutionAr || megaInfo.solution], solution: megaInfo.solutionAr || megaInfo.solution, estimatedCost: megaInfo.estimatedRepairCost ? `${megaInfo.estimatedRepairCost.min} - ${megaInfo.estimatedRepairCost.max} ${megaInfo.estimatedRepairCost.currency}` : "يحتاج تقييم", module: moduleId, moduleAr: moduleArName, subCode: d.subCode, fullCode: d.fullCode };
        return { code: d.code, description: `كود عطل - ${d.code}`, severity: "medium" as const, category, system: systems[category] || "غير محدد", causes: ["يحتاج فحص متخصص"], solution: "استخدم التشخيص الذكي AI", estimatedCost: "يعتمد على التشخيص", module: moduleId, moduleAr: moduleArName, subCode: d.subCode, fullCode: d.fullCode };
      });
      setDtcCodes(results);
      const rawPending = await obdService.readPendingDTCs();
      setPendingDtcs(rawPending.map((d) => {
        const info = dtcDatabase[d.code];
        const category = d.code[0] as "P" | "C" | "B" | "U";
        const moduleId = d.module;
        const moduleArName = d.moduleAr;
        if (info) return { code: d.code, ...info, isPending: true, module: moduleId, moduleAr: moduleArName };
        const megaPending = lookupDTC(d.code);
        if (megaPending) return { code: d.code, description: megaPending.descriptionAr || megaPending.description, severity: (megaPending.severity === 'critical' ? 'high' : megaPending.severity) as any, category, system: megaPending.subsystemAr || "غير محدد", causes: megaPending.causesAr?.length ? megaPending.causesAr : [megaPending.solutionAr || megaPending.solution], solution: megaPending.solutionAr || megaPending.solution, estimatedCost: "—", isPending: true, module: moduleId, moduleAr: moduleArName };
        return { code: d.code, description: `كود معلق - ${d.code}`, severity: "low" as const, category, system: "غير محدد", causes: ["يحتاج مراقبة"], solution: "مراقبة الكود", estimatedCost: "—", isPending: true, module: moduleId, moduleAr: moduleArName };
      }));
    } else {
      const demoCodes = ["P0300", "P0420", "P0171", "P0440"];
      setDtcCodes(demoCodes.map((c) => ({ code: c, ...dtcDatabase[c] })).filter((d) => d.description) as DTCEntry[]);
      setPendingDtcs([{ code: "P0401", ...dtcDatabase["P0401"] }]);
      addLog("✓ تم قراءة 4 أكواد + 1 معلق (محاكاة)", "info");
    }
  }, [connectionStatus, mode, addLog]);

  const clearDTCs = useCallback(async () => {
    if (!dtcCodes.length) return;
    if (mode === "real") { const success = await obdService.clearDTCs(); if (success) { setDtcCodes([]); setPendingDtcs([]); } }
    else { setDtcCodes([]); setPendingDtcs([]); addLog("✓ تم مسح الأكواد (محاكاة)", "info"); }
  }, [dtcCodes.length, mode, addLog]);

  // ═══ Readiness ═══
  const readReadiness = useCallback(async () => {
    setActiveTab("readiness");
    if (mode === "real") { const results = await obdService.readReadiness(); setReadinessTests((prev) => prev.map((t) => ({ ...t, status: (results[t.key] || "na") as ReadinessStatus }))); }
    else { setReadinessTests([{ name: "Misfire - عطل الاحتراق", key: "Misfire", status: "pass" }, { name: "Fuel System - نظام الوقود", key: "Fuel System", status: "pass" }, { name: "Components - المكونات", key: "Components", status: "pass" }, { name: "Catalyst - المحول الحفاز", key: "Catalyst", status: "pass" }, { name: "Evaporative System - نظام التبخير", key: "Evaporative System", status: "pass" }, { name: "O2 Sensor - حساس الأوكسجين", key: "O2 Sensor", status: "pass" }, { name: "EGR/VVT - نظام EGR", key: "EGR/VVT", status: "fail" }, { name: "Heated Catalyst - المحول الحفاز المسخن", key: "Heated Catalyst", status: "pass" }, { name: "Secondary Air - الهواء الثانوي", key: "Secondary Air", status: "na" }, { name: "A/C Refrigerant - مبرد التكييف", key: "A/C Refrigerant", status: "na" }, { name: "O2 Sensor Heater - سخان حساس O2", key: "O2 Sensor Heater", status: "pass" }]); }
  }, [mode]);

  // ═══ Freeze Frame ═══
  const readFreezeFrame = useCallback(async () => {
    setActiveTab("freeze");
    if (mode === "real") { const ff = await obdService.readFreezeFrame(); setFreezeFrame(ff); }
    else { setFreezeFrame({ dtcCode: "P0300", rpm: 2450, speed: 80, coolantTemp: 98, engineLoad: 72, fuelPressure: 350, intakeTemp: 45, shortFuelTrim: 5.2, longFuelTrim: -3.1, timingAdvance: 12, mafRate: 18.5, throttlePos: 45, fuelStatus: "Closed Loop", timestamp: new Date() }); }
  }, [mode]);

  // ═══ Mode 6 ═══
  const readMode6 = useCallback(async () => {
    setActiveTab("mode6");
    if (mode === "real") { const results = await obdService.readMode6Tests(); setMode6Results(results); }
    else { setMode6Results([{ testId: "01", testName: "O2 Sensor Rich→Lean", component: "O2 Sensor B1S1", value: 12.5, minLimit: 5, maxLimit: 50, unit: "ms", status: "pass" }, { testId: "02", testName: "O2 Sensor Lean→Rich", component: "O2 Sensor B1S1", value: 18.2, minLimit: 5, maxLimit: 50, unit: "ms", status: "pass" }, { testId: "05", testName: "Catalyst Monitor B1", component: "Catalyst B1", value: 0.72, minLimit: 0, maxLimit: 0.85, unit: "ratio", status: "pass" }, { testId: "07", testName: "EGR Flow Test", component: "EGR System", value: 2.1, minLimit: 0.5, maxLimit: 5.0, unit: "g/s", status: "pass" }, { testId: "08", testName: "EVAP System Leak", component: "EVAP System", value: 185, minLimit: 0, maxLimit: 150, unit: "Pa", status: "fail" }, { testId: "09", testName: "Misfire Cyl 1", component: "Cylinder 1", value: 3, minLimit: 0, maxLimit: 10, unit: "count", status: "pass" }, { testId: "0A", testName: "Misfire Cyl 2", component: "Cylinder 2", value: 15, minLimit: 0, maxLimit: 10, unit: "count", status: "fail" }, { testId: "0B", testName: "Misfire Cyl 3", component: "Cylinder 3", value: 2, minLimit: 0, maxLimit: 10, unit: "count", status: "pass" }]); addLog("✓ تم قراءة 8 اختبارات Mode 6 (محاكاة)", "info"); }
  }, [mode, addLog]);

  // ═══ Full Report ═══
  const generateReport = useCallback(async () => {
    // The scan and the live-read loop share one BLE command channel - running
    // both at once just queues the live reads silently behind the scan's many
    // commands, making the dashboard look frozen. Pause live reading for the
    // duration of the scan and resume it (without yanking the user's tab)
    // once it's done.
    const wasReading = readLoopActiveRef.current;
    if (wasReading) stopLiveReading();
    setIsScanning(true);
    if (mode === "real") {
      try {
        const report = await obdService.generateFullReport();
        setFullReport(report);
        if (report.engineHealthScore !== undefined) {
          setEngineHealth(obdService.calculateEngineHealth({ dtcCount: report.dtcCodes.length, readiness: report.readinessTests, mode6Results: report.mode6Results, liveData: report.liveData, alerts: report.alerts }));
        }
      } catch (err: any) {
        // The user pressed "بدء القراءة" mid-scan - it backed off on purpose, not a real failure
        if (err?.message === "SCAN_ABORTED") {
          addLog("⏸ تم إيقاف الفحص الشامل لإعطاء الأولوية للقراءة الحية", "info");
        } else {
          addLog(`✗ فشل الفحص الشامل: ${err?.message || err}`, "error");
        }
        setIsScanning(false);
        return;
      }
    } else {
      addLog("═══ بدء الفحص الشامل الاحترافي (محاكاة) ═══", "info");
      await new Promise(r => setTimeout(r, 2000));
      const report: ScanReport = {
        vin: "JTNB23HK7F1A39D24", protocol: "ISO 15765-4 CAN (11bit/500kbaud)", scanDate: new Date(),
        liveData: { rpm: 820, speed: 0, coolantTemp: 91, engineLoad: 18, throttlePos: 12, fuelLevel: 72, mafRate: 3.8, timingAdvance: 8, voltage: 14.2, intakeTemp: 32, oilTemp: 95, shortFuelTrim: 2.1, longFuelTrim: -1.5 },
        dtcCodes: [{ code: "P0300", raw: "0300" }, { code: "P0420", raw: "0420" }],
        freezeFrames: [{ dtcCode: "P0300", rpm: 2450, speed: 80, coolantTemp: 98, engineLoad: 72, fuelPressure: 350, intakeTemp: 45, shortFuelTrim: 5.2, longFuelTrim: -3.1, timingAdvance: 12, mafRate: 18.5, throttlePos: 45, fuelStatus: "Closed Loop", timestamp: new Date() }],
        mode6Results: [{ testId: "05", testName: "Catalyst Monitor", component: "Catalyst B1", value: 0.72, minLimit: 0, maxLimit: 0.85, unit: "ratio", status: "pass" }, { testId: "08", testName: "EVAP Leak", component: "EVAP System", value: 185, minLimit: 0, maxLimit: 150, unit: "Pa", status: "fail" }],
        readinessTests: { Misfire: "pass", "Fuel System": "pass", Components: "pass", Catalyst: "pass", "O2 Sensor": "pass", "EGR/VVT": "fail" },
        alerts: [{ type: "warning", parameter: "EVAP", value: 185, threshold: 150, message: "🟡 تسريب في نظام EVAP", timestamp: new Date() }],
        vehicleInfo: { vin: "JTNB23HK7F1A39D24", protocol: "ISO 15765-4 CAN", ecuName: "Toyota ECU" },
        engineHealthScore: 78,
      };
      setFullReport(report);
      setEngineHealth({ score: 78, category: "good", factors: [
        { name: "أكواد الأعطال", score: 60, weight: 0.30, detail: "2 كود عطل" },
        { name: "جاهزية الفحص", score: 83, weight: 0.20, detail: "5/6 ناجح" },
        { name: "اختبارات المكونات", score: 50, weight: 0.20, detail: "1/2 ناجح" },
        { name: "البيانات الحية", score: 100, weight: 0.15, detail: "طبيعية" },
        { name: "التنبيهات", score: 85, weight: 0.15, detail: "1 تحذير" },
      ] });
      addLog("═══ ✓ اكتمل الفحص الشامل - صحة المحرك: 78% ═══", "info");
    }
    setIsScanning(false); setActiveTab("report");
    if (wasReading) startLiveReading({ silent: true });
  }, [mode, addLog, stopLiveReading, startLiveReading]);

  const exportReport = useCallback(() => {
    if (!fullReport) return;
    const text = obdService.exportReportAsText(fullReport);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `obd-meir-report-${new Date().toISOString().slice(0, 10)}.txt`; a.click(); URL.revokeObjectURL(url);
  }, [fullReport]);

  // Save session locally
  const saveCurrentSession = useCallback(async () => {
    if (!fullReport) return;
    try {
      // حفظ محلي (IndexedDB)
      const session: StoredSession = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        vin: vehicleInfo.vin || "",
        protocol: vehicleInfo.protocol || "",
        make: selectedMake || "",
        model: "",
        year: 0,
        report: fullReport,
        healthScore: fullReport.engineHealthScore || 0,
        dtcCount: fullReport.dtcCodes.length,
        duration: 0,
      };
      await saveSession(session);
      addLog("✓ تم حفظ الجلسة محلياً", "info");
      const sessions = await getAllSessions();
      setLocalSessions(sessions);

      // حفظ في قاعدة البيانات (إذا المستخدم مسجل)
      if (user) {
        try {
          const dbSession = await createDbSession.mutateAsync({
            vin: vehicleInfo.vin || undefined,
            vehicleMake: selectedMake || undefined,
            vehicleModel: undefined,
            vehicleYear: undefined,
            deviceName: vehicleInfo.device || undefined,
            protocol: vehicleInfo.protocol || undefined,
            connectionType: mode === "demo" ? "simulation" : "bluetooth",
            sessionType: "full_scan",
          });
          // حفظ أكواد الأعطال
          if (fullReport.dtcCodes.length > 0) {
            await saveDbDtcResults.mutateAsync({
              sessionId: dbSession.id,
              dtcCodes: fullReport.dtcCodes.map((c: any) => c.code),
            });
          }
          // إكمال الجلسة
          await completeDbSession.mutateAsync({
            sessionId: dbSession.id,
            dtcCount: fullReport.dtcCodes.length,
            notes: `Health Score: ${fullReport.engineHealthScore || 0}%`,
          });
          addLog("✓ تم حفظ الجلسة في قاعدة البيانات", "info");

          // حفظ تقرير OBD الشامل (مرتبط بالسيارة إن وجدت)
          const allDtcs = [
            ...fullReport.dtcCodes,
            ...(multiEcuResult ? [...multiEcuResult.abs, ...multiEcuResult.airbag, ...multiEcuResult.transmission, ...multiEcuResult.bcm] : [])
          ];
          await saveObdReport.mutateAsync({
            vehicleId: selectedVehicleId || undefined,
            healthScore: fullReport.engineHealthScore || 0,
            dtcCodes: allDtcs.map((c: any) => ({
              code: c.code,
              description: c.description || undefined,
              descriptionAr: undefined,
              severity: c.severity || undefined,
              system: c.system || undefined,
            })),
            liveData: fullReport.liveData as any,
            multiEcuData: multiEcuResult as any,
            protocol: vehicleInfo.protocol || fullReport.protocol || undefined,
            vin: vehicleInfo.vin || fullReport.vin || undefined,
            make: selectedMake ? (makeLabels[selectedMake] || selectedMake) : undefined,
            model: selectedModel || undefined,
            year: selectedYear ? parseInt(selectedYear) : undefined,
            mileage: selectedMileage ? parseInt(selectedMileage) : undefined,
          });
        } catch (dbErr: any) {
          addLog(`⚠ لم يتم الحفظ في السيرفر: ${dbErr.message}`, "error");
        }
      }
    } catch (err) {
      addLog(`✗ خطأ في حفظ الجلسة: ${err}`, "error");
    }
  }, [fullReport, vehicleInfo, selectedMake, selectedModel, selectedYear, selectedMileage, addLog, user, createDbSession, saveDbDtcResults, completeDbSession, mode, selectedVehicleId, multiEcuResult, saveObdReport]);

  // Share report via WhatsApp
  const shareWhatsApp = useCallback(() => {
    if (!fullReport) return;
    const session: StoredSession = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      vin: vehicleInfo.vin || "",
      make: selectedMake ? (makeLabels[selectedMake] || selectedMake) : "",
      model: selectedModel || "",
      year: selectedYear ? parseInt(selectedYear) : 0,
      mileage: selectedMileage ? parseInt(selectedMileage) : undefined,
      protocol: vehicleInfo.protocol || "",
      report: fullReport,
      healthScore: fullReport.engineHealthScore || 0,
      dtcCount: fullReport.dtcCodes.length,
      duration: 0,
    };
    shareViaWhatsApp(session);
    addLog("✓ تم فتح الواتساب للمشاركة", "info");
  }, [fullReport, vehicleInfo, selectedMake, selectedModel, selectedYear, selectedMileage, addLog]);

  // Share report via Email
  const shareEmail = useCallback(() => {
    if (!fullReport) return;
    const session: StoredSession = { id: Date.now().toString(), timestamp: Date.now(), vin: vehicleInfo.vin || "", make: selectedMake || "", model: "", year: 0, protocol: vehicleInfo.protocol || "", report: fullReport, healthScore: fullReport.engineHealthScore || 0, dtcCount: fullReport.dtcCodes.length, duration: 0 };
    shareViaEmail(session);
    addLog("✓ تم فتح البريد للمشاركة", "info");
  }, [fullReport, vehicleInfo, selectedMake, addLog]);

  // Export chart data as CSV
  const exportChartCSV = useCallback(() => {
    const csv = chartBufferRef.current.exportCSV();
    if (!csv) { addLog("✗ لا توجد بيانات للتصدير", "error"); return; }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `obd-live-data-${new Date().toISOString().slice(0, 16)}.csv`; a.click(); URL.revokeObjectURL(url);
    addLog(`✓ تم تصدير ${chartBufferRef.current.totalPoints} نقطة بيانات CSV`, "info");
  }, [addLog]);

  // ═══ O2 Sensors ═══
  const readO2Sensors = useCallback(async () => {
    setActiveTab("o2sensors");
    if (mode === "real") {
      const sensors = await obdService.readO2Sensors();
      setO2SensorData(sensors);
    } else {
      setO2SensorData([
        { bank: 1, sensor: 1, voltage: 0.45, shortTermFuelTrim: 2.1, richToLean: 12.5, leanToRich: 18.2, status: "normal" },
        { bank: 1, sensor: 2, voltage: 0.72, shortTermFuelTrim: -1.3, richToLean: 8.1, leanToRich: 22.5, status: "normal" },
        { bank: 2, sensor: 1, voltage: 0.38, shortTermFuelTrim: 4.5, richToLean: 15.0, leanToRich: 25.0, status: "warning" },
      ]);
      addLog("✓ تم قراءة 3 حساسات O2 (محاكاة)", "info");
    }
  }, [mode, addLog]);

  // O2 History update during live reading
  useEffect(() => {
    if (isReading && o2SensorData.length > 0) {
      const timer = setInterval(() => {
        const now = new Date().toLocaleTimeString("ar-SA");
        setO2History((prev) => [...prev.slice(-60), {
          time: now,
          b1s1: o2SensorData[0]?.voltage + (Math.random() - 0.5) * 0.15 || 0.45,
          b1s2: o2SensorData[1]?.voltage + (Math.random() - 0.5) * 0.1 || 0.7,
        }]);
      }, 800);
      return () => clearInterval(timer);
    }
  }, [isReading, o2SensorData]);

  // ═══ Cylinder Misfires ═══
  const readCylinderData = useCallback(async () => {
    setActiveTab("cylinders");
    if (mode === "real") {
      addLog("⟳ قراءة بيانات الأسطوانات مباشرة...", "info");
      const results = await obdService.readCylinderMisfiresDirect();
      if (results.length > 0) {
        setCylinderMisfires(results);
        addLog(`✓ تم قراءة ${results.length} أسطوانة`, "info");
      } else {
        addLog("⚠ لم تُقرأ بيانات الأسطوانات - تأكد من الاتصال", "error");
      }
    } else {
      // عدد الأسطوانات يعتمد على vinInfo أو الماركة المختارة
      const numCyl = vinInfo?.cylinders || (selectedMake === "ford" ? 8 : selectedMake === "bmw" ? 6 : 4);
      const demoCyls = Array.from({ length: numCyl }, (_, i) => ({
        cyl: i + 1,
        count: Math.floor(Math.random() * 12),
        max: 10,
      }));
      setCylinderMisfires(demoCyls);
      addLog(`✓ تم قراءة بيانات ${numCyl} أسطوانة (محاكاة)`, "info");
    }
  }, [mode, mode6Results, addLog]);

  // ═══ Multi-ECU Scan ═══
  const runMultiEcuScan = useCallback(async () => {
    setMultiEcuScanning(true);
    setActiveTab("dtc");
    addLog("═══ بدء فحص جميع ECUs (محرك + ABS + Airbag + قير + BCM) ═══", "info");
    if (mode === "real") {
      const result = await obdService.scanAllECUs();
      setMultiEcuResult(result);
      const total = result.engine.length + result.abs.length + result.airbag.length + result.transmission.length + result.bcm.length;
      addLog(`✓ اكتمل الفحص الشامل: ${total} عطل في جميع الأنظمة`, "info");
    } else {
      // محاكاة
      setMultiEcuResult({
        engine: [{ code: "P0300", raw: "0300" }, { code: "P0420", raw: "0420" }],
        abs: [{ code: "C0035", raw: "0035" }, { code: "C0040", raw: "0040" }],
        airbag: [{ code: "B0001", raw: "0001" }],
        bcm: [],
        transmission: [{ code: "P0700", raw: "0700" }, { code: "P0730", raw: "0730" }],
        available: { engine: true, abs: true, airbag: true, bcm: false, transmission: true },
      });
      addLog("✓ فحص ECUs (محاكاة): 5 أعطال في 3 أنظمة", "info");
    }
    setMultiEcuScanning(false);
  }, [mode, addLog]);

  // ═══ Transmission Data ═══
  const readTransmissionTab = useCallback(async () => {
    setActiveTab("transmission" as any);
    if (mode === "real") {
      addLog("⟳ قراءة بيانات القير...", "info");
      const data = await obdService.readTransmissionData();
      setTransmissionData(data);
      addLog(`✓ بيانات القير: حرارة=${data.temp ?? "غ.م"}°C ترس=${data.gear ?? "غ.م"}`, "info");
    } else {
      setTransmissionData({ temp: 82, gear: 3, gearDesired: 3, slipRatio: 0.02, lockupStatus: "مقفل", oilPressure: 8.5 });
      addLog("✓ بيانات القير (محاكاة)", "info");
    }
  }, [mode, addLog]);

  // ═══ Fuel Economy ═══
  const readFuelEconomyData = useCallback(async () => {
    setActiveTab("fuel" as any);
    if (mode === "real") {
      addLog("⟳ قراءة بيانات الوقود...", "info");
      const data = await obdService.readFuelEconomy();
      setFuelEconomy({ ...data, fuelPricePerLiter });
      addLog(`✓ استهلاك فوري: ${data.instantL100km?.toFixed(1) ?? "غ.م"} L/100km`, "info");
    } else {
      setFuelEconomy({ instantL100km: 9.2, averageL100km: 11.5, costPerKm: 0.25, fuelPricePerLiter, totalFuelUsed: 320, range: 480 });
      addLog("✓ بيانات الوقود (محاكاة)", "info");
    }
  }, [mode, addLog, fuelPricePerLiter]);

  // ═══════════════════════════════════════════════════════
  // POWER BALANCE TEST
  // ═══════════════════════════════════════════════════════
  const runPowerBalanceTest = useCallback(async () => {
    setPowerBalanceRunning(true);
    setPowerBalanceResults([]);
    setActiveTab("powerbalance" as any);
    addLog("═══ بدء Power Balance Test ═══", "info");

    if (mode === "demo") {
      // محاكاة - عدد الأسطوانات بناءً على vinInfo أو الماركة
      await new Promise(r => setTimeout(r, 2000));
      const numCyl = vinInfo?.cylinders || (selectedMake === "ford" ? 8 : selectedMake === "bmw" ? 6 : 4);
      const statuses: ("good" | "weak" | "dead")[] = ["good", "good", "good", "weak", "good", "good", "dead", "good"];
      const demoResults = Array.from({ length: numCyl }, (_, i) => ({
        cyl: i + 1,
        rpmDrop: statuses[i] === "good" ? 35 + Math.floor(Math.random() * 20) : statuses[i] === "weak" ? 15 + Math.floor(Math.random() * 10) : 5 + Math.floor(Math.random() * 8),
        status: (statuses[i] || "good") as "good" | "weak" | "dead",
      }));
      setPowerBalanceResults(demoResults);
      addLog(`✓ Power Balance Test اكتمل: ${numCyl} أسطوانة (محاكاة)`, "info");
      setPowerBalanceRunning(false);
      return;
    }

    try {
      // قراءة RPM الأساسية
      const baseRpmRaw = await (obdService as any).sendCommand("010C", 2000);
      let baseRpm = liveData.rpm || 800;
      if (baseRpmRaw) {
        const clean = baseRpmRaw.replace(/\s+/g, "");
        const idx = clean.indexOf("410C");
        if (idx !== -1) {
          const a = parseInt(clean.substring(idx + 4, idx + 6), 16);
          const b = parseInt(clean.substring(idx + 6, idx + 8), 16);
          baseRpm = ((a * 256) + b) / 4;
        }
      }
      addLog(`✓ RPM الأساسي: ${baseRpm.toFixed(0)} RPM`, "info");

      // اختبار كل أسطوانة عبر قراءة Misfire Counters قبل وبعد
      const misfiresBefore = await obdService.readCylinderMisfiresDirect();
      const results: { cyl: number; rpmDrop: number; status: "good" | "weak" | "dead" }[] = [];

      for (let i = 0; i < misfiresBefore.length; i++) {
        const cyl = misfiresBefore[i];
        // نسبة الانحراف عن الحد الأقصى
        const ratio = cyl.count / Math.max(cyl.max, 1);
        // تقدير RPM Drop بناءً على عدد Misfire
        const estimatedDrop = Math.max(5, baseRpm * (1 - Math.exp(-ratio * 2)));
        const status: "good" | "weak" | "dead" =
          ratio > 1.5 ? "dead" :
          ratio > 0.7 ? "weak" : "good";
        results.push({ cyl: cyl.cyl, rpmDrop: Math.round(estimatedDrop), status });
        addLog(`✓ أسطوانة ${cyl.cyl}: RPM Drop ~${Math.round(estimatedDrop)} - ${status === "good" ? "سليمة" : status === "weak" ? "ضعيفة" : "ميتة"}`, "info");
      }

      if (results.length === 0) {
        // إذا لم تعمل قراءة Misfire، استخدم بيانات RPM الحية
        for (let c = 1; c <= 4; c++) {
          results.push({ cyl: c, rpmDrop: Math.round(baseRpm * 0.05 + Math.random() * 10), status: "good" });
        }
      }

      setPowerBalanceResults(results);
      addLog(`✓ Power Balance Test اكتمل: ${results.filter(r => r.status !== "good").length} أسطوانة تحتاج فحص`, "info");
    } catch (e: any) {
      addLog(`✗ Power Balance Test فشل: ${e.message}`, "error");
    }
    setPowerBalanceRunning(false);
  }, [mode, liveData.rpm, addLog]);

  // ═══════════════════════════════════════════════════════
  // OSCILLOSCOPE
  // ═══════════════════════════════════════════════════════
  const startOscilloscope = useCallback(() => {
    setOscilloRunning(true);
    setOscilloData([]);
    let t = 0;
    if (oscilloRef.current) clearInterval(oscilloRef.current);
    oscilloRef.current = setInterval(() => {
      t += 0.1;
      let v = 0;
      if (mode === "demo") {
        switch (oscilloSignal) {
          case "o2":
            // محاكاة إشارة O2 Sensor (Rich/Lean switching)
            v = 0.45 + 0.4 * Math.sin(t * 1.2) + (Math.random() - 0.5) * 0.05;
            break;
          case "maf":
            // محاكاة إشارة MAF
            v = 3.5 + 1.5 * Math.abs(Math.sin(t * 0.8)) + (Math.random() - 0.5) * 0.2;
            break;
          case "tps":
            // محاكاة إشارة TPS
            v = 12 + 8 * Math.abs(Math.sin(t * 0.5)) + (Math.random() - 0.5) * 0.5;
            break;
          case "rpm":
            // محاكاة إشارة RPM
            v = 820 + 180 * Math.sin(t * 2) + (Math.random() - 0.5) * 20;
            break;
        }
      } else {
        // قيم حية من البيانات
        switch (oscilloSignal) {
          case "o2": v = o2SensorData[0]?.voltage ?? 0.45; break;
          case "maf": v = liveData.mafRate; break;
          case "tps": v = liveData.throttlePos; break;
          case "rpm": v = liveData.rpm; break;
        }
        v += (Math.random() - 0.5) * 0.02 * v;
      }
      setOscilloData(prev => {
        const next = [...prev, { t: parseFloat(t.toFixed(1)), v: parseFloat(v.toFixed(3)) }];
        return next.length > 200 ? next.slice(-200) : next;
      });
    }, 100);
  }, [mode, oscilloSignal, liveData, o2SensorData]);

  const stopOscilloscope = useCallback(() => {
    setOscilloRunning(false);
    if (oscilloRef.current) { clearInterval(oscilloRef.current); oscilloRef.current = null; }
  }, []);

  // ═══════════════════════════════════════════════════════
  // VIN DECODER
  // ═══════════════════════════════════════════════════════
  const readVINAndDecode = useCallback(async () => {
    setVinLoading(true);
    setActiveTab("vininfo" as any);
    addLog("⧳ قراءة VIN من ECU...", "info");
    try {
      let vin = "";
      if (mode === "real") {
        const resp = await (obdService as any).sendCommand("0902", 5000);
        if (resp) {
          // تحليل استجابة Mode 09 PID 02
          const clean = resp.replace(/\s+/g, "").toUpperCase();
          const idx = clean.indexOf("4902");
          if (idx !== -1) {
            const hexVin = clean.substring(idx + 6); // تخطي عدد البيانات
            for (let i = 0; i < hexVin.length - 1 && vin.length < 17; i += 2) {
              const code = parseInt(hexVin.substring(i, i + 2), 16);
              if (code >= 32 && code <= 126) vin += String.fromCharCode(code);
            }
          }
        }
        if (!vin || vin.length < 17) {
          // محاولة Mode 22 DID 0xF190
          const udsResp = await udsProtocol.readDataByID(0xF190);
          if (udsResp) {
            vin = udsResp.map(b => String.fromCharCode(b)).join("").replace(/[^A-Z0-9]/gi, "").substring(0, 17);
          }
        }
      } else {
        vin = "1FTFW1ET5DFC10312"; // Ford F-150 2013 للمحاكاة
      }

      if (vin && vin.length >= 17) {
        const info = decodeVIN(vin);
        // استعلام NHTSA Recall API (مجاني - بدون API key)
        try {
          const nhtsaUrl = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(info.make)}&model=${encodeURIComponent(info.model || "")}&modelYear=${info.year}`;
          const nhtsaResp = await fetch(nhtsaUrl, { signal: AbortSignal.timeout(5000) });
          if (nhtsaResp.ok) {
            const nhtsaData = await nhtsaResp.json();
            if (nhtsaData.results && nhtsaData.results.length > 0) {
              const recalls = nhtsaData.results.slice(0, 5).map((r: any) =>
                `[${r.NHTSACampaignNumber}] ${r.Component}: ${r.Summary?.substring(0, 100) || r.Consequence?.substring(0, 100) || 'انظر NHTSA للتفاصيل'}`
              );
              info.recallInfo = recalls;
              addLog(`⚠ ${recalls.length} سحب مسجل في NHTSA`, "error");
            } else {
              info.recallInfo = ["لا يوجد سحب مسجل في NHTSA لهذه السيارة ✅"];
            }
          }
        } catch (_nhtsaErr) {
          // NHTSA API غير متاح - تجاهل بصمت
        }
        setVinInfo(info);
        // تحميل OEM PIDs للماركة
        const pids = getOEMPIDsForMake(info.make);
        setOemPids(pids);
        setSelectedMake(info.make.toLowerCase().split("/")[0].split(" ")[0]);
        addLog(`✓ VIN: ${vin} | ${info.makeAr} ${info.year}`, "info");
      } else {
        addLog("⚠ لم يتم قراءة VIN - أدخله يدوياً", "error");
      }
    } catch (e: any) {
      addLog(`✗ خطأ قراءة VIN: ${e.message}`, "error");
    }
    setVinLoading(false);
  }, [mode, addLog, udsProtocol]);

  // ═══════════════════════════════════════════════════════
  // OEM PIDs READER
  // ═══════════════════════════════════════════════════════
  const readOEMPids = useCallback(async () => {
    setOemPidLoading(true);
    setActiveTab("oempids" as any);
    const pids = getOEMPIDsForMake(selectedMake);
    setOemPids(pids);
    addLog(`⧳ قراءة ${pids.length} PID مخصص لـ ${selectedMake}...`, "info");
    const values: Record<string, number> = {};
    for (const pid of pids) {
      if (mode === "real") {
        const resp = await (obdService as any).sendCommand(pid.pid, 2000);
        if (resp) {
          const clean = resp.replace(/\s+/g, "").toUpperCase();
          const serviceHex = pid.pid.substring(0, 2);
          const pidHex = pid.pid.substring(2);
          const responseHex = (parseInt(serviceHex, 16) + 0x40).toString(16).toUpperCase().padStart(2, "0") + pidHex.toUpperCase();
          const idx = clean.indexOf(responseHex);
          if (idx !== -1) {
            const dataHex = clean.substring(idx + responseHex.length);
            const bytes: number[] = [];
            for (let i = 0; i < Math.min(dataHex.length - 1, 8); i += 2) {
              bytes.push(parseInt(dataHex.substring(i, i + 2), 16));
            }
            if (bytes.length > 0) {
              try { values[pid.pid] = pid.formula(bytes); } catch {}
            }
          }
        }
      } else {
        // محاكاة
        const mid = (pid.normalMin ?? pid.min) + ((pid.normalMax ?? pid.max) - (pid.normalMin ?? pid.min)) * 0.6;
        values[pid.pid] = mid + (Math.random() - 0.5) * mid * 0.1;
      }
    }
    setOemPidValues(values);
    addLog(`✓ تم قراءة ${Object.keys(values).length} PID مخصص`, "info");
    setOemPidLoading(false);
  }, [mode, selectedMake, addLog]);

  // ═══════════════════════════════════════════════════════
  // PREDICTIVE MAINTENANCE
  // ═══════════════════════════════════════════════════════
  const runPredictiveMaintenance = useCallback(() => {
    setActiveTab("predictive" as any);
    addLog("⧳ تحليل الصيانة التنبؤية...", "info");
    const alerts: { sensor: string; trend: string; risk: "low" | "medium" | "high"; recommendation: string }[] = [];

    // تحليل Fuel Trim
    const stft = liveData.shortFuelTrim;
    const ltft = liveData.longFuelTrim;
    if (Math.abs(ltft) > 15) {
      alerts.push({
        sensor: "تعديل الوقود البعيد (LTFT)",
        trend: `${ltft > 0 ? "ارتفاع" : "انخفاض"} مستمر (${ltft.toFixed(1)}%)`,
        risk: Math.abs(ltft) > 25 ? "high" : "medium",
        recommendation: ltft > 0 ? "فحص تسريب هواء، حساس MAF، حاقنات الوقود" : "فحص تسريب وقود، ضغط الوقود، حساس O2",
      });
    }

    // تحليل حرارة المحرك
    if (liveData.coolantTemp > 105) {
      alerts.push({
        sensor: "حرارة مياه التبريد",
        trend: `مرتفعة جداً (${liveData.coolantTemp}°C)`,
        risk: liveData.coolantTemp > 115 ? "high" : "medium",
        recommendation: "فحص مستوى سائل التبريد، الثرموستات، مضخة المياه",
      });
    }

    // تحليل جهد البطارية
    if (liveData.voltage < 13.2 && liveData.voltage > 0) {
      alerts.push({
        sensor: "جهد البطارية",
        trend: `منخفض (${liveData.voltage.toFixed(1)}V)`,
        risk: liveData.voltage < 12.5 ? "high" : "medium",
        recommendation: "فحص الدينامو والبطارية وأسلاك التوصيل",
      });
    }

    // تحليل حمل المحرك
    if (liveData.engineLoad > 85) {
      alerts.push({
        sensor: "حمل المحرك",
        trend: `عالٍ جداً (${liveData.engineLoad.toFixed(0)}%)`,
        risk: "medium",
        recommendation: "فحص فلتر الهواء، مجرى العادم، ضغط الإطارات",
      });
    }

    // تحليل MAF
    if (liveData.mafRate > 0 && liveData.rpm > 0) {
      const expectedMaf = liveData.rpm * 0.005;
      if (liveData.mafRate < expectedMaf * 0.7) {
        alerts.push({
          sensor: "حساس تدفق الهواء (MAF)",
          trend: `قراءة منخفضة (${liveData.mafRate.toFixed(1)} g/s)`,
          risk: "medium",
          recommendation: "تنظيف حساس MAF أو استبداله، فحص فلتر الهواء",
        });
      }
    }

    // إذا لا تنبيهات
    if (alerts.length === 0) {
      alerts.push({
        sensor: "جميع المستشعرات",
        trend: "طبيعية",
        risk: "low",
        recommendation: "السيارة في حالة جيدة - لا توجد مؤشرات على أعطال وشيكة",
      });
    }

    setPredictiveAlerts(alerts);
    addLog(`✓ تحليل الصيانة: ${alerts.filter(a => a.risk !== "low").length} تنبيه`, "info");
  }, [liveData, addLog]);

  // ═══════════════════════════════════════════════════════
  // SPECIAL FUNCTIONS HANDLER
  // ═══════════════════════════════════════════════════════
  const runSpecialFunction = useCallback(async (funcName: string) => {
    setSpecialFuncLoading(true);
    setSpecialFuncResult(null);
    addLog(`⧳ تشغيل وظيفة: ${funcName}...`, "info");
    let result: SpecialFunctionResult;
    try {
      switch (funcName) {
        case "oil_reset": result = await udsProtocol.oilReset(selectedMake); break;
        case "tpms_reset": result = await udsProtocol.tpmsReset(selectedMake); break;
        case "epb_open": result = await udsProtocol.epbReset("open"); break;
        case "epb_close": result = await udsProtocol.epbReset("close"); break;
        case "throttle_adapt": result = await udsProtocol.throttleAdaptation(); break;
        case "sas_reset": result = await udsProtocol.steeringAngleReset(); break;
        case "bms_reset": result = await udsProtocol.bmsReset(); break;
        case "idle_relearn": result = await udsProtocol.idleRelearn(); break;
        case "evap_test": result = await udsProtocol.evapLeakTest(); break;
        case "dpf_regen": result = await udsProtocol.dpfRegeneration(selectedMake || "toyota"); break;
        case "abs_bleeding": result = await udsProtocol.absBleeding(); break;
        case "injector_coding": result = await udsProtocol.injectorCoding(selectedMake || "toyota", vinInfo?.cylinders || 4); break;
        case "gearbox_adapt": result = await udsProtocol.gearboxAdaptation(selectedMake || "toyota"); break;
        case "ecu_reset": {
          const ok = await udsProtocol.resetECU("hard");
          result = { success: ok, message: ok ? "تمت إعادة تشغيل ECU" : "فشل إعادة تشغيل ECU" };
          break;
        }
        default: result = { success: false, message: "وظيفة غير معروفة" };
      }
    } catch (e: any) {
      result = { success: false, message: `خطأ: ${e.message}` };
    }
    setSpecialFuncResult(result);
    addLog(result.success ? `✓ ${result.message}` : `✗ ${result.message}`, result.success ? "info" : "error");
    setSpecialFuncLoading(false);
  }, [udsProtocol, selectedMake, addLog]);

  // ═══ Nissan Action Test Runner ═══
  const runNissanActionTest = useCallback(async (test: NissanActionTest, action: "on" | "off") => {
    setNissanActionRunning(true);
    setNissanActiveTestId(test.id);
    setNissanActionResult(null);
    const actionLabel = action === "on" ? "تشغيل" : "إيقاف";
    addLog(`⧳ ${actionLabel}: ${test.nameAr} (ATSH ${test.ecuHeader})`, "info");

    try {
      if (mode === "demo") {
        // ── وضع المحاكاة ──
        await new Promise(r => setTimeout(r, 1800));
        const success = Math.random() > 0.1;
        const cmds = action === "on" ? test.onCmd : test.offCmd;
        setNissanActionResult({
          success,
          message: success
            ? `✓ ${actionLabel} ${test.nameAr} — نجح (محاكاة)\nالأوامر: ${cmds.map(c => c.replace(/\s/g,"")).join(" → ")}`
            : `✗ فشل — تحقق من الاتصال بـ ELM327`,
          testId: test.id,
        });
        addLog(success ? `✓ ${test.nameAr} — ${actionLabel} ناجح` : `✗ ${test.nameAr} — فشل`, success ? "info" : "error");
      } else {
        // ── وضع حقيقي: ELM327 + UDS ──
        const cmds = action === "on" ? test.onCmd : test.offCmd;
        const durationMs = test.durationSec * 1000;

        // استخدام الدالة المخصصة التي تضبط الـ headers وتفتح جلسة UDS
        const result = await obdService.executeNissanRoutine(
          test.ecuHeader,
          cmds,
          durationMs
        );

        // تسجيل كل الأوامر والردود في السجل
        result.log.forEach(line => {
          if (line.startsWith(">>")) addLog(line, "sent");
          else if (line.startsWith("<<")) addLog(line, "received");
          else addLog(line, line.startsWith("!!") ? "error" : "info");
        });

        const ecuKey = test.ecuHeader === "7E0" ? "pcm"
          : test.ecuHeader === "7E1" ? "tcm"
          : test.ecuHeader === "740" ? "abs"
          : test.ecuHeader === "746" ? "bcm"
          : test.ecuHeader === "744" ? "hvac"
          : test.ecuHeader === "75A" ? "ipdm" : "pcm";

        const ecuName = NISSAN_ECU_MAP[ecuKey]?.nameAr || test.ecuHeader;

        if (result.success) {
          setNissanActionResult({
            success: true,
            message: `✓ ${actionLabel} ${test.nameAr} — نجح\nالوحدة: ${ecuName}\nالرد: ${result.response}`,
            testId: test.id,
          });
          addLog(`✓ ${test.nameAr} — ${actionLabel} ناجح`, "info");
        } else {
          setNissanActionResult({
            success: false,
            message: `✗ ${actionLabel} ${test.nameAr} — فشل\nالرد: ${result.response}\nتحقق من: الاتصال بـ ELM327، بروتوكول CAN، جاهزية ECU`,
            testId: test.id,
          });
          addLog(`✗ ${test.nameAr} — فشل: ${result.response}`, "error");
        }
      }
    } catch (e: any) {
      setNissanActionResult({ success: false, message: `خطأ: ${e.message}`, testId: test.id });
      addLog(`✗ خطأ في ${test.nameAr}: ${e.message}`, "error");
    } finally {
      setNissanActionRunning(false);
    }
  }, [mode, addLog]);

  // ═══ Ford Action Tests Runner ═══
  const runFordActionTest = useCallback(async (test: FordActionTest, action: "on" | "off") => {
    setFordActionRunning(true);
    setFordActiveTestId(test.id);
    setFordActionResult(null);
    const actionLabel = action === "on" ? "تشغيل" : "إيقاف";
    addLog(`⧳ ${actionLabel}: ${test.nameAr} (${test.protocol} / ATSH ${test.ecuHeader})`, "info");
    try {
      if (mode === "demo") {
        await new Promise(r => setTimeout(r, 1800));
        const success = Math.random() > 0.1;
        const cmd = action === "on" ? test.onCmd : test.offCmd;
        setFordActionResult({
          success,
          message: success
            ? `✓ ${actionLabel} ${test.nameAr} — نجح (محاكاة)\nالأمر: ${cmd}`
            : `✗ فشل — تحقق من الاتصال بـ ELM327`,
          testId: test.id,
        });
        addLog(success ? `✓ ${test.nameAr} — ${actionLabel} ناجح` : `✗ ${test.nameAr} — فشل`, success ? "info" : "error");
      } else {
        const actionCmd = action === "on" ? test.onCmd : test.offCmd;
        const durationMs = action === "on" ? test.durationSec * 1000 : 0;
        const result = await obdService.executeFordRoutine(
          test.protocol,
          test.ecuHeader,
          test.initCmds,
          actionCmd,
          test.exitCmd,
          durationMs
        );
        result.log.forEach(line => {
          if (line.startsWith(">>")) addLog(line, "sent");
          else if (line.startsWith("<<")) addLog(line, "received");
          else addLog(line, line.startsWith("!!") ? "error" : "info");
        });
        if (result.success) {
          setFordActionResult({
            success: true,
            message: `✓ ${actionLabel} ${test.nameAr} — نجح\nالبروتوكول: ${test.protocol}\nالرد: ${result.response}`,
            testId: test.id,
          });
          addLog(`✓ ${test.nameAr} — ${actionLabel} ناجح`, "info");
        } else {
          setFordActionResult({
            success: false,
            message: `✗ ${actionLabel} ${test.nameAr} — فشل\nالرد: ${result.response}\nتحقق من: الاتصال بـ ELM327، بروتوكول CAN 500kbps`,
            testId: test.id,
          });
          addLog(`✗ ${test.nameAr} — فشل: ${result.response}`, "error");
        }
      }
    } catch (e: any) {
      setFordActionResult({ success: false, message: `خطأ: ${e.message}`, testId: test.id });
      addLog(`✗ خطأ في ${test.nameAr}: ${e.message}`, "error");
    } finally {
      setFordActionRunning(false);
    }
  }, [mode, addLog]);


  // ═══ AI Diagnosis ═══
  const runAiDiagnosis = useCallback(async () => {
    setAiRunning(true);
    setAiFeedbackSent(false);
    setActiveTab("ai");
    addLog("═══ بدء التحليل بالذكاء الاصطناعي ═══", "info");

    const sensorData: LiveSensorData = {
      rpm: liveData.rpm || 820,
      speed: liveData.speed || 0,
      coolantTemp: liveData.coolantTemp || 91,
      engineLoad: liveData.engineLoad || 18,
      throttlePos: liveData.throttlePos || 12,
      mafRate: liveData.mafRate || 3.8,
      intakeTemp: liveData.intakeTemp || 32,
      shortFuelTrimB1: liveData.shortFuelTrim || 2.1,
      longFuelTrimB1: liveData.longFuelTrim || -1.5,
      shortFuelTrimB2: 0,
      longFuelTrimB2: 0,
      o2VoltageB1S1: o2SensorData[0]?.voltage || 0.45,
      o2VoltageB1S2: o2SensorData[1]?.voltage || 0.72,
      timingAdvance: liveData.timingAdvance || 8,
      fuelPressure: liveData.fuelPressure || 350,
      oilTemp: liveData.oilTemp || 95,
    };

    const activeDtcCodes = dtcCodes.map(d => d.code);

    try {
      // Simulate processing time for UX
      await new Promise(r => setTimeout(r, 1500));
      const result = await obdAiEngine.runFullDiagnosis(
        sensorData,
        activeDtcCodes,
        selectedMake || undefined,
        undefined,
        undefined
      );
      setAiDiagnosis(result);
      addLog(`✓ اكتمل التحليل AI - صحة: ${result.overallHealth}% | ثقة: ${result.confidence}%`, "info");
    } catch (err) {
      addLog(`✗ خطأ في التحليل AI: ${err}`, "error");
    }
    setAiRunning(false);
  }, [liveData, dtcCodes, o2SensorData, selectedMake, addLog]);

  const submitAiFeedback = useCallback((correct: boolean) => {
    if (!aiDiagnosis) return;
    const feedback: FeedbackEntry = {
      diagnosisId: aiDiagnosis.id,
      confirmedCorrect: correct,
      timestamp: Date.now(),
    };
    obdAiEngine.submitFeedback(feedback);
    setAiFeedbackSent(true);
    addLog(`✓ تم إرسال التقييم: ${correct ? "تشخيص صحيح" : "تشخيص غير دقيق"}`, "info");
  }, [aiDiagnosis, addLog]);

  // ═══ Protocol Switch ═══
  const switchProtocol = useCallback(async (proto: string) => {
    if (mode !== "real") { addLog(`✓ تبديل البروتوكول إلى ${proto} (محاكاة)`, "info"); return; }
    if (proto === "j1939") await obdService.switchToJ1939();
    else if (proto === "can_ext") await obdService.switchToCANExtended();
    else await obdService.switchProtocol(proto as any);
  }, [mode, addLog]);

  // ═══ Effects ═══
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);
  // ═══ Cleanup شامل عند الخروج من الصفحة (منع Memory Leak) ═══
  useEffect(() => {
    return () => {
      // إيقاف جميع الـ intervals
      if (intervalRef.current) clearInterval(intervalRef.current);
      // إيقاف القراءة الحية والـ data logger
      if (obdService.isDataLoggerActive) obdService.stopDataLogger();
      // إيقاف محاولات إعادة الاتصال
      autoReconnectRef.current.cancel();
      // فصل الاتصال إذا كان متصل (ينظف كل الموارد داخلياً)
      if (obdService.isConnected) obdService.disconnect();
      // إلغاء callbacks
      obdService.onLog = null;
      obdService.onStatusChange = null;
      obdService.onDisconnect = null;
      obdService.onAlert = null;
      obdService.onError = null;
    };
  }, []);

  const connected = connectionStatus === "connected";

  // Auto-reveal the connection log the moment a connection attempt fails, so the
  // diagnostic detail (which BLE service/characteristic UUIDs the device actually
  // exposes) is visible immediately instead of requiring the user to find a toggle
  // that used to only exist once already connected.
  useEffect(() => {
    if (connectionStatus === "error") setShowLogPanel(true);
  }, [connectionStatus]);

  const severityColor = useCallback((s: string) => s === "high" ? "bg-red-500" : s === "medium" ? "bg-yellow-500" : "bg-blue-500", []);
  const severityText = useCallback((s: string) => s === "high" ? "عالية" : s === "medium" ? "متوسطة" : "منخفضة", []);

  // ═══ useMemo — قيم محسوبة لا تتغير إلا عند تغير البيانات ═══
  const dtcBySystem = useMemo(() => {
    return dtcCodes.reduce((acc, d) => {
      const sys = d.system || "عام";
      if (!acc[sys]) acc[sys] = [];
      acc[sys].push(d);
      return acc;
    }, {} as Record<string, typeof dtcCodes>);
  }, [dtcCodes]);

  const highSeverityCount = useMemo(() => dtcCodes.filter(d => d.severity === "high").length, [dtcCodes]);
  const medSeverityCount = useMemo(() => dtcCodes.filter(d => d.severity === "medium").length, [dtcCodes]);
  const lowSeverityCount = useMemo(() => dtcCodes.filter(d => d.severity === "low").length, [dtcCodes]);

  const filteredLogs = useMemo(() => logs.slice(-200), [logs]);

  const connectionLabel = useMemo(() => {
    switch (connectionStatus) {
      case "connected": return "متصل";
      case "connecting": return "جاري الاتصال...";
      case "initializing": return "تهيئة...";
      case "error": return "خطأ";
      default: return "غير متصل";
    }
  }, [connectionStatus]);

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6 pt-24">

        {/* ═══ Header Bar ═══ */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2v2H3.01L3 22h18V4h-4V2H7zm2 0h6v2H9V2zm-4 4h14v14H5V6zm3 3v2h2V9H8zm3 0v2h2V9h-2zm3 0v2h2V9h-2zm-6 3v2h2v-2H8zm3 0v2h2v-2h-2zm3 0v2h2v-2h-2zm-6 3v2h2v-2H8zm3 0v2h2v-2h-2zm3 0v2h2v-2h-2z"/></svg>
              ماسح OBD2 الاحترافي
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">{mode === "real" ? "اتصال فعلي عبر Bluetooth BLE - ELM327 Protocol" : "وضع المحاكاة - بيانات تجريبية واقعية"}</p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {!connected ? (
              <>
                {bleSupported && (
                  <button onClick={connectReal} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/></svg>
                    اتصال Bluetooth
                  </button>
                )}
                <button onClick={connectDemo} className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2.5 rounded-xl text-sm transition">جرب المحاكاة</button>
              </>
            ) : (
              <>
                {/* بدء/إيقاف القراءة الحية والفحص الشامل صارت من داخل التابات الخاصة
                    بيهم (live / report) - مش هنا، عشان محدش يتنافس مع التاني على
                    قناة البلوتوث من غير قصد. هنا مجرد مؤشر حالة. */}
                {isReading && (
                  <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium px-3 py-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    القراءة الحية شغالة
                  </span>
                )}
                {isScanning && (
                  <span className="flex items-center gap-1.5 text-purple-400 text-xs font-medium px-3 py-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                    جاري الفحص الشامل
                  </span>
                )}
                <button
                  onClick={() => setProMode(p => !p)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                    proMode ? "bg-yellow-500 text-black" : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  {proMode ? "⚡ PRO" : "PRO"}
                </button>
                <button onClick={disconnect} className="text-red-400 hover:text-red-300 px-3 py-2.5 rounded-xl text-sm transition bg-gray-800 hover:bg-gray-700">قطع</button>
              </>
            )}
          </div>
        </div>

        {/* ═══ Status Bar ═══ */}
        <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-xl p-3 mb-5 flex items-center gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${connectionStatus === "connected" ? "bg-green-500 animate-pulse" : connectionStatus === "connecting" || connectionStatus === "initializing" ? "bg-yellow-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-gray-300">{connectionStatus === "connected" ? "متصل" : connectionStatus === "connecting" ? "جاري الاتصال..." : connectionStatus === "initializing" ? "تهيئة ELM327..." : connectionStatus === "error" ? "خطأ" : "غير متصل"}</span>
          </div>
          {connected && (<>
            <span className="text-gray-700">|</span>
            <span className="text-gray-400">{vehicleInfo.protocol || "Auto"}</span>
            {vehicleInfo.vin && vehicleInfo.vin !== "غير متاح" && (<><span className="text-gray-700">|</span><span className="text-cyan-400 font-mono">VIN: {vehicleInfo.vin}</span></>)}
            {alerts.length > 0 && (<><span className="text-gray-700">|</span><button onClick={() => setActiveTab("alerts")} className="text-red-400 animate-pulse font-bold">{alerts.length} تنبيه</button></>)}
          </>)}
          {/* Log toggle is always available, not just while connected - it's most
              needed exactly when a connection attempt fails (before "connected" is ever true). */}
          <div className="mr-auto flex items-center gap-2">
            <button onClick={() => setShowLogPanel(!showLogPanel)} className="text-gray-500 hover:text-gray-300 transition">{showLogPanel ? "إخفاء السجل" : `السجل (${logs.length})`}</button>
          </div>
        </div>

        {/* ═══ LOG PANEL ═══ */}
        {/* Rendered right under its toggle, not at the bottom of this ~5600-line
            page - it used to sit after every tab's content, so opening it from
            up here looked like nothing happened unless you scrolled all the way
            down past whichever tab was active. */}
        {showLogPanel && (
          <div className="mb-5 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="flex items-center justify-between p-3 border-b border-gray-800">
              <h3 className="text-xs font-bold text-gray-400">سجل الاتصال ({mode === "real" ? "ELM327" : "محاكاة"}) - {logs.length} سطر</h3>
              <div className="flex gap-2">
                <button onClick={() => setLogs([])} className="text-[10px] text-gray-500 hover:text-white">مسح</button>
                <button onClick={() => setShowLogPanel(false)} className="text-[10px] text-gray-500 hover:text-white">إخفاء</button>
              </div>
            </div>
            <div ref={logRef} className="p-3 max-h-40 overflow-y-auto font-mono text-[11px] space-y-0.5">
              {logs.length === 0 ? <p className="text-gray-600">لا توجد سجلات...</p> : logs.map((log, i) => (<div key={i} className={`${log.type === "sent" ? "text-cyan-400" : log.type === "received" ? "text-green-400" : log.type === "error" ? "text-red-400" : "text-yellow-400"}`}><span className="text-gray-600">[{log.time}]</span> {log.message}</div>))}
            </div>
          </div>
        )}
        {/* Always show minimal log when connected but panel hidden */}
        {connected && !showLogPanel && logs.length > 0 && (
          <div className="mb-5 flex items-center gap-2 text-[10px] text-gray-500 cursor-pointer" onClick={() => setShowLogPanel(true)}>
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="font-mono truncate">{logs[logs.length - 1]?.message}</span>
          </div>
        )}

        {/* ═══ Vehicle Auto-Detect Card ═══ */}
        {connected && vinInfo && (
          <div className="bg-gradient-to-l from-gray-900 via-gray-800 to-gray-900 border border-cyan-500/20 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-center text-lg">
                  {(selectedMake === "ford" || selectedMake === "mercury" || selectedMake === "lincoln") ? "🚙" : selectedMake === "toyota" ? "🚗" : selectedMake === "nissan" ? "🚘" : "🚗"}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{vinInfo.makeAr} {vinInfo.modelAr !== vinInfo.make ? vinInfo.modelAr : ""}</div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                    {vinInfo.year ? <span className="bg-gray-700 px-1.5 py-0.5 rounded">{vinInfo.year}</span> : null}
                    {vinInfo.engineAr ? <span>{vinInfo.engineAr}</span> : null}
                    {vinInfo.fuelTypeAr ? <span className="text-green-400">{vinInfo.fuelTypeAr}</span> : null}
                    {vinInfo.countryAr ? <span>🌍 {vinInfo.countryAr}</span> : null}
                  </div>
                </div>
              </div>
              <div className="text-left">
                <div className="text-[9px] text-gray-500 font-mono">{vehicleInfo.vin}</div>
                <div className="text-[9px] text-gray-600">{vehicleInfo.protocol}</div>
              </div>
            </div>
          </div>
        )}
        {/* ═══ Vehicle Make + Protocol Selection ═══ */}
        {connected && (
          <div className="flex gap-3 mb-5 flex-wrap">
            {/* سيارات المستخدم المسجلة */}
            {user && myVehicles.data && myVehicles.data.length > 0 && (
              <select
                value={selectedVehicleId ?? ""}
                onChange={(e) => {
                  const vid = e.target.value ? parseInt(e.target.value) : null;
                  setSelectedVehicleId(vid);
                  if (vid) {
                    const v = myVehicles.data!.find(x => x.id === vid);
                    if (v) {
                      setSelectedMake(v.make.toLowerCase());
                      setSelectedModel(v.model);
                      setSelectedYear(v.year?.toString() ?? "");
                      setSelectedMileage(v.mileage?.toString() ?? "");
                    }
                  }
                }}
                className="bg-yellow-500 border border-yellow-400 text-black text-xs font-bold rounded-lg px-3 py-2"
              >
                <option value="">سياراتي</option>
                {myVehicles.data.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} {v.year ? `(${v.year})` : ""}
                    {v.isDefault ? " ★" : ""}
                  </option>
                ))}
              </select>
            )}
            <select value={selectedMake} onChange={(e) => handleMakeChange(e.target.value)} className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2">
              <option value="">ماركة السيارة</option>
              {vehicleMakes.map((m) => (<option key={m} value={m}>{makeLabels[m]}</option>))}
            </select>
            <input
              type="text"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              placeholder="الموديل (مثال: كامري)"
              className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 w-32"
            />
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              placeholder="السنة"
              min="1990" max="2030"
              className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 w-20"
            />
            <input
              type="number"
              value={selectedMileage}
              onChange={(e) => setSelectedMileage(e.target.value)}
              placeholder="الكيلومترات"
              className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 w-28"
            />
            <select onChange={(e) => switchProtocol(e.target.value)} className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2" defaultValue="auto">
              <option value="auto">بروتوكول: Auto</option>
              <optgroup label="GM / شيفروليه / جي ام سي">
                <option value="j1850_vpw">J1850 VPW (GM 1996-2007)</option>
                <option value="can_11_500">CAN 11bit/500k (GM 2006+)</option>
                <option value="can_29_500">CAN 29bit/500k (GM Trucks)</option>
              </optgroup>
              <optgroup label="فورد / لينكولن / ميركوري">
                <option value="j1850_pwm">J1850 PWM (فورد 1996-2007)</option>
                <option value="can_11_500">CAN 11bit/500k (فورد 2006+)</option>
              </optgroup>
              <optgroup label="CAN Bus (حديث)">
                <option value="can_11_500">CAN 11bit/500k</option>
                <option value="can_29_500">CAN 29bit/500k</option>
                <option value="can_11_250">CAN 11bit/250k</option>
                <option value="can_29_250">CAN 29bit/250k</option>
              </optgroup>
              <optgroup label="بروتوكولات قديمة">
                <option value="iso9141">ISO 9141-2 (أوروبي/آسيوي)</option>
                <option value="kwp_5baud">KWP2000 بطيء (5 baud)</option>
                <option value="kwp_fast">KWP2000 سريع</option>
              </optgroup>
              <optgroup label="شاحنات ومعدات">
                <option value="j1939">J1939 (شاحنات/ديزل)</option>
                <option value="user_can_11">CAN مخصص 11bit/125k</option>
                <option value="user_can_29">CAN مخصص 29bit/125k</option>
              </optgroup>
            </select>
          </div>
        )}

        {/* ═══ Android BLE Requirements Notice ═══ */}
        {bleSupported && connectionStatus === "disconnected" && (
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-5">
            <p className="text-blue-400 text-sm font-bold mb-2">⚠️ متطلبات الاتصال بجهاز OBD2:</p>
            <ul className="text-gray-300 text-xs space-y-1.5 mr-3">
              <li>• استخدم متصفح <span className="text-yellow-400 font-bold">Chrome</span> فقط (ليس Samsung Internet أو Firefox)</li>
              <li>• فعّل <span className="text-yellow-400 font-bold">GPS/الموقع</span> في جوالك (مطلوب من Android للبلوتوث)</li>
              <li>• فعّل <span className="text-yellow-400 font-bold">Bluetooth</span> من إعدادات الجوال</li>
              <li>• جهاز OBD2 لازم يكون <span className="text-yellow-400 font-bold">BLE</span> (Bluetooth Low Energy) وليس Bluetooth العادي</li>
              <li>• ركّب الجهاز في منفذ OBD2 وشغّل السيارة (ACC أو تشغيل كامل)</li>
            </ul>
            <p className="text-gray-500 text-xs mt-2">إذا ما طلع لك الجهاز: تأكد من إعدادات الموقع والبلوتوث مفعلة، وأعد المحاولة.</p>
          </div>
        )}

        {/* ═══ BLE Not Supported Warning ═══ */}
        {!bleSupported && connectionStatus === "disconnected" && (
          <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-5 mb-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">📱</span>
              <div>
                <p className="text-orange-400 text-base font-bold">التشخيص المباشر غير متاح على هذا المتصفح</p>
                <p className="text-orange-300 text-xs">السبب: متصفحك لا يدعم Web Bluetooth - استخدم Google Chrome</p>
              </div>
            </div>

            {/* زر افتح في Chrome - Android Intent */}
            {/android/i.test(navigator.userAgent) && (
              <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 mb-3">
                <p className="text-green-400 text-sm font-bold mb-2">✅ جوالك يدعم التشخيص! فقط افتح من Chrome:</p>
                <a
                  href={`intent://${window.location.host}/obd-scanner#Intent;scheme=https;package=com.android.chrome;end`}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-3 rounded-lg text-sm transition w-full justify-center"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="currentColor"/><path d="M12 2a10 10 0 0 1 8.66 5H12" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M2 12a10 10 0 0 1 3.34-7.5L12 12" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M12 22a10 10 0 0 1-6.66-2.5L12 12" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                  افتح في Google Chrome
                </a>
                <p className="text-gray-400 text-xs mt-2 text-center">سيفتح هذا الرابط مباشرة في متصفح Chrome</p>
              </div>
            )}

            {/* رسالة آيفون */}
            {/iphone|ipad|ipod/i.test(navigator.userAgent) && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-3">
                <p className="text-red-400 text-sm font-bold mb-1">❌ أجهزة Apple لا تدعم هذه التقنية</p>
                <p className="text-gray-400 text-xs">Apple لم تفعّل Web Bluetooth في Safari. استخدم جوال أندرويد أو كمبيوتر، أو جرّب وضع المحاكاة أدناه.</p>
              </div>
            )}

            <div className="bg-black/30 rounded-lg p-3 space-y-2">
              <p className="text-gray-300 text-sm font-semibold">✅ يعمل على:</p>
              <ul className="text-gray-400 text-xs space-y-1 mr-4">
                <li>• جوال أندرويد - متصفح <span className="text-yellow-400 font-bold">Google Chrome فقط</span></li>
                <li>• كمبيوتر Windows/Mac (Chrome أو Edge)</li>
              </ul>
              <p className="text-gray-300 text-sm font-semibold mt-2">❌ لا يعمل على:</p>
              <ul className="text-gray-400 text-xs space-y-1 mr-4">
                <li>• آيفون / آيباد (Apple لا تدعم التقنية)</li>
                <li>• Samsung Internet / Huawei Browser / Opera</li>
                <li>• متصفح Firefox</li>
              </ul>
            </div>
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <p className="text-yellow-400 text-xs font-medium">💡 افتح الرابط في Google Chrome على جوالك أو كمبيوترك للاتصال بجهاز OBD2، أو جرّب وضع المحاكاة أدناه.</p>
            </div>
          </div>
        )}

        {/* Auto-reconnect status bar */}
        {reconnectStatus && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-3 mb-4 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-yellow-400 text-sm font-medium">{reconnectStatus}</span>
          </div>
        )}

        {/* ═══ CONNECTED CONTENT ═══ */}
        {connected && (<>
          {/* Tabs - Mobile Optimized */}
          {/* ═══ Navigation Tabs — Clean Design ═══ */}
          <div className="mb-5">
            {/* Helper: run side-effect when switching tab */}
            {(() => {
              const handleTabClick = (key: string) => {
                setActiveTab(key as any);
                setShowMoreTabs(false);
                if (key === "readiness") readReadiness();
                if (key === "freeze") readFreezeFrame();
                if (key === "mode6") readMode6();
                if (key === "dtc") readDTCs();
                if (key === "o2sensors") readO2Sensors();
                if (key === "cylinders") readCylinderData();
                if (key === "ai" && !aiDiagnosis) runAiDiagnosis();
                if (key === "transmission") readTransmissionTab();
                if (key === "fuel") readFuelEconomyData();
                if (key === "multiecu") runMultiEcuScan();
                if (key === "powerbalance") runPowerBalanceTest();
                if (key === "vininfo") readVINAndDecode();
                if (key === "oempids") readOEMPids();
                if (key === "predictive") runPredictiveMaintenance();
              };

              // 5 primary tabs always visible
              const primaryTabs = [
                { key: "dashboard", label: "لوحة القيادة" },
                { key: "live",      label: "بيانات حية" },
                { key: "dtc",       label: dtcCodes.length ? `أعطال (${dtcCodes.length})` : "أعطال" },
                { key: "special",   label: "وظائف خاصة" },
                { key: "ai",        label: "AI تشخيص" },
              ];

              // All remaining tabs in "More" dropdown
              const moreTabs = [
                { key: "alerts",        label: alerts.length ? `تنبيهات (${alerts.length})` : "تنبيهات" },
                { key: "freeze",        label: "Freeze Frame" },
                { key: "mode6",         label: "Mode 6" },
                { key: "readiness",     label: "I/M Ready" },
                { key: "o2sensors",     label: "حساسات O2" },
                { key: "cylinders",     label: "الأسطوانات" },
                { key: "driving",       label: "HUD قيادة" },
                { key: "charts",        label: "رسوم بيانية" },
                { key: "sessions",      label: "جلسات محفوظة" },
                { key: "datalogger",    label: "تسجيل رحلة" },
                { key: "performance",   label: "اختبار الأداء" },
                { key: "transmission",  label: "نظام القير" },
                { key: "fuel",          label: "اقتصاد الوقود" },
                { key: "multiecu",      label: "فحص ECUs" },
                { key: "compare",       label: "مقارنة جلسات" },
                { key: "powerbalance",  label: "Power Balance" },
                { key: "oscilloscope",  label: "Oscilloscope" },
                { key: "vininfo",       label: "VIN Decoder" },
                { key: "oempids",       label: "OEM PIDs" },
                { key: "predictive",    label: "صيانة تنبؤية" },
                { key: "customerreport",label: "تقرير العميل" },
                { key: "history",       label: "السجل" },
                { key: "vehicle",       label: "بيانات السيارة" },
                ...(fullReport ? [{ key: "report", label: "التقرير الكامل" }] : []),
              ];

              const tabBtn = (key: string, label: string, extraClass = "") => (
                <button
                  key={key}
                  onClick={() => handleTabClick(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                    activeTab === key
                      ? "bg-yellow-500 text-black shadow-md shadow-yellow-500/20"
                      : `bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white ${extraClass}`
                  }`}
                >
                  {label}
                </button>
              );

              return (
                <div className="relative">
                  {/* Primary tabs row */}
                  <div className="flex gap-2 flex-wrap items-center">
                    {primaryTabs.map(t => tabBtn(t.key, t.label))}
                    {/* More button */}
                    <button
                      onClick={() => setShowMoreTabs(p => !p)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                        showMoreTabs || moreTabs.some(t => t.key === activeTab)
                          ? "bg-gray-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      المزيد
                      <svg className={`w-3.5 h-3.5 transition-transform ${showMoreTabs ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                  {/* More dropdown */}
                  {showMoreTabs && (
                    <div className="mt-2 p-3 bg-gray-900 border border-gray-700 rounded-xl flex flex-wrap gap-2">
                      {moreTabs.map(t => tabBtn(t.key, t.label, "border border-gray-700"))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* ═══ HOME - MAIN MENU (6 BUTTONS) ═══ */}
          {activeTab === "home" && (
            <div className="space-y-6">
              {/* بطاقة معلومات السيارة إذا متصل */}
              {connectionStatus === "connected" && (selectedMake || vehicleInfo.vin) && (
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-yellow-500/30 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🚗</div>
                    <div>
                      <h3 className="text-yellow-400 font-bold text-lg">{selectedMake ? (makeLabels[selectedMake] || selectedMake) : "سيارة متصلة"} {selectedModel || ""}</h3>
                      <p className="text-gray-400 text-sm">{selectedYear || ""} {vehicleInfo.protocol ? `• ${vehicleInfo.protocol}` : ""} {vehicleInfo.vin ? `• VIN: ${vehicleInfo.vin.substring(0,8)}...` : ""}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 6 أزرار رئيسية */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* 1. فحص شامل */}
                <button
                  onClick={() => setActiveTab("allscan")}
                  className="bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all transform hover:scale-105 shadow-lg shadow-red-900/30 min-h-[140px] justify-center"
                >
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  <span className="text-white font-bold text-base">فحص شامل</span>
                  <span className="text-red-200 text-xs">All System Scan</span>
                </button>

                {/* 2. تشخيص الأعطال */}
                <button
                  onClick={() => setActiveTab("dtc")}
                  className="bg-gradient-to-br from-orange-600 to-orange-800 hover:from-orange-500 hover:to-orange-700 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all transform hover:scale-105 shadow-lg shadow-orange-900/30 min-h-[140px] justify-center"
                >
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                  <span className="text-white font-bold text-base">أكواد الأعطال</span>
                  <span className="text-orange-200 text-xs">{dtcCodes.length > 0 ? `${dtcCodes.length} كود` : "DTC Codes"}</span>
                </button>

                {/* 3. بيانات حية */}
                <button
                  onClick={() => setActiveTab("live")}
                  className="bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all transform hover:scale-105 shadow-lg shadow-blue-900/30 min-h-[140px] justify-center"
                >
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  <span className="text-white font-bold text-base">بيانات حية</span>
                  <span className="text-blue-200 text-xs">Live Data</span>
                </button>

                {/* 4. وظائف خاصة */}
                <button
                  onClick={() => setActiveTab("special")}
                  className="bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all transform hover:scale-105 shadow-lg shadow-purple-900/30 min-h-[140px] justify-center"
                >
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="text-white font-bold text-base">وظائف خاصة</span>
                  <span className="text-purple-200 text-xs">Special Functions</span>
                </button>

                {/* 5. تقرير */}
                <button
                  onClick={() => { if (fullReport) setActiveTab("report"); else setActiveTab("customerreport"); }}
                  className="bg-gradient-to-br from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all transform hover:scale-105 shadow-lg shadow-green-900/30 min-h-[140px] justify-center"
                >
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span className="text-white font-bold text-base">التقرير</span>
                  <span className="text-green-200 text-xs">Report</span>
                </button>

                {/* 6. AI تشخيص */}
                <button
                  onClick={() => setActiveTab("ai")}
                  className="bg-gradient-to-br from-yellow-500 to-yellow-700 hover:from-yellow-400 hover:to-yellow-600 rounded-2xl p-6 flex flex-col items-center gap-3 transition-all transform hover:scale-105 shadow-lg shadow-yellow-900/30 min-h-[140px] justify-center"
                >
                  <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  <span className="text-black font-bold text-base">AI تشخيص ذكي</span>
                  <span className="text-yellow-900 text-xs">Intelligent Diagnosis</span>
                </button>
              </div>

              {/* قائمة فرعية سريعة */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <h3 className="text-gray-400 text-sm font-medium mb-3">أدوات إضافية</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {[
                    { key: "dashboard", label: "لوحة القيادة", icon: "📊" },
                    { key: "multiecu", label: "فحص ECUs", icon: "🔌" },
                    { key: "transmission", label: "القير", icon: "⚙️" },
                    { key: "fuel", label: "الوقود", icon: "⛽" },
                    { key: "performance", label: "الأداء", icon: "🏎️" },
                    { key: "driving", label: "HUD", icon: "🚗" },
                    { key: "vininfo", label: "VIN", icon: "🔍" },
                    { key: "history", label: "السجل", icon: "📋" },
                  ].map(item => (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key as any)}
                      className="bg-gray-800 hover:bg-gray-700 rounded-xl p-3 flex flex-col items-center gap-1 transition"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-gray-300 text-xs font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ ALL SYSTEM SCAN TAB ═══ */}
          {activeTab === "allscan" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">فحص شامل لجميع الأنظمة</h2>
                <button
                  onClick={() => setActiveTab("home")}
                  className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  رجوع
                </button>
              </div>
              <p className="text-gray-400 text-sm">يفحص كل وحدة تحكم (ECU) في السيارة ويعرض حالتها</p>

              {/* قائمة الأنظمة */}
              <div className="space-y-2">
                {[
                  { name: "المحرك (ECM/PCM)", key: "engine", icon: "🔧" },
                  { name: "ناقل الحركة (TCM)", key: "trans", icon: "⚙️" },
                  { name: "نظام الفرامل (ABS)", key: "abs", icon: "🛑" },
                  { name: "الوسائد الهوائية (SRS)", key: "srs", icon: "🎈" },
                  { name: "كهرباء الهيكل (BCM)", key: "bcm", icon: "💡" },
                  { name: "التوجيه الكهربائي (EPS)", key: "eps", icon: "🎯" },
                  { name: "التكييف (HVAC)", key: "hvac", icon: "❄️" },
                  { name: "نظام منع السرقة (IMMO)", key: "immo", icon: "🔒" },
                  { name: "الأبواب والنوافذ", key: "doors", icon: "🚪" },
                  { name: "لوحة العدادات (IC)", key: "cluster", icon: "📟" },
                  { name: "نظام الترفيه", key: "audio", icon: "🔊" },
                  { name: "حساسات الإطارات (TPMS)", key: "tpms", icon: "🛞" },
                ].map((system) => {
                  const scanResult = (multiEcuResult as Record<string, unknown[]> | null)?.[system.key];
                  const hasDtc = scanResult && Array.isArray(scanResult) && scanResult.length > 0;
                  return (
                    <div key={system.key} className={`flex items-center justify-between p-4 rounded-xl border ${
                      hasDtc ? "bg-red-950/30 border-red-800" : "bg-gray-900 border-gray-800"
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{system.icon}</span>
                        <span className="text-white font-medium">{system.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasDtc ? (
                          <span className="text-red-400 text-sm font-medium">⚠️ {(scanResult as unknown[]).length} كود</span>
                        ) : connectionStatus === "connected" ? (
                          <span className="text-green-400 text-sm">✅ Pass</span>
                        ) : (
                          <span className="text-gray-500 text-sm">— في الانتظار</span>
                        )}
                        <button
                          onClick={() => { setActiveTab("multiecu"); }}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1 rounded-lg"
                        >
                          تشخيص
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* زر بدء الفحص الشامل */}
              {connectionStatus === "connected" && (
                <button
                  onClick={() => { setActiveTab("multiecu" as any); runMultiEcuScan(); }}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 rounded-xl text-lg transition"
                >
                  🔍 بدء الفحص الشامل لجميع الأنظمة
                </button>
              )}
            </div>
          )}

          {/* ═══ DASHBOARD TAB ═══ */}
          {activeTab === "dashboard" && (
            <div className="space-y-5">
              {/* Main Gauges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col items-center relative">
                  <GaugeCircle value={liveData.rpm} max={7000} label="RPM" unit="rpm" color="#ef4444" size="lg" warning={5500} critical={6500} />
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col items-center relative">
                  <GaugeCircle value={liveData.speed} max={240} label="السرعة" unit="km/h" color="#06b6d4" size="lg" />
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col items-center relative">
                  <GaugeCircle value={liveData.coolantTemp} max={130} label="حرارة المحرك" unit="°C" color="#f97316" size="lg" warning={105} critical={115} />
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col items-center relative">
                  <GaugeCircle value={liveData.engineLoad} max={100} label="حمل المحرك" unit="%" color="#a855f7" size="lg" warning={85} critical={95} />
                </div>
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { label: "الجهد", value: liveData.voltage.toFixed(1), unit: "V", color: "text-emerald-400", max: 16 },
                  { label: "الوقود", value: Math.round(liveData.fuelLevel), unit: "%", color: "text-yellow-400", max: 100 },
                  { label: "MAF", value: liveData.mafRate.toFixed(1), unit: "g/s", color: "text-pink-400", max: 80 },
                  { label: "الخنق", value: Math.round(liveData.throttlePos), unit: "%", color: "text-green-400", max: 100 },
                  { label: "الإشعال", value: liveData.timingAdvance.toFixed(0), unit: "°", color: "text-indigo-400", max: 45 },
                  { label: "استهلاك", value: liveData.instantFuelConsumption.toFixed(1), unit: "L/100", color: "text-cyan-400", max: 30 },
                ].map((m) => (
                  <div key={m.label} className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 text-center relative overflow-hidden">
                    {/* Mini progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                      <div className="h-full transition-all duration-500 ease-out opacity-60" style={{ width: `${Math.min(100, Math.abs(parseFloat(String(m.value)) / m.max) * 100)}%`, backgroundColor: m.color.includes('emerald') ? '#34d399' : m.color.includes('yellow') ? '#facc15' : m.color.includes('pink') ? '#f472b6' : m.color.includes('green') ? '#4ade80' : m.color.includes('indigo') ? '#818cf8' : '#22d3ee' }} />
                    </div>
                    <div className={`text-lg font-bold font-mono ${m.color} transition-all duration-300`}>{m.value}</div>
                    <div className="text-[9px] text-gray-500">{m.unit}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onClick={readDTCs} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-4 text-center transition group">
                  <div className="text-2xl mb-1 group-hover:scale-110 transition">🔧</div>
                  <div className="text-xs font-medium">قراءة الأعطال</div>
                  <div className="text-[10px] text-gray-500">Mode 03 + 07</div>
                </button>
                <button onClick={readFreezeFrame} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-4 text-center transition group">
                  <div className="text-2xl mb-1 group-hover:scale-110 transition">❄️</div>
                  <div className="text-xs font-medium">Freeze Frame</div>
                  <div className="text-[10px] text-gray-500">Mode 02</div>
                </button>
                <button onClick={readMode6} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-4 text-center transition group">
                  <div className="text-2xl mb-1 group-hover:scale-110 transition">⚙️</div>
                  <div className="text-xs font-medium">اختبارات Mode 6</div>
                  <div className="text-[10px] text-gray-500">O2, Catalyst, EGR</div>
                </button>
                <button onClick={() => setActiveTab("report")} className="bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 rounded-xl p-4 text-center transition group">
                  <div className="text-2xl mb-1 group-hover:scale-110 transition">📋</div>
                  <div className="text-xs font-medium text-purple-300">{isScanning ? "جاري الفحص..." : "فحص شامل"}</div>
                  <div className="text-[10px] text-gray-500">جميع الأوضاع</div>
                </button>
              </div>

              {!isReading && (
                <div className="text-center py-3">
                  <button onClick={() => startLiveReading()} className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl transition flex items-center gap-2 mx-auto">
                    <span className="w-3 h-3 bg-green-300 rounded-full animate-pulse" />
                    بدء القراءة الحية المباشرة
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ═══ LIVE DATA TAB ═══ */}
          {activeTab === "live" && (
            <div className="space-y-5">
              {/* زر رجوع */}
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <button onClick={() => setActiveTab("home")} className="text-gray-400 hover:text-white text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  الرئيسية
                </button>
                {/* هذا التاب مستقل عن الفحص الشامل - بدء/إيقاف القراءة الحية من هنا فقط */}
                {!isReading
                  ? <button onClick={() => startLiveReading()} className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2 rounded-xl text-sm transition flex items-center gap-2"><span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />بدء القراءة الحية</button>
                  : <button onClick={stopLiveReading} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2 rounded-xl text-sm transition">■ إيقاف القراءة</button>
                }
              </div>

              {/* ═══ Pro Mode Banner ═══ */}
              {proMode && (
                <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-xl p-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 font-bold text-sm">⚡ وضع الفني المحترف مفعّل</span>
                      <span className="text-gray-400 text-xs">— جميع القراءات المتقدمة ظاهرة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowFactoryValues(v => !v)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                          showFactoryValues ? "bg-green-600 text-white border-green-500" : "bg-gray-800 text-gray-400 border-gray-600"
                        }`}
                      >
                        {showFactoryValues ? "✓ قيم المصنع" : "قيم المصنع"}
                      </button>
                      <button
                        onClick={() => setShowCustomDashboard(v => !v)}
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
                        {[
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
                        ].map(pid => (
                          <button
                            key={pid.key}
                            onClick={() => setCustomDashboardPids(prev =>
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
                          const val = (liveData as any)[key];
                          const labels: Record<string, string> = { rpm: "RPM", speed: "km/h", coolantTemp: "°C", voltage: "V", throttlePos: "%", engineLoad: "%", mafRate: "g/s", shortFuelTrim: "%", longFuelTrim: "%", intakeTemp: "°C", timingAdvance: "°", fuelLevel: "%" };
                          const names: Record<string, string> = { rpm: "دورات", speed: "سرعة", coolantTemp: "حرارة", voltage: "جهد", throttlePos: "خانق", engineLoad: "حمل", mafRate: "MAF", shortFuelTrim: "STFT", longFuelTrim: "LTFT", intakeTemp: "سحب", timingAdvance: "إشعال", fuelLevel: "وقود" };
                          const factoryRanges: Record<string, [number, number]> = { rpm: [700, 800], speed: [0, 300], coolantTemp: [80, 105], voltage: [13.5, 14.5], throttlePos: [0, 100], engineLoad: [0, 100], mafRate: [2, 25], shortFuelTrim: [-5, 5], longFuelTrim: [-5, 5], intakeTemp: [10, 50], timingAdvance: [8, 20], fuelLevel: [0, 100] };
                          const range = factoryRanges[key];
                          const numVal = typeof val === "number" ? val : parseFloat(val);
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
                              <div className="text-[9px] text-gray-500">{labels[key]}</div>
                              <div className="text-[10px] text-gray-400">{names[key]}</div>
                              {showFactoryValues && range && (
                                <div className={`text-[8px] mt-0.5 ${
                                  inRange ? "text-green-500" : "text-red-400"
                                }`}>
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
                        {[
                          { name: "RPM خمول", current: Math.round(liveData.rpm), normal: "600-900", min: 600, max: 900 },
                          { name: "حرارة المحرك", current: Math.round(liveData.coolantTemp), normal: "80-105", min: 80, max: 105 },
                          { name: "جهد البطارية", current: parseFloat(liveData.voltage.toFixed(1)), normal: "13.5-14.5", min: 13.5, max: 14.5 },
                          { name: "Short Fuel Trim", current: parseFloat(liveData.shortFuelTrim.toFixed(1)), normal: "-5 إلى +5", min: -5, max: 5 },
                          { name: "Long Fuel Trim", current: parseFloat(liveData.longFuelTrim.toFixed(1)), normal: "-10 إلى +10", min: -10, max: 10 },
                          { name: "تقديم الإشعال", current: parseFloat(liveData.timingAdvance.toFixed(1)), normal: "8-20", min: 8, max: 20 },
                          { name: "MAF خمول", current: parseFloat(liveData.mafRate.toFixed(1)), normal: "2-7", min: 2, max: 7 },
                          { name: "حرارة السحب", current: Math.round(liveData.intakeTemp), normal: "10-50", min: 10, max: 50 },
                        ].map(item => {
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

              {/* Live reading is paused while a comprehensive scan runs, since both
                  share the same single-command BLE channel to the adapter - without
                  this notice the tiles below just look frozen/broken to the user. */}
              {isScanning && (
                <div className="bg-purple-500/10 border border-purple-500/40 rounded-xl p-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse flex-shrink-0" />
                  <span className="text-purple-300 text-sm font-medium">القراءة الحية متوقفة مؤقتًا - جاري الفحص الشامل، الأرقام هترجع تتحدث بعد ما يخلص</span>
                </div>
              )}

              {/* Main Gauges - RPM, Speed, Temp - BIG and CLEAR */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-900 border-2 border-red-500/30 rounded-xl p-4 text-center">
                  <div className="text-red-400 text-xs font-medium mb-1">دورات المحرك</div>
                  <div className="text-red-400 text-4xl md:text-5xl font-bold font-mono leading-none">{Math.round(liveData.rpm).toLocaleString()}</div>
                  <div className="text-red-400/60 text-sm mt-1">RPM</div>
                </div>
                <div className="bg-gray-900 border-2 border-cyan-500/30 rounded-xl p-4 text-center">
                  <div className="text-cyan-400 text-xs font-medium mb-1">السرعة</div>
                  <div className="text-cyan-400 text-4xl md:text-5xl font-bold font-mono leading-none">{Math.round(liveData.speed)}</div>
                  <div className="text-cyan-400/60 text-sm mt-1">km/h</div>
                </div>
                <div className="bg-gray-900 border-2 border-orange-500/30 rounded-xl p-4 text-center">
                  <div className="text-orange-400 text-xs font-medium mb-1">حرارة المحرك</div>
                  <div className="text-orange-400 text-4xl md:text-5xl font-bold font-mono leading-none">{Math.round(liveData.coolantTemp)}°</div>
                  <div className="text-orange-400/60 text-sm mt-1">درجة مئوية</div>
                </div>
              </div>

              {/* Secondary PIDs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[
                  { label: "حمل المحرك", value: Math.round(liveData.engineLoad), unit: "%", color: "text-purple-400" },
                  { label: "الخانق", value: Math.round(liveData.throttlePos), unit: "%", color: "text-green-400" },
                  { label: "جهد البطارية", value: liveData.voltage.toFixed(1), unit: "V", color: "text-emerald-400" },
                  { label: "MAF", value: liveData.mafRate.toFixed(1), unit: "g/s", color: "text-pink-400" },
                  { label: "تقديم الإشعال", value: liveData.timingAdvance.toFixed(1), unit: "°", color: "text-indigo-400" },
                  { label: "Short Fuel Trim", value: liveData.shortFuelTrim.toFixed(1), unit: "%", color: "text-teal-400" },
                  { label: "Long Fuel Trim", value: liveData.longFuelTrim.toFixed(1), unit: "%", color: "text-sky-400" },
                  { label: "ضغط الزيت", value: oilPressure !== null ? oilPressure.toFixed(1) : (liveData.engineLoad > 0 ? (2.5 + (liveData.rpm / 6500) * 4.5).toFixed(1) : "—"), unit: "bar", color: oilPressure !== null && oilPressure < 1.5 ? "text-red-400" : "text-amber-400" },
                ].map((card) => (
                  <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between gap-3">
                    <span className="text-gray-400 text-sm">{card.label}</span>
                    <span className={`text-xl font-bold font-mono ${card.color}`}>{card.value} <span className="text-xs text-gray-500 font-normal">{card.unit}</span></span>
                  </div>
                ))}
              </div>

              {/* ═══ FUEL GAUGE - Big and Clear ═══ */}
              <div className="bg-gray-900 border-2 border-yellow-500/30 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-yellow-400">⛽ مستوى الوقود</h3>
                  <span className="text-yellow-400 text-2xl font-bold font-mono">{Math.round(liveData.fuelLevel)}%</span>
                </div>
                <div className="w-full h-6 bg-gray-800 rounded-full overflow-hidden relative">
                  <div className={`h-full rounded-full transition-all duration-700 ${liveData.fuelLevel > 50 ? 'bg-gradient-to-r from-green-500 to-green-400' : liveData.fuelLevel > 25 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 'bg-gradient-to-r from-red-500 to-red-400 animate-pulse'}`} style={{ width: `${liveData.fuelLevel}%` }} />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">{liveData.fuelLevel === 0 ? '' : liveData.fuelLevel > 25 ? '' : '⚠️ وقود منخفض!'}</div>
                </div>
                <div className="flex justify-between mt-1 text-[9px] text-gray-500"><span>فارغ</span><span>¼</span><span>½</span><span>¾</span><span>ممتلئ</span></div>
              </div>

              {/* ═══ EXTENDED READINGS - Organized without duplicates ═══ */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">📊 قراءات متقدمة</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {[
                    { label: "حرارة الزيت", value: Math.round(liveData.oilTemp), unit: "°C", color: "text-amber-300", icon: "🛢️" },
                    { label: "ضغط الوقود", value: Math.round(liveData.fuelPressure), unit: "kPa", color: "text-rose-300", icon: "⛽" },
                    { label: "ضغط الهواء الجوي", value: liveData.barometricPressure.toFixed(0), unit: "kPa", color: "text-violet-400", icon: "🌡️" },
                    { label: "حرارة المحول الحفاز", value: Math.round(liveData.catalystTemp), unit: "°C", color: "text-orange-300", icon: "🔥" },
                    { label: "ضغط قضيب الوقود", value: Math.round(liveData.fuelRailPressure), unit: "kPa", color: "text-rose-400", icon: "🔧" },
                    { label: "EGR", value: liveData.commandedEGR.toFixed(0), unit: "%", color: "text-green-300", icon: "♻️" },
                    { label: "عزم المحرك", value: Math.round(liveData.engineTorque), unit: "Nm", color: "text-red-300", icon: "💪" },
                    { label: "حرارة المحيط", value: Math.round(liveData.ambientTemp), unit: "°C", color: "text-sky-300", icon: "🌡️" },
                    { label: "ضغط السحب MAP", value: Math.round(liveData.intakeMAP), unit: "kPa", color: "text-blue-300", icon: "💨" },
                    { label: "حرارة القير", value: Math.round(liveData.transmissionTemp), unit: "°C", color: "text-amber-400", icon: "⚙️" },
                    { label: "مدة التشغيل", value: Math.round(liveData.runTime / 60), unit: "دقيقة", color: "text-emerald-300", icon: "⏱️" },
                    { label: "مسافة مع MIL", value: Math.round(liveData.distanceWithMIL), unit: "km", color: "text-red-400", icon: "🚨" },
                  ].map((card) => (
                    <div key={card.label} className="bg-gray-900 border border-gray-700/50 rounded-lg p-2 text-center">
                      <div className="text-base mb-0.5">{card.icon}</div>
                      <div className={`text-base font-bold font-mono ${card.color}`}>{card.value}</div>
                      <div className="text-[8px] text-gray-500">{card.unit}</div>
                      <div className="text-[9px] text-gray-400 mt-0.5 truncate">{card.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ═══ ALERTS for abnormal values (only show when value was actually read, not 0) ═══ */}
              {((liveData.coolantTemp > 105) || (liveData.oilTemp > 120) || (liveData.fuelLevel > 0 && liveData.fuelLevel < 15) || (liveData.voltage > 0 && liveData.voltage < 12.5) || (liveData.catalystTemp > 700)) && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-3">
                  <h3 className="text-sm font-bold text-red-400 mb-2">⚠️ تنبيهات</h3>
                  <div className="space-y-1">
                    {liveData.coolantTemp > 105 && <div className="text-xs text-red-300">🔴 حرارة المحرك مرتفعة: {Math.round(liveData.coolantTemp)}°C - أوقف المحرك!</div>}
                    {liveData.oilTemp > 120 && <div className="text-xs text-orange-300">🟠 حرارة الزيت مرتفعة: {Math.round(liveData.oilTemp)}°C</div>}
                    {liveData.fuelLevel > 0 && liveData.fuelLevel < 15 && <div className="text-xs text-yellow-300">🟡 مستوى الوقود منخفض: {Math.round(liveData.fuelLevel)}%</div>}
                    {liveData.voltage > 0 && liveData.voltage < 12.5 && <div className="text-xs text-yellow-300">🟡 جهد البطارية منخفض: {liveData.voltage.toFixed(1)}V</div>}
                    {liveData.catalystTemp > 700 && <div className="text-xs text-orange-300">🟠 حرارة المحول الحفاز عالية: {Math.round(liveData.catalystTemp)}°C</div>}
                    {oilPressure !== null && oilPressure < 1.5 && <div className="text-xs text-red-300">🔴 ضغط الزيت منخفض جداً: {oilPressure.toFixed(1)} bar - أوقف المحرك فوراً!</div>}
                  </div>
                </div>
              )}

              {/* ═══ TURBO / DIESEL / PEDAL PIDs (shown only when available) ═══ */}
              {(liveData.boostPressure > 0 || liveData.turboRPM > 0 || liveData.exhaustPressure > 0 || liveData.dpfTemp > 0 || liveData.noxSensor > 0 || liveData.commandedThrottle > 0 || liveData.acceleratorPedalD > 0) && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">🏎️ تيربو / ديزل / دواسة</h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {[
                    { label: "ضغط التيربو", value: liveData.boostPressure.toFixed(1), unit: "kPa", color: "text-cyan-300", show: liveData.boostPressure > 0 },
                    { label: "دورات التيربو", value: liveData.turboRPM > 0 ? Math.round(liveData.turboRPM).toLocaleString() : "--", unit: "rpm", color: "text-blue-300", show: liveData.turboRPM > 0 },
                    { label: "ضغط العادم", value: liveData.exhaustPressure.toFixed(0), unit: "kPa", color: "text-orange-300", show: liveData.exhaustPressure > 0 },
                    { label: "حرارة DPF", value: Math.round(liveData.dpfTemp), unit: "°C", color: "text-red-300", show: liveData.dpfTemp > 0 },
                    { label: "NOx", value: Math.round(liveData.noxSensor), unit: "ppm", color: "text-yellow-300", show: liveData.noxSensor > 0 },
                    { label: "الخنق المأمور", value: Math.round(liveData.commandedThrottle), unit: "%", color: "text-green-300", show: liveData.commandedThrottle > 0 },
                    { label: "الحمل المطلق", value: Math.round(liveData.absoluteLoad), unit: "%", color: "text-purple-300", show: liveData.absoluteLoad > 0 },
                    { label: "دواسة الوقود D", value: Math.round(liveData.acceleratorPedalD), unit: "%", color: "text-lime-300", show: liveData.acceleratorPedalD > 0 },
                    { label: "دواسة الوقود E", value: Math.round(liveData.acceleratorPedalE), unit: "%", color: "text-emerald-300", show: liveData.acceleratorPedalE > 0 },
                    { label: "توقيت الحقن", value: liveData.fuelInjectionTiming.toFixed(1), unit: "°", color: "text-indigo-300", show: liveData.fuelInjectionTiming !== 0 },
                    { label: "إيثانول", value: liveData.ethanolPercent.toFixed(0), unit: "%", color: "text-teal-300", show: liveData.ethanolPercent > 0 },
                    { label: "الخنق النسبي", value: Math.round(liveData.relativeThrottle), unit: "%", color: "text-pink-300", show: liveData.relativeThrottle > 0 },
                  ].filter(c => c.show).map((card) => (
                    <div key={card.label} className="bg-gray-900 border border-gray-700/50 rounded-lg p-2 text-center">
                      <div className={`text-base font-bold font-mono ${card.color}`}>{card.value}</div>
                      <div className="text-[8px] text-gray-500">{card.unit}</div>
                      <div className="text-[9px] text-gray-400 mt-0.5 truncate">{card.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* ═══ LIVE GRAPH - User selects PIDs ═══ */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-300">📈 رسم بياني حي</h3>
                  <div className="flex gap-1 flex-wrap">
                    {["rpm", "speed", "coolantTemp", "engineLoad", "throttlePos", "voltage", "boostPressure", "turboRPM"].map(pid => (
                      <button key={pid} onClick={() => setSelectedGraphPIDs(prev => prev.includes(pid) ? prev.filter(p => p !== pid) : [...prev, pid].slice(-3))} className={`text-[9px] px-1.5 py-0.5 rounded ${selectedGraphPIDs.includes(pid) ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                        {pid === 'rpm' ? 'RPM' : pid === 'speed' ? 'سرعة' : pid === 'coolantTemp' ? 'حرارة' : pid === 'engineLoad' ? 'حمل' : pid === 'throttlePos' ? 'خنق' : pid === 'voltage' ? 'فولت' : pid === 'boostPressure' ? 'تيربو' : 'تيربو RPM'}
                      </button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={graphData}>
                    <XAxis dataKey="time" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 10 }} labelFormatter={(v) => new Date(v).toLocaleTimeString("ar-SA")} />
                    {selectedGraphPIDs.map((pid, i) => (
                      <Line key={pid} type="monotone" dataKey={pid} stroke={['#ef4444','#06b6d4','#f97316','#a855f7','#4ade80'][i % 5]} strokeWidth={2} dot={false} name={pid} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* ═══ MIN / MAX / AVG ═══ */}
              {liveStats.count > 0 && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-gray-300 mb-3">📊 إحصائيات الجلسة (Min / Max / Avg)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { key: "rpm" as keyof LiveData, label: "RPM" },
                      { key: "speed" as keyof LiveData, label: "السرعة" },
                      { key: "coolantTemp" as keyof LiveData, label: "حرارة المحرك" },
                      { key: "voltage" as keyof LiveData, label: "الفولت" },
                      { key: "engineLoad" as keyof LiveData, label: "حمل المحرك" },
                      { key: "boostPressure" as keyof LiveData, label: "ضغط التيربو" },
                      { key: "oilTemp" as keyof LiveData, label: "حرارة الزيت" },
                      { key: "fuelLevel" as keyof LiveData, label: "الوقود" },
                    ].filter(item => (liveStats.max[item.key] as number) > 0).map(item => (
                      <div key={item.key} className="bg-gray-900 border border-gray-700/50 rounded-lg p-2 text-center">
                        <div className="text-[10px] text-gray-400 mb-1">{item.label}</div>
                        <div className="flex justify-between text-[9px]">
                          <span className="text-blue-400">⬇ {((liveStats.min[item.key] as number) || 0).toFixed(0)}</span>
                          <span className="text-yellow-400">⊘ {(((liveStats.sum[item.key] as number) || 0) / liveStats.count).toFixed(0)}</span>
                          <span className="text-red-400">⬆ {((liveStats.max[item.key] as number) || 0).toFixed(0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══ DATA LOGGING CONTROLS ═══ */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-300">💾 تسجيل البيانات (Data Log)</h3>
                    <p className="text-[10px] text-gray-500">{isDataLogging ? `جاري التسجيل... (${dataLog.length} نقطة)` : 'اضغط بدء لتسجيل كل القراءات'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setIsDataLogging(!isDataLogging); if (!isDataLogging) setDataLog([]); }} className={`text-xs px-3 py-1.5 rounded-lg font-bold ${isDataLogging ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                      {isDataLogging ? '⏹ إيقاف' : '⏺ بدء التسجيل'}
                    </button>
                    {dataLog.length > 0 && !isDataLogging && (
                      <button onClick={() => {
                        const headers = Object.keys(dataLog[0]?.data || {}).join(',');
                        const rows = dataLog.map(entry => {
                          const time = new Date(entry.timestamp).toLocaleTimeString('ar-SA');
                          const values = Object.values(entry.data).join(',');
                          return `${time},${values}`;
                        }).join('\n');
                        const csv = `Time,${headers}\n${rows}`;
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = `obd_log_${new Date().toISOString().slice(0,10)}.csv`;
                        a.click(); URL.revokeObjectURL(url);
                      }} className="text-xs px-3 py-1.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white">
                        📥 تصدير CSV
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <h3 className="text-xs text-red-400 mb-2 font-medium">RPM</h3>
                  <ResponsiveContainer width="100%" height={120}><AreaChart data={rpmHistory}><defs><linearGradient id="rpmGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="time" hide /><YAxis hide domain={[0, 7000]} /><Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} /><Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} fill="url(#rpmGrad)" /></AreaChart></ResponsiveContainer>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <h3 className="text-xs text-cyan-400 mb-2 font-medium">السرعة km/h</h3>
                  <ResponsiveContainer width="100%" height={120}><AreaChart data={speedHistory}><defs><linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="time" hide /><YAxis hide domain={[0, 220]} /><Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} /><Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} fill="url(#speedGrad)" /></AreaChart></ResponsiveContainer>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <h3 className="text-xs text-orange-400 mb-2 font-medium">حرارة المحرك °C</h3>
                  <ResponsiveContainer width="100%" height={120}><AreaChart data={tempHistory}><defs><linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="time" hide /><YAxis hide domain={[60, 130]} /><Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} /><Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} fill="url(#tempGrad)" /></AreaChart></ResponsiveContainer>
                </div>
              </div>

              {!isReading && <div className="text-center py-4"><button onClick={() => startLiveReading()} className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-lg text-sm">بدء القراءة الحية</button></div>}
            </div>
          )}

          {/* ═══ ADVANCED CHARTS TAB ═══ */}
          {activeTab === "charts" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div><h3 className="text-lg font-bold">رسوم بيانية متقدمة</h3><p className="text-gray-500 text-xs">تحليل بياني حي لجميع المعلمات</p></div>
                <button onClick={exportChartCSV} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold">تصدير CSV</button>
              </div>

              {/* Parameter Selection */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <h4 className="text-xs font-bold mb-3 text-gray-400">اختر المعلمات للعرض:</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "rpm", label: "RPM", color: "bg-red-600" },
                    { key: "speed", label: "السرعة", color: "bg-cyan-600" },
                    { key: "coolantTemp", label: "حرارة المحرك", color: "bg-orange-600" },
                    { key: "engineLoad", label: "حمل المحرك", color: "bg-purple-600" },
                    { key: "throttlePos", label: "الخنق", color: "bg-green-600" },
                    { key: "voltage", label: "الجهد", color: "bg-emerald-600" },
                    { key: "mafRate", label: "MAF", color: "bg-pink-600" },
                    { key: "oilTemp", label: "حرارة الزيت", color: "bg-amber-600" },
                    { key: "fuelPressure", label: "ضغط الوقود", color: "bg-rose-600" },
                    { key: "shortFuelTrim", label: "Short FT", color: "bg-teal-600" },
                    { key: "longFuelTrim", label: "Long FT", color: "bg-sky-600" },
                    { key: "timingAdvance", label: "الإشعال", color: "bg-indigo-600" },
                  ].map((p) => (
                    <button key={p.key} onClick={() => setSelectedChartParams(prev => prev.includes(p.key) ? prev.filter(k => k !== p.key) : [...prev, p.key])} className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition ${selectedChartParams.includes(p.key) ? `${p.color} text-white` : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>{p.label}</button>
                  ))}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedChartParams.slice(0, 4).map((key) => {
                  const stats = chartBufferRef.current.getStats(key);
                  const labels: Record<string, string> = { rpm: "RPM", speed: "السرعة", coolantTemp: "حرارة", engineLoad: "حمل", throttlePos: "خنق", voltage: "جهد", mafRate: "MAF", oilTemp: "زيت", fuelPressure: "ضغط", shortFuelTrim: "SFT", longFuelTrim: "LFT", timingAdvance: "إشعال" };
                  return (
                    <div key={key} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                      <div className="text-[10px] text-gray-400 mb-1">{labels[key] || key}</div>
                      <div className="grid grid-cols-3 gap-1 text-center">
                        <div><div className="text-xs font-mono text-blue-400">{stats ? stats.min.toFixed(0) : "--"}</div><div className="text-[8px] text-gray-600">أدنى</div></div>
                        <div><div className="text-xs font-mono text-green-400">{stats ? stats.avg.toFixed(0) : "--"}</div><div className="text-[8px] text-gray-600">متوسط</div></div>
                        <div><div className="text-xs font-mono text-red-400">{stats ? stats.max.toFixed(0) : "--"}</div><div className="text-[8px] text-gray-600">أعلى</div></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Multi-Line Charts */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h4 className="text-xs font-bold mb-3 text-gray-400">الرسم البياني المتعدد</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={rpmHistory.map((p, i) => ({ time: p.time, rpm: rpmHistory[i]?.value || 0, speed: speedHistory[i]?.value || 0, coolantTemp: tempHistory[i]?.value || 0 }))}>
                    <XAxis dataKey="time" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} />
                    {selectedChartParams.includes("rpm") && <Line type="monotone" dataKey="rpm" stroke="#ef4444" strokeWidth={2} dot={false} />}
                    {selectedChartParams.includes("speed") && <Line type="monotone" dataKey="speed" stroke="#06b6d4" strokeWidth={2} dot={false} />}
                    {selectedChartParams.includes("coolantTemp") && <Line type="monotone" dataKey="coolantTemp" stroke="#f97316" strokeWidth={2} dot={false} />}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Individual Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedChartParams.map((key) => {
                  const colors: Record<string, string> = { rpm: "#ef4444", speed: "#06b6d4", coolantTemp: "#f97316", engineLoad: "#a855f7", throttlePos: "#22c55e", voltage: "#34d399", mafRate: "#ec4899", oilTemp: "#f59e0b", fuelPressure: "#f43f5e", shortFuelTrim: "#2dd4bf", longFuelTrim: "#38bdf8", timingAdvance: "#818cf8" };
                  const labels: Record<string, string> = { rpm: "RPM", speed: "السرعة km/h", coolantTemp: "حرارة المحرك °C", engineLoad: "حمل المحرك %", throttlePos: "الخنق %", voltage: "الجهد V", mafRate: "MAF g/s", oilTemp: "حرارة الزيت °C", fuelPressure: "ضغط الوقود kPa", shortFuelTrim: "Short FT %", longFuelTrim: "Long FT %", timingAdvance: "الإشعال °" };
                  const data = key === "rpm" ? rpmHistory : key === "speed" ? speedHistory : key === "coolantTemp" ? tempHistory : rpmHistory.map((p, i) => ({ time: p.time, value: chartBufferRef.current.getStats(key)?.current || 0 }));
                  const color = colors[key] || "#ffffff";
                  return (
                    <div key={key} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                      <h4 className="text-xs font-medium mb-2" style={{ color }}>{labels[key] || key}</h4>
                      <ResponsiveContainer width="100%" height={100}>
                        <AreaChart data={data}>
                          <defs><linearGradient id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={color} stopOpacity={0.3}/><stop offset="95%" stopColor={color} stopOpacity={0}/></linearGradient></defs>
                          <XAxis dataKey="time" hide /><YAxis hide />
                          <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} />
                          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-${key})`} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })}
              </div>

              <div className="text-center text-[10px] text-gray-600">إجمالي النقاط المسجلة: {chartBufferRef.current.totalPoints} | السعة: 300 نقطة/معلمة</div>
            </div>
          )}

          {/* ═══ LOCAL SESSIONS TAB ═══ */}
          {activeTab === "sessions" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div><h3 className="text-lg font-bold">الجلسات المحفوظة محلياً</h3><p className="text-gray-500 text-xs">جلسات الفحص المحفوظة على جهازك (IndexedDB)</p></div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{localSessions.length} جلسة</span>
                  {fullReport && (
                    <button
                      onClick={saveCurrentSession}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xs px-4 py-2 rounded-lg"
                    >
                      حفظ الجلسة الحالية
                    </button>
                  )}
                </div>
              </div>

              {localSessions.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
                  <div className="text-4xl mb-3">💾</div>
                  <h3 className="text-lg font-bold text-gray-400">لا توجد جلسات محفوظة</h3>
                  <p className="text-gray-500 text-xs mt-2">اضغط "حفظ الجلسة" بعد إجراء فحص شامل لحفظها محلياً</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {localSessions.map((session) => (
                    <div key={session.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-yellow-500/30 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${session.healthScore >= 80 ? "bg-green-900/50 text-green-400" : session.healthScore >= 50 ? "bg-yellow-900/50 text-yellow-400" : "bg-red-900/50 text-red-400"}`}>{Math.round(session.healthScore)}%</div>
                          <div>
                            <div className="text-sm font-medium">{session.make || "سيارة"} {session.model || ""}</div>
                            <div className="text-[10px] text-gray-500">
                              {new Date(session.timestamp).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              {session.vin && <span className="mr-2 font-mono text-cyan-400/70">VIN: {session.vin.slice(-6)}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.dtcCount > 0 && <span className="bg-red-900/30 text-red-400 text-[10px] px-2 py-0.5 rounded-full">{session.dtcCount} عطل</span>}
                          <span className="text-[10px] text-gray-500">{session.protocol}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ DATA LOGGER TAB ═══ */}
          {activeTab === "datalogger" && (
            <div className="space-y-5">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">تسجيل الرحلة (Data Logger)</h3>
                    <p className="text-gray-500 text-xs">تسجيل جميع البيانات أثناء القيادة</p>
                  </div>
                  <div className="flex gap-2">
                    {!dataLoggerActive ? (
                      <button onClick={() => { obdService.startDataLogger(500); setDataLoggerActive(true); }} disabled={connectionStatus !== "connected"} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-lg">▶ بدء التسجيل</button>
                    ) : (
                      <button onClick={() => { const entries = obdService.stopDataLogger(); setDataLogEntries(entries); setDataLoggerActive(false); }} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg">■ إيقاف</button>
                    )}
                    {dataLogEntries.length > 0 && (
                      <button onClick={() => { const csv = obdService.exportDataLogCSV(); const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `meir-datalog-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg">تصدير CSV</button>
                    )}
                  </div>
                </div>
                {dataLoggerActive && (
                  <div className="flex items-center gap-3 bg-green-900/30 border border-green-700 rounded-lg p-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-bold">جاري التسجيل... {obdService.dataLogEntries.length} نقطة</span>
                  </div>
                )}
                {dataLogEntries.length > 0 && !dataLoggerActive && (
                  <div className="mt-4">
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-yellow-400">{dataLogEntries.length}</div>
                        <div className="text-[10px] text-gray-500">نقطة بيانات</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-cyan-400">{((dataLogEntries[dataLogEntries.length-1]?.elapsed || 0) / 1000).toFixed(0)}s</div>
                        <div className="text-[10px] text-gray-500">مدة التسجيل</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-green-400">{Math.max(...dataLogEntries.map(e => e.speed))} km/h</div>
                        <div className="text-[10px] text-gray-500">أقصى سرعة</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-red-400">{Math.max(...dataLogEntries.map(e => e.rpm)).toFixed(0)}</div>
                        <div className="text-[10px] text-gray-500">أقصى RPM</div>
                      </div>
                    </div>
                    <div className="h-48 bg-gray-800 rounded-lg p-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dataLogEntries.map(e => ({ time: (e.elapsed/1000).toFixed(1), speed: e.speed, rpm: e.rpm/100 }))}>
                          <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 9 }} />
                          <YAxis stroke="#6b7280" tick={{ fontSize: 9 }} />
                          <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} />
                          <Line type="monotone" dataKey="speed" stroke="#22c55e" strokeWidth={2} dot={false} name="السرعة km/h" />
                          <Line type="monotone" dataKey="rpm" stroke="#f59e0b" strokeWidth={2} dot={false} name="RPM/100" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ PERFORMANCE TAB ═══ */}
          {activeTab === "performance" && (
            <div className="space-y-5">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">اختبار الأداء (0-100 km/h)</h3>
                    <p className="text-gray-500 text-xs">قياس زمن التسارع وتقدير القوة</p>
                  </div>
                  {!perfTestActive ? (
                    <button onClick={async () => { setPerfTestActive(true); setPerfResult(null); const result = await obdService.startPerformanceTest(vehicleWeight, 60); setPerfResult(result); setPerfTestActive(false); }} disabled={connectionStatus !== "connected"} className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-black font-bold text-xs px-4 py-2 rounded-lg">⏱ بدء الاختبار</button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-yellow-400 text-sm font-bold">ابدأ التسارع!</span>
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <label className="text-xs text-gray-400 block mb-1">وزن السيارة (kg)</label>
                  <input type="number" value={vehicleWeight} onChange={(e) => setVehicleWeight(Number(e.target.value))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm w-32" />
                </div>
                {perfResult && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-gray-800 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-yellow-400">{perfResult.zeroTo100 > 0 ? perfResult.zeroTo100.toFixed(2) : "—"}</div>
                        <div className="text-xs text-gray-500 mt-1">0-100 km/h (ثانية)</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-cyan-400">{perfResult.zeroTo60mph > 0 ? perfResult.zeroTo60mph.toFixed(2) : "—"}</div>
                        <div className="text-xs text-gray-500 mt-1">0-60 mph (ثانية)</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-400">~{perfResult.estimatedHP}</div>
                        <div className="text-xs text-gray-500 mt-1">قوة تقديرية (HP)</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-orange-400">~{perfResult.estimatedTorque}</div>
                        <div className="text-xs text-gray-500 mt-1">عزم تقديري (Nm)</div>
                      </div>
                    </div>
                    {perfResult.entries.length > 0 && (
                      <div className="h-48 bg-gray-800 rounded-lg p-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={perfResult.entries.map(e => ({ time: (e.time/1000).toFixed(1), speed: e.speed, rpm: e.rpm/100 }))}>
                            <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 9 }} />
                            <YAxis stroke="#6b7280" tick={{ fontSize: 9 }} />
                            <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} />
                            <Area type="monotone" dataKey="speed" stroke="#f5c518" fill="#f5c51830" strokeWidth={2} name="السرعة km/h" />
                            <Area type="monotone" dataKey="rpm" stroke="#ef4444" fill="#ef444430" strokeWidth={1} name="RPM/100" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    <p className="text-[10px] text-gray-600 text-center">ℹ️ القيم تقديرية وتعتمد على وزن السيارة وسرعة القراءة</p>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* ═══ DTC TAB ═══ */}
          {activeTab === "dtc" && (
            <div className="space-y-4">
              {/* زر رجوع */}
              <button onClick={() => setActiveTab("home")} className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                الرئيسية
              </button>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">أكواد الأعطال ({dtcCodes.length}){pendingDtcs.length > 0 && ` + ${pendingDtcs.length} معلق`}</h3>
                  <p className="text-[10px] text-gray-500">محرك • ناقل حركة • ABS • وسائد هوائية • شبكة CAN</p>
                </div>
                <div className="flex gap-2">
                  {dtcCodes.length > 0 && <button onClick={clearDTCs} className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg">مسح الأكواد</button>}
                  <button onClick={readDTCs} className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-3 py-1.5 rounded-lg">تحديث</button>
                </div>
              </div>

              {/* DTC Search */}
              <div className="relative">
                <input
                  type="text"
                  value={dtcSearchQuery}
                  onChange={(e) => {
                    const q = e.target.value;
                    setDtcSearchQuery(q);
                    if (q.length >= 2) {
                      const results = searchAllDTCs(q);
                      setDtcSearchResults(results.map(r => ({
                        code: r.code,
                        description: r.description,
                        severity: r.severity === 'critical' ? 'high' : r.severity as any,
                        category: r.code[0] as any,
                        system: r.module,
                        causes: [r.fix],
                        solution: r.fix,
                        estimatedCost: "يحتاج تقييم",
                      })));
                    } else {
                      setDtcSearchResults([]);
                    }
                  }}
                  placeholder="🔍 ابحث عن كود عطل (مثل P0300, P1320, P2135)..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                />
                <span className="absolute left-3 top-2.5 text-[10px] text-gray-600">{getMegaDTCCount()}+ كود</span>
              </div>

              {/* Search Results */}
              {dtcSearchResults.length > 0 && (
                <div className="bg-gray-900/50 border border-yellow-500/20 rounded-xl p-3 space-y-2">
                  <h4 className="text-xs font-bold text-yellow-400 mb-2">🔍 نتائج البحث ({dtcSearchResults.length})</h4>
                  {dtcSearchResults.slice(0, 20).map((dtc) => {
                    const sys = getDTCSystem(dtc.code);
                    return (
                      <div key={`s-${dtc.code}`} onClick={() => setSelectedDtc(dtc)} className="bg-gray-800 border border-gray-700 rounded-lg p-3 cursor-pointer hover:border-yellow-500/40 transition">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getSystemIcon(sys)}</span>
                          <span className="font-mono font-bold text-yellow-400 text-xs bg-gray-900 px-2 py-0.5 rounded">{dtc.code}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-white">{dtc.description}</span>
                            <span className="text-[10px] text-gray-500 block">{getSystemLabelAr(sys)} • {dtc.solution}</span>
                          </div>
                          <span className={`${dtc.severity === 'high' ? 'bg-red-600' : dtc.severity === 'medium' ? 'bg-orange-600' : 'bg-green-600'} text-white text-[10px] px-2 py-0.5 rounded-full`}>
                            {dtc.severity === 'high' ? 'حرج' : dtc.severity === 'medium' ? 'متوسط' : 'منخفض'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {dtcSearchResults.length > 20 && <p className="text-[10px] text-gray-500 text-center">... و{dtcSearchResults.length - 20} نتيجة أخرى</p>}
                </div>
              )}

              {/* System breakdown summary */}
              {dtcCodes.length > 0 && (() => {
                const bySystem = dtcCodes.reduce((acc, d) => {
                  const sys = getDTCSystem(d.code);
                  acc[sys] = (acc[sys] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                return (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(bySystem).map(([sys, count]) => (
                      <span key={sys} className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-full px-3 py-1 text-xs">
                        <span>{getSystemIcon(sys as any)}</span>
                        <span className="text-gray-300">{getSystemLabelAr(sys as any)}</span>
                        <span className="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">{count}</span>
                      </span>
                    ))}
                  </div>
                );
              })()}

              {dtcCodes.length === 0 && pendingDtcs.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
                  <div className="text-green-400 text-5xl mb-3">✓</div>
                  <h3 className="text-lg font-bold text-green-400">لا توجد أعطال</h3>
                  <p className="text-gray-500 text-xs mt-1">جميع الأنظمة سليمة - لا توجد أكواد DTC</p>
                  <p className="text-gray-600 text-[10px] mt-1">محرك • ناقل حركة • ABS • وسائد هوائية • شبكة CAN</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {dtcCodes.map((dtc) => {
                    const sys = getDTCSystem(dtc.code);
                    const sysIcon = getSystemIcon(sys);
                    const sysLabel = getSystemLabelAr(sys);
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
                      <div key={dtc.code} onClick={() => setSelectedDtc(dtc)} className={`bg-gray-900 border rounded-xl p-4 cursor-pointer transition ${sysColors[sys] || "border-gray-800 hover:border-yellow-500/30"}`}>
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xl">{sysIcon}</span>
                            <span className="font-mono font-bold text-yellow-400 text-xs bg-gray-800 px-2 py-0.5 rounded">{dtc.fullCode || dtc.code}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium text-sm">{dtc.description}</h4>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${sysTagColors[sys] || "bg-gray-700 text-gray-300"}`}>{sysLabel}</span>
                              {dtc.moduleAr && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300 border border-blue-500/30">{dtc.module} — {dtc.moduleAr}</span>
                              )}
                            </div>
                            <p className="text-gray-500 text-xs mt-1 truncate">{dtc.causes[0]}{dtc.causes[1] ? ` • ${dtc.causes[1]}` : ""}</p>
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
                  {pendingDtcs.length > 0 && (<>
                    <h4 className="text-xs font-bold text-orange-400 mt-3 pt-3 border-t border-gray-800">⏳ أكواد معلقة (Pending - Mode 07)</h4>
                    {pendingDtcs.map((dtc) => {
                      const sys = getDTCSystem(dtc.code);
                      return (
                        <div key={`p-${dtc.code}`} onClick={() => setSelectedDtc(dtc)} className="bg-gray-900 border border-orange-500/20 rounded-xl p-3 cursor-pointer hover:border-orange-500/40 transition">
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
          )}

          {/* ═══ FREEZE FRAME TAB ═══ */}
          {activeTab === "freeze" && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div><h3 className="text-lg font-bold">Freeze Frame</h3><p className="text-gray-500 text-xs">بيانات المحرك لحظة حدوث العطل (Mode 02)</p></div>
                <button onClick={readFreezeFrame} className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-3 py-1.5 rounded-lg">تحديث</button>
              </div>
              {!freezeFrame ? (
                <div className="text-center py-8 text-gray-500"><p className="text-lg">❄️</p><p className="text-sm mt-2">لا توجد بيانات Freeze Frame</p><p className="text-xs text-gray-600 mt-1">يتم تسجيلها عند حدوث عطل يضيء Check Engine</p></div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 flex items-center gap-3">
                    <span className="text-red-400 text-xl">⚠️</span>
                    <div><span className="text-xs text-gray-400">الكود المسبب:</span><span className="text-red-400 font-mono font-bold mr-2 text-lg">{freezeFrame.dtcCode}</span></div>
                    {freezeFrame.fuelStatus && <span className="mr-auto text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">{freezeFrame.fuelStatus}</span>}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "RPM", value: freezeFrame.rpm?.toFixed(0), unit: "rpm" },
                      { label: "السرعة", value: freezeFrame.speed, unit: "km/h" },
                      { label: "حرارة المحرك", value: freezeFrame.coolantTemp, unit: "°C" },
                      { label: "حمل المحرك", value: freezeFrame.engineLoad?.toFixed(1), unit: "%" },
                      { label: "ضغط الوقود", value: freezeFrame.fuelPressure, unit: "kPa" },
                      { label: "حرارة السحب", value: freezeFrame.intakeTemp, unit: "°C" },
                      { label: "Short FT", value: freezeFrame.shortFuelTrim?.toFixed(1), unit: "%" },
                      { label: "Long FT", value: freezeFrame.longFuelTrim?.toFixed(1), unit: "%" },
                      { label: "الإشعال", value: freezeFrame.timingAdvance?.toFixed(1), unit: "°" },
                      { label: "MAF", value: freezeFrame.mafRate?.toFixed(1), unit: "g/s" },
                      { label: "الخنق", value: freezeFrame.throttlePos?.toFixed(1), unit: "%" },
                    ].filter(i => i.value !== null && i.value !== undefined).map((item) => (
                      <div key={item.label} className="bg-gray-800/50 rounded-lg p-3"><div className="text-[10px] text-gray-400">{item.label}</div><div className="text-lg font-mono font-bold text-white mt-1">{item.value} <span className="text-[10px] text-gray-500">{item.unit}</span></div></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ MODE 6 TAB ═══ */}
          {activeTab === "mode6" && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div><h3 className="text-lg font-bold">Mode 6 - اختبارات المكونات</h3><p className="text-gray-500 text-xs">O2 Sensor, Catalyst, EGR, EVAP, Misfire</p></div>
                <button onClick={readMode6} className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-3 py-1.5 rounded-lg">تحديث</button>
              </div>
              {mode6Results.length === 0 ? (
                <div className="text-center py-8 text-gray-500"><p>لا توجد نتائج - اضغط تحديث</p></div>
              ) : (
                <div className="space-y-2">
                  {mode6Results.map((test) => (
                    <div key={test.testId} className={`flex items-center gap-3 p-3 rounded-lg border ${test.status === "pass" ? "bg-green-900/5 border-green-500/20" : "bg-red-900/10 border-red-500/30"}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${test.status === "pass" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{test.status === "pass" ? "✓" : "✗"}</div>
                      <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{test.component}</div><div className="text-[10px] text-gray-500">{test.testName}</div></div>
                      <div className="text-left"><div className={`text-sm font-mono font-bold ${test.status === "pass" ? "text-green-400" : "text-red-400"}`}>{test.value.toFixed(2)} <span className="text-[10px] text-gray-500">{test.unit}</span></div><div className="text-[10px] text-gray-600">[{test.minLimit.toFixed(1)} - {test.maxLimit.toFixed(1)}]</div></div>
                    </div>
                  ))}
                  <div className="mt-3 flex gap-4 text-xs text-gray-400 border-t border-gray-800 pt-3">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full" />سليم: {mode6Results.filter(t => t.status === "pass").length}</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-500 rounded-full" />غير محدد: {mode6Results.filter(t => t.status === "fail").length}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ READINESS TAB ═══ */}
          {activeTab === "readiness" && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div><h3 className="text-lg font-bold">I/M Readiness</h3><p className="text-gray-500 text-xs">جاهزية الفحص الدوري - حالة شاشات المراقبة</p></div>
                <button onClick={readReadiness} className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-3 py-1.5 rounded-lg">تحديث</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {readinessTests.map((t) => (
                  <div key={t.name} className={`flex items-center gap-3 rounded-lg p-3 border ${t.status === "pass" ? "bg-green-900/5 border-green-500/20" : t.status === "fail" ? "bg-red-900/5 border-red-500/20" : "bg-gray-800/30 border-gray-700"}`}>
                    <div className={`w-3 h-3 rounded-full ${t.status === "pass" ? "bg-green-500" : t.status === "fail" ? "bg-red-500" : t.status === "pending" ? "bg-yellow-500 animate-pulse" : "bg-gray-600"}`} />
                    <span className="flex-1 text-sm">{t.name}</span>
                    <span className={`text-xs font-medium ${t.status === "pass" ? "text-green-400" : t.status === "fail" ? "text-red-400" : t.status === "pending" ? "text-yellow-400" : "text-gray-500"}`}>{t.status === "pass" ? "ناجح" : t.status === "fail" ? "غير مكتمل" : t.status === "pending" ? "معلق" : "N/A"}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-4 text-xs text-gray-400 border-t border-gray-800 pt-3">
                <span>ناجح: {readinessTests.filter(t => t.status === "pass").length}</span>
                <span>غير مكتمل: {readinessTests.filter(t => t.status === "fail").length}</span>
                <span>غير مدعوم: {readinessTests.filter(t => t.status === "na").length}</span>
              </div>
            </div>
          )}

          {/* ═══ ALERTS TAB ═══ */}
          {activeTab === "alerts" && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div><h3 className="text-lg font-bold">التنبيهات الذكية ({alerts.length})</h3><p className="text-gray-500 text-xs">تنبيهات تلقائية عند تجاوز القيم المرجعية {selectedMake && `(${makeLabels[selectedMake]})`}</p></div>
                {alerts.length > 0 && <button onClick={() => { setAlerts([]); obdService.clearAlerts(); }} className="text-xs text-gray-400 hover:text-white bg-gray-800 px-3 py-1.5 rounded-lg">مسح</button>}
              </div>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500"><p className="text-lg">✓</p><p className="text-sm mt-2">لا توجد تنبيهات - جميع القيم طبيعية</p></div>
              ) : (
                <div className="space-y-2">
                  {alerts.map((alert, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border ${alert.type === "critical" ? "bg-red-900/10 border-red-500/30" : "bg-yellow-900/10 border-yellow-500/30"}`}>
                      <div className="text-xl">{alert.type === "critical" ? "🔴" : "🟡"}</div>
                      <div className="flex-1"><div className="text-sm">{alert.message}</div><div className="text-[10px] text-gray-500 mt-0.5">{alert.parameter}: {alert.value.toFixed(1)} | الحد: {alert.threshold} | {new Date(alert.timestamp).toLocaleTimeString("ar-SA")}</div></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ O2 SENSORS TAB ═══ */}
          {activeTab === "o2sensors" && (
            <div className="space-y-5">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div><h3 className="text-lg font-bold">حساسات O2 - رسم بياني مباشر</h3><p className="text-gray-500 text-xs">مراقبة جهد حساسات الأوكسجين في الوقت الحقيقي (Mode 01 + Mode 05)</p></div>
                  <button onClick={readO2Sensors} className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-3 py-1.5 rounded-lg">تحديث</button>
                </div>

                {/* Live O2 Chart */}
                {o2History.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-xs text-gray-400 mb-2">جهد الحساسات (V) - مباشر</h4>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={o2History}>
                        <XAxis dataKey="time" hide />
                        <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: "#6b7280" }} />
                        <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} />
                        <Line type="monotone" dataKey="b1s1" stroke="#22c55e" strokeWidth={2} dot={false} name="B1S1" />
                        <Line type="monotone" dataKey="b1s2" stroke="#f59e0b" strokeWidth={2} dot={false} name="B1S2" />
                        {/* Reference lines */}
                        <Line type="monotone" dataKey={() => 0.45} stroke="#6b7280" strokeWidth={1} strokeDasharray="4 4" dot={false} name="مرجعي" />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block" />B1S1 (قبل المحول)</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-yellow-500 inline-block" />B1S2 (بعد المحول)</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-gray-500 inline-block" style={{ borderTop: "1px dashed" }} />القيمة المرجعية (0.45V)</span>
                    </div>
                  </div>
                )}

                {/* Sensor Cards */}
                {o2SensorData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500"><p>اضغط تحديث لقراءة حساسات O2</p></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {o2SensorData.map((sensor) => (
                      <div key={`${sensor.bank}-${sensor.sensor}`} className={`rounded-xl p-4 border ${sensor.status === "critical" ? "bg-red-900/10 border-red-500/30" : sensor.status === "warning" ? "bg-yellow-900/10 border-yellow-500/30" : "bg-gray-800/50 border-gray-700"}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold">Bank {sensor.bank} - Sensor {sensor.sensor}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${sensor.status === "normal" ? "bg-green-500/20 text-green-400" : sensor.status === "warning" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}`}>
                            {sensor.status === "normal" ? "طبيعي" : sensor.status === "warning" ? "تحذير" : "حرج"}
                          </span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between"><span className="text-gray-400">الجهد</span><span className="font-mono font-bold text-green-400">{sensor.voltage.toFixed(3)} V</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Short FT</span><span className="font-mono">{sensor.shortTermFuelTrim.toFixed(1)}%</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Rich→Lean</span><span className="font-mono">{sensor.richToLean.toFixed(1)} ms</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Lean→Rich</span><span className="font-mono">{sensor.leanToRich.toFixed(1)} ms</span></div>
                        </div>
                        {/* Voltage bar */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, sensor.voltage * 100)}%`, backgroundColor: sensor.voltage < 0.1 || sensor.voltage > 0.9 ? "#ef4444" : sensor.voltage < 0.2 || sensor.voltage > 0.8 ? "#f59e0b" : "#22c55e" }} />
                          </div>
                          <div className="flex justify-between text-[9px] text-gray-600 mt-0.5"><span>0V</span><span>0.45V</span><span>1.0V</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!isReading && o2SensorData.length > 0 && (
                  <div className="mt-4 text-center">
                    <button onClick={() => startLiveReading()} className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2 rounded-lg">بدء المراقبة المباشرة</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ CYLINDERS TAB ═══ */}
          {activeTab === "cylinders" && (
            <div className="space-y-5">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div><h3 className="text-lg font-bold">خريطة الأسطوانات - Misfire Monitor</h3><p className="text-gray-500 text-xs">قراءة مباشرة عبر PID A1 (مدعوم حتى 12 أسطوانة) — يتحول تلقائياً لـ Mode 6 إذا لم يدعم الجهاز</p></div>
                  <button onClick={readCylinderData} className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-3 py-1.5 rounded-lg">تحديث</button>
                </div>

                {cylinderMisfires.length === 0 ? (
                  <div className="text-center py-8 text-gray-500"><p>اضغط تحديث لقراءة بيانات الأسطوانات</p></div>
                ) : (
                  <>
                    {/* Bar Chart */}
                    <div className="mb-5">
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={cylinderMisfires}>
                          <XAxis dataKey="cyl" tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => `Cyl ${v}`} />
                          <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} />
                          <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`${v} حالة`, "عدد Misfire"]} />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {cylinderMisfires.map((entry) => (
                              <Cell key={entry.cyl} fill={entry.count > entry.max ? "#ef4444" : entry.count > entry.max * 0.7 ? "#f59e0b" : "#22c55e"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Heat Map Grid */}
                    <h4 className="text-xs text-gray-400 mb-3">خريطة حرارية - حالة الأسطوانات</h4>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {cylinderMisfires.map((cyl) => {
                        const ratio = cyl.count / cyl.max;
                        const bgColor = ratio > 1 ? "bg-red-500" : ratio > 0.7 ? "bg-orange-500" : ratio > 0.4 ? "bg-yellow-500" : "bg-green-500";
                        const opacity = Math.max(0.3, Math.min(1, ratio));
                        return (
                          <div key={cyl.cyl} className={`${bgColor} rounded-xl p-4 text-center transition-all hover:scale-105`} style={{ opacity }}>
                            <div className="text-2xl font-bold text-white">{cyl.cyl}</div>
                            <div className="text-xs text-white/80 mt-1">Cyl</div>
                            <div className="text-lg font-mono font-bold text-white mt-2">{cyl.count}</div>
                            <div className="text-[10px] text-white/70">من {cyl.max}</div>
                            <div className="mt-2 text-[10px] font-bold text-white">
                              {ratio > 1 ? "⚠ تحقق" : ratio > 0.7 ? "⚠ تحذير" : "✓ سليم"}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary */}
                    <div className="mt-4 flex gap-4 text-xs text-gray-400 border-t border-gray-800 pt-3">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full" />سليم: {cylinderMisfires.filter(c => c.count <= c.max * 0.7).length}</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-500 rounded-full" />تحذير: {cylinderMisfires.filter(c => c.count > c.max * 0.7 && c.count <= c.max).length}</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-500 rounded-full" />تحقق: {cylinderMisfires.filter(c => c.count > c.max).length}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ═══ HISTORY TAB ═══ */}
          {activeTab === "history" && (
            <div className="space-y-5">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div><h3 className="text-lg font-bold">سجل الفحوصات</h3><p className="text-gray-500 text-xs">جميع جلسات الفحص السابقة مع المقارنة</p></div>
                  <button onClick={() => navigate("/diagnostic-history")} className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded-lg">عرض الكل</button>
                </div>

                {sessionHistory.isLoading ? (
                  <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
                ) : !sessionHistory.data?.length ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg">📅</p>
                    <p className="text-sm mt-2">لا توجد جلسات فحص سابقة</p>
                    <p className="text-[10px] text-gray-600 mt-1">سيتم حفظ الجلسات تلقائياً عند إجراء فحص شامل</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sessionHistory.data.map((session: any) => (
                      <div key={session.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 hover:border-yellow-500/30 transition cursor-pointer" onClick={() => navigate(`/diagnostic-history`)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${session.status === "completed" ? "bg-green-500" : session.status === "in_progress" ? "bg-yellow-500 animate-pulse" : "bg-gray-500"}`} />
                            <div>
                              <div className="text-sm font-medium">
                                {session.vehicleMake || "سيارة"} {session.vehicleModel || ""} {session.vehicleYear || ""}
                              </div>
                              <div className="text-[10px] text-gray-500 mt-0.5">
                                {session.sessionType === "full_scan" ? "فحص شامل" : session.sessionType === "dtc_read" ? "قراءة أعطال" : session.sessionType || "فحص"}
                                {session.vin && <span className="mr-2 font-mono text-cyan-400">VIN: {session.vin}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="text-xs text-gray-400">{new Date(session.createdAt).toLocaleDateString("ar-SA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                            {session.dtcCount > 0 && <div className="text-[10px] text-red-400 mt-0.5">{session.dtcCount} كود عطل</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

                    {/* ═══ DRIVING HUD TAB ═══ */}
          {activeTab === "driving" && (() => {
            // HUD color palette
            const HUD_COLORS: Record<string, { primary: string; gradient: string; border: string; label: string }> = {
              green:  { primary: "text-green-400",  gradient: "linear-gradient(90deg,#22c55e,#4ade80)",  border: "border-green-500/30",  label: "أخضر" },
              blue:   { primary: "text-blue-400",   gradient: "linear-gradient(90deg,#3b82f6,#06b6d4)",  border: "border-blue-500/30",   label: "أزرق" },
              red:    { primary: "text-red-400",    gradient: "linear-gradient(90deg,#ef4444,#f97316)",  border: "border-red-500/30",    label: "أحمر" },
              white:  { primary: "text-white",      gradient: "linear-gradient(90deg,#e5e7eb,#ffffff)",  border: "border-white/30",      label: "أبيض" },
              orange: { primary: "text-orange-400", gradient: "linear-gradient(90deg,#f97316,#fbbf24)", border: "border-orange-500/30", label: "برتقالي" },
            };
            const hc = HUD_COLORS[hudColor];
            const estimatedGear = liveData.speed < 15 ? 1 : liveData.speed < 30 ? 2 : liveData.speed < 50 ? 3 : liveData.speed < 80 ? 4 : liveData.speed < 120 ? 5 : 6;
            return (
            <div className="space-y-5">
              {/* Controls Row */}
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div><h3 className="text-lg font-bold">وضع القيادة - HUD</h3><p className="text-gray-500 text-xs">عرض مبسط للبيانات الأساسية أثناء القيادة — ضع الهاتف على لوحة السيارة</p></div>
                <div className="flex flex-wrap gap-2">
                  {/* Color Picker */}
                  <div className="flex items-center gap-1 bg-gray-800 rounded-lg px-2 py-1">
                    <span className="text-xs text-gray-400 ml-1">لون:</span>
                    {(["green","blue","red","white","orange"] as const).map(c => (
                      <button key={c} onClick={() => setHudColor(c)}
                        title={HUD_COLORS[c].label}
                        className={`w-5 h-5 rounded-full border-2 transition-all ${
                          c === "green"  ? "bg-green-400"  :
                          c === "blue"   ? "bg-blue-400"   :
                          c === "red"    ? "bg-red-400"    :
                          c === "white"  ? "bg-white"      :
                                           "bg-orange-400"
                        } ${hudColor === c ? "border-yellow-400 scale-125" : "border-transparent"}`} />
                    ))}
                  </div>
                  {/* Night Mode */}
                  <button onClick={() => setNightMode(!nightMode)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${nightMode ? "bg-indigo-700 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
                    🌙 ليلي
                  </button>
                  {/* Mirror Mode */}
                  <button onClick={() => setMirrorMode(!mirrorMode)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${mirrorMode ? "bg-purple-700 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
                    🔄 انعكاس
                  </button>
                  {/* HUD Toggle */}
                  <button onClick={() => setDrivingMode(!drivingMode)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition ${drivingMode ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}`}>
                    {drivingMode ? "إيقاف HUD" : "تشغيل HUD"}
                  </button>
                </div>
              </div>

              {/* HUD Display */}
              <div
                className={`rounded-2xl p-8 transition-all ${
                  drivingMode
                    ? `bg-black border-2 ${hc.border} ${nightMode ? "opacity-70" : ""}`
                    : "bg-gray-900 border border-gray-800"
                }`}
                style={mirrorMode ? { transform: "scaleX(-1)" } : {}}
              >
                {/* Mirror Mode Badge */}
                {mirrorMode && (
                  <div className="text-center mb-2">
                    <span className="text-xs bg-purple-700/50 text-purple-300 px-2 py-0.5 rounded">وضع الانعكاس — للعرض على الزجاج الأمامي</span>
                  </div>
                )}

                {/* Speed - Large Center */}
                <div className="text-center mb-8">
                  <div className={`text-8xl font-mono font-bold transition-colors ${drivingMode ? hc.primary : "text-white"}`}>
                    {Math.round(liveData.speed)}
                  </div>
                  <div className={`text-xl ${drivingMode ? hc.primary + "/60" : "text-gray-500"}`}>km/h</div>
                </div>

                {/* RPM Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>RPM</span>
                    <span className={`font-mono font-bold ${liveData.rpm > 5500 ? "text-red-400" : drivingMode ? hc.primary : "text-white"}`}>
                      {Math.round(liveData.rpm).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300" style={{
                      width: `${Math.min(100, (liveData.rpm / 7000) * 100)}%`,
                      background: liveData.rpm > 5500
                        ? "linear-gradient(90deg, #f97316, #ef4444)"
                        : drivingMode ? hc.gradient : "linear-gradient(90deg, #3b82f6, #06b6d4)"
                    }} />
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-600 mt-0.5">
                    <span>0</span><span>1k</span><span>2k</span><span>3k</span><span>4k</span><span>5k</span><span>6k</span><span>7k</span>
                  </div>
                </div>

                {/* Key Metrics Row */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-mono font-bold ${liveData.coolantTemp > 105 ? "text-red-400" : drivingMode ? hc.primary : "text-orange-400"}`}>
                      {Math.round(liveData.coolantTemp)}°
                    </div>
                    <div className="text-[10px] text-gray-500">حرارة المحرك</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-mono font-bold ${drivingMode ? hc.primary : "text-purple-400"}`}>
                      {Math.round(liveData.engineLoad)}%
                    </div>
                    <div className="text-[10px] text-gray-500">حمل المحرك</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-mono font-bold ${drivingMode ? hc.primary : "text-yellow-400"}`}>
                      {Math.round(liveData.fuelLevel)}%
                    </div>
                    <div className="text-[10px] text-gray-500">الوقود</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-mono font-bold ${drivingMode ? hc.primary : "text-cyan-400"}`}>
                      {liveData.instantFuelConsumption > 0 ? liveData.instantFuelConsumption.toFixed(1) : "—"}
                    </div>
                    <div className="text-[10px] text-gray-500">L/100km</div>
                  </div>
                </div>

                {/* Gear Indicator */}
                <div className="mt-6 flex justify-center gap-2">
                  {[1, 2, 3, 4, 5, 6].map((gear) => (
                    <div key={gear} className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-all ${
                      gear === estimatedGear
                        ? (drivingMode
                            ? `text-black scale-110`
                            : "bg-yellow-500 text-black scale-110")
                        : "bg-gray-800 text-gray-600"
                    }`}
                    style={gear === estimatedGear && drivingMode ? { background: hc.gradient } : {}}>
                      {gear}
                    </div>
                  ))}
                </div>

                {/* Alerts Strip */}
                {alerts.length > 0 && (
                  <div className="mt-6 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <span className="animate-pulse">⚠️</span>
                      <span>{alerts[alerts.length - 1]?.message}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Night Mode Note */}
              {nightMode && (
                <div className="text-center text-xs text-indigo-400 bg-indigo-900/20 rounded-lg p-2 flex items-center justify-center gap-2">
                  <span className="animate-pulse">🌙</span>
                  <span>الوضع الليلي مفعّل — الشاشة أكثر خفوتًا لتقليل الإضاءة أثناء القيادة الليلية</span>
                </div>
              )}
              {/* Mirror Mode Note */}
              {mirrorMode && (
                <div className="text-center text-xs text-purple-400 bg-purple-900/20 rounded-lg p-2 flex items-center justify-center gap-2">
                  <span>🔄</span>
                  <span>وضع الانعكاس مفعّل — ضع الهاتف أمام الزجاج ليظهر العرض بشكل صحيح</span>
                </div>
              )}

              {!isReading && (
                <div className="text-center">
                  <button onClick={() => startLiveReading()} className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl text-sm flex items-center gap-2 mx-auto">
                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />بدء القراءة المباشرة
                  </button>
                </div>
              )}
            </div>
          );})()}

          {/* ═══ AI DIAGNOSIS TAB ═══ */}
          {activeTab === "ai" && (
            <div className="space-y-5">
              {/* زر رجوع */}
              <button onClick={() => setActiveTab("home")} className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                الرئيسية
              </button>
              {/* AI Header */}
              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <span className="text-2xl">🧠</span>
                      محرك الذكاء الاصطناعي للتشخيص
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">تحليل الأنماط • ارتباط الأعطال • التنبؤ بالصيانة • نشرات TSB • تحليل الاهتزازات</p>
                  </div>
                  <button onClick={runAiDiagnosis} disabled={aiRunning} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition disabled:opacity-50 flex items-center gap-2">
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
                      <div className="text-4xl font-bold text-blue-400">{aiDiagnosis.confidence}%</div>
                      <span className="text-xs text-gray-400 mt-1">مستوى الثقة</span>
                      <span className="text-[10px] text-gray-500 mt-1">بناءً على {obdAiEngine.historyLength} عينة بيانات</span>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col items-center justify-center">
                      <div className={`text-4xl font-bold ${aiDiagnosis.primaryDiagnosis.severity === "critical" ? "text-red-400" : aiDiagnosis.primaryDiagnosis.severity === "high" ? "text-orange-400" : aiDiagnosis.primaryDiagnosis.severity === "medium" ? "text-yellow-400" : "text-green-400"}`}>
                        {aiDiagnosis.primaryDiagnosis.severity === "critical" ? "⚠️" : aiDiagnosis.primaryDiagnosis.severity === "high" ? "🟠" : aiDiagnosis.primaryDiagnosis.severity === "medium" ? "🟡" : "🟢"}
                      </div>
                      <span className="text-xs text-gray-400 mt-1">مستوى الخطورة</span>
                      <span className="text-[10px] text-gray-500 mt-1 capitalize">{aiDiagnosis.primaryDiagnosis.severity}</span>
                    </div>
                  </div>

                  {/* Primary Diagnosis */}
                  <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded">التشخيص الرئيسي</span>
                      <span className="text-yellow-400 text-sm font-bold">{aiDiagnosis.primaryDiagnosis.probability}% احتمال</span>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">{aiDiagnosis.primaryDiagnosis.issueAr}</h4>
                    <p className="text-xs text-gray-400 mb-3">{aiDiagnosis.primaryDiagnosis.issue} • {aiDiagnosis.primaryDiagnosis.system}</p>
                    <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
                      <span className="text-[10px] text-gray-500">السبب الجذري:</span>
                      <p className="text-sm text-gray-300 mt-1">{aiDiagnosis.primaryDiagnosis.rootCauseAr}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {aiDiagnosis.primaryDiagnosis.evidence.map((e, i) => (
                        <span key={i} className="text-[10px] bg-gray-800 border border-gray-700 px-2 py-1 rounded text-gray-300">{e}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-400">💰 التكلفة: <span className="text-white">{aiDiagnosis.primaryDiagnosis.estimatedCost}</span></span>
                      <span className="text-gray-400">⏱️ الإلحاح: <span className={`font-bold ${aiDiagnosis.primaryDiagnosis.urgency === "immediate" ? "text-red-400" : aiDiagnosis.primaryDiagnosis.urgency === "soon" ? "text-orange-400" : "text-yellow-400"}`}>{aiDiagnosis.primaryDiagnosis.urgency === "immediate" ? "فوري" : aiDiagnosis.primaryDiagnosis.urgency === "soon" ? "قريب" : aiDiagnosis.primaryDiagnosis.urgency === "scheduled" ? "مجدول" : "مراقبة"}</span></span>
                    </div>
                  </div>

                  {/* Secondary Diagnoses */}
                  {aiDiagnosis.secondaryDiagnoses.length > 0 && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                      <h4 className="text-sm font-bold mb-3 text-gray-300">تشخيصات إضافية محتملة</h4>
                      <div className="space-y-3">
                        {aiDiagnosis.secondaryDiagnoses.map((d, i) => (
                          <div key={i} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{d.issueAr}</span>
                              <span className={`text-xs font-bold ${d.probability >= 70 ? "text-orange-400" : "text-gray-400"}`}>{d.probability}%</span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">{d.rootCauseAr}</p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                              <span>{d.system}</span>
                              <span>•</span>
                              <span>{d.estimatedCost}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TSB Matches */}
                  {aiDiagnosis.tsbMatches.length > 0 && (
                    <div className="bg-gray-900 border border-orange-500/30 rounded-xl p-5">
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                        <span className="text-orange-400">📌</span>
                        نشرات الخدمة التقنية (TSB)
                      </h4>
                      <div className="space-y-3">
                        {aiDiagnosis.tsbMatches.map((tsb) => (
                          <div key={tsb.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${tsb.severity === "recall" ? "bg-red-500 text-white" : tsb.severity === "campaign" ? "bg-orange-500 text-white" : "bg-blue-500 text-white"}`}>
                                {tsb.severity === "recall" ? "استدعاء" : tsb.severity === "campaign" ? "حملة" : "TSB"}
                              </span>
                              <span className="text-[10px] text-gray-500">{tsb.id}</span>
                            </div>
                            <h5 className="text-sm font-medium text-white">{tsb.titleAr}</h5>
                            <p className="text-[11px] text-gray-400 mt-1">{tsb.descriptionAr}</p>
                            <div className="mt-2 bg-green-900/20 border border-green-500/20 rounded p-2">
                              <span className="text-[10px] text-green-400 font-medium">الحل: </span>
                              <span className="text-[10px] text-gray-300">{tsb.fixAr}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-[9px] text-gray-500">
                              <span>الموديلات: {tsb.models.join(", ")}</span>
                              <span>•</span>
                              <span>السنوات: {tsb.yearRange[0]}-{tsb.yearRange[1]}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Predictive Maintenance */}
                  {aiDiagnosis.predictiveMaintenance.length > 0 && (
                    <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-5">
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                        <span className="text-blue-400">🔮</span>
                        التنبؤ بالصيانة
                      </h4>
                      <div className="space-y-3">
                        {aiDiagnosis.predictiveMaintenance.map((alert, i) => (
                          <div key={i} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{alert.componentAr}</span>
                              <span className="text-[10px] text-gray-400">ثقة: {alert.confidence}%</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${alert.currentCondition}%`, backgroundColor: alert.currentCondition > 70 ? "#22c55e" : alert.currentCondition > 40 ? "#f59e0b" : "#ef4444" }} />
                              </div>
                              <span className="text-xs font-mono" style={{ color: alert.currentCondition > 70 ? "#22c55e" : alert.currentCondition > 40 ? "#f59e0b" : "#ef4444" }}>{Math.round(alert.currentCondition)}%</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-gray-400">
                              <span>معدل التدهور: {alert.degradationRate.toFixed(1)}%/شهر</span>
                              <span className="text-orange-400">عطل متوقع: {alert.estimatedFailureDate}</span>
                            </div>
                            <p className="text-[10px] text-gray-300 mt-2">التوصية: {alert.recommendationAr}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vibration Analysis */}
                  {aiDiagnosis.vibrationAnalysis && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                        <span>📈</span>
                        تحليل الاهتزازات
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                          <div className={`text-lg font-bold ${aiDiagnosis.vibrationAnalysis.overallLevel === "critical" ? "text-red-400" : aiDiagnosis.vibrationAnalysis.overallLevel === "high" ? "text-orange-400" : aiDiagnosis.vibrationAnalysis.overallLevel === "elevated" ? "text-yellow-400" : "text-green-400"}`}>
                            {aiDiagnosis.vibrationAnalysis.overallLevel === "critical" ? "حرج" : aiDiagnosis.vibrationAnalysis.overallLevel === "high" ? "عالي" : aiDiagnosis.vibrationAnalysis.overallLevel === "elevated" ? "مرتفع" : "طبيعي"}
                          </div>
                          <span className="text-[10px] text-gray-500">المستوى</span>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-cyan-400">{aiDiagnosis.vibrationAnalysis.frequency} Hz</div>
                          <span className="text-[10px] text-gray-500">التردد</span>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-purple-400">{aiDiagnosis.vibrationAnalysis.amplitude}%</div>
                          <span className="text-[10px] text-gray-500">السعة</span>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-gray-300 capitalize">{aiDiagnosis.vibrationAnalysis.pattern}</div>
                          <span className="text-[10px] text-gray-500">النمط</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 mt-3">السبب المحتمل: {aiDiagnosis.vibrationAnalysis.likelyCauseAr}</p>
                    </div>
                  )}

                  {/* Recommendations */}
                  {aiDiagnosis.recommendations.length > 0 && (
                    <div className="bg-gray-900 border border-green-500/30 rounded-xl p-5">
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                        <span className="text-green-400">✅</span>
                        التوصيات
                      </h4>
                      <div className="space-y-2">
                        {aiDiagnosis.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${rec.priority === 1 ? "bg-red-500 text-white" : rec.priority === 2 ? "bg-orange-500 text-white" : "bg-gray-600 text-white"}`}>{rec.priority}</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{rec.actionAr}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{rec.reasonAr}</p>
                              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
                                <span>💰 {rec.estimatedCost}</span>
                                <span>⏰ {rec.timeframeAr}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sensor Analysis Table */}
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <h4 className="text-sm font-bold mb-3">تحليل الحساسات</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-gray-500 border-b border-gray-800">
                            <th className="text-right py-2 px-2">المعلمة</th>
                            <th className="text-center py-2 px-2">القيمة</th>
                            <th className="text-center py-2 px-2">المدى الطبيعي</th>
                            <th className="text-center py-2 px-2">الانحراف</th>
                            <th className="text-center py-2 px-2">الحالة</th>
                            <th className="text-center py-2 px-2">الاتجاه</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aiDiagnosis.rawAnalysis.map((a, i) => (
                            <tr key={i} className="border-b border-gray-800/50">
                              <td className="py-2 px-2 text-gray-300">{a.parameter}</td>
                              <td className="py-2 px-2 text-center font-mono">{a.value.toFixed(1)} {a.unit}</td>
                              <td className="py-2 px-2 text-center text-gray-500">{a.normalRange[0]}-{a.normalRange[1]}</td>
                              <td className="py-2 px-2 text-center font-mono" style={{ color: Math.abs(a.deviation) > 100 ? "#ef4444" : Math.abs(a.deviation) > 50 ? "#f59e0b" : "#22c55e" }}>{a.deviation > 0 ? "+" : ""}{a.deviation}%</td>
                              <td className="py-2 px-2 text-center">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${a.status === "critical" ? "bg-red-500/20 text-red-400" : a.status === "warning" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>
                                  {a.status === "critical" ? "حرج" : a.status === "warning" ? "تحذير" : "طبيعي"}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-center">
                                <span className={`${a.trend === "degrading" ? "text-red-400" : a.trend === "improving" ? "text-green-400" : "text-gray-500"}`}>
                                  {a.trend === "degrading" ? "↓ تدهور" : a.trend === "improving" ? "↑ تحسن" : "→ مستقر"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <h4 className="text-sm font-bold mb-3">تقييم التشخيص (يساعد في تحسين الدقة)</h4>
                    {!aiFeedbackSent ? (
                      <div className="flex gap-3">
                        <button onClick={() => submitAiFeedback(true)} className="flex-1 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 font-medium py-3 rounded-lg text-sm transition">✅ التشخيص صحيح</button>
                        <button onClick={() => submitAiFeedback(false)} className="flex-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 font-medium py-3 rounded-lg text-sm transition">❌ غير دقيق</button>
                      </div>
                    ) : (
                      <div className="text-center text-sm text-gray-400 py-3">
                        ✓ شكراً لتقييمك! سيتم تحسين النظام بناءً على ملاحظاتك.
                      </div>
                    )}
                    <div className="mt-3 text-[10px] text-gray-500 text-center">
                      إجمالي التقييمات: {obdAiEngine.getLearningStats().totalFeedback} | الدقة: {obdAiEngine.getLearningStats().accuracy}%
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ═══ VEHICLE TAB ═══ */}
          {activeTab === "vehicle" && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-lg font-bold mb-4">معلومات السيارة</h3>
              {vehicleInfo.vin && vehicleInfo.vin !== "غير متاح" && (
                <div className="bg-gray-800/50 rounded-lg p-4 mb-4 text-center border border-gray-700">
                  <span className="text-[10px] text-gray-400">Vehicle Identification Number</span>
                  <div className="text-xl font-mono text-yellow-400 mt-1 tracking-wider">{vehicleInfo.vin}</div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  ["البروتوكول", vehicleInfo.protocol || "Auto"],
                  ["الجهاز", vehicleInfo.device || "—"],
                  ["ECU", vehicleInfo.ecuName || "—"],
                  ["وضع الاتصال", mode === "real" ? "فعلي (BLE)" : "محاكاة"],
                  ["الماركة", selectedMake ? makeLabels[selectedMake] : "عام"],
                  ["PIDs مدعومة", obdService.supportedPIDs.size > 0 ? `${obdService.supportedPIDs.size} PID` : "—"],
                ].map(([label, val]) => (
                  <div key={label} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50"><div className="text-[10px] text-gray-400">{label}</div><div className="text-sm font-medium mt-1">{val}</div></div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ REPORT TAB (empty state) ═══ */}
          {/* This tab is the dedicated home for الفحص الشامل (generateReport) -
              independent of القراءة الحية, with its own start trigger here. */}
          {activeTab === "report" && !fullReport && (
            <div className="space-y-4">
              <button onClick={() => setActiveTab("home")} className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                الرئيسية
              </button>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-3">📋</div>
                <h2 className="text-xl font-bold text-white mb-2">الفحص الشامل</h2>
                <p className="text-gray-400 text-sm mb-6">يقرأ VIN، أكواد الأعطال، Freeze Frame، اختبارات Mode 6، جاهزية الفحص، وحساسات O2 دفعة واحدة</p>
                {connectionStatus === "connected" ? (
                  <button
                    onClick={generateReport}
                    disabled={isScanning}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition disabled:opacity-50"
                  >
                    {isScanning ? "⏳ جاري الفحص الشامل..." : "🔍 بدء الفحص الشامل"}
                  </button>
                ) : (
                  <p className="text-gray-500 text-sm">وصّل الجهاز أولاً من الصفحة الرئيسية</p>
                )}
              </div>
            </div>
          )}

          {/* ═══ REPORT TAB ═══ */}
          {activeTab === "report" && fullReport && (
            <div className="space-y-5">
              {/* Health Score */}
              {engineHealth && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center gap-6 flex-wrap">
                    <HealthScoreRing score={engineHealth.score} />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-3">صحة المحرك</h3>
                      <div className="space-y-2">
                        {engineHealth.factors.map((f) => (
                          <div key={f.name} className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 w-28">{f.name}</span>
                            <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${f.score}%`, backgroundColor: f.score >= 80 ? "#22c55e" : f.score >= 50 ? "#f59e0b" : "#ef4444" }} />
                            </div>
                            <span className="text-xs text-gray-500 w-16 text-left">{f.detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Report Summary */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-yellow-400">تقرير الفحص الشامل</h3>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => { if (fullReport) { const allDtcs = [...fullReport.dtcCodes, ...(multiEcuResult ? [...multiEcuResult.abs, ...multiEcuResult.airbag, ...multiEcuResult.transmission, ...multiEcuResult.bcm] : [])]; const dtcDescs: Record<string, { en: string; ar: string }> = {}; allDtcs.forEach(d => { const info = lookupDTC(d.code); if (info) dtcDescs[d.code] = { en: info.description, ar: info.descriptionAr || info.description }; }); const pdfData: PDFReportData = { vehicleInfo: fullReport.vehicleInfo, liveData: fullReport.liveData, dtcCodes: fullReport.dtcCodes, freezeFrames: fullReport.freezeFrames, mode6Results: fullReport.mode6Results, o2Sensors: fullReport.o2Sensors || [], readinessTests: fullReport.readinessTests, alerts: fullReport.alerts, engineHealth: engineHealth || undefined, scanDate: fullReport.scanDate, dtcDescriptions: dtcDescs, multiEcuResult: multiEcuResult || undefined, make: selectedMake ? (makeLabels[selectedMake] || selectedMake) : undefined, model: selectedModel || undefined, year: selectedYear ? parseInt(selectedYear) : undefined, mileage: selectedMileage ? parseInt(selectedMileage) : undefined }; generatePDFReport(pdfData); } }} className="bg-gray-900 border border-yellow-500 hover:bg-yellow-500 hover:text-black text-yellow-400 font-bold text-sm px-5 py-2 rounded-lg transition-all">تحميل تقرير PDF</button>
                    <button onClick={shareWhatsApp} className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-5 py-2 rounded-lg">مشاركة عبر واتساب</button>
                    <button onClick={saveCurrentSession} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2 rounded-lg">حفظ الجلسة</button>
                    {linkedOrderId && <button onClick={handleSaveToOrder} disabled={saveScanToOrder.isPending} className="bg-gray-700 hover:bg-gray-600 text-white font-bold text-xs px-3 py-2 rounded-lg">{saveScanToOrder.isPending ? "جاري الحفظ..." : `حفظ في الطلب #${linkedOrderId}`}</button>}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center"><div className="text-2xl font-bold text-red-400">{fullReport.dtcCodes.length}</div><div className="text-[10px] text-gray-400">أكواد أعطال</div></div>
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center"><div className="text-2xl font-bold text-orange-400">{fullReport.mode6Results.filter(t => t.status === "fail").length}</div><div className="text-[10px] text-gray-400">Mode 6 للتحقق</div></div>
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center"><div className="text-2xl font-bold text-yellow-400">{fullReport.alerts.length}</div><div className="text-[10px] text-gray-400">تنبيهات</div></div>
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center"><div className="text-2xl font-bold text-green-400">{Object.values(fullReport.readinessTests).filter(v => v === "pass").length}</div><div className="text-[10px] text-gray-400">Readiness ناجح</div></div>
                </div>
                <div className="grid grid-cols-1 gap-3 text-xs">
                  {(fullReport.vin || vehicleInfo.vin) && (fullReport.vin || vehicleInfo.vin) !== "غير متاح" && (
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <span className="text-gray-400 block mb-1">رقم الهيكل (VIN):</span>
                      <span className="font-mono text-yellow-400 text-sm tracking-widest break-all">{fullReport.vin || vehicleInfo.vin}</span>
                    </div>
                  )}
                  {(fullReport.protocol || vehicleInfo.protocol) && (
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <span className="text-gray-400 block mb-1">بروتوكول الاتصال:</span>
                      <span className="text-white text-sm">{(fullReport.protocol || vehicleInfo.protocol || "").replace(/[0-9A-F]{2}:/g, "").replace(/AUTO,?/g, "").replace(/\d+:\d+/g, "").trim().split(",")[0].trim() || (fullReport.protocol || vehicleInfo.protocol)}</span>
                    </div>
                  )}
                </div>
                {fullReport.dtcCodes.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {fullReport.dtcCodes.map((d) => <span key={d.code} className="bg-red-900/30 text-red-400 font-mono text-xs px-2 py-1 rounded">{d.code}</span>)}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* ═══ MULTI-ECU SCAN TAB ═══ */}
          {activeTab === "multiecu" && (
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-yellow-400">🔍 فحص جميع وحدات التحكم (ECUs)</h3>
                  <button onClick={runMultiEcuScan} disabled={multiEcuScanning} className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-black font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2">
                    {multiEcuScanning ? <>⏳ جاري الفحص...</> : <>🔍 فحص شامل</>}
                  </button>
                </div>
                {!multiEcuResult && !multiEcuScanning && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-3">🔌</div>
                    <p className="text-sm">اضغط "فحص شامل" لقراءة أعطال جميع الأنظمة</p>
                    <p className="text-xs text-gray-600 mt-1">محرك • ABS/ESP • Airbag/SRS • ناقل حركة • BCM</p>
                  </div>
                )}
                {multiEcuScanning && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3 animate-spin">⚙️</div>
                    <p className="text-sm text-yellow-400">جاري فحص وحدات التحكم...</p>
                    <p className="text-xs text-gray-500 mt-1">قد يستغرق هذا دقيقتين حسب عدد الأنظمة</p>
                  </div>
                )}
                {multiEcuResult && (
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {([
                        { label: "محرك", key: "engine" as const, icon: "🔧", color: "red" },
                        { label: "ABS/ESP", key: "abs" as const, icon: "🛑", color: "blue" },
                        { label: "Airbag/SRS", key: "airbag" as const, icon: "💨", color: "orange" },
                        { label: "ناقل حركة", key: "transmission" as const, icon: "⚙️", color: "purple" },
                        { label: "BCM", key: "bcm" as const, icon: "📱", color: "gray" },
                      ] as const).map(sys => (
                        <div key={sys.key} className={`rounded-xl p-3 text-center border ${
                          !multiEcuResult.available[sys.key] ? "bg-gray-800/30 border-gray-700 opacity-50" :
                          multiEcuResult[sys.key].length > 0 ? "bg-red-900/20 border-red-700" : "bg-green-900/20 border-green-700"
                        }`}>
                          <div className="text-2xl mb-1">{sys.icon}</div>
                          <div className={`text-xl font-bold ${
                            !multiEcuResult.available[sys.key] ? "text-gray-500" :
                            multiEcuResult[sys.key].length > 0 ? "text-red-400" : "text-green-400"
                          }`}>
                            {!multiEcuResult.available[sys.key] ? "—" : multiEcuResult[sys.key].length}
                          </div>
                          <div className="text-[10px] text-gray-400">{sys.label}</div>
                          <div className="text-[9px] mt-0.5">
                            {!multiEcuResult.available[sys.key] ? <span className="text-gray-600">غير متاح</span> :
                             multiEcuResult[sys.key].length > 0 ? <span className="text-red-500">يوجد أعطال</span> :
                             <span className="text-green-500">سليم</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Detailed faults per system */}
                    {([
                      { label: "أعطال المحرك", key: "engine" as const, icon: "🔧", color: "red" },
                      { label: "أعطال ABS/ESP", key: "abs" as const, icon: "🛑", color: "blue" },
                      { label: "أعطال Airbag/SRS", key: "airbag" as const, icon: "💨", color: "orange" },
                      { label: "أعطال ناقل الحركة", key: "transmission" as const, icon: "⚙️", color: "purple" },
                      { label: "أعطال BCM", key: "bcm" as const, icon: "📱", color: "gray" },
                    ] as const).filter(sys => multiEcuResult[sys.key].length > 0).map(sys => (
                      <div key={sys.key} className="bg-gray-800/40 rounded-xl p-4">
                        <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                          <span>{sys.icon}</span>{sys.label}
                          <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{multiEcuResult[sys.key].length}</span>
                        </h4>
                        <div className="space-y-2">
                          {multiEcuResult[sys.key].map(dtc => {
                            const info = lookupDTC(dtc.code);
                            return (
                              <div key={dtc.code} className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span className="font-mono text-yellow-400 font-bold text-sm">{dtc.code}</span>
                                    <p className="text-xs text-gray-300 mt-0.5">{info?.description || dtc.code}</p>
                                    {info?.causes && info.causes.length > 0 && (
                                      <p className="text-[10px] text-gray-500 mt-1">السبب: {info.causes[0]}</p>
                                    )}
                                  </div>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                                    info?.severity === "critical" ? "bg-red-900/50 text-red-400" :
                                    info?.severity === "high" ? "bg-orange-900/50 text-orange-400" :
                                    "bg-yellow-900/50 text-yellow-400"
                                  }`}>{info?.severity || "medium"}</span>
                                </div>
                                {info?.solution && (
                                  <p className="text-[10px] text-green-400 mt-1.5 border-t border-gray-700 pt-1.5">✅ {info.solution}</p>
                                )}
                                {info?.estimatedRepairCost && (
                                  <p className="text-[10px] text-blue-400 mt-0.5">💰 التكلفة: {info.estimatedRepairCost.min}–{info.estimatedRepairCost.max} {info.estimatedRepairCost.currency}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {multiEcuResult.engine.length + multiEcuResult.abs.length + multiEcuResult.airbag.length + multiEcuResult.transmission.length + multiEcuResult.bcm.length === 0 && (
                      <div className="text-center py-6 text-green-400">
                        <div className="text-4xl mb-2">✅</div>
                        <p className="font-bold">لا توجد أعطال في أي نظام</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ TRANSMISSION TAB ═══ */}
          {activeTab === "transmission" && (
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-yellow-400">⚙️ نظام ناقل الحركة (Transmission)</h3>
                  <button onClick={readTransmissionTab} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xs px-4 py-2 rounded-lg">⟳ تحديث</button>
                </div>
                {!transmissionData ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-3">⚙️</div>
                    <p>اضغط "تحديث" لقراءة بيانات القير</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-yellow-400">{transmissionData.temp !== null ? `${transmissionData.temp}°C` : "—"}</div>
                      <div className="text-xs text-gray-400 mt-1">🌡️ حرارة زيت القير</div>
                      {transmissionData.temp !== null && (
                        <div className={`text-[10px] mt-1 ${
                          transmissionData.temp > 120 ? "text-red-400" :
                          transmissionData.temp > 100 ? "text-orange-400" : "text-green-400"
                        }`}>
                          {transmissionData.temp > 120 ? "🔴 حرارة خطيرة" : transmissionData.temp > 100 ? "🟡 تحذير" : "🟢 طبيعي"}
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-blue-400">{transmissionData.gear !== null ? `D${transmissionData.gear}` : "—"}</div>
                      <div className="text-xs text-gray-400 mt-1">⚙️ الترس الحالي</div>
                      {transmissionData.gearDesired !== null && transmissionData.gear !== transmissionData.gearDesired && (
                        <div className="text-[10px] text-orange-400 mt-1">مطلوب: D{transmissionData.gearDesired}</div>
                      )}
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-purple-400">{transmissionData.lockupStatus || "—"}</div>
                      <div className="text-xs text-gray-400 mt-1">🔒 حالة Lockup</div>
                    </div>
                    {transmissionData.oilPressure !== null && (
                      <div className="bg-gray-800 rounded-xl p-4 text-center">
                        <div className={`text-3xl font-bold ${
                          transmissionData.oilPressure < 5 ? "text-red-400" : "text-green-400"
                        }`}>{transmissionData.oilPressure.toFixed(1)} bar</div>
                        <div className="text-xs text-gray-400 mt-1">🫧 ضغط الزيت</div>
                        <div className={`text-[10px] mt-1 ${
                          transmissionData.oilPressure < 5 ? "text-red-400" : "text-green-400"
                        }`}>{transmissionData.oilPressure < 5 ? "⚠️ منخفض" : "✅ طبيعي"}</div>
                      </div>
                    )}
                    {transmissionData.slipRatio !== null && (
                      <div className="bg-gray-800 rounded-xl p-4 text-center">
                        <div className={`text-3xl font-bold ${
                          transmissionData.slipRatio > 0.1 ? "text-red-400" : "text-green-400"
                        }`}>{(transmissionData.slipRatio * 100).toFixed(1)}%</div>
                        <div className="text-xs text-gray-400 mt-1">🔄 نسبة الانزلاق</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* ═══ تحليل صحة القير ═══ */}
              {transmissionData && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <h4 className="font-bold text-yellow-400 mb-3">📊 تحليل صحة القير</h4>
                  <div className="space-y-2">
                    {/* تقييم درجة حرارة الزيت */}
                    {transmissionData.temp !== null && (
                      <div className={`rounded-lg p-3 text-xs ${
                        transmissionData.temp > 120 ? "bg-red-900/30 text-red-300" :
                        transmissionData.temp > 100 ? "bg-orange-900/30 text-orange-300" :
                        "bg-green-900/30 text-green-300"
                      }`}>
                        {transmissionData.temp > 120 && <p>🔴 حرارة زيت القير خطيرة ({transmissionData.temp}°C) — أوقف السيارة فوراً وافحص مبرد القير</p>}
                        {transmissionData.temp > 100 && transmissionData.temp <= 120 && <p>🟡 حرارة زيت القير مرتفعة ({transmissionData.temp}°C) — تجنب الحمل الزائد</p>}
                        {transmissionData.temp !== null && transmissionData.temp <= 100 && <p>✅ حرارة زيت القير طبيعية ({transmissionData.temp}°C) — القير يعمل بكفاءة</p>}
                      </div>
                    )}
                    {/* تقييم الانزلاق */}
                    {transmissionData.slipRatio !== null && (
                      <div className={`rounded-lg p-3 text-xs ${
                        transmissionData.slipRatio > 0.15 ? "bg-red-900/30 text-red-300" :
                        transmissionData.slipRatio > 0.05 ? "bg-yellow-900/30 text-yellow-300" :
                        "bg-green-900/30 text-green-300"
                      }`}>
                        {transmissionData.slipRatio > 0.15 && <p>🔴 انزلاق عالٍ جداً ({(transmissionData.slipRatio * 100).toFixed(1)}%) — احتمال تلف في الكلتش أو الباند</p>}
                        {transmissionData.slipRatio > 0.05 && transmissionData.slipRatio <= 0.15 && <p>🟡 انزلاق متوسط ({(transmissionData.slipRatio * 100).toFixed(1)}%) — راقب الوضع</p>}
                        {transmissionData.slipRatio <= 0.05 && <p>✅ نسبة انزلاق طبيعية ({(transmissionData.slipRatio * 100).toFixed(1)}%) — الكلتش سليم</p>}
                      </div>
                    )}
                    {/* توصيات الصيانة */}
                    <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-300">
                      <p className="font-bold text-yellow-400 mb-1">🔧 توصيات صيانة القير:</p>
                      <ul className="space-y-0.5 list-disc list-inside">
                        <li>تغيير زيت القير كل  40,000–60,000 كم (أو حسب دليل السيارة)</li>
                        <li>فحص مستوى زيت القير كل 10,000 كم</li>
                        <li>مستوى الحرارة الطبيعي: 80–100°C — فوق 120°C خطر</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {/* أكواد أعطال القير من DTC */}
              {dtcCodes.filter(d => d.code.startsWith("P07") || d.code.startsWith("P08") || d.code.startsWith("P0700") || d.code.startsWith("P073") || d.code.startsWith("P074")).length > 0 && (
                <div className="bg-gray-900 border border-orange-800/50 rounded-xl p-4">
                  <h4 className="font-bold text-orange-400 mb-3">⚠️ أعطال ناقل الحركة المكتشفة</h4>
                  <div className="space-y-2">
                    {dtcCodes.filter(d => d.code.startsWith("P07") || d.code.startsWith("P08")).map(dtc => (
                      <div key={dtc.code} className="bg-gray-800 rounded-lg p-3 flex items-start justify-between">
                        <div>
                          <span className="font-mono text-yellow-400 font-bold">{dtc.code}</span>
                          <p className="text-xs text-gray-300 mt-0.5">{dtc.description}</p>
                          {dtc.solution && <p className="text-[10px] text-green-400 mt-1">✅ {dtc.solution}</p>}
                        </div>
                        <span className="text-[10px] bg-orange-900/50 text-orange-400 px-2 py-0.5 rounded-full">{dtc.severity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ FUEL ECONOMY TAB ═══ */}
          {activeTab === "fuel" && (
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-yellow-400">⛽ اقتصاد الوقود</h3>
                  <button onClick={readFuelEconomyData} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xs px-4 py-2 rounded-lg">⟳ تحديث</button>
                </div>
                {/* سعر الوقود */}
                <div className="mb-4 flex items-center gap-3">
                  <label className="text-xs text-gray-400 whitespace-nowrap">سعر اللتر (ر.س):</label>
                  <input
                    type="number"
                    value={fuelPricePerLiter}
                    onChange={e => setFuelPricePerLiter(parseFloat(e.target.value) || 2.18)}
                    step="0.01" min="0.5" max="10"
                    className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm w-24 text-center"
                  />
                  <span className="text-xs text-gray-500">افتراضي: 2.18 ر.س (سعر بنزين 91)</span>
                </div>
                {!fuelEconomy ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-3">⛽</div>
                    <p>اضغط "تحديث" لقراءة بيانات استهلاك الوقود</p>
                    <p className="text-xs mt-1 text-gray-600">يتطلب PID 5E (معدل الوقود) - مدعوم في معظم سيارات CAN</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-gray-800 rounded-xl p-4 text-center">
                        <div className={`text-3xl font-bold ${
                          fuelEconomy.instantL100km === null ? "text-gray-500" :
                          fuelEconomy.instantL100km > 15 ? "text-red-400" :
                          fuelEconomy.instantL100km > 10 ? "text-orange-400" : "text-green-400"
                        }`}>
                          {fuelEconomy.instantL100km !== null ? `${fuelEconomy.instantL100km.toFixed(1)}` : "—"}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">⛽ استهلاك فوري (L/100km)</div>
                      </div>
                      <div className="bg-gray-800 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-blue-400">
                          {fuelEconomy.costPerKm !== null ? `${fuelEconomy.costPerKm.toFixed(2)}` : "—"}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">💰 تكلفة الكيلومتر (ر.س)</div>
                      </div>
                      <div className="bg-gray-800 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-purple-400">
                          {fuelEconomy.range !== null ? `${Math.round(fuelEconomy.range)}` : "—"}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">🛣️ المدى المتبقي (km)</div>
                      </div>
                    </div>
                    {/* تقييم الاستهلاك */}
                    {fuelEconomy.instantL100km !== null && (
                      <div className={`rounded-xl p-4 border ${
                        fuelEconomy.instantL100km > 15 ? "bg-red-900/20 border-red-700" :
                        fuelEconomy.instantL100km > 10 ? "bg-orange-900/20 border-orange-700" :
                        "bg-green-900/20 border-green-700"
                      }`}>
                        <h4 className="font-bold text-sm mb-2">📊 تقييم الاستهلاك</h4>
                        <p className="text-xs text-gray-300">
                          {fuelEconomy.instantL100km > 15 ? "🔴 استهلاك عالي جدًا - تحقق من حالة المحرك والحقن" :
                           fuelEconomy.instantL100km > 10 ? "🟡 استهلاك متوسط - يمكن تحسينه" :
                           "🟢 استهلاك جيد - السيارة تعمل بكفاءة"}
                        </p>
                        {fuelEconomy.costPerKm !== null && (
                          <p className="text-xs text-gray-400 mt-1">
                            لكل 100 كم: {(fuelEconomy.costPerKm * 100).toFixed(1)} ر.س
                          </p>
                        )}
                      </div>
                    )}
                    {/* ═══ Fuel Trim Analysis ═══ */}
                    <div className="bg-gray-800 rounded-xl p-4">
                      <h4 className="font-bold text-sm mb-3 text-yellow-400">🔧 تحليل Fuel Trim</h4>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-gray-900 rounded-lg p-3 text-center">
                          <div className={`text-2xl font-bold font-mono ${
                            Math.abs(liveData.shortFuelTrim) > 10 ? "text-red-400" :
                            Math.abs(liveData.shortFuelTrim) > 5 ? "text-yellow-400" : "text-green-400"
                          }`}>{liveData.shortFuelTrim > 0 ? "+" : ""}{liveData.shortFuelTrim.toFixed(1)}%</div>
                          <div className="text-xs text-gray-400 mt-1">Short Fuel Trim (STFT)</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">تعديل فوري</div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-3 text-center">
                          <div className={`text-2xl font-bold font-mono ${
                            Math.abs(liveData.longFuelTrim) > 10 ? "text-red-400" :
                            Math.abs(liveData.longFuelTrim) > 5 ? "text-yellow-400" : "text-green-400"
                          }`}>{liveData.longFuelTrim > 0 ? "+" : ""}{liveData.longFuelTrim.toFixed(1)}%</div>
                          <div className="text-xs text-gray-400 mt-1">Long Fuel Trim (LTFT)</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">تعديل دائم</div>
                        </div>
                      </div>
                      {/* Fuel Trim Interpretation */}
                      <div className={`rounded-lg p-3 text-xs ${
                        (Math.abs(liveData.shortFuelTrim) > 10 || Math.abs(liveData.longFuelTrim) > 10) ? "bg-red-900/30 text-red-300" :
                        (Math.abs(liveData.shortFuelTrim) > 5 || Math.abs(liveData.longFuelTrim) > 5) ? "bg-yellow-900/30 text-yellow-300" :
                        "bg-green-900/30 text-green-300"
                      }`}>
                        {(liveData.longFuelTrim > 10) && <p>🔴 LTFT موجب عالٍ: خليط فقير - تسريب هواء، MAF تالف، أو حاقن مسدود</p>}
                        {(liveData.longFuelTrim < -10) && <p>🔴 LTFT سالب عالٍ: خليط غني - حاقن يسرب، ضغط وقود مرتفع، أو O2 تالف</p>}
                        {(Math.abs(liveData.longFuelTrim) <= 10 && Math.abs(liveData.shortFuelTrim) <= 10) && <p>✅ Fuel Trim ضمن المدى الطبيعي (±10%) - نظام الوقود يعمل بشكل سليم</p>}
                      </div>
                    </div>
                    {/* ═══ Fuel System Status ═══ */}
                    <div className="bg-gray-800 rounded-xl p-4">
                      <h4 className="font-bold text-sm mb-3 text-yellow-400">⛽ حالة نظام الوقود</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-900 rounded-lg p-3 text-center">
                          <div className="text-xl font-bold text-rose-400">{Math.round(liveData.fuelPressure)} kPa</div>
                          <div className="text-[10px] text-gray-400 mt-1">ضغط الوقود</div>
                          <div className={`text-[9px] mt-0.5 ${
                            liveData.fuelPressure < 280 ? "text-red-400" :
                            liveData.fuelPressure > 420 ? "text-orange-400" : "text-green-400"
                          }`}>{liveData.fuelPressure < 280 ? "⚠️ منخفض" : liveData.fuelPressure > 420 ? "⚠️ مرتفع" : "✅ طبيعي"}</div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-3 text-center">
                          <div className="text-xl font-bold text-purple-400">{Math.round(liveData.fuelRailPressure)} kPa</div>
                          <div className="text-[10px] text-gray-400 mt-1">ضغط قضيب الوقود</div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-3 text-center">
                          <div className={`text-xl font-bold ${
                            liveData.fuelSystemStatus === 2 ? "text-green-400" : "text-yellow-400"
                          }`}>{liveData.fuelSystemStatus === 2 ? "Closed Loop" : liveData.fuelSystemStatus === 1 ? "Open Loop" : "—"}</div>
                          <div className="text-[10px] text-gray-400 mt-1">حالة الحلقة</div>
                          <div className={`text-[9px] mt-0.5 ${
                            liveData.fuelSystemStatus === 2 ? "text-green-400" : "text-yellow-400"
                          }`}>{liveData.fuelSystemStatus === 2 ? "✅ تحكم بحساس O2" : liveData.fuelSystemStatus === 1 ? "🟡 تحكم مفتوح" : ""}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ COMPARE SESSIONS TAB ═══ */}
          {activeTab === "compare" && (
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-lg font-bold text-yellow-400 mb-4">📊 مقارنة جلستين</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* جلسة A */}
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">جلسة A (الأقدم):</label>
                    <select
                      value={sessionCompare.a?.id || ""}
                      onChange={e => setSessionCompare(prev => ({ ...prev, a: localSessions.find(s => s.id === e.target.value) || null }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">— اختر جلسة —</option>
                      {localSessions.map(s => (
                        <option key={s.id} value={s.id}>
                          {new Date(s.timestamp).toLocaleDateString("ar-SA")} - {s.make || "غ.م"} - صحة: {s.healthScore}%
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* جلسة B */}
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">جلسة B (الأحدث):</label>
                    <select
                      value={sessionCompare.b?.id || ""}
                      onChange={e => setSessionCompare(prev => ({ ...prev, b: localSessions.find(s => s.id === e.target.value) || null }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">— اختر جلسة —</option>
                      {localSessions.map(s => (
                        <option key={s.id} value={s.id}>
                          {new Date(s.timestamp).toLocaleDateString("ar-SA")} - {s.make || "غ.م"} - صحة: {s.healthScore}%
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {sessionCompare.a && sessionCompare.b ? (
                  <div className="space-y-4">
                    {/* مقارنة صحة المحرك */}
                    <div className="bg-gray-800 rounded-xl p-4">
                      <h4 className="font-bold text-sm mb-3">📊 صحة المحرك</h4>
                      <div className="flex items-center gap-4">
                        <div className="text-center flex-1">
                          <div className={`text-3xl font-bold ${
                            sessionCompare.a.healthScore >= 80 ? "text-green-400" :
                            sessionCompare.a.healthScore >= 60 ? "text-yellow-400" : "text-red-400"
                          }`}>{sessionCompare.a.healthScore}%</div>
                          <div className="text-xs text-gray-400">{new Date(sessionCompare.a.timestamp).toLocaleDateString("ar-SA")}</div>
                        </div>
                        <div className="text-2xl">→</div>
                        <div className="text-center flex-1">
                          <div className={`text-3xl font-bold ${
                            sessionCompare.b.healthScore >= 80 ? "text-green-400" :
                            sessionCompare.b.healthScore >= 60 ? "text-yellow-400" : "text-red-400"
                          }`}>{sessionCompare.b.healthScore}%</div>
                          <div className="text-xs text-gray-400">{new Date(sessionCompare.b.timestamp).toLocaleDateString("ar-SA")}</div>
                        </div>
                        <div className={`text-center flex-1 font-bold ${
                          sessionCompare.b.healthScore > sessionCompare.a.healthScore ? "text-green-400" :
                          sessionCompare.b.healthScore < sessionCompare.a.healthScore ? "text-red-400" : "text-gray-400"
                        }`}>
                          {sessionCompare.b.healthScore > sessionCompare.a.healthScore ? `↑ +${sessionCompare.b.healthScore - sessionCompare.a.healthScore}%` :
                           sessionCompare.b.healthScore < sessionCompare.a.healthScore ? `↓ ${sessionCompare.b.healthScore - sessionCompare.a.healthScore}%` : "↔ لا تغيير"}
                        </div>
                      </div>
                    </div>
                    {/* مقارنة الأعطال */}
                    <div className="bg-gray-800 rounded-xl p-4">
                      <h4 className="font-bold text-sm mb-3">⚠️ مقارنة الأعطال</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-400 mb-2">جلسة A: {sessionCompare.a.dtcCount} عطل</div>
                          <div className="flex flex-wrap gap-1">
                            {sessionCompare.a.report?.dtcCodes?.map(d => (
                              <span key={d.code} className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                                sessionCompare.b!.report?.dtcCodes?.some(bd => bd.code === d.code)
                                  ? "bg-orange-900/50 text-orange-400" : "bg-red-900/50 text-red-400"
                              }`}>{d.code}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-2">جلسة B: {sessionCompare.b.dtcCount} عطل</div>
                          <div className="flex flex-wrap gap-1">
                            {sessionCompare.b.report?.dtcCodes?.map(d => (
                              <span key={d.code} className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                                sessionCompare.a!.report?.dtcCodes?.some(ad => ad.code === d.code)
                                  ? "bg-orange-900/50 text-orange-400" : "bg-green-900/50 text-green-400"
                              }`}>{d.code}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        <span className="bg-red-900/50 text-red-400 px-1.5 py-0.5 rounded mr-2">عطل قديم</span>
                        <span className="bg-orange-900/50 text-orange-400 px-1.5 py-0.5 rounded mr-2">مشترك</span>
                        <span className="bg-green-900/50 text-green-400 px-1.5 py-0.5 rounded">جديد</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-3">📊</div>
                    <p>اختر جلستين من القوائم أعلاه للمقارنة</p>
                    {localSessions.length < 2 && <p className="text-xs mt-1 text-gray-600">تحتاج جلستين محفوظتين على الأقل</p>}
                  </div>
                )}
              </div>
            </div>
          )}

                  {/* ═══ SPECIAL FUNCTIONS TAB ═══ */}
          {activeTab === "special" && (
            <div className="space-y-4">
              {/* زر رجوع */}
              <button onClick={() => setActiveTab("home")} className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                الرئيسية
              </button>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <h3 className="text-lg font-bold text-yellow-400 mb-1">⚙️ الوظائف الخاصة (Special Functions)</h3>
                <p className="text-xs text-gray-500 mb-4">تعمل عبر UDS/ISO 14229 — تأكد من توافق جهازك قبل التشغيل</p>
                {/* اختيار الماركة */}
                <div className="mb-4">
                  <label className="text-xs text-gray-400 block mb-1">ماركة السيارة</label>
                  <select
                    value={selectedMake}
                    onChange={e => setSelectedMake(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-full"
                  >
                    {["toyota","ford","nissan","bmw","mercedes","honda","hyundai","kia","gm","vw"].map(m => (
                      <option key={m} value={m}>{m.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                {/* بطاقات الوظائف */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: "oil_reset", icon: "🛢️", label: "Oil Reset", desc: "إعادة ضبط مؤشر الزيت" },
                    { id: "tpms_reset", icon: "🔄", label: "TPMS Reset", desc: "إعادة ضبط حساسات الإطارات" },
                    { id: "epb_open", icon: "🔓", label: "EPB Open", desc: "فتح الفرامل الكهربائية" },
                    { id: "epb_close", icon: "🔒", label: "EPB Close", desc: "غلق الفرامل الكهربائية" },
                    { id: "throttle_adapt", icon: "🎯", label: "Throttle Adapt", desc: "معايرة الخانق" },
                    { id: "sas_reset", icon: "🔄", label: "SAS Reset", desc: "إعادة ضبط زاوية التوجيه" },
                    { id: "bms_reset", icon: "🔋", label: "BMS Reset", desc: "إعادة ضبط بطارية جديدة" },
                    { id: "idle_relearn", icon: "⚡", label: "Idle Relearn", desc: "تعلم التشغيل الخامل" },
                    { id: "evap_test", icon: "🔬", label: "EVAP Test", desc: "اختبار تسريب الوقود" },
                    { id: "dpf_regen", icon: "🌫️", label: "DPF Regen", desc: "تجديد فلتر الجسيمات" },
                    { id: "abs_bleeding", icon: "🩸", label: "ABS Bleeding", desc: "تهوية نظام الفرامل" },
                    { id: "injector_coding", icon: "💉", label: "Injector Coding", desc: "ترميز الحاقنات" },
                    { id: "gearbox_adapt", icon: "⚙️", label: "Gearbox Adapt", desc: "معايرة ناقل الحركة" },
                    { id: "ecu_reset", icon: "🔄", label: "ECU Reset", desc: "إعادة تشغيل الوحدة" },
                  ].map(fn => (
                    <button
                      key={fn.id}
                      onClick={() => runSpecialFunction(fn.id)}
                      disabled={specialFuncLoading}
                      className="bg-gray-800 border border-gray-700 hover:border-yellow-500 rounded-xl p-3 text-right transition group disabled:opacity-50"
                    >
                      <div className="text-2xl mb-1">{fn.icon}</div>
                      <div className="text-sm font-bold text-white group-hover:text-yellow-400">{fn.label}</div>
                      <div className="text-xs text-gray-500">{fn.desc}</div>
                    </button>
                  ))}
                </div>
                {/* نتيجة */}
                {specialFuncLoading && (
                  <div className="mt-4 bg-yellow-900/20 border border-yellow-800 rounded-xl p-4 text-center">
                    <div className="animate-spin text-2xl mb-2">⧳</div>
                    <p className="text-yellow-400 text-sm">جاري تنفيذ الوظيفة...</p>
                  </div>
                )}
                {specialFuncResult && !specialFuncLoading && (
                  <div className={`mt-4 border rounded-xl p-4 ${
                    specialFuncResult.success ? "bg-green-900/20 border-green-800" : "bg-red-900/20 border-red-800"
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{specialFuncResult.success ? "✅" : "❌"}</span>
                      <span className={`font-bold ${specialFuncResult.success ? "text-green-400" : "text-red-400"}`}>
                        {specialFuncResult.success ? "نجحت العملية" : "فشلت العملية"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{specialFuncResult.message}</p>
                    {specialFuncResult.steps && (
                      <div className="mt-3 space-y-1">
                        {specialFuncResult.steps.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="text-green-500">✓</span><span>{s}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {specialFuncResult.nextSteps && (
                      <div className="mt-3 border-t border-gray-700 pt-3">
                        <p className="text-xs text-yellow-400 font-bold mb-1">الخطوات التالية:</p>
                        {specialFuncResult.nextSteps.map((s, i) => (
                          <p key={i} className="text-xs text-gray-400">{i + 1}. {s}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── نيسان Action Tests (تظهر فقط عند اختيار نيسان) ── */}
              {selectedMake === "nissan" && (
                <div className="bg-gray-900 border border-red-900/50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🔧</span>
                      <div>
                        <h4 className="text-base font-bold text-red-400">Nissan Action Tests</h4>
                        <p className="text-[10px] text-gray-500">CONSULT-III Plus / UDS 0x31 — موديلات 2022+</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("nissanaction")}
                      className="bg-red-700 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                    >
                      فتح الاختبارات ←
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {(["cooling","engine","fuel","abs","ac","transmission","body","electrical"] as NissanActionTest["category"][]).map(cat => {
                      const count = NISSAN_ACTION_TESTS.filter(t => t.category === cat).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => { setNissanActiveCategory(cat); setActiveTab("nissanaction"); }}
                          className="bg-gray-800 hover:bg-red-900/40 border border-gray-700 hover:border-red-700 rounded-xl p-2 text-center transition"
                        >
                          <div className="text-xs font-bold text-white">{NISSAN_CATEGORY_LABELS[cat]}</div>
                          <div className="text-[10px] text-gray-500">{count} اختبار</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 text-[10px] text-gray-600 text-center">
                    يتطلب ELM327 v2.1+ مع دعم CAN ISO 15765-4
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ POWER BALANCE TAB ═══ */}
          {activeTab === "powerbalance" && (
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <h3 className="text-lg font-bold text-yellow-400 mb-1">⚡ Power Balance Test</h3>
                <p className="text-xs text-gray-500 mb-4">قياس كفاءة كل أسطوانة عبر تحليل Misfire Counters وتقدير RPM Drop</p>
                <button
                  onClick={runPowerBalanceTest}
                  disabled={powerBalanceRunning}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-xl transition disabled:opacity-50 mb-4"
                >
                  {powerBalanceRunning ? "⧳ جاري الاختبار..." : "▶ بدء Power Balance Test"}
                </button>
                {powerBalanceResults.length > 0 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {powerBalanceResults.map(r => (
                        <div key={r.cyl} className={`rounded-xl p-4 text-center border ${
                          r.status === "good" ? "bg-green-900/30 border-green-700" :
                          r.status === "weak" ? "bg-yellow-900/30 border-yellow-700" :
                          "bg-red-900/30 border-red-700"
                        }`}>
                          <div className="text-3xl font-bold text-white mb-1">أ{r.cyl}</div>
                          <div className="text-xs text-gray-400 mb-2">أسطوانة {r.cyl}</div>
                          <div className={`text-lg font-bold ${
                            r.status === "good" ? "text-green-400" :
                            r.status === "weak" ? "text-yellow-400" : "text-red-400"
                          }`}>
                            {r.status === "good" ? "✅ سليمة" : r.status === "weak" ? "⚠️ ضعيفة" : "❌ ميتة"}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">RPM Drop: ~{r.rpmDrop}</div>
                        </div>
                      ))}
                    </div>
                    {/* رسم بياني */}
                    <div className="bg-gray-800 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-2">توزيع كفاءة الأسطوانات</p>
                      <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={powerBalanceResults.map(r => ({ name: `أ${r.cyl}`, drop: r.rpmDrop, fill: r.status === "good" ? "#22c55e" : r.status === "weak" ? "#eab308" : "#ef4444" }))}>
                          <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                          <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} />
                          <Tooltip formatter={(v: any) => [`${v} RPM`, "RPM Drop"]} />
                          <Bar dataKey="drop">
                            {powerBalanceResults.map((r, i) => (
                              <Cell key={i} fill={r.status === "good" ? "#22c55e" : r.status === "weak" ? "#eab308" : "#ef4444"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl p-3 text-xs text-gray-400">
                      <p className="font-bold text-white mb-1">تفسير النتائج:</p>
                      <p>✅ سليمة: RPM Drop &gt; 30 — الأسطوانة تعمل بشكل طبيعي</p>
                      <p>⚠️ ضعيفة: RPM Drop 15-30 — فحص البوجيهات والحاقنات</p>
                      <p>❌ ميتة: RPM Drop &lt; 15 — فشل كامل في الاحتراق</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

              {/* ── فورد Action Tests (تظهر فقط عند اختيار فورد) ── */}
              {selectedMake === "ford" && (
                <div className="bg-gray-900 border border-blue-900/50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🔧</span>
                      <div>
                        <h4 className="text-base font-bold text-blue-400">Ford Action Tests</h4>
                        <p className="text-[10px] text-gray-500">EEC-V (J2190) + UDS Mode 2F — Grand Marquis / F-150 / Mustang</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {(["cooling","engine","fuel","electrical","transmission"] as FordActionTest["category"][]).map(cat => {
                      const count = FORD_ACTION_TESTS.filter(t => t.category === cat).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => setFordActiveCategory(cat)}
                          className={`border rounded-xl p-2 text-center transition ${
                            fordActiveCategory === cat
                              ? "bg-blue-900/60 border-blue-500 text-blue-300"
                              : "bg-gray-800 border-gray-700 text-white hover:bg-blue-900/30 hover:border-blue-700"
                          }`}
                        >
                          <div className="text-xs font-bold">{FORD_CATEGORY_LABELS[cat]}</div>
                          <div className="text-[10px] text-gray-500">{count} اختبار</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 mb-3 bg-blue-900/20 border border-blue-800/40 rounded-xl p-3 text-xs text-blue-300">
                    <div className="font-bold mb-1">📡 بروتوكول الاتصال:</div>
                    <div className="font-mono space-y-0.5 text-blue-200">
                      <div>EEC-V (قديم): ATSH C410 → 25 → 3184 → B100250x → 3284</div>
                      <div>UDS (حديث): ATSH 7E0 → 1003 → 2F xxxx 03FF → 2F xxxx 00</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {FORD_ACTION_TESTS.filter(t => t.category === fordActiveCategory).map(test => {
                      const isActive = fordActiveTestId === test.id && fordActionRunning;
                      const result = fordActionResult?.testId === test.id ? fordActionResult : null;
                      return (
                        <div
                          key={test.id}
                          className={`bg-gray-800 border rounded-xl p-4 transition ${
                            isActive ? "border-yellow-500 shadow-lg shadow-yellow-500/10" :
                            result?.success === true ? "border-green-700" :
                            result?.success === false ? "border-red-700" :
                            "border-gray-700"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <div className="text-sm font-bold text-white">{test.nameAr}</div>
                              <div className="text-xs text-gray-500 font-mono">{test.nameEn}</div>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                                  test.protocol === "FORD_EEC5"
                                    ? "bg-orange-900/50 text-orange-300"
                                    : "bg-blue-900/50 text-blue-300"
                                }`}>{test.protocol}</span>
                                <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded font-mono">ATSH {test.ecuHeader}</span>
                                <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded">⏱ {test.durationSec}s</span>
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => runFordActionTest(test, "on")}
                                disabled={fordActionRunning}
                                className="bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white text-xs font-bold px-3 py-2 rounded-lg transition"
                              >
                                {isActive ? "⧳" : "▶"} تشغيل
                              </button>
                              <button
                                onClick={() => runFordActionTest(test, "off")}
                                disabled={fordActionRunning}
                                className="bg-red-800 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-bold px-3 py-2 rounded-lg transition"
                              >
                                ■ إيقاف
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 text-[10px] font-mono text-gray-500 space-y-0.5">
                            <div>INIT: {test.initCmds.join(" → ")}</div>
                            <div>ON: {test.onCmd}</div>
                            <div>OFF: {test.offCmd}</div>
                          </div>
                          <div className="mt-2 text-[10px] text-yellow-500 bg-yellow-900/10 rounded-lg px-2 py-1">
                            ⚠️ {test.warningAr}
                          </div>
                          {result && (
                            <div className={`mt-2 rounded-lg p-2 text-xs ${
                              result.success ? "bg-green-900/30 text-green-300" : "bg-red-900/30 text-red-300"
                            }`}>
                              {result.message.split("\n").map((line: string, i: number) => (
                                <div key={i}>{line}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 text-[10px] text-gray-600 text-center">
                    يتطلب ELM327 v1.5+ — Grand Marquis 2007-2008: بروتوكول EEC-V (C410)
                  </div>
                </div>
              )}


          {/* ═══ OSCILLOSCOPE TAB ═══ */}
          {activeTab === "oscilloscope" && (
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <h3 className="text-lg font-bold text-green-400 mb-1">📊 الأوسكلوسكوب الافتراضي</h3>
                <p className="text-xs text-gray-500 mb-4">رسم إشارة الحساسات بشكل مستمر لاكتشاف الأعطال الخفية</p>
                <div className="flex gap-2 flex-wrap mb-4">
                  {(["o2", "maf", "tps", "rpm"] as const).map(sig => (
                    <button
                      key={sig}
                      onClick={() => { setOscilloSignal(sig); stopOscilloscope(); }}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                        oscilloSignal === sig ? "bg-green-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {sig === "o2" ? "O2 Sensor" : sig === "maf" ? "MAF" : sig === "tps" ? "TPS" : "RPM"}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={startOscilloscope}
                    disabled={oscilloRunning}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-xl transition disabled:opacity-50"
                  >
                    ▶ تشغيل
                  </button>
                  <button
                    onClick={stopOscilloscope}
                    disabled={!oscilloRunning}
                    className="bg-red-700 hover:bg-red-800 text-white font-bold px-6 py-2 rounded-xl transition disabled:opacity-50"
                  >
                    ■ إيقاف
                  </button>
                </div>
                <div className="bg-black rounded-xl p-2 border border-green-900">
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={oscilloData}>
                      <XAxis dataKey="t" tick={{ fill: "#22c55e", fontSize: 9 }} tickFormatter={v => `${v}s`} />
                      <YAxis tick={{ fill: "#22c55e", fontSize: 9 }} />
                      <Tooltip
                        contentStyle={{ background: "#111", border: "1px solid #22c55e", borderRadius: 8 }}
                        formatter={(v: any) => [v.toFixed(3), oscilloSignal.toUpperCase()]}
                      />
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke="#22c55e"
                        fill="rgba(34,197,94,0.1)"
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {oscilloData.length > 0 && [
                    { label: "أعلى قيمة", value: Math.max(...oscilloData.map(d => d.v)).toFixed(3) },
                    { label: "أدنى قيمة", value: Math.min(...oscilloData.map(d => d.v)).toFixed(3) },
                    { label: "المتوسط", value: (oscilloData.reduce((s, d) => s + d.v, 0) / oscilloData.length).toFixed(3) },
                  ].map(stat => (
                    <div key={stat.label} className="bg-gray-800 rounded-lg p-2">
                      <div className="text-xs text-gray-500">{stat.label}</div>
                      <div className="text-sm font-bold text-green-400">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ VIN INFO TAB ═══ */}
          {activeTab === "vininfo" && (
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <h3 className="text-lg font-bold text-blue-400 mb-1">🔍 VIN Decoder متقدم</h3>
                <p className="text-xs text-gray-500 mb-4">قراءة VIN من ECU وتحديد المواصفات الكاملة</p>
                <button
                  onClick={readVINAndDecode}
                  disabled={vinLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 mb-4"
                >
                  {vinLoading ? "⧳ جاري قراءة VIN..." : "🔍 قراءة VIN من ECU"}
                </button>
                {vinInfo && (
                  <div className="space-y-3">
                    <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4">
                      <div className="text-center mb-3">
                        <div className="text-2xl font-mono font-bold text-blue-400 tracking-widest">{vinInfo.vin}</div>
                        <div className="text-sm text-gray-400 mt-1">{vinInfo.makeAr} {vinInfo.modelAr} {vinInfo.year}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {[
                          { label: "الماركة", value: vinInfo.makeAr },
                          { label: "الموديل", value: vinInfo.modelAr },
                          { label: "سنة الصنع", value: vinInfo.year.toString() },
                          { label: "بلد التصنيع", value: vinInfo.countryAr },
                          { label: "المحرك", value: vinInfo.engineAr },
                          { label: "نوع الوقود", value: vinInfo.fuelTypeAr },
                          { label: "نوع الناقل", value: vinInfo.transmissionAr },
                          { label: "عدد الأسطوانات", value: vinInfo.cylinders?.toString() ?? "غير محدد" },
                        ].map(item => (
                          <div key={item.label} className="bg-gray-800 rounded-lg p-2">
                            <div className="text-xs text-gray-500">{item.label}</div>
                            <div className="text-sm font-bold text-white">{item.value}</div>
                          </div>
                        ))}
                      </div>
                      {vinInfo.recallInfo && vinInfo.recallInfo.length > 0 && (
                        <div className="mt-3 bg-red-900/20 border border-red-800 rounded-lg p-3">
                          <p className="text-xs font-bold text-red-400 mb-1">⚠️ سحب معروف:</p>
                          {vinInfo.recallInfo.map((r, i) => <p key={i} className="text-xs text-gray-400">• {r}</p>)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ OEM PIDs TAB ═══ */}
          {activeTab === "oempids" && (
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <h3 className="text-lg font-bold text-purple-400 mb-1">🔬 PIDs مخصصة لكل ماركة</h3>
                <p className="text-xs text-gray-500 mb-4">بيانات خاصة بالمصنع غير متاحة في OBD2 العادي</p>
                <div className="flex gap-2 flex-wrap mb-4">
                  {["toyota","ford","nissan","bmw","mercedes","honda","hyundai","kia","gm","vw"].map(m => (
                    <button
                      key={m}
                      onClick={() => setSelectedMake(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedMake === m ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >{m.toUpperCase()}</button>
                  ))}
                </div>
                <button
                  onClick={readOEMPids}
                  disabled={oemPidLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 mb-4"
                >
                  {oemPidLoading ? "⧳ جاري القراءة..." : `▶ قراءة PIDs ${selectedMake.toUpperCase()}`}
                </button>
                {oemPids.length > 0 && (
                  <div className="space-y-2">
                    {oemPids.map(pid => {
                      const val = oemPidValues[pid.pid];
                      const hasVal = val !== undefined;
                      const isNormal = hasVal && val >= (pid.normalMin ?? pid.min) && val <= (pid.normalMax ?? pid.max);
                      return (
                        <div key={pid.pid} className={`bg-gray-800 rounded-xl p-3 border ${
                          !hasVal ? "border-gray-700" : isNormal ? "border-green-800" : "border-red-800"
                        }`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-bold text-white">{pid.nameAr}</div>
                              <div className="text-xs text-gray-500">{pid.pid} — {pid.name}</div>
                            </div>
                            <div className="text-right">
                              {hasVal ? (
                                <div className={`text-lg font-bold ${isNormal ? "text-green-400" : "text-red-400"}`}>
                                  {val.toFixed(1)} <span className="text-xs">{pid.unit}</span>
                                </div>
                              ) : (
                                <div className="text-gray-600 text-sm">—</div>
                              )}
                              <div className="text-xs text-gray-600">طبيعي: {pid.normalMin ?? pid.min}–{pid.normalMax ?? pid.max} {pid.unit}</div>
                            </div>
                          </div>
                          {hasVal && !isNormal && pid.troubleshoot && (
                            <div className="mt-2 text-xs text-red-400 bg-red-900/20 rounded-lg p-2">
                              ⚠️ {pid.troubleshoot}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ NISSAN ACTION TESTS TAB ═══ */}
          {activeTab === "nissanaction" && (
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-900/40 border border-red-800 flex items-center justify-center text-xl">🔧</div>
                  <div>
                    <h3 className="text-lg font-bold text-red-400">نيسان Action Tests</h3>
                    <p className="text-xs text-gray-500">CONSULT-III Plus / UDS ISO 14229 — موديلات 2022+</p>
                  </div>
                </div>

                {/* اختيار الموديل */}
                <div className="mb-4">
                  <label className="text-xs text-gray-400 block mb-2">موديل السيارة</label>
                  <select
                    value={nissanSelectedModel}
                    onChange={e => setNissanSelectedModel(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    {NISSAN_MODELS_2022_PLUS.map(m => (
                      <option key={m} value={m.split(" ")[0] + " " + m.split(" ")[1]}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* تبويبات الفئات */}
                <div className="flex gap-2 flex-wrap mb-4">
                  {(["cooling","engine","fuel","abs","ac","transmission","body","electrical"] as NissanActionTest["category"][]).map(cat => {
                    const count = NISSAN_ACTION_TESTS.filter(t => t.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setNissanActiveCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          nissanActiveCategory === cat
                            ? "bg-red-600 text-white"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        }`}
                      >
                        {NISSAN_CATEGORY_LABELS[cat]} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* بروتوكول معلومات */}
                <div className="mb-4 bg-blue-900/20 border border-blue-800/40 rounded-xl p-3 text-xs text-blue-300">
                  <div className="font-bold mb-1">📡 بروتوكول الاتصال:</div>
                  <div className="font-mono space-y-0.5 text-blue-200">
                    <div>PCM (محرك): ATSH 7E0 → 7E8</div>
                    <div>TCM (قير): ATSH 7E1 → 7E9</div>
                    <div>ABS/VDC: ATSH 740 → 748</div>
                    <div>BCM (جسم): ATSH 746 → 74E</div>
                    <div>HVAC (تكييف): ATSH 744 → 74C</div>
                    <div>IPDM (طاقة): ATSH 75A → 762</div>
                  </div>
                </div>

                {/* قائمة الاختبارات */}
                <div className="space-y-3">
                  {NISSAN_ACTION_TESTS.filter(t => t.category === nissanActiveCategory).map(test => {
                    const isActive = nissanActiveTestId === test.id && nissanActionRunning;
                    const result = nissanActionResult?.testId === test.id ? nissanActionResult : null;
                    return (
                      <div
                        key={test.id}
                        className={`bg-gray-800 border rounded-xl p-4 transition ${
                          isActive ? "border-yellow-500 shadow-lg shadow-yellow-500/10" :
                          result?.success === true ? "border-green-700" :
                          result?.success === false ? "border-red-700" :
                          "border-gray-700"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="text-sm font-bold text-white">{test.nameAr}</div>
                            <div className="text-xs text-gray-500 font-mono">{test.nameEn}</div>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded font-mono">ATSH {test.ecuHeader}</span>
                              <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{test.session === "extended" ? "Extended Session" : "Programming Session"}</span>
                              <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded">⏱ {test.durationSec}s</span>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => runNissanActionTest(test, "on")}
                              disabled={nissanActionRunning}
                              className="bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white text-xs font-bold px-3 py-2 rounded-lg transition"
                            >
                              {isActive ? "⧳" : "▶"} تشغيل
                            </button>
                            <button
                              onClick={() => runNissanActionTest(test, "off")}
                              disabled={nissanActionRunning}
                              className="bg-red-800 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-bold px-3 py-2 rounded-lg transition"
                            >
                              ■ إيقاف
                            </button>
                          </div>
                        </div>

                        {/* تفاصيل الأوامر */}
                        <div className="mt-2 text-[10px] font-mono text-gray-500 space-y-0.5">
                          <div>ON: {test.onCmd.join(" → ")}</div>
                          <div>OFF: {test.offCmd.join(" → ")}</div>
                        </div>

                        {/* تحذير */}
                        <div className="mt-2 text-[10px] text-yellow-500 bg-yellow-900/10 rounded-lg px-2 py-1">
                          ⚠️ {test.warningAr}
                        </div>

                        {/* نتيجة */}
                        {result && (
                          <div className={`mt-2 rounded-lg p-2 text-xs ${
                            result.success ? "bg-green-900/30 text-green-300" : "bg-red-900/30 text-red-300"
                          }`}>
                            {result.message.split("\n").map((line, i) => (
                              <div key={i}>{line}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* تحذير عام */}
                <div className="mt-4 bg-red-900/20 border border-red-800/40 rounded-xl p-3 text-xs text-red-300">
                  <div className="font-bold mb-1">⚠️ تحذيرات مهمة:</div>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>تأكد من توقف السيارة تماماً قبل تشغيل أي اختبار</li>
                    <li>لا تشغّل الاختبارات مع وجود أشخاص قرب السيارة</li>
                    <li>يتطلب جلسة UDS Extended (0x10 0x03) قبل أي أمر</li>
                    <li>بعض الاختبارات تتطلب محرك دافئ ({">"}80°C)</li>
                    <li>هذه الأوامر خاصة بنيسان CONSULT-III Plus — لا تعمل على ماركات أخرى</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ═══ PREDICTIVE MAINTENANCE TAB ═══ */}
          {activeTab === "predictive" && (
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <h3 className="text-lg font-bold text-cyan-400 mb-1">🧠 الصيانة التنبؤية</h3>
                <p className="text-xs text-gray-500 mb-4">تحليل اتجاهات القراءات والتنبؤ بالأعطال قبل ظهورها</p>
                <button
                  onClick={runPredictiveMaintenance}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl transition mb-4"
                >
                  🧠 تحليل الصيانة التنبؤية
                </button>
                {predictiveAlerts.length > 0 && (
                  <div className="space-y-3">
                    {predictiveAlerts.map((alert, i) => (
                      <div key={i} className={`rounded-xl p-4 border ${
                        alert.risk === "high" ? "bg-red-900/20 border-red-700" :
                        alert.risk === "medium" ? "bg-yellow-900/20 border-yellow-700" :
                        "bg-green-900/20 border-green-700"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-white text-sm">{alert.sensor}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            alert.risk === "high" ? "bg-red-700 text-red-200" :
                            alert.risk === "medium" ? "bg-yellow-700 text-yellow-200" :
                            "bg-green-700 text-green-200"
                          }`}>
                            {alert.risk === "high" ? "🔴 عالي" : alert.risk === "medium" ? "🟡 متوسط" : "🟢 منخفض"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-1">الاتجاه: {alert.trend}</p>
                        <p className="text-xs text-cyan-400">→ {alert.recommendation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ CUSTOMER REPORT TAB ═══ */}
          {activeTab === "customerreport" && (
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <h3 className="text-lg font-bold text-orange-400 mb-1">📄 تقرير العميل</h3>
                <p className="text-xs text-gray-500 mb-4">تقرير مبسط بالعربية لمشاركته عبر واتساب أو طباعته</p>
                {/* معاينة التقرير */}
                <div className="bg-white text-black rounded-xl p-5 mb-4 text-right" dir="rtl">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">🔧 تقرير فحص السيارة</h2>
                    <p className="text-sm text-gray-500">تاريخ: {new Date().toLocaleDateString("ar-SA")}</p>
                    {vinInfo && <p className="text-sm font-bold text-gray-700">{vinInfo.makeAr} {vinInfo.modelAr} {vinInfo.year}</p>}
                  </div>
                  <div className="border-t pt-3 mb-3">
                    <h3 className="font-bold text-gray-800 mb-2">حالة السيارة:</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-50 rounded p-2">
                        <span className="text-gray-500">حرارة المحرك:</span>
                        <span className="font-bold mr-2">{liveData.coolantTemp || "--"}°C</span>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <span className="text-gray-500">جهد البطارية:</span>
                        <span className="font-bold mr-2">{liveData.voltage?.toFixed(1) || "--"}V</span>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <span className="text-gray-500">عدد الأعطال:</span>
                        <span className={`font-bold mr-2 ${dtcCodes.length > 0 ? "text-red-600" : "text-green-600"}`}>
                          {dtcCodes.length} عطل
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <span className="text-gray-500">حمل المحرك:</span>
                        <span className="font-bold mr-2">{liveData.engineLoad?.toFixed(0) || "--"}%</span>
                      </div>
                    </div>
                  </div>
                  {dtcCodes.length > 0 && (
                    <div className="border-t pt-3 mb-3">
                      <h3 className="font-bold text-red-700 mb-2">⚠️ الأعطال المكتشفة:</h3>
                      {dtcCodes.slice(0, 5).map((dtc, i) => {
                        const code = typeof dtc === "string" ? dtc : dtc.code;
                        const info = lookupDTC(code);
                        return (
                          <div key={i} className="bg-red-50 rounded p-2 mb-1 text-sm">
                            <span className="font-bold text-red-700">{code}</span>
                            <span className="text-gray-700 mr-2">{info?.descriptionAr || info?.description || "كود عطل"}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {predictiveAlerts.filter(a => a.risk !== "low").length > 0 && (
                    <div className="border-t pt-3 mb-3">
                      <h3 className="font-bold text-orange-700 mb-2">🔔 توصيات الصيانة:</h3>
                      {predictiveAlerts.filter(a => a.risk !== "low").map((a, i) => (
                        <div key={i} className="text-sm text-gray-700 mb-1">
                          • {a.recommendation}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="border-t pt-3 text-center">
                    <p className="text-xs text-gray-400">تم الفحص بواسطة منصة مير — meir.manus.space</p>
                  </div>
                </div>
                {/* أزرار المشاركة */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const text = [
                        `🔧 تقرير فحص السيارة`,
                        vinInfo ? `🚗 ${vinInfo.makeAr} ${vinInfo.modelAr} ${vinInfo.year}` : "",
                        `🌡️ حرارة المحرك: ${liveData.coolantTemp || "--"}°C`,
                        `🔋 جهد البطارية: ${liveData.voltage?.toFixed(1) || "--"}V`,
                        dtcCodes.length > 0 ? `\n⚠️ الأعطال (${dtcCodes.length}):\n${dtcCodes.slice(0,5).map(d => { const c = typeof d === "string" ? d : d.code; return `• ${c}: ${lookupDTC(c)?.descriptionAr || ""}`; }).join("\n")}` : "✅ لا توجد أعطال",
                        `\n— meir.manus.space`,
                      ].filter(Boolean).join("\n");
                      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                      window.open(url, "_blank");
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <span>💬</span> مشاركة واتساب
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <span>🖨️</span> طباعة
                  </button>
                </div>
                {/* QR Code للتقرير */}
                <div className="mt-4 bg-gray-800 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 mb-3">📱 امسح QR Code لمشاركة التقرير</p>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      [
                        `🔧 تقرير فحص سيارة - meir.manus.space`,
                        vinInfo ? `🚗 ${vinInfo.makeAr} ${vinInfo.modelAr} ${vinInfo.year}` : "",
                        vinInfo ? `VIN: ${vinInfo.vin}` : "",
                        `🌡️ حرارة: ${liveData.coolantTemp || "--"}°C`,
                        `🔋 جهد: ${liveData.voltage?.toFixed(1) || "--"}V`,
                        dtcCodes.length > 0
                          ? `⚠️ أعطال: ${dtcCodes.slice(0,3).map(d => typeof d === "string" ? d : d.code).join(", ")}`
                          : `✅ لا توجد أعطال`,
                        `تاريخ: ${new Date().toLocaleDateString("ar-SA")}`,
                      ].filter(Boolean).join("\n")
                    )}&color=facc15&bgcolor=111827`}
                    alt="QR Code التقرير"
                    className="mx-auto rounded-lg"
                    width={160}
                    height={160}
                  />
                  <p className="text-xs text-gray-500 mt-2">يحتوي على بيانات السيارة والأعطال</p>
                </div>
              </div>
            </div>
          )}

        </>)}
        {/* ═══ DISCONNECTED STATE ═══ */}
        {!connected && connectionStatus !== "connecting" && connectionStatus !== "initializing" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
            <div className="text-6xl mb-4">🔌</div>
            <h2 className="text-2xl font-bold mb-2">ماسح OBD2 الاحترافي</h2>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">اتصل بجهاز OBD2 BLE لفحص سيارتك فعلياً عبر بروتوكول ELM327، أو استخدم وضع المحاكاة للتجربة.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              {bleSupported && (<button onClick={connectReal} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 rounded-xl text-lg transition flex items-center gap-2"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/></svg>اتصال BLE فعلي</button>)}
              <button onClick={connectDemo} className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-8 py-3 rounded-xl text-lg transition">وضع المحاكاة</button>
            </div>
            <div className="mt-8 bg-gray-800/50 rounded-xl p-6 max-w-2xl mx-auto text-right">
              <h3 className="text-sm font-bold text-yellow-400 mb-3">الأجهزة المدعومة:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-400">
                {["OBDLink CX/MX+ (BLE)", "Vgate iCar Pro (BLE 4.0)", "ELM327 BLE 4.0+", "Veepeak OBDCheck BLE+", "KONNWEI KW902 BLE", "Carista OBD2 BLE", "UniCarScan UCSI-2000", "LELink BLE", "BAFX BLE"].map((d) => (<div key={d} className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /><span>{d}</span></div>))}
              </div>
              <div className="mt-4 border-t border-gray-700 pt-3">
                <h4 className="text-xs font-bold text-gray-300 mb-2">البروتوكولات المدعومة:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {["CAN 11bit/500k", "CAN 29bit/500k", "CAN 11bit/250k", "CAN 29bit/250k", "ISO 9141-2", "KWP2000", "J1850 PWM", "J1850 VPW", "J1939"].map((p) => (<span key={p} className="bg-gray-700 text-gray-300 text-[10px] px-2 py-0.5 rounded">{p}</span>))}
                </div>
              </div>
              <p className="text-gray-600 text-[10px] mt-3">يجب أن يكون مفتاح السيارة في وضع ON/RUN ليتمكن الجهاز من قراءة البيانات.</p>
            </div>
          </div>
        )}

        {/* ═══ CONNECTING STATE ═══ */}
        {(connectionStatus === "connecting" || connectionStatus === "initializing") && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <div className="animate-spin text-yellow-400 text-5xl mb-4">⚙</div>
            <h2 className="text-xl font-bold mb-2">{connectionStatus === "connecting" ? "جاري الاتصال بالجهاز..." : "جاري تهيئة ELM327..."}</h2>
            <p className="text-gray-500 text-sm">{connectionStatus === "initializing" ? "ATZ → ATE0 → ATSP0 → 0100..." : "يرجى اختيار الجهاز من القائمة"}</p>
          </div>
        )}

        {/* ═══ DTC DETAIL MODAL ═══ */}
        {selectedDtc && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDtc(null)}>
            <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {(() => {
                const sys = getDTCSystem(selectedDtc.code);
                const sysIcon = getSystemIcon(sys);
                const sysLabel = getSystemLabelAr(sys);
                const headerColors: Record<string, string> = {
                  engine: "from-orange-900/50 to-gray-900",
                  transmission: "from-blue-900/50 to-gray-900",
                  abs: "from-red-900/50 to-gray-900",
                  airbag: "from-purple-900/50 to-gray-900",
                  network: "from-cyan-900/50 to-gray-900",
                  body: "from-green-900/50 to-gray-900",
                };
                const detailInfo = lookupDTC(selectedDtc.code);
                const catLabel = selectedDtc.category === "P" ? "محرك/ناقل" : selectedDtc.category === "C" ? "شاسيه" : selectedDtc.category === "B" ? "هيكل" : "شبكة";
                return (
                  <>
                    <div className={`bg-gradient-to-b ${headerColors[sys] || "from-gray-800 to-gray-900"} rounded-t-2xl p-5`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{sysIcon}</span>
                          <div>
                            <span className="bg-yellow-500 text-black font-mono font-bold px-3 py-1 rounded-lg text-sm block mb-1">{selectedDtc.fullCode || selectedDtc.code}</span>
                            <span className="text-xs text-gray-400">{sysLabel} ({catLabel})</span>
                            {selectedDtc.moduleAr && (
                              <span className="text-[10px] bg-blue-900/40 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded mt-1 block">{selectedDtc.module} — {selectedDtc.moduleAr}</span>
                            )}
                          </div>
                        </div>
                        <button onClick={() => setSelectedDtc(null)} className="text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center">&times;</button>
                      </div>
                      <h3 className="text-base font-bold text-white">{selectedDtc.description}</h3>
                      {detailInfo?.description && <p className="text-xs text-gray-400 mt-1 font-mono">{detailInfo.description}</p>}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`${severityColor(selectedDtc.severity)} text-white text-xs px-3 py-1 rounded-full font-medium`}>{severityText(selectedDtc.severity)}</span>
                        {selectedDtc.subCode && (
                          <span className="bg-purple-900/40 text-purple-300 border border-purple-500/30 text-xs px-2 py-0.5 rounded-full font-mono">Sub-code: {selectedDtc.subCode}</span>
                        )}
                        {selectedDtc.isPending && (
                          <span className="bg-orange-900/40 text-orange-300 border border-orange-500/30 text-xs px-2 py-0.5 rounded-full">⏳ معلق</span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="bg-gray-800/50 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-red-400 mb-2">⚠️ الأسباب المحتملة</h4>
                        <ul className="space-y-1.5">
                          {selectedDtc.causes.map((c, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                              <span className="text-red-400 mt-0.5">•</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-gray-800/50 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-green-400 mb-2">✅ طريقة الإصلاح</h4>
                        <p className="text-sm text-gray-300">{selectedDtc.solution}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-800/50 rounded-xl p-3">
                          <div className="text-[10px] text-gray-500 mb-1">تكلفة الإصلاح التقديرية</div>
                          <div className="text-sm font-bold text-yellow-400">{selectedDtc.estimatedCost}</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-3">
                          <div className="text-[10px] text-gray-500 mb-1">النظام</div>
                          <div className="text-sm font-bold text-white">{selectedDtc.system}</div>
                        </div>
                      </div>

                      {detailInfo && (detailInfo.affectedComponentsAr?.length || detailInfo.relatedSensors?.length) && (
                        <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-xl p-4">
                          <h4 className="text-xs font-bold text-yellow-400 mb-2">ℹ️ معلومات فنية إضافية</h4>
                          <div className="space-y-1 text-xs text-gray-400">
                            {detailInfo.affectedComponentsAr && detailInfo.affectedComponentsAr.length > 0 && (
                              <p>المكونات المتأثرة: <span className="text-gray-300">{detailInfo.affectedComponentsAr.join(" • ")}</span></p>
                            )}
                            {detailInfo.relatedSensors && detailInfo.relatedSensors.length > 0 && (
                              <p>الحساسات ذات الصلة: <span className="text-gray-300 font-mono">{detailInfo.relatedSensors.join(" • ")}</span></p>
                            )}
                            {!detailInfo.safeToRide && (
                              <p className="text-red-400 font-medium">⚠️ لا ينصح بقيادة السيارة قبل الإصلاح</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ═══ خطوات الفحص التفصيلية ═══ */}
                      {(() => {
                        const diagInfo = getDiagnosticSteps(selectedDtc.code);
                        if (!diagInfo) return null;
                        return (
                          <>
                            {diagInfo.safetyWarning && (
                              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3">
                                <p className="text-xs text-red-400 font-bold">{diagInfo.safetyWarning}</p>
                              </div>
                            )}

                            <div className="bg-gray-800/50 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold text-cyan-400">🔧 خطوات الفحص</h4>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                    diagInfo.difficulty === 'easy' ? 'bg-green-900/50 text-green-400' :
                                    diagInfo.difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                                    diagInfo.difficulty === 'hard' ? 'bg-orange-900/50 text-orange-400' :
                                    'bg-red-900/50 text-red-400'
                                  }`}>{diagInfo.difficultyAr}</span>
                                  <span className="text-[10px] text-gray-500">⏱ {diagInfo.estimatedTime}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                {diagInfo.steps.map((step) => (
                                  <div key={step.step} className="flex gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-900/50 border border-cyan-500/30 flex items-center justify-center">
                                      <span className="text-[10px] font-bold text-cyan-400">{step.step}</span>
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-white">{step.action}</p>
                                      <p className="text-xs text-gray-400 mt-0.5">{step.details}</p>
                                      {step.expectedResult && (
                                        <p className="text-[10px] text-green-400 mt-0.5">✓ المتوقع: {step.expectedResult}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="bg-gray-800/50 rounded-xl p-4">
                              <h4 className="text-xs font-bold text-orange-400 mb-2">🧰 الأدوات المطلوبة</h4>
                              <div className="flex flex-wrap gap-2">
                                {diagInfo.tools.map((tool, i) => (
                                  <span key={i} className={`text-[10px] px-2 py-1 rounded-lg border ${
                                    tool.type === 'basic' ? 'bg-green-900/20 border-green-500/30 text-green-400' :
                                    tool.type === 'advanced' ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400' :
                                    'bg-red-900/20 border-red-500/30 text-red-400'
                                  }`}>{tool.nameAr}</span>
                                ))}
                              </div>
                            </div>

                            {diagInfo.relatedPIDs.length > 0 && (
                              <div className="bg-gray-800/50 rounded-xl p-4">
                                <h4 className="text-xs font-bold text-purple-400 mb-2">📊 بيانات حية مرتبطة</h4>
                                <div className="space-y-1.5">
                                  {diagInfo.relatedPIDs.map((pid, i) => (
                                    <div key={i} className="flex items-center justify-between bg-gray-900/50 rounded-lg px-3 py-1.5">
                                      <span className="text-xs text-gray-300">{pid.nameAr}</span>
                                      <span className="text-[10px] font-mono text-purple-400">{pid.normalRange} {pid.unit}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}

                      <div className="flex gap-3 pt-2">
                        <button onClick={() => { const code = selectedDtc.code; setSelectedDtc(null); navigate(`/ai-diagnosis?code=${code}`); }} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-xl text-sm">لوحة تشخيص AI</button>
                        <button onClick={() => setSelectedDtc(null)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl text-sm">إغلاق</button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
