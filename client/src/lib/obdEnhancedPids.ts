/**
 * OBD-II Enhanced/Manufacturer-Specific PIDs (Mode 22)
 * ═══════════════════════════════════════════════════════
 * Supports: Toyota, GM/Chevrolet, Hyundai/Kia, Nissan, BMW, Mercedes-Benz
 * 
 * Mode 22 (Enhanced Diagnostics) uses DIDs (Data Identifiers)
 * Request: 22 [DID_High] [DID_Low]
 * Response: 62 [DID_High] [DID_Low] [Data...]
 * 
 * @version 1.0.0
 */

export interface EnhancedPIDDefinition {
  name: string;
  nameAr: string;
  formula: (a: number, b?: number, c?: number, d?: number) => number;
  unit: string;
  bytes: number;
  category: string;
}

export interface ManufacturerPIDSet {
  name: string;
  nameAr: string;
  pids: Record<string, EnhancedPIDDefinition>;
}

// ═══════════════════════════════════════════════════════
// TOYOTA / LEXUS Enhanced PIDs
// ═══════════════════════════════════════════════════════

export const TOYOTA_PIDS: ManufacturerPIDSet = {
  name: "Toyota/Lexus",
  nameAr: "تويوتا/لكزس",
  pids: {
    // Engine
    "221001": { name: "Injector Correction Cyl 1", nameAr: "تصحيح حاقن أسطوانة 1", formula: (a) => ((a - 128) * 100) / 128, unit: "%", bytes: 1, category: "engine" },
    "221002": { name: "Injector Correction Cyl 2", nameAr: "تصحيح حاقن أسطوانة 2", formula: (a) => ((a - 128) * 100) / 128, unit: "%", bytes: 1, category: "engine" },
    "221003": { name: "Injector Correction Cyl 3", nameAr: "تصحيح حاقن أسطوانة 3", formula: (a) => ((a - 128) * 100) / 128, unit: "%", bytes: 1, category: "engine" },
    "221004": { name: "Injector Correction Cyl 4", nameAr: "تصحيح حاقن أسطوانة 4", formula: (a) => ((a - 128) * 100) / 128, unit: "%", bytes: 1, category: "engine" },
    "221005": { name: "Ignition Timing Cyl 1", nameAr: "توقيت إشعال أسطوانة 1", formula: (a) => (a / 2) - 64, unit: "°", bytes: 1, category: "engine" },
    "221006": { name: "Ignition Timing Cyl 2", nameAr: "توقيت إشعال أسطوانة 2", formula: (a) => (a / 2) - 64, unit: "°", bytes: 1, category: "engine" },
    "221007": { name: "Ignition Timing Cyl 3", nameAr: "توقيت إشعال أسطوانة 3", formula: (a) => (a / 2) - 64, unit: "°", bytes: 1, category: "engine" },
    "221008": { name: "Ignition Timing Cyl 4", nameAr: "توقيت إشعال أسطوانة 4", formula: (a) => (a / 2) - 64, unit: "°", bytes: 1, category: "engine" },
    "221009": { name: "VVT-i Intake Cam Angle", nameAr: "زاوية كامشافت السحب VVT-i", formula: (a) => a - 40, unit: "°CA", bytes: 1, category: "engine" },
    "22100A": { name: "VVT-i Exhaust Cam Angle", nameAr: "زاوية كامشافت العادم VVT-i", formula: (a) => a - 40, unit: "°CA", bytes: 1, category: "engine" },
    "22100B": { name: "Knock Sensor Value", nameAr: "قيمة حساس الطرق", formula: (a) => a * 0.02, unit: "V", bytes: 1, category: "engine" },
    "22100C": { name: "Target A/F Ratio", nameAr: "نسبة هواء/وقود المطلوبة", formula: (a, b) => ((a * 256) + (b || 0)) * 0.0001, unit: "λ", bytes: 2, category: "engine" },
    "22100D": { name: "Actual A/F Ratio", nameAr: "نسبة هواء/وقود الفعلية", formula: (a, b) => ((a * 256) + (b || 0)) * 0.0001, unit: "λ", bytes: 2, category: "engine" },
    // Transmission
    "222001": { name: "ATF Temperature", nameAr: "حرارة زيت القير", formula: (a) => a - 40, unit: "°C", bytes: 1, category: "transmission" },
    "222002": { name: "Torque Converter Slip", nameAr: "انزلاق محول العزم", formula: (a, b) => ((a * 256) + (b || 0)) - 32768, unit: "rpm", bytes: 2, category: "transmission" },
    "222003": { name: "Current Gear", nameAr: "الترس الحالي", formula: (a) => a, unit: "", bytes: 1, category: "transmission" },
    "222004": { name: "Line Pressure", nameAr: "ضغط الخط", formula: (a, b) => ((a * 256) + (b || 0)) * 0.1, unit: "kPa", bytes: 2, category: "transmission" },
    "222005": { name: "Lock-up Duty Cycle", nameAr: "دورة عمل القفل", formula: (a) => (a * 100) / 255, unit: "%", bytes: 1, category: "transmission" },
    // Hybrid (Prius, Camry Hybrid)
    "223001": { name: "HV Battery SOC", nameAr: "شحن بطارية الهايبرد", formula: (a) => (a * 100) / 255, unit: "%", bytes: 1, category: "hybrid" },
    "223002": { name: "HV Battery Voltage", nameAr: "جهد بطارية الهايبرد", formula: (a, b) => ((a * 256) + (b || 0)) * 0.1, unit: "V", bytes: 2, category: "hybrid" },
    "223003": { name: "HV Battery Current", nameAr: "تيار بطارية الهايبرد", formula: (a, b) => (((a * 256) + (b || 0)) - 32768) * 0.01, unit: "A", bytes: 2, category: "hybrid" },
    "223004": { name: "HV Battery Temp", nameAr: "حرارة بطارية الهايبرد", formula: (a) => a - 40, unit: "°C", bytes: 1, category: "hybrid" },
    "223005": { name: "MG1 Motor Speed", nameAr: "سرعة المحرك الكهربائي MG1", formula: (a, b) => ((a * 256) + (b || 0)) - 32768, unit: "rpm", bytes: 2, category: "hybrid" },
    "223006": { name: "MG2 Motor Speed", nameAr: "سرعة المحرك الكهربائي MG2", formula: (a, b) => ((a * 256) + (b || 0)) - 32768, unit: "rpm", bytes: 2, category: "hybrid" },
    "223007": { name: "MG1 Torque", nameAr: "عزم المحرك الكهربائي MG1", formula: (a, b) => (((a * 256) + (b || 0)) - 32768) * 0.1, unit: "Nm", bytes: 2, category: "hybrid" },
    "223008": { name: "MG2 Torque", nameAr: "عزم المحرك الكهربائي MG2", formula: (a, b) => (((a * 256) + (b || 0)) - 32768) * 0.1, unit: "Nm", bytes: 2, category: "hybrid" },
    // D-4S Direct Injection
    "224001": { name: "Fuel Rail Pressure (DI)", nameAr: "ضغط قضيب الوقود (حقن مباشر)", formula: (a, b) => ((a * 256) + (b || 0)) * 10, unit: "kPa", bytes: 2, category: "engine" },
    "224002": { name: "High Pressure Pump Duty", nameAr: "دورة عمل مضخة الضغط العالي", formula: (a) => (a * 100) / 255, unit: "%", bytes: 1, category: "engine" },
    "224003": { name: "Port Injector PW", nameAr: "عرض نبضة حاقن المنفذ", formula: (a, b) => ((a * 256) + (b || 0)) * 0.004, unit: "ms", bytes: 2, category: "engine" },
    "224004": { name: "Direct Injector PW", nameAr: "عرض نبضة الحقن المباشر", formula: (a, b) => ((a * 256) + (b || 0)) * 0.004, unit: "ms", bytes: 2, category: "engine" },
  },
};

