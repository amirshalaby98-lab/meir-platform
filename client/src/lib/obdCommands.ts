/**
 * OBD2 Commands Reference - مرجع أوامر ELM327 و OBD-II
 * ═══════════════════════════════════════════════════════
 * جميع أوامر AT و OBD مفصولة في مكان واحد
 * لسهولة الصيانة والتوثيق والتعديل
 * 
 * @version 1.0.0
 * @author مير - Meir Diagnostics
 */

// ═══════════════════════════════════════════════════════
// ELM327 AT COMMANDS - أوامر التحكم بالمحول
// ═══════════════════════════════════════════════════════

export const ELM_COMMANDS = {
  /** إعادة ضبط المحول */
  RESET: "ATZ",
  /** إيقاف الصدى (Echo Off) */
  ECHO_OFF: "ATE0",
  /** إيقاف Line Feed */
  LINEFEED_OFF: "ATL0",
  /** إيقاف المسافات في الردود */
  SPACES_OFF: "ATS0",
  /** إيقاف Headers في الردود */
  HEADERS_OFF: "ATH0",
  /** تفعيل Headers في الردود */
  HEADERS_ON: "ATH1",
  /** اكتشاف البروتوكول تلقائياً */
  AUTO_PROTOCOL: "ATSP0",
  /** عرض البروتوكول الحالي (نص) */
  DESCRIBE_PROTOCOL: "ATDP",
  /** عرض البروتوكول الحالي (رقم) */
  DESCRIBE_PROTOCOL_NUM: "ATDPN",
  /** Adaptive Timing Level 1 */
  ADAPTIVE_TIMING_1: "ATAT1",
  /** Adaptive Timing Level 2 (أسرع) */
  ADAPTIVE_TIMING_2: "ATAT2",
  /** تعيين Timeout أقصى */
  SET_TIMEOUT_MAX: "ATST FF",
  /** تعيين Header للـ ECU المستهدف */
  SET_HEADER: (header: string) => `ATSH${header}`,
  /** Header الافتراضي (Broadcast) */
  SET_HEADER_BROADCAST: "ATSH7DF",
  /** Header ECU المحرك */
  SET_HEADER_ENGINE: "ATSH7E0",
  /** تعيين بروتوكول محدد */
  SET_PROTOCOL: (num: number) => `ATSP${num}`,
  /** Flow Control - تعيين بيانات */
  FC_SET_DATA: (data: string) => `ATFCSD${data}`,
  /** Flow Control - تعيين Header */
  FC_SET_HEADER: (header: string) => `ATFCSH${header}`,
  /** Flow Control - وضع عادي */
  FC_MODE_NORMAL: "ATFCSM0",
  /** Flow Control - وضع مخصص */
  FC_MODE_CUSTOM: "ATFCSM1",
} as const;

// ═══════════════════════════════════════════════════════
// PROTOCOL NUMBERS - أرقام البروتوكولات
// ═══════════════════════════════════════════════════════

export const PROTOCOL_NUMBERS = {
  AUTO: 0,
  SAE_J1850_PWM: 1,
  SAE_J1850_VPW: 2,
  ISO_9141_2: 3,
  KWP2000_5BAUD: 4,
  KWP2000_FAST: 5,
  CAN_11BIT_500K: 6,
  CAN_29BIT_500K: 7,
  CAN_11BIT_250K: 8,
  CAN_29BIT_250K: 9,
} as const;

// ═══════════════════════════════════════════════════════
// OBD-II MODE 01 - CURRENT DATA (القراءات الحية)
// ═══════════════════════════════════════════════════════

