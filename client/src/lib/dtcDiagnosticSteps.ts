/**
 * DTC Diagnostic Steps Database - خطوات فحص تفصيلية لأعلى 50 كود
 * ═══════════════════════════════════════════════════════
 * يحتوي على:
 * - خطوات الفحص بالترتيب
 * - الأدوات المطلوبة
 * - PIDs المرتبطة للمراقبة الحية
 * - وقت الإصلاح التقديري
 * 
 * @version 1.0.0
 * @author مير - Meir Diagnostics
 */

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

export interface DiagnosticStep {
  step: number;
  action: string;
  details: string;
  expectedResult?: string;
}

export interface RequiredTool {
  name: string;
  nameAr: string;
  type: "basic" | "advanced" | "specialized";
}

export interface RelatedPID {
  pid: string;
  name: string;
  nameAr: string;
  normalRange: string;
  unit: string;
}

export interface DTCDiagnosticInfo {
  code: string;
  steps: DiagnosticStep[];
  tools: RequiredTool[];
  relatedPIDs: RelatedPID[];
  estimatedTime: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  difficultyAr: string;
  safetyWarning?: string;
}

// ═══════════════════════════════════════════════════════
// DATABASE - أعلى 50 كود شيوعاً
// ═══════════════════════════════════════════════════════

