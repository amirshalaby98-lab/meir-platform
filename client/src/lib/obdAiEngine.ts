/**
 * OBD2 AI Diagnostic Engine
 * محرك الذكاء الاصطناعي لتشخيص أعطال السيارات
 * 
 * يشمل:
 * - Pattern Recognition (تحليل الأنماط)
 * - Fault Correlation (ارتباط الأعطال)
 * - Predictive Maintenance (التنبؤ بالصيانة)
 * - TSB Database (نشرات الخدمة التقنية)
 * - Vibration Analysis (تحليل الاهتزازات)
 * - Learning from Feedback (التعلم من الفنيين)
 */

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

export interface LiveSensorData {
  rpm: number;
  speed: number;
  coolantTemp: number;
  engineLoad: number;
  throttlePos: number;
  mafRate: number;
  intakeTemp: number;
  shortFuelTrimB1: number;
  longFuelTrimB1: number;
  shortFuelTrimB2?: number;
  longFuelTrimB2?: number;
  o2VoltageB1S1: number;
  o2VoltageB1S2: number;
  timingAdvance: number;
  fuelPressure: number;
  oilTemp?: number;
  catalystTemp?: number;
  barometricPressure?: number;
  ambientTemp?: number;
}

export interface DiagnosticResult {
  id: string;
  timestamp: number;
  overallHealth: number; // 0-100
  confidence: number; // 0-100
  primaryDiagnosis: Diagnosis;
  secondaryDiagnoses: Diagnosis[];
  predictiveMaintenance: PredictiveAlert[];
  tsbMatches: TSBEntry[];
  vibrationAnalysis: VibrationResult | null;
  recommendations: Recommendation[];
  rawAnalysis: AnalysisDetail[];
}

export interface Diagnosis {
  system: string;
  issue: string;
  issueAr: string;
  probability: number; // 0-100
  severity: "low" | "medium" | "high" | "critical";
  rootCause: string;
  rootCauseAr: string;
  evidence: string[];
  relatedDTCs: string[];
  estimatedCost: string;
  urgency: "immediate" | "soon" | "scheduled" | "monitor";
}

export interface PredictiveAlert {
  component: string;
  componentAr: string;
  currentCondition: number; // 0-100 (100 = perfect)
  degradationRate: number; // % per month
  estimatedFailureDate: string;
  confidence: number;
  recommendation: string;
  recommendationAr: string;
}

export interface TSBEntry {
  id: string;
  make: string;
  models: string[];
  yearRange: [number, number];
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  relatedDTCs: string[];
  fix: string;
  fixAr: string;
  severity: "recall" | "campaign" | "tsb" | "advisory";
  date: string;
}

export interface VibrationResult {
  overallLevel: "normal" | "elevated" | "high" | "critical";
  frequency: number; // Hz
  amplitude: number;
  pattern: "random" | "periodic" | "harmonic" | "transient";
  likelyCause: string;
  likelyCauseAr: string;
  confidence: number;
}

export interface Recommendation {
  priority: number; // 1-5 (1 = highest)
  action: string;
  actionAr: string;
  reason: string;
  reasonAr: string;
  estimatedCost: string;
  timeframe: string;
  timeframeAr: string;
}

export interface AnalysisDetail {
  parameter: string;
  value: number;
  unit: string;
  normalRange: [number, number];
  status: "normal" | "warning" | "critical";
  deviation: number; // % from normal
  trend: "stable" | "improving" | "degrading";
}

