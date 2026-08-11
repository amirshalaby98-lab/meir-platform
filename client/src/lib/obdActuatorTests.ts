// ═══════════════════════════════════════════════════════════════
// OBD-II ACTUATOR TESTS / BI-DIRECTIONAL CONTROL
// اختبارات التشغيل الفعلية - تشغيل/إيقاف مكونات السيارة
// ═══════════════════════════════════════════════════════════════
// ⚠️ تحذير: هذه الاختبارات تتحكم فعلياً بمكونات السيارة
// يجب أن يكون المحرك في وضع التشغيل (ON) أو الخمول (IDLE)
// لا تستخدمها أثناء القيادة!
// ═══════════════════════════════════════════════════════════════

import type { OBDBleService } from "./obdBleService";

// ─── أنواع البيانات ───────────────────────────────────────────

export interface ActuatorTest {
  id: string;
  name: string;
  nameAr: string;
  category: ActuatorCategory;
  description: string;
  descriptionAr: string;
  command: string;         // أمر التشغيل
  stopCommand?: string;    // أمر الإيقاف (إذا مختلف)
  mode: "mode08" | "enhanced"; // Mode 08 قياسي أو Enhanced (Mode 22/2F)
  duration: number;        // مدة التشغيل بالمللي ثانية (0 = يدوي)
  requiresEngine: "running" | "off" | "any"; // حالة المحرك المطلوبة
  riskLevel: "low" | "medium" | "high"; // مستوى الخطورة
  manufacturers: string[]; // الشركات المدعومة ("all" = الكل)
}

export interface ActuatorTestResult {
  testId: string;
  success: boolean;
  response: string;
  timestamp: number;
  duration: number;
  error?: string;
}

export type ActuatorCategory = 
  | "injectors"      // البخاخات
  | "ignition"       // ملفات الإشعال
  | "fans"           // مراوح التبريد
  | "fuel_system"    // نظام الوقود
  | "emission"       // نظام الانبعاثات
  | "ac"             // نظام التكييف
  | "throttle"       // الثروتل
  | "transmission"   // ناقل الحركة
  | "electrical"     // كهربائي
  | "other";         // أخرى

// ─── قاعدة بيانات اختبارات التشغيل ──────────────────────────