export const MODE01 = {
  /** PIDs المدعومة [01-20] */
  SUPPORTED_PIDS_01_20: "0100",
  /** حالة الشاشات + MIL */
  MONITOR_STATUS: "0101",
  /** Freeze Frame DTC */
  FREEZE_DTC: "0102",
  /** حالة نظام الوقود */
  FUEL_SYSTEM_STATUS: "0103",
  /** حمل المحرك المحسوب */
  ENGINE_LOAD: "0104",
  /** حرارة سائل التبريد */
  COOLANT_TEMP: "0105",
  /** Short Fuel Trim Bank 1 */
  SHORT_FUEL_TRIM_B1: "0106",
  /** Long Fuel Trim Bank 1 */
  LONG_FUEL_TRIM_B1: "0107",
  /** Short Fuel Trim Bank 2 */
  SHORT_FUEL_TRIM_B2: "0108",
  /** Long Fuel Trim Bank 2 */
  LONG_FUEL_TRIM_B2: "0109",
  /** ضغط الوقود (Gauge) */
  FUEL_PRESSURE: "010A",
  /** ضغط المانيفولد MAP */
  INTAKE_MAP: "010B",
  /** عدد دورات المحرك RPM */
  RPM: "010C",
  /** سرعة السيارة */
  SPEED: "010D",
  /** توقيت الإشعال */
  TIMING_ADVANCE: "010E",
  /** حرارة سحب الهواء */
  INTAKE_AIR_TEMP: "010F",
  /** تدفق الهواء MAF */
  MAF_RATE: "0110",
  /** وضعية الخانق */
  THROTTLE_POS: "0111",
  /** حساس O2 Bank 1 Sensor 1 */
  O2_B1S1: "0114",
  /** حساس O2 Bank 1 Sensor 2 */
  O2_B1S2: "0115",
  /** حساس O2 Bank 2 Sensor 1 */
  O2_B2S1: "0116",
  /** حساس O2 Bank 2 Sensor 2 */
  O2_B2S2: "0117",
  /** معيار OBD المدعوم */
  OBD_STANDARD: "011C",
  /** وقت التشغيل */
  RUN_TIME: "011F",
  /** PIDs المدعومة [21-40] */
  SUPPORTED_PIDS_21_40: "0120",
  /** مسافة مع MIL مشتعل */
  DISTANCE_WITH_MIL: "0121",
  /** ضغط قضيب الوقود */
  FUEL_RAIL_PRESSURE: "0123",
  /** EGR المأمور */
  EGR_COMMANDED: "012C",
  /** مستوى الوقود */
  FUEL_LEVEL: "012F",
  /** PIDs المدعومة [31-40] */
  SUPPORTED_PIDS_31_40: "0130",
  /** مسافة منذ مسح الأكواد */
  DISTANCE_SINCE_CLEAR: "0131",
  /** ضغط جوي */
  BAROMETRIC_PRESSURE: "0133",
  /** حرارة الكاتلايزر B1S1 */
  CATALYST_TEMP_B1S1: "013C",
  /** PIDs المدعومة [41-60] */
  SUPPORTED_PIDS_41_60: "0140",
  /** جهد البطارية */
  CONTROL_MODULE_VOLTAGE: "0142",
  /** حمل المحرك المطلق */
  ABSOLUTE_LOAD: "0143",
  /** الخانق النسبي */
  RELATIVE_THROTTLE: "0145",
  /** حرارة محيطة */
  AMBIENT_TEMP: "0146",
  /** الخانق المأمور */
  COMMANDED_THROTTLE: "014C",
  /** وقت تشغيل مع MIL */
  RUN_TIME_WITH_MIL: "014D",
  /** نوع الوقود */
  FUEL_TYPE: "0151",
  /** نسبة الإيثانول */
  ETHANOL_PERCENT: "0152",
  /** حرارة الزيت */
  OIL_TEMP: "015C",
  /** حرارة القير */
  TRANS_TEMP: "015E",
  /** عزم المحرك */
  ENGINE_TORQUE: "0162",
  /** ضغط التوربو */
  TURBO_PRESSURE: "0170",

  // ═══ Multi-PID (قراءة متعددة في أمر واحد) ═══
  /** RPM + Speed + Coolant + Load + Throttle + Voltage */
  MULTI_CORE: "010C0D050411",
  /** Short/Long Fuel Trim + MAP + Intake Temp + Voltage */
  MULTI_FUEL: "0106070B0F42",
} as const;

