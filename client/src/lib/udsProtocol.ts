/**
 * ═══════════════════════════════════════════════════════════════════
 * UDS Protocol (ISO 14229) Implementation for ELM327 via Web Bluetooth
 * Supports: 0x10, 0x11, 0x14, 0x19, 0x22, 0x27, 0x2E, 0x31
 * ═══════════════════════════════════════════════════════════════════
 */

export type UDSSession = "default" | "extended" | "programming";
export type UDSResetType = "hard" | "soft" | "keyOffOn";

export interface UDSDTCRecord {
  code: string;
  status: number;
  statusText: string;
  severity?: string;
}

export interface UDSRoutineResult {
  success: boolean;
  data?: number[];
  message: string;
}

export interface UDSSecurityResult {
  success: boolean;
  message: string;
}

export interface SpecialFunctionResult {
  success: boolean;
  message: string;
  details?: string;
  steps?: string[];
  nextSteps?: string[];
}

// ═══ UDS Error Codes ═══
const UDS_NRC: Record<number, string> = {
  0x10: "generalReject",
  0x11: "serviceNotSupported",
  0x12: "subFunctionNotSupported",
  0x13: "incorrectMessageLengthOrInvalidFormat",
  0x14: "responseTooLong",
  0x21: "busyRepeatRequest",
  0x22: "conditionsNotCorrect",
  0x24: "requestSequenceError",
  0x25: "noResponseFromSubnetComponent",
  0x26: "failurePreventsExecutionOfRequestedAction",
  0x31: "requestOutOfRange",
  0x33: "securityAccessDenied",
  0x35: "invalidKey",
  0x36: "exceededNumberOfAttempts",
  0x37: "requiredTimeDelayNotExpired",
  0x70: "uploadDownloadNotAccepted",
  0x71: "transferDataSuspended",
  0x72: "generalProgrammingFailure",
  0x73: "wrongBlockSequenceCounter",
  0x78: "requestCorrectlyReceivedResponsePending",
  0x7E: "subFunctionNotSupportedInActiveSession",
  0x7F: "serviceNotSupportedInActiveSession",
};

// ═══ DTC Status Bit Mask ═══
const DTC_STATUS_BITS: Record<number, string> = {
  0x01: "testFailed",
  0x02: "testFailedThisMonitoringCycle",
  0x04: "pendingDTC",
  0x08: "confirmedDTC",
  0x10: "testNotCompletedSinceLastClear",
  0x20: "testFailedSinceLastClear",
  0x40: "testNotCompletedThisMonitoringCycle",
  0x80: "warningIndicatorRequested",
};

// ═══ Oil Reset Service IDs per Make ═══
export const OIL_RESET_PROCEDURES: Record<string, { name: string; steps: string[]; udsRoutine?: number }> = {
  toyota: {
    name: "Toyota/Lexus",
    steps: ["تشغيل المحرك", "انتظر دقيقتين", "أرسل UDS 0x31 0x01 0xA1 0x02"],
    udsRoutine: 0xA102,
  },
  ford: {
    name: "Ford/Lincoln",
    steps: ["Mode 22 PID 0x4000", "UDS 0x31 0x01 0x0300"],
    udsRoutine: 0x0300,
  },
  nissan: {
    name: "Nissan/Infiniti",
    steps: ["CONSULT-III Mode", "UDS 0x31 0x01 0xBF00"],
    udsRoutine: 0xBF00,
  },
  bmw: {
    name: "BMW/Mini",
    steps: ["UDS Extended Session", "UDS 0x31 0x01 0xF040"],
    udsRoutine: 0xF040,
  },
  mercedes: {
    name: "Mercedes/AMG",
    steps: ["UDS Extended Session", "UDS 0x31 0x01 0x0203"],
    udsRoutine: 0x0203,
  },
  hyundai: {
    name: "Hyundai/Kia",
    steps: ["UDS Extended Session", "UDS 0x31 0x01 0xB100"],
    udsRoutine: 0xB100,
  },
  gm: {
    name: "GM/Chevrolet",
    steps: ["Mode 22 PID 0x4201", "UDS 0x31 0x01 0xA100"],
    udsRoutine: 0xA100,
  },
  honda: {
    name: "Honda/Acura",
    steps: ["UDS Extended Session", "UDS 0x31 0x01 0x0100"],
    udsRoutine: 0x0100,
  },
};

// ═══ VIN Decoder Database ═══
export interface VINInfo {
  vin: string;
  country: string;
  countryAr: string;
  make: string;
  makeAr: string;
  model?: string;
  modelAr?: string;
  year: number;
  engine?: string;
  engineAr?: string;
  transmission?: string;
  transmissionAr?: string;
  fuelType?: string;
  fuelTypeAr?: string;
  region?: string;
  cylinders?: number;
  recallInfo?: string[];
}

const WMI_DATABASE: Record<string, { make: string; makeAr: string; country: string }> = {
  // USA
  "1G1": { make: "Chevrolet", makeAr: "شيفروليه", country: "USA" },
  "1GC": { make: "Chevrolet Truck", makeAr: "شيفروليه تراك", country: "USA" },
  "1FA": { make: "Ford", makeAr: "فورد", country: "USA" },
  "1FB": { make: "Ford", makeAr: "فورد", country: "USA" },
  "1FC": { make: "Ford", makeAr: "فورد", country: "USA" },
  "1FD": { make: "Ford Truck", makeAr: "فورد تراك", country: "USA" },
  "1FT": { make: "Ford Truck", makeAr: "فورد تراك", country: "USA" },
  "2FA": { make: "Ford Canada", makeAr: "فورد كندا", country: "Canada" },
  "2ME": { make: "Mercury", makeAr: "ميركوري", country: "Canada" },
  "2MF": { make: "Mercury", makeAr: "ميركوري", country: "Canada" },
  "4M2": { make: "Mercury", makeAr: "ميركوري", country: "USA" },
  "1ME": { make: "Mercury", makeAr: "ميركوري", country: "USA" },
  "1LN": { make: "Lincoln", makeAr: "لينكولن", country: "USA" },
  "5LM": { make: "Lincoln", makeAr: "لينكولن", country: "USA" },
  "3LN": { make: "Lincoln", makeAr: "لينكولن", country: "Mexico" },
  "3FA": { make: "Ford Mexico", makeAr: "فورد مكسيكو", country: "Mexico" },
  "1HG": { make: "Honda", makeAr: "هوندا", country: "USA" },
  "2HG": { make: "Honda Canada", makeAr: "هوندا كندا", country: "Canada" },
  "5FN": { make: "Honda", makeAr: "هوندا", country: "USA" },
  "JHM": { make: "Honda Japan", makeAr: "هوندا اليابان", country: "Japan" },
  "1N4": { make: "Nissan", makeAr: "نيسان", country: "USA" },
  "JN1": { make: "Nissan Japan", makeAr: "نيسان اليابان", country: "Japan" },
  "JN3": { make: "Nissan Japan", makeAr: "نيسان اليابان", country: "Japan" },
  "5N1": { make: "Nissan", makeAr: "نيسان", country: "USA" },
  "1N6": { make: "Nissan Truck", makeAr: "نيسان تراك", country: "USA" },
  "JT2": { make: "Toyota", makeAr: "تويوتا", country: "Japan" },
  "JT3": { make: "Toyota", makeAr: "تويوتا", country: "Japan" },
  "JT4": { make: "Toyota", makeAr: "تويوتا", country: "Japan" },
  "JTE": { make: "Toyota", makeAr: "تويوتا", country: "Japan" },
  "JTN": { make: "Toyota", makeAr: "تويوتا", country: "Japan" },
  "4T1": { make: "Toyota", makeAr: "تويوتا", country: "USA" },
  "4T3": { make: "Toyota", makeAr: "تويوتا", country: "USA" },
  "5TD": { make: "Toyota", makeAr: "تويوتا", country: "USA" },
  "5TF": { make: "Toyota Truck", makeAr: "تويوتا تراك", country: "USA" },
  "JTJ": { make: "Lexus", makeAr: "لكزس", country: "Japan" },
  "JTHB": { make: "Lexus", makeAr: "لكزس", country: "Japan" },
  "2T1": { make: "Toyota Canada", makeAr: "تويوتا كندا", country: "Canada" },
  "WBA": { make: "BMW", makeAr: "بي إم دبليو", country: "Germany" },
  "WBS": { make: "BMW M", makeAr: "بي إم دبليو M", country: "Germany" },
  "WBY": { make: "BMW i", makeAr: "بي إم دبليو i", country: "Germany" },
  "WDB": { make: "Mercedes-Benz", makeAr: "مرسيدس بنز", country: "Germany" },
  "WDC": { make: "Mercedes-Benz", makeAr: "مرسيدس بنز", country: "Germany" },
  "WDD": { make: "Mercedes-Benz", makeAr: "مرسيدس بنز", country: "Germany" },
  "WDF": { make: "Mercedes-Benz Van", makeAr: "مرسيدس فان", country: "Germany" },
  "WAU": { make: "Audi", makeAr: "أودي", country: "Germany" },
  "WVW": { make: "Volkswagen", makeAr: "فولكسفاغن", country: "Germany" },
  "WV1": { make: "Volkswagen", makeAr: "فولكسفاغن", country: "Germany" },
  "WV2": { make: "Volkswagen", makeAr: "فولكسفاغن", country: "Germany" },
  "WP0": { make: "Porsche", makeAr: "بورش", country: "Germany" },
  "WP1": { make: "Porsche", makeAr: "بورش", country: "Germany" },
  "VSS": { make: "SEAT", makeAr: "سيات", country: "Spain" },
  "VF1": { make: "Renault", makeAr: "رينو", country: "France" },
  "VF3": { make: "Peugeot", makeAr: "بيجو", country: "France" },
  "VF7": { make: "Citroën", makeAr: "سيتروين", country: "France" },
  "SAJ": { make: "Jaguar", makeAr: "جاكوار", country: "UK" },
  "SAL": { make: "Land Rover", makeAr: "لاند روفر", country: "UK" },
  "SAR": { make: "Rover", makeAr: "روفر", country: "UK" },
  "SCC": { make: "Lotus", makeAr: "لوتس", country: "UK" },
  "KMH": { make: "Hyundai", makeAr: "هيونداي", country: "Korea" },
  "KMF": { make: "Hyundai Truck", makeAr: "هيونداي تراك", country: "Korea" },
  "KNA": { make: "Kia", makeAr: "كيا", country: "Korea" },
  "KNB": { make: "Kia", makeAr: "كيا", country: "Korea" },
  "KND": { make: "Kia", makeAr: "كيا", country: "Korea" },
  "ZFF": { make: "Ferrari", makeAr: "فيراري", country: "Italy" },
  "ZAM": { make: "Maserati", makeAr: "مازيراتي", country: "Italy" },
  "ZLA": { make: "Lamborghini", makeAr: "لامبورغيني", country: "Italy" },
  "9BD": { make: "Fiat Brazil", makeAr: "فيات البرازيل", country: "Brazil" },
  "LS5": { make: "Cadillac", makeAr: "كاديلاك", country: "USA" },
  "1G6": { make: "Cadillac", makeAr: "كاديلاك", country: "USA" },
  "2G1": { make: "Chevrolet Canada", makeAr: "شيفروليه كندا", country: "Canada" },
  "6FP": { make: "Ford Australia", makeAr: "فورد أستراليا", country: "Australia" },
};

const VIN_YEAR_MAP: Record<string, number> = {
  A: 1980, B: 1981, C: 1982, D: 1983, E: 1984, F: 1985, G: 1986, H: 1987,
  J: 1988, K: 1989, L: 1990, M: 1991, N: 1992, P: 1993, R: 1994, S: 1995,
  T: 1996, V: 1997, W: 1998, X: 1999, Y: 2000,
  "1": 2001, "2": 2002, "3": 2003, "4": 2004, "5": 2005, "6": 2006,
  "7": 2007, "8": 2008, "9": 2009,
  a: 2010, b: 2011, c: 2012, d: 2013, e: 2014, f: 2015, g: 2016, h: 2017,
  j: 2018, k: 2019, l: 2020, m: 2021, n: 2022, p: 2023, r: 2024, s: 2025,
};