export const ACTUATOR_TESTS: ActuatorTest[] = [
  // ═══════════════════════════════════════════════════════
  // البخاخات (INJECTORS)
  // ═══════════════════════════════════════════════════════
  {
    id: "inj_1", name: "Injector #1 Test", nameAr: "اختبار بخاخ 1",
    category: "injectors",
    description: "Activates injector #1 for a short pulse to verify operation",
    descriptionAr: "تشغيل البخاخ رقم 1 لنبضة قصيرة للتحقق من عمله",
    command: "0801", stopCommand: "0800", mode: "mode08",
    duration: 2000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["all"]
  },
  {
    id: "inj_2", name: "Injector #2 Test", nameAr: "اختبار بخاخ 2",
    category: "injectors",
    description: "Activates injector #2 for a short pulse",
    descriptionAr: "تشغيل البخاخ رقم 2 لنبضة قصيرة",
    command: "0802", stopCommand: "0800", mode: "mode08",
    duration: 2000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["all"]
  },
  {
    id: "inj_3", name: "Injector #3 Test", nameAr: "اختبار بخاخ 3",
    category: "injectors",
    description: "Activates injector #3 for a short pulse",
    descriptionAr: "تشغيل البخاخ رقم 3 لنبضة قصيرة",
    command: "0803", stopCommand: "0800", mode: "mode08",
    duration: 2000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["all"]
  },
  {
    id: "inj_4", name: "Injector #4 Test", nameAr: "اختبار بخاخ 4",
    category: "injectors",
    description: "Activates injector #4 for a short pulse",
    descriptionAr: "تشغيل البخاخ رقم 4 لنبضة قصيرة",
    command: "0804", stopCommand: "0800", mode: "mode08",
    duration: 2000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["all"]
  },
  {
    id: "inj_5", name: "Injector #5 Test", nameAr: "اختبار بخاخ 5",
    category: "injectors",
    description: "Activates injector #5 (6-cylinder engines)",
    descriptionAr: "تشغيل البخاخ رقم 5 (محركات 6 أسطوانات)",
    command: "0805", stopCommand: "0800", mode: "mode08",
    duration: 2000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["all"]
  },
  {
    id: "inj_6", name: "Injector #6 Test", nameAr: "اختبار بخاخ 6",
    category: "injectors",
    description: "Activates injector #6 (6-cylinder engines)",
    descriptionAr: "تشغيل البخاخ رقم 6 (محركات 6 أسطوانات)",
    command: "0806", stopCommand: "0800", mode: "mode08",
    duration: 2000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["all"]
  },
  {
    id: "inj_7", name: "Injector #7 Test", nameAr: "اختبار بخاخ 7",
    category: "injectors",
    description: "Activates injector #7 (8-cylinder engines)",
    descriptionAr: "تشغيل البخاخ رقم 7 (محركات 8 أسطوانات)",
    command: "0807", stopCommand: "0800", mode: "mode08",
    duration: 2000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["all"]
  },
  {
    id: "inj_8", name: "Injector #8 Test", nameAr: "اختبار بخاخ 8",
    category: "injectors",
    description: "Activates injector #8 (8-cylinder engines)",
    descriptionAr: "تشغيل البخاخ رقم 8 (محركات 8 أسطوانات)",
    command: "0808", stopCommand: "0800", mode: "mode08",
    duration: 2000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["all"]
  },
  {
    id: "inj_balance", name: "Injector Balance Test", nameAr: "اختبار توازن البخاخات",
    category: "injectors",
    description: "Tests all injectors sequentially to check RPM drop balance",
    descriptionAr: "اختبار جميع البخاخات بالتتابع لفحص توازن انخفاض RPM",
    command: "0809", stopCommand: "0800", mode: "mode08",
    duration: 10000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["all"]
  },

  // ═══════════════════════════════════════════════════════
  // ملفات الإشعال (IGNITION COILS)
  // ═══════════════════════════════════════════════════════
  {
    id: "coil_1", name: "Ignition Coil #1 Test", nameAr: "اختبار ملف إشعال 1",
    category: "ignition",
    description: "Tests ignition coil #1 by disabling it momentarily",
    descriptionAr: "اختبار ملف الإشعال 1 بإيقافه لحظياً ومراقبة RPM",
    command: "080A", stopCommand: "0800", mode: "mode08",
    duration: 3000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["all"]
  },
  {
    id: "coil_2", name: "Ignition Coil #2 Test", nameAr: "اختبار ملف إشعال 2",
    category: "ignition",
    description: "Tests ignition coil #2",
    descriptionAr: "اختبار ملف الإشعال 2",
    command: "080B", stopCommand: "0800", mode: "mode08",
    duration: 3000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["all"]
  },
  {
    id: "coil_3", name: "Ignition Coil #3 Test", nameAr: "اختبار ملف إشعال 3",
    category: "ignition",
    description: "Tests ignition coil #3",
    descriptionAr: "اختبار ملف الإشعال 3",
    command: "080C", stopCommand: "0800", mode: "mode08",
    duration: 3000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["all"]
  },
  {
    id: "coil_4", name: "Ignition Coil #4 Test", nameAr: "اختبار ملف إشعال 4",
    category: "ignition",
    description: "Tests ignition coil #4",
    descriptionAr: "اختبار ملف الإشعال 4",
    command: "080D", stopCommand: "0800", mode: "mode08",
    duration: 3000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["all"]
  },
  {
    id: "coil_5", name: "Ignition Coil #5 Test", nameAr: "اختبار ملف إشعال 5",
    category: "ignition",
    description: "Tests ignition coil #5 (6+ cylinder)",
    descriptionAr: "اختبار ملف الإشعال 5 (6 أسطوانات+)",
    command: "080E", stopCommand: "0800", mode: "mode08",
    duration: 3000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["all"]
  },
  {
    id: "coil_6", name: "Ignition Coil #6 Test", nameAr: "اختبار ملف إشعال 6",
    category: "ignition",
    description: "Tests ignition coil #6 (6+ cylinder)",
    descriptionAr: "اختبار ملف الإشعال 6 (6 أسطوانات+)",
    command: "080F", stopCommand: "0800", mode: "mode08",
    duration: 3000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["all"]
  },
  {
    id: "coil_7", name: "Ignition Coil #7 Test", nameAr: "اختبار ملف إشعال 7",
    category: "ignition",
    description: "Tests ignition coil #7 (8 cylinder)",
    descriptionAr: "اختبار ملف الإشعال 7 (8 أسطوانات)",
    command: "0810", stopCommand: "0800", mode: "mode08",
    duration: 3000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["all"]
  },
  {
    id: "coil_8", name: "Ignition Coil #8 Test", nameAr: "اختبار ملف إشعال 8",
    category: "ignition",
    description: "Tests ignition coil #8 (8 cylinder)",
    descriptionAr: "اختبار ملف الإشعال 8 (8 أسطوانات)",
    command: "0811", stopCommand: "0800", mode: "mode08",
    duration: 3000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["all"]
  },

  // ═══════════════════════════════════════════════════════
  // مراوح التبريد (COOLING FANS)
  // ═══════════════════════════════════════════════════════
  {
    id: "fan_low", name: "Cooling Fan Low Speed", nameAr: "مروحة التبريد - سرعة منخفضة",
    category: "fans",
    description: "Activates cooling fan at low speed",
    descriptionAr: "تشغيل مروحة التبريد على السرعة المنخفضة",
    command: "0812", stopCommand: "0800", mode: "mode08",
    duration: 5000, requiresEngine: "any", riskLevel: "low",
    manufacturers: ["all"]
  },
  {
    id: "fan_high", name: "Cooling Fan High Speed", nameAr: "مروحة التبريد - سرعة عالية",
    category: "fans",
    description: "Activates cooling fan at high speed",
    descriptionAr: "تشغيل مروحة التبريد على السرعة العالية",
    command: "0813", stopCommand: "0800", mode: "mode08",
    duration: 5000, requiresEngine: "any", riskLevel: "low",
    manufacturers: ["all"]
  },
  {
    id: "fan2_low", name: "Fan #2 Low Speed", nameAr: "مروحة 2 - سرعة منخفضة",
    category: "fans",
    description: "Activates secondary cooling fan at low speed",
    descriptionAr: "تشغيل المروحة الثانية على السرعة المنخفضة",
    command: "0814", stopCommand: "0800", mode: "mode08",
    duration: 5000, requiresEngine: "any", riskLevel: "low",
    manufacturers: ["all"]
  },
  {
    id: "fan2_high", name: "Fan #2 High Speed", nameAr: "مروحة 2 - سرعة عالية",
    category: "fans",
    description: "Activates secondary cooling fan at high speed",
    descriptionAr: "تشغيل المروحة الثانية على السرعة العالية",
    command: "0815", stopCommand: "0800", mode: "mode08",
    duration: 5000, requiresEngine: "any", riskLevel: "low",
    manufacturers: ["all"]
  },

  // ═══════════════════════════════════════════════════════
  // نظام الوقود (FUEL SYSTEM)
  // ═══════════════════════════════════════════════════════
  {
    id: "fuel_pump", name: "Fuel Pump Activation", nameAr: "تشغيل طرمبة الوقود",
    category: "fuel_system",
    description: "Activates fuel pump to verify operation and pressure build-up",
    descriptionAr: "تشغيل طرمبة الوقود للتحقق من عملها وبناء الضغط",
    command: "0816", stopCommand: "0800", mode: "mode08",
    duration: 5000, requiresEngine: "off", riskLevel: "medium",
    manufacturers: ["all"]
  },
  {
    id: "fuel_pressure_reg", name: "Fuel Pressure Regulator", nameAr: "منظم ضغط الوقود",
    category: "fuel_system",
    description: "Tests fuel pressure regulator valve",
    descriptionAr: "اختبار صمام منظم ضغط الوقود",
    command: "0817", stopCommand: "0800", mode: "mode08",
    duration: 3000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["all"]
  },

  // ═══════════════════════════════════════════════════════
  // نظام الانبعاثات (EMISSION SYSTEM)
  // ═══════════════════════════════════════════════════════
  {
    id: "egr_valve", name: "EGR Valve Test", nameAr: "اختبار صمام EGR",
    category: "emission",
    description: "Opens EGR valve to test operation - RPM should drop slightly",
    descriptionAr: "فتح صمام EGR للاختبار - يجب أن ينخفض RPM قليلاً",
    command: "0818", stopCommand: "0800", mode: "mode08",
    duration: 3000, requiresEngine: "running", riskLevel: "low",
    manufacturers: ["all"]
  },
  {
    id: "evap_purge", name: "EVAP Purge Valve", nameAr: "صمام تنقية EVAP",
    category: "emission",
    description: "Activates EVAP canister purge solenoid",
    descriptionAr: "تشغيل صمام تنقية خزان الكربون EVAP",
    command: "0819", stopCommand: "0800", mode: "mode08",
    duration: 3000, requiresEngine: "running", riskLevel: "low",
    manufacturers: ["all"]
  },
  {
    id: "evap_vent", name: "EVAP Vent Valve", nameAr: "صمام تهوية EVAP",
    category: "emission",
    description: "Closes EVAP vent valve for leak testing",
    descriptionAr: "إغلاق صمام تهوية EVAP لاختبار التسريب",
    command: "081A", stopCommand: "0800", mode: "mode08",
    duration: 5000, requiresEngine: "off", riskLevel: "low",
    manufacturers: ["all"]
  },
  {
    id: "secondary_air", name: "Secondary Air Pump", nameAr: "مضخة الهواء الثانوية",
    category: "emission",
    description: "Activates secondary air injection pump",
    descriptionAr: "تشغيل مضخة حقن الهواء الثانوية",
    command: "081B", stopCommand: "0800", mode: "mode08",
    duration: 5000, requiresEngine: "running", riskLevel: "low",
    manufacturers: ["all"]
  },
  {
    id: "catalyst_monitor", name: "Catalyst Monitor Test", nameAr: "اختبار مراقب الكاتلايزر",
    category: "emission",
    description: "Initiates catalyst efficiency monitoring test",
    descriptionAr: "بدء اختبار كفاءة الكاتلايزر",
    command: "081C", stopCommand: "0800", mode: "mode08",
    duration: 10000, requiresEngine: "running", riskLevel: "low",
    manufacturers: ["all"]
  },

  // ═══════════════════════════════════════════════════════
  // نظام التكييف (A/C SYSTEM)
  // ═══════════════════════════════════════════════════════
  {
    id: "ac_clutch", name: "A/C Compressor Clutch", nameAr: "كلتش ضاغط المكيف",
    category: "ac",
    description: "Engages A/C compressor clutch to verify operation",
    descriptionAr: "تشغيل كلتش ضاغط المكيف للتحقق من عمله",
    command: "081D", stopCommand: "0800", mode: "mode08",
    duration: 5000, requiresEngine: "running", riskLevel: "low",
    manufacturers: ["all"]
  },
  {
    id: "ac_relay", name: "A/C Relay Test", nameAr: "اختبار ريلاي المكيف",
    category: "ac",
    description: "Tests A/C relay by toggling it on/off",
    descriptionAr: "اختبار ريلاي المكيف بتشغيله وإيقافه",
    command: "081E", stopCommand: "0800", mode: "mode08",
    duration: 3000, requiresEngine: "any", riskLevel: "low",
    manufacturers: ["all"]
  },

  // ═══════════════════════════════════════════════════════
  // الثروتل (THROTTLE)
  // ═══════════════════════════════════════════════════════
  {
    id: "throttle_open", name: "Electronic Throttle Open", nameAr: "فتح الثروتل الإلكتروني",
    category: "throttle",
    description: "Commands throttle to open position - CAUTION: RPM will increase",
    descriptionAr: "أمر فتح الثروتل - تحذير: سيرتفع RPM",
    command: "081F", stopCommand: "0800", mode: "mode08",
    duration: 2000, requiresEngine: "running", riskLevel: "high",
    manufacturers: ["all"]
  },
  {
    id: "throttle_close", name: "Electronic Throttle Close", nameAr: "إغلاق الثروتل الإلكتروني",
    category: "throttle",
    description: "Commands throttle to closed position",
    descriptionAr: "أمر إغلاق الثروتل",
    command: "0820", stopCommand: "0800", mode: "mode08",
    duration: 2000, requiresEngine: "running", riskLevel: "high",
    manufacturers: ["all"]
  },
  {
    id: "idle_up", name: "Idle Speed Up", nameAr: "رفع سرعة الخمول",
    category: "throttle",
    description: "Increases idle speed by ~200 RPM",
    descriptionAr: "رفع سرعة الخمول بمقدار ~200 RPM",
    command: "0821", stopCommand: "0800", mode: "mode08",
    duration: 5000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["all"]
  },

  // ═══════════════════════════════════════════════════════
  // ناقل الحركة (TRANSMISSION)
  // ═══════════════════════════════════════════════════════
  {
    id: "tcc_solenoid", name: "TCC Solenoid Test", nameAr: "اختبار صمام TCC",
    category: "transmission",
    description: "Tests torque converter clutch solenoid",
    descriptionAr: "اختبار صمام كلتش محول العزم",
    command: "0822", stopCommand: "0800", mode: "mode08",
    duration: 3000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["all"]
  },
  {
    id: "shift_solenoid_a", name: "Shift Solenoid A", nameAr: "صمام النقل A",
    category: "transmission",
    description: "Tests transmission shift solenoid A",
    descriptionAr: "اختبار صمام نقل الحركة A",
    command: "0823", stopCommand: "0800", mode: "mode08",
    duration: 3000, requiresEngine: "running", riskLevel: "high",
    manufacturers: ["all"]
  },
  {
    id: "shift_solenoid_b", name: "Shift Solenoid B", nameAr: "صمام النقل B",
    category: "transmission",
    description: "Tests transmission shift solenoid B",
    descriptionAr: "اختبار صمام نقل الحركة B",
    command: "0824", stopCommand: "0800", mode: "mode08",
    duration: 3000, requiresEngine: "running", riskLevel: "high",
    manufacturers: ["all"]
  },

  // ═══════════════════════════════════════════════════════
  // كهربائي (ELECTRICAL)
  // ═══════════════════════════════════════════════════════
  {
    id: "mil_lamp", name: "MIL Lamp Test", nameAr: "اختبار لمبة المحرك",
    category: "electrical",
    description: "Turns on the MIL (Check Engine) lamp to verify bulb",
    descriptionAr: "تشغيل لمبة فحص المحرك للتحقق من اللمبة",
    command: "0825", stopCommand: "0800", mode: "mode08",
    duration: 3000, requiresEngine: "any", riskLevel: "low",
    manufacturers: ["all"]
  },
  {
    id: "alternator_load", name: "Alternator Load Test", nameAr: "اختبار حمل الدينمو",
    category: "electrical",
    description: "Increases alternator field duty cycle to test charging",
    descriptionAr: "زيادة حمل الدينمو لاختبار الشحن",
    command: "0826", stopCommand: "0800", mode: "mode08",
    duration: 5000, requiresEngine: "running", riskLevel: "low",
    manufacturers: ["all"]
  },

  // ═══════════════════════════════════════════════════════
  // اختبارات خاصة بفورد (FORD-SPECIFIC)
  // ═══════════════════════════════════════════════════════
  {
    id: "ford_inj_buzz", name: "Ford Injector Buzz Test", nameAr: "فورد - اختبار طنين البخاخات",
    category: "injectors",
    description: "Ford-specific injector buzz test using Mode 22",
    descriptionAr: "اختبار طنين البخاخات الخاص بفورد - يشغل كل بخاخ بالتتابع",
    command: "2F0101", stopCommand: "2F0100", mode: "enhanced",
    duration: 5000, requiresEngine: "off", riskLevel: "medium",
    manufacturers: ["Ford", "Lincoln", "Mercury"]
  },
  {
    id: "ford_fan_low", name: "Ford Fan Low", nameAr: "فورد - مروحة منخفضة",
    category: "fans",
    description: "Ford-specific low speed fan activation via UDS",
    descriptionAr: "تشغيل مروحة فورد على السرعة المنخفضة عبر UDS",
    command: "2F010A01", stopCommand: "2F010A00", mode: "enhanced",
    duration: 10000, requiresEngine: "any", riskLevel: "low",
    manufacturers: ["Ford", "Lincoln", "Mercury"]
  },
  {
    id: "ford_fan_high", name: "Ford Fan High", nameAr: "فورد - مروحة عالية",
    category: "fans",
    description: "Ford-specific high speed fan activation via UDS",
    descriptionAr: "تشغيل مروحة فورد على السرعة العالية عبر UDS",
    command: "2F010B01", stopCommand: "2F010B00", mode: "enhanced",
    duration: 10000, requiresEngine: "any", riskLevel: "low",
    manufacturers: ["Ford", "Lincoln", "Mercury"]
  },
  {
    id: "ford_fuel_pump", name: "Ford Fuel Pump", nameAr: "فورد - طرمبة الوقود",
    category: "fuel_system",
    description: "Ford-specific fuel pump activation",
    descriptionAr: "تشغيل طرمبة الوقود الخاصة بفورد",
    command: "2F010201", stopCommand: "2F010200", mode: "enhanced",
    duration: 5000, requiresEngine: "off", riskLevel: "medium",
    manufacturers: ["Ford", "Lincoln", "Mercury"]
  },
  {
    id: "ford_egr", name: "Ford EGR Test", nameAr: "فورد - اختبار EGR",
    category: "emission",
    description: "Ford-specific EGR valve test",
    descriptionAr: "اختبار صمام EGR الخاص بفورد",
    command: "2F010301", stopCommand: "2F010300", mode: "enhanced",
    duration: 5000, requiresEngine: "running", riskLevel: "low",
    manufacturers: ["Ford", "Lincoln", "Mercury"]
  },
  {
    id: "ford_throttle", name: "Ford Throttle Actuator", nameAr: "فورد - محرك الثروتل",
    category: "throttle",
    description: "Ford electronic throttle body actuator test",
    descriptionAr: "اختبار محرك الثروتل الإلكتروني لفورد",
    command: "2F010401", stopCommand: "2F010400", mode: "enhanced",
    duration: 3000, requiresEngine: "running", riskLevel: "high",
    manufacturers: ["Ford", "Lincoln", "Mercury"]
  },
  {
    id: "ford_ac_clutch", name: "Ford A/C Clutch", nameAr: "فورد - كلتش المكيف",
    category: "ac",
    description: "Ford A/C compressor clutch engagement",
    descriptionAr: "تشغيل كلتش ضاغط مكيف فورد",
    command: "2F010501", stopCommand: "2F010500", mode: "enhanced",
    duration: 5000, requiresEngine: "running", riskLevel: "low",
    manufacturers: ["Ford", "Lincoln", "Mercury"]
  },

  // ═══════════════════════════════════════════════════════
  // اختبارات خاصة بتويوتا (TOYOTA-SPECIFIC)
  // ═══════════════════════════════════════════════════════
  {
    id: "toyota_inj_test", name: "Toyota Injector Test", nameAr: "تويوتا - اختبار البخاخات",
    category: "injectors",
    description: "Toyota-specific injector volume test via Mode 2F",
    descriptionAr: "اختبار حجم البخاخات الخاص بتويوتا",
    command: "2F010601", stopCommand: "2F010600", mode: "enhanced",
    duration: 5000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["Toyota", "Lexus"]
  },
  {
    id: "toyota_fan", name: "Toyota Cooling Fan", nameAr: "تويوتا - مروحة التبريد",
    category: "fans",
    description: "Toyota cooling fan activation via Techstream protocol",
    descriptionAr: "تشغيل مروحة تبريد تويوتا عبر بروتوكول Techstream",
    command: "2F020101", stopCommand: "2F020100", mode: "enhanced",
    duration: 10000, requiresEngine: "any", riskLevel: "low",
    manufacturers: ["Toyota", "Lexus"]
  },
  {
    id: "toyota_vvt", name: "Toyota VVT-i Test", nameAr: "تويوتا - اختبار VVT-i",
    category: "other",
    description: "Tests Variable Valve Timing solenoid",
    descriptionAr: "اختبار صمام توقيت الصمامات المتغير VVT-i",
    command: "2F020201", stopCommand: "2F020200", mode: "enhanced",
    duration: 3000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["Toyota", "Lexus"]
  },
  {
    id: "toyota_evap", name: "Toyota EVAP VSV", nameAr: "تويوتا - صمام EVAP",
    category: "emission",
    description: "Toyota EVAP vacuum switching valve test",
    descriptionAr: "اختبار صمام التحويل الفراغي EVAP لتويوتا",
    command: "2F020301", stopCommand: "2F020300", mode: "enhanced",
    duration: 5000, requiresEngine: "running", riskLevel: "low",
    manufacturers: ["Toyota", "Lexus"]
  },

  // ═══════════════════════════════════════════════════════
  // اختبارات خاصة بـ GM (GM-SPECIFIC)
  // ═══════════════════════════════════════════════════════
  {
    id: "gm_inj_test", name: "GM Injector Flow Test", nameAr: "GM - اختبار تدفق البخاخات",
    category: "injectors",
    description: "GM-specific injector flow balance test",
    descriptionAr: "اختبار توازن تدفق البخاخات لـ GM",
    command: "2F030101", stopCommand: "2F030100", mode: "enhanced",
    duration: 5000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["Chevrolet", "GMC", "Cadillac", "Buick"]
  },
  {
    id: "gm_fan_1", name: "GM Fan #1", nameAr: "GM - مروحة 1",
    category: "fans",
    description: "GM cooling fan #1 activation",
    descriptionAr: "تشغيل مروحة التبريد 1 لـ GM",
    command: "2F030201", stopCommand: "2F030200", mode: "enhanced",
    duration: 10000, requiresEngine: "any", riskLevel: "low",
    manufacturers: ["Chevrolet", "GMC", "Cadillac", "Buick"]
  },
  {
    id: "gm_fan_2", name: "GM Fan #2", nameAr: "GM - مروحة 2",
    category: "fans",
    description: "GM cooling fan #2 activation",
    descriptionAr: "تشغيل مروحة التبريد 2 لـ GM",
    command: "2F030301", stopCommand: "2F030300", mode: "enhanced",
    duration: 10000, requiresEngine: "any", riskLevel: "low",
    manufacturers: ["Chevrolet", "GMC", "Cadillac", "Buick"]
  },
  {
    id: "gm_afm_test", name: "GM AFM/DOD Test", nameAr: "GM - اختبار AFM",
    category: "other",
    description: "Tests Active Fuel Management solenoids (cylinder deactivation)",
    descriptionAr: "اختبار صمامات إدارة الوقود النشطة (إيقاف الأسطوانات)",
    command: "2F030401", stopCommand: "2F030400", mode: "enhanced",
    duration: 5000, requiresEngine: "running", riskLevel: "high",
    manufacturers: ["Chevrolet", "GMC", "Cadillac"]
  },
  {
    id: "gm_evap", name: "GM EVAP Purge", nameAr: "GM - صمام EVAP",
    category: "emission",
    description: "GM EVAP purge solenoid test",
    descriptionAr: "اختبار صمام تنقية EVAP لـ GM",
    command: "2F030501", stopCommand: "2F030500", mode: "enhanced",
    duration: 5000, requiresEngine: "running", riskLevel: "low",
    manufacturers: ["Chevrolet", "GMC", "Cadillac", "Buick"]
  },

  // ═══════════════════════════════════════════════════════
  // اختبارات خاصة بهيونداي/كيا (HYUNDAI/KIA)
  // ═══════════════════════════════════════════════════════
  {
    id: "hyundai_inj", name: "Hyundai/Kia Injector Test", nameAr: "هيونداي/كيا - اختبار البخاخات",
    category: "injectors",
    description: "Hyundai/Kia GDS-style injector test",
    descriptionAr: "اختبار البخاخات بأسلوب GDS لهيونداي/كيا",
    command: "2F040101", stopCommand: "2F040100", mode: "enhanced",
    duration: 5000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["Hyundai", "Kia", "Genesis"]
  },
  {
    id: "hyundai_fan", name: "Hyundai/Kia Fan Test", nameAr: "هيونداي/كيا - مروحة التبريد",
    category: "fans",
    description: "Hyundai/Kia cooling fan activation",
    descriptionAr: "تشغيل مروحة تبريد هيونداي/كيا",
    command: "2F040201", stopCommand: "2F040200", mode: "enhanced",
    duration: 10000, requiresEngine: "any", riskLevel: "low",
    manufacturers: ["Hyundai", "Kia", "Genesis"]
  },
  {
    id: "hyundai_egr", name: "Hyundai/Kia EGR", nameAr: "هيونداي/كيا - صمام EGR",
    category: "emission",
    description: "Hyundai/Kia EGR valve test",
    descriptionAr: "اختبار صمام EGR لهيونداي/كيا",
    command: "2F040301", stopCommand: "2F040300", mode: "enhanced",
    duration: 5000, requiresEngine: "running", riskLevel: "low",
    manufacturers: ["Hyundai", "Kia", "Genesis"]
  },
  {
    id: "hyundai_vgt", name: "Hyundai VGT Turbo", nameAr: "هيونداي - توربو VGT",
    category: "other",
    description: "Tests Variable Geometry Turbo actuator (diesel)",
    descriptionAr: "اختبار محرك التوربو المتغير الهندسة (ديزل)",
    command: "2F040401", stopCommand: "2F040400", mode: "enhanced",
    duration: 3000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["Hyundai", "Kia"]
  },

  // ═══════════════════════════════════════════════════════
  // اختبارات خاصة بنيسان (NISSAN)
  // ═══════════════════════════════════════════════════════
  {
    id: "nissan_inj", name: "Nissan Injector Test", nameAr: "نيسان - اختبار البخاخات",
    category: "injectors",
    description: "Nissan Consult-style injector test",
    descriptionAr: "اختبار البخاخات بأسلوب Consult لنيسان",
    command: "2F050101", stopCommand: "2F050100", mode: "enhanced",
    duration: 5000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["Nissan", "Infiniti"]
  },
  {
    id: "nissan_fan", name: "Nissan Fan Test", nameAr: "نيسان - مروحة التبريد",
    category: "fans",
    description: "Nissan cooling fan activation",
    descriptionAr: "تشغيل مروحة تبريد نيسان",
    command: "2F050201", stopCommand: "2F050200", mode: "enhanced",
    duration: 10000, requiresEngine: "any", riskLevel: "low",
    manufacturers: ["Nissan", "Infiniti"]
  },
  {
    id: "nissan_vvt", name: "Nissan CVTC Test", nameAr: "نيسان - اختبار CVTC",
    category: "other",
    description: "Tests Continuously Variable Timing Control solenoid",
    descriptionAr: "اختبار صمام التحكم المستمر بالتوقيت CVTC",
    command: "2F050301", stopCommand: "2F050300", mode: "enhanced",
    duration: 3000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["Nissan", "Infiniti"]
  },

  // ═══════════════════════════════════════════════════════
  // اختبارات خاصة بـ BMW
  // ═══════════════════════════════════════════════════════
  {
    id: "bmw_inj", name: "BMW Injector Test", nameAr: "BMW - اختبار البخاخات",
    category: "injectors",
    description: "BMW ISTA-style injector quantity test",
    descriptionAr: "اختبار كمية البخاخات بأسلوب ISTA لـ BMW",
    command: "2F060101", stopCommand: "2F060100", mode: "enhanced",
    duration: 5000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["BMW", "Mini"]
  },
  {
    id: "bmw_fan", name: "BMW Electric Fan", nameAr: "BMW - مروحة كهربائية",
    category: "fans",
    description: "BMW electric cooling fan activation",
    descriptionAr: "تشغيل مروحة التبريد الكهربائية لـ BMW",
    command: "2F060201", stopCommand: "2F060200", mode: "enhanced",
    duration: 10000, requiresEngine: "any", riskLevel: "low",
    manufacturers: ["BMW", "Mini"]
  },
  {
    id: "bmw_vanos", name: "BMW VANOS Test", nameAr: "BMW - اختبار VANOS",
    category: "other",
    description: "Tests BMW VANOS (Variable Valve Timing) solenoids",
    descriptionAr: "اختبار صمامات VANOS (توقيت الصمامات المتغير) لـ BMW",
    command: "2F060301", stopCommand: "2F060300", mode: "enhanced",
    duration: 3000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["BMW", "Mini"]
  },
  {
    id: "bmw_valvetronic", name: "BMW Valvetronic", nameAr: "BMW - Valvetronic",
    category: "other",
    description: "Tests BMW Valvetronic motor (variable valve lift)",
    descriptionAr: "اختبار محرك Valvetronic (رفع الصمامات المتغير)",
    command: "2F060401", stopCommand: "2F060400", mode: "enhanced",
    duration: 3000, requiresEngine: "running", riskLevel: "high",
    manufacturers: ["BMW"]
  },

  // ═══════════════════════════════════════════════════════
  // اختبارات خاصة بمرسيدس (MERCEDES)
  // ═══════════════════════════════════════════════════════
  {
    id: "merc_inj", name: "Mercedes Injector Test", nameAr: "مرسيدس - اختبار البخاخات",
    category: "injectors",
    description: "Mercedes Xentry-style injector test",
    descriptionAr: "اختبار البخاخات بأسلوب Xentry لمرسيدس",
    command: "2F070101", stopCommand: "2F070100", mode: "enhanced",
    duration: 5000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["Mercedes-Benz", "Mercedes"]
  },
  {
    id: "merc_fan", name: "Mercedes Fan Test", nameAr: "مرسيدس - مروحة التبريد",
    category: "fans",
    description: "Mercedes cooling fan activation",
    descriptionAr: "تشغيل مروحة تبريد مرسيدس",
    command: "2F070201", stopCommand: "2F070200", mode: "enhanced",
    duration: 10000, requiresEngine: "any", riskLevel: "low",
    manufacturers: ["Mercedes-Benz", "Mercedes"]
  },
  {
    id: "merc_turbo", name: "Mercedes Turbo Actuator", nameAr: "مرسيدس - محرك التوربو",
    category: "other",
    description: "Tests Mercedes turbo wastegate actuator",
    descriptionAr: "اختبار محرك صمام التوربو لمرسيدس",
    command: "2F070301", stopCommand: "2F070300", mode: "enhanced",
    duration: 3000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["Mercedes-Benz", "Mercedes"]
  },
  {
    id: "merc_glow_plug", name: "Mercedes Glow Plugs", nameAr: "مرسيدس - شمعات التسخين",
    category: "electrical",
    description: "Tests diesel glow plugs (CDI engines)",
    descriptionAr: "اختبار شمعات التسخين (محركات CDI ديزل)",
    command: "2F070401", stopCommand: "2F070400", mode: "enhanced",
    duration: 5000, requiresEngine: "off", riskLevel: "low",
    manufacturers: ["Mercedes-Benz", "Mercedes"]
  },

  // ═══════════════════════════════════════════════════════
  // اختبارات خاصة بـ VW/Audi (VAG)
  // ═══════════════════════════════════════════════════════
  {
    id: "vag_inj", name: "VW/Audi Injector Test", nameAr: "VW/Audi - اختبار البخاخات",
    category: "injectors",
    description: "VAG VCDS-style injector test",
    descriptionAr: "اختبار البخاخات بأسلوب VCDS لـ VW/Audi",
    command: "2F080101", stopCommand: "2F080100", mode: "enhanced",
    duration: 5000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["Volkswagen", "VW", "Audi", "Skoda", "SEAT"]
  },
  {
    id: "vag_fan", name: "VW/Audi Fan Test", nameAr: "VW/Audi - مروحة التبريد",
    category: "fans",
    description: "VAG cooling fan activation",
    descriptionAr: "تشغيل مروحة تبريد VW/Audi",
    command: "2F080201", stopCommand: "2F080200", mode: "enhanced",
    duration: 10000, requiresEngine: "any", riskLevel: "low",
    manufacturers: ["Volkswagen", "VW", "Audi", "Skoda", "SEAT"]
  },
  {
    id: "vag_dsg", name: "VW/Audi DSG Clutch", nameAr: "VW/Audi - كلتش DSG",
    category: "transmission",
    description: "Tests DSG dual-clutch engagement",
    descriptionAr: "اختبار كلتش DSG المزدوج",
    command: "2F080301", stopCommand: "2F080300", mode: "enhanced",
    duration: 3000, requiresEngine: "running", riskLevel: "high",
    manufacturers: ["Volkswagen", "VW", "Audi", "Skoda", "SEAT"]
  },
  {
    id: "vag_turbo", name: "VW/Audi Turbo Wastegate", nameAr: "VW/Audi - صمام التوربو",
    category: "other",
    description: "Tests turbo wastegate actuator",
    descriptionAr: "اختبار محرك صمام التوربو",
    command: "2F080401", stopCommand: "2F080400", mode: "enhanced",
    duration: 3000, requiresEngine: "running", riskLevel: "medium",
    manufacturers: ["Volkswagen", "VW", "Audi", "Skoda", "SEAT"]
  },
];

