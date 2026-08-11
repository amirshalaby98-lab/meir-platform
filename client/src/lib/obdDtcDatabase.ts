import { lookupMegaDTC, searchDTCs as searchMegaDTCs, getMegaDTCCount } from './dtcMegaDatabase';

/**
 * OBD2 DTC Database - قاعدة بيانات أكواد الأعطال الشاملة
 * ═══════════════════════════════════════════════════════
 * 
 * Covers ALL OBD2 Systems:
 * - P0xxx / P1xxx / P2xxx / P3xxx : Powertrain (Engine + Transmission)
 * - C0xxx / C1xxx / C2xxx : Chassis (ABS + Brakes + Steering + Suspension)
 * - B0xxx / B1xxx / B2xxx : Body (Airbag/SRS + Lights + Climate)
 * - U0xxx / U1xxx / U2xxx : Network (CAN Bus + Communication)
 * 
 * Standards:
 * - SAE J2012 (OBD2 DTC standard)
 * - ISO 15031-6 (EOBD DTC standard)
 * - All formulas verified against official SAE documentation
 * 
 * @version 2.0.0
 * @author مير - Meir Diagnostics
 */

export interface DTCInfo {
  code: string;
  description: string;
  descriptionAr: string;
  system: DTCSystem;
  subsystem: string;
  subsystemAr: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  causes: string[];
  causesAr: string[];
  solution: string;
  solutionAr: string;
  relatedSensors: string[];
  affectedComponents: string[];
  affectedComponentsAr: string[];
  safeToRide: boolean;
  estimatedRepairCost?: { min: number; max: number; currency: string };
}

export type DTCSystem = "engine" | "transmission" | "abs" | "airbag" | "body" | "network" | "unknown";

// ═══════════════════════════════════════════════════════
// TRANSMISSION DTC CODES (P07xx - P08xx)
// ═══════════════════════════════════════════════════════