// ═══════════════════════════════════════════════════════
// GM / CHEVROLET / GMC Enhanced PIDs
// ═══════════════════════════════════════════════════════

export const GM_PIDS: ManufacturerPIDSet = {
  name: "GM/Chevrolet/GMC",
  nameAr: "جنرال موتورز/شيفروليه/جي ام سي",
  pids: {
    // Engine - AFM/DOD (Active Fuel Management)
    "221001": { name: "AFM Mode Status", nameAr: "حالة وضع AFM", formula: (a) => a, unit: "", bytes: 1, category: "engine" },
    "221002": { name: "AFM Lifter Oil Pressure", nameAr: "ضغط زيت رافعات AFM", formula: (a, b) => ((a * 256) + (b || 0)) * 0.1, unit: "kPa", bytes: 2, category: "engine" },
    "221003": { name: "Knock Retard Cyl 1", nameAr: "تأخير طرق أسطوانة 1", formula: (a) => a * 0.352, unit: "°", bytes: 1, category: "engine" },
    "221004": { name: "Knock Retard Cyl 2", nameAr: "تأخير طرق أسطوانة 2", formula: (a) => a * 0.352, unit: "°", bytes: 1, category: "engine" },
    "221005": { name: "Knock Retard Cyl 3", nameAr: "تأخير طرق أسطوانة 3", formula: (a) => a * 0.352, unit: "°", bytes: 1, category: "engine" },
    "221006": { name: "Knock Retard Cyl 4", nameAr: "تأخير طرق أسطوانة 4", formula: (a) => a * 0.352, unit: "°", bytes: 1, category: "engine" },
    "221007": { name: "Knock Retard Cyl 5", nameAr: "تأخير طرق أسطوانة 5", formula: (a) => a * 0.352, unit: "°", bytes: 1, category: "engine" },
    "221008": { name: "Knock Retard Cyl 6", nameAr: "تأخير طرق أسطوانة 6", formula: (a) => a * 0.352, unit: "°", bytes: 1, category: "engine" },
    "221009": { name: "Knock Retard Cyl 7", nameAr: "تأخير طرق أسطوانة 7", formula: (a) => a * 0.352, unit: "°", bytes: 1, category: "engine" },
    "22100A": { name: "Knock Retard Cyl 8", nameAr: "تأخير طرق أسطوانة 8", formula: (a) => a * 0.352, unit: "°", bytes: 1, category: "engine" },
    "22100B": { name: "Desired Idle Speed", nameAr: "سرعة الخمول المطلوبة", formula: (a, b) => ((a * 256) + (b || 0)) / 4, unit: "rpm", bytes: 2, category: "engine" },
    "22100C": { name: "Misfire Count Cyl 1", nameAr: "عدد اختلالات أسطوانة 1", formula: (a) => a, unit: "", bytes: 1, category: "engine" },
    "22100D": { name: "Misfire Count Cyl 2", nameAr: "عدد اختلالات أسطوانة 2", formula: (a) => a, unit: "", bytes: 1, category: "engine" },
    "22100E": { name: "Misfire Count Cyl 3", nameAr: "عدد اختلالات أسطوانة 3", formula: (a) => a, unit: "", bytes: 1, category: "engine" },
    "22100F": { name: "Misfire Count Cyl 4", nameAr: "عدد اختلالات أسطوانة 4", formula: (a) => a, unit: "", bytes: 1, category: "engine" },
    "221010": { name: "Fuel Alcohol Content", nameAr: "نسبة الكحول في الوقود", formula: (a) => (a * 100) / 255, unit: "%", bytes: 1, category: "engine" },
    // Transmission (4L60E, 6L80, 8L90, 10L80)
    "222001": { name: "Trans Fluid Temp", nameAr: "حرارة زيت القير", formula: (a) => a - 40, unit: "°C", bytes: 1, category: "transmission" },
    "222002": { name: "Commanded Gear", nameAr: "الترس المطلوب", formula: (a) => a, unit: "", bytes: 1, category: "transmission" },
    "222003": { name: "Actual Gear Ratio", nameAr: "نسبة الترس الفعلية", formula: (a, b) => ((a * 256) + (b || 0)) * 0.001, unit: "", bytes: 2, category: "transmission" },
    "222004": { name: "TCC Slip Speed", nameAr: "انزلاق TCC", formula: (a, b) => ((a * 256) + (b || 0)) - 32768, unit: "rpm", bytes: 2, category: "transmission" },
    "222005": { name: "Line Pressure", nameAr: "ضغط الخط", formula: (a, b) => ((a * 256) + (b || 0)) * 0.1, unit: "kPa", bytes: 2, category: "transmission" },
    "222006": { name: "Torque Converter Temp", nameAr: "حرارة محول العزم", formula: (a) => a - 40, unit: "°C", bytes: 1, category: "transmission" },
    "222007": { name: "Input Shaft Speed", nameAr: "سرعة عمود الإدخال", formula: (a, b) => (a * 256) + (b || 0), unit: "rpm", bytes: 2, category: "transmission" },
    "222008": { name: "Output Shaft Speed", nameAr: "سرعة عمود الإخراج", formula: (a, b) => (a * 256) + (b || 0), unit: "rpm", bytes: 2, category: "transmission" },
    // 4WD/AWD (Transfer Case)
    "223001": { name: "Transfer Case Mode", nameAr: "وضع صندوق النقل", formula: (a) => a, unit: "", bytes: 1, category: "drivetrain" },
    "223002": { name: "Front Axle Torque", nameAr: "عزم المحور الأمامي", formula: (a, b) => ((a * 256) + (b || 0)) - 32768, unit: "Nm", bytes: 2, category: "drivetrain" },
    "223003": { name: "Rear Axle Torque", nameAr: "عزم المحور الخلفي", formula: (a, b) => ((a * 256) + (b || 0)) - 32768, unit: "Nm", bytes: 2, category: "drivetrain" },
    // StabiliTrak
    "224001": { name: "Wheel Speed FL", nameAr: "سرعة عجلة أمامية يسار", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "km/h", bytes: 2, category: "abs" },
    "224002": { name: "Wheel Speed FR", nameAr: "سرعة عجلة أمامية يمين", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "km/h", bytes: 2, category: "abs" },
    "224003": { name: "Wheel Speed RL", nameAr: "سرعة عجلة خلفية يسار", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "km/h", bytes: 2, category: "abs" },
    "224004": { name: "Wheel Speed RR", nameAr: "سرعة عجلة خلفية يمين", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "km/h", bytes: 2, category: "abs" },
    "224005": { name: "Steering Angle", nameAr: "زاوية المقود", formula: (a, b) => ((a * 256) + (b || 0)) - 32768, unit: "°", bytes: 2, category: "abs" },
    "224006": { name: "Yaw Rate", nameAr: "معدل الانحراف", formula: (a, b) => (((a * 256) + (b || 0)) - 32768) * 0.01, unit: "°/s", bytes: 2, category: "abs" },
    "224007": { name: "Lateral Acceleration", nameAr: "التسارع الجانبي", formula: (a, b) => (((a * 256) + (b || 0)) - 32768) * 0.001, unit: "g", bytes: 2, category: "abs" },
  },
};

