/**
 * OBD2 Extended DTC Database - قاعدة بيانات الأكواد الموسعة
 * ═══════════════════════════════════════════════════════════
 *
 * يغطي:
 * 1. أكواد Ford الموسعة مع Sub-codes (P008A-6C, P00C6-2C, P0702-28 ...)
 * 2. أكواد Transmission الكاملة (P07xx - P08xx - P09xx)
 * 3. أكواد شبكة CAN الموسعة (U0xxx - U3xxx)
 * 4. أكواد Body/SRS الموسعة (B0xxx - B2xxx)
 * 5. دعم Ford MS-CAN headers
 *
 * @version 3.0.0
 * @author مير - Meir Diagnostics
 */

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

export interface ExtendedDTCInfo {
  code: string;           // الكود الأساسي مثل P008A
  subCode?: string;       // Sub-code مثل 6C
  fullCode?: string;      // الكود الكامل P008A-6C
  description: string;
  descriptionAr: string;
  system: ExtDTCSystem;
  subsystem: string;
  subsystemAr: string;
  module?: string;        // PCM / TCM / RCM / BCM / ABS
  moduleAr?: string;
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
  fordSpecific?: boolean;  // كود خاص بفورد
}

export type ExtDTCSystem =
  | "engine"
  | "transmission"
  | "abs"
  | "airbag"
  | "body"
  | "network"
  | "fuel"
  | "unknown";

// Sub-code meanings (Ford specific - suffix after dash)
export const FORD_SUBCODE_MEANINGS: Record<string, string> = {
  "00": "عام / General",
  "08": "جهاز الإشعال / Ignition",
  "0A": "ضغط عالٍ / High Pressure",
  "0B": "ضغط منخفض / Low Pressure",
  "0C": "أداء / Performance",
  "0D": "حلقة مفتوحة / Open Circuit",
  "0E": "حلقة مغلقة / Short Circuit",
  "11": "إشارة منخفضة / Signal Low",
  "12": "إشارة عالية / Signal High",
  "13": "إشارة خارج النطاق / Signal Range",
  "16": "ضغط منخفض - قيد التشغيل / Low Pressure Running",
  "17": "ضغط منخفض - عند التشغيل البارد / Low Pressure Cold Start",
  "1A": "خطأ في التعلم / Learn Error",
  "1C": "تحكم عالٍ / Control High",
  "1D": "تحكم منخفض / Control Low",
  "1E": "قيمة غير معقولة / Unreasonable Value",
  "28": "انقطاع الاتصال / Communication Lost",
  "29": "اتصال غير صحيح / Invalid Data",
  "2C": "ضغط منخفض عند التشغيل / Low Pressure Cranking",
  "2E": "خطأ كهربائي / Electrical Error",
  "46": "ضغط منخفض - حالة الوقود / Low Fuel Pressure State",
  "49": "قيمة خارج النطاق / Out of Range",
  "4B": "مستوى منخفض / Level Low",
  "54": "عطل في الأداء / Performance Fault",
  "56": "ضغط منخفض - حالة الضخ / Low Pressure Pump State",
  "57": "ضغط منخفض - بعد التشغيل / Low Pressure Post Start",
  "5A": "ضغط منخفض - تشغيل بارد / Low Pressure Cold Run",
  "5B": "ضغط منخفض - تشغيل دافئ / Low Pressure Warm Run",
  "62": "ضغط منخفض - حالة الوقود 2 / Low Fuel State 2",
  "64": "إعداد مركزي / Central Configuration",
  "6C": "ضغط منخفض جداً / Pressure Too Low",
  "7E": "خطأ في الإعداد / Configuration Error",
  "81": "عطل في الاتصال / Communication Fault",
  "82": "بيانات غير صحيحة / Invalid Data",
  "87": "انقطاع / Interruption",
  "96": "جهد منخفض / Voltage Low",
  "97": "جهد عالٍ / Voltage High",
  "98": "جهد خارج النطاق / Voltage Range",
  "9A": "عطل في الدائرة / Circuit Fault",
  "AF": "عطل في النظام / System Fault",
  "C0": "عطل عام في النظام / General System Fault",
  "D3": "عطل في الاستجابة / Response Fault",
};

// ═══════════════════════════════════════════════════════
// FORD EXTENDED FUEL SYSTEM CODES (P008x - P00Cx)
// ═══════════════════════════════════════════════════════
export const FORD_FUEL_EXTENDED: Record<string, ExtendedDTCInfo> = {

  "P008A": {
    code: "P008A", fullCode: "P008A",
    description: "Low Pressure Fuel System Pressure - Too Low",
    descriptionAr: "ضغط نظام الوقود المنخفض - منخفض جداً",
    system: "fuel", subsystem: "Low Pressure Fuel System", subsystemAr: "نظام الوقود منخفض الضغط",
    module: "PCM", moduleAr: "وحدة التحكم بالمحرك",
    severity: "critical",
    causes: ["Fuel pump failure", "Clogged fuel filter", "Fuel pressure regulator fault", "Fuel line leak", "Low fuel level"],
    causesAr: ["عطل في طرمبة الوقود", "فلتر وقود مسدود", "عطل في منظم ضغط الوقود", "تسريب في خط الوقود", "مستوى الوقود منخفض"],
    solution: "Check fuel pressure with gauge (should be 3.5-4.5 bar), inspect fuel pump, replace fuel filter",
    solutionAr: "فحص ضغط الوقود بالمانومتر (يجب أن يكون 3.5-4.5 بار)، فحص طرمبة الوقود، تغيير فلتر الوقود",
    relatedSensors: ["Fuel Pressure Sensor", "Fuel Level Sensor", "MAF"],
    affectedComponents: ["Fuel Pump", "Fuel Filter", "Fuel Pressure Regulator", "Fuel Rail"],
    affectedComponentsAr: ["طرمبة الوقود", "فلتر الوقود", "منظم الضغط", "رامب الوقود"],
    safeToRide: false,
    estimatedRepairCost: { min: 300, max: 1500, currency: "SAR" },
    fordSpecific: true,
  },

  "P008A-6C": {
    code: "P008A", subCode: "6C", fullCode: "P008A-6C",
    description: "Low Pressure Fuel System Pressure - Too Low (Sub: Pressure Too Low)",
    descriptionAr: "ضغط نظام الوقود المنخفض - منخفض جداً (الضغط أقل من الحد الأدنى)",
    system: "fuel", subsystem: "Low Pressure Fuel System", subsystemAr: "نظام الوقود منخفض الضغط",
    module: "PCM", moduleAr: "وحدة التحكم بالمحرك",
    severity: "critical",
    causes: ["Fuel pump worn or failed", "Clogged fuel filter (replace every 40,000 km)", "Fuel pressure regulator stuck open", "Fuel line restriction or leak", "Low fuel level in tank"],
    causesAr: ["طرمبة الوقود متآكلة أو تالفة", "فلتر الوقود مسدود (يُغيَّر كل 40,000 كم)", "منظم الضغط عالق مفتوح", "انسداد أو تسريب في خط الوقود", "مستوى الوقود منخفض في الخزان"],
    solution: "1. Check fuel pressure (target: 3.5-4.5 bar at idle). 2. Replace fuel filter. 3. Test fuel pump amperage. 4. Inspect fuel pressure regulator.",
    solutionAr: "1. قياس ضغط الوقود (المستهدف: 3.5-4.5 بار عند الخمول). 2. تغيير فلتر الوقود. 3. فحص تيار طرمبة الوقود. 4. فحص منظم الضغط.",
    relatedSensors: ["Fuel Pressure Sensor (FPS)", "Fuel Level Sensor", "MAF Sensor"],
    affectedComponents: ["Fuel Pump", "Fuel Filter", "Fuel Pressure Regulator", "Fuel Rail", "Injectors"],
    affectedComponentsAr: ["طرمبة الوقود", "فلتر الوقود", "منظم الضغط", "رامب الوقود", "البخاخات"],
    safeToRide: false,
    estimatedRepairCost: { min: 300, max: 1800, currency: "SAR" },
    fordSpecific: true,
  },

  "P00C6": {
    code: "P00C6", fullCode: "P00C6",
    description: "Fuel Rail Pressure Too Low - Engine Cranking (Bank 1)",
    descriptionAr: "ضغط رامب الوقود منخفض جداً - عند تشغيل المحرك (بنك 1)",
    system: "fuel", subsystem: "High Pressure Fuel Rail", subsystemAr: "رامب الوقود عالي الضغط",
    module: "PCM", moduleAr: "وحدة التحكم بالمحرك",
    severity: "critical",
    causes: ["High pressure fuel pump failure", "Fuel rail pressure sensor fault", "Injector leak-down", "Low pressure supply issue"],
    causesAr: ["عطل في طرمبة الضغط العالي", "عطل في حساس ضغط رامب الوقود", "تسريب في البخاخات", "مشكلة في إمداد الضغط المنخفض"],
    solution: "Check high pressure fuel pump, test fuel rail pressure sensor, inspect injectors for leak-down",
    solutionAr: "فحص طرمبة الضغط العالي، فحص حساس ضغط الرامب، فحص البخاخات للتسريب",
    relatedSensors: ["Fuel Rail Pressure Sensor", "Fuel Pressure Sensor"],
    affectedComponents: ["High Pressure Fuel Pump", "Fuel Rail", "Fuel Rail Pressure Sensor", "Injectors"],
    affectedComponentsAr: ["طرمبة الضغط العالي", "رامب الوقود", "حساس ضغط الرامب", "البخاخات"],
    safeToRide: false,
    estimatedRepairCost: { min: 500, max: 3000, currency: "SAR" },
    fordSpecific: true,
  },

  "P00C6-2C": {
    code: "P00C6", subCode: "2C", fullCode: "P00C6-2C",
    description: "Fuel Rail Pressure Too Low - Engine Cranking Bank 1 (Sub: Low Pressure Cranking)",
    descriptionAr: "ضغط رامب الوقود منخفض جداً عند تشغيل المحرك - بنك 1 (الضغط منخفض أثناء التشغيل)",
    system: "fuel", subsystem: "High Pressure Fuel Rail", subsystemAr: "رامب الوقود عالي الضغط",
    module: "PCM", moduleAr: "وحدة التحكم بالمحرك",
    severity: "critical",
    causes: ["High pressure fuel pump worn (common on Ford 2.0L GDI EcoBoost)", "Low pressure pump not supplying enough fuel", "Fuel rail pressure sensor inaccurate", "Injector internal leak"],
    causesAr: ["طرمبة الضغط العالي متآكلة (شائع في فورد 2.0L GDI EcoBoost)", "طرمبة الضغط المنخفض لا تضخ كافياً", "حساس ضغط الرامب غير دقيق", "تسريب داخلي في البخاخات"],
    solution: "1. Check low pressure (3.5-4.5 bar). 2. Check high pressure at cranking (should reach 50+ bar). 3. Replace high pressure pump if worn. 4. Test injector leak-down.",
    solutionAr: "1. فحص الضغط المنخفض (3.5-4.5 بار). 2. فحص الضغط العالي عند التشغيل (يجب أن يصل 50+ بار). 3. استبدال طرمبة الضغط العالي إذا كانت متآكلة. 4. فحص تسريب البخاخات.",
    relatedSensors: ["Fuel Rail Pressure Sensor", "Low Pressure Fuel Sensor", "Crank Position Sensor"],
    affectedComponents: ["High Pressure Fuel Pump", "Fuel Rail", "Low Pressure Pump", "Injectors"],
    affectedComponentsAr: ["طرمبة الضغط العالي", "رامب الوقود", "طرمبة الضغط المنخفض", "البخاخات"],
    safeToRide: false,
    estimatedRepairCost: { min: 800, max: 3500, currency: "SAR" },
    fordSpecific: true,
  },
};