export const DTC_DIAGNOSTIC_DATABASE: Record<string, DTCDiagnosticInfo> = {
  // ═══ P0300 - Random/Multiple Cylinder Misfire ═══
  "P0300": {
    code: "P0300",
    steps: [
      { step: 1, action: "فحص البوجيهات", details: "اسحب البوجيهات وافحص اللون والفجوة (0.8-1.1mm)", expectedResult: "لون بني فاتح، بدون تآكل" },
      { step: 2, action: "فحص كويلات الإشعال", details: "قس مقاومة كل كويل (Primary: 0.5-2Ω, Secondary: 6-15kΩ)", expectedResult: "مقاومة ضمن المدى" },
      { step: 3, action: "فحص ضغط الوقود", details: "ركّب مقياس ضغط على رامب الوقود، شغّل المحرك", expectedResult: "35-65 PSI حسب النوع" },
      { step: 4, action: "فحص ضغط الأسطوانات", details: "اسحب كل البوجيهات، قس ضغط كل أسطوانة", expectedResult: "فرق لا يتجاوز 10% بين الأسطوانات" },
      { step: 5, action: "فحص تسريب الفاكيوم", details: "استخدم جهاز دخان أو بخاخ كاربيوريتر حول المانيفولد", expectedResult: "لا يوجد تسريب" },
    ],
    tools: [
      { name: "Spark Plug Socket", nameAr: "مفتاح بوجيهات", type: "basic" },
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
      { name: "Fuel Pressure Gauge", nameAr: "مقياس ضغط وقود", type: "advanced" },
      { name: "Compression Tester", nameAr: "جهاز فحص ضغط الأسطوانات", type: "advanced" },
      { name: "Smoke Machine", nameAr: "جهاز دخان", type: "specialized" },
    ],
    relatedPIDs: [
      { pid: "rpm", name: "Engine RPM", nameAr: "دورات المحرك", normalRange: "700-900", unit: "RPM" },
      { pid: "shortFuelTrim", name: "Short Fuel Trim", nameAr: "تعديل وقود قصير", normalRange: "-5 إلى +5", unit: "%" },
      { pid: "longFuelTrim", name: "Long Fuel Trim", nameAr: "تعديل وقود طويل", normalRange: "-10 إلى +10", unit: "%" },
      { pid: "mafRate", name: "MAF Rate", nameAr: "تدفق الهواء", normalRange: "2-7 خمول", unit: "g/s" },
    ],
    estimatedTime: "1-3 ساعات",
    difficulty: "medium",
    difficultyAr: "متوسط",
  },

  // ═══ P0171 - System Too Lean (Bank 1) ═══
  "P0171": {
    code: "P0171",
    steps: [
      { step: 1, action: "فحص تسريب هواء", details: "افحص خراطيم الفاكيوم والمانيفولد بجهاز دخان", expectedResult: "لا يوجد تسريب" },
      { step: 2, action: "فحص حساس MAF", details: "نظّف حساس MAF بمنظف مخصص، راقب القراءة", expectedResult: "2-7 g/s خمول" },
      { step: 3, action: "فحص ضغط الوقود", details: "قس ضغط الوقود على الرامب", expectedResult: "35-65 PSI" },
      { step: 4, action: "فحص بخاخات الوقود", details: "قس مقاومة كل بخاخ (12-16Ω عادة)", expectedResult: "مقاومة متساوية" },
      { step: 5, action: "فحص حساس O2", details: "راقب جهد حساس O2 Bank 1 Sensor 1", expectedResult: "يتأرجح 0.1-0.9V" },
    ],
    tools: [
      { name: "Smoke Machine", nameAr: "جهاز دخان", type: "specialized" },
      { name: "MAF Cleaner", nameAr: "منظف MAF", type: "basic" },
      { name: "Fuel Pressure Gauge", nameAr: "مقياس ضغط وقود", type: "advanced" },
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "shortFuelTrim", name: "Short Fuel Trim B1", nameAr: "تعديل وقود قصير", normalRange: "-5 إلى +5", unit: "%" },
      { pid: "longFuelTrim", name: "Long Fuel Trim B1", nameAr: "تعديل وقود طويل", normalRange: "-10 إلى +10", unit: "%" },
      { pid: "mafRate", name: "MAF Rate", nameAr: "تدفق الهواء", normalRange: "2-7 خمول", unit: "g/s" },
      { pid: "fuelPressure", name: "Fuel Pressure", nameAr: "ضغط الوقود", normalRange: "35-65", unit: "PSI" },
    ],
    estimatedTime: "1-2 ساعة",
    difficulty: "medium",
    difficultyAr: "متوسط",
  },

  // ═══ P0172 - System Too Rich (Bank 1) ═══
  "P0172": {
    code: "P0172",
    steps: [
      { step: 1, action: "فحص فلتر الهواء", details: "اسحب فلتر الهواء وافحص حالته", expectedResult: "نظيف بدون انسداد" },
      { step: 2, action: "فحص حساس MAF", details: "نظّف أو استبدل حساس MAF الملوث", expectedResult: "قراءة 2-7 g/s خمول" },
      { step: 3, action: "فحص ضغط الوقود", details: "قس ضغط الوقود - قد يكون مرتفع", expectedResult: "ضمن مواصفات المصنع" },
      { step: 4, action: "فحص البخاخات", details: "افحص تسريب البخاخات (Leak-down test)", expectedResult: "لا يوجد تسريب" },
      { step: 5, action: "فحص EVAP", details: "افحص صمام EVAP Purge - قد يكون مفتوح دائماً", expectedResult: "مغلق عند الخمول" },
    ],
    tools: [
      { name: "MAF Cleaner", nameAr: "منظف MAF", type: "basic" },
      { name: "Fuel Pressure Gauge", nameAr: "مقياس ضغط وقود", type: "advanced" },
      { name: "Noid Light", nameAr: "فاحص بخاخات", type: "advanced" },
    ],
    relatedPIDs: [
      { pid: "shortFuelTrim", name: "Short Fuel Trim B1", nameAr: "تعديل وقود قصير", normalRange: "-5 إلى +5", unit: "%" },
      { pid: "longFuelTrim", name: "Long Fuel Trim B1", nameAr: "تعديل وقود طويل", normalRange: "-10 إلى +10", unit: "%" },
      { pid: "mafRate", name: "MAF Rate", nameAr: "تدفق الهواء", normalRange: "2-7", unit: "g/s" },
    ],
    estimatedTime: "1-2 ساعة",
    difficulty: "medium",
    difficultyAr: "متوسط",
  },

  // ═══ P0420 - Catalyst System Efficiency Below Threshold ═══
  "P0420": {
    code: "P0420",
    steps: [
      { step: 1, action: "فحص حساسات O2", details: "راقب Sensor 1 vs Sensor 2 - الثاني يجب أن يكون ثابت", expectedResult: "S2 ثابت ~0.45V" },
      { step: 2, action: "فحص تسريب العادم", details: "افحص وصلات العادم قبل وبعد الكتلايزر", expectedResult: "لا يوجد تسريب" },
      { step: 3, action: "فحص حرارة الكتلايزر", details: "قس حرارة المدخل والمخرج بـ IR thermometer", expectedResult: "المخرج أعلى 20-50°C" },
      { step: 4, action: "فحص Fuel Trim", details: "تأكد أن Fuel Trim ضمن المدى الطبيعي", expectedResult: "±5% STFT, ±10% LTFT" },
      { step: 5, action: "تقييم الكتلايزر", details: "إذا فشلت الخطوات السابقة، الكتلايزر تالف", expectedResult: "استبدال الكتلايزر" },
    ],
    tools: [
      { name: "OBD Scanner", nameAr: "جهاز OBD", type: "basic" },
      { name: "IR Thermometer", nameAr: "ميزان حرارة ليزري", type: "basic" },
      { name: "Exhaust Gas Analyzer", nameAr: "محلل غازات العادم", type: "specialized" },
    ],
    relatedPIDs: [
      { pid: "catalystTemp", name: "Catalyst Temp", nameAr: "حرارة الكتلايزر", normalRange: "400-800", unit: "°C" },
      { pid: "shortFuelTrim", name: "Short Fuel Trim", nameAr: "تعديل وقود قصير", normalRange: "-5 إلى +5", unit: "%" },
      { pid: "engineLoad", name: "Engine Load", nameAr: "حمل المحرك", normalRange: "15-30 خمول", unit: "%" },
    ],
    estimatedTime: "30 دقيقة فحص",
    difficulty: "easy",
    difficultyAr: "سهل",
    safetyWarning: "⚠️ الكتلايزر حرارته عالية جداً - انتظر حتى يبرد المحرك",
  },

  // ═══ P0440 - EVAP System Malfunction ═══
  "P0440": {
    code: "P0440",
    steps: [
      { step: 1, action: "فحص غطاء البنزين", details: "تأكد من إغلاق الغطاء بإحكام، افحص الجوان", expectedResult: "مغلق بإحكام" },
      { step: 2, action: "فحص خراطيم EVAP", details: "تتبع خراطيم EVAP من الخزان للمحرك", expectedResult: "لا يوجد تشقق أو انفصال" },
      { step: 3, action: "فحص Purge Valve", details: "افحص صمام Purge بالأفوميتر والفاكيوم", expectedResult: "يفتح ويغلق بشكل صحيح" },
      { step: 4, action: "فحص Vent Valve", details: "افحص صمام التهوية عند الخزان", expectedResult: "يعمل بشكل صحيح" },
      { step: 5, action: "فحص بجهاز دخان", details: "ضخ دخان في نظام EVAP لكشف التسريب", expectedResult: "لا يوجد تسريب" },
    ],
    tools: [
      { name: "Smoke Machine", nameAr: "جهاز دخان", type: "specialized" },
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
      { name: "Vacuum Pump", nameAr: "مضخة فاكيوم يدوية", type: "advanced" },
    ],
    relatedPIDs: [
      { pid: "fuelLevel", name: "Fuel Level", nameAr: "مستوى الوقود", normalRange: "0-100", unit: "%" },
      { pid: "engineLoad", name: "Engine Load", nameAr: "حمل المحرك", normalRange: "15-30", unit: "%" },
    ],
    estimatedTime: "1-2 ساعة",
    difficulty: "medium",
    difficultyAr: "متوسط",
  },

  // ═══ P0442 - EVAP Small Leak ═══
  "P0442": {
    code: "P0442",
    steps: [
      { step: 1, action: "فحص غطاء البنزين", details: "استبدل الغطاء إذا كان قديم أو الجوان تالف", expectedResult: "غطاء جديد محكم" },
      { step: 2, action: "فحص بجهاز دخان", details: "ضخ دخان في نظام EVAP بضغط منخفض", expectedResult: "لا يوجد تسريب" },
      { step: 3, action: "فحص خراطيم EVAP", details: "افحص كل الوصلات والخراطيم", expectedResult: "سليمة بدون تشقق" },
    ],
    tools: [
      { name: "Smoke Machine", nameAr: "جهاز دخان", type: "specialized" },
      { name: "Gas Cap Tester", nameAr: "فاحص غطاء بنزين", type: "advanced" },
    ],
    relatedPIDs: [
      { pid: "fuelLevel", name: "Fuel Level", nameAr: "مستوى الوقود", normalRange: "0-100", unit: "%" },
    ],
    estimatedTime: "30-60 دقيقة",
    difficulty: "easy",
    difficultyAr: "سهل",
  },

  // ═══ P0301-P0304 - Cylinder Misfire ═══
  "P0301": {
    code: "P0301",
    steps: [
      { step: 1, action: "فحص بوجي الأسطوانة 1", details: "اسحب البوجي وافحص حالته", expectedResult: "لون بني فاتح" },
      { step: 2, action: "فحص كويل الأسطوانة 1", details: "بدّل الكويل مع أسطوانة أخرى وامسح الكود", expectedResult: "الكود ينتقل مع الكويل = كويل تالف" },
      { step: 3, action: "فحص البخاخ", details: "بدّل البخاخ مع أسطوانة أخرى", expectedResult: "الكود ينتقل = بخاخ تالف" },
      { step: 4, action: "فحص ضغط الأسطوانة", details: "قس ضغط الأسطوانة 1", expectedResult: "125-180 PSI" },
    ],
    tools: [
      { name: "Spark Plug Socket", nameAr: "مفتاح بوجيهات", type: "basic" },
      { name: "Compression Tester", nameAr: "جهاز فحص ضغط", type: "advanced" },
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "rpm", name: "Engine RPM", nameAr: "دورات المحرك", normalRange: "700-900", unit: "RPM" },
      { pid: "shortFuelTrim", name: "Short Fuel Trim", nameAr: "تعديل وقود قصير", normalRange: "-5 إلى +5", unit: "%" },
    ],
    estimatedTime: "30-90 دقيقة",
    difficulty: "easy",
    difficultyAr: "سهل",
  },

  "P0302": {
    code: "P0302",
    steps: [
      { step: 1, action: "فحص بوجي الأسطوانة 2", details: "اسحب البوجي وافحص حالته", expectedResult: "لون بني فاتح" },
      { step: 2, action: "فحص كويل الأسطوانة 2", details: "بدّل الكويل مع أسطوانة أخرى", expectedResult: "الكود ينتقل = كويل تالف" },
      { step: 3, action: "فحص البخاخ", details: "بدّل البخاخ مع أسطوانة أخرى", expectedResult: "الكود ينتقل = بخاخ تالف" },
      { step: 4, action: "فحص ضغط الأسطوانة", details: "قس ضغط الأسطوانة 2", expectedResult: "125-180 PSI" },
    ],
    tools: [
      { name: "Spark Plug Socket", nameAr: "مفتاح بوجيهات", type: "basic" },
      { name: "Compression Tester", nameAr: "جهاز فحص ضغط", type: "advanced" },
    ],
    relatedPIDs: [
      { pid: "rpm", name: "Engine RPM", nameAr: "دورات المحرك", normalRange: "700-900", unit: "RPM" },
      { pid: "shortFuelTrim", name: "Short Fuel Trim", nameAr: "تعديل وقود قصير", normalRange: "-5 إلى +5", unit: "%" },
    ],
    estimatedTime: "30-90 دقيقة",
    difficulty: "easy",
    difficultyAr: "سهل",
  },

  "P0303": {
    code: "P0303",
    steps: [
      { step: 1, action: "فحص بوجي الأسطوانة 3", details: "اسحب البوجي وافحص حالته", expectedResult: "لون بني فاتح" },
      { step: 2, action: "فحص كويل الأسطوانة 3", details: "بدّل الكويل مع أسطوانة أخرى", expectedResult: "الكود ينتقل = كويل تالف" },
      { step: 3, action: "فحص البخاخ", details: "بدّل البخاخ مع أسطوانة أخرى", expectedResult: "الكود ينتقل = بخاخ تالف" },
      { step: 4, action: "فحص ضغط الأسطوانة", details: "قس ضغط الأسطوانة 3", expectedResult: "125-180 PSI" },
    ],
    tools: [
      { name: "Spark Plug Socket", nameAr: "مفتاح بوجيهات", type: "basic" },
      { name: "Compression Tester", nameAr: "جهاز فحص ضغط", type: "advanced" },
    ],
    relatedPIDs: [
      { pid: "rpm", name: "Engine RPM", nameAr: "دورات المحرك", normalRange: "700-900", unit: "RPM" },
    ],
    estimatedTime: "30-90 دقيقة",
    difficulty: "easy",
    difficultyAr: "سهل",
  },

  "P0304": {
    code: "P0304",
    steps: [
      { step: 1, action: "فحص بوجي الأسطوانة 4", details: "اسحب البوجي وافحص حالته", expectedResult: "لون بني فاتح" },
      { step: 2, action: "فحص كويل الأسطوانة 4", details: "بدّل الكويل مع أسطوانة أخرى", expectedResult: "الكود ينتقل = كويل تالف" },
      { step: 3, action: "فحص البخاخ", details: "بدّل البخاخ مع أسطوانة أخرى", expectedResult: "الكود ينتقل = بخاخ تالف" },
      { step: 4, action: "فحص ضغط الأسطوانة", details: "قس ضغط الأسطوانة 4", expectedResult: "125-180 PSI" },
    ],
    tools: [
      { name: "Spark Plug Socket", nameAr: "مفتاح بوجيهات", type: "basic" },
      { name: "Compression Tester", nameAr: "جهاز فحص ضغط", type: "advanced" },
    ],
    relatedPIDs: [
      { pid: "rpm", name: "Engine RPM", nameAr: "دورات المحرك", normalRange: "700-900", unit: "RPM" },
    ],
    estimatedTime: "30-90 دقيقة",
    difficulty: "easy",
    difficultyAr: "سهل",
  },

  // ═══ P0128 - Coolant Thermostat ═══
  "P0128": {
    code: "P0128",
    steps: [
      { step: 1, action: "فحص مستوى سائل التبريد", details: "تأكد من مستوى الكولنت في الرديتر والقربة", expectedResult: "مستوى صحيح" },
      { step: 2, action: "فحص الثرموستات", details: "شغّل المحرك وراقب ارتفاع الحرارة - يجب أن تصل 80°C خلال 5-10 دقائق", expectedResult: "وصول 80°C" },
      { step: 3, action: "فحص حساس الحرارة ECT", details: "قس مقاومة الحساس بالأفوميتر عند درجات مختلفة", expectedResult: "مقاومة تنخفض مع الحرارة" },
      { step: 4, action: "استبدال الثرموستات", details: "إذا لم تصل الحرارة 80°C، استبدل الثرموستات", expectedResult: "حرارة طبيعية" },
    ],
    tools: [
      { name: "IR Thermometer", nameAr: "ميزان حرارة ليزري", type: "basic" },
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
      { name: "Coolant Tester", nameAr: "فاحص سائل تبريد", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "coolantTemp", name: "Coolant Temp", nameAr: "حرارة المحرك", normalRange: "80-105", unit: "°C" },
      { pid: "intakeTemp", name: "Intake Temp", nameAr: "حرارة السحب", normalRange: "10-50", unit: "°C" },
    ],
    estimatedTime: "30-60 دقيقة",
    difficulty: "easy",
    difficultyAr: "سهل",
  },

  // ═══ P0131 - O2 Sensor Low Voltage (B1S1) ═══
  "P0131": {
    code: "P0131",
    steps: [
      { step: 1, action: "فحص أسلاك حساس O2", details: "افحص الأسلاك والكنكتور من تلف أو تآكل", expectedResult: "أسلاك سليمة" },
      { step: 2, action: "فحص جهد الحساس", details: "راقب جهد O2 B1S1 - يجب أن يتأرجح", expectedResult: "0.1-0.9V متأرجح" },
      { step: 3, action: "فحص تسريب عادم", details: "افحص تسريب قبل الحساس", expectedResult: "لا يوجد تسريب" },
      { step: 4, action: "استبدال الحساس", details: "إذا الجهد ثابت منخفض، استبدل الحساس", expectedResult: "جهد متأرجح طبيعي" },
    ],
    tools: [
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
      { name: "O2 Sensor Socket", nameAr: "مفتاح حساس O2", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "shortFuelTrim", name: "Short Fuel Trim", nameAr: "تعديل وقود قصير", normalRange: "-5 إلى +5", unit: "%" },
      { pid: "longFuelTrim", name: "Long Fuel Trim", nameAr: "تعديل وقود طويل", normalRange: "-10 إلى +10", unit: "%" },
    ],
    estimatedTime: "30-60 دقيقة",
    difficulty: "easy",
    difficultyAr: "سهل",
  },

  // ═══ P0335 - Crankshaft Position Sensor ═══
  "P0335": {
    code: "P0335",
    steps: [
      { step: 1, action: "فحص كنكتور الحساس", details: "افصل الكنكتور وافحص الأطراف من تآكل أو زيت", expectedResult: "نظيف بدون تآكل" },
      { step: 2, action: "فحص مقاومة الحساس", details: "قس مقاومة الحساس (عادة 500-1500Ω)", expectedResult: "ضمن مواصفات المصنع" },
      { step: 3, action: "فحص الفجوة", details: "تأكد من فجوة الحساس مع عجلة التوقيت", expectedResult: "0.5-1.5mm" },
      { step: 4, action: "فحص الإشارة", details: "استخدم أوسيلوسكوب لفحص شكل الإشارة", expectedResult: "موجة منتظمة" },
    ],
    tools: [
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
      { name: "Oscilloscope", nameAr: "أوسيلوسكوب", type: "specialized" },
      { name: "Feeler Gauge", nameAr: "مقياس فجوات", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "rpm", name: "Engine RPM", nameAr: "دورات المحرك", normalRange: "700-900", unit: "RPM" },
    ],
    estimatedTime: "30-60 دقيقة",
    difficulty: "medium",
    difficultyAr: "متوسط",
    safetyWarning: "⚠️ قد يسبب توقف مفاجئ للمحرك أثناء القيادة",
  },

  // ═══ P0340 - Camshaft Position Sensor ═══
  "P0340": {
    code: "P0340",
    steps: [
      { step: 1, action: "فحص كنكتور الحساس", details: "افحص الكنكتور والأسلاك", expectedResult: "سليم" },
      { step: 2, action: "فحص مقاومة الحساس", details: "قس المقاومة (عادة 500-1500Ω)", expectedResult: "ضمن المواصفات" },
      { step: 3, action: "فحص التغذية", details: "تأكد من وصول 5V أو 12V للحساس", expectedResult: "جهد صحيح" },
      { step: 4, action: "فحص سير التوقيت", details: "تأكد من عدم قفز سير/جنزير التوقيت", expectedResult: "توقيت صحيح" },
    ],
    tools: [
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
      { name: "Oscilloscope", nameAr: "أوسيلوسكوب", type: "specialized" },
    ],
    relatedPIDs: [
      { pid: "rpm", name: "Engine RPM", nameAr: "دورات المحرك", normalRange: "700-900", unit: "RPM" },
      { pid: "timingAdvance", name: "Timing Advance", nameAr: "تقديم الإشعال", normalRange: "8-20", unit: "°" },
    ],
    estimatedTime: "30-90 دقيقة",
    difficulty: "medium",
    difficultyAr: "متوسط",
  },

  // ═══ P0401 - EGR Insufficient Flow ═══
  "P0401": {
    code: "P0401",
    steps: [
      { step: 1, action: "فحص صمام EGR", details: "اسحب صمام EGR وافحص الكربون المتراكم", expectedResult: "نظيف يتحرك بحرية" },
      { step: 2, action: "تنظيف ممرات EGR", details: "نظّف ممرات EGR في المانيفولد", expectedResult: "ممرات مفتوحة" },
      { step: 3, action: "فحص حساس DPFE/MAP", details: "افحص حساس الضغط التفاضلي", expectedResult: "يعطي قراءة صحيحة" },
      { step: 4, action: "فحص الفاكيوم", details: "تأكد من وصول فاكيوم لصمام EGR", expectedResult: "فاكيوم عند التسارع" },
    ],
    tools: [
      { name: "Carbon Cleaner", nameAr: "منظف كربون", type: "basic" },
      { name: "Vacuum Pump", nameAr: "مضخة فاكيوم يدوية", type: "advanced" },
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "engineLoad", name: "Engine Load", nameAr: "حمل المحرك", normalRange: "15-30", unit: "%" },
      { pid: "coolantTemp", name: "Coolant Temp", nameAr: "حرارة المحرك", normalRange: "80-105", unit: "°C" },
    ],
    estimatedTime: "1-2 ساعة",
    difficulty: "medium",
    difficultyAr: "متوسط",
  },

  // ═══ P0455 - EVAP Large Leak ═══
  "P0455": {
    code: "P0455",
    steps: [
      { step: 1, action: "فحص غطاء البنزين", details: "تأكد من إغلاقه - قد يكون مفقود أو مكسور", expectedResult: "مغلق بإحكام" },
      { step: 2, action: "فحص بصري", details: "افحص خراطيم EVAP بصرياً من تحت السيارة", expectedResult: "لا يوجد انفصال" },
      { step: 3, action: "فحص بجهاز دخان", details: "ضخ دخان في النظام", expectedResult: "تسريب واضح" },
    ],
    tools: [
      { name: "Smoke Machine", nameAr: "جهاز دخان", type: "specialized" },
    ],
    relatedPIDs: [
      { pid: "fuelLevel", name: "Fuel Level", nameAr: "مستوى الوقود", normalRange: "0-100", unit: "%" },
    ],
    estimatedTime: "15-30 دقيقة",
    difficulty: "easy",
    difficultyAr: "سهل",
  },

  // ═══ P0500 - Vehicle Speed Sensor ═══
  "P0500": {
    code: "P0500",
    steps: [
      { step: 1, action: "فحص كنكتور الحساس", details: "افحص كنكتور حساس السرعة على القير", expectedResult: "سليم" },
      { step: 2, action: "فحص الإشارة", details: "ارفع السيارة وأدر العجل وراقب الإشارة", expectedResult: "تغير في الجهد" },
      { step: 3, action: "فحص الأسلاك", details: "تتبع الأسلاك من الحساس لـ ECU", expectedResult: "لا يوجد قطع" },
    ],
    tools: [
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
      { name: "Jack & Stands", nameAr: "رافعة وحوامل", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "speed", name: "Vehicle Speed", nameAr: "السرعة", normalRange: "0-200", unit: "km/h" },
    ],
    estimatedTime: "30-60 دقيقة",
    difficulty: "medium",
    difficultyAr: "متوسط",
  },

  // ═══ P0505 - Idle Air Control ═══
  "P0505": {
    code: "P0505",
    steps: [
      { step: 1, action: "تنظيف بوابة الخانق", details: "نظّف بوابة الخانق وصمام IAC بمنظف مخصص", expectedResult: "حركة سلسة" },
      { step: 2, action: "فحص صمام IAC", details: "قس مقاومة الملف (عادة 10-14Ω)", expectedResult: "ضمن المواصفات" },
      { step: 3, action: "فحص تسريب فاكيوم", details: "افحص خراطيم الفاكيوم حول المانيفولد", expectedResult: "لا يوجد تسريب" },
      { step: 4, action: "إعادة تعلم الخمول", details: "امسح الأكواد وأعد تعلم الخمول (IDLE RELEARN)", expectedResult: "خمول مستقر 700-800 RPM" },
    ],
    tools: [
      { name: "Throttle Cleaner", nameAr: "منظف خانق", type: "basic" },
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "rpm", name: "Engine RPM", nameAr: "دورات المحرك", normalRange: "700-900", unit: "RPM" },
      { pid: "throttlePos", name: "Throttle Position", nameAr: "وضع الخانق", normalRange: "0-5 خمول", unit: "%" },
      { pid: "engineLoad", name: "Engine Load", nameAr: "حمل المحرك", normalRange: "15-30", unit: "%" },
    ],
    estimatedTime: "30-60 دقيقة",
    difficulty: "easy",
    difficultyAr: "سهل",
  },

  // ═══ P0507 - Idle RPM Higher Than Expected ═══
  "P0507": {
    code: "P0507",
    steps: [
      { step: 1, action: "فحص تسريب فاكيوم", details: "افحص كل خراطيم الفاكيوم وجوانات المانيفولد", expectedResult: "لا يوجد تسريب" },
      { step: 2, action: "تنظيف بوابة الخانق", details: "نظّف الخانق من الكربون", expectedResult: "حركة سلسة" },
      { step: 3, action: "فحص IAC/IACV", details: "افحص صمام التحكم بالخمول", expectedResult: "يعمل بشكل صحيح" },
      { step: 4, action: "إعادة تعلم الخمول", details: "IDLE RELEARN بعد التنظيف", expectedResult: "700-800 RPM" },
    ],
    tools: [
      { name: "Throttle Cleaner", nameAr: "منظف خانق", type: "basic" },
      { name: "Smoke Machine", nameAr: "جهاز دخان", type: "specialized" },
    ],
    relatedPIDs: [
      { pid: "rpm", name: "Engine RPM", nameAr: "دورات المحرك", normalRange: "700-900", unit: "RPM" },
      { pid: "throttlePos", name: "Throttle Position", nameAr: "وضع الخانق", normalRange: "0-5", unit: "%" },
    ],
    estimatedTime: "30-60 دقيقة",
    difficulty: "easy",
    difficultyAr: "سهل",
  },

  // ═══ P0113 - Intake Air Temp Sensor High ═══
  "P0113": {
    code: "P0113",
    steps: [
      { step: 1, action: "فحص الكنكتور", details: "افحص كنكتور حساس IAT من تآكل", expectedResult: "نظيف" },
      { step: 2, action: "فحص المقاومة", details: "قس مقاومة الحساس عند درجات مختلفة", expectedResult: "تتغير مع الحرارة" },
      { step: 3, action: "فحص الأسلاك", details: "افحص قطع أو قصر في الأسلاك", expectedResult: "سليمة" },
    ],
    tools: [
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "intakeTemp", name: "Intake Temp", nameAr: "حرارة السحب", normalRange: "10-50", unit: "°C" },
    ],
    estimatedTime: "15-30 دقيقة",
    difficulty: "easy",
    difficultyAr: "سهل",
  },

  // ═══ P0101 - MAF Sensor Range/Performance ═══
  "P0101": {
    code: "P0101",
    steps: [
      { step: 1, action: "تنظيف حساس MAF", details: "استخدم منظف MAF مخصص (لا تلمس السلك)", expectedResult: "سلك نظيف" },
      { step: 2, action: "فحص فلتر الهواء", details: "تأكد من نظافة الفلتر وعدم انسداده", expectedResult: "نظيف" },
      { step: 3, action: "فحص تسريب بعد MAF", details: "افحص خرطوم الهواء بين MAF والخانق", expectedResult: "لا يوجد شق أو فتحة" },
      { step: 4, action: "فحص القراءة", details: "راقب قراءة MAF: خمول 2-7 g/s، 2000 RPM: 10-20 g/s", expectedResult: "ضمن المدى" },
    ],
    tools: [
      { name: "MAF Cleaner", nameAr: "منظف MAF", type: "basic" },
      { name: "OBD Scanner", nameAr: "جهاز OBD", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "mafRate", name: "MAF Rate", nameAr: "تدفق الهواء", normalRange: "2-7 خمول", unit: "g/s" },
      { pid: "engineLoad", name: "Engine Load", nameAr: "حمل المحرك", normalRange: "15-30", unit: "%" },
      { pid: "shortFuelTrim", name: "Short Fuel Trim", nameAr: "تعديل وقود", normalRange: "-5 إلى +5", unit: "%" },
    ],
    estimatedTime: "15-30 دقيقة",
    difficulty: "easy",
    difficultyAr: "سهل",
  },

  // ═══ P0106 - MAP Sensor Range/Performance ═══
  "P0106": {
    code: "P0106",
    steps: [
      { step: 1, action: "فحص خرطوم الفاكيوم", details: "افحص خرطوم الفاكيوم المتصل بحساس MAP", expectedResult: "سليم بدون شق" },
      { step: 2, action: "فحص الحساس", details: "قس جهد الحساس: مفتاح ON بدون تشغيل ~4.5V، خمول ~1.5V", expectedResult: "جهد صحيح" },
      { step: 3, action: "فحص بمضخة فاكيوم", details: "اسحب فاكيوم يدوياً وراقب تغير الجهد", expectedResult: "ينخفض مع الفاكيوم" },
    ],
    tools: [
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
      { name: "Vacuum Pump", nameAr: "مضخة فاكيوم يدوية", type: "advanced" },
    ],
    relatedPIDs: [
      { pid: "intakeManifold", name: "Intake Manifold", nameAr: "ضغط المانيفولد", normalRange: "25-35 خمول", unit: "kPa" },
      { pid: "engineLoad", name: "Engine Load", nameAr: "حمل المحرك", normalRange: "15-30", unit: "%" },
    ],
    estimatedTime: "20-40 دقيقة",
    difficulty: "easy",
    difficultyAr: "سهل",
  },

  // ═══ P0121 - Throttle Position Sensor Range ═══
  "P0121": {
    code: "P0121",
    steps: [
      { step: 1, action: "فحص جهد TPS", details: "قس جهد TPS: مغلق 0.5V، مفتوح كامل 4.5V", expectedResult: "تدرج سلس" },
      { step: 2, action: "فحص الحركة", details: "حرّك الخانق ببطء وراقب الجهد بالأفوميتر", expectedResult: "لا يوجد قفزات" },
      { step: 3, action: "فحص الأسلاك", details: "افحص أسلاك TPS من قطع أو تآكل", expectedResult: "سليمة" },
    ],
    tools: [
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "throttlePos", name: "Throttle Position", nameAr: "وضع الخانق", normalRange: "0-100", unit: "%" },
      { pid: "rpm", name: "Engine RPM", nameAr: "دورات المحرك", normalRange: "700-900", unit: "RPM" },
    ],
    estimatedTime: "15-30 دقيقة",
    difficulty: "easy",
    difficultyAr: "سهل",
  },

  // ═══ P0135 - O2 Heater Circuit (B1S1) ═══
  "P0135": {
    code: "P0135",
    steps: [
      { step: 1, action: "فحص فيوز حساس O2", details: "افحص فيوز دائرة السخان", expectedResult: "سليم" },
      { step: 2, action: "فحص مقاومة السخان", details: "قس مقاومة سخان الحساس (عادة 2-14Ω)", expectedResult: "ضمن المواصفات" },
      { step: 3, action: "فحص التغذية", details: "تأكد من وصول 12V لدائرة السخان", expectedResult: "12V موجود" },
      { step: 4, action: "استبدال الحساس", details: "إذا المقاومة لا نهائية = سخان محترق", expectedResult: "مقاومة طبيعية" },
    ],
    tools: [
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
      { name: "O2 Sensor Socket", nameAr: "مفتاح حساس O2", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "shortFuelTrim", name: "Short Fuel Trim", nameAr: "تعديل وقود", normalRange: "-5 إلى +5", unit: "%" },
    ],
    estimatedTime: "20-40 دقيقة",
    difficulty: "easy",
    difficultyAr: "سهل",
  },

  // ═══ P0174 - System Too Lean Bank 2 ═══
  "P0174": {
    code: "P0174",
    steps: [
      { step: 1, action: "فحص تسريب هواء Bank 2", details: "افحص خراطيم الفاكيوم وجوانات المانيفولد جهة Bank 2", expectedResult: "لا يوجد تسريب" },
      { step: 2, action: "فحص بخاخات Bank 2", details: "قس مقاومة بخاخات Bank 2", expectedResult: "12-16Ω متساوية" },
      { step: 3, action: "فحص ضغط الوقود", details: "قس ضغط الوقود", expectedResult: "35-65 PSI" },
    ],
    tools: [
      { name: "Smoke Machine", nameAr: "جهاز دخان", type: "specialized" },
      { name: "Fuel Pressure Gauge", nameAr: "مقياس ضغط وقود", type: "advanced" },
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "shortFuelTrim", name: "Short Fuel Trim B2", nameAr: "تعديل وقود قصير B2", normalRange: "-5 إلى +5", unit: "%" },
      { pid: "longFuelTrim", name: "Long Fuel Trim B2", nameAr: "تعديل وقود طويل B2", normalRange: "-10 إلى +10", unit: "%" },
    ],
    estimatedTime: "1-2 ساعة",
    difficulty: "medium",
    difficultyAr: "متوسط",
  },

  // ═══ P0325 - Knock Sensor 1 ═══
  "P0325": {
    code: "P0325",
    steps: [
      { step: 1, action: "فحص كنكتور الحساس", details: "افحص كنكتور حساس الطرق من تآكل أو ماء", expectedResult: "نظيف وجاف" },
      { step: 2, action: "فحص مقاومة الحساس", details: "قس المقاومة (عادة 500kΩ-5MΩ)", expectedResult: "ضمن المواصفات" },
      { step: 3, action: "فحص عزم الربط", details: "تأكد من ربط الحساس بالعزم الصحيح", expectedResult: "20-30 Nm" },
      { step: 4, action: "فحص الأسلاك", details: "افحص الأسلاك من ECU للحساس", expectedResult: "لا يوجد قطع أو قصر" },
    ],
    tools: [
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
      { name: "Torque Wrench", nameAr: "مفتاح عزم", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "timingAdvance", name: "Timing Advance", nameAr: "تقديم الإشعال", normalRange: "8-20", unit: "°" },
      { pid: "rpm", name: "Engine RPM", nameAr: "دورات المحرك", normalRange: "700-900", unit: "RPM" },
    ],
    estimatedTime: "30-90 دقيقة",
    difficulty: "medium",
    difficultyAr: "متوسط",
  },

  // ═══ P0341 - Camshaft Position Sensor Range ═══
  "P0341": {
    code: "P0341",
    steps: [
      { step: 1, action: "فحص سير/جنزير التوقيت", details: "تأكد من عدم قفز التوقيت", expectedResult: "علامات التوقيت متطابقة" },
      { step: 2, action: "فحص الحساس", details: "قس مقاومة حساس الكام", expectedResult: "ضمن المواصفات" },
      { step: 3, action: "فحص عجلة التوقيت", details: "افحص أسنان عجلة الكام من تلف", expectedResult: "أسنان سليمة" },
    ],
    tools: [
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
      { name: "Timing Light", nameAr: "مسدس توقيت", type: "advanced" },
    ],
    relatedPIDs: [
      { pid: "rpm", name: "Engine RPM", nameAr: "دورات المحرك", normalRange: "700-900", unit: "RPM" },
      { pid: "timingAdvance", name: "Timing Advance", nameAr: "تقديم الإشعال", normalRange: "8-20", unit: "°" },
    ],
    estimatedTime: "1-2 ساعة",
    difficulty: "hard",
    difficultyAr: "صعب",
  },

  // ═══ P0446 - EVAP Vent Control ═══
  "P0446": {
    code: "P0446",
    steps: [
      { step: 1, action: "فحص صمام التهوية", details: "افحص Vent Valve عند الخزان الخلفي", expectedResult: "يفتح ويغلق" },
      { step: 2, action: "فحص الفلتر", details: "افحص فلتر الكربون (Charcoal Canister)", expectedResult: "غير مشبع" },
      { step: 3, action: "فحص الأسلاك", details: "افحص تغذية وأرضي صمام التهوية", expectedResult: "12V + أرضي" },
    ],
    tools: [
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
      { name: "Smoke Machine", nameAr: "جهاز دخان", type: "specialized" },
    ],
    relatedPIDs: [
      { pid: "fuelLevel", name: "Fuel Level", nameAr: "مستوى الوقود", normalRange: "0-100", unit: "%" },
    ],
    estimatedTime: "30-60 دقيقة",
    difficulty: "medium",
    difficultyAr: "متوسط",
  },

  // ═══ P0011 - Camshaft Position Timing Over-Advanced (Bank 1) ═══
  "P0011": {
    code: "P0011",
    steps: [
      { step: 1, action: "فحص مستوى الزيت", details: "تأكد من مستوى ونوعية زيت المحرك", expectedResult: "مستوى صحيح، زيت نظيف" },
      { step: 2, action: "فحص صمام VVT/OCV", details: "افحص صمام التحكم بتوقيت الصمامات", expectedResult: "يتحرك بحرية" },
      { step: 3, action: "فحص جنزير التوقيت", details: "استمع لصوت خشخشة عند التشغيل البارد", expectedResult: "لا يوجد صوت" },
      { step: 4, action: "تغيير الزيت", details: "غيّر الزيت بالنوع الموصى من المصنع", expectedResult: "أداء أفضل" },
    ],
    tools: [
      { name: "Oil Level Dipstick", nameAr: "عصا قياس الزيت", type: "basic" },
      { name: "Stethoscope", nameAr: "سماعة ميكانيكي", type: "basic" },
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "rpm", name: "Engine RPM", nameAr: "دورات المحرك", normalRange: "700-900", unit: "RPM" },
      { pid: "oilTemp", name: "Oil Temperature", nameAr: "حرارة الزيت", normalRange: "80-120", unit: "°C" },
      { pid: "timingAdvance", name: "Timing Advance", nameAr: "تقديم الإشعال", normalRange: "8-20", unit: "°" },
    ],
    estimatedTime: "30-60 دقيقة",
    difficulty: "medium",
    difficultyAr: "متوسط",
  },

  // ═══ P0016 - Crankshaft/Camshaft Correlation (Bank 1) ═══
  "P0016": {
    code: "P0016",
    steps: [
      { step: 1, action: "فحص زيت المحرك", details: "تأكد من مستوى ونوعية الزيت", expectedResult: "صحيح" },
      { step: 2, action: "فحص جنزير/سير التوقيت", details: "افحص شد الجنزير وعلامات التوقيت", expectedResult: "متطابقة" },
      { step: 3, action: "فحص VVT Solenoid", details: "افحص صمام VVT Bank 1", expectedResult: "يعمل" },
      { step: 4, action: "فحص حساسات CKP/CMP", details: "افحص إشارة حساس الكرنك والكام", expectedResult: "إشارة صحيحة" },
    ],
    tools: [
      { name: "Timing Light", nameAr: "مسدس توقيت", type: "advanced" },
      { name: "Oscilloscope", nameAr: "أوسيلوسكوب", type: "specialized" },
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "rpm", name: "Engine RPM", nameAr: "دورات المحرك", normalRange: "700-900", unit: "RPM" },
      { pid: "timingAdvance", name: "Timing Advance", nameAr: "تقديم الإشعال", normalRange: "8-20", unit: "°" },
    ],
    estimatedTime: "1-3 ساعات",
    difficulty: "hard",
    difficultyAr: "صعب",
    safetyWarning: "⚠️ قد يسبب تلف المحرك إذا تم تجاهله",
  },

  // ═══ P0030 - O2 Heater Control Circuit (B1S1) ═══
  "P0030": {
    code: "P0030",
    steps: [
      { step: 1, action: "فحص الفيوز", details: "افحص فيوز دائرة سخان O2", expectedResult: "سليم" },
      { step: 2, action: "فحص مقاومة السخان", details: "قس مقاومة السخان (2-14Ω)", expectedResult: "ضمن المدى" },
      { step: 3, action: "فحص الأسلاك", details: "افحص أسلاك السخان من ECU للحساس", expectedResult: "سليمة" },
    ],
    tools: [
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
      { name: "Fuse Tester", nameAr: "فاحص فيوزات", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "shortFuelTrim", name: "Short Fuel Trim", nameAr: "تعديل وقود", normalRange: "-5 إلى +5", unit: "%" },
    ],
    estimatedTime: "15-30 دقيقة",
    difficulty: "easy",
    difficultyAr: "سهل",
  },

  // ═══ P0220 - Throttle Position Sensor B ═══
  "P0220": {
    code: "P0220",
    steps: [
      { step: 1, action: "فحص جهد TPS B", details: "قس جهد الحساس الثاني (يعاكس الأول)", expectedResult: "4.5V مغلق، 0.5V مفتوح" },
      { step: 2, action: "فحص الكنكتور", details: "افحص أطراف الكنكتور", expectedResult: "نظيف" },
      { step: 3, action: "فحص بوابة الخانق", details: "قد تحتاج استبدال بوابة الخانق كاملة (electronic throttle)", expectedResult: "حركة سلسة" },
    ],
    tools: [
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "throttlePos", name: "Throttle Position", nameAr: "وضع الخانق", normalRange: "0-100", unit: "%" },
      { pid: "rpm", name: "Engine RPM", nameAr: "دورات المحرك", normalRange: "700-900", unit: "RPM" },
    ],
    estimatedTime: "20-40 دقيقة",
    difficulty: "easy",
    difficultyAr: "سهل",
  },

  // ═══ P0562 - System Voltage Low ═══
  "P0562": {
    code: "P0562",
    steps: [
      { step: 1, action: "فحص البطارية", details: "قس جهد البطارية (12.4-12.7V مطفي، 13.5-14.5V شغال)", expectedResult: "جهد صحيح" },
      { step: 2, action: "فحص الدينمو", details: "قس خرج الدينمو عند 2000 RPM", expectedResult: "13.5-14.5V" },
      { step: 3, action: "فحص سير الدينمو", details: "تأكد من شد السير وعدم انزلاقه", expectedResult: "مشدود" },
      { step: 4, action: "فحص الأرضيات", details: "افحص أسلاك الأرضي من البطارية للشاسيه والمحرك", expectedResult: "نظيفة ومحكمة" },
    ],
    tools: [
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
      { name: "Battery Tester", nameAr: "فاحص بطاريات", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "voltage", name: "Battery Voltage", nameAr: "جهد البطارية", normalRange: "13.5-14.5", unit: "V" },
    ],
    estimatedTime: "15-30 دقيقة",
    difficulty: "easy",
    difficultyAr: "سهل",
  },

  // ═══ P0700 - Transmission Control System ═══
  "P0700": {
    code: "P0700",
    steps: [
      { step: 1, action: "قراءة أكواد القير", details: "P0700 يعني وجود كود في TCM - اقرأ أكواد القير", expectedResult: "كود محدد" },
      { step: 2, action: "فحص زيت القير", details: "افحص مستوى ولون زيت القير", expectedResult: "أحمر شفاف، مستوى صحيح" },
      { step: 3, action: "فحص الكنكتورات", details: "افحص كنكتور TCM والسولينويدات", expectedResult: "سليمة" },
    ],
    tools: [
      { name: "OBD Scanner", nameAr: "جهاز OBD متقدم", type: "advanced" },
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "speed", name: "Vehicle Speed", nameAr: "السرعة", normalRange: "0-200", unit: "km/h" },
      { pid: "rpm", name: "Engine RPM", nameAr: "دورات المحرك", normalRange: "700-900", unit: "RPM" },
    ],
    estimatedTime: "30-60 دقيقة",
    difficulty: "hard",
    difficultyAr: "صعب",
  },

  // ═══ P0715 - Input/Turbine Speed Sensor ═══
  "P0715": {
    code: "P0715",
    steps: [
      { step: 1, action: "فحص مستوى زيت القير", details: "مستوى منخفض يؤثر على الحساس", expectedResult: "مستوى صحيح" },
      { step: 2, action: "فحص الحساس", details: "قس مقاومة حساس سرعة الإدخال", expectedResult: "ضمن المواصفات" },
      { step: 3, action: "فحص الكنكتور", details: "افحص الكنكتور من زيت أو تآكل", expectedResult: "نظيف" },
    ],
    tools: [
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "speed", name: "Vehicle Speed", nameAr: "السرعة", normalRange: "0-200", unit: "km/h" },
      { pid: "rpm", name: "Engine RPM", nameAr: "دورات المحرك", normalRange: "700-900", unit: "RPM" },
    ],
    estimatedTime: "30-60 دقيقة",
    difficulty: "medium",
    difficultyAr: "متوسط",
  },

  // ═══ P2096 - Post Catalyst Fuel Trim Too Lean (B1) ═══
  "P2096": {
    code: "P2096",
    steps: [
      { step: 1, action: "فحص تسريب عادم", details: "افحص تسريب قبل حساس O2 الثاني", expectedResult: "لا يوجد تسريب" },
      { step: 2, action: "فحص حساس O2 B1S2", details: "راقب جهد الحساس الثاني", expectedResult: "~0.45V ثابت" },
      { step: 3, action: "فحص الكتلايزر", details: "قد يكون الكتلايزر بدأ يضعف", expectedResult: "فرق حرارة 20-50°C" },
    ],
    tools: [
      { name: "OBD Scanner", nameAr: "جهاز OBD", type: "basic" },
      { name: "IR Thermometer", nameAr: "ميزان حرارة ليزري", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "catalystTemp", name: "Catalyst Temp", nameAr: "حرارة الكتلايزر", normalRange: "400-800", unit: "°C" },
      { pid: "shortFuelTrim", name: "Short Fuel Trim", nameAr: "تعديل وقود", normalRange: "-5 إلى +5", unit: "%" },
    ],
    estimatedTime: "30-60 دقيقة",
    difficulty: "medium",
    difficultyAr: "متوسط",
  },

  // ═══ P2135 - Throttle Position Correlation ═══
  "P2135": {
    code: "P2135",
    steps: [
      { step: 1, action: "فحص كنكتور الخانق", details: "افصل وأعد توصيل كنكتور بوابة الخانق الإلكترونية", expectedResult: "محكم" },
      { step: 2, action: "فحص جهد TPS A و B", details: "يجب أن يكون مجموعهما ~5V دائماً", expectedResult: "A + B = 5V" },
      { step: 3, action: "فحص الأسلاك", details: "افحص أسلاك 5V reference والأرضي", expectedResult: "سليمة" },
      { step: 4, action: "استبدال بوابة الخانق", details: "إذا فشل كل شيء، استبدل الخانق الإلكتروني", expectedResult: "عمل طبيعي" },
    ],
    tools: [
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
      { name: "Oscilloscope", nameAr: "أوسيلوسكوب", type: "specialized" },
    ],
    relatedPIDs: [
      { pid: "throttlePos", name: "Throttle Position", nameAr: "وضع الخانق", normalRange: "0-100", unit: "%" },
      { pid: "rpm", name: "Engine RPM", nameAr: "دورات المحرك", normalRange: "700-900", unit: "RPM" },
    ],
    estimatedTime: "30-60 دقيقة",
    difficulty: "medium",
    difficultyAr: "متوسط",
    safetyWarning: "⚠️ قد يدخل المحرك وضع الطوارئ (Limp Mode) - لا تقود بسرعة عالية",
  },

  // ═══ P0456 - EVAP Very Small Leak ═══
  "P0456": {
    code: "P0456",
    steps: [
      { step: 1, action: "استبدال غطاء البنزين", details: "أسهل وأرخص حل - استبدل الغطاء", expectedResult: "الكود يختفي بعد 3 دورات" },
      { step: 2, action: "فحص بجهاز دخان", details: "إذا عاد الكود، استخدم جهاز دخان", expectedResult: "تسريب صغير جداً" },
    ],
    tools: [
      { name: "Smoke Machine", nameAr: "جهاز دخان", type: "specialized" },
    ],
    relatedPIDs: [
      { pid: "fuelLevel", name: "Fuel Level", nameAr: "مستوى الوقود", normalRange: "0-100", unit: "%" },
    ],
    estimatedTime: "10-30 دقيقة",
    difficulty: "easy",
    difficultyAr: "سهل",
  },

  // ═══ P0430 - Catalyst System Efficiency Below Threshold (Bank 2) ═══
  "P0430": {
    code: "P0430",
    steps: [
      { step: 1, action: "فحص حساسات O2 Bank 2", details: "راقب S1 vs S2 Bank 2", expectedResult: "S2 ثابت" },
      { step: 2, action: "فحص تسريب العادم", details: "افحص وصلات العادم Bank 2", expectedResult: "لا يوجد تسريب" },
      { step: 3, action: "فحص حرارة الكتلايزر", details: "قس مدخل ومخرج كتلايزر Bank 2", expectedResult: "المخرج أعلى" },
    ],
    tools: [
      { name: "OBD Scanner", nameAr: "جهاز OBD", type: "basic" },
      { name: "IR Thermometer", nameAr: "ميزان حرارة ليزري", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "catalystTemp", name: "Catalyst Temp", nameAr: "حرارة الكتلايزر", normalRange: "400-800", unit: "°C" },
    ],
    estimatedTime: "30 دقيقة",
    difficulty: "easy",
    difficultyAr: "سهل",
  },

  // ═══ P0401 already added above ═══

  // ═══ C0035 - Left Front Wheel Speed Sensor ═══
  "C0035": {
    code: "C0035",
    steps: [
      { step: 1, action: "فحص الحساس", details: "افحص حساس السرعة الأمامي الأيسر من تلف", expectedResult: "سليم" },
      { step: 2, action: "فحص الفجوة", details: "تأكد من فجوة الحساس مع حلقة ABS", expectedResult: "0.5-1.5mm" },
      { step: 3, action: "فحص حلقة ABS", details: "افحص أسنان حلقة ABS من تلف أو أوساخ", expectedResult: "نظيفة وسليمة" },
      { step: 4, action: "فحص الأسلاك", details: "افحص أسلاك الحساس من قطع (خصوصاً عند المفصل)", expectedResult: "سليمة" },
    ],
    tools: [
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
      { name: "Jack & Stands", nameAr: "رافعة وحوامل", type: "basic" },
    ],
    relatedPIDs: [
      { pid: "speed", name: "Vehicle Speed", nameAr: "السرعة", normalRange: "0-200", unit: "km/h" },
    ],
    estimatedTime: "30-60 دقيقة",
    difficulty: "medium",
    difficultyAr: "متوسط",
  },

  // ═══ B0100 - Driver Frontal Airbag ═══
  "B0100": {
    code: "B0100",
    steps: [
      { step: 1, action: "فحص كنكتور الوسادة", details: "افحص كنكتور وسادة السائق (تحت المقود)", expectedResult: "محكم" },
      { step: 2, action: "فحص Clock Spring", details: "افحص شريط الساعة (Clock Spring) في المقود", expectedResult: "سليم" },
      { step: 3, action: "فحص مقاومة الوسادة", details: "قس مقاومة الوسادة (2-4Ω عادة)", expectedResult: "ضمن المواصفات" },
    ],
    tools: [
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
      { name: "SRS Simulator", nameAr: "محاكي SRS", type: "specialized" },
    ],
    relatedPIDs: [],
    estimatedTime: "30-60 دقيقة",
    difficulty: "hard",
    difficultyAr: "صعب",
    safetyWarning: "⚠️ خطر انفجار الوسادة! افصل البطارية وانتظر 10 دقائق قبل العمل",
  },

  // ═══ U0100 - Lost Communication with ECM/PCM ═══
  "U0100": {
    code: "U0100",
    steps: [
      { step: 1, action: "فحص البطارية", details: "جهد منخفض يسبب فقدان اتصال", expectedResult: "12.4V+" },
      { step: 2, action: "فحص فيوزات ECM", details: "افحص جميع فيوزات كمبيوتر المحرك", expectedResult: "سليمة" },
      { step: 3, action: "فحص أسلاك CAN", details: "افحص CAN-H و CAN-L (عادة ملتوية معاً)", expectedResult: "60Ω بين H و L" },
      { step: 4, action: "فحص كنكتور ECM", details: "افحص كنكتور الكمبيوتر من ماء أو تآكل", expectedResult: "نظيف" },
    ],
    tools: [
      { name: "Multimeter", nameAr: "أفوميتر", type: "basic" },
      { name: "Oscilloscope", nameAr: "أوسيلوسكوب", type: "specialized" },
    ],
    relatedPIDs: [
      { pid: "voltage", name: "Battery Voltage", nameAr: "جهد البطارية", normalRange: "13.5-14.5", unit: "V" },
    ],
    estimatedTime: "1-3 ساعات",
    difficulty: "expert",
    difficultyAr: "خبير",
  },
};

// ═══════════════════════════════════════════════════════
// LOOKUP FUNCTION
// ═══════════════════════════════════════════════════════

/**
 * البحث عن خطوات فحص كود معين
 */
export function getDiagnosticSteps(code: string): DTCDiagnosticInfo | undefined {
  return DTC_DIAGNOSTIC_DATABASE[code.toUpperCase()];
}

/**
 * الحصول على عدد الأكواد التي لها خطوات فحص
 */
export function getDiagnosticCodesCount(): number {
  return Object.keys(DTC_DIAGNOSTIC_DATABASE).length;
}

/**
 * الحصول على جميع الأدوات المطلوبة لمجموعة أكواد
 */
export function getRequiredToolsForCodes(codes: string[]): RequiredTool[] {
  const toolsMap = new Map<string, RequiredTool>();
  codes.forEach(code => {
    const info = DTC_DIAGNOSTIC_DATABASE[code.toUpperCase()];
    if (info) {
      info.tools.forEach(tool => {
        if (!toolsMap.has(tool.name)) {
          toolsMap.set(tool.name, tool);
        }
      });
    }
  });
  return Array.from(toolsMap.values());
}