// ═══════════════════════════════════════════════════════
// HYUNDAI / KIA Enhanced PIDs
// ═══════════════════════════════════════════════════════

export const HYUNDAI_PIDS: ManufacturerPIDSet = {
  name: "Hyundai/Kia",
  nameAr: "هيونداي/كيا",
  pids: {
    // GDI Engine (Theta II, Smartstream)
    "221001": { name: "GDI Rail Pressure", nameAr: "ضغط قضيب GDI", formula: (a, b) => ((a * 256) + (b || 0)) * 10, unit: "kPa", bytes: 2, category: "engine" },
    "221002": { name: "GDI Pump Duty", nameAr: "دورة عمل مضخة GDI", formula: (a) => (a * 100) / 255, unit: "%", bytes: 1, category: "engine" },
    "221003": { name: "Target Rail Pressure", nameAr: "ضغط القضيب المطلوب", formula: (a, b) => ((a * 256) + (b || 0)) * 10, unit: "kPa", bytes: 2, category: "engine" },
    "221004": { name: "CVVT Intake Angle", nameAr: "زاوية CVVT سحب", formula: (a) => a - 50, unit: "°CA", bytes: 1, category: "engine" },
    "221005": { name: "CVVT Exhaust Angle", nameAr: "زاوية CVVT عادم", formula: (a) => a - 50, unit: "°CA", bytes: 1, category: "engine" },
    "221006": { name: "Target CVVT Intake", nameAr: "CVVT سحب مطلوب", formula: (a) => a - 50, unit: "°CA", bytes: 1, category: "engine" },
    "221007": { name: "Target CVVT Exhaust", nameAr: "CVVT عادم مطلوب", formula: (a) => a - 50, unit: "°CA", bytes: 1, category: "engine" },
    "221008": { name: "Knock Count Cyl 1", nameAr: "عدد طرقات أسطوانة 1", formula: (a) => a, unit: "", bytes: 1, category: "engine" },
    "221009": { name: "Knock Count Cyl 2", nameAr: "عدد طرقات أسطوانة 2", formula: (a) => a, unit: "", bytes: 1, category: "engine" },
    "22100A": { name: "Knock Count Cyl 3", nameAr: "عدد طرقات أسطوانة 3", formula: (a) => a, unit: "", bytes: 1, category: "engine" },
    "22100B": { name: "Knock Count Cyl 4", nameAr: "عدد طرقات أسطوانة 4", formula: (a) => a, unit: "", bytes: 1, category: "engine" },
    "22100C": { name: "Injector Correction Cyl 1", nameAr: "تصحيح حاقن أسطوانة 1", formula: (a) => ((a - 128) * 100) / 128, unit: "%", bytes: 1, category: "engine" },
    // Turbo (Smartstream T-GDI)
    "222001": { name: "Boost Pressure Actual", nameAr: "ضغط التيربو الفعلي", formula: (a, b) => ((a * 256) + (b || 0)) * 0.1, unit: "kPa", bytes: 2, category: "turbo" },
    "222002": { name: "Boost Pressure Target", nameAr: "ضغط التيربو المطلوب", formula: (a, b) => ((a * 256) + (b || 0)) * 0.1, unit: "kPa", bytes: 2, category: "turbo" },
    "222003": { name: "Wastegate Position", nameAr: "موضع Wastegate", formula: (a) => (a * 100) / 255, unit: "%", bytes: 1, category: "turbo" },
    "222004": { name: "Charge Air Temp", nameAr: "حرارة الهواء المضغوط", formula: (a) => a - 40, unit: "°C", bytes: 1, category: "turbo" },
    // DCT Transmission (7DCT)
    "223001": { name: "DCT Clutch 1 Temp", nameAr: "حرارة كلتش 1 DCT", formula: (a) => a - 40, unit: "°C", bytes: 1, category: "transmission" },
    "223002": { name: "DCT Clutch 2 Temp", nameAr: "حرارة كلتش 2 DCT", formula: (a) => a - 40, unit: "°C", bytes: 1, category: "transmission" },
    "223003": { name: "DCT Oil Temp", nameAr: "حرارة زيت DCT", formula: (a) => a - 40, unit: "°C", bytes: 1, category: "transmission" },
    "223004": { name: "Current Gear", nameAr: "الترس الحالي", formula: (a) => a, unit: "", bytes: 1, category: "transmission" },
    "223005": { name: "Clutch 1 Slip", nameAr: "انزلاق كلتش 1", formula: (a, b) => ((a * 256) + (b || 0)) - 32768, unit: "rpm", bytes: 2, category: "transmission" },
    // EV/Hybrid (Ioniq, Kona EV)
    "224001": { name: "HV Battery SOC", nameAr: "شحن بطارية الهايبرد", formula: (a) => (a * 100) / 255, unit: "%", bytes: 1, category: "ev" },
    "224002": { name: "HV Battery Voltage", nameAr: "جهد بطارية الهايبرد", formula: (a, b) => ((a * 256) + (b || 0)) * 0.1, unit: "V", bytes: 2, category: "ev" },
    "224003": { name: "HV Battery Current", nameAr: "تيار بطارية الهايبرد", formula: (a, b) => (((a * 256) + (b || 0)) - 32768) * 0.1, unit: "A", bytes: 2, category: "ev" },
    "224004": { name: "HV Battery Temp Min", nameAr: "أقل حرارة بطارية", formula: (a) => a - 40, unit: "°C", bytes: 1, category: "ev" },
    "224005": { name: "HV Battery Temp Max", nameAr: "أعلى حرارة بطارية", formula: (a) => a - 40, unit: "°C", bytes: 1, category: "ev" },
    "224006": { name: "Motor Speed", nameAr: "سرعة المحرك الكهربائي", formula: (a, b) => ((a * 256) + (b || 0)) - 32768, unit: "rpm", bytes: 2, category: "ev" },
    "224007": { name: "Motor Torque", nameAr: "عزم المحرك الكهربائي", formula: (a, b) => (((a * 256) + (b || 0)) - 32768) * 0.1, unit: "Nm", bytes: 2, category: "ev" },
    "224008": { name: "Regenerative Braking Torque", nameAr: "عزم الفرملة التجددية", formula: (a, b) => ((a * 256) + (b || 0)) * 0.1, unit: "Nm", bytes: 2, category: "ev" },
  },
};