export interface FeedbackEntry {
  diagnosisId: string;
  confirmedCorrect: boolean;
  actualIssue?: string;
  technicianNotes?: string;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════
// TSB DATABASE (نشرات الخدمة التقنية)
// ═══════════════════════════════════════════════════════

const TSB_DATABASE: TSBEntry[] = [
  {
    id: "TSB-TOY-2019-001",
    make: "toyota",
    models: ["Camry", "Corolla", "RAV4"],
    yearRange: [2018, 2023],
    title: "Engine Oil Consumption Issue",
    titleAr: "مشكلة استهلاك زيت المحرك",
    description: "Excessive oil consumption due to piston ring design. May trigger P0171/P0174.",
    descriptionAr: "استهلاك مفرط للزيت بسبب تصميم حلقات المكبس. قد يظهر كود P0171/P0174.",
    relatedDTCs: ["P0171", "P0174", "P0420"],
    fix: "Replace piston rings with updated design. TSB covers warranty extension.",
    fixAr: "استبدال حلقات المكبس بالتصميم المحدث. النشرة تغطي تمديد الضمان.",
    severity: "tsb",
    date: "2019-03-15",
  },
  {
    id: "TSB-HYU-2020-005",
    make: "hyundai",
    models: ["Sonata", "Tucson", "Santa Fe", "Elantra"],
    yearRange: [2017, 2023],
    title: "Theta II Engine Bearing Failure",
    titleAr: "عطل كراسي محرك Theta II",
    description: "Connecting rod bearing failure causing engine knock. Recall campaign for engine replacement.",
    descriptionAr: "عطل كراسي ذراع التوصيل يسبب طقطقة في المحرك. حملة استدعاء لاستبدال المحرك.",
    relatedDTCs: ["P0300", "P0301", "P0302", "P0303", "P0304"],
    fix: "Engine replacement under recall. Check VIN eligibility.",
    fixAr: "استبدال المحرك تحت حملة الاستدعاء. تحقق من أهلية رقم الهيكل.",
    severity: "recall",
    date: "2020-06-20",
  },
  {
    id: "TSB-NIS-2021-003",
    make: "nissan",
    models: ["Altima", "Sentra", "Rogue", "Pathfinder"],
    yearRange: [2015, 2022],
    title: "CVT Transmission Judder/Shudder",
    titleAr: "اهتزاز ناقل الحركة CVT",
    description: "CVT transmission shudder during acceleration. Software update and fluid change required.",
    descriptionAr: "اهتزاز ناقل CVT أثناء التسارع. يحتاج تحديث برمجي وتغيير زيت الناقل.",
    relatedDTCs: ["P0700", "P0868", "P17F0"],
    fix: "TCM software update + CVT fluid drain and refill with NS-3.",
    fixAr: "تحديث برمجة وحدة الناقل + تصريف وتعبئة زيت CVT نوع NS-3.",
    severity: "tsb",
    date: "2021-01-10",
  },
  {
    id: "TSB-FOR-2020-008",
    make: "ford",
    models: ["F-150", "Explorer", "Expedition"],
    yearRange: [2018, 2023],
    title: "10-Speed Transmission Harsh Shifting",
    titleAr: "تنقل قاسي في ناقل 10 سرعات",
    description: "Harsh 1-2 and 2-3 shifts. PCM calibration update available.",
    descriptionAr: "تنقل قاسي بين السرعة 1-2 و 2-3. تحديث معايرة PCM متاح.",
    relatedDTCs: ["P0700", "P0730", "P0731"],
    fix: "PCM recalibration with latest software. May also need valve body inspection.",
    fixAr: "إعادة معايرة PCM بأحدث برمجة. قد يحتاج فحص جسم الصمامات.",
    severity: "tsb",
    date: "2020-09-05",
  },
  {
    id: "TSB-FOR-2019-015",
    make: "ford",
    models: ["Focus", "Escape", "Fusion"],
    yearRange: [2012, 2018],
    title: "PowerShift DPS6 Transmission Shudder",
    titleAr: "اهتزاز ناقل PowerShift DPS6",
    description: "Dual-clutch transmission shudder, hesitation, and rough engagement. Known design issue.",
    descriptionAr: "اهتزاز وتردد وتعشيق خشن في ناقل الكلتش المزدوج. مشكلة تصميم معروفة.",
    relatedDTCs: ["P0700", "P0730", "P0741", "P07A5"],
    fix: "Clutch replacement with updated parts. TCM reprogramming. Extended warranty coverage.",
    fixAr: "استبدال الكلتش بقطع محدثة. إعادة برمجة TCM. مغطى بالضمان الممدد.",
    severity: "recall",
    date: "2019-04-12",
  },
  {
    id: "TSB-FOR-2021-003",
    make: "ford",
    models: ["F-150", "Mustang", "Explorer", "Edge"],
    yearRange: [2018, 2024],
    title: "EcoBoost Coolant Intrusion into Cylinders",
    titleAr: "تسرب سائل التبريد إلى الأسطوانات (EcoBoost)",
    description: "Coolant leak into combustion chambers via cracked cylinder head or head gasket failure in 2.7L/3.5L EcoBoost.",
    descriptionAr: "تسرب سائل التبريد إلى غرف الاحتراق عبر شق في رأس المحرك أو تلف الجوان في محركات 2.7L/3.5L EcoBoost.",
    relatedDTCs: ["P0300", "P0301", "P0302", "P0303", "P0304", "P0128", "P0217"],
    fix: "Cylinder head replacement or head gasket repair. Pressure test cooling system.",
    fixAr: "استبدال رأس المحرك أو إصلاح الجوان. اختبار ضغط نظام التبريد.",
    severity: "campaign",
    date: "2021-08-20",
  },
  {
    id: "TSB-FOR-2022-007",
    make: "ford",
    models: ["F-150", "Explorer", "Bronco"],
    yearRange: [2020, 2024],
    title: "Cam Phaser Tick/Rattle on Cold Start",
    titleAr: "صوت طقطقة Cam Phaser عند التشغيل البارد",
    description: "Cam phaser rattle for 2-5 seconds on cold start due to oil drain-back. 5.0L Coyote engine.",
    descriptionAr: "صوت طقطقة لمدة 2-5 ثواني عند التشغيل البارد بسبب تسرب الزيت من Cam Phaser. محرك 5.0L Coyote.",
    relatedDTCs: ["P0010", "P0011", "P0012", "P0020", "P0021", "P0022"],
    fix: "Replace cam phasers with updated design. Use Motorcraft 5W-30 oil only.",
    fixAr: "استبدال Cam Phaser بالتصميم المحدث. استخدام زيت Motorcraft 5W-30 فقط.",
    severity: "tsb",
    date: "2022-03-15",
  },
  {
    id: "TSB-FOR-2020-022",
    make: "ford",
    models: ["F-150", "Expedition", "Navigator"],
    yearRange: [2017, 2022],
    title: "Spark Plug Blowout - 5.4L/4.6L Triton",
    titleAr: "انفجار البوجي - محرك 5.4L/4.6L Triton",
    description: "Spark plug ejection from cylinder head due to insufficient thread engagement. Common on 2-valve Triton engines.",
    descriptionAr: "انفجار البوجي من رأس المحرك بسبب قلة اللفات. شائع في محركات Triton ذات الصمامين.",
    relatedDTCs: ["P0300", "P0301", "P0302", "P0303", "P0304"],
    fix: "Install thread repair kit (Time-Sert or Heli-Coil). Replace spark plugs with updated design.",
    fixAr: "تركيب طقم إصلاح اللفات (Time-Sert). استبدال البواجي بالتصميم المحدث.",
    severity: "campaign",
    date: "2020-01-30",
  },
  {
    id: "TSB-FOR-2023-001",
    make: "ford",
    models: ["Bronco", "Ranger", "Maverick"],
    yearRange: [2021, 2025],
    title: "2.3L EcoBoost Turbo Wastegate Rattle",
    titleAr: "صوت خشخشة Wastegate تيربو 2.3L EcoBoost",
    description: "Wastegate actuator arm rattle at idle. Does not affect performance but is audible.",
    descriptionAr: "صوت خشخشة في ذراع Wastegate عند الخمول. لا يؤثر على الأداء لكنه مسموع.",
    relatedDTCs: ["P0234", "P0299"],
    fix: "Replace turbocharger wastegate actuator with updated part.",
    fixAr: "استبدال مشغل Wastegate بالقطعة المحدثة.",
    severity: "tsb",
    date: "2023-02-10",
  },
  {
    id: "TSB-CHV-2019-012",
    make: "chevrolet",
    models: ["Silverado", "Tahoe", "Suburban"],
    yearRange: [2014, 2021],
    title: "AFM Lifter Failure",
    titleAr: "عطل رافعات نظام AFM",
    description: "Active Fuel Management lifter collapse causing misfire and ticking noise.",
    descriptionAr: "انهيار رافعات نظام إدارة الوقود النشط يسبب خلل احتراق وصوت طقطقة.",
    relatedDTCs: ["P0300", "P0301", "P0302", "P0303", "P0304", "P0305", "P0306", "P0307", "P0308"],
    fix: "Replace failed lifters. Consider AFM delete kit for permanent fix.",
    fixAr: "استبدال الرافعات التالفة. يُنصح بإلغاء نظام AFM كحل دائم.",
    severity: "campaign",
    date: "2019-11-20",
  },
  {
    id: "TSB-BMW-2021-007",
    make: "bmw",
    models: ["3 Series", "5 Series", "X3", "X5"],
    yearRange: [2016, 2023],
    title: "VANOS Solenoid Oil Leak",
    titleAr: "تسريب زيت صمام VANOS",
    description: "VANOS solenoid seal degradation causing oil leak and variable timing issues.",
    descriptionAr: "تآكل حشية صمام VANOS يسبب تسريب زيت ومشاكل في توقيت الصمامات.",
    relatedDTCs: ["P0010", "P0011", "P0012", "P0014"],
    fix: "Replace VANOS solenoid seals. Updated part number available.",
    fixAr: "استبدال حشيات صمام VANOS. رقم القطعة المحدث متاح.",
    severity: "tsb",
    date: "2021-04-15",
  },
  {
    id: "TSB-MER-2020-004",
    make: "mercedes",
    models: ["C-Class", "E-Class", "GLC", "GLE"],
    yearRange: [2015, 2022],
    title: "Camshaft Adjuster Rattle on Cold Start",
    titleAr: "صوت خشخشة ضابط الكامات عند التشغيل البارد",
    description: "Camshaft adjuster rattle for 1-3 seconds on cold start due to oil drain-back.",
    descriptionAr: "صوت خشخشة لمدة 1-3 ثوان عند التشغيل البارد بسبب تسرب الزيت من الضابط.",
    relatedDTCs: ["P0010", "P0011", "P0016"],
    fix: "Replace camshaft adjuster with updated design. Use approved oil spec.",
    fixAr: "استبدال ضابط الكامات بالتصميم المحدث. استخدم مواصفة الزيت المعتمدة.",
    severity: "tsb",
    date: "2020-07-22",
  },
  {
    id: "TSB-KIA-2022-002",
    make: "kia",
    models: ["Optima", "Sportage", "Sorento", "Soul"],
    yearRange: [2017, 2023],
    title: "Catalytic Converter Premature Failure",
    titleAr: "تلف مبكر للمحول الحفاز",
    description: "Premature catalytic converter failure due to engine oil consumption.",
    descriptionAr: "تلف مبكر للمحول الحفاز بسبب استهلاك زيت المحرك.",
    relatedDTCs: ["P0420", "P0421", "P0430"],
    fix: "Replace catalytic converter. Address root cause of oil consumption first.",
    fixAr: "استبدال المحول الحفاز. معالجة سبب استهلاك الزيت أولاً.",
    severity: "campaign",
    date: "2022-02-10",
  },
];

// ═══════════════════════════════════════════════════════
// FAULT CORRELATION RULES
// ═══════════════════════════════════════════════════════

interface CorrelationRule {
  id: string;
  conditions: CorrelationCondition[];
  diagnosis: {
    system: string;
    issue: string;
    issueAr: string;
    rootCause: string;
    rootCauseAr: string;
    probability: number;
    severity: "low" | "medium" | "high" | "critical";
  };
}

interface CorrelationCondition {
  type: "dtc" | "sensor" | "pattern";
  code?: string;
  parameter?: string;
  operator?: ">" | "<" | "=" | "between" | "stuck";
  value?: number;
  value2?: number;
}

const CORRELATION_RULES: CorrelationRule[] = [
  {
    id: "VACUUM_LEAK",
    conditions: [
      { type: "sensor", parameter: "shortFuelTrimB1", operator: ">", value: 15 },
      { type: "sensor", parameter: "longFuelTrimB1", operator: ">", value: 10 },
      { type: "sensor", parameter: "engineLoad", operator: "<", value: 30 },
    ],
    diagnosis: {
      system: "Fuel System",
      issue: "Vacuum Leak Detected",
      issueAr: "تسريب هواء (Vacuum Leak)",
      rootCause: "Intake manifold gasket, vacuum hose crack, or PCV valve failure",
      rootCauseAr: "حشية مجمع السحب، تشقق خرطوم الفاكيوم، أو عطل صمام PCV",
      probability: 87,
      severity: "medium",
    },
  },
  {
    id: "MAF_DIRTY",
    conditions: [
      { type: "dtc", code: "P0171" },
      { type: "sensor", parameter: "mafRate", operator: "<", value: 5 },
      { type: "sensor", parameter: "shortFuelTrimB1", operator: ">", value: 10 },
    ],
    diagnosis: {
      system: "Air Intake",
      issue: "MAF Sensor Contaminated",
      issueAr: "حساس MAF متسخ",
      rootCause: "Mass Air Flow sensor contaminated with oil/dirt, reading lower than actual airflow",
      rootCauseAr: "حساس تدفق الهواء ملوث بالزيت/الأوساخ، يقرأ أقل من التدفق الفعلي",
      probability: 92,
      severity: "medium",
    },
  },
  {
    id: "CATALYST_DEGRADED",
    conditions: [
      { type: "dtc", code: "P0420" },
      { type: "sensor", parameter: "o2VoltageB1S2", operator: ">", value: 0.6 },
    ],
    diagnosis: {
      system: "Exhaust/Emissions",
      issue: "Catalytic Converter Efficiency Below Threshold",
      issueAr: "كفاءة المحول الحفاز أقل من الحد",
      rootCause: "Catalyst substrate degraded, unable to properly convert exhaust gases",
      rootCauseAr: "تآكل مادة المحول الحفاز، غير قادر على تحويل غازات العادم بشكل صحيح",
      probability: 78,
      severity: "medium",
    },
  },
  {
    id: "OVERHEATING_THERMOSTAT",
    conditions: [
      { type: "sensor", parameter: "coolantTemp", operator: ">", value: 108 },
      { type: "sensor", parameter: "speed", operator: ">", value: 0 },
    ],
    diagnosis: {
      system: "Cooling System",
      issue: "Engine Overheating - Thermostat Stuck Closed",
      issueAr: "ارتفاع حرارة المحرك - ثرموستات عالق مغلق",
      rootCause: "Thermostat not opening at correct temperature, restricting coolant flow",
      rootCauseAr: "الثرموستات لا يفتح عند الحرارة الصحيحة، يقيد تدفق سائل التبريد",
      probability: 75,
      severity: "critical",
    },
  },
  {
    id: "O2_SENSOR_LAZY",
    conditions: [
      { type: "sensor", parameter: "o2VoltageB1S1", operator: "stuck", value: 0.45 },
      { type: "sensor", parameter: "shortFuelTrimB1", operator: ">", value: 8 },
    ],
    diagnosis: {
      system: "Emissions",
      issue: "O2 Sensor Slow Response (Lazy Sensor)",
      issueAr: "حساس O2 بطيء الاستجابة",
      rootCause: "Upstream O2 sensor aging, slow voltage switching causing fuel trim compensation",
      rootCauseAr: "تقادم حساس O2 الأمامي، تبديل جهد بطيء يسبب تعويض في خليط الوقود",
      probability: 82,
      severity: "medium",
    },
  },
  {
    id: "MISFIRE_COIL",
    conditions: [
      { type: "dtc", code: "P0301" },
      { type: "sensor", parameter: "rpm", operator: "<", value: 1500 },
    ],
    diagnosis: {
      system: "Ignition",
      issue: "Ignition Coil Failure - Cylinder 1",
      issueAr: "عطل ملف إشعال - أسطوانة 1",
      rootCause: "Ignition coil internal short or open circuit, worse at idle",
      rootCauseAr: "قصر أو قطع داخلي في ملف الإشعال، يزداد سوءاً عند الخمول",
      probability: 85,
      severity: "high",
    },
  },
  {
    id: "FUEL_PUMP_WEAK",
    conditions: [
      { type: "sensor", parameter: "fuelPressure", operator: "<", value: 30 },
      { type: "sensor", parameter: "engineLoad", operator: ">", value: 70 },
    ],
    diagnosis: {
      system: "Fuel Delivery",
      issue: "Fuel Pump Weak Under Load",
      issueAr: "ضعف مضخة الوقود تحت الحمل",
      rootCause: "Fuel pump unable to maintain pressure at high demand, internal wear",
      rootCauseAr: "مضخة الوقود غير قادرة على الحفاظ على الضغط عند الطلب العالي، تآكل داخلي",
      probability: 79,
      severity: "high",
    },
  },
  {
    id: "EGR_STUCK_OPEN",
    conditions: [
      { type: "dtc", code: "P0401" },
      { type: "sensor", parameter: "rpm", operator: "<", value: 900 },
      { type: "sensor", parameter: "engineLoad", operator: ">", value: 40 },
    ],
    diagnosis: {
      system: "EGR System",
      issue: "EGR Valve Stuck Open",
      issueAr: "صمام EGR عالق مفتوح",
      rootCause: "Carbon buildup preventing EGR valve from closing, causing rough idle",
      rootCauseAr: "تراكم الكربون يمنع صمام EGR من الإغلاق، يسبب خمول خشن",
      probability: 88,
      severity: "medium",
    },
  },
  // ═══ Ford-Specific Correlation Rules ═══
  {
    id: "FORD_DPFE_EGR",
    conditions: [
      { type: "dtc", code: "P0401" },
      { type: "sensor", parameter: "coolantTemp", operator: ">", value: 80 },
      { type: "sensor", parameter: "engineLoad", operator: ">", value: 20 },
    ],
    diagnosis: {
      system: "Ford EGR/DPFE",
      issue: "Ford DPFE Sensor Failure",
      issueAr: "عطل حساس DPFE (خاص بفورد)",
      rootCause: "DPFE (Delta Pressure Feedback EGR) sensor degraded - common Ford failure. Sensor reads incorrect pressure differential.",
      rootCauseAr: "تدهور حساس DPFE (فرق الضغط لـ EGR) - عطل شائع في فورد. الحساس يقرأ فرق ضغط خاطئ.",
      probability: 91,
      severity: "medium",
    },
  },
  {
    id: "FORD_ECOBOOST_MISFIRE_COOLANT",
    conditions: [
      { type: "dtc", code: "P0300" },
      { type: "sensor", parameter: "coolantTemp", operator: "<", value: 85 },
      { type: "sensor", parameter: "shortFuelTrimB1", operator: ">", value: 5 },
    ],
    diagnosis: {
      system: "Ford EcoBoost",
      issue: "EcoBoost Coolant Intrusion Suspected",
      issueAr: "اشتباه تسرب سائل تبريد للأسطوانات (EcoBoost)",
      rootCause: "Coolant leaking into combustion chambers via cracked head or failed head gasket. White smoke on startup, coolant loss without visible leak.",
      rootCauseAr: "تسرب سائل التبريد إلى غرف الاحتراق عبر شق في الرأس أو تلف الجوان. دخان أبيض عند التشغيل، نقص سائل بدون تسريب ظاهر.",
      probability: 76,
      severity: "critical",
    },
  },
  {
    id: "FORD_CAM_PHASER",
    conditions: [
      { type: "dtc", code: "P0011" },
      { type: "sensor", parameter: "rpm", operator: "<", value: 1200 },
    ],
    diagnosis: {
      system: "Ford VVT/Cam Phaser",
      issue: "Cam Phaser Failure (Ford Coyote/EcoBoost)",
      issueAr: "عطل Cam Phaser (فورد Coyote/EcoBoost)",
      rootCause: "Cam phaser internal locking mechanism worn, causing timing rattle on cold start and P0011/P0012 codes.",
      rootCauseAr: "تآكل آلية القفل الداخلية لـ Cam Phaser، يسبب طقطقة عند التشغيل البارد وأكواد P0011/P0012.",
      probability: 89,
      severity: "high",
    },
  },
  {
    id: "FORD_THROTTLE_BODY",
    conditions: [
      { type: "sensor", parameter: "throttlePos", operator: ">", value: 5 },
      { type: "sensor", parameter: "rpm", operator: "<", value: 700 },
      { type: "sensor", parameter: "engineLoad", operator: ">", value: 35 },
    ],
    diagnosis: {
      system: "Ford Electronic Throttle",
      issue: "Ford Electronic Throttle Body Carbon Buildup",
      issueAr: "تراكم كربون في جسم الخانق الإلكتروني (فورد)",
      rootCause: "Carbon deposits on throttle plate preventing proper closure, causing high idle load and rough idle.",
      rootCauseAr: "تراكم الكربون على صفيحة الخانق يمنع الإغلاق الصحيح، يسبب حمل عالي وخمول خشن.",
      probability: 83,
      severity: "medium",
    },
  },
  {
    id: "FORD_PURGE_VALVE",
    conditions: [
      { type: "dtc", code: "P0171" },
      { type: "sensor", parameter: "shortFuelTrimB1", operator: ">", value: 20 },
      { type: "sensor", parameter: "rpm", operator: "<", value: 1000 },
    ],
    diagnosis: {
      system: "Ford EVAP/Fuel",
      issue: "Ford EVAP Purge Valve Stuck Open",
      issueAr: "صمام تطهير EVAP عالق مفتوح (فورد)",
      rootCause: "EVAP canister purge valve stuck open, causing unmetered fuel vapor to enter intake, lean condition at idle.",
      rootCauseAr: "صمام تطهير علبة EVAP عالق مفتوح، يسبب دخول بخار وقود غير مقاس للسحب، خليط فقير عند الخمول.",
      probability: 86,
      severity: "medium",
    },
  },
  {
    id: "FORD_TURBO_UNDERBOOST",
    conditions: [
      { type: "sensor", parameter: "engineLoad", operator: "<", value: 50 },
      { type: "sensor", parameter: "rpm", operator: ">", value: 2500 },
      { type: "sensor", parameter: "throttlePos", operator: ">", value: 70 },
    ],
    diagnosis: {
      system: "Ford Turbo/EcoBoost",
      issue: "Ford EcoBoost Underboost Condition",
      issueAr: "ضغط تيربو منخفض (EcoBoost)",
      rootCause: "Turbo not producing expected boost. Possible wastegate actuator failure, boost leak, or intercooler leak.",
      rootCauseAr: "التيربو لا ينتج الضغط المتوقع. احتمال عطل مشغل Wastegate، تسريب ضغط، أو تسريب انتركولر.",
      probability: 80,
      severity: "high",
    },
  },
];

// ═══════════════════════════════════════════════════════
// AI DIAGNOSTIC ENGINE CLASS
// ═══════════════════════════════════════════════════════

export class OBDAiEngine {
  private sensorHistory: LiveSensorData[] = [];
  private dtcHistory: string[] = [];
  private feedbackHistory: FeedbackEntry[] = [];
  private diagnosisHistory: DiagnosticResult[] = [];
  private learningWeights: Map<string, number> = new Map();