// ═══════════════════════════════════════════════════════
// FORD TRANSMISSION CODES (P0702 + DPS6 specific)
// ═══════════════════════════════════════════════════════
export const FORD_TRANSMISSION_EXTENDED: Record<string, ExtendedDTCInfo> = {

  "P0700": {
    code: "P0700", fullCode: "P0700",
    description: "Transmission Control System Malfunction",
    descriptionAr: "عطل عام في نظام التحكم بالقير",
    system: "transmission", subsystem: "TCM General", subsystemAr: "وحدة التحكم بالقير",
    module: "TCM", moduleAr: "وحدة التحكم بالقير",
    severity: "high",
    causes: ["TCM internal fault", "Wiring harness damage", "Low transmission fluid", "Solenoid failure"],
    causesAr: ["عطل داخلي في TCM", "تلف حزمة الأسلاك", "زيت القير منخفض", "عطل في الصمامات الكهربائية"],
    solution: "Scan TCM for specific sub-codes, check transmission fluid, inspect wiring to TCM",
    solutionAr: "فحص TCM للأكواد التفصيلية، فحص زيت القير، فحص أسلاك TCM",
    relatedSensors: ["TFT Sensor", "TPS", "VSS", "Input/Output Speed Sensors"],
    affectedComponents: ["TCM", "Transmission Solenoids", "Valve Body", "Wiring Harness"],
    affectedComponentsAr: ["وحدة TCM", "صمامات القير الكهربائية", "جسم الصمام", "حزمة الأسلاك"],
    safeToRide: false,
    estimatedRepairCost: { min: 500, max: 5000, currency: "SAR" },
  },

  "P0701": {
    code: "P0701", fullCode: "P0701",
    description: "Transmission Control System Range/Performance",
    descriptionAr: "نطاق/أداء نظام التحكم بالقير خارج المعدل",
    system: "transmission", subsystem: "TCM Performance", subsystemAr: "أداء وحدة التحكم بالقير",
    module: "TCM", moduleAr: "وحدة التحكم بالقير",
    severity: "high",
    causes: ["Incorrect gear ratio", "Slipping clutch pack", "Worn solenoids", "Valve body issue"],
    causesAr: ["نسبة تروس خاطئة", "تآكل في حزمة القابض", "صمامات متآكلة", "مشكلة في جسم الصمام"],
    solution: "Check transmission fluid level and condition, inspect solenoids, test gear ratios",
    solutionAr: "فحص مستوى وحالة زيت القير، فحص الصمامات، اختبار نسب التروس",
    relatedSensors: ["Input Speed Sensor", "Output Speed Sensor", "TFT"],
    affectedComponents: ["Clutch Packs", "Solenoids", "Valve Body"],
    affectedComponentsAr: ["حزم القابض", "الصمامات الكهربائية", "جسم الصمام"],
    safeToRide: false,
    estimatedRepairCost: { min: 800, max: 6000, currency: "SAR" },
  },

  "P0702": {
    code: "P0702", fullCode: "P0702",
    description: "Transmission Control System Electrical",
    descriptionAr: "عطل كهربائي في نظام التحكم بالقير",
    system: "transmission", subsystem: "TCM Electrical", subsystemAr: "الجانب الكهربائي لوحدة التحكم بالقير",
    module: "TCM", moduleAr: "وحدة التحكم بالقير",
    severity: "high",
    causes: ["Wiring harness short/open circuit", "TCM power supply issue", "Ground connection fault", "Solenoid wiring damage"],
    causesAr: ["قصر أو انقطاع في حزمة الأسلاك", "مشكلة في تغذية TCM الكهربائية", "عطل في الأرضي", "تلف أسلاك الصمامات"],
    solution: "Inspect wiring harness for damage, check TCM power and ground, test solenoid resistance",
    solutionAr: "فحص حزمة الأسلاك للتلف، فحص تغذية وأرضي TCM، قياس مقاومة الصمامات",
    relatedSensors: ["Solenoid Resistance", "TCM Voltage", "Ground Continuity"],
    affectedComponents: ["TCM", "Wiring Harness", "Solenoids", "Transmission Connector"],
    affectedComponentsAr: ["وحدة TCM", "حزمة الأسلاك", "الصمامات الكهربائية", "موصل القير"],
    safeToRide: false,
    estimatedRepairCost: { min: 300, max: 2500, currency: "SAR" },
  },

  "P0702-28": {
    code: "P0702", subCode: "28", fullCode: "P0702-28",
    description: "Transmission Control System Electrical - Communication Lost",
    descriptionAr: "عطل كهربائي في نظام التحكم بالقير - انقطاع الاتصال",
    system: "transmission", subsystem: "TCM Electrical / CAN", subsystemAr: "الكهربائي / شبكة CAN",
    module: "TCM", moduleAr: "وحدة التحكم بالقير",
    severity: "high",
    causes: ["CAN bus wiring fault to TCM", "TCM power supply interruption", "TCM internal fault", "Battery voltage drop causing communication loss"],
    causesAr: ["عطل في أسلاك CAN bus للـ TCM", "انقطاع في تغذية TCM", "عطل داخلي في TCM", "انخفاض جهد البطارية مما يسبب انقطاع الاتصال"],
    solution: "1. Check battery voltage (min 12.5V). 2. Inspect CAN bus wiring to TCM. 3. Check TCM fuses and relays. 4. Test TCM with Ford IDS scanner.",
    solutionAr: "1. فحص جهد البطارية (الحد الأدنى 12.5 فولت). 2. فحص أسلاك CAN bus للـ TCM. 3. فحص فيوزات وريليهات TCM. 4. فحص TCM بجهاز Ford IDS.",
    relatedSensors: ["CAN Bus", "TCM Power Supply", "Battery Voltage"],
    affectedComponents: ["TCM", "CAN Bus Wiring", "Battery", "TCM Fuse/Relay"],
    affectedComponentsAr: ["وحدة TCM", "أسلاك CAN bus", "البطارية", "فيوز/ريليه TCM"],
    safeToRide: false,
    estimatedRepairCost: { min: 400, max: 3000, currency: "SAR" },
    fordSpecific: true,
  },

  // DPS6 PowerShift Specific Codes (Ford Focus/Fiesta)
  "P0730": {
    code: "P0730", fullCode: "P0730",
    description: "Incorrect Gear Ratio",
    descriptionAr: "نسبة تروس غير صحيحة",
    system: "transmission", subsystem: "Gear Ratio", subsystemAr: "نسبة التروس",
    module: "TCM", moduleAr: "وحدة التحكم بالقير",
    severity: "high",
    causes: ["Worn clutch pack", "Slipping gear", "Solenoid stuck", "Low transmission fluid"],
    causesAr: ["تآكل حزمة القابض", "انزلاق التروس", "صمام عالق", "زيت القير منخفض"],
    solution: "Check transmission fluid, inspect clutch packs, test solenoids",
    solutionAr: "فحص زيت القير، فحص حزم القابض، فحص الصمامات",
    relatedSensors: ["Input Speed Sensor", "Output Speed Sensor"],
    affectedComponents: ["Clutch Packs", "Gear Set", "Solenoids"],
    affectedComponentsAr: ["حزم القابض", "مجموعة التروس", "الصمامات"],
    safeToRide: false,
    estimatedRepairCost: { min: 1500, max: 8000, currency: "SAR" },
  },

  "P0731": { code: "P0731", fullCode: "P0731", description: "Gear 1 Incorrect Ratio", descriptionAr: "نسبة الترس الأول غير صحيحة", system: "transmission", subsystem: "Gear 1", subsystemAr: "الترس الأول", module: "TCM", moduleAr: "وحدة TCM", severity: "high", causes: ["Clutch 1 worn", "Solenoid 1 fault"], causesAr: ["تآكل قابض 1", "عطل صمام 1"], solution: "Inspect clutch pack 1, test solenoid 1", solutionAr: "فحص قابض 1، فحص صمام 1", relatedSensors: ["Input Speed Sensor"], affectedComponents: ["Clutch 1", "Solenoid 1"], affectedComponentsAr: ["قابض 1", "صمام 1"], safeToRide: false, estimatedRepairCost: { min: 1500, max: 7000, currency: "SAR" } },
  "P0732": { code: "P0732", fullCode: "P0732", description: "Gear 2 Incorrect Ratio", descriptionAr: "نسبة الترس الثاني غير صحيحة", system: "transmission", subsystem: "Gear 2", subsystemAr: "الترس الثاني", module: "TCM", moduleAr: "وحدة TCM", severity: "high", causes: ["Clutch 2 worn", "Solenoid 2 fault"], causesAr: ["تآكل قابض 2", "عطل صمام 2"], solution: "Inspect clutch pack 2, test solenoid 2", solutionAr: "فحص قابض 2، فحص صمام 2", relatedSensors: ["Input Speed Sensor"], affectedComponents: ["Clutch 2", "Solenoid 2"], affectedComponentsAr: ["قابض 2", "صمام 2"], safeToRide: false, estimatedRepairCost: { min: 1500, max: 7000, currency: "SAR" } },
  "P0733": { code: "P0733", fullCode: "P0733", description: "Gear 3 Incorrect Ratio", descriptionAr: "نسبة الترس الثالث غير صحيحة", system: "transmission", subsystem: "Gear 3", subsystemAr: "الترس الثالث", module: "TCM", moduleAr: "وحدة TCM", severity: "high", causes: ["Clutch 3 worn", "Solenoid 3 fault"], causesAr: ["تآكل قابض 3", "عطل صمام 3"], solution: "Inspect clutch pack 3, test solenoid 3", solutionAr: "فحص قابض 3، فحص صمام 3", relatedSensors: ["Input Speed Sensor"], affectedComponents: ["Clutch 3", "Solenoid 3"], affectedComponentsAr: ["قابض 3", "صمام 3"], safeToRide: false, estimatedRepairCost: { min: 1500, max: 7000, currency: "SAR" } },
  "P0734": { code: "P0734", fullCode: "P0734", description: "Gear 4 Incorrect Ratio", descriptionAr: "نسبة الترس الرابع غير صحيحة", system: "transmission", subsystem: "Gear 4", subsystemAr: "الترس الرابع", module: "TCM", moduleAr: "وحدة TCM", severity: "high", causes: ["Clutch 4 worn", "Solenoid 4 fault"], causesAr: ["تآكل قابض 4", "عطل صمام 4"], solution: "Inspect clutch pack 4, test solenoid 4", solutionAr: "فحص قابض 4، فحص صمام 4", relatedSensors: ["Output Speed Sensor"], affectedComponents: ["Clutch 4", "Solenoid 4"], affectedComponentsAr: ["قابض 4", "صمام 4"], safeToRide: false, estimatedRepairCost: { min: 1500, max: 7000, currency: "SAR" } },
  "P0735": { code: "P0735", fullCode: "P0735", description: "Gear 5 Incorrect Ratio", descriptionAr: "نسبة الترس الخامس غير صحيحة", system: "transmission", subsystem: "Gear 5", subsystemAr: "الترس الخامس", module: "TCM", moduleAr: "وحدة TCM", severity: "high", causes: ["Clutch 5 worn", "Solenoid 5 fault"], causesAr: ["تآكل قابض 5", "عطل صمام 5"], solution: "Inspect clutch pack 5, test solenoid 5", solutionAr: "فحص قابض 5، فحص صمام 5", relatedSensors: ["Output Speed Sensor"], affectedComponents: ["Clutch 5", "Solenoid 5"], affectedComponentsAr: ["قابض 5", "صمام 5"], safeToRide: false, estimatedRepairCost: { min: 1500, max: 7000, currency: "SAR" } },
  "P0736": { code: "P0736", fullCode: "P0736", description: "Reverse Incorrect Gear Ratio", descriptionAr: "نسبة الرجوع للخلف غير صحيحة", system: "transmission", subsystem: "Reverse Gear", subsystemAr: "ترس الرجوع", module: "TCM", moduleAr: "وحدة TCM", severity: "high", causes: ["Reverse clutch worn", "Reverse solenoid fault"], causesAr: ["تآكل قابض الرجوع", "عطل صمام الرجوع"], solution: "Inspect reverse clutch, test reverse solenoid", solutionAr: "فحص قابض الرجوع، فحص صمام الرجوع", relatedSensors: ["Output Speed Sensor"], affectedComponents: ["Reverse Clutch", "Reverse Solenoid"], affectedComponentsAr: ["قابض الرجوع", "صمام الرجوع"], safeToRide: false, estimatedRepairCost: { min: 2000, max: 9000, currency: "SAR" } },

  "P0740": {
    code: "P0740", fullCode: "P0740",
    description: "Torque Converter Clutch Circuit Malfunction",
    descriptionAr: "عطل في دائرة قابض محول العزم (TCC)",
    system: "transmission", subsystem: "Torque Converter", subsystemAr: "محول العزم",
    module: "TCM", moduleAr: "وحدة TCM",
    severity: "high",
    causes: ["TCC solenoid failure", "Torque converter worn", "Transmission fluid degraded", "TCM fault"],
    causesAr: ["عطل في صمام TCC", "تآكل محول العزم", "تدهور زيت القير", "عطل في TCM"],
    solution: "Check TCC solenoid resistance, test torque converter, change transmission fluid",
    solutionAr: "فحص مقاومة صمام TCC، فحص محول العزم، تغيير زيت القير",
    relatedSensors: ["TCC Solenoid", "TFT Sensor", "VSS"],
    affectedComponents: ["Torque Converter", "TCC Solenoid", "Valve Body"],
    affectedComponentsAr: ["محول العزم", "صمام TCC", "جسم الصمام"],
    safeToRide: true,
    estimatedRepairCost: { min: 800, max: 4000, currency: "SAR" },
  },

  "P0741": { code: "P0741", fullCode: "P0741", description: "TCC Circuit Performance / Stuck Off", descriptionAr: "أداء دائرة TCC / عالق مغلق", system: "transmission", subsystem: "Torque Converter", subsystemAr: "محول العزم", module: "TCM", moduleAr: "وحدة TCM", severity: "medium", causes: ["TCC solenoid stuck", "Torque converter slip"], causesAr: ["صمام TCC عالق", "انزلاق محول العزم"], solution: "Replace TCC solenoid, inspect torque converter", solutionAr: "استبدال صمام TCC، فحص محول العزم", relatedSensors: ["TCC Solenoid"], affectedComponents: ["TCC Solenoid", "Torque Converter"], affectedComponentsAr: ["صمام TCC", "محول العزم"], safeToRide: true, estimatedRepairCost: { min: 600, max: 3500, currency: "SAR" } },
  "P0742": { code: "P0742", fullCode: "P0742", description: "TCC Circuit Stuck On", descriptionAr: "دائرة TCC عالقة مفتوحة", system: "transmission", subsystem: "Torque Converter", subsystemAr: "محول العزم", module: "TCM", moduleAr: "وحدة TCM", severity: "high", causes: ["TCC solenoid stuck open", "Valve body fault"], causesAr: ["صمام TCC عالق مفتوح", "عطل في جسم الصمام"], solution: "Replace TCC solenoid, inspect valve body", solutionAr: "استبدال صمام TCC، فحص جسم الصمام", relatedSensors: ["TCC Solenoid"], affectedComponents: ["TCC Solenoid", "Valve Body"], affectedComponentsAr: ["صمام TCC", "جسم الصمام"], safeToRide: false, estimatedRepairCost: { min: 800, max: 4000, currency: "SAR" } },

  "P0750": { code: "P0750", fullCode: "P0750", description: "Shift Solenoid A Malfunction", descriptionAr: "عطل في صمام تغيير الترس A", system: "transmission", subsystem: "Shift Solenoids", subsystemAr: "صمامات تغيير الترس", module: "TCM", moduleAr: "وحدة TCM", severity: "high", causes: ["Solenoid A failed", "Wiring fault", "Valve body clog"], causesAr: ["عطل صمام A", "عطل أسلاك", "انسداد جسم الصمام"], solution: "Test solenoid A resistance (should be 10-15 ohms), replace if failed", solutionAr: "قياس مقاومة صمام A (يجب 10-15 أوم)، استبدال إذا تالف", relatedSensors: ["Solenoid A"], affectedComponents: ["Shift Solenoid A", "Valve Body"], affectedComponentsAr: ["صمام تغيير A", "جسم الصمام"], safeToRide: false, estimatedRepairCost: { min: 400, max: 2000, currency: "SAR" } },
  "P0755": { code: "P0755", fullCode: "P0755", description: "Shift Solenoid B Malfunction", descriptionAr: "عطل في صمام تغيير الترس B", system: "transmission", subsystem: "Shift Solenoids", subsystemAr: "صمامات تغيير الترس", module: "TCM", moduleAr: "وحدة TCM", severity: "high", causes: ["Solenoid B failed", "Wiring fault"], causesAr: ["عطل صمام B", "عطل أسلاك"], solution: "Test solenoid B resistance, replace if failed", solutionAr: "قياس مقاومة صمام B، استبدال إذا تالف", relatedSensors: ["Solenoid B"], affectedComponents: ["Shift Solenoid B"], affectedComponentsAr: ["صمام تغيير B"], safeToRide: false, estimatedRepairCost: { min: 400, max: 2000, currency: "SAR" } },
  "P0760": { code: "P0760", fullCode: "P0760", description: "Shift Solenoid C Malfunction", descriptionAr: "عطل في صمام تغيير الترس C", system: "transmission", subsystem: "Shift Solenoids", subsystemAr: "صمامات تغيير الترس", module: "TCM", moduleAr: "وحدة TCM", severity: "high", causes: ["Solenoid C failed", "Wiring fault"], causesAr: ["عطل صمام C", "عطل أسلاك"], solution: "Test solenoid C resistance, replace if failed", solutionAr: "قياس مقاومة صمام C، استبدال إذا تالف", relatedSensors: ["Solenoid C"], affectedComponents: ["Shift Solenoid C"], affectedComponentsAr: ["صمام تغيير C"], safeToRide: false, estimatedRepairCost: { min: 400, max: 2000, currency: "SAR" } },
  "P0765": { code: "P0765", fullCode: "P0765", description: "Shift Solenoid D Malfunction", descriptionAr: "عطل في صمام تغيير الترس D", system: "transmission", subsystem: "Shift Solenoids", subsystemAr: "صمامات تغيير الترس", module: "TCM", moduleAr: "وحدة TCM", severity: "high", causes: ["Solenoid D failed"], causesAr: ["عطل صمام D"], solution: "Test solenoid D, replace if failed", solutionAr: "فحص صمام D، استبدال إذا تالف", relatedSensors: ["Solenoid D"], affectedComponents: ["Shift Solenoid D"], affectedComponentsAr: ["صمام تغيير D"], safeToRide: false, estimatedRepairCost: { min: 400, max: 2000, currency: "SAR" } },
  "P0770": { code: "P0770", fullCode: "P0770", description: "Shift Solenoid E Malfunction", descriptionAr: "عطل في صمام تغيير الترس E", system: "transmission", subsystem: "Shift Solenoids", subsystemAr: "صمامات تغيير الترس", module: "TCM", moduleAr: "وحدة TCM", severity: "high", causes: ["Solenoid E failed"], causesAr: ["عطل صمام E"], solution: "Test solenoid E, replace if failed", solutionAr: "فحص صمام E، استبدال إذا تالف", relatedSensors: ["Solenoid E"], affectedComponents: ["Shift Solenoid E"], affectedComponentsAr: ["صمام تغيير E"], safeToRide: false, estimatedRepairCost: { min: 400, max: 2000, currency: "SAR" } },

  "P0780": {
    code: "P0780", fullCode: "P0780",
    description: "Shift Malfunction",
    descriptionAr: "عطل في عملية تغيير الترس",
    system: "transmission", subsystem: "Shift Control", subsystemAr: "التحكم في تغيير الترس",
    module: "TCM", moduleAr: "وحدة TCM",
    severity: "high",
    causes: ["Multiple solenoid faults", "Valve body wear", "Low transmission fluid", "TCM calibration issue"],
    causesAr: ["أعطال متعددة في الصمامات", "تآكل جسم الصمام", "زيت القير منخفض", "مشكلة في معايرة TCM"],
    solution: "Change transmission fluid, inspect valve body, test all solenoids",
    solutionAr: "تغيير زيت القير، فحص جسم الصمام، فحص جميع الصمامات",
    relatedSensors: ["All Solenoids", "TFT", "VSS"],
    affectedComponents: ["Valve Body", "Solenoids", "Clutch Packs"],
    affectedComponentsAr: ["جسم الصمام", "الصمامات", "حزم القابض"],
    safeToRide: false,
    estimatedRepairCost: { min: 1000, max: 7000, currency: "SAR" },
  },

  // Ford DPS6 PowerShift specific
  "P07A8": {
    code: "P07A8", fullCode: "P07A8",
    description: "Clutch 1 Pressure Control Solenoid A Performance",
    descriptionAr: "أداء صمام ضغط القابض 1 - A (DPS6 PowerShift)",
    system: "transmission", subsystem: "DPS6 Clutch 1", subsystemAr: "قابض DPS6 رقم 1",
    module: "TCM", moduleAr: "وحدة TCM",
    severity: "high",
    causes: ["DPS6 clutch 1 solenoid worn", "Clutch 1 pack worn (common Ford DPS6 issue)", "Transmission fluid contaminated"],
    causesAr: ["تآكل صمام قابض DPS6 رقم 1", "تآكل حزمة القابض 1 (مشكلة شائعة في DPS6)", "تلوث زيت القير"],
    solution: "Ford DPS6 known issue - check for TSB (Technical Service Bulletin). Replace clutch pack 1 or full transmission rebuild.",
    solutionAr: "مشكلة معروفة في DPS6 - تحقق من نشرات الخدمة الفنية. استبدال حزمة القابض 1 أو إعادة بناء كاملة للقير.",
    relatedSensors: ["Clutch 1 Pressure Sensor", "Input Speed Sensor"],
    affectedComponents: ["DPS6 Clutch Pack 1", "Solenoid A", "Valve Body"],
    affectedComponentsAr: ["حزمة قابض DPS6 رقم 1", "صمام A", "جسم الصمام"],
    safeToRide: false,
    estimatedRepairCost: { min: 3000, max: 12000, currency: "SAR" },
    fordSpecific: true,
  },

  "P07A9": {
    code: "P07A9", fullCode: "P07A9",
    description: "Clutch 2 Pressure Control Solenoid B Performance",
    descriptionAr: "أداء صمام ضغط القابض 2 - B (DPS6 PowerShift)",
    system: "transmission", subsystem: "DPS6 Clutch 2", subsystemAr: "قابض DPS6 رقم 2",
    module: "TCM", moduleAr: "وحدة TCM",
    severity: "high",
    causes: ["DPS6 clutch 2 solenoid worn", "Clutch 2 pack worn", "Transmission fluid contaminated"],
    causesAr: ["تآكل صمام قابض DPS6 رقم 2", "تآكل حزمة القابض 2", "تلوث زيت القير"],
    solution: "Ford DPS6 known issue - Replace clutch pack 2 or full transmission rebuild",
    solutionAr: "مشكلة معروفة في DPS6 - استبدال حزمة القابض 2 أو إعادة بناء كاملة للقير",
    relatedSensors: ["Clutch 2 Pressure Sensor", "Input Speed Sensor"],
    affectedComponents: ["DPS6 Clutch Pack 2", "Solenoid B", "Valve Body"],
    affectedComponentsAr: ["حزمة قابض DPS6 رقم 2", "صمام B", "جسم الصمام"],
    safeToRide: false,
    estimatedRepairCost: { min: 3000, max: 12000, currency: "SAR" },
    fordSpecific: true,
  },

  "P0810": { code: "P0810", fullCode: "P0810", description: "Clutch Position Control Error", descriptionAr: "خطأ في التحكم بموضع القابض", system: "transmission", subsystem: "Clutch Control", subsystemAr: "التحكم بالقابض", module: "TCM", moduleAr: "وحدة TCM", severity: "high", causes: ["Clutch position sensor fault", "Clutch actuator fault"], causesAr: ["عطل حساس موضع القابض", "عطل محرك القابض"], solution: "Inspect clutch position sensor and actuator", solutionAr: "فحص حساس موضع القابض والمحرك", relatedSensors: ["Clutch Position Sensor"], affectedComponents: ["Clutch Actuator", "Position Sensor"], affectedComponentsAr: ["محرك القابض", "حساس الموضع"], safeToRide: false, estimatedRepairCost: { min: 500, max: 3000, currency: "SAR" } },
  "P0811": { code: "P0811", fullCode: "P0811", description: "Excessive Clutch Slippage", descriptionAr: "انزلاق مفرط في القابض", system: "transmission", subsystem: "Clutch Slip", subsystemAr: "انزلاق القابض", module: "TCM", moduleAr: "وحدة TCM", severity: "critical", causes: ["Clutch worn out", "Clutch fluid contaminated", "Clutch actuator fault"], causesAr: ["تآكل القابض", "تلوث سائل القابض", "عطل محرك القابض"], solution: "Replace clutch assembly, change clutch fluid", solutionAr: "استبدال مجموعة القابض، تغيير سائل القابض", relatedSensors: ["Input/Output Speed Sensors"], affectedComponents: ["Clutch Pack", "Clutch Fluid"], affectedComponentsAr: ["حزمة القابض", "سائل القابض"], safeToRide: false, estimatedRepairCost: { min: 2000, max: 10000, currency: "SAR" } },

  "P0826": { code: "P0826", fullCode: "P0826", description: "Up and Down Shift Switch Input Circuit", descriptionAr: "دائرة مفتاح تغيير الترس للأعلى والأسفل", system: "transmission", subsystem: "Shift Switch", subsystemAr: "مفتاح تغيير الترس", module: "TCM", moduleAr: "وحدة TCM", severity: "low", causes: ["Shift switch fault", "Wiring issue"], causesAr: ["عطل مفتاح التغيير", "مشكلة أسلاك"], solution: "Inspect shift switch and wiring", solutionAr: "فحص مفتاح التغيير والأسلاك", relatedSensors: ["Shift Switch"], affectedComponents: ["Shift Switch", "Wiring"], affectedComponentsAr: ["مفتاح التغيير", "الأسلاك"], safeToRide: true, estimatedRepairCost: { min: 200, max: 800, currency: "SAR" } },

  "P0840": { code: "P0840", fullCode: "P0840", description: "Transmission Fluid Pressure Sensor/Switch A Circuit", descriptionAr: "دائرة حساس/مفتاح ضغط زيت القير A", system: "transmission", subsystem: "Fluid Pressure", subsystemAr: "ضغط الزيت", module: "TCM", moduleAr: "وحدة TCM", severity: "medium", causes: ["Pressure sensor fault", "Low fluid", "Wiring issue"], causesAr: ["عطل حساس الضغط", "زيت منخفض", "مشكلة أسلاك"], solution: "Check fluid level, test pressure sensor", solutionAr: "فحص مستوى الزيت، فحص حساس الضغط", relatedSensors: ["Fluid Pressure Sensor A"], affectedComponents: ["Pressure Sensor A", "Fluid"], affectedComponentsAr: ["حساس الضغط A", "الزيت"], safeToRide: true, estimatedRepairCost: { min: 300, max: 1500, currency: "SAR" } },
  "P0841": { code: "P0841", fullCode: "P0841", description: "Transmission Fluid Pressure Sensor/Switch A Circuit Range/Performance", descriptionAr: "نطاق/أداء دائرة حساس ضغط زيت القير A", system: "transmission", subsystem: "Fluid Pressure", subsystemAr: "ضغط الزيت", module: "TCM", moduleAr: "وحدة TCM", severity: "medium", causes: ["Pressure sensor out of range", "Fluid degraded"], causesAr: ["حساس الضغط خارج النطاق", "تدهور الزيت"], solution: "Change transmission fluid, test pressure sensor", solutionAr: "تغيير زيت القير، فحص حساس الضغط", relatedSensors: ["Fluid Pressure Sensor A"], affectedComponents: ["Pressure Sensor A"], affectedComponentsAr: ["حساس الضغط A"], safeToRide: true, estimatedRepairCost: { min: 300, max: 1500, currency: "SAR" } },

  "P0868": { code: "P0868", fullCode: "P0868", description: "Transmission Fluid Pressure Low", descriptionAr: "ضغط زيت القير منخفض", system: "transmission", subsystem: "Fluid Pressure", subsystemAr: "ضغط الزيت", module: "TCM", moduleAr: "وحدة TCM", severity: "high", causes: ["Low fluid level", "Pump wear", "Pressure regulator fault"], causesAr: ["مستوى الزيت منخفض", "تآكل الطرمبة", "عطل منظم الضغط"], solution: "Check and top up fluid, inspect pump and pressure regulator", solutionAr: "فحص وإضافة الزيت، فحص الطرمبة ومنظم الضغط", relatedSensors: ["Fluid Pressure Sensor"], affectedComponents: ["Transmission Pump", "Pressure Regulator", "Fluid"], affectedComponentsAr: ["طرمبة القير", "منظم الضغط", "الزيت"], safeToRide: false, estimatedRepairCost: { min: 500, max: 4000, currency: "SAR" } },

  "P0882": { code: "P0882", fullCode: "P0882", description: "TCM Power Input Signal Low", descriptionAr: "إشارة تغذية TCM منخفضة", system: "transmission", subsystem: "TCM Power", subsystemAr: "تغذية وحدة TCM", module: "TCM", moduleAr: "وحدة TCM", severity: "high", causes: ["Battery voltage low", "TCM fuse blown", "Wiring fault"], causesAr: ["جهد البطارية منخفض", "فيوز TCM محترق", "عطل أسلاك"], solution: "Check battery, inspect TCM fuse and wiring", solutionAr: "فحص البطارية، فحص فيوز TCM والأسلاك", relatedSensors: ["Battery Voltage", "TCM Power Supply"], affectedComponents: ["Battery", "TCM Fuse", "Wiring"], affectedComponentsAr: ["البطارية", "فيوز TCM", "الأسلاك"], safeToRide: false, estimatedRepairCost: { min: 200, max: 1500, currency: "SAR" } },

  "P0900": { code: "P0900", fullCode: "P0900", description: "Clutch Actuator Circuit Open", descriptionAr: "انقطاع في دائرة محرك القابض", system: "transmission", subsystem: "Clutch Actuator", subsystemAr: "محرك القابض", module: "TCM", moduleAr: "وحدة TCM", severity: "high", causes: ["Clutch actuator motor fault", "Open circuit in wiring"], causesAr: ["عطل محرك القابض", "انقطاع في الأسلاك"], solution: "Inspect clutch actuator motor and wiring", solutionAr: "فحص محرك القابض والأسلاك", relatedSensors: ["Clutch Actuator"], affectedComponents: ["Clutch Actuator Motor", "Wiring"], affectedComponentsAr: ["محرك القابض", "الأسلاك"], safeToRide: false, estimatedRepairCost: { min: 600, max: 3000, currency: "SAR" } },
  "P0901": { code: "P0901", fullCode: "P0901", description: "Clutch Actuator Circuit Range/Performance", descriptionAr: "نطاق/أداء دائرة محرك القابض خارج المعدل", system: "transmission", subsystem: "Clutch Actuator", subsystemAr: "محرك القابض", module: "TCM", moduleAr: "وحدة TCM", severity: "high", causes: ["Clutch actuator performance degraded"], causesAr: ["تدهور أداء محرك القابض"], solution: "Replace clutch actuator", solutionAr: "استبدال محرك القابض", relatedSensors: ["Clutch Actuator"], affectedComponents: ["Clutch Actuator"], affectedComponentsAr: ["محرك القابض"], safeToRide: false, estimatedRepairCost: { min: 600, max: 3000, currency: "SAR" } },
};