// ═══════════════════════════════════════════════════════
// NISSAN / INFINITI Enhanced PIDs
// ═══════════════════════════════════════════════════════

export const NISSAN_PIDS: ManufacturerPIDSet = {
  name: "Nissan/Infiniti",
  nameAr: "نيسان/إنفينيتي",
  pids: {
    // VQ/VR Engine
    "221001": { name: "VVEL Lift Position", nameAr: "موضع رفع VVEL", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "mm", bytes: 2, category: "engine" },
    "221002": { name: "VVEL Target Lift", nameAr: "رفع VVEL المطلوب", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "mm", bytes: 2, category: "engine" },
    "221003": { name: "VTC Intake Angle", nameAr: "زاوية VTC سحب", formula: (a) => a - 50, unit: "°CA", bytes: 1, category: "engine" },
    "221004": { name: "VTC Exhaust Angle", nameAr: "زاوية VTC عادم", formula: (a) => a - 50, unit: "°CA", bytes: 1, category: "engine" },
    "221005": { name: "Knock Retard B1", nameAr: "تأخير طرق بنك 1", formula: (a) => a * 0.352, unit: "°", bytes: 1, category: "engine" },
    "221006": { name: "Knock Retard B2", nameAr: "تأخير طرق بنك 2", formula: (a) => a * 0.352, unit: "°", bytes: 1, category: "engine" },
    "221007": { name: "Fuel Injector PW B1", nameAr: "عرض نبضة حاقن بنك 1", formula: (a, b) => ((a * 256) + (b || 0)) * 0.008, unit: "ms", bytes: 2, category: "engine" },
    "221008": { name: "Fuel Injector PW B2", nameAr: "عرض نبضة حاقن بنك 2", formula: (a, b) => ((a * 256) + (b || 0)) * 0.008, unit: "ms", bytes: 2, category: "engine" },
    "221009": { name: "Target Idle RPM", nameAr: "RPM خمول مطلوب", formula: (a, b) => ((a * 256) + (b || 0)) / 4, unit: "rpm", bytes: 2, category: "engine" },
    "22100A": { name: "AAC Valve Position", nameAr: "موضع صمام AAC", formula: (a) => (a * 100) / 255, unit: "%", bytes: 1, category: "engine" },
    // CVT Transmission (Jatco)
    "222001": { name: "CVT Fluid Temp", nameAr: "حرارة زيت CVT", formula: (a) => a - 40, unit: "°C", bytes: 1, category: "transmission" },
    "222002": { name: "CVT Ratio", nameAr: "نسبة CVT", formula: (a, b) => ((a * 256) + (b || 0)) * 0.001, unit: "", bytes: 2, category: "transmission" },
    "222003": { name: "CVT Primary Pulley Speed", nameAr: "سرعة البكرة الأولية", formula: (a, b) => (a * 256) + (b || 0), unit: "rpm", bytes: 2, category: "transmission" },
    "222004": { name: "CVT Secondary Pulley Speed", nameAr: "سرعة البكرة الثانوية", formula: (a, b) => (a * 256) + (b || 0), unit: "rpm", bytes: 2, category: "transmission" },
    "222005": { name: "CVT Line Pressure", nameAr: "ضغط خط CVT", formula: (a, b) => ((a * 256) + (b || 0)) * 0.1, unit: "kPa", bytes: 2, category: "transmission" },
    "222006": { name: "CVT Step Motor Position", nameAr: "موضع محرك الخطوة CVT", formula: (a) => a, unit: "steps", bytes: 1, category: "transmission" },
    // e-POWER / EV
    "223001": { name: "e-POWER Battery SOC", nameAr: "شحن بطارية e-POWER", formula: (a) => (a * 100) / 255, unit: "%", bytes: 1, category: "ev" },
    "223002": { name: "e-POWER Motor Torque", nameAr: "عزم محرك e-POWER", formula: (a, b) => (((a * 256) + (b || 0)) - 32768) * 0.1, unit: "Nm", bytes: 2, category: "ev" },
    "223003": { name: "e-POWER Generator RPM", nameAr: "دورات مولد e-POWER", formula: (a, b) => (a * 256) + (b || 0), unit: "rpm", bytes: 2, category: "ev" },
  },
};