  constructor() {
    this.loadLearningData();
  }

  // ═══ Main Diagnosis Method ═══
  async runFullDiagnosis(
    currentData: LiveSensorData,
    dtcCodes: string[],
    vehicleMake?: string,
    vehicleYear?: number,
    historicalData?: LiveSensorData[]
  ): Promise<DiagnosticResult> {
    // Store current data
    this.sensorHistory.push(currentData);
    this.dtcHistory = dtcCodes;

    // Run all analysis modules in parallel
    const [
      patternAnalysis,
      correlationResults,
      predictiveAlerts,
      tsbMatches,
      vibrationResult,
    ] = await Promise.all([
      this.analyzePatterns(currentData),
      this.runCorrelationAnalysis(currentData, dtcCodes),
      this.runPredictiveMaintenance(currentData, historicalData || this.sensorHistory),
      this.matchTSBs(dtcCodes, vehicleMake, vehicleYear),
      this.analyzeVibration(currentData),
    ]);

    // Calculate overall health
    const overallHealth = this.calculateOverallHealth(currentData, dtcCodes, patternAnalysis);

    // Generate diagnoses sorted by probability
    const allDiagnoses = correlationResults.sort((a, b) => b.probability - a.probability);
    const primaryDiagnosis = allDiagnoses[0] || this.getDefaultDiagnosis(overallHealth);
    const secondaryDiagnoses = allDiagnoses.slice(1, 4);

    // Apply learning weights
    this.applyLearningWeights(primaryDiagnosis);
    secondaryDiagnoses.forEach(d => this.applyLearningWeights(d));

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      primaryDiagnosis,
      secondaryDiagnoses,
      predictiveAlerts,
      tsbMatches
    );