// ═══════════════════════════════════════════════════════
// FORD NETWORK / CAN CODES (U0xxx - U3xxx)
// ═══════════════════════════════════════════════════════
export const FORD_NETWORK_EXTENDED: Record<string, ExtendedDTCInfo> = {

  "U0001": { code: "U0001", fullCode: "U0001", description: "High Speed CAN Communication Bus", descriptionAr: "عطل في شبكة CAN عالية السرعة", system: "network", subsystem: "HS-CAN Bus", subsystemAr: "شبكة CAN عالية السرعة", module: "PCM", moduleAr: "وحدة PCM", severity: "high", causes: ["CAN bus wiring fault", "Termination resistor fault", "Module failure on bus"], causesAr: ["عطل أسلاك CAN bus", "عطل مقاومة الإنهاء", "عطل وحدة على الشبكة"], solution: "Check CAN bus wiring, measure termination resistance (should be 60 ohms)", solutionAr: "فحص أسلاك CAN bus، قياس مقاومة الإنهاء (يجب 60 أوم)", relatedSensors: ["CAN Bus"], affectedComponents: ["CAN Bus Wiring", "Termination Resistors"], affectedComponentsAr: ["أسلاك CAN bus", "مقاومات الإنهاء"], safeToRide: false, estimatedRepairCost: { min: 300, max: 2000, currency: "SAR" } },

  "U0100": {
    code: "U0100", fullCode: "U0100",
    description: "Lost Communication With ECM/PCM A",
    descriptionAr: "انقطاع الاتصال مع وحدة التحكم بالمحرك (ECM/PCM A)",
    system: "network", subsystem: "ECM Communication", subsystemAr: "اتصال وحدة المحرك",
    module: "RCM", moduleAr: "وحدة التحكم بالوسائد الهوائية",
    severity: "high",
    causes: ["PCM power supply fault", "CAN bus wiring to PCM damaged", "PCM internal fault", "Battery voltage drop"],
    causesAr: ["عطل في تغذية PCM", "تلف أسلاك CAN bus للـ PCM", "عطل داخلي في PCM", "انخفاض جهد البطارية"],
    solution: "Check PCM power and ground, inspect CAN bus wiring, test battery voltage",
    solutionAr: "فحص تغذية وأرضي PCM، فحص أسلاك CAN bus، فحص جهد البطارية",
    relatedSensors: ["CAN Bus", "PCM Power", "Battery"],
    affectedComponents: ["PCM", "CAN Bus Wiring", "Battery"],
    affectedComponentsAr: ["وحدة PCM", "أسلاك CAN bus", "البطارية"],
    safeToRide: false,
    estimatedRepairCost: { min: 300, max: 3000, currency: "SAR" },
  },

  "U0100-28": {
    code: "U0100", subCode: "28", fullCode: "U0100-28",
    description: "Lost Communication With ECM/PCM A - Communication Lost",
    descriptionAr: "انقطاع الاتصال مع وحدة التحكم بالمحرك - الاتصال مقطوع",
    system: "network", subsystem: "ECM Communication", subsystemAr: "اتصال وحدة المحرك",
    module: "RCM", moduleAr: "وحدة التحكم بالوسائد الهوائية",
    severity: "high",
    causes: ["Battery voltage below 9V causing communication loss", "PCM fuse blown", "CAN bus open circuit", "PCM failure"],
    causesAr: ["جهد البطارية أقل من 9 فولت مما يسبب انقطاع الاتصال", "فيوز PCM محترق", "انقطاع في CAN bus", "عطل PCM"],
    solution: "1. Check battery (min 12.5V). 2. Check PCM fuses. 3. Inspect CAN bus wiring between RCM and PCM. 4. Clear codes and retest.",
    solutionAr: "1. فحص البطارية (الحد الأدنى 12.5 فولت). 2. فحص فيوزات PCM. 3. فحص أسلاك CAN bus بين RCM وPCM. 4. مسح الأكواد وإعادة الفحص.",
    relatedSensors: ["CAN Bus", "Battery Voltage"],
    affectedComponents: ["PCM", "RCM", "CAN Bus", "Battery"],
    affectedComponentsAr: ["وحدة PCM", "وحدة RCM", "شبكة CAN", "البطارية"],
    safeToRide: false,
    estimatedRepairCost: { min: 300, max: 3000, currency: "SAR" },
    fordSpecific: true,
  },

  "U0121": { code: "U0121", fullCode: "U0121", description: "Lost Communication With Anti-Lock Brake System (ABS) Control Module", descriptionAr: "انقطاع الاتصال مع وحدة ABS", system: "network", subsystem: "ABS Communication", subsystemAr: "اتصال وحدة ABS", module: "PCM", moduleAr: "وحدة PCM", severity: "high", causes: ["ABS module fault", "CAN bus wiring to ABS damaged"], causesAr: ["عطل وحدة ABS", "تلف أسلاك CAN bus للـ ABS"], solution: "Check ABS module power and CAN bus wiring", solutionAr: "فحص تغذية وحدة ABS وأسلاك CAN bus", relatedSensors: ["CAN Bus", "ABS Power"], affectedComponents: ["ABS Module", "CAN Bus Wiring"], affectedComponentsAr: ["وحدة ABS", "أسلاك CAN bus"], safeToRide: false, estimatedRepairCost: { min: 400, max: 2500, currency: "SAR" } },

  "U0140": {
    code: "U0140", fullCode: "U0140",
    description: "Lost Communication With Body Control Module",
    descriptionAr: "انقطاع الاتصال مع وحدة التحكم بالهيكل (BCM)",
    system: "network", subsystem: "BCM Communication", subsystemAr: "اتصال وحدة الهيكل",
    module: "RCM", moduleAr: "وحدة التحكم بالوسائد الهوائية",
    severity: "medium",
    causes: ["BCM power supply fault", "CAN bus wiring to BCM damaged", "BCM internal fault"],
    causesAr: ["عطل في تغذية BCM", "تلف أسلاك CAN bus للـ BCM", "عطل داخلي في BCM"],
    solution: "Check BCM power and ground, inspect CAN bus wiring to BCM",
    solutionAr: "فحص تغذية وأرضي BCM، فحص أسلاك CAN bus للـ BCM",
    relatedSensors: ["CAN Bus", "BCM Power"],
    affectedComponents: ["BCM", "CAN Bus Wiring"],
    affectedComponentsAr: ["وحدة BCM", "أسلاك CAN bus"],
    safeToRide: true,
    estimatedRepairCost: { min: 300, max: 2500, currency: "SAR" },
  },

  "U0140-28": {
    code: "U0140", subCode: "28", fullCode: "U0140-28",
    description: "Lost Communication With Body Control Module - Communication Lost",
    descriptionAr: "انقطاع الاتصال مع وحدة التحكم بالهيكل - الاتصال مقطوع",
    system: "network", subsystem: "BCM Communication", subsystemAr: "اتصال وحدة الهيكل",
    module: "RCM", moduleAr: "وحدة التحكم بالوسائد الهوائية",
    severity: "medium",
    causes: ["Battery voltage drop", "BCM fuse blown", "CAN bus open circuit to BCM"],
    causesAr: ["انخفاض جهد البطارية", "فيوز BCM محترق", "انقطاع في CAN bus للـ BCM"],
    solution: "Check battery, BCM fuses, and CAN bus wiring. Often clears after battery replacement.",
    solutionAr: "فحص البطارية وفيوزات BCM وأسلاك CAN bus. غالباً يختفي بعد تغيير البطارية.",
    relatedSensors: ["CAN Bus", "Battery Voltage"],
    affectedComponents: ["BCM", "Battery", "CAN Bus"],
    affectedComponentsAr: ["وحدة BCM", "البطارية", "شبكة CAN"],
    safeToRide: true,
    estimatedRepairCost: { min: 200, max: 2000, currency: "SAR" },
    fordSpecific: true,
  },

  "U0155": { code: "U0155", fullCode: "U0155", description: "Lost Communication With Instrument Panel Cluster (IPC) Control Module", descriptionAr: "انقطاع الاتصال مع لوحة العدادات", system: "network", subsystem: "IPC Communication", subsystemAr: "اتصال لوحة العدادات", module: "PCM", moduleAr: "وحدة PCM", severity: "medium", causes: ["IPC fault", "CAN bus wiring to IPC"], causesAr: ["عطل لوحة العدادات", "أسلاك CAN bus للعدادات"], solution: "Check IPC power and CAN bus wiring", solutionAr: "فحص تغذية لوحة العدادات وأسلاك CAN bus", relatedSensors: ["CAN Bus"], affectedComponents: ["IPC", "CAN Bus Wiring"], affectedComponentsAr: ["لوحة العدادات", "أسلاك CAN bus"], safeToRide: true, estimatedRepairCost: { min: 300, max: 2000, currency: "SAR" } },

  "U0300": {
    code: "U0300", fullCode: "U0300",
    description: "Internal Control Module Software Incompatibility",
    descriptionAr: "عدم توافق برنامج وحدة التحكم الداخلي",
    system: "network", subsystem: "Module Software", subsystemAr: "برنامج الوحدة",
    module: "RCM", moduleAr: "وحدة التحكم بالوسائد الهوائية",
    severity: "medium",
    causes: ["Module software version mismatch", "Incorrect module installed", "Module needs reprogramming", "Battery replacement without reconfiguration"],
    causesAr: ["عدم تطابق إصدار البرنامج", "وحدة غير صحيحة مثبتة", "الوحدة تحتاج إعادة برمجة", "تغيير البطارية بدون إعادة ضبط"],
    solution: "Reprogram module with Ford IDS/FDRS, ensure correct module part number",
    solutionAr: "إعادة برمجة الوحدة بجهاز Ford IDS/FDRS، التأكد من رقم قطعة الوحدة الصحيح",
    relatedSensors: ["Module Software Version"],
    affectedComponents: ["RCM", "Module Software"],
    affectedComponentsAr: ["وحدة RCM", "برنامج الوحدة"],
    safeToRide: true,
    estimatedRepairCost: { min: 200, max: 1500, currency: "SAR" },
  },

  "U0300-28": {
    code: "U0300", subCode: "28", fullCode: "U0300-28",
    description: "Internal Control Module Software Incompatibility - Communication Lost",
    descriptionAr: "عدم توافق برنامج الوحدة - الاتصال مقطوع",
    system: "network", subsystem: "Module Software", subsystemAr: "برنامج الوحدة",
    module: "RCM", moduleAr: "وحدة التحكم بالوسائد الهوائية",
    severity: "medium",
    causes: ["Software version mismatch between modules", "Module replaced without programming", "Battery event causing configuration loss"],
    causesAr: ["عدم تطابق إصدار البرنامج بين الوحدات", "استبدال وحدة بدون برمجة", "حدث بطارية أدى لفقدان الإعداد"],
    solution: "Use Ford IDS/FDRS to reprogram and reconfigure the RCM module",
    solutionAr: "استخدام Ford IDS/FDRS لإعادة برمجة وضبط وحدة RCM",
    relatedSensors: ["Module Software"],
    affectedComponents: ["RCM", "PCM", "BCM"],
    affectedComponentsAr: ["وحدة RCM", "وحدة PCM", "وحدة BCM"],
    safeToRide: true,
    estimatedRepairCost: { min: 200, max: 1500, currency: "SAR" },
    fordSpecific: true,
  },

  "U2300": {
    code: "U2300", fullCode: "U2300",
    description: "Central Configuration",
    descriptionAr: "عطل في الإعداد المركزي للوحدات",
    system: "network", subsystem: "Central Configuration", subsystemAr: "الإعداد المركزي",
    module: "RCM", moduleAr: "وحدة التحكم بالوسائد الهوائية",
    severity: "medium",
    causes: ["Module configuration mismatch", "New module not configured", "VIN mismatch", "Battery replacement"],
    causesAr: ["عدم تطابق إعداد الوحدة", "وحدة جديدة غير مضبوطة", "عدم تطابق رقم الهيكل VIN", "تغيير البطارية"],
    solution: "Configure module using Ford IDS/FDRS, ensure VIN matches",
    solutionAr: "ضبط الوحدة باستخدام Ford IDS/FDRS، التأكد من تطابق رقم الهيكل VIN",
    relatedSensors: ["VIN", "Module Configuration"],
    affectedComponents: ["RCM", "Module Configuration Data"],
    affectedComponentsAr: ["وحدة RCM", "بيانات إعداد الوحدة"],
    safeToRide: true,
    estimatedRepairCost: { min: 200, max: 1000, currency: "SAR" },
    fordSpecific: true,
  },

  "U2300-64-28": {
    code: "U2300", subCode: "64-28", fullCode: "U2300-64-28",
    description: "Central Configuration - Configuration Error / Communication Lost",
    descriptionAr: "الإعداد المركزي - خطأ في الإعداد / الاتصال مقطوع",
    system: "network", subsystem: "Central Configuration", subsystemAr: "الإعداد المركزي",
    module: "RCM", moduleAr: "وحدة التحكم بالوسائد الهوائية",
    severity: "medium",
    causes: ["RCM not configured after replacement", "VIN programming not completed", "Battery event erased configuration"],
    causesAr: ["RCM لم يُضبط بعد الاستبدال", "برمجة VIN لم تكتمل", "حدث بطارية محا الإعداد"],
    solution: "Use Ford IDS/FDRS: 1. Run As-Built configuration. 2. Program VIN. 3. Clear codes.",
    solutionAr: "استخدام Ford IDS/FDRS: 1. تشغيل إعداد As-Built. 2. برمجة VIN. 3. مسح الأكواد.",
    relatedSensors: ["VIN", "Module Configuration"],
    affectedComponents: ["RCM"],
    affectedComponentsAr: ["وحدة RCM"],
    safeToRide: true,
    estimatedRepairCost: { min: 200, max: 1000, currency: "SAR" },
    fordSpecific: true,
  },

  "U3003": {
    code: "U3003", fullCode: "U3003",
    description: "Battery Voltage",
    descriptionAr: "عطل في جهد البطارية",
    system: "network", subsystem: "Battery Voltage", subsystemAr: "جهد البطارية",
    module: "RCM", moduleAr: "وحدة التحكم بالوسائد الهوائية",
    severity: "medium",
    causes: ["Battery voltage too low or too high", "Charging system fault", "Battery aged/weak", "Alternator fault"],
    causesAr: ["جهد البطارية منخفض أو مرتفع جداً", "عطل في نظام الشحن", "بطارية قديمة/ضعيفة", "عطل في الدينمو"],
    solution: "Test battery (should be 12.5-12.8V at rest), test charging voltage (13.5-14.5V running)",
    solutionAr: "فحص البطارية (يجب 12.5-12.8 فولت عند الراحة)، فحص جهد الشحن (13.5-14.5 فولت عند التشغيل)",
    relatedSensors: ["Battery Voltage Sensor", "Alternator Output"],
    affectedComponents: ["Battery", "Alternator", "Charging System"],
    affectedComponentsAr: ["البطارية", "الدينمو", "نظام الشحن"],
    safeToRide: true,
    estimatedRepairCost: { min: 300, max: 2000, currency: "SAR" },
  },

  "U3003-16-28": {
    code: "U3003", subCode: "16-28", fullCode: "U3003-16-28",
    description: "Battery Voltage - Low Voltage / Communication Lost",
    descriptionAr: "جهد البطارية - جهد منخفض / الاتصال مقطوع",
    system: "network", subsystem: "Battery Voltage", subsystemAr: "جهد البطارية",
    module: "RCM", moduleAr: "وحدة التحكم بالوسائد الهوائية",
    severity: "high",
    causes: ["Battery voltage dropped below 9V causing multiple communication faults", "Battery near end of life", "Alternator not charging", "Parasitic drain"],
    causesAr: ["جهد البطارية انخفض دون 9 فولت مما أسبب أعطال اتصال متعددة", "البطارية قرب نهاية عمرها", "الدينمو لا يشحن", "استنزاف كهربائي خفي"],
    solution: "1. Test battery (load test). 2. Test alternator output. 3. Check for parasitic drain. 4. Replace battery if weak. 5. Clear all codes after fix.",
    solutionAr: "1. فحص البطارية (اختبار الحمل). 2. فحص خرج الدينمو. 3. فحص الاستنزاف الكهربائي الخفي. 4. استبدال البطارية إذا ضعيفة. 5. مسح جميع الأكواد بعد الإصلاح.",
    relatedSensors: ["Battery Voltage", "Alternator Output"],
    affectedComponents: ["Battery", "Alternator", "Charging System"],
    affectedComponentsAr: ["البطارية", "الدينمو", "نظام الشحن"],
    safeToRide: true,
    estimatedRepairCost: { min: 300, max: 2000, currency: "SAR" },
    fordSpecific: true,
  },
};