// ═══════════════════════════════════════════════════════
// OBD-II MODE 02 - FREEZE FRAME DATA
// ═══════════════════════════════════════════════════════

export const MODE02 = {
  /** قراءة Freeze Frame لـ PID محدد */
  READ: (pid: string) => `02${pid}00`,
} as const;

// ═══════════════════════════════════════════════════════
// OBD-II MODE 03 - CONFIRMED DTCs (أكواد مؤكدة)
// ═══════════════════════════════════════════════════════

export const MODE03 = {
  /** قراءة جميع الأكواد المؤكدة */
  READ_DTCS: "03",
} as const;

// ═══════════════════════════════════════════════════════
// OBD-II MODE 04 - CLEAR DTCs (مسح الأكواد)
// ═══════════════════════════════════════════════════════

export const MODE04 = {
  /** مسح جميع الأكواد + إطفاء MIL */
  CLEAR_DTCS: "04",
} as const;

// ═══════════════════════════════════════════════════════
// OBD-II MODE 05 - O2 SENSOR MONITORING
// ═══════════════════════════════════════════════════════

export const MODE05 = {
  /** قراءة O2 Sensor Test */
  READ: (testId: string, sensorId: string) => `05${testId}${sensorId}`,
} as const;

// ═══════════════════════════════════════════════════════
// OBD-II MODE 06 - ON-BOARD MONITORING TESTS
// ═══════════════════════════════════════════════════════

export const MODE06 = {
  /** قراءة جميع اختبارات Mode 6 */
  READ_ALL: "0600",
  /** قراءة اختبار محدد */
  READ_TEST: (testId: string) => `06${testId}`,
} as const;

// ═══════════════════════════════════════════════════════
// OBD-II MODE 07 - PENDING DTCs (أكواد معلقة)
// ═══════════════════════════════════════════════════════

export const MODE07 = {
  /** قراءة الأكواد المعلقة */
  READ_PENDING: "07",
} as const;

// ═══════════════════════════════════════════════════════
// OBD-II MODE 08 - CONTROL OPERATIONS (تحكم)
// ═══════════════════════════════════════════════════════

export const MODE08 = {
  /** تشغيل اختبار محدد */
  RUN_TEST: (testId: string) => `08${testId}`,
} as const;

// ═══════════════════════════════════════════════════════
// OBD-II MODE 09 - VEHICLE INFORMATION
// ═══════════════════════════════════════════════════════

export const MODE09 = {
  /** قراءة رقم الهيكل VIN */
  READ_VIN: "0902",
  /** قراءة Calibration ID */
  READ_CAL_ID: "0904",
  /** قراءة اسم ECU */
  READ_ECU_NAME: "090A",
} as const;

// ═══════════════════════════════════════════════════════
// OBD-II MODE 0A - PERMANENT DTCs
// ═══════════════════════════════════════════════════════

export const MODE0A = {
  /** قراءة الأكواد الدائمة */
  READ_PERMANENT: "0A",
} as const;

// ═══════════════════════════════════════════════════════
// ECU HEADERS - عناوين الوحدات الإلكترونية
// ═══════════════════════════════════════════════════════

export const ECU_HEADERS = {
  /** Broadcast - جميع الوحدات */
  BROADCAST: "7DF",
  /** ECM - وحدة المحرك */
  ENGINE: "7E0",
  /** TCM - وحدة القير */
  TRANSMISSION: "7E1",
  /** ABS - نظام الفرامل */
  ABS: "7B0",
  /** SRS - الوسائد الهوائية */
  AIRBAG: "7B7",
  /** BCM - وحدة الهيكل */
  BCM: "7C0",
  /** EPS - التوجيه الكهربائي */
  EPS: "730",
  /** HVAC - المكيف */
  HVAC: "7C4",
  /** IC - لوحة العدادات */
  INSTRUMENT_CLUSTER: "720",
} as const;