export const TRANSMISSION_DTC: Record<string, DTCInfo> = {
  // ── Gear Ratio Errors ──
  "P0700": {
    code: "P0700",
    description: "Transmission Control System Malfunction",
    descriptionAr: "عطل في نظام التحكم بالقير",
    system: "transmission",
    subsystem: "TCM General",
    subsystemAr: "وحدة التحكم بالقير العامة",
    severity: "high",
    causes: ["TCM fault", "Wiring harness damage", "Low transmission fluid", "Internal transmission damage"],
    causesAr: ["عطل في وحدة TCM", "تلف حزمة الأسلاك", "زيت القير منخفض", "تلف داخلي في القير"],
    solution: "Scan TCM for specific codes, check transmission fluid level and condition, inspect wiring",
    solutionAr: "فحص TCM للأكواد التفصيلية، فحص مستوى وحالة زيت القير، فحص الأسلاك",
    relatedSensors: ["TCM", "TFT Sensor", "TPS", "Vehicle Speed Sensor"],
    affectedComponents: ["Transmission Control Module", "Solenoids", "Valve Body"],
    affectedComponentsAr: ["وحدة التحكم بالقير", "الصواميل الكهربائية", "جسم الصمام"],
    safeToRide: false,
    estimatedRepairCost: { min: 500, max: 3000, currency: "SAR" }
  },
  "P0701": {
    code: "P0701",
    description: "Transmission Control System Range/Performance",
    descriptionAr: "نطاق/أداء نظام التحكم بالقير خارج المواصفات",
    system: "transmission",
    subsystem: "TCM Performance",
    subsystemAr: "أداء وحدة التحكم بالقير",
    severity: "high",
    causes: ["TCM software error", "Incorrect gear ratios", "Slipping clutch packs", "Worn bands"],
    causesAr: ["خطأ في برنامج TCM", "نسب تروس خاطئة", "انزلاق حزم القابض", "أحزمة متآكلة"],
    solution: "Check TCM software version, inspect clutch packs and bands, verify gear ratios",
    solutionAr: "فحص إصدار برنامج TCM، فحص حزم القابض والأحزمة، التحقق من نسب التروس",
    relatedSensors: ["Input Speed Sensor", "Output Speed Sensor", "TFT Sensor"],
    affectedComponents: ["Clutch Packs", "Transmission Bands", "TCM"],
    affectedComponentsAr: ["حزم القابض", "أحزمة القير", "وحدة التحكم بالقير"],
    safeToRide: false,
    estimatedRepairCost: { min: 800, max: 5000, currency: "SAR" }
  },
  "P0702": {
    code: "P0702",
    description: "Transmission Control System Electrical",
    descriptionAr: "عطل كهربائي في نظام التحكم بالقير",
    system: "transmission",
    subsystem: "TCM Electrical",
    subsystemAr: "الكهرباء في وحدة التحكم بالقير",
    severity: "high",
    causes: ["Short circuit in TCM wiring", "Corroded connectors", "Damaged TCM", "Battery voltage issues"],
    causesAr: ["قصر في أسلاك TCM", "موصلات متآكلة", "TCM تالف", "مشاكل في جهد البطارية"],
    solution: "Check all TCM wiring and connectors, test battery voltage, replace TCM if needed",
    solutionAr: "فحص جميع أسلاك وموصلات TCM، اختبار جهد البطارية، استبدال TCM إذا لزم",
    relatedSensors: ["TCM Power Supply", "Ground Circuits"],
    affectedComponents: ["TCM", "Wiring Harness", "Connectors"],
    affectedComponentsAr: ["وحدة التحكم بالقير", "حزمة الأسلاك", "الموصلات"],
    safeToRide: false,
    estimatedRepairCost: { min: 400, max: 2500, currency: "SAR" }
  },
  "P0705": {
    code: "P0705",
    description: "Transmission Range Sensor Circuit Malfunction (PRNDL Input)",
    descriptionAr: "عطل في دائرة حساس وضعية القير (PRNDL)",
    system: "transmission",
    subsystem: "Range Sensor",
    subsystemAr: "حساس وضعية القير",
    severity: "high",
    causes: ["Faulty TR sensor", "Damaged wiring", "Misadjusted TR sensor", "Corroded connector"],
    causesAr: ["حساس TR تالف", "أسلاك تالفة", "حساس TR غير معاير", "موصل متآكل"],
    solution: "Test TR sensor voltage, adjust or replace TR sensor, repair wiring",
    solutionAr: "اختبار جهد حساس TR، معايرة أو استبدال حساس TR، إصلاح الأسلاك",
    relatedSensors: ["TR Sensor", "Gear Position Sensor"],
    affectedComponents: ["Transmission Range Sensor", "Shift Linkage"],
    affectedComponentsAr: ["حساس وضعية القير", "ربط ناقل الحركة"],
    safeToRide: false,
    estimatedRepairCost: { min: 300, max: 1200, currency: "SAR" }
  },
  "P0706": {
    code: "P0706",
    description: "Transmission Range Sensor Circuit Range/Performance",
    descriptionAr: "نطاق/أداء دائرة حساس وضعية القير خارج المواصفات",
    system: "transmission",
    subsystem: "Range Sensor",
    subsystemAr: "حساس وضعية القير",
    severity: "medium",
    causes: ["Worn TR sensor", "Loose shift linkage", "Intermittent wiring fault"],
    causesAr: ["حساس TR متآكل", "ربط ناقل الحركة مرتخ", "عطل متقطع في الأسلاك"],
    solution: "Inspect shift linkage adjustment, test TR sensor at all positions",
    solutionAr: "فحص معايرة ربط ناقل الحركة، اختبار حساس TR في جميع الأوضاع",
    relatedSensors: ["TR Sensor"],
    affectedComponents: ["Transmission Range Sensor", "Shift Linkage"],
    affectedComponentsAr: ["حساس وضعية القير", "ربط ناقل الحركة"],
    safeToRide: true,
    estimatedRepairCost: { min: 200, max: 800, currency: "SAR" }
  },
  "P0710": {
    code: "P0710",
    description: "Transmission Fluid Temperature Sensor Circuit Malfunction",
    descriptionAr: "عطل في دائرة حساس حرارة زيت القير",
    system: "transmission",
    subsystem: "TFT Sensor",
    subsystemAr: "حساس حرارة زيت القير",
    severity: "medium",
    causes: ["Faulty TFT sensor", "Open/short in wiring", "Corroded connector"],
    causesAr: ["حساس TFT تالف", "قطع/قصر في الأسلاك", "موصل متآكل"],
    solution: "Test TFT sensor resistance, check wiring continuity, replace sensor if faulty",
    solutionAr: "اختبار مقاومة حساس TFT، فحص استمرارية الأسلاك، استبدال الحساس إذا كان تالفاً",
    relatedSensors: ["TFT Sensor", "Transmission Fluid Temp"],
    affectedComponents: ["TFT Sensor", "Wiring"],
    affectedComponentsAr: ["حساس حرارة زيت القير", "الأسلاك"],
    safeToRide: true,
    estimatedRepairCost: { min: 150, max: 600, currency: "SAR" }
  },
  "P0711": {
    code: "P0711",
    description: "Transmission Fluid Temperature Sensor Range/Performance",
    descriptionAr: "نطاق/أداء حساس حرارة زيت القير خارج المواصفات",
    system: "transmission",
    subsystem: "TFT Sensor",
    subsystemAr: "حساس حرارة زيت القير",
    severity: "medium",
    causes: ["TFT sensor stuck", "Low transmission fluid", "Overheating transmission"],
    causesAr: ["حساس TFT عالق", "زيت القير منخفض", "القير يسخن زيادة"],
    solution: "Check transmission fluid level, test TFT sensor, check for overheating causes",
    solutionAr: "فحص مستوى زيت القير، اختبار حساس TFT، فحص أسباب ارتفاع الحرارة",
    relatedSensors: ["TFT Sensor", "Transmission Temp"],
    affectedComponents: ["TFT Sensor", "Transmission Cooler"],
    affectedComponentsAr: ["حساس حرارة زيت القير", "مبرد القير"],
    safeToRide: true,
    estimatedRepairCost: { min: 150, max: 800, currency: "SAR" }
  },
  "P0715": {
    code: "P0715",
    description: "Input/Turbine Speed Sensor Circuit Malfunction",
    descriptionAr: "عطل في دائرة حساس سرعة المدخل/التوربين",
    system: "transmission",
    subsystem: "Speed Sensors",
    subsystemAr: "حساسات السرعة",
    severity: "high",
    causes: ["Faulty input speed sensor", "Damaged tone wheel", "Wiring damage", "Metal debris on sensor"],
    causesAr: ["حساس سرعة المدخل تالف", "عجلة النغمة تالفة", "تلف الأسلاك", "براده معدنية على الحساس"],
    solution: "Inspect and clean input speed sensor, check tone wheel, replace sensor if needed",
    solutionAr: "فحص وتنظيف حساس سرعة المدخل، فحص عجلة النغمة، استبدال الحساس إذا لزم",
    relatedSensors: ["Input Speed Sensor", "Turbine Speed Sensor"],
    affectedComponents: ["Input Speed Sensor", "Tone Wheel"],
    affectedComponentsAr: ["حساس سرعة المدخل", "عجلة النغمة"],
    safeToRide: false,
    estimatedRepairCost: { min: 300, max: 1500, currency: "SAR" }
  },
  "P0720": {
    code: "P0720",
    description: "Output Speed Sensor Circuit Malfunction",
    descriptionAr: "عطل في دائرة حساس سرعة المخرج",
    system: "transmission",
    subsystem: "Speed Sensors",
    subsystemAr: "حساسات السرعة",
    severity: "high",
    causes: ["Faulty output speed sensor", "Damaged reluctor ring", "Wiring issue", "TCM fault"],
    causesAr: ["حساس سرعة المخرج تالف", "حلقة الممانعة تالفة", "مشكلة أسلاك", "عطل TCM"],
    solution: "Test output speed sensor, inspect reluctor ring, check wiring to TCM",
    solutionAr: "اختبار حساس سرعة المخرج، فحص حلقة الممانعة، فحص الأسلاك لـ TCM",
    relatedSensors: ["Output Speed Sensor", "Vehicle Speed Sensor"],
    affectedComponents: ["Output Speed Sensor", "Reluctor Ring"],
    affectedComponentsAr: ["حساس سرعة المخرج", "حلقة الممانعة"],
    safeToRide: false,
    estimatedRepairCost: { min: 300, max: 1500, currency: "SAR" }
  },
  "P0721": {
    code: "P0721",
    description: "Output Speed Sensor Range/Performance",
    descriptionAr: "نطاق/أداء حساس سرعة المخرج خارج المواصفات",
    system: "transmission",
    subsystem: "Speed Sensors",
    subsystemAr: "حساسات السرعة",
    severity: "medium",
    causes: ["Intermittent sensor fault", "Loose sensor mounting", "Partial reluctor ring damage"],
    causesAr: ["عطل متقطع في الحساس", "تركيب الحساس مرتخ", "تلف جزئي في حلقة الممانعة"],
    solution: "Check sensor mounting, inspect reluctor ring for damage, test sensor signal",
    solutionAr: "فحص تركيب الحساس، فحص حلقة الممانعة للتلف، اختبار إشارة الحساس",
    relatedSensors: ["Output Speed Sensor"],
    affectedComponents: ["Output Speed Sensor"],
    affectedComponentsAr: ["حساس سرعة المخرج"],
    safeToRide: true,
    estimatedRepairCost: { min: 200, max: 1000, currency: "SAR" }
  },
  "P0730": {
    code: "P0730",
    description: "Incorrect Gear Ratio",
    descriptionAr: "نسبة تروس خاطئة",
    system: "transmission",
    subsystem: "Gear Ratio",
    subsystemAr: "نسبة التروس",
    severity: "critical",
    causes: ["Worn clutch packs", "Damaged planetary gears", "Low fluid", "Solenoid failure", "Valve body issue"],
    causesAr: ["حزم القابض متآكلة", "تروس كوكبية تالفة", "زيت منخفض", "عطل الصمام الكهربائي", "مشكلة في جسم الصمام"],
    solution: "Check fluid level, test solenoids, inspect valve body, may require transmission rebuild",
    solutionAr: "فحص مستوى الزيت، اختبار الصمامات الكهربائية، فحص جسم الصمام، قد يحتاج إعادة بناء القير",
    relatedSensors: ["Input Speed Sensor", "Output Speed Sensor", "TFT Sensor"],
    affectedComponents: ["Clutch Packs", "Planetary Gears", "Solenoids", "Valve Body"],
    affectedComponentsAr: ["حزم القابض", "التروس الكوكبية", "الصمامات الكهربائية", "جسم الصمام"],
    safeToRide: false,
    estimatedRepairCost: { min: 2000, max: 15000, currency: "SAR" }
  },
  "P0731": {
    code: "P0731",
    description: "Gear 1 Incorrect Ratio",
    descriptionAr: "نسبة الترس الأول خاطئة",
    system: "transmission",
    subsystem: "Gear Ratio",
    subsystemAr: "نسبة التروس",
    severity: "high",
    causes: ["1st gear clutch pack worn", "1-2 shift solenoid fault", "Valve body issue"],
    causesAr: ["حزمة قابض الترس الأول متآكلة", "عطل صمام التحويل 1-2", "مشكلة في جسم الصمام"],
    solution: "Test 1-2 shift solenoid, inspect 1st gear clutch pack, check valve body",
    solutionAr: "اختبار صمام التحويل 1-2، فحص حزمة قابض الترس الأول، فحص جسم الصمام",
    relatedSensors: ["Input Speed Sensor", "Output Speed Sensor"],
    affectedComponents: ["1st Gear Clutch Pack", "1-2 Shift Solenoid"],
    affectedComponentsAr: ["حزمة قابض الترس الأول", "صمام التحويل 1-2"],
    safeToRide: false,
    estimatedRepairCost: { min: 1500, max: 8000, currency: "SAR" }
  },
  "P0732": {
    code: "P0732",
    description: "Gear 2 Incorrect Ratio",
    descriptionAr: "نسبة الترس الثاني خاطئة",
    system: "transmission",
    subsystem: "Gear Ratio",
    subsystemAr: "نسبة التروس",
    severity: "high",
    causes: ["2nd gear clutch pack worn", "2-3 shift solenoid fault", "Band adjustment needed"],
    causesAr: ["حزمة قابض الترس الثاني متآكلة", "عطل صمام التحويل 2-3", "الحزام يحتاج ضبط"],
    solution: "Test 2-3 shift solenoid, inspect 2nd gear clutch, adjust or replace bands",
    solutionAr: "اختبار صمام التحويل 2-3، فحص قابض الترس الثاني، ضبط أو استبدال الأحزمة",
    relatedSensors: ["Input Speed Sensor", "Output Speed Sensor"],
    affectedComponents: ["2nd Gear Clutch Pack", "2-3 Shift Solenoid", "Bands"],
    affectedComponentsAr: ["حزمة قابض الترس الثاني", "صمام التحويل 2-3", "الأحزمة"],
    safeToRide: false,
    estimatedRepairCost: { min: 1500, max: 8000, currency: "SAR" }
  },
  "P0733": {
    code: "P0733",
    description: "Gear 3 Incorrect Ratio",
    descriptionAr: "نسبة الترس الثالث خاطئة",
    system: "transmission",
    subsystem: "Gear Ratio",
    subsystemAr: "نسبة التروس",
    severity: "high",
    causes: ["3rd gear clutch pack worn", "3-4 shift solenoid fault", "Valve body wear"],
    causesAr: ["حزمة قابض الترس الثالث متآكلة", "عطل صمام التحويل 3-4", "تآكل جسم الصمام"],
    solution: "Test 3-4 shift solenoid, inspect 3rd gear clutch, rebuild valve body if needed",
    solutionAr: "اختبار صمام التحويل 3-4، فحص قابض الترس الثالث، إعادة بناء جسم الصمام إذا لزم",
    relatedSensors: ["Input Speed Sensor", "Output Speed Sensor"],
    affectedComponents: ["3rd Gear Clutch Pack", "3-4 Shift Solenoid"],
    affectedComponentsAr: ["حزمة قابض الترس الثالث", "صمام التحويل 3-4"],
    safeToRide: false,
    estimatedRepairCost: { min: 1500, max: 8000, currency: "SAR" }
  },
  "P0734": {
    code: "P0734",
    description: "Gear 4 Incorrect Ratio",
    descriptionAr: "نسبة الترس الرابع خاطئة",
    system: "transmission",
    subsystem: "Gear Ratio",
    subsystemAr: "نسبة التروس",
    severity: "high",
    causes: ["4th gear clutch pack worn", "OD solenoid fault", "Torque converter lockup issue"],
    causesAr: ["حزمة قابض الترس الرابع متآكلة", "عطل صمام OD", "مشكلة في قفل محول العزم"],
    solution: "Test OD solenoid, inspect 4th gear clutch, check torque converter lockup",
    solutionAr: "اختبار صمام OD، فحص قابض الترس الرابع، فحص قفل محول العزم",
    relatedSensors: ["Input Speed Sensor", "Output Speed Sensor", "TCC Solenoid"],
    affectedComponents: ["4th Gear Clutch Pack", "OD Solenoid", "Torque Converter"],
    affectedComponentsAr: ["حزمة قابض الترس الرابع", "صمام OD", "محول العزم"],
    safeToRide: false,
    estimatedRepairCost: { min: 1500, max: 10000, currency: "SAR" }
  },
  "P0740": {
    code: "P0740",
    description: "Torque Converter Clutch Circuit Malfunction",
    descriptionAr: "عطل في دائرة قابض محول العزم",
    system: "transmission",
    subsystem: "Torque Converter",
    subsystemAr: "محول العزم",
    severity: "high",
    causes: ["TCC solenoid failure", "Wiring issue", "TCM fault", "Worn TCC"],
    causesAr: ["عطل صمام TCC", "مشكلة أسلاك", "عطل TCM", "TCC متآكل"],
    solution: "Test TCC solenoid resistance and operation, check wiring, inspect torque converter",
    solutionAr: "اختبار مقاومة وعمل صمام TCC، فحص الأسلاك، فحص محول العزم",
    relatedSensors: ["TCC Solenoid", "Input Speed Sensor"],
    affectedComponents: ["TCC Solenoid", "Torque Converter"],
    affectedComponentsAr: ["صمام قابض محول العزم", "محول العزم"],
    safeToRide: false,
    estimatedRepairCost: { min: 800, max: 5000, currency: "SAR" }
  },
  "P0741": {
    code: "P0741",
    description: "Torque Converter Clutch Circuit Performance or Stuck Off",
    descriptionAr: "أداء دائرة قابض محول العزم أو عالق مفتوح",
    system: "transmission",
    subsystem: "Torque Converter",
    subsystemAr: "محول العزم",
    severity: "high",
    causes: ["Worn TCC clutch material", "TCC solenoid stuck", "Valve body issue", "Low fluid pressure"],
    causesAr: ["مادة قابض TCC متآكلة", "صمام TCC عالق", "مشكلة جسم الصمام", "ضغط زيت منخفض"],
    solution: "Check fluid pressure, test TCC solenoid, inspect valve body, may need TCC replacement",
    solutionAr: "فحص ضغط الزيت، اختبار صمام TCC، فحص جسم الصمام، قد يحتاج استبدال TCC",
    relatedSensors: ["TCC Solenoid", "TFT Sensor", "Line Pressure"],
    affectedComponents: ["TCC Clutch", "TCC Solenoid", "Valve Body"],
    affectedComponentsAr: ["قابض TCC", "صمام TCC", "جسم الصمام"],
    safeToRide: false,
    estimatedRepairCost: { min: 1000, max: 6000, currency: "SAR" }
  },
  "P0742": {
    code: "P0742",
    description: "Torque Converter Clutch Circuit Stuck On",
    descriptionAr: "دائرة قابض محول العزم عالقة مغلقة",
    system: "transmission",
    subsystem: "Torque Converter",
    subsystemAr: "محول العزم",
    severity: "critical",
    causes: ["TCC solenoid stuck energized", "Valve body stuck", "Mechanical TCC failure"],
    causesAr: ["صمام TCC عالق مشغل", "جسم الصمام عالق", "عطل ميكانيكي في TCC"],
    solution: "Test TCC solenoid, inspect valve body, check for mechanical TCC damage",
    solutionAr: "اختبار صمام TCC، فحص جسم الصمام، فحص التلف الميكانيكي في TCC",
    relatedSensors: ["TCC Solenoid"],
    affectedComponents: ["TCC Solenoid", "Valve Body", "Torque Converter"],
    affectedComponentsAr: ["صمام TCC", "جسم الصمام", "محول العزم"],
    safeToRide: false,
    estimatedRepairCost: { min: 1500, max: 8000, currency: "SAR" }
  },
  "P0750": {
    code: "P0750",
    description: "Shift Solenoid A Malfunction",
    descriptionAr: "عطل في الصمام الكهربائي للتحويل A",
    system: "transmission",
    subsystem: "Shift Solenoids",
    subsystemAr: "صمامات التحويل",
    severity: "high",
    causes: ["Solenoid A failure", "Wiring short/open", "Valve body stuck", "Low fluid pressure"],
    causesAr: ["عطل الصمام A", "قصر/قطع في الأسلاك", "جسم الصمام عالق", "ضغط زيت منخفض"],
    solution: "Test solenoid A resistance (20-30 ohms typical), check wiring, inspect valve body",
    solutionAr: "اختبار مقاومة الصمام A (20-30 أوم عادةً)، فحص الأسلاك، فحص جسم الصمام",
    relatedSensors: ["Shift Solenoid A", "Line Pressure"],
    affectedComponents: ["Shift Solenoid A", "Valve Body"],
    affectedComponentsAr: ["صمام التحويل A", "جسم الصمام"],
    safeToRide: false,
    estimatedRepairCost: { min: 400, max: 2000, currency: "SAR" }
  },
  "P0755": {
    code: "P0755",
    description: "Shift Solenoid B Malfunction",
    descriptionAr: "عطل في الصمام الكهربائي للتحويل B",
    system: "transmission",
    subsystem: "Shift Solenoids",
    subsystemAr: "صمامات التحويل",
    severity: "high",
    causes: ["Solenoid B failure", "Wiring short/open", "Valve body stuck"],
    causesAr: ["عطل الصمام B", "قصر/قطع في الأسلاك", "جسم الصمام عالق"],
    solution: "Test solenoid B resistance, check wiring, inspect valve body passages",
    solutionAr: "اختبار مقاومة الصمام B، فحص الأسلاك، فحص ممرات جسم الصمام",
    relatedSensors: ["Shift Solenoid B"],
    affectedComponents: ["Shift Solenoid B", "Valve Body"],
    affectedComponentsAr: ["صمام التحويل B", "جسم الصمام"],
    safeToRide: false,
    estimatedRepairCost: { min: 400, max: 2000, currency: "SAR" }
  },
  "P0760": {
    code: "P0760",
    description: "Shift Solenoid C Malfunction",
    descriptionAr: "عطل في الصمام الكهربائي للتحويل C",
    system: "transmission",
    subsystem: "Shift Solenoids",
    subsystemAr: "صمامات التحويل",
    severity: "high",
    causes: ["Solenoid C failure", "Wiring issue", "Valve body blockage"],
    causesAr: ["عطل الصمام C", "مشكلة أسلاك", "انسداد في جسم الصمام"],
    solution: "Test solenoid C, check valve body for blockage, repair wiring",
    solutionAr: "اختبار الصمام C، فحص جسم الصمام للانسداد، إصلاح الأسلاك",
    relatedSensors: ["Shift Solenoid C"],
    affectedComponents: ["Shift Solenoid C", "Valve Body"],
    affectedComponentsAr: ["صمام التحويل C", "جسم الصمام"],
    safeToRide: false,
    estimatedRepairCost: { min: 400, max: 2000, currency: "SAR" }
  },
  "P0765": {
    code: "P0765",
    description: "Shift Solenoid D Malfunction",
    descriptionAr: "عطل في الصمام الكهربائي للتحويل D",
    system: "transmission",
    subsystem: "Shift Solenoids",
    subsystemAr: "صمامات التحويل",
    severity: "high",
    causes: ["Solenoid D failure", "Wiring short", "Contaminated fluid clogging solenoid"],
    causesAr: ["عطل الصمام D", "قصر في الأسلاك", "زيت ملوث يسد الصمام"],
    solution: "Test solenoid D, change transmission fluid if contaminated, check wiring",
    solutionAr: "اختبار الصمام D، تغيير زيت القير إذا كان ملوثاً، فحص الأسلاك",
    relatedSensors: ["Shift Solenoid D"],
    affectedComponents: ["Shift Solenoid D"],
    affectedComponentsAr: ["صمام التحويل D"],
    safeToRide: false,
    estimatedRepairCost: { min: 400, max: 2000, currency: "SAR" }
  },
  "P0770": {
    code: "P0770",
    description: "Shift Solenoid E Malfunction",
    descriptionAr: "عطل في الصمام الكهربائي للتحويل E",
    system: "transmission",
    subsystem: "Shift Solenoids",
    subsystemAr: "صمامات التحويل",
    severity: "high",
    causes: ["Solenoid E failure", "Wiring issue", "TCM fault"],
    causesAr: ["عطل الصمام E", "مشكلة أسلاك", "عطل TCM"],
    solution: "Test solenoid E resistance and function, check TCM output",
    solutionAr: "اختبار مقاومة ووظيفة الصمام E، فحص مخرج TCM",
    relatedSensors: ["Shift Solenoid E"],
    affectedComponents: ["Shift Solenoid E"],
    affectedComponentsAr: ["صمام التحويل E"],
    safeToRide: false,
    estimatedRepairCost: { min: 400, max: 2000, currency: "SAR" }
  },
  "P0780": {
    code: "P0780",
    description: "Shift Malfunction",
    descriptionAr: "عطل في عملية التحويل",
    system: "transmission",
    subsystem: "Shift Quality",
    subsystemAr: "جودة التحويل",
    severity: "high",
    causes: ["Multiple solenoid faults", "Low fluid pressure", "Worn clutch packs", "Valve body wear"],
    causesAr: ["أعطال متعددة في الصمامات", "ضغط زيت منخفض", "حزم قابض متآكلة", "تآكل جسم الصمام"],
    solution: "Check fluid level and pressure, test all shift solenoids, inspect clutch packs",
    solutionAr: "فحص مستوى وضغط الزيت، اختبار جميع صمامات التحويل، فحص حزم القابض",
    relatedSensors: ["All Shift Solenoids", "Line Pressure", "TFT Sensor"],
    affectedComponents: ["All Solenoids", "Clutch Packs", "Valve Body"],
    affectedComponentsAr: ["جميع الصمامات", "حزم القابض", "جسم الصمام"],
    safeToRide: false,
    estimatedRepairCost: { min: 1000, max: 10000, currency: "SAR" }
  },
  "P0868": {
    code: "P0868",
    description: "Transmission Fluid Pressure Low",
    descriptionAr: "ضغط زيت القير منخفض",
    system: "transmission",
    subsystem: "Fluid Pressure",
    subsystemAr: "ضغط الزيت",
    severity: "critical",
    causes: ["Low fluid level", "Worn pump", "Clogged filter", "Internal leaks"],
    causesAr: ["مستوى الزيت منخفض", "المضخة متآكلة", "الفلتر مسدود", "تسريبات داخلية"],
    solution: "Check and fill fluid, replace filter, test pump pressure, inspect for internal leaks",
    solutionAr: "فحص وإضافة الزيت، استبدال الفلتر، اختبار ضغط المضخة، فحص التسريبات الداخلية",
    relatedSensors: ["Line Pressure Sensor", "TFT Sensor"],
    affectedComponents: ["Transmission Pump", "Filter", "Valve Body"],
    affectedComponentsAr: ["مضخة القير", "الفلتر", "جسم الصمام"],
    safeToRide: false,
    estimatedRepairCost: { min: 500, max: 5000, currency: "SAR" }
  },
  "P0869": {
    code: "P0869",
    description: "Transmission Fluid Pressure High",
    descriptionAr: "ضغط زيت القير مرتفع",
    system: "transmission",
    subsystem: "Fluid Pressure",
    subsystemAr: "ضغط الزيت",
    severity: "high",
    causes: ["Pressure regulator valve stuck", "Valve body issue", "Faulty pressure sensor"],
    causesAr: ["صمام منظم الضغط عالق", "مشكلة جسم الصمام", "حساس الضغط تالف"],
    solution: "Test pressure regulator valve, inspect valve body, replace pressure sensor if faulty",
    solutionAr: "اختبار صمام منظم الضغط، فحص جسم الصمام، استبدال حساس الضغط إذا كان تالفاً",
    relatedSensors: ["Line Pressure Sensor"],
    affectedComponents: ["Pressure Regulator Valve", "Valve Body"],
    affectedComponentsAr: ["صمام منظم الضغط", "جسم الصمام"],
    safeToRide: false,
    estimatedRepairCost: { min: 500, max: 3000, currency: "SAR" }
  },
};