// ═══════════════════════════════════════════════════════
// FORD BODY / SRS CODES
// ═══════════════════════════════════════════════════════
export const FORD_BODY_EXTENDED: Record<string, ExtendedDTCInfo> = {

  "B1182": {
    code: "B1182", fullCode: "B1182",
    description: "Tire Pressure Monitoring System",
    descriptionAr: "عطل في نظام مراقبة ضغط الإطارات (TPMS)",
    system: "body", subsystem: "TPMS", subsystemAr: "نظام مراقبة ضغط الإطارات",
    module: "BCM", moduleAr: "وحدة التحكم بالهيكل",
    severity: "low",
    causes: ["TPMS sensor battery dead", "TPMS sensor damaged", "Wrong tire pressure", "Sensor not programmed after tire change"],
    causesAr: ["بطارية حساس TPMS نافدة", "حساس TPMS تالف", "ضغط الإطار خاطئ", "الحساس لم يُبرمج بعد تغيير الإطار"],
    solution: "Check tire pressures (recommended 32-35 PSI), replace TPMS sensor if battery dead, reprogram sensors",
    solutionAr: "فحص ضغط الإطارات (الموصى به 32-35 PSI)، استبدال حساس TPMS إذا نافدة البطارية، إعادة برمجة الحساسات",
    relatedSensors: ["TPMS Sensors (x4)"],
    affectedComponents: ["TPMS Sensors", "BCM", "Instrument Cluster"],
    affectedComponentsAr: ["حساسات TPMS", "وحدة BCM", "لوحة العدادات"],
    safeToRide: true,
    estimatedRepairCost: { min: 100, max: 800, currency: "SAR" },
  },

  "B1182-AF": {
    code: "B1182", subCode: "AF", fullCode: "B1182-AF",
    description: "Tire Pressure Monitoring System - System Fault",
    descriptionAr: "نظام مراقبة ضغط الإطارات - عطل في النظام",
    system: "body", subsystem: "TPMS", subsystemAr: "نظام مراقبة ضغط الإطارات",
    module: "BCM", moduleAr: "وحدة التحكم بالهيكل",
    severity: "low",
    causes: ["One or more TPMS sensors not communicating", "TPMS sensor battery dead (typical life 5-7 years)", "Sensor damaged by road hazard", "Sensor not reprogrammed after wheel change"],
    causesAr: ["حساس TPMS واحد أو أكثر لا يتواصل", "بطارية حساس TPMS نافدة (العمر الافتراضي 5-7 سنوات)", "حساس تالف بسبب عائق طريق", "الحساس لم يُعاد برمجته بعد تغيير العجلة"],
    solution: "1. Check all 4 tire pressures. 2. Use TPMS tool to identify faulty sensor. 3. Replace dead sensor. 4. Reprogram with Ford IDS or TPMS tool.",
    solutionAr: "1. فحص ضغط الإطارات الأربعة. 2. استخدام أداة TPMS لتحديد الحساس المعطل. 3. استبدال الحساس النافد. 4. إعادة البرمجة بجهاز Ford IDS أو أداة TPMS.",
    relatedSensors: ["TPMS Sensors (x4)", "BCM"],
    affectedComponents: ["TPMS Sensors", "BCM"],
    affectedComponentsAr: ["حساسات TPMS", "وحدة BCM"],
    safeToRide: true,
    estimatedRepairCost: { min: 150, max: 800, currency: "SAR" },
    fordSpecific: true,
  },
};