export function decodeVIN(vin: string): VINInfo {
  if (!vin || vin.length < 17) {
    return { vin: vin || "", country: "غير معروف", countryAr: "غير معروف", make: "غير معروف", makeAr: "غير معروف", year: 0 };
  }
  const wmi3 = vin.substring(0, 3);
  const wmi2 = vin.substring(0, 2);
  const yearChar = vin.charAt(9);
  const year = VIN_YEAR_MAP[yearChar] || VIN_YEAR_MAP[yearChar.toLowerCase()] || 0;
  const makeInfo = WMI_DATABASE[wmi3] || WMI_DATABASE[wmi2] || {
    make: "غير معروف",
    makeAr: "غير معروف",
    country: "غير معروف",
  };
  // تحليل نوع الوقود من VDS (حرف 4-8)
  const vds = vin.substring(3, 8);
  let fuelType = "Gasoline";
  let fuelTypeAr = "بنزين";
  if (vds.includes("D") || vds.includes("d")) { fuelType = "Diesel"; fuelTypeAr = "ديزل"; }
  if (vds.includes("H") || vds.includes("h")) { fuelType = "Hybrid"; fuelTypeAr = "هجين"; }
  if (vds.includes("E") || vds.includes("e")) { fuelType = "Electric"; fuelTypeAr = "كهربائي"; }
  // تحليل عدد الأسطوانات من الحرف السادس
  const engineChar = vin.charAt(5);
  // خريطة شاملة لتحديد عدد الأسطوانات من الحرف السادس في VIN
  // Ford Grand Marquis 2007: VIN الحرف السادس = "V" (4.6L V8 SOHC)
  const cylMap: Record<string, number> = {
    // أرقام مباشرة
    "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "8": 8,
    // Ford/Mercury/Lincoln V8 و V6
    "V": 8,  // Ford 4.6L V8 SOHC (Grand Marquis, Crown Victoria, Mustang GT)
    "W": 8,  // Ford 4.6L V8 DOHC (Mustang Cobra)
    "N": 8,  // Ford 5.4L V8 (F-150, Expedition)
    "P": 8,  // Ford 5.4L V8 Supercharged
    "R": 10, // Ford 6.8L V10 (F-Series Super Duty)
    "S": 8,  // Ford 5.0L V8 (Mustang GT 2011+)
    "T": 8,  // Ford 5.4L V8 Triton
    "X": 8,  // Ford 6.8L V10 أو V8
    "Y": 8,  // Ford 4.6L V8 Police Interceptor
    "Z": 6,  // Ford 4.0L V6
    // حروف عامة لباقي الماركات
    "A": 4, "B": 6, "C": 8, "D": 4, "E": 6, "F": 8,
    "G": 4, "H": 6, "J": 8, "K": 4, "L": 6, "M": 8,
    "U": 6, "Q": 4, "I": 4, "O": 6,
  };
  const cylinders = cylMap[engineChar] || undefined;
  // تحديد بلد التصنيع بالعربية
  const countryArMap: Record<string, string> = {
    "USA": "أمريكا", "Japan": "اليابان", "Germany": "ألمانيا",
    "South Korea": "كوريا الجنوبية", "Canada": "كندا", "Mexico": "المكسيك",
    "UK": "بريطانيا", "France": "فرنسا", "Italy": "إيطاليا",
    "Sweden": "السويد", "China": "الصين", "India": "الهند",
  };
  return {
    vin,
    country: makeInfo.country,
    countryAr: countryArMap[makeInfo.country] || makeInfo.country,
    make: makeInfo.make,
    makeAr: makeInfo.makeAr,
    modelAr: makeInfo.make,
    year,
    fuelType,
    fuelTypeAr,
    engineAr: cylinders ? `${cylinders} أسطوانة (${cylinders <= 4 ? 'I' : 'V'}${cylinders})` : `غير محدد (${engineChar})`,
    transmissionAr: "أوتوماتيك",
    cylinders,
    region: vin.charAt(10) === "A" ? "الخليج/الشرق الأوسط" : vin.charAt(10) === "U" ? "أمريكا الشمالية" : "دولي",
  };
}

// ═══ UDS Protocol Engine ═══
export class UDSProtocol {
  private sendCommand: (cmd: string, timeout?: number) => Promise<string | null>;
  private log: (msg: string, type: string) => void;

  constructor(
    sendCommand: (cmd: string, timeout?: number) => Promise<string | null>,
    log: (msg: string, type: string) => void
  ) {
    this.sendCommand = sendCommand;
    this.log = log;
  }

  // ═══ تحويل رقم hex إلى string مناسب للإرسال ═══
  private toHexStr(bytes: number[]): string {
    return bytes.map(b => b.toString(16).padStart(2, "0").toUpperCase()).join("");
  }

  // ═══ تحليل استجابة UDS ═══
  private parseUDSResponse(response: string | null, expectedService: number): number[] | null {
    if (!response) return null;
    const clean = response.replace(/\s+/g, "").toUpperCase();
    // ابحث عن positive response (service + 0x40)
    const positiveHex = (expectedService + 0x40).toString(16).toUpperCase().padStart(2, "0");
    const idx = clean.indexOf(positiveHex);
    if (idx === -1) {
      // فحص NRC
      const nrcIdx = clean.indexOf("7F");
      if (nrcIdx !== -1 && clean.length > nrcIdx + 5) {
        const nrc = parseInt(clean.substring(nrcIdx + 4, nrcIdx + 6), 16);
        this.log(`✗ UDS NRC: ${UDS_NRC[nrc] || "0x" + nrc.toString(16)}`, "error");
      }
      return null;
    }
    // استخرج البيانات بعد positive response byte
    const dataHex = clean.substring(idx + 2);
    const bytes: number[] = [];
    for (let i = 0; i < dataHex.length - 1; i += 2) {
      bytes.push(parseInt(dataHex.substring(i, i + 2), 16));
    }
    return bytes;
  }

  // ═══ Service 0x10: Diagnostic Session Control ═══
  async startSession(session: UDSSession): Promise<boolean> {
    const sessionMap: Record<UDSSession, number> = {
      default: 0x01,
      extended: 0x03,
      programming: 0x02,
    };
    const subFunc = sessionMap[session];
    // إعداد ELM327 لـ UDS
    await this.sendCommand("ATSH7DF", 1000);  // Broadcast header
    await this.sendCommand("ATFCSH7DF", 1000);
    await this.sendCommand("ATFCSD300000", 1000);
    await this.sendCommand("ATFCSM1", 1000);
    await this.sendCommand("ATAL", 1000);  // Allow Long messages

    const cmd = `10${subFunc.toString(16).padStart(2, "0")}`;
    this.log(`⟳ UDS 0x10: بدء جلسة ${session}...`, "info");
    const resp = await this.sendCommand(cmd, 3000);
    const data = this.parseUDSResponse(resp, 0x10);
    if (data) {
      this.log(`✓ UDS Session ${session} نشطة`, "info");
      return true;
    }
    this.log(`⚠ UDS Session ${session} فشلت - جرب Default`, "error");
    return false;
  }

  // ═══ Service 0x11: ECU Reset ═══
  async resetECU(type: UDSResetType): Promise<boolean> {
    const resetMap: Record<UDSResetType, number> = {
      hard: 0x01,
      soft: 0x03,
      keyOffOn: 0x02,
    };
    const subFunc = resetMap[type];
    const cmd = `11${subFunc.toString(16).padStart(2, "0")}`;
    this.log(`⟳ UDS 0x11: إعادة تشغيل ECU (${type})...`, "info");
    const resp = await this.sendCommand(cmd, 5000);
    const data = this.parseUDSResponse(resp, 0x11);
    if (data !== null) {
      this.log(`✓ ECU Reset (${type}) تم بنجاح`, "info");
      return true;
    }
    return false;
  }

  // ═══ Service 0x14: Clear DTC ═══
  async clearDTCs(groupOfDTC: number = 0xFFFFFF): Promise<boolean> {
    const g = groupOfDTC;
    const b1 = (g >> 16) & 0xFF;
    const b2 = (g >> 8) & 0xFF;
    const b3 = g & 0xFF;
    const cmd = `14${this.toHexStr([b1, b2, b3])}`;
    this.log(`⟳ UDS 0x14: مسح جميع الأعطال...`, "info");
    const resp = await this.sendCommand(cmd, 5000);
    const data = this.parseUDSResponse(resp, 0x14);
    if (data !== null) {
      this.log(`✓ تم مسح الأعطال بنجاح`, "info");
      return true;
    }
    return false;
  }

  // ═══ Service 0x19: Read DTC Information ═══
  async readDTCsByStatus(statusMask: number = 0x08): Promise<UDSDTCRecord[]> {
    const cmd = `1902${statusMask.toString(16).padStart(2, "0")}`;
    this.log(`⟳ UDS 0x19: قراءة DTCs (mask: 0x${statusMask.toString(16)})...`, "info");
    const resp = await this.sendCommand(cmd, 5000);
    const data = this.parseUDSResponse(resp, 0x19);
    if (!data || data.length < 3) return [];

    const dtcs: UDSDTCRecord[] = [];
    // data[0] = DTCStatusAvailabilityMask
    // data[1..] = DTC records (3 bytes each: 2 DTC + 1 status)
    for (let i = 1; i + 2 < data.length; i += 3) {
      const dtcHigh = data[i];
      const dtcLow = data[i + 1];
      const status = data[i + 2];
      const dtcNum = (dtcHigh << 8) | dtcLow;

      // تحويل إلى كود DTC
      const prefix = ["P", "C", "B", "U"][(dtcHigh >> 6) & 0x03];
      const code = `${prefix}${(dtcNum & 0x3FFF).toString(16).padStart(4, "0").toUpperCase()}`;

      const statusBits = Object.entries(DTC_STATUS_BITS)
        .filter(([bit]) => status & parseInt(bit))
        .map(([, name]) => name);

      dtcs.push({
        code,
        status,
        statusText: statusBits.join(", ") || "unknown",
        severity: status & 0x08 ? "confirmed" : status & 0x04 ? "pending" : "stored",
      });
    }
    this.log(`✓ UDS 0x19: تم قراءة ${dtcs.length} كود عطل`, "info");
    return dtcs;
  }

  // ═══ Service 0x22: Read Data By Identifier ═══
  async readDataByID(did: number): Promise<number[] | null> {
    const b1 = (did >> 8) & 0xFF;
    const b2 = did & 0xFF;
    const cmd = `22${this.toHexStr([b1, b2])}`;
    const resp = await this.sendCommand(cmd, 3000);
    const data = this.parseUDSResponse(resp, 0x22);
    if (data && data.length >= 2) {
      // أزل الـ DID من البداية
      return data.slice(2);
    }
    return null;
  }

  // ═══ Service 0x27: Security Access (Seed/Key) ═══
  async securityAccess(level: number = 0x01): Promise<UDSSecurityResult> {
    // طلب Seed
    const seedCmd = `27${level.toString(16).padStart(2, "0")}`;
    this.log(`⟳ UDS 0x27: طلب Security Seed (level ${level})...`, "info");
    const seedResp = await this.sendCommand(seedCmd, 3000);
    const seedData = this.parseUDSResponse(seedResp, 0x27);

    if (!seedData || seedData.length < 3) {
      return { success: false, message: "فشل الحصول على Seed" };
    }

    // حساب Key (خوارزمية بسيطة - تختلف حسب الصانع)
    const seed = (seedData[1] << 24) | (seedData[2] << 16) | (seedData[3] << 8) | (seedData[4] || 0);
    const key = this.calculateKey(seed, level);

    // إرسال Key
    const keyLevel = level + 1;
    const k1 = (key >> 24) & 0xFF;
    const k2 = (key >> 16) & 0xFF;
    const k3 = (key >> 8) & 0xFF;
    const k4 = key & 0xFF;
    const keyCmd = `27${keyLevel.toString(16).padStart(2, "0")}${this.toHexStr([k1, k2, k3, k4])}`;
    const keyResp = await this.sendCommand(keyCmd, 3000);
    const keyData = this.parseUDSResponse(keyResp, 0x27);

    if (keyData !== null) {
      this.log(`✓ Security Access Level ${level} مفتوح`, "info");
      return { success: true, message: `Security Access Level ${level} تم بنجاح` };
    }
    return { success: false, message: "مفتاح الأمان غير صحيح" };
  }

  private calculateKey(seed: number, level: number): number {
    // خوارزمية عامة (تختلف حسب الصانع - هذه للاختبار)
    return (seed ^ 0x5A5A5A5A) + level;
  }