// ═══════════════════════════════════════════════════════
// ABS / CHASSIS DTC CODES (C0xxx)
// ═══════════════════════════════════════════════════════

export const ABS_DTC: Record<string, DTCInfo> = {
  "C0031": {
    code: "C0031",
    description: "Right Front Wheel Speed Sensor Circuit",
    descriptionAr: "دائرة حساس سرعة العجلة الأمامية اليمنى",
    system: "abs",
    subsystem: "Wheel Speed Sensors",
    subsystemAr: "حساسات سرعة العجلات",
    severity: "high",
    causes: ["Faulty wheel speed sensor", "Damaged wiring", "Corroded connector", "Damaged tone ring"],
    causesAr: ["حساس سرعة العجلة تالف", "أسلاك تالفة", "موصل متآكل", "حلقة النغمة تالفة"],
    solution: "Test wheel speed sensor resistance (800-1400 ohms), check wiring, inspect tone ring",
    solutionAr: "اختبار مقاومة حساس سرعة العجلة (800-1400 أوم)، فحص الأسلاك، فحص حلقة النغمة",
    relatedSensors: ["RF Wheel Speed Sensor"],
    affectedComponents: ["RF Wheel Speed Sensor", "Tone Ring", "ABS Module"],
    affectedComponentsAr: ["حساس سرعة العجلة الأمامية اليمنى", "حلقة النغمة", "وحدة ABS"],
    safeToRide: false,
    estimatedRepairCost: { min: 300, max: 1200, currency: "SAR" }
  },
  "C0034": {
    code: "C0034",
    description: "Right Front Wheel Speed Sensor Circuit Range/Performance",
    descriptionAr: "نطاق/أداء دائرة حساس سرعة العجلة الأمامية اليمنى",
    system: "abs",
    subsystem: "Wheel Speed Sensors",
    subsystemAr: "حساسات سرعة العجلات",
    severity: "high",
    causes: ["Intermittent sensor fault", "Partial tone ring damage", "Air gap too large"],
    causesAr: ["عطل متقطع في الحساس", "تلف جزئي في حلقة النغمة", "الفجوة الهوائية كبيرة جداً"],
    solution: "Check air gap (0.5-1.5mm typical), inspect tone ring, replace sensor if needed",
    solutionAr: "فحص الفجوة الهوائية (0.5-1.5 مم عادةً)، فحص حلقة النغمة، استبدال الحساس إذا لزم",
    relatedSensors: ["RF Wheel Speed Sensor"],
    affectedComponents: ["RF Wheel Speed Sensor", "Tone Ring"],
    affectedComponentsAr: ["حساس سرعة العجلة الأمامية اليمنى", "حلقة النغمة"],
    safeToRide: false,
    estimatedRepairCost: { min: 200, max: 1000, currency: "SAR" }
  },
  "C0035": {
    code: "C0035",
    description: "Left Front Wheel Speed Sensor Circuit",
    descriptionAr: "دائرة حساس سرعة العجلة الأمامية اليسرى",
    system: "abs",
    subsystem: "Wheel Speed Sensors",
    subsystemAr: "حساسات سرعة العجلات",
    severity: "high",
    causes: ["Faulty wheel speed sensor", "Damaged wiring", "Corroded connector", "Damaged tone ring"],
    causesAr: ["حساس سرعة العجلة تالف", "أسلاك تالفة", "موصل متآكل", "حلقة النغمة تالفة"],
    solution: "Test wheel speed sensor resistance, check wiring, inspect tone ring",
    solutionAr: "اختبار مقاومة حساس سرعة العجلة، فحص الأسلاك، فحص حلقة النغمة",
    relatedSensors: ["LF Wheel Speed Sensor"],
    affectedComponents: ["LF Wheel Speed Sensor", "Tone Ring", "ABS Module"],
    affectedComponentsAr: ["حساس سرعة العجلة الأمامية اليسرى", "حلقة النغمة", "وحدة ABS"],
    safeToRide: false,
    estimatedRepairCost: { min: 300, max: 1200, currency: "SAR" }
  },
  "C0040": {
    code: "C0040",
    description: "Right Rear Wheel Speed Sensor Circuit",
    descriptionAr: "دائرة حساس سرعة العجلة الخلفية اليمنى",
    system: "abs",
    subsystem: "Wheel Speed Sensors",
    subsystemAr: "حساسات سرعة العجلات",
    severity: "high",
    causes: ["Faulty wheel speed sensor", "Damaged wiring", "Tone ring damage", "Bearing failure"],
    causesAr: ["حساس سرعة العجلة تالف", "أسلاك تالفة", "تلف حلقة النغمة", "عطل المحمل"],
    solution: "Test sensor, check tone ring on hub/bearing, inspect wiring harness",
    solutionAr: "اختبار الحساس، فحص حلقة النغمة على المحور/المحمل، فحص حزمة الأسلاك",
    relatedSensors: ["RR Wheel Speed Sensor"],
    affectedComponents: ["RR Wheel Speed Sensor", "Tone Ring", "Wheel Bearing"],
    affectedComponentsAr: ["حساس سرعة العجلة الخلفية اليمنى", "حلقة النغمة", "محمل العجلة"],
    safeToRide: false,
    estimatedRepairCost: { min: 300, max: 1500, currency: "SAR" }
  },
  "C0045": {
    code: "C0045",
    description: "Left Rear Wheel Speed Sensor Circuit",
    descriptionAr: "دائرة حساس سرعة العجلة الخلفية اليسرى",
    system: "abs",
    subsystem: "Wheel Speed Sensors",
    subsystemAr: "حساسات سرعة العجلات",
    severity: "high",
    causes: ["Faulty wheel speed sensor", "Damaged wiring", "Tone ring damage", "Bearing failure"],
    causesAr: ["حساس سرعة العجلة تالف", "أسلاك تالفة", "تلف حلقة النغمة", "عطل المحمل"],
    solution: "Test sensor, check tone ring, inspect wheel bearing, repair wiring",
    solutionAr: "اختبار الحساس، فحص حلقة النغمة، فحص محمل العجلة، إصلاح الأسلاك",
    relatedSensors: ["LR Wheel Speed Sensor"],
    affectedComponents: ["LR Wheel Speed Sensor", "Tone Ring", "Wheel Bearing"],
    affectedComponentsAr: ["حساس سرعة العجلة الخلفية اليسرى", "حلقة النغمة", "محمل العجلة"],
    safeToRide: false,
    estimatedRepairCost: { min: 300, max: 1500, currency: "SAR" }
  },
  "C0051": {
    code: "C0051",
    description: "Steering Wheel Angle Sensor Circuit",
    descriptionAr: "دائرة حساس زاوية عجلة القيادة",
    system: "abs",
    subsystem: "Steering Sensor",
    subsystemAr: "حساس التوجيه",
    severity: "medium",
    causes: ["Faulty steering angle sensor", "Needs calibration after alignment", "Wiring issue"],
    causesAr: ["حساس زاوية التوجيه تالف", "يحتاج معايرة بعد الضبط", "مشكلة أسلاك"],
    solution: "Calibrate steering angle sensor, check wiring, replace sensor if needed",
    solutionAr: "معايرة حساس زاوية التوجيه، فحص الأسلاك، استبدال الحساس إذا لزم",
    relatedSensors: ["Steering Angle Sensor"],
    affectedComponents: ["Steering Angle Sensor", "ESC Module"],
    affectedComponentsAr: ["حساس زاوية التوجيه", "وحدة التحكم في الثبات"],
    safeToRide: true,
    estimatedRepairCost: { min: 200, max: 1000, currency: "SAR" }
  },
  "C0060": {
    code: "C0060",
    description: "ABS Solenoid Valve Circuit",
    descriptionAr: "دائرة صمام ABS الكهربائي",
    system: "abs",
    subsystem: "ABS Solenoids",
    subsystemAr: "صمامات ABS",
    severity: "critical",
    causes: ["Faulty ABS solenoid", "Wiring short/open", "ABS module failure", "Corroded connector"],
    causesAr: ["صمام ABS تالف", "قصر/قطع في الأسلاك", "عطل وحدة ABS", "موصل متآكل"],
    solution: "Test ABS solenoid resistance (2-5 ohms), check wiring, replace ABS module if needed",
    solutionAr: "اختبار مقاومة صمام ABS (2-5 أوم)، فحص الأسلاك، استبدال وحدة ABS إذا لزم",
    relatedSensors: ["ABS Solenoid", "ABS Module"],
    affectedComponents: ["ABS Solenoid Valve", "ABS Module", "Hydraulic Unit"],
    affectedComponentsAr: ["صمام ABS الكهربائي", "وحدة ABS", "الوحدة الهيدروليكية"],
    safeToRide: false,
    estimatedRepairCost: { min: 800, max: 4000, currency: "SAR" }
  },
  "C0110": {
    code: "C0110",
    description: "ABS Motor Circuit Malfunction",
    descriptionAr: "عطل في دائرة محرك ABS",
    system: "abs",
    subsystem: "ABS Motor",
    subsystemAr: "محرك ABS",
    severity: "critical",
    causes: ["ABS pump motor failure", "Wiring issue", "ABS module fault", "Relay failure"],
    causesAr: ["عطل محرك مضخة ABS", "مشكلة أسلاك", "عطل وحدة ABS", "عطل الريلاي"],
    solution: "Test ABS pump motor, check relay, inspect wiring, replace ABS module if needed",
    solutionAr: "اختبار محرك مضخة ABS، فحص الريلاي، فحص الأسلاك، استبدال وحدة ABS إذا لزم",
    relatedSensors: ["ABS Motor", "ABS Relay"],
    affectedComponents: ["ABS Pump Motor", "ABS Relay", "ABS Module"],
    affectedComponentsAr: ["محرك مضخة ABS", "ريلاي ABS", "وحدة ABS"],
    safeToRide: false,
    estimatedRepairCost: { min: 1000, max: 5000, currency: "SAR" }
  },
  "C0121": {
    code: "C0121",
    description: "ABS Valve Relay Circuit Malfunction",
    descriptionAr: "عطل في دائرة ريلاي صمام ABS",
    system: "abs",
    subsystem: "ABS Relay",
    subsystemAr: "ريلاي ABS",
    severity: "critical",
    causes: ["Faulty ABS relay", "Wiring issue", "ABS module fault", "Power supply problem"],
    causesAr: ["ريلاي ABS تالف", "مشكلة أسلاك", "عطل وحدة ABS", "مشكلة في مصدر الطاقة"],
    solution: "Test ABS relay, check power supply to ABS module, inspect wiring",
    solutionAr: "اختبار ريلاي ABS، فحص مصدر الطاقة لوحدة ABS، فحص الأسلاك",
    relatedSensors: ["ABS Relay", "ABS Module Power"],
    affectedComponents: ["ABS Relay", "ABS Module"],
    affectedComponentsAr: ["ريلاي ABS", "وحدة ABS"],
    safeToRide: false,
    estimatedRepairCost: { min: 300, max: 2000, currency: "SAR" }
  },
  "C0136": {
    code: "C0136",
    description: "ABS Brake Pressure Sensor Circuit",
    descriptionAr: "دائرة حساس ضغط الفرامل ABS",
    system: "abs",
    subsystem: "Pressure Sensors",
    subsystemAr: "حساسات الضغط",
    severity: "high",
    causes: ["Faulty brake pressure sensor", "Wiring issue", "ABS module fault"],
    causesAr: ["حساس ضغط الفرامل تالف", "مشكلة أسلاك", "عطل وحدة ABS"],
    solution: "Test brake pressure sensor, check wiring, replace sensor if needed",
    solutionAr: "اختبار حساس ضغط الفرامل، فحص الأسلاك، استبدال الحساس إذا لزم",
    relatedSensors: ["Brake Pressure Sensor"],
    affectedComponents: ["Brake Pressure Sensor", "ABS Module"],
    affectedComponentsAr: ["حساس ضغط الفرامل", "وحدة ABS"],
    safeToRide: false,
    estimatedRepairCost: { min: 400, max: 1500, currency: "SAR" }
  },
  "C0161": {
    code: "C0161",
    description: "ABS/TCS Brake Switch Circuit Malfunction",
    descriptionAr: "عطل في دائرة مفتاح الفرامل ABS/TCS",
    system: "abs",
    subsystem: "Brake Switch",
    subsystemAr: "مفتاح الفرامل",
    severity: "medium",
    causes: ["Faulty brake switch", "Wiring issue", "Misadjusted brake switch"],
    causesAr: ["مفتاح الفرامل تالف", "مشكلة أسلاك", "مفتاح الفرامل غير معاير"],
    solution: "Test brake switch, adjust switch position, replace if faulty",
    solutionAr: "اختبار مفتاح الفرامل، ضبط موضع المفتاح، استبدال إذا كان تالفاً",
    relatedSensors: ["Brake Light Switch"],
    affectedComponents: ["Brake Light Switch"],
    affectedComponentsAr: ["مفتاح ضوء الفرامل"],
    safeToRide: true,
    estimatedRepairCost: { min: 100, max: 400, currency: "SAR" }
  },
  "C0186": {
    code: "C0186",
    description: "Lateral Acceleration Sensor Circuit",
    descriptionAr: "دائرة حساس التسارع الجانبي",
    system: "abs",
    subsystem: "Stability Control",
    subsystemAr: "التحكم في الثبات",
    severity: "medium",
    causes: ["Faulty lateral G sensor", "Wiring issue", "ESC module fault"],
    causesAr: ["حساس G الجانبي تالف", "مشكلة أسلاك", "عطل وحدة ESC"],
    solution: "Test lateral acceleration sensor, check wiring, calibrate if needed",
    solutionAr: "اختبار حساس التسارع الجانبي، فحص الأسلاك، معايرة إذا لزم",
    relatedSensors: ["Lateral G Sensor", "Yaw Rate Sensor"],
    affectedComponents: ["Lateral Acceleration Sensor", "ESC Module"],
    affectedComponentsAr: ["حساس التسارع الجانبي", "وحدة التحكم في الثبات"],
    safeToRide: true,
    estimatedRepairCost: { min: 300, max: 1500, currency: "SAR" }
  },
  "C0196": {
    code: "C0196",
    description: "Yaw Rate Sensor Circuit",
    descriptionAr: "دائرة حساس معدل الانحراف",
    system: "abs",
    subsystem: "Stability Control",
    subsystemAr: "التحكم في الثبات",
    severity: "medium",
    causes: ["Faulty yaw rate sensor", "Wiring issue", "ESC module fault", "Needs calibration"],
    causesAr: ["حساس معدل الانحراف تالف", "مشكلة أسلاك", "عطل وحدة ESC", "يحتاج معايرة"],
    solution: "Test yaw rate sensor, calibrate ESC system, check wiring",
    solutionAr: "اختبار حساس معدل الانحراف، معايرة نظام ESC، فحص الأسلاك",
    relatedSensors: ["Yaw Rate Sensor", "Lateral G Sensor"],
    affectedComponents: ["Yaw Rate Sensor", "ESC Module"],
    affectedComponentsAr: ["حساس معدل الانحراف", "وحدة التحكم في الثبات"],
    safeToRide: true,
    estimatedRepairCost: { min: 400, max: 2000, currency: "SAR" }
  },
  "C0200": {
    code: "C0200",
    description: "Right Front Wheel Speed Sensor Circuit Open/Short",
    descriptionAr: "قطع/قصر في دائرة حساس سرعة العجلة الأمامية اليمنى",
    system: "abs",
    subsystem: "Wheel Speed Sensors",
    subsystemAr: "حساسات سرعة العجلات",
    severity: "critical",
    causes: ["Broken sensor wire", "Sensor internal failure", "Corroded connector"],
    causesAr: ["سلك الحساس مقطوع", "عطل داخلي في الحساس", "موصل متآكل"],
    solution: "Replace wheel speed sensor, repair wiring if damaged",
    solutionAr: "استبدال حساس سرعة العجلة، إصلاح الأسلاك إذا كانت تالفة",
    relatedSensors: ["RF Wheel Speed Sensor"],
    affectedComponents: ["RF Wheel Speed Sensor"],
    affectedComponentsAr: ["حساس سرعة العجلة الأمامية اليمنى"],
    safeToRide: false,
    estimatedRepairCost: { min: 300, max: 1200, currency: "SAR" }
  },
  "C0205": {
    code: "C0205",
    description: "Left Front Wheel Speed Sensor Circuit Open/Short",
    descriptionAr: "قطع/قصر في دائرة حساس سرعة العجلة الأمامية اليسرى",
    system: "abs",
    subsystem: "Wheel Speed Sensors",
    subsystemAr: "حساسات سرعة العجلات",
    severity: "critical",
    causes: ["Broken sensor wire", "Sensor internal failure", "Corroded connector"],
    causesAr: ["سلك الحساس مقطوع", "عطل داخلي في الحساس", "موصل متآكل"],
    solution: "Replace wheel speed sensor, repair wiring if damaged",
    solutionAr: "استبدال حساس سرعة العجلة، إصلاح الأسلاك إذا كانت تالفة",
    relatedSensors: ["LF Wheel Speed Sensor"],
    affectedComponents: ["LF Wheel Speed Sensor"],
    affectedComponentsAr: ["حساس سرعة العجلة الأمامية اليسرى"],
    safeToRide: false,
    estimatedRepairCost: { min: 300, max: 1200, currency: "SAR" }
  },
  "C0210": {
    code: "C0210",
    description: "Right Rear Wheel Speed Sensor Circuit Open/Short",
    descriptionAr: "قطع/قصر في دائرة حساس سرعة العجلة الخلفية اليمنى",
    system: "abs",
    subsystem: "Wheel Speed Sensors",
    subsystemAr: "حساسات سرعة العجلات",
    severity: "critical",
    causes: ["Broken sensor wire", "Sensor failure", "Bearing-integrated sensor damage"],
    causesAr: ["سلك الحساس مقطوع", "عطل الحساس", "تلف الحساس المدمج في المحمل"],
    solution: "Replace wheel speed sensor or wheel bearing assembly if sensor is integrated",
    solutionAr: "استبدال حساس سرعة العجلة أو مجموعة المحمل إذا كان الحساس مدمجاً",
    relatedSensors: ["RR Wheel Speed Sensor"],
    affectedComponents: ["RR Wheel Speed Sensor", "Wheel Bearing"],
    affectedComponentsAr: ["حساس سرعة العجلة الخلفية اليمنى", "محمل العجلة"],
    safeToRide: false,
    estimatedRepairCost: { min: 400, max: 1800, currency: "SAR" }
  },
  "C0215": {
    code: "C0215",
    description: "Left Rear Wheel Speed Sensor Circuit Open/Short",
    descriptionAr: "قطع/قصر في دائرة حساس سرعة العجلة الخلفية اليسرى",
    system: "abs",
    subsystem: "Wheel Speed Sensors",
    subsystemAr: "حساسات سرعة العجلات",
    severity: "critical",
    causes: ["Broken sensor wire", "Sensor failure", "Bearing-integrated sensor damage"],
    causesAr: ["سلك الحساس مقطوع", "عطل الحساس", "تلف الحساس المدمج في المحمل"],
    solution: "Replace wheel speed sensor or wheel bearing assembly if sensor is integrated",
    solutionAr: "استبدال حساس سرعة العجلة أو مجموعة المحمل إذا كان الحساس مدمجاً",
    relatedSensors: ["LR Wheel Speed Sensor"],
    affectedComponents: ["LR Wheel Speed Sensor", "Wheel Bearing"],
    affectedComponentsAr: ["حساس سرعة العجلة الخلفية اليسرى", "محمل العجلة"],
    safeToRide: false,
    estimatedRepairCost: { min: 400, max: 1800, currency: "SAR" }
  },
  "C1095": {
    code: "C1095",
    description: "ABS Hydraulic Pump Motor Circuit Failure",
    descriptionAr: "عطل في دائرة محرك مضخة ABS الهيدروليكية",
    system: "abs",
    subsystem: "ABS Pump",
    subsystemAr: "مضخة ABS",
    severity: "critical",
    causes: ["Pump motor failure", "Relay fault", "Wiring issue", "ABS module failure"],
    causesAr: ["عطل محرك المضخة", "عطل الريلاي", "مشكلة أسلاك", "عطل وحدة ABS"],
    solution: "Test pump motor current draw, check relay, replace ABS hydraulic unit if needed",
    solutionAr: "اختبار استهلاك تيار محرك المضخة، فحص الريلاي، استبدال وحدة ABS الهيدروليكية إذا لزم",
    relatedSensors: ["ABS Motor", "ABS Relay"],
    affectedComponents: ["ABS Hydraulic Unit", "Pump Motor", "Relay"],
    affectedComponentsAr: ["وحدة ABS الهيدروليكية", "محرك المضخة", "الريلاي"],
    safeToRide: false,
    estimatedRepairCost: { min: 1500, max: 6000, currency: "SAR" }
  },
  "C1145": {
    code: "C1145",
    description: "Right Front Wheel Speed Sensor Input Signal Missing",
    descriptionAr: "إشارة حساس سرعة العجلة الأمامية اليمنى مفقودة",
    system: "abs",
    subsystem: "Wheel Speed Sensors",
    subsystemAr: "حساسات سرعة العجلات",
    severity: "critical",
    causes: ["Sensor completely failed", "Wiring completely broken", "Tone ring missing/damaged"],
    causesAr: ["الحساس فشل كلياً", "الأسلاك مقطوعة كلياً", "حلقة النغمة مفقودة/تالفة"],
    solution: "Replace wheel speed sensor, repair wiring, replace tone ring if damaged",
    solutionAr: "استبدال حساس سرعة العجلة، إصلاح الأسلاك، استبدال حلقة النغمة إذا كانت تالفة",
    relatedSensors: ["RF Wheel Speed Sensor"],
    affectedComponents: ["RF Wheel Speed Sensor", "Tone Ring"],
    affectedComponentsAr: ["حساس سرعة العجلة الأمامية اليمنى", "حلقة النغمة"],
    safeToRide: false,
    estimatedRepairCost: { min: 300, max: 1200, currency: "SAR" }
  },
  "C1155": {
    code: "C1155",
    description: "Left Front Wheel Speed Sensor Input Signal Missing",
    descriptionAr: "إشارة حساس سرعة العجلة الأمامية اليسرى مفقودة",
    system: "abs",
    subsystem: "Wheel Speed Sensors",
    subsystemAr: "حساسات سرعة العجلات",
    severity: "critical",
    causes: ["Sensor completely failed", "Wiring completely broken", "Tone ring missing/damaged"],
    causesAr: ["الحساس فشل كلياً", "الأسلاك مقطوعة كلياً", "حلقة النغمة مفقودة/تالفة"],
    solution: "Replace wheel speed sensor, repair wiring, replace tone ring if damaged",
    solutionAr: "استبدال حساس سرعة العجلة، إصلاح الأسلاك، استبدال حلقة النغمة إذا كانت تالفة",
    relatedSensors: ["LF Wheel Speed Sensor"],
    affectedComponents: ["LF Wheel Speed Sensor", "Tone Ring"],
    affectedComponentsAr: ["حساس سرعة العجلة الأمامية اليسرى", "حلقة النغمة"],
    safeToRide: false,
    estimatedRepairCost: { min: 300, max: 1200, currency: "SAR" }
  },
  "C1165": {
    code: "C1165",
    description: "Right Rear Wheel Speed Sensor Input Signal Missing",
    descriptionAr: "إشارة حساس سرعة العجلة الخلفية اليمنى مفقودة",
    system: "abs",
    subsystem: "Wheel Speed Sensors",
    subsystemAr: "حساسات سرعة العجلات",
    severity: "critical",
    causes: ["Sensor completely failed", "Wiring completely broken", "Bearing failure"],
    causesAr: ["الحساس فشل كلياً", "الأسلاك مقطوعة كلياً", "عطل المحمل"],
    solution: "Replace wheel speed sensor, check wheel bearing, repair wiring",
    solutionAr: "استبدال حساس سرعة العجلة، فحص محمل العجلة، إصلاح الأسلاك",
    relatedSensors: ["RR Wheel Speed Sensor"],
    affectedComponents: ["RR Wheel Speed Sensor", "Wheel Bearing"],
    affectedComponentsAr: ["حساس سرعة العجلة الخلفية اليمنى", "محمل العجلة"],
    safeToRide: false,
    estimatedRepairCost: { min: 400, max: 1800, currency: "SAR" }
  },
  "C1175": {
    code: "C1175",
    description: "Left Rear Wheel Speed Sensor Input Signal Missing",
    descriptionAr: "إشارة حساس سرعة العجلة الخلفية اليسرى مفقودة",
    system: "abs",
    subsystem: "Wheel Speed Sensors",
    subsystemAr: "حساسات سرعة العجلات",
    severity: "critical",
    causes: ["Sensor completely failed", "Wiring completely broken", "Bearing failure"],
    causesAr: ["الحساس فشل كلياً", "الأسلاك مقطوعة كلياً", "عطل المحمل"],
    solution: "Replace wheel speed sensor, check wheel bearing, repair wiring",
    solutionAr: "استبدال حساس سرعة العجلة، فحص محمل العجلة، إصلاح الأسلاك",
    relatedSensors: ["LR Wheel Speed Sensor"],
    affectedComponents: ["LR Wheel Speed Sensor", "Wheel Bearing"],
    affectedComponentsAr: ["حساس سرعة العجلة الخلفية اليسرى", "محمل العجلة"],
    safeToRide: false,
    estimatedRepairCost: { min: 400, max: 1800, currency: "SAR" }
  },
};