// ═══════════════════════════════════════════════════════
// COMBINED EXTENDED DATABASE
// ═══════════════════════════════════════════════════════
export const ALL_EXTENDED_DTC: Record<string, ExtendedDTCInfo> = {
  ...FORD_FUEL_EXTENDED,
  ...FORD_TRANSMISSION_EXTENDED,
  ...FORD_NETWORK_EXTENDED,
  ...FORD_BODY_EXTENDED,
};

// ═══════════════════════════════════════════════════════
// FORD ECU HEADERS FOR MS-CAN ACCESS
// ═══════════════════════════════════════════════════════
export const FORD_ECU_HEADERS: Record<string, { header: string; name: string; nameAr: string; protocol: string }> = {
  PCM:     { header: "7E0", name: "PCM - Powertrain Control Module",       nameAr: "وحدة التحكم بالمحرك",        protocol: "HS-CAN" },
  TCM:     { header: "7E1", name: "TCM - Transmission Control Module",     nameAr: "وحدة التحكم بالقير",          protocol: "HS-CAN" },
  ABS:     { header: "760", name: "ABS - Anti-Lock Brake Module",          nameAr: "وحدة ABS",                    protocol: "HS-CAN" },
  RCM:     { header: "740", name: "RCM - Restraint Control Module (SRS)",  nameAr: "وحدة الوسائد الهوائية",       protocol: "MS-CAN" },
  BCM:     { header: "726", name: "BCM - Body Control Module",             nameAr: "وحدة التحكم بالهيكل",         protocol: "MS-CAN" },
  IPC:     { header: "720", name: "IPC - Instrument Panel Cluster",        nameAr: "لوحة العدادات",               protocol: "MS-CAN" },
  PSCM:    { header: "730", name: "PSCM - Power Steering Control Module",  nameAr: "وحدة التوجيه الكهربائي",      protocol: "MS-CAN" },
  HVAC:    { header: "733", name: "HVAC - Climate Control Module",         nameAr: "وحدة تكييف الهواء",           protocol: "MS-CAN" },
  TPMS:    { header: "7A0", name: "TPMS - Tire Pressure Monitor Module",   nameAr: "وحدة مراقبة ضغط الإطارات",   protocol: "MS-CAN" },
  GPSM:    { header: "7A2", name: "GPSM - Gear Position Sensor Module",    nameAr: "وحدة حساس موضع الترس",        protocol: "HS-CAN" },
  SOBDMC:  { header: "7C0", name: "SOBDMC - Secondary OBD Module C",       nameAr: "وحدة OBD الثانوية C",         protocol: "HS-CAN" },
};