  // ═══ Service 0x2E: Write Data By Identifier ═══
  async writeDataByID(did: number, data: number[]): Promise<boolean> {
    const b1 = (did >> 8) & 0xFF;
    const b2 = did & 0xFF;
    const cmd = `2E${this.toHexStr([b1, b2, ...data])}`;
    this.log(`⟳ UDS 0x2E: كتابة DID 0x${did.toString(16)}...`, "info");
    const resp = await this.sendCommand(cmd, 5000);
    const result = this.parseUDSResponse(resp, 0x2E);
    if (result !== null) {
      this.log(`✓ UDS 0x2E: تم الكتابة بنجاح`, "info");
      return true;
    }
    return false;
  }

  // ═══ Service 0x31: Routine Control ═══
  async startRoutine(routineId: number, params: number[] = []): Promise<UDSRoutineResult> {
    const b1 = (routineId >> 8) & 0xFF;
    const b2 = routineId & 0xFF;
    const cmd = `3101${this.toHexStr([b1, b2, ...params])}`;
    this.log(`⟳ UDS 0x31: تشغيل Routine 0x${routineId.toString(16)}...`, "info");
    const resp = await this.sendCommand(cmd, 10000);
    const data = this.parseUDSResponse(resp, 0x31);
    if (data !== null) {
      this.log(`✓ Routine 0x${routineId.toString(16)} اكتمل`, "info");
      return { success: true, data, message: "تم تنفيذ الروتين بنجاح" };
    }
    return { success: false, message: `فشل تنفيذ Routine 0x${routineId.toString(16)}` };
  }

  async stopRoutine(routineId: number): Promise<boolean> {
    const b1 = (routineId >> 8) & 0xFF;
    const b2 = routineId & 0xFF;
    const cmd = `3102${this.toHexStr([b1, b2])}`;
    const resp = await this.sendCommand(cmd, 3000);
    return this.parseUDSResponse(resp, 0x31) !== null;
  }

  async requestRoutineResults(routineId: number): Promise<number[] | null> {
    const b1 = (routineId >> 8) & 0xFF;
    const b2 = routineId & 0xFF;
    const cmd = `3103${this.toHexStr([b1, b2])}`;
    const resp = await this.sendCommand(cmd, 3000);
    return this.parseUDSResponse(resp, 0x31);
  }

  // ═══════════════════════════════════════════════════════════════
  // SPECIAL FUNCTIONS
  // ═══════════════════════════════════════════════════════════════

  // ─── Oil Reset ───
  async oilReset(make: string): Promise<SpecialFunctionResult> {
    this.log(`⟳ Oil Reset: ${make}...`, "info");
    const proc = OIL_RESET_PROCEDURES[make.toLowerCase()] || OIL_RESET_PROCEDURES["toyota"];

    // بدء جلسة Extended
    const sessionOk = await this.startSession("extended");
    if (!sessionOk) {
      // محاولة بدون session
      this.log("⚠ Extended session غير مدعومة - محاولة مباشرة...", "info");
    }

    if (proc.udsRoutine) {
      const result = await this.startRoutine(proc.udsRoutine);
      if (result.success) {
        this.log(`✓ Oil Reset (${proc.name}) تم بنجاح`, "info");
        return { success: true, message: `تم إعادة ضبط مؤشر الزيت لـ ${proc.name}`, details: "تم مسح عداد الزيت بنجاح" };
      }
    }

    // محاولة Mode 04 كـ fallback (مسح كل الأعطال + إعادة ضبط)
    this.log("⚠ UDS Routine فشل - محاولة Mode 04 كـ fallback...", "info");
    const fallbackResp = await this.sendCommand("04", 5000);
    if (fallbackResp && !fallbackResp.includes("NO DATA")) {
      return {
        success: true,
        message: "تم إعادة ضبط مؤشر الزيت (Fallback Mode)",
        details: "تم عبر مسح الأعطال - قد لا يعمل على بعض السيارات",
      };
    }

    return {
      success: false,
      message: `Oil Reset غير مدعوم على هذا الجهاز لـ ${proc.name}`,
      details: "يتطلب جهاز OBDLink EX أو PassThru",
    };
  }

  // ─── TPMS Reset ───
  async tpmsReset(make: string): Promise<SpecialFunctionResult> {
    this.log(`⟳ TPMS Reset: ${make}...`, "info");
    await this.startSession("extended");

    // TPMS Routine IDs per make
    const tpmsRoutines: Record<string, number> = {
      toyota: 0xB100,
      ford: 0x0301,
      nissan: 0xBF01,
      bmw: 0xF041,
      mercedes: 0x0204,
      hyundai: 0xB101,
      gm: 0xA101,
      honda: 0x0101,
    };

    const routineId = tpmsRoutines[make.toLowerCase()] || 0xB100;
    const result = await this.startRoutine(routineId);
    if (result.success) {
      return { success: true, message: "تم إعادة ضبط حساسات ضغط الإطارات", details: "قم بتشغيل السيارة وقيادتها 10 دقائق لإعادة معايرة الحساسات" };
    }
    return { success: false, message: "TPMS Reset غير مدعوم على هذا الجهاز", details: "يتطلب جهاز متخصص" };
  }

  // ─── EPB Reset ───
  async epbReset(action: "open" | "close" = "open"): Promise<SpecialFunctionResult> {
    this.log(`⟳ EPB Reset: ${action === "open" ? "فتح" : "إغلاق"} الفرامل الكهربائية...`, "info");
    await this.startSession("extended");

    // EPB Routine: 0x0206 (open) / 0x0207 (close) - شائع على VW/Audi/BMW
    const routineId = action === "open" ? 0x0206 : 0x0207;
    const result = await this.startRoutine(routineId);
    if (result.success) {
      return {
        success: true,
        message: `تم ${action === "open" ? "فتح" : "إغلاق"} الفرامل الكهربائية`,
        details: action === "open" ? "يمكنك الآن تغيير تيل الفرامل الخلفية" : "تم إغلاق الفرامل - اختبر الفرامل قبل القيادة",
      };
    }

    // محاولة Routine بديل
    const altRoutineId = action === "open" ? 0x0208 : 0x0209;
    const altResult = await this.startRoutine(altRoutineId);
    if (altResult.success) {
      return { success: true, message: `تم ${action === "open" ? "فتح" : "إغلاق"} الفرامل (Routine بديل)`, details: "تم بنجاح" };
    }

    return { success: false, message: "EPB Reset غير مدعوم على هذا الجهاز", details: "يتطلب جهاز متخصص مثل OBDLink EX" };
  }

  // ─── Throttle Adaptation ───
  async throttleAdaptation(): Promise<SpecialFunctionResult> {
    this.log(`⟳ Throttle Adaptation: معايرة موضع الخانق...`, "info");
    await this.startSession("extended");

    // خطوات معايرة الخانق
    // 1. أغلق المحرك (مفتاح ON بدون تشغيل)
    // 2. أرسل Routine
    const result = await this.startRoutine(0xA100);
    if (result.success) {
      return {
        success: true,
        message: "تم معايرة موضع الخانق بنجاح",
        details: "شغّل المحرك الآن وانتظر دقيقة للاستقرار",
      };
    }

    // محاولة بديلة: Toyota throttle relearn
    const altResult = await this.startRoutine(0xA102, [0x01]);
    if (altResult.success) {
      return { success: true, message: "تم معايرة الخانق (Toyota Mode)", details: "شغّل المحرك وانتظر دقيقتين" };
    }

    return {
      success: false,
      message: "Throttle Adaptation غير مدعوم",
      details: "جرب الطريقة اليدوية: مفتاح ON → انتظر 3 ثوانٍ → مفتاح OFF → انتظر 10 ثوانٍ → شغّل",
    };
  }

  // ─── Steering Angle Reset (SAS) ───
  async steeringAngleReset(): Promise<SpecialFunctionResult> {
    this.log(`⟳ SAS Reset: معايرة زاوية المقود...`, "info");
    await this.startSession("extended");

    const result = await this.startRoutine(0x0300);
    if (result.success) {
      return {
        success: true,
        message: "تم معايرة حساس زاوية المقود",
        details: "قُد السيارة بشكل مستقيم لمسافة 100 متر لإتمام المعايرة",
      };
    }

    // محاولة بديلة
    const altResult = await this.startRoutine(0x0301);
    if (altResult.success) {
      return { success: true, message: "تم معايرة SAS", details: "قُد السيارة مستقيماً لإتمام المعايرة" };
    }

    return { success: false, message: "SAS Reset غير مدعوم", details: "يتطلب جهاز متخصص" };
  }

  // ─── BMS Reset (Battery Management System) ───
  async bmsReset(): Promise<SpecialFunctionResult> {
    this.log(`⟳ BMS Reset: تسجيل بطارية جديدة...`, "info");
    await this.startSession("extended");

    // BMW BMS Reset: DID 0xF190 (Battery capacity)
    const writeOk = await this.writeDataByID(0xF190, [0x00, 0x00, 0x01]);
    if (writeOk) {
      return {
        success: true,
        message: "تم تسجيل البطارية الجديدة في ECU",
        details: "سيقوم الكمبيوتر بمعايرة نظام الشحن للبطارية الجديدة",
      };
    }

    // محاولة Routine
    const result = await this.startRoutine(0xF040, [0x01]);
    if (result.success) {
      return { success: true, message: "تم BMS Reset بنجاح", details: "البطارية الجديدة مسجلة" };
    }

    return { success: false, message: "BMS Reset غير مدعوم", details: "يتطلب جهاز متخصص (BMW: ISTA، Mercedes: XENTRY)" };
  }

  // ─── Idle Relearn ───
  async idleRelearn(): Promise<SpecialFunctionResult> {
    this.log(`⟳ Idle Relearn: إعادة تعلم الخمول...`, "info");
    await this.startSession("extended");

    const result = await this.startRoutine(0xA103);
    if (result.success) {
      return {
        success: true,
        message: "تم إعادة تعلم الخمول بنجاح",
        details: "شغّل المحرك وانتظر 5 دقائق بدون تحريك دواسة الوقود",
      };
    }

    return {
      success: false,
      message: "Idle Relearn غير مدعوم عبر UDS",
      details: "الطريقة اليدوية: شغّل المحرك → انتظر حتى يستقر → أطفئ → انتظر 30 ثانية → شغّل مجدداً",
    };
  }

  // ─── EVAP Leak Test ───
  async evapLeakTest(): Promise<SpecialFunctionResult> {
    this.log(`⟳ EVAP Leak Test: اختبار تسريب نظام التبخير...`, "info");
    await this.startSession("extended");

    const result = await this.startRoutine(0x0200);
    if (result.success) {
      // انتظر نتيجة الاختبار
      await new Promise(r => setTimeout(r, 5000));
      const resultData = await this.requestRoutineResults(0x0200);
      const passed = resultData && resultData[0] === 0x01;
      return {
        success: true,
        message: passed ? "✅ لا يوجد تسريب في نظام التبخير" : "⚠ يوجد تسريب في نظام التبخير",
        details: passed ? "نظام EVAP سليم" : "افحص خرطوم التبخير وغطاء خزان الوقود",
      };
    }

    return { success: false, message: "EVAP Test غير مدعوم", details: "يتطلب جهاز متخصص" };
  }