// ═══════════════════════════════════════════════════════
// AIRBAG / SRS DTC CODES (B0xxx - B1xxx)
// ═══════════════════════════════════════════════════════

export const AIRBAG_DTC: Record<string, DTCInfo> = {
  "B0001": {
    code: "B0001",
    description: "Driver Frontal Stage 1 Deployment Control",
    descriptionAr: "التحكم في نشر الوسادة الأمامية للسائق - المرحلة 1",
    system: "airbag",
    subsystem: "Driver Airbag",
    subsystemAr: "وسادة السائق الهوائية",
    severity: "critical",
    causes: ["Faulty driver airbag squib", "Wiring short/open", "SRS module fault", "Clock spring failure"],
    causesAr: ["فتيل وسادة السائق تالف", "قصر/قطع في الأسلاك", "عطل وحدة SRS", "عطل الزنبرك الدوار"],
    solution: "DO NOT attempt repair without proper training. Take to certified airbag technician immediately",
    solutionAr: "لا تحاول الإصلاح بدون تدريب مناسب. اذهب فوراً لفني وسائد هوائية معتمد",
    relatedSensors: ["Driver Airbag Squib", "Clock Spring", "SRS Module"],
    affectedComponents: ["Driver Airbag", "Clock Spring", "SRS Module"],
    affectedComponentsAr: ["وسادة السائق الهوائية", "الزنبرك الدوار", "وحدة SRS"],
    safeToRide: false,
    estimatedRepairCost: { min: 1000, max: 5000, currency: "SAR" }
  },
  "B0002": {
    code: "B0002",
    description: "Driver Frontal Stage 2 Deployment Control",
    descriptionAr: "التحكم في نشر الوسادة الأمامية للسائق - المرحلة 2",
    system: "airbag",
    subsystem: "Driver Airbag",
    subsystemAr: "وسادة السائق الهوائية",
    severity: "critical",
    causes: ["Faulty driver airbag stage 2 squib", "Wiring issue", "SRS module fault"],
    causesAr: ["فتيل المرحلة 2 لوسادة السائق تالف", "مشكلة أسلاك", "عطل وحدة SRS"],
    solution: "Certified airbag technician required. Do not attempt DIY repair",
    solutionAr: "يلزم فني وسائد هوائية معتمد. لا تحاول الإصلاح بنفسك",
    relatedSensors: ["Driver Airbag Stage 2 Squib", "SRS Module"],
    affectedComponents: ["Driver Airbag Stage 2", "SRS Module"],
    affectedComponentsAr: ["وسادة السائق الهوائية المرحلة 2", "وحدة SRS"],
    safeToRide: false,
    estimatedRepairCost: { min: 1000, max: 5000, currency: "SAR" }
  },
  "B0011": {
    code: "B0011",
    description: "Driver Frontal Airbag Squib Circuit Open",
    descriptionAr: "دائرة فتيل الوسادة الأمامية للسائق مفتوحة",
    system: "airbag",
    subsystem: "Driver Airbag",
    subsystemAr: "وسادة السائق الهوائية",
    severity: "critical",
    causes: ["Broken squib wire", "Faulty clock spring", "Connector corrosion", "Airbag module fault"],
    causesAr: ["سلك الفتيل مقطوع", "عطل الزنبرك الدوار", "تآكل الموصل", "عطل وحدة الوسادة"],
    solution: "Inspect clock spring, check squib wiring, replace airbag if squib is faulty",
    solutionAr: "فحص الزنبرك الدوار، فحص أسلاك الفتيل، استبدال الوسادة إذا كان الفتيل تالفاً",
    relatedSensors: ["Driver Airbag Squib", "Clock Spring"],
    affectedComponents: ["Driver Airbag", "Clock Spring", "Wiring"],
    affectedComponentsAr: ["وسادة السائق الهوائية", "الزنبرك الدوار", "الأسلاك"],
    safeToRide: false,
    estimatedRepairCost: { min: 800, max: 4000, currency: "SAR" }
  },
  "B0012": {
    code: "B0012",
    description: "Driver Frontal Airbag Squib Circuit Short to Ground",
    descriptionAr: "دائرة فتيل الوسادة الأمامية للسائق قصر للأرضي",
    system: "airbag",
    subsystem: "Driver Airbag",
    subsystemAr: "وسادة السائق الهوائية",
    severity: "critical",
    causes: ["Squib circuit shorted to ground", "Damaged wiring", "Faulty SRS module"],
    causesAr: ["دائرة الفتيل مقصورة للأرضي", "أسلاك تالفة", "وحدة SRS تالفة"],
    solution: "Check squib circuit for shorts, inspect wiring harness, replace SRS module if needed",
    solutionAr: "فحص دائرة الفتيل للقصر، فحص حزمة الأسلاك، استبدال وحدة SRS إذا لزم",
    relatedSensors: ["Driver Airbag Squib", "SRS Module"],
    affectedComponents: ["Driver Airbag Squib Circuit", "SRS Module"],
    affectedComponentsAr: ["دائرة فتيل وسادة السائق", "وحدة SRS"],
    safeToRide: false,
    estimatedRepairCost: { min: 800, max: 4000, currency: "SAR" }
  },
  "B0013": {
    code: "B0013",
    description: "Driver Frontal Airbag Squib Circuit Short to Battery",
    descriptionAr: "دائرة فتيل الوسادة الأمامية للسائق قصر للبطارية",
    system: "airbag",
    subsystem: "Driver Airbag",
    subsystemAr: "وسادة السائق الهوائية",
    severity: "critical",
    causes: ["Squib circuit shorted to battery voltage", "Damaged wiring", "SRS module fault"],
    causesAr: ["دائرة الفتيل مقصورة لجهد البطارية", "أسلاك تالفة", "عطل وحدة SRS"],
    solution: "Inspect wiring for shorts to power, check SRS module, replace damaged components",
    solutionAr: "فحص الأسلاك للقصر للطاقة، فحص وحدة SRS، استبدال المكونات التالفة",
    relatedSensors: ["Driver Airbag Squib", "SRS Module"],
    affectedComponents: ["Driver Airbag Squib Circuit", "SRS Module"],
    affectedComponentsAr: ["دائرة فتيل وسادة السائق", "وحدة SRS"],
    safeToRide: false,
    estimatedRepairCost: { min: 800, max: 4000, currency: "SAR" }
  },
  "B0051": {
    code: "B0051",
    description: "Passenger Frontal Airbag Squib Circuit Open",
    descriptionAr: "دائرة فتيل الوسادة الأمامية للراكب مفتوحة",
    system: "airbag",
    subsystem: "Passenger Airbag",
    subsystemAr: "وسادة الراكب الهوائية",
    severity: "critical",
    causes: ["Broken squib wire", "Connector issue", "Airbag module fault", "Passenger airbag disabled"],
    causesAr: ["سلك الفتيل مقطوع", "مشكلة موصل", "عطل وحدة الوسادة", "وسادة الراكب معطلة"],
    solution: "Check passenger airbag on/off switch, inspect squib wiring, replace airbag if needed",
    solutionAr: "فحص مفتاح تشغيل/إيقاف وسادة الراكب، فحص أسلاك الفتيل، استبدال الوسادة إذا لزم",
    relatedSensors: ["Passenger Airbag Squib", "Passenger Airbag Switch"],
    affectedComponents: ["Passenger Airbag", "Passenger Airbag Switch"],
    affectedComponentsAr: ["وسادة الراكب الهوائية", "مفتاح وسادة الراكب"],
    safeToRide: false,
    estimatedRepairCost: { min: 800, max: 4000, currency: "SAR" }
  },
  "B0057": {
    code: "B0057",
    description: "Driver Side Airbag Squib Circuit Open",
    descriptionAr: "دائرة فتيل الوسادة الجانبية للسائق مفتوحة",
    system: "airbag",
    subsystem: "Side Airbag",
    subsystemAr: "الوسادة الجانبية",
    severity: "critical",
    causes: ["Broken squib wire", "Seat wiring damage", "Connector corrosion", "SRS module fault"],
    causesAr: ["سلك الفتيل مقطوع", "تلف أسلاك المقعد", "تآكل الموصل", "عطل وحدة SRS"],
    solution: "Inspect seat wiring, check squib connector, replace side airbag if squib is faulty",
    solutionAr: "فحص أسلاك المقعد، فحص موصل الفتيل، استبدال الوسادة الجانبية إذا كان الفتيل تالفاً",
    relatedSensors: ["Driver Side Airbag Squib"],
    affectedComponents: ["Driver Side Airbag", "Seat Wiring"],
    affectedComponentsAr: ["الوسادة الجانبية للسائق", "أسلاك المقعد"],
    safeToRide: false,
    estimatedRepairCost: { min: 1000, max: 5000, currency: "SAR" }
  },
  "B0063": {
    code: "B0063",
    description: "Passenger Side Airbag Squib Circuit Open",
    descriptionAr: "دائرة فتيل الوسادة الجانبية للراكب مفتوحة",
    system: "airbag",
    subsystem: "Side Airbag",
    subsystemAr: "الوسادة الجانبية",
    severity: "critical",
    causes: ["Broken squib wire", "Seat wiring damage", "Connector corrosion"],
    causesAr: ["سلك الفتيل مقطوع", "تلف أسلاك المقعد", "تآكل الموصل"],
    solution: "Inspect seat wiring, check squib connector, replace side airbag if needed",
    solutionAr: "فحص أسلاك المقعد، فحص موصل الفتيل، استبدال الوسادة الجانبية إذا لزم",
    relatedSensors: ["Passenger Side Airbag Squib"],
    affectedComponents: ["Passenger Side Airbag", "Seat Wiring"],
    affectedComponentsAr: ["الوسادة الجانبية للراكب", "أسلاك المقعد"],
    safeToRide: false,
    estimatedRepairCost: { min: 1000, max: 5000, currency: "SAR" }
  },
  "B0081": {
    code: "B0081",
    description: "Driver Curtain Airbag Squib Circuit Open",
    descriptionAr: "دائرة فتيل وسادة الستارة للسائق مفتوحة",
    system: "airbag",
    subsystem: "Curtain Airbag",
    subsystemAr: "وسادة الستارة",
    severity: "critical",
    causes: ["Broken squib wire", "Roof wiring damage", "Connector issue"],
    causesAr: ["سلك الفتيل مقطوع", "تلف أسلاك السقف", "مشكلة موصل"],
    solution: "Inspect roof wiring, check squib connector, replace curtain airbag if needed",
    solutionAr: "فحص أسلاك السقف، فحص موصل الفتيل، استبدال وسادة الستارة إذا لزم",
    relatedSensors: ["Driver Curtain Airbag Squib"],
    affectedComponents: ["Driver Curtain Airbag", "Roof Wiring"],
    affectedComponentsAr: ["وسادة الستارة للسائق", "أسلاك السقف"],
    safeToRide: false,
    estimatedRepairCost: { min: 1200, max: 6000, currency: "SAR" }
  },
  "B0087": {
    code: "B0087",
    description: "Passenger Curtain Airbag Squib Circuit Open",
    descriptionAr: "دائرة فتيل وسادة الستارة للراكب مفتوحة",
    system: "airbag",
    subsystem: "Curtain Airbag",
    subsystemAr: "وسادة الستارة",
    severity: "critical",
    causes: ["Broken squib wire", "Roof wiring damage", "Connector issue"],
    causesAr: ["سلك الفتيل مقطوع", "تلف أسلاك السقف", "مشكلة موصل"],
    solution: "Inspect roof wiring, check squib connector, replace curtain airbag if needed",
    solutionAr: "فحص أسلاك السقف، فحص موصل الفتيل، استبدال وسادة الستارة إذا لزم",
    relatedSensors: ["Passenger Curtain Airbag Squib"],
    affectedComponents: ["Passenger Curtain Airbag", "Roof Wiring"],
    affectedComponentsAr: ["وسادة الستارة للراكب", "أسلاك السقف"],
    safeToRide: false,
    estimatedRepairCost: { min: 1200, max: 6000, currency: "SAR" }
  },
  "B0100": {
    code: "B0100",
    description: "SRS System Malfunction",
    descriptionAr: "عطل في نظام SRS (الوسائد الهوائية)",
    system: "airbag",
    subsystem: "SRS Module",
    subsystemAr: "وحدة SRS",
    severity: "critical",
    causes: ["SRS module internal fault", "Power supply issue", "Multiple circuit faults", "Crash data stored"],
    causesAr: ["عطل داخلي في وحدة SRS", "مشكلة في مصدر الطاقة", "أعطال متعددة في الدوائر", "بيانات حادث مخزنة"],
    solution: "Check for stored crash data, test power supply to SRS module, replace SRS module if needed",
    solutionAr: "فحص بيانات الحوادث المخزنة، اختبار مصدر الطاقة لوحدة SRS، استبدال وحدة SRS إذا لزم",
    relatedSensors: ["SRS Module", "All Airbag Circuits"],
    affectedComponents: ["SRS Module", "All Airbag Components"],
    affectedComponentsAr: ["وحدة SRS", "جميع مكونات الوسائد الهوائية"],
    safeToRide: false,
    estimatedRepairCost: { min: 1500, max: 8000, currency: "SAR" }
  },
  "B0101": {
    code: "B0101",
    description: "SRS Igniter Circuit Resistance Low",
    descriptionAr: "مقاومة دائرة مشعل SRS منخفضة",
    system: "airbag",
    subsystem: "SRS Igniter",
    subsystemAr: "مشعل SRS",
    severity: "critical",
    causes: ["Short circuit in squib", "Moisture in connector", "Damaged wiring insulation"],
    causesAr: ["قصر في الفتيل", "رطوبة في الموصل", "تلف عزل الأسلاك"],
    solution: "Dry connectors, inspect wiring insulation, replace squib/airbag if resistance is out of spec",
    solutionAr: "تجفيف الموصلات، فحص عزل الأسلاك، استبدال الفتيل/الوسادة إذا كانت المقاومة خارج المواصفات",
    relatedSensors: ["SRS Igniter"],
    affectedComponents: ["Airbag Squib", "Wiring"],
    affectedComponentsAr: ["فتيل الوسادة الهوائية", "الأسلاك"],
    safeToRide: false,
    estimatedRepairCost: { min: 500, max: 3000, currency: "SAR" }
  },
  "B0102": {
    code: "B0102",
    description: "SRS Igniter Circuit Resistance High",
    descriptionAr: "مقاومة دائرة مشعل SRS مرتفعة",
    system: "airbag",
    subsystem: "SRS Igniter",
    subsystemAr: "مشعل SRS",
    severity: "critical",
    causes: ["Open circuit in squib", "Corroded connector", "Broken wire"],
    causesAr: ["قطع في الفتيل", "موصل متآكل", "سلك مقطوع"],
    solution: "Check connector for corrosion, test squib resistance, replace airbag if squib is open",
    solutionAr: "فحص الموصل للتآكل، اختبار مقاومة الفتيل، استبدال الوسادة إذا كان الفتيل مقطوعاً",
    relatedSensors: ["SRS Igniter"],
    affectedComponents: ["Airbag Squib", "Connector"],
    affectedComponentsAr: ["فتيل الوسادة الهوائية", "الموصل"],
    safeToRide: false,
    estimatedRepairCost: { min: 500, max: 3000, currency: "SAR" }
  },
  "B0103": {
    code: "B0103",
    description: "Crash Sensor Fault",
    descriptionAr: "عطل في حساس الاصطدام",
    system: "airbag",
    subsystem: "Crash Sensors",
    subsystemAr: "حساسات الاصطدام",
    severity: "critical",
    causes: ["Faulty crash sensor", "Wiring damage", "Sensor mounting issue", "Previous accident damage"],
    causesAr: ["حساس الاصطدام تالف", "تلف الأسلاك", "مشكلة في تركيب الحساس", "تلف من حادث سابق"],
    solution: "Test crash sensor, check mounting, inspect wiring, replace sensor if faulty",
    solutionAr: "اختبار حساس الاصطدام، فحص التركيب، فحص الأسلاك، استبدال الحساس إذا كان تالفاً",
    relatedSensors: ["Crash Sensor", "Impact Sensor"],
    affectedComponents: ["Crash Sensor", "SRS Module"],
    affectedComponentsAr: ["حساس الاصطدام", "وحدة SRS"],
    safeToRide: false,
    estimatedRepairCost: { min: 600, max: 3000, currency: "SAR" }
  },
  "B0104": {
    code: "B0104",
    description: "SRS Module Internal Fault",
    descriptionAr: "عطل داخلي في وحدة SRS",
    system: "airbag",
    subsystem: "SRS Module",
    subsystemAr: "وحدة SRS",
    severity: "critical",
    causes: ["SRS module internal failure", "Crash data stored in module", "Power surge damage"],
    causesAr: ["عطل داخلي في وحدة SRS", "بيانات حادث مخزنة في الوحدة", "تلف من ارتفاع الجهد"],
    solution: "Replace SRS module. If crash data is stored, module cannot be reused",
    solutionAr: "استبدال وحدة SRS. إذا كانت بيانات الحادث مخزنة، لا يمكن إعادة استخدام الوحدة",
    relatedSensors: ["SRS Module"],
    affectedComponents: ["SRS Module"],
    affectedComponentsAr: ["وحدة SRS"],
    safeToRide: false,
    estimatedRepairCost: { min: 2000, max: 8000, currency: "SAR" }
  },
  "B0105": {
    code: "B0105",
    description: "Occupant Classification System Fault",
    descriptionAr: "عطل في نظام تصنيف الركاب",
    system: "airbag",
    subsystem: "Occupant Classification",
    subsystemAr: "تصنيف الركاب",
    severity: "high",
    causes: ["Faulty OCS sensor", "Seat mat sensor issue", "Wiring problem", "SRS module fault"],
    causesAr: ["حساس OCS تالف", "مشكلة في حساس سجادة المقعد", "مشكلة أسلاك", "عطل وحدة SRS"],
    solution: "Test OCS sensor, check seat mat sensor, inspect wiring, replace if needed",
    solutionAr: "اختبار حساس OCS، فحص حساس سجادة المقعد، فحص الأسلاك، استبدال إذا لزم",
    relatedSensors: ["OCS Sensor", "Seat Weight Sensor"],
    affectedComponents: ["Occupant Classification System", "Seat Mat Sensor"],
    affectedComponentsAr: ["نظام تصنيف الركاب", "حساس سجادة المقعد"],
    safeToRide: false,
    estimatedRepairCost: { min: 800, max: 4000, currency: "SAR" }
  },
  "B0106": {
    code: "B0106",
    description: "Seat Belt Pretensioner Circuit Open",
    descriptionAr: "دائرة شادة حزام الأمان مفتوحة",
    system: "airbag",
    subsystem: "Seatbelt Pretensioner",
    subsystemAr: "شادة حزام الأمان",
    severity: "critical",
    causes: ["Faulty pretensioner squib", "Broken wiring", "Connector corrosion"],
    causesAr: ["فتيل الشادة تالف", "أسلاك مقطوعة", "تآكل الموصل"],
    solution: "Inspect pretensioner wiring, replace pretensioner if squib is faulty",
    solutionAr: "فحص أسلاك الشادة، استبدال الشادة إذا كان الفتيل تالفاً",
    relatedSensors: ["Pretensioner Squib"],
    affectedComponents: ["Seatbelt Pretensioner", "Wiring"],
    affectedComponentsAr: ["شادة حزام الأمان", "الأسلاك"],
    safeToRide: false,
    estimatedRepairCost: { min: 600, max: 2500, currency: "SAR" }
  },
  "B0107": {
    code: "B0107",
    description: "Seat Belt Buckle Switch Circuit",
    descriptionAr: "دائرة مفتاح إبزيم حزام الأمان",
    system: "airbag",
    subsystem: "Seatbelt",
    subsystemAr: "حزام الأمان",
    severity: "medium",
    causes: ["Faulty buckle switch", "Wiring issue", "Debris in buckle"],
    causesAr: ["مفتاح الإبزيم تالف", "مشكلة أسلاك", "مواد غريبة في الإبزيم"],
    solution: "Clean buckle, test buckle switch, replace buckle assembly if faulty",
    solutionAr: "تنظيف الإبزيم، اختبار مفتاح الإبزيم، استبدال مجموعة الإبزيم إذا كانت تالفة",
    relatedSensors: ["Seatbelt Buckle Switch"],
    affectedComponents: ["Seatbelt Buckle"],
    affectedComponentsAr: ["إبزيم حزام الأمان"],
    safeToRide: true,
    estimatedRepairCost: { min: 200, max: 800, currency: "SAR" }
  },
  "B0110": {
    code: "B0110",
    description: "Frontal Impact Sensor Circuit",
    descriptionAr: "دائرة حساس الاصطدام الأمامي",
    system: "airbag",
    subsystem: "Impact Sensors",
    subsystemAr: "حساسات الاصطدام",
    severity: "critical",
    causes: ["Faulty frontal impact sensor", "Wiring damage", "Sensor mounting loose"],
    causesAr: ["حساس الاصطدام الأمامي تالف", "تلف الأسلاك", "تركيب الحساس مرتخ"],
    solution: "Test frontal impact sensor, check mounting, inspect wiring, replace if faulty",
    solutionAr: "اختبار حساس الاصطدام الأمامي، فحص التركيب، فحص الأسلاك، استبدال إذا كان تالفاً",
    relatedSensors: ["Frontal Impact Sensor"],
    affectedComponents: ["Frontal Impact Sensor", "SRS Module"],
    affectedComponentsAr: ["حساس الاصطدام الأمامي", "وحدة SRS"],
    safeToRide: false,
    estimatedRepairCost: { min: 600, max: 2500, currency: "SAR" }
  },
  "B0115": {
    code: "B0115",
    description: "Side Impact Sensor Circuit",
    descriptionAr: "دائرة حساس الاصطدام الجانبي",
    system: "airbag",
    subsystem: "Impact Sensors",
    subsystemAr: "حساسات الاصطدام",
    severity: "critical",
    causes: ["Faulty side impact sensor", "Wiring damage", "Sensor mounting issue"],
    causesAr: ["حساس الاصطدام الجانبي تالف", "تلف الأسلاك", "مشكلة في تركيب الحساس"],
    solution: "Test side impact sensor, check mounting, inspect wiring, replace if faulty",
    solutionAr: "اختبار حساس الاصطدام الجانبي، فحص التركيب، فحص الأسلاك، استبدال إذا كان تالفاً",
    relatedSensors: ["Side Impact Sensor"],
    affectedComponents: ["Side Impact Sensor", "SRS Module"],
    affectedComponentsAr: ["حساس الاصطدام الجانبي", "وحدة SRS"],
    safeToRide: false,
    estimatedRepairCost: { min: 600, max: 2500, currency: "SAR" }
  },
  "B0120": {
    code: "B0120",
    description: "SRS Warning Lamp Circuit",
    descriptionAr: "دائرة لمبة تحذير SRS",
    system: "airbag",
    subsystem: "Warning Lamp",
    subsystemAr: "لمبة التحذير",
    severity: "medium",
    causes: ["Faulty SRS warning lamp", "Wiring issue", "SRS module fault"],
    causesAr: ["لمبة تحذير SRS تالفة", "مشكلة أسلاك", "عطل وحدة SRS"],
    solution: "Test warning lamp circuit, check wiring, replace lamp or SRS module if needed",
    solutionAr: "اختبار دائرة لمبة التحذير، فحص الأسلاك، استبدال اللمبة أو وحدة SRS إذا لزم",
    relatedSensors: ["SRS Warning Lamp"],
    affectedComponents: ["SRS Warning Lamp", "Instrument Cluster"],
    affectedComponentsAr: ["لمبة تحذير SRS", "لوحة العدادات"],
    safeToRide: true,
    estimatedRepairCost: { min: 200, max: 1000, currency: "SAR" }
  },
  "B1000": {
    code: "B1000",
    description: "SRS Control Module Internal Fault",
    descriptionAr: "عطل داخلي في وحدة التحكم SRS",
    system: "airbag",
    subsystem: "SRS Module",
    subsystemAr: "وحدة SRS",
    severity: "critical",
    causes: ["SRS module hardware failure", "Software corruption", "Power supply issue", "Crash data"],
    causesAr: ["عطل في عتاد وحدة SRS", "تلف البرنامج", "مشكلة مصدر الطاقة", "بيانات حادث"],
    solution: "Replace SRS control module. Requires programming to vehicle VIN",
    solutionAr: "استبدال وحدة التحكم SRS. يتطلب برمجة على رقم هيكل السيارة",
    relatedSensors: ["SRS Module"],
    affectedComponents: ["SRS Control Module"],
    affectedComponentsAr: ["وحدة التحكم SRS"],
    safeToRide: false,
    estimatedRepairCost: { min: 2000, max: 10000, currency: "SAR" }
  },
  "B1001": {
    code: "B1001",
    description: "SRS Deployment Commanded",
    descriptionAr: "تم إصدار أمر نشر SRS (بعد حادث)",
    system: "airbag",
    subsystem: "SRS Module",
    subsystemAr: "وحدة SRS",
    severity: "critical",
    causes: ["Vehicle was in an accident", "Airbags deployed", "Pretensioners fired"],
    causesAr: ["السيارة كانت في حادث", "الوسائد الهوائية انتشرت", "شوادات الأحزمة أطلقت"],
    solution: "Replace all deployed airbags, pretensioners, and SRS module. Full SRS system inspection required",
    solutionAr: "استبدال جميع الوسائد المنتشرة والشوادات ووحدة SRS. يلزم فحص كامل لنظام SRS",
    relatedSensors: ["SRS Module", "All Airbag Circuits"],
    affectedComponents: ["All Deployed Airbags", "Pretensioners", "SRS Module"],
    affectedComponentsAr: ["جميع الوسائد المنتشرة", "الشوادات", "وحدة SRS"],
    safeToRide: false,
    estimatedRepairCost: { min: 5000, max: 30000, currency: "SAR" }
  },
};