// ═══════════════════════════════════════════════════════
// LOOKUP FUNCTIONS
// ═══════════════════════════════════════════════════════

/**
 * البحث عن كود في قاعدة البيانات الموسعة
 * يدعم: P008A-6C, P008A, P0702-28, U0100-28 ...
 */
export function lookupExtendedDTC(code: string): ExtendedDTCInfo | null {
  if (!code) return null;
  const normalized = code.toUpperCase().trim();

  // 1. بحث مباشر بالكود الكامل (P008A-6C)
  if (ALL_EXTENDED_DTC[normalized]) return ALL_EXTENDED_DTC[normalized];

  // 2. بحث بالكود الأساسي فقط (P008A)
  const baseCode = normalized.split("-")[0];
  if (ALL_EXTENDED_DTC[baseCode]) return ALL_EXTENDED_DTC[baseCode];

  return null;
}

/**
 * تحليل كود مع Sub-code من نص مثل "P008A-6C" أو "P0702-28"
 */
export function parseFullCode(rawCode: string): { base: string; subCode: string | null; full: string } {
  const parts = rawCode.toUpperCase().trim().split("-");
  return {
    base: parts[0],
    subCode: parts.length > 1 ? parts.slice(1).join("-") : null,
    full: rawCode.toUpperCase().trim(),
  };
}