// ═══════════════════════════════════════════════════════
// BMW Enhanced PIDs
// ═══════════════════════════════════════════════════════

export const BMW_PIDS: ManufacturerPIDSet = {
  name: "BMW",
  nameAr: "بي ام دبليو",
  pids: {
    // N20/B48/B58 Engine
    "221001": { name: "Boost Pressure Actual", nameAr: "ضغط التيربو الفعلي", formula: (a, b) => ((a * 256) + (b || 0)) * 0.1, unit: "mbar", bytes: 2, category: "engine" },
    "221002": { name: "Boost Pressure Target", nameAr: "ضغط التيربو المطلوب", formula: (a, b) => ((a * 256) + (b || 0)) * 0.1, unit: "mbar", bytes: 2, category: "engine" },
    "221003": { name: "Wastegate Duty Cycle", nameAr: "دورة عمل Wastegate", formula: (a) => (a * 100) / 255, unit: "%", bytes: 1, category: "engine" },
    "221004": { name: "Charge Air Temp", nameAr: "حرارة الهواء المضغوط", formula: (a) => a - 48, unit: "°C", bytes: 1, category: "engine" },
    "221005": { name: "VANOS Intake Actual", nameAr: "VANOS سحب فعلي", formula: (a, b) => ((a * 256) + (b || 0)) * 0.02 - 200, unit: "°CA", bytes: 2, category: "engine" },
    "221006": { name: "VANOS Exhaust Actual", nameAr: "VANOS عادم فعلي", formula: (a, b) => ((a * 256) + (b || 0)) * 0.02 - 200, unit: "°CA", bytes: 2, category: "engine" },
    "221007": { name: "VANOS Intake Target", nameAr: "VANOS سحب مطلوب", formula: (a, b) => ((a * 256) + (b || 0)) * 0.02 - 200, unit: "°CA", bytes: 2, category: "engine" },
    "221008": { name: "VANOS Exhaust Target", nameAr: "VANOS عادم مطلوب", formula: (a, b) => ((a * 256) + (b || 0)) * 0.02 - 200, unit: "°CA", bytes: 2, category: "engine" },
    "221009": { name: "Valvetronic Lift", nameAr: "رفع Valvetronic", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "mm", bytes: 2, category: "engine" },
    "22100A": { name: "High Pressure Fuel Pump", nameAr: "ضغط مضخة الوقود العالي", formula: (a, b) => ((a * 256) + (b || 0)) * 10, unit: "kPa", bytes: 2, category: "engine" },
    "22100B": { name: "Target Fuel Pressure", nameAr: "ضغط الوقود المطلوب", formula: (a, b) => ((a * 256) + (b || 0)) * 10, unit: "kPa", bytes: 2, category: "engine" },
    "22100C": { name: "Knock Sensor 1 Voltage", nameAr: "جهد حساس الطرق 1", formula: (a, b) => ((a * 256) + (b || 0)) * 0.001, unit: "V", bytes: 2, category: "engine" },
    "22100D": { name: "Knock Sensor 2 Voltage", nameAr: "جهد حساس الطرق 2", formula: (a, b) => ((a * 256) + (b || 0)) * 0.001, unit: "V", bytes: 2, category: "engine" },
    // ZF Transmission (8HP)
    "222001": { name: "ZF Trans Fluid Temp", nameAr: "حرارة زيت القير ZF", formula: (a) => a - 40, unit: "°C", bytes: 1, category: "transmission" },
    "222002": { name: "ZF Current Gear", nameAr: "الترس الحالي ZF", formula: (a) => a, unit: "", bytes: 1, category: "transmission" },
    "222003": { name: "ZF Torque Converter Lockup", nameAr: "قفل محول العزم ZF", formula: (a) => (a * 100) / 255, unit: "%", bytes: 1, category: "transmission" },
    "222004": { name: "ZF Input Shaft Speed", nameAr: "سرعة عمود الإدخال ZF", formula: (a, b) => (a * 256) + (b || 0), unit: "rpm", bytes: 2, category: "transmission" },
    "222005": { name: "ZF Output Shaft Speed", nameAr: "سرعة عمود الإخراج ZF", formula: (a, b) => (a * 256) + (b || 0), unit: "rpm", bytes: 2, category: "transmission" },
    "222006": { name: "ZF Oil Pressure", nameAr: "ضغط زيت القير ZF", formula: (a, b) => ((a * 256) + (b || 0)) * 0.1, unit: "bar", bytes: 2, category: "transmission" },
    // xDrive AWD
    "223001": { name: "xDrive Torque Split", nameAr: "توزيع العزم xDrive", formula: (a) => (a * 100) / 255, unit: "% rear", bytes: 1, category: "drivetrain" },
    "223002": { name: "Transfer Case Clutch", nameAr: "كلتش صندوق النقل", formula: (a) => (a * 100) / 255, unit: "%", bytes: 1, category: "drivetrain" },
    // DSC (Dynamic Stability Control)
    "224001": { name: "Wheel Speed FL", nameAr: "سرعة عجلة أمامية يسار", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "km/h", bytes: 2, category: "abs" },
    "224002": { name: "Wheel Speed FR", nameAr: "سرعة عجلة أمامية يمين", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "km/h", bytes: 2, category: "abs" },
    "224003": { name: "Wheel Speed RL", nameAr: "سرعة عجلة خلفية يسار", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "km/h", bytes: 2, category: "abs" },
    "224004": { name: "Wheel Speed RR", nameAr: "سرعة عجلة خلفية يمين", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "km/h", bytes: 2, category: "abs" },
    "224005": { name: "Steering Angle", nameAr: "زاوية المقود", formula: (a, b) => ((a * 256) + (b || 0)) - 32768, unit: "°", bytes: 2, category: "abs" },
    "224006": { name: "Brake Pressure", nameAr: "ضغط الفرامل", formula: (a, b) => ((a * 256) + (b || 0)) * 0.1, unit: "bar", bytes: 2, category: "abs" },
  },
};