// ═══════════════════════════════════════════════════════
// NETWORK / CAN BUS DTC CODES (U0xxx)
// ═══════════════════════════════════════════════════════

export const NETWORK_DTC: Record<string, DTCInfo> = {
  "U0001": {
    code: "U0001",
    description: "High Speed CAN Communication Bus",
    descriptionAr: "شبكة CAN عالية السرعة",
    system: "network",
    subsystem: "CAN Bus",
    subsystemAr: "شبكة CAN",
    severity: "critical",
    causes: ["CAN bus wiring fault", "Termination resistor failure", "Module pulling bus low", "Corrosion"],
    causesAr: ["عطل في أسلاك شبكة CAN", "عطل مقاومة الإنهاء", "وحدة تسحب الشبكة للأسفل", "تآكل"],
    solution: "Check CAN bus wiring, test termination resistors (120 ohms each end), isolate faulty module",
    solutionAr: "فحص أسلاك شبكة CAN، اختبار مقاومات الإنهاء (120 أوم في كل طرف)، عزل الوحدة التالفة",
    relatedSensors: ["CAN Bus", "All ECUs"],
    affectedComponents: ["CAN Bus Wiring", "Termination Resistors", "All Modules"],
    affectedComponentsAr: ["أسلاك شبكة CAN", "مقاومات الإنهاء", "جميع الوحدات"],
    safeToRide: false,
    estimatedRepairCost: { min: 500, max: 5000, currency: "SAR" }
  },
  "U0100": {
    code: "U0100",
    description: "Lost Communication with ECM/PCM",
    descriptionAr: "فقدان الاتصال مع وحدة التحكم بالمحرك",
    system: "network",
    subsystem: "ECM Communication",
    subsystemAr: "اتصال وحدة المحرك",
    severity: "critical",
    causes: ["ECM power/ground issue", "CAN bus fault", "ECM internal failure", "Wiring damage"],
    causesAr: ["مشكلة في طاقة/أرضي ECM", "عطل شبكة CAN", "عطل داخلي في ECM", "تلف الأسلاك"],
    solution: "Check ECM power and ground, test CAN bus, replace ECM if needed",
    solutionAr: "فحص طاقة وأرضي ECM، اختبار شبكة CAN، استبدال ECM إذا لزم",
    relatedSensors: ["ECM", "CAN Bus"],
    affectedComponents: ["ECM/PCM", "CAN Bus Wiring"],
    affectedComponentsAr: ["وحدة التحكم بالمحرك", "أسلاك شبكة CAN"],
    safeToRide: false,
    estimatedRepairCost: { min: 1000, max: 8000, currency: "SAR" }
  },
  "U0101": {
    code: "U0101",
    description: "Lost Communication with TCM",
    descriptionAr: "فقدان الاتصال مع وحدة التحكم بالقير",
    system: "network",
    subsystem: "TCM Communication",
    subsystemAr: "اتصال وحدة القير",
    severity: "critical",
    causes: ["TCM power/ground issue", "CAN bus fault", "TCM internal failure"],
    causesAr: ["مشكلة في طاقة/أرضي TCM", "عطل شبكة CAN", "عطل داخلي في TCM"],
    solution: "Check TCM power and ground, test CAN bus, replace TCM if needed",
    solutionAr: "فحص طاقة وأرضي TCM، اختبار شبكة CAN، استبدال TCM إذا لزم",
    relatedSensors: ["TCM", "CAN Bus"],
    affectedComponents: ["TCM", "CAN Bus Wiring"],
    affectedComponentsAr: ["وحدة التحكم بالقير", "أسلاك شبكة CAN"],
    safeToRide: false,
    estimatedRepairCost: { min: 800, max: 6000, currency: "SAR" }
  },
  "U0121": {
    code: "U0121",
    description: "Lost Communication with ABS Control Module",
    descriptionAr: "فقدان الاتصال مع وحدة التحكم ABS",
    system: "network",
    subsystem: "ABS Communication",
    subsystemAr: "اتصال وحدة ABS",
    severity: "critical",
    causes: ["ABS module power/ground issue", "CAN bus fault", "ABS module failure"],
    causesAr: ["مشكلة في طاقة/أرضي وحدة ABS", "عطل شبكة CAN", "عطل وحدة ABS"],
    solution: "Check ABS module power and ground, test CAN bus, replace ABS module if needed",
    solutionAr: "فحص طاقة وأرضي وحدة ABS، اختبار شبكة CAN، استبدال وحدة ABS إذا لزم",
    relatedSensors: ["ABS Module", "CAN Bus"],
    affectedComponents: ["ABS Control Module", "CAN Bus Wiring"],
    affectedComponentsAr: ["وحدة التحكم ABS", "أسلاك شبكة CAN"],
    safeToRide: false,
    estimatedRepairCost: { min: 800, max: 5000, currency: "SAR" }
  },
  "U0140": {
    code: "U0140",
    description: "Lost Communication with Body Control Module",
    descriptionAr: "فقدان الاتصال مع وحدة التحكم بالهيكل",
    system: "network",
    subsystem: "BCM Communication",
    subsystemAr: "اتصال وحدة الهيكل",
    severity: "high",
    causes: ["BCM power/ground issue", "CAN bus fault", "BCM internal failure"],
    causesAr: ["مشكلة في طاقة/أرضي BCM", "عطل شبكة CAN", "عطل داخلي في BCM"],
    solution: "Check BCM power and ground, test CAN bus, replace BCM if needed",
    solutionAr: "فحص طاقة وأرضي BCM، اختبار شبكة CAN، استبدال BCM إذا لزم",
    relatedSensors: ["BCM", "CAN Bus"],
    affectedComponents: ["BCM", "CAN Bus Wiring"],
    affectedComponentsAr: ["وحدة التحكم بالهيكل", "أسلاك شبكة CAN"],
    safeToRide: true,
    estimatedRepairCost: { min: 800, max: 5000, currency: "SAR" }
  },
  "U0155": {
    code: "U0155",
    description: "Lost Communication with Instrument Panel Cluster",
    descriptionAr: "فقدان الاتصال مع لوحة العدادات",
    system: "network",
    subsystem: "Instrument Cluster",
    subsystemAr: "لوحة العدادات",
    severity: "medium",
    causes: ["Cluster power/ground issue", "CAN bus fault", "Cluster internal failure"],
    causesAr: ["مشكلة في طاقة/أرضي اللوحة", "عطل شبكة CAN", "عطل داخلي في اللوحة"],
    solution: "Check cluster power and ground, test CAN bus, replace cluster if needed",
    solutionAr: "فحص طاقة وأرضي اللوحة، اختبار شبكة CAN، استبدال اللوحة إذا لزم",
    relatedSensors: ["Instrument Cluster", "CAN Bus"],
    affectedComponents: ["Instrument Panel Cluster", "CAN Bus Wiring"],
    affectedComponentsAr: ["لوحة العدادات", "أسلاك شبكة CAN"],
    safeToRide: true,
    estimatedRepairCost: { min: 600, max: 4000, currency: "SAR" }
  },
  "U0164": {
    code: "U0164",
    description: "Lost Communication with HVAC Control Module",
    descriptionAr: "فقدان الاتصال مع وحدة التحكم بالتكييف",
    system: "network",
    subsystem: "HVAC Communication",
    subsystemAr: "اتصال وحدة التكييف",
    severity: "low",
    causes: ["HVAC module power issue", "CAN bus fault", "HVAC module failure"],
    causesAr: ["مشكلة في طاقة وحدة التكييف", "عطل شبكة CAN", "عطل وحدة التكييف"],
    solution: "Check HVAC module power, test CAN bus, replace HVAC module if needed",
    solutionAr: "فحص طاقة وحدة التكييف، اختبار شبكة CAN، استبدال وحدة التكييف إذا لزم",
    relatedSensors: ["HVAC Module", "CAN Bus"],
    affectedComponents: ["HVAC Control Module"],
    affectedComponentsAr: ["وحدة التحكم بالتكييف"],
    safeToRide: true,
    estimatedRepairCost: { min: 400, max: 2500, currency: "SAR" }
  },
  "U0184": {
    code: "U0184",
    description: "Lost Communication with Radio",
    descriptionAr: "فقدان الاتصال مع الراديو",
    system: "network",
    subsystem: "Infotainment",
    subsystemAr: "نظام الترفيه",
    severity: "low",
    causes: ["Radio power issue", "CAN bus fault", "Radio internal failure"],
    causesAr: ["مشكلة في طاقة الراديو", "عطل شبكة CAN", "عطل داخلي في الراديو"],
    solution: "Check radio power and ground, test CAN bus, replace radio if needed",
    solutionAr: "فحص طاقة وأرضي الراديو، اختبار شبكة CAN، استبدال الراديو إذا لزم",
    relatedSensors: ["Radio/Infotainment", "CAN Bus"],
    affectedComponents: ["Radio/Infotainment System"],
    affectedComponentsAr: ["نظام الراديو/الترفيه"],
    safeToRide: true,
    estimatedRepairCost: { min: 300, max: 2000, currency: "SAR" }
  },
};