// ─── فئات الاختبارات ──────────────────────────────────────────

export const ACTUATOR_CATEGORIES: Record<ActuatorCategory, { name: string; nameAr: string; icon: string; color: string }> = {
  injectors: { name: "Injectors", nameAr: "البخاخات", icon: "💉", color: "#ef4444" },
  ignition: { name: "Ignition Coils", nameAr: "ملفات الإشعال", icon: "⚡", color: "#f59e0b" },
  fans: { name: "Cooling Fans", nameAr: "مراوح التبريد", icon: "🌀", color: "#06b6d4" },
  fuel_system: { name: "Fuel System", nameAr: "نظام الوقود", icon: "⛽", color: "#10b981" },
  emission: { name: "Emission", nameAr: "الانبعاثات", icon: "🌿", color: "#22c55e" },
  ac: { name: "A/C System", nameAr: "التكييف", icon: "❄️", color: "#3b82f6" },
  throttle: { name: "Throttle", nameAr: "الثروتل", icon: "🎚️", color: "#8b5cf6" },
  transmission: { name: "Transmission", nameAr: "ناقل الحركة", icon: "⚙️", color: "#6366f1" },
  electrical: { name: "Electrical", nameAr: "كهربائي", icon: "🔌", color: "#eab308" },
  other: { name: "Other", nameAr: "أخرى", icon: "🔧", color: "#64748b" },
};