// ═══════════════════════════════════════════════════════
// MERCEDES-BENZ Enhanced PIDs
// ═══════════════════════════════════════════════════════

export const MERCEDES_PIDS: ManufacturerPIDSet = {
  name: "Mercedes-Benz",
  nameAr: "مرسيدس بنز",
  pids: {
    // M274/M264/M256 Engine
    "221001": { name: "Turbo Boost Pressure", nameAr: "ضغط التيربو", formula: (a, b) => ((a * 256) + (b || 0)) * 0.1, unit: "mbar", bytes: 2, category: "engine" },
    "221002": { name: "Target Boost Pressure", nameAr: "ضغط التيربو المطلوب", formula: (a, b) => ((a * 256) + (b || 0)) * 0.1, unit: "mbar", bytes: 2, category: "engine" },
    "221003": { name: "Camshaft Intake Angle", nameAr: "زاوية كامشافت السحب", formula: (a, b) => ((a * 256) + (b || 0)) * 0.02 - 200, unit: "°CA", bytes: 2, category: "engine" },
    "221004": { name: "Camshaft Exhaust Angle", nameAr: "زاوية كامشافت العادم", formula: (a, b) => ((a * 256) + (b || 0)) * 0.02 - 200, unit: "°CA", bytes: 2, category: "engine" },
    "221005": { name: "Piezo Injector PW Cyl 1", nameAr: "نبضة حاقن بيزو أسطوانة 1", formula: (a, b) => ((a * 256) + (b || 0)) * 0.004, unit: "ms", bytes: 2, category: "engine" },
    "221006": { name: "Piezo Injector PW Cyl 2", nameAr: "نبضة حاقن بيزو أسطوانة 2", formula: (a, b) => ((a * 256) + (b || 0)) * 0.004, unit: "ms", bytes: 2, category: "engine" },
    "221007": { name: "Piezo Injector PW Cyl 3", nameAr: "نبضة حاقن بيزو أسطوانة 3", formula: (a, b) => ((a * 256) + (b || 0)) * 0.004, unit: "ms", bytes: 2, category: "engine" },
    "221008": { name: "Piezo Injector PW Cyl 4", nameAr: "نبضة حاقن بيزو أسطوانة 4", formula: (a, b) => ((a * 256) + (b || 0)) * 0.004, unit: "ms", bytes: 2, category: "engine" },
    "221009": { name: "High Pressure Fuel Rail", nameAr: "ضغط قضيب الوقود العالي", formula: (a, b) => ((a * 256) + (b || 0)) * 10, unit: "kPa", bytes: 2, category: "engine" },
    "22100A": { name: "Target Fuel Pressure", nameAr: "ضغط الوقود المطلوب", formula: (a, b) => ((a * 256) + (b || 0)) * 10, unit: "kPa", bytes: 2, category: "engine" },
    "22100B": { name: "Knock Retard Cyl 1", nameAr: "تأخير طرق أسطوانة 1", formula: (a) => a * 0.375, unit: "°", bytes: 1, category: "engine" },
    "22100C": { name: "Knock Retard Cyl 2", nameAr: "تأخير طرق أسطوانة 2", formula: (a) => a * 0.375, unit: "°", bytes: 1, category: "engine" },
    "22100D": { name: "Knock Retard Cyl 3", nameAr: "تأخير طرق أسطوانة 3", formula: (a) => a * 0.375, unit: "°", bytes: 1, category: "engine" },
    "22100E": { name: "Knock Retard Cyl 4", nameAr: "تأخير طرق أسطوانة 4", formula: (a) => a * 0.375, unit: "°", bytes: 1, category: "engine" },
    // 9G-TRONIC Transmission
    "222001": { name: "9G-TRONIC Fluid Temp", nameAr: "حرارة زيت 9G-TRONIC", formula: (a) => a - 40, unit: "°C", bytes: 1, category: "transmission" },
    "222002": { name: "9G-TRONIC Current Gear", nameAr: "الترس الحالي 9G-TRONIC", formula: (a) => a, unit: "", bytes: 1, category: "transmission" },
    "222003": { name: "Torque Converter Slip", nameAr: "انزلاق محول العزم", formula: (a, b) => ((a * 256) + (b || 0)) - 32768, unit: "rpm", bytes: 2, category: "transmission" },
    "222004": { name: "Transmission Oil Pressure", nameAr: "ضغط زيت القير", formula: (a, b) => ((a * 256) + (b || 0)) * 0.1, unit: "bar", bytes: 2, category: "transmission" },
    "222005": { name: "Input Shaft Speed", nameAr: "سرعة عمود الإدخال", formula: (a, b) => (a * 256) + (b || 0), unit: "rpm", bytes: 2, category: "transmission" },
    // 4MATIC AWD
    "223001": { name: "4MATIC Torque Distribution", nameAr: "توزيع عزم 4MATIC", formula: (a) => (a * 100) / 255, unit: "% rear", bytes: 1, category: "drivetrain" },
    "223002": { name: "4MATIC Clutch Engagement", nameAr: "تشبيك كلتش 4MATIC", formula: (a) => (a * 100) / 255, unit: "%", bytes: 1, category: "drivetrain" },
    // ESP (Electronic Stability Program)
    "224001": { name: "Wheel Speed FL", nameAr: "سرعة عجلة أمامية يسار", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "km/h", bytes: 2, category: "abs" },
    "224002": { name: "Wheel Speed FR", nameAr: "سرعة عجلة أمامية يمين", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "km/h", bytes: 2, category: "abs" },
    "224003": { name: "Wheel Speed RL", nameAr: "سرعة عجلة خلفية يسار", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "km/h", bytes: 2, category: "abs" },
    "224004": { name: "Wheel Speed RR", nameAr: "سرعة عجلة خلفية يمين", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "km/h", bytes: 2, category: "abs" },
    "224005": { name: "Steering Angle", nameAr: "زاوية المقود", formula: (a, b) => ((a * 256) + (b || 0)) - 32768, unit: "°", bytes: 2, category: "abs" },
    "224006": { name: "Yaw Rate", nameAr: "معدل الانحراف", formula: (a, b) => (((a * 256) + (b || 0)) - 32768) * 0.01, unit: "°/s", bytes: 2, category: "abs" },
    // EQ (Electric)
    "225001": { name: "HV Battery SOC", nameAr: "شحن بطارية EQ", formula: (a) => (a * 100) / 255, unit: "%", bytes: 1, category: "ev" },
    "225002": { name: "HV Battery Voltage", nameAr: "جهد بطارية EQ", formula: (a, b) => ((a * 256) + (b || 0)) * 0.1, unit: "V", bytes: 2, category: "ev" },
    "225003": { name: "HV Battery Power", nameAr: "قدرة بطارية EQ", formula: (a, b) => (((a * 256) + (b || 0)) - 32768) * 0.1, unit: "kW", bytes: 2, category: "ev" },
    "225004": { name: "Motor Torque Front", nameAr: "عزم المحرك الأمامي", formula: (a, b) => (((a * 256) + (b || 0)) - 32768) * 0.1, unit: "Nm", bytes: 2, category: "ev" },
    "225005": { name: "Motor Torque Rear", nameAr: "عزم المحرك الخلفي", formula: (a, b) => (((a * 256) + (b || 0)) - 32768) * 0.1, unit: "Nm", bytes: 2, category: "ev" },
  },
};