// ═══════════════════════════════════════════════════════
// COMBINED DATABASE LOOKUP
// ═══════════════════════════════════════════════════════

/** All DTC databases combined */
export const ALL_DTC_DATABASE: Record<string, DTCInfo> = {
  ...TRANSMISSION_DTC,
  ...ABS_DTC,
  ...AIRBAG_DTC,
  ...NETWORK_DTC,
};

/**
 * Look up a DTC code in all databases
 * Supports P, C, B, U codes
 * يبحث أولاً في قاعدة البيانات التفصيلية، ثم في قاعدة البيانات الضخمة (1600+ كود)
 */
export function lookupDTC(code: string): DTCInfo | null {
  if (!code) return null;
  const normalized = code.toUpperCase().trim();
  // البحث أولاً في قاعدة البيانات التفصيلية الأصلية
  const existing = ALL_DTC_DATABASE[normalized];
  if (existing) return existing;
  // البحث بدون sub-code (مثل P008A-6C -> P008A)
  const baseCode = normalized.split('-')[0];
  const existingBase = ALL_DTC_DATABASE[baseCode];
  if (existingBase) return existingBase;
  // البحث في قاعدة البيانات الضخمة (1900+ كود)
  const mega = lookupMegaDTC(normalized);
  if (mega) {
    const sys = getDTCSystem(normalized);
    return {
      code: mega.code,
      description: mega.description,
      descriptionAr: mega.description,
      system: sys,
      subsystem: mega.module,
      subsystemAr: mega.module,
      severity: mega.severity as DTCInfo['severity'],
      causes: [],
      causesAr: [],
      solution: mega.fix,
      solutionAr: mega.fix,
      relatedSensors: [],
      affectedComponents: [],
      affectedComponentsAr: [],
      safeToRide: mega.severity === 'low' || mega.severity === 'medium',
    };
  }
  return null;
}