// ─── دوال مساعدة ──────────────────────────────────────────────

/**
 * الحصول على اختبارات التشغيل المتاحة لشركة معينة
 */
export function getActuatorTestsForManufacturer(manufacturer: string): ActuatorTest[] {
  if (!manufacturer) return ACTUATOR_TESTS.filter(t => t.manufacturers.includes("all"));
  
  const normalizedMake = manufacturer.toLowerCase();
  return ACTUATOR_TESTS.filter(test => {
    if (test.manufacturers.includes("all")) return true;
    return test.manufacturers.some(m => m.toLowerCase() === normalizedMake);
  });
}

/**
 * الحصول على اختبارات فئة معينة
 */
export function getTestsByCategory(category: ActuatorCategory, manufacturer?: string): ActuatorTest[] {
  const tests = manufacturer ? getActuatorTestsForManufacturer(manufacturer) : ACTUATOR_TESTS;
  return tests.filter(t => t.category === category);
}

/**
 * تنفيذ اختبار تشغيل
 */
export async function runActuatorTest(
  service: OBDBleService,
  test: ActuatorTest
): Promise<ActuatorTestResult> {
  const startTime = Date.now();
  
  try {
    let response: string;
    
    if (test.mode === "mode08") {
      // استخدام Mode 08 القياسي
      const result = await (service as any).requestControlOperation(test.command.replace("08", ""));
      response = result.response;
      
      if (!result.supported) {
        return {
          testId: test.id,
          success: false,
          response,
          timestamp: startTime,
          duration: Date.now() - startTime,
          error: "الاختبار غير مدعوم في هذه السيارة"
        };
      }
    } else {
      // Enhanced mode (UDS - Mode 2F)
      response = await (service as any).sendCommand(test.command, 5000);
      const cleaned = response.replace(/[\s\r\n]/g, "");
      
      if (cleaned.includes("NODATA") || cleaned.includes("ERROR") || cleaned.includes("7F")) {
        return {
          testId: test.id,
          success: false,
          response: cleaned,
          timestamp: startTime,
          duration: Date.now() - startTime,
          error: cleaned.includes("7F") ? "الاختبار مرفوض من ECU - قد يحتاج وضع خاص" : "الاختبار غير مدعوم"
        };
      }
    }

    // إيقاف تلقائي بعد المدة المحددة
    if (test.duration > 0 && test.stopCommand) {
      await new Promise(resolve => setTimeout(resolve, test.duration));
      await (service as any).sendCommand(test.stopCommand, 3000);
    }

    return {
      testId: test.id,
      success: true,
      response,
      timestamp: startTime,
      duration: Date.now() - startTime,
    };
  } catch (e: any) {
    // محاولة إيقاف في حالة الخطأ
    if (test.stopCommand) {
      try { await (service as any).sendCommand(test.stopCommand, 2000); } catch {}
    }
    
    return {
      testId: test.id,
      success: false,
      response: "",
      timestamp: startTime,
      duration: Date.now() - startTime,
      error: e.message || "خطأ غير متوقع"
    };
  }
}

/**
 * إيقاف اختبار تشغيل يدوياً
 */
export async function stopActuatorTest(
  service: OBDBleService,
  test: ActuatorTest
): Promise<boolean> {
  try {
    const cmd = test.stopCommand || "0800";
    await (service as any).sendCommand(cmd, 3000);
    return true;
  } catch {
    return false;
  }
}

/**
 * الحصول على عدد الاختبارات حسب الشركة
 */
export function getTestCountByManufacturer(manufacturer: string): number {
  return getActuatorTestsForManufacturer(manufacturer).length;
}

/**
 * الحصول على جميع الفئات المتاحة لشركة معينة
 */
export function getAvailableCategories(manufacturer?: string): ActuatorCategory[] {
  const tests = manufacturer ? getActuatorTestsForManufacturer(manufacturer) : ACTUATOR_TESTS;
  const categories = new Set(tests.map(t => t.category));
  return Array.from(categories) as ActuatorCategory[];
}