// ═══════════════════════════════════════════════════════
// MANUFACTURER DETECTION & LOOKUP
// ═══════════════════════════════════════════════════════

export const ALL_MANUFACTURER_PIDS: Record<string, ManufacturerPIDSet> = {
  toyota: TOYOTA_PIDS,
  lexus: TOYOTA_PIDS,
  gm: GM_PIDS,
  chevrolet: GM_PIDS,
  gmc: GM_PIDS,
  cadillac: GM_PIDS,
  buick: GM_PIDS,
  hyundai: HYUNDAI_PIDS,
  kia: HYUNDAI_PIDS,
  genesis: HYUNDAI_PIDS,
  nissan: NISSAN_PIDS,
  infiniti: NISSAN_PIDS,
  bmw: BMW_PIDS,
  mini: BMW_PIDS,
  mercedes: MERCEDES_PIDS,
  "mercedes-benz": MERCEDES_PIDS,
};

/**
 * Detect manufacturer from VIN (first 3 characters = WMI)
 */
export function detectManufacturerFromVIN(vin: string): string | null {
  if (!vin || vin.length < 3) return null;
  
  const wmi = vin.substring(0, 3).toUpperCase();
  
  const WMI_MAP: Record<string, string> = {
    // Toyota
    "JTD": "toyota", "JTE": "toyota", "JTN": "toyota", "4T1": "toyota", "4T3": "toyota", "5TD": "toyota", "2T1": "toyota",
    // Lexus
    "JTH": "lexus", "JTJ": "lexus", "2T2": "lexus",
    // GM/Chevrolet
    "1G1": "chevrolet", "1GC": "chevrolet", "2G1": "chevrolet", "3G1": "chevrolet",
    // GMC
    "1GT": "gmc", "2GT": "gmc", "3GT": "gmc",
    // Cadillac
    "1G6": "cadillac", "1GY": "cadillac",
    // Buick
    "1G4": "buick",
    // Hyundai
    "KMH": "hyundai", "5NP": "hyundai", "5NM": "hyundai",
    // Kia
    "KNA": "kia", "KND": "kia", "5XX": "kia",
    // Genesis
    "KMT": "genesis",
    // Nissan
    "JN1": "nissan", "1N4": "nissan", "1N6": "nissan", "5N1": "nissan", "3N1": "nissan",
    // Infiniti
    "JNK": "infiniti",
    // BMW
    "WBA": "bmw", "WBS": "bmw", "WBY": "bmw", "5UX": "bmw",
    // MINI
    "WMW": "mini",
    // Mercedes
    "WDB": "mercedes", "WDC": "mercedes", "WDD": "mercedes", "4JG": "mercedes", "55S": "mercedes",
    // Ford (already in main file)
    "1FA": "ford", "1FT": "ford", "1FM": "ford", "2FM": "ford", "3FA": "ford",
  };

  // Try full WMI first
  if (WMI_MAP[wmi]) return WMI_MAP[wmi];
  
  // Try first 2 characters
  const wmi2 = wmi.substring(0, 2);
  for (const [key, value] of Object.entries(WMI_MAP)) {
    if (key.startsWith(wmi2)) return value;
  }
  
  return null;
}

/**
 * Get PID set for a manufacturer
 */
export function getManufacturerPIDs(make: string): ManufacturerPIDSet | null {
  const key = make.toLowerCase().replace(/[-\s]/g, "");
  return ALL_MANUFACTURER_PIDS[key] || null;
}

/**
 * Get all PID categories for a manufacturer
 */
export function getManufacturerCategories(make: string): string[] {
  const pidSet = getManufacturerPIDs(make);
  if (!pidSet) return [];
  
  const categories = new Set<string>();
  for (const pid of Object.values(pidSet.pids)) {
    categories.add(pid.category);
  }
  return Array.from(categories);
}