/**
 * بحث في كل الأكواد - يستخدم للبحث المباشر
 */
export { searchMegaDTCs as searchAllDTCs, getMegaDTCCount };

/**
 * Get DTC system from code prefix
 */
export function getDTCSystem(code: string): DTCSystem {
  if (!code || code.length < 1) return "unknown";
  const prefix = code.toUpperCase()[0];
  switch (prefix) {
    case "P": {
      const num = parseInt(code.substring(1, 4));
      if (num >= 700 && num <= 899) return "transmission";
      return "engine";
    }
    case "C": return "abs";
    case "B": return "airbag";
    case "U": return "network";
    default: return "unknown";
  }
}

/**
 * Get severity color for UI display
 */
export function getSeverityColor(severity: DTCInfo["severity"]): string {
  switch (severity) {
    case "critical": return "#DC2626"; // Red
    case "high": return "#EA580C";     // Orange
    case "medium": return "#D97706";   // Amber
    case "low": return "#65A30D";      // Green
    case "info": return "#2563EB";     // Blue
    default: return "#6B7280";         // Gray
  }
}

/**
 * Get severity label in Arabic
 */
export function getSeverityLabelAr(severity: DTCInfo["severity"]): string {
  switch (severity) {
    case "critical": return "حرج - أوقف السيارة فوراً";
    case "high": return "عالي - إصلاح عاجل";
    case "medium": return "متوسط - إصلاح قريباً";
    case "low": return "منخفض - مراقبة";
    case "info": return "معلومة";
    default: return "غير محدد";
  }
}

/**
 * Get system label in Arabic
 */
export function getSystemLabelAr(system: DTCSystem): string {
  switch (system) {
    case "engine": return "المحرك";
    case "transmission": return "ناقل الحركة (القير)";
    case "abs": return "نظام ABS / الفرامل";
    case "airbag": return "الوسائد الهوائية (SRS)";
    case "body": return "الهيكل";
    case "network": return "شبكة الاتصال (CAN)";
    default: return "غير محدد";
  }
}

/**
 * Get system icon
 */
export function getSystemIcon(system: DTCSystem): string {
  switch (system) {
    case "engine": return "🔧";
    case "transmission": return "⚙️";
    case "abs": return "🛑";
    case "airbag": return "🛡️";
    case "body": return "🚗";
    case "network": return "📡";
    default: return "❓";
  }
}