// ═══════════════════════════════════════════════════════
// RESPONSE PREFIXES - بادئات الردود المتوقعة
// ═══════════════════════════════════════════════════════

export const RESPONSE_PREFIX = {
  MODE01: "41",
  MODE02: "42",
  MODE03: "43",
  MODE04: "44",
  MODE05: "45",
  MODE06: "46",
  MODE07: "47",
  MODE09: "49",
  MODE0A: "4A",
} as const;

// ═══════════════════════════════════════════════════════
// ERROR RESPONSES - ردود الخطأ من ELM327
// ═══════════════════════════════════════════════════════

export const ELM_ERRORS = {
  NO_DATA: "NODATA",
  ERROR: "ERROR",
  UNABLE_TO_CONNECT: "UNABLETOCONNECT",
  BUS_INIT_ERROR: "BUSINIT...ERROR",
  CAN_ERROR: "CANERROR",
  BUFFER_FULL: "BUFFERFULL",
  SEARCHING: "SEARCHING...",
  QUESTION_MARK: "?",
} as const;

// ═══════════════════════════════════════════════════════
// RESPONSE CLEANING - تنظيف الردود
// ═══════════════════════════════════════════════════════

/** الأنماط التي يجب إزالتها من ردود ELM327 قبل التحليل */
export const RESPONSE_NOISE_PATTERNS = [
  />/g,
  /OK/g,
  /SEARCHING\.\.\./g,
  /NO DATA/g,
  /\?/g,
  /\r/g,
  /\n/g,
] as const;

/**
 * تنظيف رد ELM327 من الضوضاء
 */
export function cleanELMResponse(raw: string): string {
  let cleaned = raw;
  for (const pattern of RESPONSE_NOISE_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }
  return cleaned.replace(/\s+/g, " ").trim();
}

/**
 * التحقق مما إذا كان الرد يحتوي على خطأ
 */
export function isErrorResponse(response: string): boolean {
  const upper = response.toUpperCase().replace(/\s/g, "");
  return (
    upper.includes(ELM_ERRORS.NO_DATA) ||
    upper.includes(ELM_ERRORS.ERROR) ||
    upper.includes(ELM_ERRORS.UNABLE_TO_CONNECT) ||
    upper.includes(ELM_ERRORS.CAN_ERROR) ||
    upper === ELM_ERRORS.QUESTION_MARK
  );
}

// ═══════════════════════════════════════════════════════
// TIMEOUTS - أوقات الانتظار (ms)
// ═══════════════════════════════════════════════════════

export const TIMEOUTS = {
  /** أمر AT عادي */
  AT_COMMAND: 2000,
  /** أمر ATZ (Reset) */
  AT_RESET: 5000,
  /** قراءة PID واحد */
  SINGLE_PID: 3000,
  /** قراءة Multi-PID */
  MULTI_PID: 4000,
  /** قراءة DTC */
  READ_DTC: 5000,
  /** مسح DTC */
  CLEAR_DTC: 5000,
  /** قراءة VIN */
  READ_VIN: 8000,
  /** اكتشاف البروتوكول */
  PROTOCOL_DETECT: 10000,
  /** اتصال GATT */
  GATT_CONNECT: 15000,
  /** Mode 6 Tests */
  MODE6: 5000,
  /** O2 Sensors */
  O2_SENSORS: 5000,
  /** Freeze Frame */
  FREEZE_FRAME: 5000,
  /** إعادة اتصال تلقائي */
  AUTO_RECONNECT: 10000,
} as const;

// ═══════════════════════════════════════════════════════
// BLE CONSTANTS - ثوابت Bluetooth
// ═══════════════════════════════════════════════════════

export const BLE_CONSTANTS = {
  /** حجم MTU الافتراضي */
  MTU_SIZE: 20,
  /** تأخير بين chunks */
  CHUNK_DELAY: 10,
  /** تأخير بين الأوامر */
  COMMAND_DELAY: 50,
} as const;