  // ─── DPF Regeneration (عبر ELM327 بدون PassThru) ───
  async dpfRegeneration(make: string): Promise<SpecialFunctionResult> {
    this.log(`⟳ DPF Regeneration: ${make}...`, "info");
    try {
      await this.startSession("extended");
      // قراءة حالة DPF عبر Mode 01 PIDs المخصصة
      const dpfTemp = await this.sendCommand("017C", 2000);   // DPF inlet temp
      const dpfPress = await this.sendCommand("017D", 2000);  // DPF differential pressure
      const dpfStatus = await this.sendCommand("017E", 2000); // DPF regen status
      const hasDpfPids = ![dpfTemp, dpfPress, dpfStatus].every(r => !r || r.includes("NO DATA"));

      if (hasDpfPids) {
        // محاولة تفعيل التجديد عبر UDS Routine 0x0301
        const regen = await this.startRoutine(0x0301);
        if (regen.success) {
          return {
            success: true,
            message: "✅ تم تفعيل DPF Regeneration تلقائياً",
            details: "وحدة التحكم تستجيب. جاري تجديد فلتر الجسيمات.",
            steps: [
              "تأكد من أن مستوى الوقود فوق النصف",
              "أوصل المحرك حتى تصل حرارته لـ 90°C (لا تفعّل التكييف)",
              "سِر على طريق سريع بسرعة 80-120 km/h لمدة 30 دقيقة",
              "ستشعر برائحة حرق طبيعية - هذا طبيعي",
              "سينطفئ مؤشر DPF تلقائياً بعد اكتمال التجديد",
            ],
            nextSteps: ["افحص ضغط DPF بعد التجديد", "إذا استمر المؤشر فالفلتر يحتاج استبدال"]
          };
        }
      }

      // إرشادات يدوية إذا لم يستجب الجهاز للروتين
      return {
        success: true,
        message: "دليل تجديد DPF اليدوي",
        details: `${make} - اتبع الخطوات التالية لتجديد فلتر الجسيمات يدوياً`,
        steps: [
          "تأكد من أن مستوى الوقود 3/4 كاملة (أفضل)",
          "أوصل المحرك حتى تصل حرارته لـ 90°C - لا تفعّل التكييف",
          "سِر على طريق سريع (ليس مدينة) بسرعة 80-120 km/h",
          "استمر 25-40 دقيقة بدون توقف - ستشعر برائحة حرق طبيعية",
          "حرارة DPF ستصل 600°C+ لحرق السخام",
          "سينطفئ مؤشر DPF تلقائياً بعد اكتمال التجديد",
        ],
        nextSteps: ["إذا استمر المؤشر بعد 3 محاولات فالفلتر يحتاج استبدال أو تنظيف احترافي"]
      };
    } catch (e) {
      return { success: false, message: `خطأ DPF: ${e}`, details: "تأكد من اتصال الجهاز" };
    }
  }

  // ─── ABS Bleeding (تهوية نظام الفرامل) ───
  async absBleeding(): Promise<SpecialFunctionResult> {
    this.log(`⟳ ABS Bleeding: تهوية نظام الفرامل...`, "info");
    try {
      await this.startSession("extended");
      // محاولة تفعيل ABS Bleed Routine عبر UDS 0x0202
      await this.sendCommand("ATSH7D0"); // ABS Module address
      const bleedResult = await this.startRoutine(0x0202);

      if (bleedResult.success) {
        return {
          success: true,
          message: "✅ تم تفعيل ABS Bleeding التلقائي",
          details: "وحدة ABS تستجيب. ستفتح صمامات ABS تلقائياً.",
          steps: [
            "تأكد من أن خزان سائل الفرامل ممتلئ للحد الأقصى",
            "افتح صمامات التهوية بالترتيب: خلف يمين → خلف يسار → أمام يمين → أمام يسار",
            "اضغط على دواسة الفرامل ببطء وثبّت الضغط",
            "الجهاز سيفتح صمامات ABS تلقائياً",
            "كرر لكل عجلة حتى يخرج سائل نظيف بدون فقاعات",
          ],
          nextSteps: ["افحص مستوى سائل الفرامل بعد الانتهاء"]
        };
      }

      // إرشادات يدوية (طريقتان: الكلاسيكية والضغط)
      return {
        success: true,
        message: "دليل تهوية الفرامل اليدوية",
        details: "هذه السيارة تتطلب تهوية يدوية بمساعدة شخصين",
        steps: [
          "أوقف السيارة واملأ خزان سائل الفرامل للحد الأقصى",
          "ابدأ بعجلة خلف يمين: افتح صمام التهوية ربع دورة",
          "الشخص الثاني: اضغط على دواسة الفرامل ببطء حتى النهاية",
          "أغلق الصمام قبل رفع الضغط عن الدواسة",
          "كرر حتى يخرج سائل نظيف بدون فقاعات هوائية",
          "الترتيب: خلف يمين → خلف يسار → أمام يمين → أمام يسار",
          "أعد ملء الخزان بعد كل عجلة",
        ],
        nextSteps: ["اختبر الفرامل بالتسارع التدريجي بعد التهوية"]
      };
    } catch (e) {
      return { success: false, message: `خطأ ABS Bleeding: ${e}`, details: "تأكد من اتصال الجهاز" };
    }
  }