/**
 * الحصول على وصف Sub-code بالعربي
 */
export function getSubCodeMeaning(subCode: string): string {
  return FORD_SUBCODE_MEANINGS[subCode.toUpperCase()] || `Sub-code: ${subCode}`;
}

/**
 * الحصول على معلومات ECU header لفورد
 */
export function getFordECUHeader(ecuName: string): string | null {
  const ecu = FORD_ECU_HEADERS[ecuName.toUpperCase()];
  return ecu ? ecu.header : null;
}

/**
 * الحصول على قائمة headers فورد للـ MS-CAN
 */
export function getFordMSCANHeaders(): string[] {
  return Object.values(FORD_ECU_HEADERS)
    .filter(e => e.protocol === "MS-CAN")
    .map(e => e.header);
}

/**
 * دمج نتيجة البحث من قاعدة البيانات الأساسية والموسعة
 */
export function lookupDTCCombined(code: string): {
  found: boolean;
  source: "extended" | "base" | "none";
  descriptionAr: string;
  description: string;
  severity: string;
  module?: string;
  moduleAr?: string;
  fordSpecific?: boolean;
  causesAr: string[];
  solutionAr: string;
  estimatedRepairCost?: { min: number; max: number; currency: string };
} {
  const extended = lookupExtendedDTC(code);
  if (extended) {
    return {
      found: true,
      source: "extended",
      descriptionAr: extended.descriptionAr,
      description: extended.description,
      severity: extended.severity,
      module: extended.module,
      moduleAr: extended.moduleAr,
      fordSpecific: extended.fordSpecific,
      causesAr: extended.causesAr,
      solutionAr: extended.solutionAr,
      estimatedRepairCost: extended.estimatedRepairCost,
    };
  }
  return {
    found: false,
    source: "none",
    descriptionAr: `كود عطل: ${code}`,
    description: `Fault Code: ${code}`,
    severity: "medium",
    causesAr: ["يحتاج فحص متخصص"],
    solutionAr: "مراجعة الفني المتخصص",
  };
}