    const result: DiagnosticResult = {
      id: `diag-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      overallHealth,
      confidence: this.calculateConfidence(patternAnalysis, correlationResults),
      primaryDiagnosis,
      secondaryDiagnoses,
      predictiveMaintenance: predictiveAlerts,
      tsbMatches,
      vibrationAnalysis: vibrationResult,
      recommendations,
      rawAnalysis: patternAnalysis,
    };

    this.diagnosisHistory.push(result);
    return result;
  }

  // ═══ Pattern Analysis ═══
  private async analyzePatterns(data: LiveSensorData): Promise<AnalysisDetail[]> {
    const analysis: AnalysisDetail[] = [];

    const checks: Array<{
      parameter: string;
      value: number;
      unit: string;
      normalRange: [number, number];
    }> = [
      { parameter: "RPM", value: data.rpm, unit: "rpm", normalRange: [650, 900] },
      { parameter: "حرارة المحرك", value: data.coolantTemp, unit: "°C", normalRange: [85, 105] },
      { parameter: "حمل المحرك", value: data.engineLoad, unit: "%", normalRange: [15, 45] },
      { parameter: "Short Fuel Trim B1", value: data.shortFuelTrimB1, unit: "%", normalRange: [-10, 10] },
      { parameter: "Long Fuel Trim B1", value: data.longFuelTrimB1, unit: "%", normalRange: [-10, 10] },
      { parameter: "MAF Rate", value: data.mafRate, unit: "g/s", normalRange: [2, 8] },
      { parameter: "Timing Advance", value: data.timingAdvance, unit: "°", normalRange: [5, 20] },
      { parameter: "O2 B1S1", value: data.o2VoltageB1S1, unit: "V", normalRange: [0.1, 0.9] },
      { parameter: "O2 B1S2", value: data.o2VoltageB1S2, unit: "V", normalRange: [0.4, 0.6] },
      { parameter: "ضغط الوقود", value: data.fuelPressure, unit: "kPa", normalRange: [35, 65] },
      { parameter: "حرارة السحب", value: data.intakeTemp, unit: "°C", normalRange: [20, 60] },
    ];

    if (data.oilTemp) {
      checks.push({ parameter: "حرارة الزيت", value: data.oilTemp, unit: "°C", normalRange: [90, 120] });
    }

    for (const check of checks) {
      const mid = (check.normalRange[0] + check.normalRange[1]) / 2;
      const range = check.normalRange[1] - check.normalRange[0];
      const deviation = ((check.value - mid) / (range / 2)) * 100;
      const isNormal = check.value >= check.normalRange[0] && check.value <= check.normalRange[1];
      const isCritical = Math.abs(deviation) > 150;

      // Determine trend from history
      let trend: "stable" | "improving" | "degrading" = "stable";
      if (this.sensorHistory.length >= 5) {
        const recentValues = this.sensorHistory.slice(-5).map(h => {
          const key = check.parameter.toLowerCase().replace(/\s/g, "");
          return (h as any)[key] || check.value;
        });
        const avgRecent = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
        if (Math.abs(check.value - avgRecent) > range * 0.1) {
          trend = check.value > avgRecent ? "degrading" : "improving";
        }
      }

      analysis.push({
        parameter: check.parameter,
        value: check.value,
        unit: check.unit,
        normalRange: check.normalRange,
        status: isCritical ? "critical" : isNormal ? "normal" : "warning",
        deviation: Math.round(deviation),
        trend,
      });
    }

    return analysis;
  }

  // ═══ Correlation Analysis ═══
  private async runCorrelationAnalysis(
    data: LiveSensorData,
    dtcCodes: string[]
  ): Promise<Diagnosis[]> {
    const diagnoses: Diagnosis[] = [];

    for (const rule of CORRELATION_RULES) {
      let matchCount = 0;
      const totalConditions = rule.conditions.length;
      const evidence: string[] = [];

      for (const condition of rule.conditions) {
        if (condition.type === "dtc" && condition.code) {
          if (dtcCodes.includes(condition.code)) {
            matchCount++;
            evidence.push(`كود عطل ${condition.code} موجود`);
          }
        } else if (condition.type === "sensor" && condition.parameter) {
          const value = (data as any)[condition.parameter];
          if (value !== undefined) {
            let matched = false;
            switch (condition.operator) {
              case ">": matched = value > (condition.value || 0); break;
              case "<": matched = value < (condition.value || 0); break;
              case "=": matched = Math.abs(value - (condition.value || 0)) < 0.1; break;
              case "stuck": matched = Math.abs(value - (condition.value || 0)) < 0.05; break;
              case "between": matched = value >= (condition.value || 0) && value <= (condition.value2 || 0); break;
            }
            if (matched) {
              matchCount++;
              evidence.push(`${condition.parameter}: ${value.toFixed(2)} ${condition.operator} ${condition.value}`);
            }
          }
        }
      }

      // Calculate match ratio
      const matchRatio = matchCount / totalConditions;
      if (matchRatio >= 0.6) { // At least 60% conditions met
        const adjustedProbability = Math.round(rule.diagnosis.probability * matchRatio);
        diagnoses.push({
          system: rule.diagnosis.system,
          issue: rule.diagnosis.issue,
          issueAr: rule.diagnosis.issueAr,
          probability: adjustedProbability,
          severity: rule.diagnosis.severity,
          rootCause: rule.diagnosis.rootCause,
          rootCauseAr: rule.diagnosis.rootCauseAr,
          evidence,
          relatedDTCs: dtcCodes.filter(c => rule.conditions.some(cond => cond.code === c)),
          estimatedCost: this.estimateCost(rule.diagnosis.system, rule.diagnosis.severity),
          urgency: rule.diagnosis.severity === "critical" ? "immediate" : rule.diagnosis.severity === "high" ? "soon" : "scheduled",
        });
      }
    }

    // Also add DTC-based diagnoses
    for (const dtc of dtcCodes) {
      const existing = diagnoses.find(d => d.relatedDTCs.includes(dtc));
      if (!existing) {
        diagnoses.push(this.dtcToDiagnosis(dtc));
      }
    }

    return diagnoses;
  }

  // ═══ Predictive Maintenance ═══
  private async runPredictiveMaintenance(
    current: LiveSensorData,
    history: LiveSensorData[]
  ): Promise<PredictiveAlert[]> {
    const alerts: PredictiveAlert[] = [];

    if (history.length < 3) return alerts;

    // Analyze coolant temp trend
    const tempTrend = this.calculateTrend(history.map(h => h.coolantTemp));
    if (tempTrend > 0.5) { // Rising trend
      const monthsToFailure = Math.max(1, Math.round((110 - current.coolantTemp) / (tempTrend * 30)));
      alerts.push({
        component: "Cooling System",
        componentAr: "نظام التبريد",
        currentCondition: Math.max(0, 100 - ((current.coolantTemp - 85) / 25) * 100),
        degradationRate: tempTrend * 30,
        estimatedFailureDate: this.addMonths(new Date(), monthsToFailure).toISOString().slice(0, 10),
        confidence: 72,
        recommendation: "Inspect thermostat, water pump, and radiator",
        recommendationAr: "فحص الثرموستات، مضخة الماء، والرديتر",
      });
    }

    // Analyze fuel trim trend
    const fuelTrimTrend = this.calculateTrend(history.map(h => h.shortFuelTrimB1));
    if (fuelTrimTrend > 0.3) {
      const monthsToIssue = Math.max(1, Math.round((15 - current.shortFuelTrimB1) / (fuelTrimTrend * 30)));
      alerts.push({
        component: "Fuel System / Air Intake",
        componentAr: "نظام الوقود / مجرى الهواء",
        currentCondition: Math.max(0, 100 - (Math.abs(current.shortFuelTrimB1) / 15) * 100),
        degradationRate: fuelTrimTrend * 30,
        estimatedFailureDate: this.addMonths(new Date(), monthsToIssue).toISOString().slice(0, 10),
        confidence: 68,
        recommendation: "Clean MAF sensor, check for vacuum leaks",
        recommendationAr: "تنظيف حساس MAF، فحص تسريبات الهواء",
      });
    }

    // Analyze O2 sensor health
    const o2Variance = this.calculateVariance(history.slice(-20).map(h => h.o2VoltageB1S1));
    if (o2Variance < 0.01 && history.length > 10) { // Very low variance = lazy sensor
      alerts.push({
        component: "O2 Sensor (B1S1)",
        componentAr: "حساس الأوكسجين (B1S1)",
        currentCondition: Math.max(0, o2Variance * 10000),
        degradationRate: 5,
        estimatedFailureDate: this.addMonths(new Date(), 3).toISOString().slice(0, 10),
        confidence: 75,
        recommendation: "Replace upstream O2 sensor",
        recommendationAr: "استبدال حساس O2 الأمامي",
      });
    }

    // Oil temperature analysis
    if (current.oilTemp && current.oilTemp > 115) {
      alerts.push({
        component: "Engine Oil",
        componentAr: "زيت المحرك",
        currentCondition: Math.max(0, 100 - ((current.oilTemp - 90) / 40) * 100),
        degradationRate: 8,
        estimatedFailureDate: this.addMonths(new Date(), 2).toISOString().slice(0, 10),
        confidence: 65,
        recommendation: "Change oil and filter, check oil cooler",
        recommendationAr: "تغيير الزيت والفلتر، فحص مبرد الزيت",
      });
    }

    return alerts;
  }

  // ═══ TSB Matching ═══
  private async matchTSBs(
    dtcCodes: string[],
    vehicleMake?: string,
    vehicleYear?: number
  ): Promise<TSBEntry[]> {
    return TSB_DATABASE.filter(tsb => {
      // Match by make
      if (vehicleMake && tsb.make !== vehicleMake) return false;

      // Match by year
      if (vehicleYear && (vehicleYear < tsb.yearRange[0] || vehicleYear > tsb.yearRange[1])) return false;

      // Match by DTC codes
      if (dtcCodes.length > 0) {
        return tsb.relatedDTCs.some(tsbDtc => dtcCodes.includes(tsbDtc));
      }

      // If no DTCs, still show relevant TSBs for the make
      return vehicleMake === tsb.make;
    });
  }

  // ═══ Vibration Analysis ═══
  private async analyzeVibration(data: LiveSensorData): Promise<VibrationResult | null> {
    // Simulate vibration analysis from RPM irregularities
    const rpmVariation = this.sensorHistory.length > 5
      ? this.calculateVariance(this.sensorHistory.slice(-10).map(h => h.rpm))
      : 0;

    if (rpmVariation < 100) return null; // No significant vibration

    const frequency = data.rpm / 60; // Convert RPM to Hz
    const amplitude = Math.sqrt(rpmVariation) / data.rpm * 100;

    let pattern: VibrationResult["pattern"] = "random";
    let likelyCause = "Normal engine vibration";
    let likelyCauseAr = "اهتزاز طبيعي للمحرك";
    let level: VibrationResult["overallLevel"] = "normal";

    if (amplitude > 5) {
      level = "critical";
      pattern = "periodic";
      likelyCause = "Possible engine mount failure or internal imbalance";
      likelyCauseAr = "احتمال عطل قاعدة المحرك أو عدم توازن داخلي";
    } else if (amplitude > 3) {
      level = "high";
      pattern = "harmonic";
      likelyCause = "Misfire or injector imbalance";
      likelyCauseAr = "خلل احتراق أو عدم توازن البخاخات";
    } else if (amplitude > 1.5) {
      level = "elevated";
      pattern = "periodic";
      likelyCause = "Minor imbalance, possibly worn spark plugs";
      likelyCauseAr = "عدم توازن بسيط، احتمال تآكل شمعات الإشعال";
    }

    return {
      overallLevel: level,
      frequency: Math.round(frequency * 10) / 10,
      amplitude: Math.round(amplitude * 100) / 100,
      pattern,
      likelyCause,
      likelyCauseAr,
      confidence: Math.min(90, 50 + this.sensorHistory.length * 2),
    };
  }

  // ═══ Learning System ═══
  submitFeedback(feedback: FeedbackEntry): void {
    this.feedbackHistory.push(feedback);

    // Adjust learning weights based on feedback
    const diagnosis = this.diagnosisHistory.find(d => d.id === feedback.diagnosisId);
    if (diagnosis) {
      const ruleKey = diagnosis.primaryDiagnosis.issue;
      const currentWeight = this.learningWeights.get(ruleKey) || 1.0;

      if (feedback.confirmedCorrect) {
        // Increase confidence for this diagnosis pattern
        this.learningWeights.set(ruleKey, Math.min(1.5, currentWeight + 0.05));
      } else {
        // Decrease confidence
        this.learningWeights.set(ruleKey, Math.max(0.5, currentWeight - 0.1));
      }
    }

    this.saveLearningData();
  }

  getLearningStats(): { totalFeedback: number; accuracy: number; topDiagnoses: Array<{ issue: string; weight: number }> } {
    const correct = this.feedbackHistory.filter(f => f.confirmedCorrect).length;
    const total = this.feedbackHistory.length;

    const topDiagnoses = Array.from(this.learningWeights.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([issue, weight]) => ({ issue, weight }));

    return {
      totalFeedback: total,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      topDiagnoses,
    };
  }

  // ═══ Helper Methods ═══
  private calculateOverallHealth(data: LiveSensorData, dtcCodes: string[], analysis: AnalysisDetail[]): number {
    let score = 100;

    // DTC penalty (30% weight)
    score -= dtcCodes.length * 10;

    // Sensor deviations (50% weight)
    const criticalCount = analysis.filter(a => a.status === "critical").length;
    const warningCount = analysis.filter(a => a.status === "warning").length;
    score -= criticalCount * 12;
    score -= warningCount * 5;

    // Temperature penalty (10% weight)
    if (data.coolantTemp > 105) score -= (data.coolantTemp - 105) * 2;
    if (data.coolantTemp < 70) score -= 10;

    // Fuel trim penalty (10% weight)
    const fuelTrimDeviation = Math.abs(data.shortFuelTrimB1) + Math.abs(data.longFuelTrimB1);
    if (fuelTrimDeviation > 20) score -= 15;
    else if (fuelTrimDeviation > 10) score -= 8;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateConfidence(analysis: AnalysisDetail[], diagnoses: Diagnosis[]): number {
    let confidence = 50; // Base confidence

    // More data = more confidence
    confidence += Math.min(20, this.sensorHistory.length * 2);

    // More matching conditions = more confidence
    if (diagnoses.length > 0) {
      confidence += Math.min(20, diagnoses[0].probability / 5);
    }

    // Learning data improves confidence
    confidence += Math.min(10, this.feedbackHistory.length);

    return Math.min(95, confidence);
  }

  private applyLearningWeights(diagnosis: Diagnosis): void {
    const weight = this.learningWeights.get(diagnosis.issue) || 1.0;
    diagnosis.probability = Math.min(99, Math.round(diagnosis.probability * weight));
  }

  private generateRecommendations(
    primary: Diagnosis,
    secondary: Diagnosis[],
    predictive: PredictiveAlert[],
    tsbs: TSBEntry[]
  ): Recommendation[] {
    const recs: Recommendation[] = [];
    let priority = 1;

    // Primary diagnosis recommendation
    if (primary.probability > 50) {
      recs.push({
        priority: priority++,
        action: `Fix: ${primary.issue}`,
        actionAr: `إصلاح: ${primary.issueAr}`,
        reason: primary.rootCause,
        reasonAr: primary.rootCauseAr,
        estimatedCost: primary.estimatedCost,
        timeframe: primary.urgency === "immediate" ? "Immediately" : primary.urgency === "soon" ? "Within 1 week" : "Within 1 month",
        timeframeAr: primary.urgency === "immediate" ? "فوراً" : primary.urgency === "soon" ? "خلال أسبوع" : "خلال شهر",
      });
    }

    // TSB recommendations
    for (const tsb of tsbs.slice(0, 2)) {
      recs.push({
        priority: priority++,
        action: `TSB: ${tsb.title}`,
        actionAr: `نشرة خدمة: ${tsb.titleAr}`,
        reason: tsb.description,
        reasonAr: tsb.descriptionAr,
        estimatedCost: tsb.severity === "recall" ? "مجاني (استدعاء)" : "يعتمد على الوكالة",
        timeframe: tsb.severity === "recall" ? "Immediately" : "Schedule with dealer",
        timeframeAr: tsb.severity === "recall" ? "فوراً" : "حجز موعد مع الوكالة",
      });
    }

    // Predictive maintenance
    for (const alert of predictive.slice(0, 3)) {
      recs.push({
        priority: priority++,
        action: `Preventive: ${alert.component}`,
        actionAr: `وقائي: ${alert.componentAr}`,
        reason: alert.recommendation,
        reasonAr: alert.recommendationAr,
        estimatedCost: "200 - 800 ر.س",
        timeframe: `Before ${alert.estimatedFailureDate}`,
        timeframeAr: `قبل ${alert.estimatedFailureDate}`,
      });
    }

    return recs;
  }

  private dtcToDiagnosis(dtc: string): Diagnosis {
    const category = dtc[0];
    const system = category === "P" ? "Powertrain" : category === "B" ? "Body" : category === "C" ? "Chassis" : "Network";
    return {
      system,
      issue: `DTC ${dtc} Active`,
      issueAr: `كود عطل ${dtc} نشط`,
      probability: 60,
      severity: "medium",
      rootCause: `Diagnostic trouble code ${dtc} requires further investigation`,
      rootCauseAr: `كود العطل ${dtc} يحتاج فحص إضافي`,
      evidence: [`كود ${dtc} مسجل في ECU`],
      relatedDTCs: [dtc],
      estimatedCost: "يعتمد على التشخيص",
      urgency: "scheduled",
    };
  }

  private estimateCost(system: string, severity: string): string {
    const costs: Record<string, Record<string, string>> = {
      "Fuel System": { low: "100-300 ر.س", medium: "300-800 ر.س", high: "800-2000 ر.س", critical: "2000-5000 ر.س" },
      "Air Intake": { low: "50-200 ر.س", medium: "200-600 ر.س", high: "600-1500 ر.س", critical: "1500-3000 ر.س" },
      "Ignition": { low: "100-300 ر.س", medium: "300-800 ر.س", high: "800-2000 ر.س", critical: "2000-4000 ر.س" },
      "Cooling System": { low: "100-400 ر.س", medium: "400-1200 ر.س", high: "1200-3000 ر.س", critical: "3000-6000 ر.س" },
      "Exhaust/Emissions": { low: "200-500 ر.س", medium: "500-2000 ر.س", high: "2000-5000 ر.س", critical: "5000-10000 ر.س" },
      default: { low: "100-500 ر.س", medium: "500-1500 ر.س", high: "1500-4000 ر.س", critical: "4000-8000 ر.س" },
    };
    return (costs[system] || costs.default)[severity] || "يعتمد على الفحص";
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 3) return 0;
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }

  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  private getDefaultDiagnosis(health: number): Diagnosis {
    return {
      system: "General",
      issue: health > 80 ? "Vehicle in Good Condition" : "General Maintenance Needed",
      issueAr: health > 80 ? "السيارة بحالة جيدة" : "تحتاج صيانة عامة",
      probability: 90,
      severity: health > 80 ? "low" : "medium",
      rootCause: health > 80 ? "No significant issues detected" : "Minor deviations from normal parameters",
      rootCauseAr: health > 80 ? "لا توجد مشاكل كبيرة" : "انحرافات بسيطة عن القيم الطبيعية",
      evidence: [`Engine Health Score: ${health}%`],
      relatedDTCs: [],
      estimatedCost: health > 80 ? "—" : "200-500 ر.س (صيانة دورية)",
      urgency: health > 80 ? "monitor" : "scheduled",
    };
  }

  private loadLearningData(): void {
    try {
      const stored = localStorage.getItem("obd_ai_learning");
      if (stored) {
        const data = JSON.parse(stored);
        this.learningWeights = new Map(Object.entries(data.weights || {}));
        this.feedbackHistory = data.feedback || [];
      }
    } catch { /* ignore */ }
  }

  private saveLearningData(): void {
    try {
      const data = {
        weights: Object.fromEntries(this.learningWeights),
        feedback: this.feedbackHistory.slice(-100), // Keep last 100
      };
      localStorage.setItem("obd_ai_learning", JSON.stringify(data));
    } catch { /* ignore */ }
  }

  // ═══ Public Getters ═══
  get historyLength(): number { return this.sensorHistory.length; }
  get lastDiagnosis(): DiagnosticResult | null { return this.diagnosisHistory[this.diagnosisHistory.length - 1] || null; }
}

// Singleton instance
export const obdAiEngine = new OBDAiEngine();