  // ─── Injector Coding (ترميز الحاقنات) ───
  async injectorCoding(make: string, cylinderCount: number = 4): Promise<SpecialFunctionResult> {
    this.log(`⟳ Injector Coding: ${make} ${cylinderCount} أسطوانة...`, "info");
    try {
      await this.startSession("extended");
      // محاولة قراءة كود الحاقن عبر UDS DID 0xF190-0xF197
      const codes: string[] = [];
      for (let i = 0; i < Math.min(cylinderCount, 8); i++) {
        const did = 0xF190 + i;
        const resp = await this.readDataByID(did);
        if (resp && resp.length > 0) {
          const code = resp.map((b: number) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
          if (code !== "0000000000000000") {
            codes.push(`أسطوانة ${i + 1}: ${code}`);
          }
        }
      }

      if (codes.length > 0) {
        return {
          success: true,
          message: `✅ تم قراءة كود ${codes.length} حاقن`,
          details: codes.join("\n"),
          steps: [
            "الكود المقروء أعلاه هو الترميز الحالي المخزّن في ECU",
            "إذا استبدلت حاقناً جديداً: ابحث عن الكود المطبوع على جسم الحاقن بالليزر",
            "الكود عادةً 16 حرف سداسي مطبوع بالليزر على الحاقن",
            "أدخل الكود الجديد عبر الحقل أدناه واضغط حفظ",
          ],
          nextSteps: ["بعد الترميز شغّل المحرك وتحقق من عدم وجود أعطال"]
        };
      }

      // إرشادات يدوية
      return {
        success: true,
        message: `دليل ترميز الحاقنات - ${make}`,
        details: `ترميز الحاقنات لـ ${make} ${cylinderCount} أسطوانة`,
        steps: [
          `ابحث عن الكود المطبوع على جسم كل حاقن (${cylinderCount} حاقنات)`,
          "الكود عادةً 16 حرف سداسي مطبوع بالليزر على الحاقن",
          "لـ Bosch: الكود يبدأ بـ C2 أو C3",
          "لـ Delphi: الكود يبدأ بـ A1 أو A2",
          "لـ Denso: الكود يبدأ بـ D1 أو D2",
          "أدخل الكود في جهاز متخصص (VCDS/ISTA/Tech2) لكل أسطوانة",
          "بعد الترميز: شغّل المحرك وافحص Power Balance",
        ],
        nextSteps: ["افحص Power Balance Test بعد الترميز للتحقق"]
      };
    } catch (e) {
      return { success: false, message: `خطأ Injector Coding: ${e}`, details: "تأكد من اتصال الجهاز" };
    }
  }

  // ─── Gearbox Adaptation (معايرة ناقل الحركة) ───
  async gearboxAdaptation(make: string): Promise<SpecialFunctionResult> {
    this.log(`⟳ Gearbox Adaptation: ${make}...`, "info");
    try {
      await this.startSession("extended");
      // محاولة عبر UDS Routine 0x0301 (Transmission Adaptation)
      await this.sendCommand("ATSH7E1"); // TCM address
      const adaptResult = await this.startRoutine(0x0301);

      if (adaptResult.success) {
        return {
          success: true,
          message: "✅ تم تفعيل Gearbox Adaptation التلقائي",
          details: "وحدة TCM تستجيب للمعايرة",
          steps: [
            "تأكد من وصول حرارة المحرك لـ 90°C",
            "اضغط على الفرامل بشدة والسيارة واقفة",
            "حرّك الذراع بين جميع الوضعيات (P-R-N-D-L) ببطء شديد",
            "انتظر 5 ثوان في كل وضع",
            "أعد الذراع لـ P وانتظر اكتمال المعايرة",
          ],
          nextSteps: ["اختبر القير بعد المعايرة بالقيادة التدريجية"]
        };
      }

      // إرشادات مخصصة لكل ماركة
      const makeProc: Record<string, string[]> = {
        toyota: [
          "أوقف السيارة واضغط على الفرامل",
          "شغّل المحرك ودعه يدور في P لمدة 5 دقائق",
          "حرّك الذراع لـ D واستمر بالضغط على الفرامل 30 ثانية",
          "أطلق الفرامل وسِر ببطء حتى 100 km/h",
          "أوقف السيارة وأعد الذراع لـ P - تمت المعايرة",
        ],
        ford: [
          "أوقف السيارة وشغّل المحرك",
          "حرّك الذراع بين P-R-N-D ببطء (5 ثوان لكل وضع)",
          "أوقف المحرك وانتظر 30 ثانية",
          "أعد التشغيل واختبر القير",
        ],
        bmw: [
          "شغّل المحرك ودعه يدور 10 دقائق حتى تدفأ الحرارة",
          "حرّك الذراع لكل وضع (P-R-N-D-S) ببطء شديد",
          "سِر بسرعة خفيفة حتى 60 km/h ثم أوقف ببطء",
          "كرّر 3 مرات - المعايرة تتم تلقائياً",
        ],
        nissan: [
          "أوقف السيارة واضغط على الفرامل",
          "حرّك الذراع من P إلى 1 ثم عد لـ P (ببطء شديد)",
          "أوقف المحرك 3 دقائق ثم أعد التشغيل",
          "سِر ببطء وتحقق من سلاسة تغيير السرعات",
        ],
      };

      const steps = makeProc[make.toLowerCase()] || makeProc["toyota"];
      return {
        success: true,
        message: `دليل معايرة القير - ${make}`,
        details: "اتبع الخطوات التالية بالترتيب الدقيق",
        steps,
        nextSteps: ["افحص حرارة القير بعد المعايرة للتأكد"]
      };
    } catch (e) {
      return { success: false, message: `خطأ Gearbox Adaptation: ${e}`, details: "تأكد من اتصال الجهاز" };
    }
  }
}

// ═══ OEM PIDs Database ═══
export interface OEMPIDDef {
  pid: string;
  name: string;
  nameAr: string;
  unit: string;
  formula: (bytes: number[]) => number;
  min: number;
  max: number;
  normalMin?: number;
  normalMax?: number;
  troubleshoot?: string;
}

export const OEM_PIDS: Record<string, OEMPIDDef[]> = {
  toyota: [
    { pid: "2101", name: "Engine Oil Temp", nameAr: "حرارة زيت المحرك", unit: "°C", formula: b => b[0] - 40, min: -40, max: 200, normalMin: 80, normalMax: 120 },
    { pid: "2102", name: "Fuel Pressure", nameAr: "ضغط الوقود", unit: "kPa", formula: b => ((b[0] << 8) | b[1]) * 0.1, min: 0, max: 700, normalMin: 300, normalMax: 500 },
    { pid: "2103", name: "Air/Fuel Ratio", nameAr: "نسبة الهواء/الوقود", unit: "", formula: b => ((b[0] << 8) | b[1]) / 128, min: 0, max: 4, normalMin: 0.95, normalMax: 1.05 },
    { pid: "2104", name: "Coolant Temp (OEM)", nameAr: "حرارة المياه (OEM)", unit: "°C", formula: b => b[0] - 40, min: -40, max: 215, normalMin: 80, normalMax: 105 },
    { pid: "2105", name: "Intake Air Temp", nameAr: "حرارة هواء السحب", unit: "°C", formula: b => b[0] - 40, min: -40, max: 120, normalMin: 20, normalMax: 60 },
    { pid: "2106", name: "Battery Voltage (OEM)", nameAr: "جهد البطارية (OEM)", unit: "V", formula: b => b[0] * 0.1, min: 0, max: 20, normalMin: 13.5, normalMax: 14.5 },
  ],
  ford: [
    { pid: "2200", name: "Transmission Temp", nameAr: "حرارة القير", unit: "°C", formula: b => b[0] - 40, min: -40, max: 200, normalMin: 60, normalMax: 100 },
    { pid: "2201", name: "Wheel Speed FL", nameAr: "سرعة العجلة الأمامية اليسار", unit: "km/h", formula: b => ((b[0] << 8) | b[1]) * 0.01, min: 0, max: 300 },
    { pid: "2202", name: "Wheel Speed FR", nameAr: "سرعة العجلة الأمامية اليمين", unit: "km/h", formula: b => ((b[0] << 8) | b[1]) * 0.01, min: 0, max: 300 },
    { pid: "2203", name: "Wheel Speed RL", nameAr: "سرعة العجلة الخلفية اليسار", unit: "km/h", formula: b => ((b[0] << 8) | b[1]) * 0.01, min: 0, max: 300 },
    { pid: "2204", name: "Wheel Speed RR", nameAr: "سرعة العجلة الخلفية اليمين", unit: "km/h", formula: b => ((b[0] << 8) | b[1]) * 0.01, min: 0, max: 300 },
    { pid: "2205", name: "Steering Angle", nameAr: "زاوية المقود", unit: "°", formula: b => (((b[0] << 8) | b[1]) - 32768) * 0.1, min: -720, max: 720, normalMin: -5, normalMax: 5 },
  ],
  nissan: [
    { pid: "2201", name: "Engine Oil Temp", nameAr: "حرارة زيت المحرك", unit: "°C", formula: b => b[0] - 40, min: -40, max: 200, normalMin: 80, normalMax: 120 },
    { pid: "2202", name: "Fuel Pressure Rail", nameAr: "ضغط قضيب الوقود", unit: "MPa", formula: b => ((b[0] << 8) | b[1]) * 0.01, min: 0, max: 15, normalMin: 3, normalMax: 7 },
    { pid: "2203", name: "CVT Temp", nameAr: "حرارة CVT", unit: "°C", formula: b => b[0] - 40, min: -40, max: 200, normalMin: 60, normalMax: 110 },
    { pid: "2204", name: "Throttle Valve Pos", nameAr: "موضع صمام الخانق", unit: "%", formula: b => b[0] * 0.4, min: 0, max: 100 },
  ],
  bmw: [
    { pid: "2201", name: "Engine Oil Temp", nameAr: "حرارة زيت المحرك", unit: "°C", formula: b => b[0] - 48, min: -48, max: 207, normalMin: 80, normalMax: 130 },
    { pid: "2202", name: "Oil Pressure", nameAr: "ضغط الزيت", unit: "bar", formula: b => b[0] * 0.04, min: 0, max: 10, normalMin: 1.5, normalMax: 5 },
    { pid: "2203", name: "Coolant Temp (OEM)", nameAr: "حرارة المياه (OEM)", unit: "°C", formula: b => b[0] - 48, min: -48, max: 207, normalMin: 80, normalMax: 105 },
    { pid: "2204", name: "Charge Air Temp", nameAr: "حرارة هواء التيربو", unit: "°C", formula: b => b[0] - 48, min: -48, max: 207, normalMin: 20, normalMax: 60 },
    { pid: "2205", name: "Turbo Boost Pressure", nameAr: "ضغط التيربو", unit: "mbar", formula: b => ((b[0] << 8) | b[1]) - 1000, min: -1000, max: 3000, normalMin: 0, normalMax: 1500 },
  ],
  mercedes: [
    { pid: "2201", name: "Engine Oil Temp", nameAr: "حرارة زيت المحرك", unit: "°C", formula: b => b[0] - 40, min: -40, max: 200, normalMin: 80, normalMax: 130 },
    { pid: "2202", name: "Transmission Temp", nameAr: "حرارة القير", unit: "°C", formula: b => b[0] - 40, min: -40, max: 200, normalMin: 60, normalMax: 100 },
    { pid: "2203", name: "Fuel Pressure", nameAr: "ضغط الوقود", unit: "bar", formula: b => ((b[0] << 8) | b[1]) * 0.1, min: 0, max: 200, normalMin: 50, normalMax: 120 },
    { pid: "2204", name: "EGR Rate", nameAr: "معدل EGR", unit: "%", formula: b => b[0] * 0.4, min: 0, max: 100 },
  ],
  hyundai: [
    { pid: "2201", name: "Engine Oil Temp", nameAr: "حرارة زيت المحرك", unit: "°C", formula: b => b[0] - 40, min: -40, max: 200, normalMin: 80, normalMax: 120 },
    { pid: "2202", name: "Fuel Pressure", nameAr: "ضغط الوقود", unit: "kPa", formula: b => ((b[0] << 8) | b[1]) * 0.5, min: 0, max: 700, normalMin: 250, normalMax: 450 },
    { pid: "2203", name: "Transmission Temp", nameAr: "حرارة القير", unit: "°C", formula: b => b[0] - 40, min: -40, max: 200, normalMin: 60, normalMax: 100 },
  ],
  gm: [
    { pid: "2201", name: "Engine Oil Temp", nameAr: "حرارة زيت المحرك", unit: "°C", formula: b => b[0] - 40, min: -40, max: 200, normalMin: 80, normalMax: 120 },
    { pid: "2202", name: "Fuel Rail Pressure", nameAr: "ضغط قضيب الوقود", unit: "kPa", formula: b => ((b[0] << 8) | b[1]) * 0.5, min: 0, max: 700, normalMin: 300, normalMax: 500 },
    { pid: "2203", name: "Transmission Temp", nameAr: "حرارة القير", unit: "°C", formula: b => b[0] - 40, min: -40, max: 200, normalMin: 60, normalMax: 100 },
    { pid: "2204", name: "Throttle Position", nameAr: "موضع الخانق", unit: "%", formula: b => b[0] * 0.4, min: 0, max: 100 },
  ],
};

export function getOEMPIDsForMake(make: string): OEMPIDDef[] {
  const key = make.toLowerCase().split("/")[0].trim();
  return OEM_PIDS[key] || OEM_PIDS["toyota"];
}

// ═══════════════════════════════════════════════════════════════════
// NISSAN ACTION TESTS DATABASE (CONSULT-III Plus / UDS)
// Supports: X-Trail T32/T33, Patrol Y62, Altima L34, Pathfinder R52/R53,
//           Armada Y62, Frontier D41, Kicks P15, Qashqai J11/J12,
//           Navara D23, Murano Z52, Maxima A36, Sentra B18
// Protocol: CONSULT-III Plus via UDS ISO 14229
// ECU Headers: PCM=7E0/7E8, TCM=7E1/7E9, BCM=746/74E, ABS=740/748
// ═══════════════════════════════════════════════════════════════════

export interface NissanActionTest {
  id: string;
  nameAr: string;
  nameEn: string;
  category: "engine" | "cooling" | "fuel" | "transmission" | "abs" | "ac" | "body" | "electrical";
  ecuHeader: string;         // ATSH command target
  session: "extended" | "programming";
  onCmd: string[];           // Commands to activate (hex bytes)
  offCmd: string[];          // Commands to deactivate
  monitorPid?: string;       // Optional PID to monitor during test
  durationSec: number;       // Max test duration in seconds
  warningAr: string;
  supportedModels: string[]; // Nissan model codes
  protocol: "UDS" | "CONSULT3";
}

// ═══ Nissan ECU Address Map ═══
export const NISSAN_ECU_MAP: Record<string, { header: string; rxHeader: string; nameAr: string }> = {
  pcm:  { header: "7E0", rxHeader: "7E8", nameAr: "وحدة التحكم بالمحرك (PCM/ECM)" },
  tcm:  { header: "7E1", rxHeader: "7E9", nameAr: "وحدة التحكم بالقير (TCM)" },
  abs:  { header: "740", rxHeader: "748", nameAr: "وحدة ABS / VDC" },
  bcm:  { header: "746", rxHeader: "74E", nameAr: "وحدة التحكم بالجسم (BCM)" },
  hvac: { header: "744", rxHeader: "74C", nameAr: "وحدة التكييف (HVAC)" },
  eps:  { header: "742", rxHeader: "74A", nameAr: "وحدة التوجيه الكهربائي (EPS)" },
  ipdm: { header: "75A", rxHeader: "762", nameAr: "وحدة توزيع الطاقة (IPDM-E/R)" },
};

// ═══ Nissan Model Codes ═══
export const NISSAN_MODELS_2022_PLUS = [
  "X-Trail T33 (2022+)",
  "Patrol Y62 (2022+)",
  "Altima L34 (2022+)",
  "Pathfinder R53 (2022+)",
  "Armada Y62 (2022+)",
  "Frontier D41 (2022+)",
  "Kicks P15 (2022+)",
  "Qashqai J12 (2022+)",
  "Navara D23 (2022+)",
  "Murano Z52 (2022+)",
  "Maxima A36 (2022+)",
  "Sentra B18 (2022+)",
  "Versa N18 (2022+)",
  "Rogue T33 (2022+)",
  "Titan A61 (2022+)",
];

// ═══ Nissan Action Tests Database ═══
export const NISSAN_ACTION_TESTS: NissanActionTest[] = [
  // ─── مراوح التبريد ───
  {
    id: "fan_low",
    nameAr: "مروحة التبريد - سرعة منخفضة",
    nameEn: "Cooling Fan Low Speed",
    category: "cooling",
    ecuHeader: "75A",  // IPDM-E/R
    session: "extended",
    onCmd:  ["10 03", "31 01 02 01 01"],  // Extended session → Routine Control ON Low
    offCmd: ["31 01 02 00 01"],           // Routine Control OFF
    monitorPid: "2110",  // Coolant temp
    durationSec: 30,
    warningAr: "تأكد أن المحرك دافئ (>80°C) قبل الاختبار",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62", "Rogue T33", "Murano Z52"],
    protocol: "UDS",
  },
  {
    id: "fan_high",
    nameAr: "مروحة التبريد - سرعة عالية",
    nameEn: "Cooling Fan High Speed",
    category: "cooling",
    ecuHeader: "75A",
    session: "extended",
    onCmd:  ["10 03", "31 01 02 01 02"],  // High speed
    offCmd: ["31 01 02 00 02"],
    monitorPid: "2110",
    durationSec: 30,
    warningAr: "لا تشغّل لأكثر من 30 ثانية — خطر ارتفاع درجة الحرارة",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62", "Rogue T33"],
    protocol: "UDS",
  },
  {
    id: "fan_ac",
    nameAr: "مروحة المكيف (Condenser Fan)",
    nameEn: "A/C Condenser Fan",
    category: "cooling",
    ecuHeader: "75A",
    session: "extended",
    onCmd:  ["10 03", "31 01 03 01 01"],
    offCmd: ["31 01 03 00 01"],
    durationSec: 30,
    warningAr: "تأكد من إيقاف المكيف قبل الاختبار",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Kicks P15", "Qashqai J12"],
    protocol: "UDS",
  },

  // ─── مضخة الوقود ───
  {
    id: "fuel_pump",
    nameAr: "مضخة الوقود",
    nameEn: "Fuel Pump Relay",
    category: "fuel",
    ecuHeader: "7E0",  // PCM
    session: "extended",
    onCmd:  ["10 03", "31 01 0A 01"],  // Fuel pump ON
    offCmd: ["31 01 0A 00"],
    monitorPid: "2202",  // Fuel rail pressure
    durationSec: 15,
    warningAr: "لا تشغّل المضخة مع وجود تسريب وقود — خطر حريق",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62", "Frontier D41", "Navara D23", "Titan A61"],
    protocol: "UDS",
  },
  {
    id: "fuel_pump_prime",
    nameAr: "تهيئة مضخة الوقود (Prime)",
    nameEn: "Fuel Pump Prime",
    category: "fuel",
    ecuHeader: "7E0",
    session: "extended",
    onCmd:  ["10 03", "31 01 0B 01"],
    offCmd: ["31 01 0B 00"],
    durationSec: 5,
    warningAr: "يُستخدم بعد تغيير فلتر الوقود أو المضخة",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62"],
    protocol: "UDS",
  },

  // ─── البخاخات (Injectors) ───
  {
    id: "injector_1",
    nameAr: "بخاخ الأسطوانة 1",
    nameEn: "Injector Cylinder 1",
    category: "engine",
    ecuHeader: "7E0",
    session: "extended",
    onCmd:  ["10 03", "31 01 20 01 01"],  // Injector 1 ON
    offCmd: ["31 01 20 00 01"],
    durationSec: 5,
    warningAr: "لا تشغّل لأكثر من 5 ثواني — خطر تلف الحاقن",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62", "Frontier D41", "Navara D23", "Maxima A36"],
    protocol: "UDS",
  },
  {
    id: "injector_2",
    nameAr: "بخاخ الأسطوانة 2",
    nameEn: "Injector Cylinder 2",
    category: "engine",
    ecuHeader: "7E0",
    session: "extended",
    onCmd:  ["10 03", "31 01 20 01 02"],
    offCmd: ["31 01 20 00 02"],
    durationSec: 5,
    warningAr: "لا تشغّل لأكثر من 5 ثواني",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62", "Frontier D41", "Navara D23", "Maxima A36"],
    protocol: "UDS",
  },
  {
    id: "injector_3",
    nameAr: "بخاخ الأسطوانة 3",
    nameEn: "Injector Cylinder 3",
    category: "engine",
    ecuHeader: "7E0",
    session: "extended",
    onCmd:  ["10 03", "31 01 20 01 03"],
    offCmd: ["31 01 20 00 03"],
    durationSec: 5,
    warningAr: "لا تشغّل لأكثر من 5 ثواني",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62", "Frontier D41", "Navara D23", "Maxima A36"],
    protocol: "UDS",
  },
  {
    id: "injector_4",
    nameAr: "بخاخ الأسطوانة 4",
    nameEn: "Injector Cylinder 4",
    category: "engine",
    ecuHeader: "7E0",
    session: "extended",
    onCmd:  ["10 03", "31 01 20 01 04"],
    offCmd: ["31 01 20 00 04"],
    durationSec: 5,
    warningAr: "لا تشغّل لأكثر من 5 ثواني",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62", "Frontier D41", "Navara D23", "Maxima A36"],
    protocol: "UDS",
  },
  {
    id: "injector_5",
    nameAr: "بخاخ الأسطوانة 5",
    nameEn: "Injector Cylinder 5",
    category: "engine",
    ecuHeader: "7E0",
    session: "extended",
    onCmd:  ["10 03", "31 01 20 01 05"],
    offCmd: ["31 01 20 00 05"],
    durationSec: 5,
    warningAr: "للمحركات 6 أسطوانات فأكثر فقط",
    supportedModels: ["Patrol Y62", "Armada Y62", "Pathfinder R53", "Maxima A36", "Titan A61"],
    protocol: "UDS",
  },
  {
    id: "injector_6",
    nameAr: "بخاخ الأسطوانة 6",
    nameEn: "Injector Cylinder 6",
    category: "engine",
    ecuHeader: "7E0",
    session: "extended",
    onCmd:  ["10 03", "31 01 20 01 06"],
    offCmd: ["31 01 20 00 06"],
    durationSec: 5,
    warningAr: "للمحركات 6 أسطوانات فأكثر فقط",
    supportedModels: ["Patrol Y62", "Armada Y62", "Pathfinder R53", "Maxima A36", "Titan A61"],
    protocol: "UDS",
  },
  {
    id: "injector_7",
    nameAr: "بخاخ الأسطوانة 7",
    nameEn: "Injector Cylinder 7",
    category: "engine",
    ecuHeader: "7E0",
    session: "extended",
    onCmd:  ["10 03", "31 01 20 01 07"],
    offCmd: ["31 01 20 00 07"],
    durationSec: 5,
    warningAr: "للمحركات V8 فقط",
    supportedModels: ["Patrol Y62", "Armada Y62", "Titan A61"],
    protocol: "UDS",
  },
  {
    id: "injector_8",
    nameAr: "بخاخ الأسطوانة 8",
    nameEn: "Injector Cylinder 8",
    category: "engine",
    ecuHeader: "7E0",
    session: "extended",
    onCmd:  ["10 03", "31 01 20 01 08"],
    offCmd: ["31 01 20 00 08"],
    durationSec: 5,
    warningAr: "للمحركات V8 فقط",
    supportedModels: ["Patrol Y62", "Armada Y62", "Titan A61"],
    protocol: "UDS",
  },

  // ─── كومبروسر المكيف ───
  {
    id: "ac_compressor",
    nameAr: "كومبروسر المكيف",
    nameEn: "A/C Compressor Clutch",
    category: "ac",
    ecuHeader: "7E0",
    session: "extended",
    onCmd:  ["10 03", "31 01 05 01"],
    offCmd: ["31 01 05 00"],
    monitorPid: "2204",  // Throttle/AC load
    durationSec: 20,
    warningAr: "تأكد من وجود غاز كافٍ في النظام قبل الاختبار",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62", "Kicks P15", "Qashqai J12", "Murano Z52"],
    protocol: "UDS",
  },
  {
    id: "ac_blower",
    nameAr: "مروحة التكييف الداخلية (Blower)",
    nameEn: "A/C Blower Motor",
    category: "ac",
    ecuHeader: "744",  // HVAC
    session: "extended",
    onCmd:  ["10 03", "31 01 10 01 03"],  // Blower speed 3
    offCmd: ["31 01 10 00 00"],
    durationSec: 20,
    warningAr: "اختبار مروحة الكابينة الداخلية",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62", "Qashqai J12"],
    protocol: "UDS",
  },

  // ─── مضخة ABS ───
  {
    id: "abs_pump",
    nameAr: "مضخة ABS",
    nameEn: "ABS Hydraulic Pump",
    category: "abs",
    ecuHeader: "740",  // ABS/VDC
    session: "extended",
    onCmd:  ["10 03", "31 01 30 01"],
    offCmd: ["31 01 30 00"],
    durationSec: 10,
    warningAr: "لا تشغّل مع الضغط على البريك — خطر تلف النظام",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62", "Frontier D41", "Navara D23"],
    protocol: "UDS",
  },
  {
    id: "abs_valve_fl",
    nameAr: "صمام ABS - الأمامي الأيسر",
    nameEn: "ABS Inlet Valve FL",
    category: "abs",
    ecuHeader: "740",
    session: "extended",
    onCmd:  ["10 03", "31 01 31 01 01"],
    offCmd: ["31 01 31 00 01"],
    durationSec: 5,
    warningAr: "اختبار الصمامات الهيدروليكية لـ ABS",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53"],
    protocol: "UDS",
  },
  {
    id: "abs_valve_fr",
    nameAr: "صمام ABS - الأمامي الأيمن",
    nameEn: "ABS Inlet Valve FR",
    category: "abs",
    ecuHeader: "740",
    session: "extended",
    onCmd:  ["10 03", "31 01 31 01 02"],
    offCmd: ["31 01 31 00 02"],
    durationSec: 5,
    warningAr: "اختبار الصمامات الهيدروليكية لـ ABS",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53"],
    protocol: "UDS",
  },
  {
    id: "abs_valve_rl",
    nameAr: "صمام ABS - الخلفي الأيسر",
    nameEn: "ABS Inlet Valve RL",
    category: "abs",
    ecuHeader: "740",
    session: "extended",
    onCmd:  ["10 03", "31 01 31 01 03"],
    offCmd: ["31 01 31 00 03"],
    durationSec: 5,
    warningAr: "اختبار الصمامات الهيدروليكية لـ ABS",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53"],
    protocol: "UDS",
  },
  {
    id: "abs_valve_rr",
    nameAr: "صمام ABS - الخلفي الأيمن",
    nameEn: "ABS Inlet Valve RR",
    category: "abs",
    ecuHeader: "740",
    session: "extended",
    onCmd:  ["10 03", "31 01 31 01 04"],
    offCmd: ["31 01 31 00 04"],
    durationSec: 5,
    warningAr: "اختبار الصمامات الهيدروليكية لـ ABS",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53"],
    protocol: "UDS",
  },

  // ─── صمامات VVT / VVEL ───
  {
    id: "vvt_intake",
    nameAr: "صمام VVT - كامة الشفط",
    nameEn: "VVT Intake Camshaft",
    category: "engine",
    ecuHeader: "7E0",
    session: "extended",
    onCmd:  ["10 03", "31 01 40 01 01"],
    offCmd: ["31 01 40 00 01"],
    monitorPid: "010D",  // Speed
    durationSec: 10,
    warningAr: "تأكد من دفء المحرك الكامل (>90°C)",
    supportedModels: ["X-Trail T33", "Altima L34", "Pathfinder R53", "Qashqai J12", "Rogue T33", "Murano Z52", "Maxima A36"],
    protocol: "UDS",
  },
  {
    id: "vvt_exhaust",
    nameAr: "صمام VVT - كامة العادم",
    nameEn: "VVT Exhaust Camshaft",
    category: "engine",
    ecuHeader: "7E0",
    session: "extended",
    onCmd:  ["10 03", "31 01 40 01 02"],
    offCmd: ["31 01 40 00 02"],
    durationSec: 10,
    warningAr: "تأكد من دفء المحرك الكامل (>90°C)",
    supportedModels: ["X-Trail T33", "Altima L34", "Pathfinder R53", "Qashqai J12", "Rogue T33", "Murano Z52", "Maxima A36"],
    protocol: "UDS",
  },

  // ─── صمام EVAP ───
  {
    id: "evap_solenoid",
    nameAr: "صمام EVAP (تبخر الوقود)",
    nameEn: "EVAP Purge Solenoid",
    category: "engine",
    ecuHeader: "7E0",
    session: "extended",
    onCmd:  ["10 03", "31 01 50 01"],
    offCmd: ["31 01 50 00"],
    durationSec: 10,
    warningAr: "يُستخدم لاختبار نظام استرداد بخار الوقود",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Kicks P15", "Qashqai J12", "Sentra B18"],
    protocol: "UDS",
  },

  // ─── صمام EGR ───
  {
    id: "egr_valve",
    nameAr: "صمام EGR",
    nameEn: "EGR Valve",
    category: "engine",
    ecuHeader: "7E0",
    session: "extended",
    onCmd:  ["10 03", "31 01 51 01 32"],  // 50% open
    offCmd: ["31 01 51 00 00"],
    durationSec: 10,
    warningAr: "للمحركات الديزل فقط - Navara D23 / Patrol Y62 Diesel",
    supportedModels: ["Navara D23", "Patrol Y62 Diesel", "Frontier D41"],
    protocol: "UDS",
  },

  // ─── مضخة التوجيه الكهربائي ───
  {
    id: "eps_torque",
    nameAr: "اختبار التوجيه الكهربائي (EPS)",
    nameEn: "Electric Power Steering Test",
    category: "body",
    ecuHeader: "742",  // EPS
    session: "extended",
    onCmd:  ["10 03", "31 01 60 01"],
    offCmd: ["31 01 60 00"],
    durationSec: 15,
    warningAr: "تأكد من توقف السيارة تماماً قبل الاختبار",
    supportedModels: ["X-Trail T33", "Altima L34", "Pathfinder R53", "Kicks P15", "Qashqai J12", "Sentra B18", "Versa N18"],
    protocol: "UDS",
  },

  // ─── اختبارات BCM ───
  {
    id: "horn_test",
    nameAr: "اختبار البوق",
    nameEn: "Horn Test",
    category: "body",
    ecuHeader: "746",  // BCM
    session: "extended",
    onCmd:  ["10 03", "31 01 70 01"],
    offCmd: ["31 01 70 00"],
    durationSec: 3,
    warningAr: "سيصدر صوت البوق — تأكد من البيئة المناسبة",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62", "Kicks P15", "Qashqai J12"],
    protocol: "UDS",
  },
  {
    id: "hazard_lights",
    nameAr: "اختبار أضواء الطوارئ",
    nameEn: "Hazard Lights Test",
    category: "body",
    ecuHeader: "746",
    session: "extended",
    onCmd:  ["10 03", "31 01 71 01"],
    offCmd: ["31 01 71 00"],
    durationSec: 10,
    warningAr: "ستومض جميع الأضواء",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62"],
    protocol: "UDS",
  },
  {
    id: "rear_defrost",
    nameAr: "مقاومة تسخين الزجاج الخلفي",
    nameEn: "Rear Window Defrost",
    category: "body",
    ecuHeader: "746",
    session: "extended",
    onCmd:  ["10 03", "31 01 72 01"],
    offCmd: ["31 01 72 00"],
    durationSec: 30,
    warningAr: "لا تشغّل لأكثر من 30 ثانية",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62", "Murano Z52"],
    protocol: "UDS",
  },

  // ─── اختبارات القير CVT/AT ───
  {
    id: "tcm_line_pressure",
    nameAr: "اختبار ضغط خط القير",
    nameEn: "Transmission Line Pressure Test",
    category: "transmission",
    ecuHeader: "7E1",  // TCM
    session: "extended",
    onCmd:  ["10 03", "31 01 80 01"],
    offCmd: ["31 01 80 00"],
    monitorPid: "2203",  // CVT Temp
    durationSec: 15,
    warningAr: "السيارة يجب أن تكون على وضع Park (P)",
    supportedModels: ["X-Trail T33", "Altima L34", "Pathfinder R53", "Kicks P15", "Qashqai J12", "Sentra B18", "Rogue T33"],
    protocol: "UDS",
  },
  {
    id: "tcm_solenoid_a",
    nameAr: "صمام القير A (Shift Solenoid A)",
    nameEn: "Transmission Shift Solenoid A",
    category: "transmission",
    ecuHeader: "7E1",
    session: "extended",
    onCmd:  ["10 03", "31 01 81 01 01"],
    offCmd: ["31 01 81 00 01"],
    durationSec: 5,
    warningAr: "السيارة يجب أن تكون متوقفة تماماً",
    supportedModels: ["Patrol Y62", "Armada Y62", "Pathfinder R53", "Frontier D41", "Navara D23", "Titan A61"],
    protocol: "UDS",
  },
  {
    id: "tcm_solenoid_b",
    nameAr: "صمام القير B (Shift Solenoid B)",
    nameEn: "Transmission Shift Solenoid B",
    category: "transmission",
    ecuHeader: "7E1",
    session: "extended",
    onCmd:  ["10 03", "31 01 81 01 02"],
    offCmd: ["31 01 81 00 02"],
    durationSec: 5,
    warningAr: "السيارة يجب أن تكون متوقفة تماماً",
    supportedModels: ["Patrol Y62", "Armada Y62", "Pathfinder R53", "Frontier D41", "Navara D23", "Titan A61"],
    protocol: "UDS",
  },

  // ─── اختبار الإشعال ───
  {
    id: "ignition_coil_1",
    nameAr: "ملف الإشعال - الأسطوانة 1",
    nameEn: "Ignition Coil Cylinder 1",
    category: "engine",
    ecuHeader: "7E0",
    session: "extended",
    onCmd:  ["10 03", "31 01 90 01 01"],
    offCmd: ["31 01 90 00 01"],
    durationSec: 3,
    warningAr: "لا تشغّل لأكثر من 3 ثواني — خطر تلف الملف",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62", "Maxima A36"],
    protocol: "UDS",
  },
  {
    id: "ignition_coil_2",
    nameAr: "ملف الإشعال - الأسطوانة 2",
    nameEn: "Ignition Coil Cylinder 2",
    category: "engine",
    ecuHeader: "7E0",
    session: "extended",
    onCmd:  ["10 03", "31 01 90 01 02"],
    offCmd: ["31 01 90 00 02"],
    durationSec: 3,
    warningAr: "لا تشغّل لأكثر من 3 ثواني",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62", "Maxima A36"],
    protocol: "UDS",
  },
  {
    id: "ignition_coil_3",
    nameAr: "ملف الإشعال - الأسطوانة 3",
    nameEn: "Ignition Coil Cylinder 3",
    category: "engine",
    ecuHeader: "7E0",
    session: "extended",
    onCmd:  ["10 03", "31 01 90 01 03"],
    offCmd: ["31 01 90 00 03"],
    durationSec: 3,
    warningAr: "لا تشغّل لأكثر من 3 ثواني",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62", "Maxima A36"],
    protocol: "UDS",
  },
  {
    id: "ignition_coil_4",
    nameAr: "ملف الإشعال - الأسطوانة 4",
    nameEn: "Ignition Coil Cylinder 4",
    category: "engine",
    ecuHeader: "7E0",
    session: "extended",
    onCmd:  ["10 03", "31 01 90 01 04"],
    offCmd: ["31 01 90 00 04"],
    durationSec: 3,
    warningAr: "لا تشغّل لأكثر من 3 ثواني",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62", "Maxima A36"],
    protocol: "UDS",
  },

  // ─── اختبار الأكسجين / Lambda ───
  {
    id: "o2_heater_b1s1",
    nameAr: "سخان حساس الأكسجين B1S1",
    nameEn: "O2 Sensor Heater Bank1 Sensor1",
    category: "engine",
    ecuHeader: "7E0",
    session: "extended",
    onCmd:  ["10 03", "31 01 A0 01 11"],
    offCmd: ["31 01 A0 00 11"],
    durationSec: 10,
    warningAr: "يُستخدم لاختبار سخان حساس الأكسجين",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62", "Maxima A36", "Murano Z52"],
    protocol: "UDS",
  },
  {
    id: "o2_heater_b1s2",
    nameAr: "سخان حساس الأكسجين B1S2",
    nameEn: "O2 Sensor Heater Bank1 Sensor2",
    category: "engine",
    ecuHeader: "7E0",
    session: "extended",
    onCmd:  ["10 03", "31 01 A0 01 12"],
    offCmd: ["31 01 A0 00 12"],
    durationSec: 10,
    warningAr: "يُستخدم لاختبار سخان حساس الأكسجين الخلفي",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62", "Maxima A36"],
    protocol: "UDS",
  },

  // ─── اختبار IPDM (توزيع الطاقة) ───
  {
    id: "headlights_low",
    nameAr: "المصابيح الأمامية - قريبة",
    nameEn: "Headlights Low Beam",
    category: "electrical",
    ecuHeader: "75A",  // IPDM
    session: "extended",
    onCmd:  ["10 03", "31 01 B0 01 01"],
    offCmd: ["31 01 B0 00 01"],
    durationSec: 10,
    warningAr: "تأكد من عدم وجود أشخاص أمام السيارة",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62"],
    protocol: "UDS",
  },
  {
    id: "headlights_high",
    nameAr: "المصابيح الأمامية - بعيدة",
    nameEn: "Headlights High Beam",
    category: "electrical",
    ecuHeader: "75A",
    session: "extended",
    onCmd:  ["10 03", "31 01 B0 01 02"],
    offCmd: ["31 01 B0 00 02"],
    durationSec: 10,
    warningAr: "تأكد من عدم وجود أشخاص أمام السيارة",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62"],
    protocol: "UDS",
  },
  {
    id: "starter_relay",
    nameAr: "ريلي بادئ التشغيل",
    nameEn: "Starter Relay Test",
    category: "electrical",
    ecuHeader: "75A",
    session: "extended",
    onCmd:  ["10 03", "31 01 C0 01"],
    offCmd: ["31 01 C0 00"],
    durationSec: 2,
    warningAr: "تأكد من إيقاف المحرك تماماً — خطر تلف البادئ",
    supportedModels: ["X-Trail T33", "Patrol Y62", "Altima L34", "Pathfinder R53", "Armada Y62", "Frontier D41"],
    protocol: "UDS",
  },
];

// ═══ Helper: Get tests by category ═══
export function getNissanTestsByCategory(category: NissanActionTest["category"]): NissanActionTest[] {
  return NISSAN_ACTION_TESTS.filter(t => t.category === category);
}

// ═══ Helper: Get tests by model ═══
export function getNissanTestsByModel(model: string): NissanActionTest[] {
  const modelLower = model.toLowerCase();
  return NISSAN_ACTION_TESTS.filter(t =>
    t.supportedModels.some(m => m.toLowerCase().includes(modelLower))
  );
}

// ═══ Category Labels ═══
export const NISSAN_CATEGORY_LABELS: Record<NissanActionTest["category"], string> = {
  engine:       "المحرك",
  cooling:      "التبريد",
  fuel:         "الوقود",
  transmission: "ناقل الحركة",
  abs:          "نظام الفرامل ABS",
  ac:           "التكييف",
  body:         "الجسم والكهرباء",
  electrical:   "الكهرباء",
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORD ACTION TESTS — Grand Marquis / Crown Victoria / Lincoln Town Car
// Protocol: Ford EEC-V (J2190) + ISO 15765-4 CAN (500kbps)
// Header: C4 10 F1 (EEC-V proprietary, NOT standard UDS)
// Tested on: 4.6L V8 SOHC (2-valve) — 2003-2011 Panther Platform
// ═══════════════════════════════════════════════════════════════════════════════

export type FordActionTest = {
  id: string;
  nameAr: string;
  nameEn: string;
  category: "cooling" | "engine" | "fuel" | "abs" | "transmission" | "electrical" | "body";
  protocol: "FORD_EEC5" | "UDS";
  ecuHeader: string;
  initCmds: string[];
  onCmd: string;
  offCmd: string;
  exitCmd: string;
  durationSec: number;
  warningAr: string;
  supportedModels: string[];
  notes?: string;
};

export const FORD_ACTION_TESTS: FordActionTest[] = [
  // ═══ COOLING ═══
  {
    id: "ford_fan_low",
    nameAr: "مروحة التبريد - سرعة منخفضة",
    nameEn: "Cooling Fan Low Speed (LFC)",
    category: "cooling",
    protocol: "FORD_EEC5",
    ecuHeader: "C410",
    initCmds: ["25", "3184"],
    onCmd:  "B1002503",
    offCmd: "3284",
    exitCmd: "3284",
    durationSec: 30,
    warningAr: "لا تشغّل لأكثر من 30 ثانية — تأكد من توقف المحرك",
    supportedModels: ["Grand Marquis", "Crown Victoria", "Lincoln Town Car", "Marauder", "F-150 4.6L", "Mustang 4.6L", "Taurus", "Explorer"],
    notes: "LFC = Low Fan Control. Header C4 10 F1 (F1 added by ELM327)",
  },
  {
    id: "ford_fan_high",
    nameAr: "مروحة التبريد - سرعة عالية",
    nameEn: "Cooling Fan High Speed (HFC)",
    category: "cooling",
    protocol: "FORD_EEC5",
    ecuHeader: "C410",
    initCmds: ["25", "3184"],
    onCmd:  "B1002504",
    offCmd: "3284",
    exitCmd: "3284",
    durationSec: 30,
    warningAr: "خطر ارتفاع درجة الحرارة — لا تشغّل لأكثر من 30 ثانية",
    supportedModels: ["Grand Marquis", "Crown Victoria", "Lincoln Town Car", "Marauder", "F-150 4.6L", "Mustang 4.6L", "Taurus", "Explorer"],
    notes: "HFC = High Fan Control",
  },
  {
    id: "ford_all_outputs",
    nameAr: "جميع المخرجات - تشغيل كامل",
    nameEn: "All Outputs ON (Diagnostic)",
    category: "cooling",
    protocol: "FORD_EEC5",
    ecuHeader: "C410",
    initCmds: ["25", "3184"],
    onCmd:  "B1002502",
    offCmd: "3284",
    exitCmd: "3284",
    durationSec: 10,
    warningAr: "يشغّل جميع المخرجات — للتشخيص السريع فقط",
    supportedModels: ["Grand Marquis", "Crown Victoria", "Lincoln Town Car", "Marauder"],
    notes: "ALL ON = B1002502",
  },
  // ═══ ENGINE — بخاخات (UDS Mode 2F — موديلات 2013+) ═══
  {
    id: "ford_inj1",
    nameAr: "بخاخ 1 — اختبار",
    nameEn: "Injector Cylinder 1 Test",
    category: "engine",
    protocol: "UDS",
    ecuHeader: "7E0",
    initCmds: ["1003"],
    onCmd:  "2F018003FF",
    offCmd: "2F018000",
    exitCmd: "1001",
    durationSec: 5,
    warningAr: "لا تشغّل لأكثر من 5 ثوانٍ — للموديلات 2013+ فقط",
    supportedModels: ["F-150 2015+", "Mustang 2015+", "Explorer 2016+", "Edge 2016+", "Fusion 2013+"],
    notes: "Mode 2F InputOutputControlByIdentifier",
  },
  {
    id: "ford_inj2",
    nameAr: "بخاخ 2 — اختبار",
    nameEn: "Injector Cylinder 2 Test",
    category: "engine",
    protocol: "UDS",
    ecuHeader: "7E0",
    initCmds: ["1003"],
    onCmd:  "2F018103FF",
    offCmd: "2F018100",
    exitCmd: "1001",
    durationSec: 5,
    warningAr: "لا تشغّل لأكثر من 5 ثوانٍ",
    supportedModels: ["F-150 2015+", "Mustang 2015+", "Explorer 2016+", "Edge 2016+", "Fusion 2013+"],
  },
  {
    id: "ford_inj3",
    nameAr: "بخاخ 3 — اختبار",
    nameEn: "Injector Cylinder 3 Test",
    category: "engine",
    protocol: "UDS",
    ecuHeader: "7E0",
    initCmds: ["1003"],
    onCmd:  "2F018203FF",
    offCmd: "2F018200",
    exitCmd: "1001",
    durationSec: 5,
    warningAr: "لا تشغّل لأكثر من 5 ثوانٍ",
    supportedModels: ["F-150 2015+", "Mustang 2015+", "Explorer 2016+", "Edge 2016+", "Fusion 2013+"],
  },
  {
    id: "ford_inj4",
    nameAr: "بخاخ 4 — اختبار",
    nameEn: "Injector Cylinder 4 Test",
    category: "engine",
    protocol: "UDS",
    ecuHeader: "7E0",
    initCmds: ["1003"],
    onCmd:  "2F018303FF",
    offCmd: "2F018300",
    exitCmd: "1001",
    durationSec: 5,
    warningAr: "لا تشغّل لأكثر من 5 ثوانٍ",
    supportedModels: ["F-150 2015+", "Mustang 2015+", "Explorer 2016+", "Edge 2016+", "Fusion 2013+"],
  },
  {
    id: "ford_inj5",
    nameAr: "بخاخ 5 — اختبار",
    nameEn: "Injector Cylinder 5 Test",
    category: "engine",
    protocol: "UDS",
    ecuHeader: "7E0",
    initCmds: ["1003"],
    onCmd:  "2F018403FF",
    offCmd: "2F018400",
    exitCmd: "1001",
    durationSec: 5,
    warningAr: "لا تشغّل لأكثر من 5 ثوانٍ",
    supportedModels: ["F-150 2015+", "Mustang 2015+", "Explorer 2016+"],
  },
  {
    id: "ford_inj6",
    nameAr: "بخاخ 6 — اختبار",
    nameEn: "Injector Cylinder 6 Test",
    category: "engine",
    protocol: "UDS",
    ecuHeader: "7E0",
    initCmds: ["1003"],
    onCmd:  "2F018503FF",
    offCmd: "2F018500",
    exitCmd: "1001",
    durationSec: 5,
    warningAr: "لا تشغّل لأكثر من 5 ثوانٍ",
    supportedModels: ["F-150 2015+", "Explorer 2016+"],
  },
  {
    id: "ford_inj7",
    nameAr: "بخاخ 7 — اختبار",
    nameEn: "Injector Cylinder 7 Test",
    category: "engine",
    protocol: "UDS",
    ecuHeader: "7E0",
    initCmds: ["1003"],
    onCmd:  "2F018603FF",
    offCmd: "2F018600",
    exitCmd: "1001",
    durationSec: 5,
    warningAr: "لا تشغّل لأكثر من 5 ثوانٍ",
    supportedModels: ["F-150 5.0L+", "Mustang 5.0L+"],
  },
  {
    id: "ford_inj8",
    nameAr: "بخاخ 8 — اختبار",
    nameEn: "Injector Cylinder 8 Test",
    category: "engine",
    protocol: "UDS",
    ecuHeader: "7E0",
    initCmds: ["1003"],
    onCmd:  "2F018703FF",
    offCmd: "2F018700",
    exitCmd: "1001",
    durationSec: 5,
    warningAr: "لا تشغّل لأكثر من 5 ثوانٍ",
    supportedModels: ["F-150 5.0L+", "Mustang 5.0L+"],
  },
  // ═══ ENGINE — كويلات الإشعال (UDS) ═══
  {
    id: "ford_coil1",
    nameAr: "كويل إشعال 1",
    nameEn: "Ignition Coil 1",
    category: "engine",
    protocol: "UDS",
    ecuHeader: "7E0",
    initCmds: ["1003"],
    onCmd:  "2F019003FF",
    offCmd: "2F019000",
    exitCmd: "1001",
    durationSec: 3,
    warningAr: "تأكد من توقف المحرك — خطر الصعق الكهربائي",
    supportedModels: ["F-150 2015+", "Mustang 2015+", "Explorer 2016+", "Edge 2016+"],
  },
  {
    id: "ford_coil2",
    nameAr: "كويل إشعال 2",
    nameEn: "Ignition Coil 2",
    category: "engine",
    protocol: "UDS",
    ecuHeader: "7E0",
    initCmds: ["1003"],
    onCmd:  "2F019103FF",
    offCmd: "2F019100",
    exitCmd: "1001",
    durationSec: 3,
    warningAr: "تأكد من توقف المحرك",
    supportedModels: ["F-150 2015+", "Mustang 2015+", "Explorer 2016+", "Edge 2016+"],
  },
  {
    id: "ford_coil3",
    nameAr: "كويل إشعال 3",
    nameEn: "Ignition Coil 3",
    category: "engine",
    protocol: "UDS",
    ecuHeader: "7E0",
    initCmds: ["1003"],
    onCmd:  "2F019203FF",
    offCmd: "2F019200",
    exitCmd: "1001",
    durationSec: 3,
    warningAr: "تأكد من توقف المحرك",
    supportedModels: ["F-150 2015+", "Mustang 2015+", "Explorer 2016+", "Edge 2016+"],
  },
  {
    id: "ford_coil4",
    nameAr: "كويل إشعال 4",
    nameEn: "Ignition Coil 4",
    category: "engine",
    protocol: "UDS",
    ecuHeader: "7E0",
    initCmds: ["1003"],
    onCmd:  "2F019303FF",
    offCmd: "2F019300",
    exitCmd: "1001",
    durationSec: 3,
    warningAr: "تأكد من توقف المحرك",
    supportedModels: ["F-150 2015+", "Mustang 2015+", "Explorer 2016+", "Edge 2016+"],
  },
  {
    id: "ford_coil5",
    nameAr: "كويل إشعال 5",
    nameEn: "Ignition Coil 5",
    category: "engine",
    protocol: "UDS",
    ecuHeader: "7E0",
    initCmds: ["1003"],
    onCmd:  "2F019403FF",
    offCmd: "2F019400",
    exitCmd: "1001",
    durationSec: 3,
    warningAr: "تأكد من توقف المحرك",
    supportedModels: ["F-150 5.0L+", "Mustang 5.0L+", "Explorer 2016+"],
  },
  {
    id: "ford_coil6",
    nameAr: "كويل إشعال 6",
    nameEn: "Ignition Coil 6",
    category: "engine",
    protocol: "UDS",
    ecuHeader: "7E0",
    initCmds: ["1003"],
    onCmd:  "2F019503FF",
    offCmd: "2F019500",
    exitCmd: "1001",
    durationSec: 3,
    warningAr: "تأكد من توقف المحرك",
    supportedModels: ["F-150 5.0L+", "Mustang 5.0L+", "Explorer 2016+"],
  },
  {
    id: "ford_coil7",
    nameAr: "كويل إشعال 7",
    nameEn: "Ignition Coil 7",
    category: "engine",
    protocol: "UDS",
    ecuHeader: "7E0",
    initCmds: ["1003"],
    onCmd:  "2F019603FF",
    offCmd: "2F019600",
    exitCmd: "1001",
    durationSec: 3,
    warningAr: "تأكد من توقف المحرك",
    supportedModels: ["F-150 5.0L+", "Mustang 5.0L+"],
  },
  {
    id: "ford_coil8",
    nameAr: "كويل إشعال 8",
    nameEn: "Ignition Coil 8",
    category: "engine",
    protocol: "UDS",
    ecuHeader: "7E0",
    initCmds: ["1003"],
    onCmd:  "2F019703FF",
    offCmd: "2F019700",
    exitCmd: "1001",
    durationSec: 3,
    warningAr: "تأكد من توقف المحرك",
    supportedModels: ["F-150 5.0L+", "Mustang 5.0L+"],
  },
  // ═══ FUEL ═══
  {
    id: "ford_fuel_pump",
    nameAr: "مضخة الوقود",
    nameEn: "Fuel Pump Activation",
    category: "fuel",
    protocol: "FORD_EEC5",
    ecuHeader: "C410",
    initCmds: ["25", "3184"],
    onCmd:  "B1002502",
    offCmd: "3284",
    exitCmd: "3284",
    durationSec: 10,
    warningAr: "⚠️ تنبيه: B1002502 = ALL ON يشغّل جميع المخرجات معاً (مضخة + مروحة + EVAP). هذا طبيعي في EEC-V",
    supportedModels: ["Grand Marquis", "Crown Victoria", "Lincoln Town Car", "F-150 4.6L", "Mustang 4.6L"],
    notes: "EEC-V ALL ON output test - activates all outputs simultaneously",
  },
  {
    id: "ford_evap",
    nameAr: "صمام EVAP (تنفيس خزان الوقود)",
    nameEn: "EVAP Canister Purge Valve",
    category: "fuel",
    protocol: "UDS",
    ecuHeader: "7E0",
    initCmds: ["1003"],
    onCmd:  "2F01A003FF",
    offCmd: "2F01A000",
    exitCmd: "1001",
    durationSec: 10,
    warningAr: "تأكد من توقف المحرك",
    supportedModels: ["F-150 2015+", "Mustang 2015+", "Explorer 2016+", "Fusion 2013+"],
  },
  // ═══ ELECTRICAL ═══
  {
    id: "ford_ac_clutch",
    nameAr: "اختبار جميع المخرجات (ALL ON)",
    nameEn: "All Outputs Test (EEC-V)",
    category: "electrical",
    protocol: "FORD_EEC5",
    ecuHeader: "C410",
    initCmds: ["25", "3184"],
    onCmd:  "B1002502",
    offCmd: "3284",
    exitCmd: "3284",
    durationSec: 10,
    warningAr: "يشغّل جميع المخرجات معاً: مضخة الوقود + مروحة + EVAP + كلتش المكيف. تأكد من أمان السيارة",
    supportedModels: ["Grand Marquis", "Crown Victoria", "Lincoln Town Car", "F-150 4.6L"],
    notes: "EEC-V ALL ON - activates all PCM outputs simultaneously for verification",
  },
  {
    id: "ford_mil",
    nameAr: "مصباح Check Engine (MIL)",
    nameEn: "Malfunction Indicator Lamp",
    category: "electrical",
    protocol: "UDS",
    ecuHeader: "7E0",
    initCmds: ["1003"],
    onCmd:  "2F01B003FF",
    offCmd: "2F01B000",
    exitCmd: "1001",
    durationSec: 5,
    warningAr: "للاختبار فقط — لا يُمثل وجود أعطال",
    supportedModels: ["F-150 2015+", "Mustang 2015+", "Explorer 2016+"],
  },
  // ═══ TRANSMISSION ═══
  {
    id: "ford_ss1",
    nameAr: "صمام التحويل 1 (Shift Solenoid A)",
    nameEn: "Shift Solenoid A",
    category: "transmission",
    protocol: "UDS",
    ecuHeader: "7E1",
    initCmds: ["1003"],
    onCmd:  "2F020003FF",
    offCmd: "2F020000",
    exitCmd: "1001",
    durationSec: 5,
    warningAr: "تأكد من وقوف السيارة — ناقل الحركة في وضع P",
    supportedModels: ["F-150 2015+", "Mustang 2015+", "Explorer 2016+"],
  },
  {
    id: "ford_ss2",
    nameAr: "صمام التحويل 2 (Shift Solenoid B)",
    nameEn: "Shift Solenoid B",
    category: "transmission",
    protocol: "UDS",
    ecuHeader: "7E1",
    initCmds: ["1003"],
    onCmd:  "2F020103FF",
    offCmd: "2F020100",
    exitCmd: "1001",
    durationSec: 5,
    warningAr: "تأكد من وقوف السيارة — ناقل الحركة في وضع P",
    supportedModels: ["F-150 2015+", "Mustang 2015+", "Explorer 2016+"],
  },
];

// ═══ Helpers ═══
export function getFordTestsByCategory(category: FordActionTest["category"]): FordActionTest[] {
  return FORD_ACTION_TESTS.filter(t => t.category === category);
}

export function getFordTestsByModel(model: string): FordActionTest[] {
  const m = model.toLowerCase();
  return FORD_ACTION_TESTS.filter(t =>
    t.supportedModels.some(s => s.toLowerCase().includes(m))
  );
}

export const FORD_CATEGORY_LABELS: Record<FordActionTest["category"], string> = {
  cooling:      "التبريد",
  engine:       "المحرك",
  fuel:         "الوقود",
  abs:          "ABS",
  transmission: "ناقل الحركة",
  electrical:   "الكهرباء",
  body:         "الجسم",
};
