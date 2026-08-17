/**
 * OBD2 Professional BLE Service - مير للتشخيص الاحترافي
 * ═══════════════════════════════════════════════════════
 * Full ELM327 Protocol Implementation via Web Bluetooth API
 * 
 * Supported Protocols:
 * - ISO 15765-4 CAN (11bit/500kbaud, 11bit/250kbaud, 29bit/500kbaud, 29bit/250kbaud)
 * - ISO 9141-2 (5 baud init)
 * - ISO 14230-4 KWP2000 (fast/5 baud init)
 * - SAE J1850 PWM / VPW
 * - SAE J1939 (Heavy Duty Trucks)
 * 
 * Supported Modes:
 * - Mode 01: Current Data (Live PIDs)
 * - Mode 02: Freeze Frame Data
 * - Mode 03: Confirmed DTCs
 * - Mode 04: Clear DTCs
 * - Mode 05: O2 Sensor Monitoring
 * - Mode 06: On-Board Monitoring Test Results
 * - Mode 07: Pending DTCs
 * - Mode 09: Vehicle Information (VIN, ECU Name, Cal ID)
 * - Mode 22: Enhanced/Manufacturer-Specific PIDs
 * 
 * Supported Devices:
 * - OBDLink CX/MX+ (BLE)
 * - Vgate iCar Pro (BLE 4.0)
 * - ELM327 BLE 4.0+
 * - Veepeak OBDCheck BLE+
 * - KONNWEI KW902 BLE
 * - Carista OBD2 BLE
 * - UniCarScan UCSI-2000
 * 
 * @version 3.0.0
 * @author مير - Meir Diagnostics
 */

// ═══════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════

export interface OBDLiveData {
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
  fuelPressure: number;
  shortFuelTrim: number;
  longFuelTrim: number;
  intakeMAP: number;
  o2SensorB1S1: number;
  o2SensorB1S2: number;
  ambientTemp: number;
  runTime: number;
  distanceWithMIL: number;
  barometricPressure: number;
  catalystTempB1S1: number;
  fuelRailPressure: number;
  commandedEGR: number;
  fuelType: number;
  oilTemp: number;
  instantFuelConsumption: number;
  engineTorque: number;
  // New advanced PIDs
  boostPressure: number;
  transmissionTemp: number;
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
  absThrottleB: number;
  acceleratorPedalD: number;
  acceleratorPedalE: number;
}

export interface OBDDTCCode {
  code: string;
  raw: string;
  subCode?: string;        // Ford sub-code مثل 6C أو 28
  fullCode?: string;       // الكود الكامل P008A-6C
  module?: string;         // الوحدة المصدر PCM/TCM/RCM/BCM
  moduleAr?: string;       // اسم الوحدة بالعربي
  isPending?: boolean;     // كود معلق (Mode 07)
}

export interface OBDVehicleInfo {
  vin: string;
  protocol: string;
  ecuName: string;
  calibrationId: string;
  ecuVoltage: string;
  obdStandard: string;
}

export interface FreezeFrameData {
  dtcCode: string;
  rpm: number | null;
  speed: number | null;
  coolantTemp: number | null;
  engineLoad: number | null;
  fuelPressure: number | null;
  intakeTemp: number | null;
  shortFuelTrim: number | null;
  longFuelTrim: number | null;
  timingAdvance: number | null;
  mafRate: number | null;
  throttlePos: number | null;
  fuelStatus: string;
  timestamp: Date;
}

export interface Mode6TestResult {
  testId: string;
  testName: string;
  component: string;
  value: number;
  minLimit: number;
  maxLimit: number;
  unit: string;
  status: "pass" | "fail";
}

export interface O2SensorData {
  bank: number;
  sensor: number;
  voltage: number;
  shortTermFuelTrim: number;
  richToLean: number;
  leanToRich: number;
  status: "normal" | "warning" | "critical";
}

export interface OBDAlert {
  type: "warning" | "critical";
  parameter: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: Date;
}

export interface ReferenceValues {
  make: string;
  model: string;
  year: number;
  rpm: { idle: [number, number]; max: number };
  coolantTemp: { normal: [number, number]; warning: number; critical: number };
  voltage: { normal: [number, number]; low: number; high: number };
  fuelPressure: { normal: [number, number] };
  mafRate: { idle: [number, number] };
  shortFuelTrim: { normal: [number, number] };
  longFuelTrim: { normal: [number, number] };
  oilTemp: { normal: [number, number]; warning: number };
}

export interface ScanReport {
  vin: string;
  protocol: string;
  scanDate: Date;
  liveData: Partial<OBDLiveData>;
  dtcCodes: OBDDTCCode[];
  freezeFrames: FreezeFrameData[];
  mode6Results: Mode6TestResult[];
  readinessTests: Record<string, "pass" | "fail" | "na">;
  alerts: OBDAlert[];
  vehicleInfo: Partial<OBDVehicleInfo>;
  engineHealthScore?: number;
  o2Sensors?: O2SensorData[];
}

export interface EngineHealth {
  score: number; // 0-100
  category: "excellent" | "good" | "fair" | "poor" | "critical";
  factors: { name: string; score: number; weight: number; detail: string }[];
}

export type ConnectionStatus = "disconnected" | "connecting" | "initializing" | "connected" | "error";
export type LogType = "sent" | "received" | "info" | "error";
export type LogCallback = (message: string, type: LogType) => void;
export type AlertCallback = (alert: OBDAlert) => void;

// ═══ Error Handler Types ═══
export type OBDErrorSeverity = "low" | "medium" | "high" | "critical";
export type OBDErrorContext = "connection" | "command" | "parse" | "timeout" | "ble" | "protocol" | "unknown";

export interface OBDError {
  timestamp: number;
  severity: OBDErrorSeverity;
  context: OBDErrorContext;
  message: string;
  command?: string;
  rawResponse?: string;
  retryable: boolean;
}

export interface MultiECUScanResult {
  engine: OBDDTCCode[];
  abs: OBDDTCCode[];
  airbag: OBDDTCCode[];
  bcm: OBDDTCCode[];
  transmission: OBDDTCCode[];
  available: {
    engine?: boolean;
    abs?: boolean;
    airbag?: boolean;
    bcm?: boolean;
    transmission?: boolean;
  };
}

export interface TransmissionData {
  temp: number | null;
  gear: number | null;
  gearDesired: number | null;
  slipRatio: number | null;
  lockupStatus: string | null;
  oilPressure: number | null;
}

export interface FuelEconomyData {
  instantL100km: number | null;
  averageL100km: number | null;
  costPerKm: number | null;
  fuelPricePerLiter: number;
  totalFuelUsed: number | null;
  range: number | null;
}

export interface DataLogEntry {
  timestamp: number;
  elapsed: number;
  rpm: number;
  speed: number;
  coolantTemp: number;
  throttlePos: number;
  engineLoad: number;
  voltage: number;
  mafRate: number;
  fuelLevel: number;
  intakeTemp: number;
  shortFuelTrim: number;
  longFuelTrim: number;
}

export interface PerfTestEntry {
  time: number;
  speed: number;
  rpm: number;
}

export interface PerformanceResult {
  zeroTo100: number;
  zeroTo60mph: number;
  estimatedHP: number;
  estimatedTorque: number;
  maxRPM: number;
  entries: PerfTestEntry[];
}

export interface Mode08Result {
  supported: boolean;
  tid: string;
  response: string;
}

// ═══════════════════════════════════════════════════════
// PROTOCOL CONSTANTS
// ═══════════════════════════════════════════════════════

/** Known ELM327 BLE Service UUIDs */
const KNOWN_SERVICES = [
  "0000fff0-0000-1000-8000-00805f9b34fb", // Most common (Vgate, generic)
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2", // OBDLink
  "0000ffe0-0000-1000-8000-00805f9b34fb", // KONNWEI, some generics
  "49535343-fe7d-4ae5-8fa9-9fafd205e455", // Microchip ISSC
  "0000ab00-0000-1000-8000-00805f9b34fb", // Veepeak
  "0000ffb0-0000-1000-8000-00805f9b34fb", // Carista
  "6e400001-b5a3-f393-e0a9-e50e24dcca9e", // Nordic UART Service - very common in generic/unbranded clones (e.g. DA200-style)
  "0000ffd0-0000-1000-8000-00805f9b34fb", // Additional generic BLE-serial module range
];

/** TX Characteristics (Write to device) */
const KNOWN_TX_CHARACTERISTICS = [
  "0000fff2-0000-1000-8000-00805f9b34fb",
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
  "0000ffe1-0000-1000-8000-00805f9b34fb",
  "49535343-1e4d-4bd9-ba61-23c647249616",
  "0000ab02-0000-1000-8000-00805f9b34fb",
  "0000ffb2-0000-1000-8000-00805f9b34fb",
  "6e400002-b5a3-f393-e0a9-e50e24dcca9e", // Nordic UART TX (write)
  "0000ffd1-0000-1000-8000-00805f9b34fb",
];

/** RX Characteristics (Read from device) */
const KNOWN_RX_CHARACTERISTICS = [
  "0000fff1-0000-1000-8000-00805f9b34fb",
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
  "0000ffe1-0000-1000-8000-00805f9b34fb",
  "49535343-8841-43f4-a8d4-ecbe34729bb3",
  "0000ab01-0000-1000-8000-00805f9b34fb",
  "0000ffb1-0000-1000-8000-00805f9b34fb",
  "6e400003-b5a3-f393-e0a9-e50e24dcca9e", // Nordic UART RX (notify)
  "0000ffd1-0000-1000-8000-00805f9b34fb",
];

// ═══════════════════════════════════════════════════════
// OBD PID DEFINITIONS
// ═══════════════════════════════════════════════════════

interface PIDDefinition {
  name: string;
  formula: (a: number, b?: number, c?: number, d?: number) => number;
  unit: string;
  min?: number;
  max?: number;
  bytes: number;
}

/** Mode 01 - Current Data PIDs */
const OBD_PIDS: Record<string, PIDDefinition> = {
  "0100": { name: "PIDs Supported [01-20]", formula: (a, b, c, d) => ((a || 0) << 24) | ((b || 0) << 16) | ((c || 0) << 8) | (d || 0), unit: "", bytes: 4 },
  "0101": { name: "Monitor Status", formula: (a, b, c, d) => ((a || 0) << 24) | ((b || 0) << 16) | ((c || 0) << 8) | (d || 0), unit: "", bytes: 4 },
  "0103": { name: "Fuel System Status", formula: (a) => a, unit: "", bytes: 2 },
  "0104": { name: "Engine Load", formula: (a) => (a * 100) / 255, unit: "%", min: 0, max: 100, bytes: 1 },
  "0105": { name: "Coolant Temp", formula: (a) => a - 40, unit: "°C", min: -40, max: 215, bytes: 1 },
  "0106": { name: "Short Fuel Trim B1", formula: (a) => ((a - 128) * 100) / 128, unit: "%", min: -100, max: 99.2, bytes: 1 },
  "0107": { name: "Long Fuel Trim B1", formula: (a) => ((a - 128) * 100) / 128, unit: "%", min: -100, max: 99.2, bytes: 1 },
  "0108": { name: "Short Fuel Trim B2", formula: (a) => ((a - 128) * 100) / 128, unit: "%", bytes: 1 },
  "0109": { name: "Long Fuel Trim B2", formula: (a) => ((a - 128) * 100) / 128, unit: "%", bytes: 1 },
  "010A": { name: "Fuel Pressure", formula: (a) => a * 3, unit: "kPa", min: 0, max: 765, bytes: 1 },
  "010B": { name: "Intake MAP", formula: (a) => a, unit: "kPa", min: 0, max: 255, bytes: 1 },
  "010C": { name: "RPM", formula: (a, b) => ((a * 256) + (b || 0)) / 4, unit: "rpm", min: 0, max: 16383.75, bytes: 2 },
  "010D": { name: "Speed", formula: (a) => a, unit: "km/h", min: 0, max: 255, bytes: 1 },
  "010E": { name: "Timing Advance", formula: (a) => (a / 2) - 64, unit: "°BTDC", min: -64, max: 63.5, bytes: 1 },
  "010F": { name: "Intake Air Temp", formula: (a) => a - 40, unit: "°C", min: -40, max: 215, bytes: 1 },
  "0110": { name: "MAF Rate", formula: (a, b) => ((a * 256) + (b || 0)) / 100, unit: "g/s", min: 0, max: 655.35, bytes: 2 },
  "0111": { name: "Throttle Position", formula: (a) => (a * 100) / 255, unit: "%", min: 0, max: 100, bytes: 1 },
  "0114": { name: "O2 Sensor B1S1", formula: (a) => a / 200, unit: "V", min: 0, max: 1.275, bytes: 2 },
  "0115": { name: "O2 Sensor B1S2", formula: (a) => a / 200, unit: "V", min: 0, max: 1.275, bytes: 2 },
  "0116": { name: "O2 Sensor B2S1", formula: (a) => a / 200, unit: "V", bytes: 2 },
  "0117": { name: "O2 Sensor B2S2", formula: (a) => a / 200, unit: "V", bytes: 2 },
  "011C": { name: "OBD Standard", formula: (a) => a, unit: "", bytes: 1 },
  "011F": { name: "Run Time", formula: (a, b) => (a * 256) + (b || 0), unit: "sec", bytes: 2 },
  "0120": { name: "PIDs Supported [21-40]", formula: (a, b, c, d) => ((a || 0) << 24) | ((b || 0) << 16) | ((c || 0) << 8) | (d || 0), unit: "", bytes: 4 },
  "0121": { name: "Distance with MIL", formula: (a, b) => (a * 256) + (b || 0), unit: "km", bytes: 2 },
  "0123": { name: "Fuel Rail Gauge Pressure", formula: (a, b) => ((a * 256) + (b || 0)) * 10, unit: "kPa", bytes: 2 },
  "012C": { name: "Commanded EGR", formula: (a) => (a * 100) / 255, unit: "%", bytes: 1 },
  "012F": { name: "Fuel Level", formula: (a) => (a * 100) / 255, unit: "%", min: 0, max: 100, bytes: 1 },
  "0130": { name: "Warm-ups since clear", formula: (a) => a, unit: "", bytes: 1 },
  "0131": { name: "Distance since clear", formula: (a, b) => (a * 256) + (b || 0), unit: "km", bytes: 2 },
  "0133": { name: "Barometric Pressure", formula: (a) => a, unit: "kPa", bytes: 1 },
  "013C": { name: "Catalyst Temp B1S1", formula: (a, b) => (((a * 256) + (b || 0)) / 10) - 40, unit: "°C", bytes: 2 },
  "0140": { name: "PIDs Supported [41-60]", formula: (a, b, c, d) => ((a || 0) << 24) | ((b || 0) << 16) | ((c || 0) << 8) | (d || 0), unit: "", bytes: 4 },
  "0142": { name: "Control Module Voltage", formula: (a, b) => ((a * 256) + (b || 0)) / 1000, unit: "V", bytes: 2 },
  "0146": { name: "Ambient Air Temp", formula: (a) => a - 40, unit: "°C", bytes: 1 },
  "014D": { name: "Time with MIL", formula: (a, b) => (a * 256) + (b || 0), unit: "min", bytes: 2 },
  "0151": { name: "Fuel Type", formula: (a) => a, unit: "", bytes: 1 },
  "015C": { name: "Oil Temperature", formula: (a) => a - 40, unit: "°C", bytes: 1 },
  "015E": { name: "Fuel Rate", formula: (a, b) => ((a * 256) + (b || 0)) / 20, unit: "L/h", bytes: 2 },
  "0162": { name: "Engine Torque", formula: (a) => a - 125, unit: "%", bytes: 1 },
  // Advanced PIDs - Turbo, Transmission, Throttle, Diesel
  "0143": { name: "Absolute Load", formula: (a, b) => ((a * 256) + (b || 0)) * 100 / 255, unit: "%", min: 0, max: 25700, bytes: 2 },
  "0145": { name: "Relative Throttle", formula: (a) => (a * 100) / 255, unit: "%", min: 0, max: 100, bytes: 1 },
  "0147": { name: "Absolute Throttle B", formula: (a) => (a * 100) / 255, unit: "%", min: 0, max: 100, bytes: 1 },
  "0149": { name: "Accelerator Pedal D", formula: (a) => (a * 100) / 255, unit: "%", min: 0, max: 100, bytes: 1 },
  "014A": { name: "Accelerator Pedal E", formula: (a) => (a * 100) / 255, unit: "%", min: 0, max: 100, bytes: 1 },
  "014C": { name: "Commanded Throttle", formula: (a) => (a * 100) / 255, unit: "%", min: 0, max: 100, bytes: 1 },
  "0152": { name: "Ethanol Fuel %", formula: (a) => (a * 100) / 255, unit: "%", min: 0, max: 100, bytes: 1 },
  "015D": { name: "Fuel Injection Timing", formula: (a, b) => (((a * 256) + (b || 0)) / 128) - 210, unit: "°", bytes: 2 },
  "0170": { name: "Boost Pressure", formula: (a, b) => ((a * 256) + (b || 0)) * 0.03125, unit: "kPa", bytes: 2 },
  "0173": { name: "Exhaust Pressure", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "kPa", bytes: 2 },
  "0174": { name: "Turbo RPM", formula: (a, b) => ((a * 256) + (b || 0)) * 10, unit: "rpm", bytes: 2 },
  "017C": { name: "DPF Temperature", formula: (a, b) => (((a * 256) + (b || 0)) / 10) - 40, unit: "°C", bytes: 2 },
  "0183": { name: "NOx Sensor", formula: (a, b) => (a * 256) + (b || 0), unit: "ppm", bytes: 2 },
  "01A6": { name: "Transmission Temp", formula: (a) => a - 40, unit: "°C", bytes: 1 },
};

/** Ford-Specific Enhanced PIDs (Mode 22) */
const FORD_PIDS: Record<string, PIDDefinition & { nameAr: string }> = {
  // PCM - Powertrain Control Module
  "221001": { name: "Ford Transmission Fluid Temp", nameAr: "حرارة زيت القير", formula: (a) => a - 40, unit: "°C", bytes: 1 },
  "221002": { name: "Ford Turbo Boost Pressure", nameAr: "ضغط التيربو", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "psi", bytes: 2 },
  "221003": { name: "Ford DPFE Sensor Voltage", nameAr: "جهد حساس DPFE", formula: (a, b) => ((a * 256) + (b || 0)) * 0.001, unit: "V", bytes: 2 },
  "221004": { name: "Ford EGR Flow Rate", nameAr: "معدل تدفق EGR", formula: (a) => (a * 100) / 255, unit: "%", bytes: 1 },
  "221005": { name: "Ford Desired Idle RPM", nameAr: "RPM المطلوب عند الخمول", formula: (a, b) => ((a * 256) + (b || 0)) / 4, unit: "rpm", bytes: 2 },
  "221006": { name: "Ford IAC Motor Position", nameAr: "موضع محرك IAC", formula: (a) => a, unit: "steps", bytes: 1 },
  "221007": { name: "Ford Knock Retard", nameAr: "تأخير الإشعال (Knock)", formula: (a) => a * 0.352, unit: "°", bytes: 1 },
  "221008": { name: "Ford Fuel Injector Pulse Width", nameAr: "عرض نبضة الحاقن", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "ms", bytes: 2 },
  "221009": { name: "Ford Spark Advance Cyl 1", nameAr: "تقديم الإشعال أسطوانة 1", formula: (a) => (a / 2) - 64, unit: "°BTDC", bytes: 1 },
  "22100A": { name: "Ford Mass Air Flow Sensor Hz", nameAr: "تردد حساس MAF", formula: (a, b) => (a * 256) + (b || 0), unit: "Hz", bytes: 2 },
  "22100B": { name: "Ford TP Mode", nameAr: "وضع دواسة الوقود", formula: (a) => a, unit: "", bytes: 1 },
  "22100C": { name: "Ford Fuel Pump Duty Cycle", nameAr: "دورة عمل مضخة الوقود", formula: (a) => (a * 100) / 255, unit: "%", bytes: 1 },
  "22100D": { name: "Ford A/C Clutch Status", nameAr: "حالة كلتش التكييف", formula: (a) => a, unit: "", bytes: 1 },
  "22100E": { name: "Ford Generator Load", nameAr: "حمل المولد", formula: (a) => (a * 100) / 255, unit: "%", bytes: 1 },
  "22100F": { name: "Ford Power Steering Pressure", nameAr: "ضغط التوجيه المعزز", formula: (a) => a * 4, unit: "kPa", bytes: 1 },
  // TCM - Transmission Control Module
  "222001": { name: "Ford Gear Commanded", nameAr: "الترس المطلوب", formula: (a) => a, unit: "", bytes: 1 },
  "222002": { name: "Ford Gear Actual", nameAr: "الترس الفعلي", formula: (a) => a, unit: "", bytes: 1 },
  "222003": { name: "Ford TCC Slip Speed", nameAr: "انزلاق TCC", formula: (a, b) => ((a * 256) + (b || 0)) - 32768, unit: "rpm", bytes: 2 },
  "222004": { name: "Ford Line Pressure", nameAr: "ضغط الخط", formula: (a, b) => ((a * 256) + (b || 0)) * 0.1, unit: "psi", bytes: 2 },
  "222005": { name: "Ford Torque Converter Temp", nameAr: "حرارة محول العزم", formula: (a) => a - 40, unit: "°C", bytes: 1 },
  // ABS/Stability
  "223001": { name: "Ford Wheel Speed FL", nameAr: "سرعة عجلة أمامية يسار", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "km/h", bytes: 2 },
  "223002": { name: "Ford Wheel Speed FR", nameAr: "سرعة عجلة أمامية يمين", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "km/h", bytes: 2 },
  "223003": { name: "Ford Wheel Speed RL", nameAr: "سرعة عجلة خلفية يسار", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "km/h", bytes: 2 },
  "223004": { name: "Ford Wheel Speed RR", nameAr: "سرعة عجلة خلفية يمين", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "km/h", bytes: 2 },
  "223005": { name: "Ford Steering Angle", nameAr: "زاوية المقود", formula: (a, b) => ((a * 256) + (b || 0)) - 32768, unit: "°", bytes: 2 },
  "223006": { name: "Ford Yaw Rate", nameAr: "معدل الانحراف", formula: (a, b) => (((a * 256) + (b || 0)) - 32768) * 0.01, unit: "°/s", bytes: 2 },
  "223007": { name: "Ford Lateral Acceleration", nameAr: "التسارع الجانبي", formula: (a, b) => (((a * 256) + (b || 0)) - 32768) * 0.001, unit: "g", bytes: 2 },
  // EcoBoost Specific
  "224001": { name: "Ford Boost Pressure Desired", nameAr: "ضغط التيربو المطلوب", formula: (a, b) => ((a * 256) + (b || 0)) * 0.01, unit: "psi", bytes: 2 },
  "224002": { name: "Ford Wastegate Position", nameAr: "موضع Wastegate", formula: (a) => (a * 100) / 255, unit: "%", bytes: 1 },
  "224003": { name: "Ford Charge Air Temp", nameAr: "حرارة الهواء المضغوط", formula: (a) => a - 40, unit: "°C", bytes: 1 },
  "224004": { name: "Ford Direct Injection Pressure", nameAr: "ضغط الحقن المباشر", formula: (a, b) => ((a * 256) + (b || 0)) * 10, unit: "kPa", bytes: 2 },
  "224005": { name: "Ford Cam Phaser Position", nameAr: "موضع الكامشافت", formula: (a) => (a / 2) - 64, unit: "°", bytes: 1 },
};

/** Ford-specific DTC descriptions */
const FORD_DTC_DATABASE: Record<string, { description: string; descriptionAr: string; severity: string; system: string; causes: string[]; causesAr: string[]; solution: string; solutionAr: string; relatedSensors: string[] }> = {
  "P0171": { description: "System Too Lean Bank 1", descriptionAr: "خليط فقير بنك 1", severity: "medium", system: "Fuel", causes: ["Vacuum leak", "Weak fuel pump", "Dirty MAF sensor", "Faulty PCV valve"], causesAr: ["تسريب فاكيوم", "مضخة وقود ضعيفة", "حساس MAF متسخ", "صمام PCV تالف"], solution: "Check MAF sensor, inspect vacuum hoses, test fuel pressure", solutionAr: "فحص حساس MAF، فحص خراطيم الفاكيوم، اختبار ضغط الوقود", relatedSensors: ["MAF", "O2 B1S1", "Fuel Pressure", "MAP"] },
  "P0174": { description: "System Too Lean Bank 2", descriptionAr: "خليط فقير بنك 2", severity: "medium", system: "Fuel", causes: ["Vacuum leak", "Intake gasket leak", "Dirty MAF", "Low fuel pressure"], causesAr: ["تسريب فاكيوم", "تسريب جوان السحب", "MAF متسخ", "ضغط وقود منخفض"], solution: "Smoke test for vacuum leaks, clean MAF, check fuel trim", solutionAr: "اختبار دخان للتسريبات، تنظيف MAF، فحص Fuel Trim", relatedSensors: ["MAF", "O2 B2S1", "Fuel Pressure", "MAP"] },
  "P0401": { description: "EGR Insufficient Flow", descriptionAr: "تدفق EGR غير كافي", severity: "medium", system: "EGR", causes: ["Clogged EGR passages", "Faulty DPFE sensor", "Stuck EGR valve", "Carbon buildup"], causesAr: ["انسداد ممرات EGR", "حساس DPFE تالف", "صمام EGR عالق", "تراكم كربون"], solution: "Clean EGR valve and passages, replace DPFE sensor if needed", solutionAr: "تنظيف صمام وممرات EGR، استبدال حساس DPFE إذا لزم", relatedSensors: ["DPFE", "EGR Position", "MAP", "Coolant Temp"] },
  "P0420": { description: "Catalyst Efficiency Below Threshold B1", descriptionAr: "كفاءة الكتاليست منخفضة بنك 1", severity: "medium", system: "Catalyst", causes: ["Worn catalyst", "O2 sensor degraded", "Exhaust leak before cat", "Engine misfire damage"], causesAr: ["كتاليست متآكل", "حساس O2 متدهور", "تسريب عادم قبل الكتاليست", "تلف من Misfire"], solution: "Check O2 sensor response, inspect catalyst, check for misfires", solutionAr: "فحص استجابة حساس O2، فحص الكتاليست، فحص Misfire", relatedSensors: ["O2 B1S1", "O2 B1S2", "Catalyst Temp", "Engine Load"] },
  "P0443": { description: "EVAP Purge Control Valve Circuit", descriptionAr: "دائرة صمام تطهير EVAP", severity: "low", system: "EVAP", causes: ["Faulty purge solenoid", "Wiring issue", "PCM driver failure"], causesAr: ["صمام تطهير تالف", "مشكلة أسلاك", "عطل في دائرة PCM"], solution: "Test purge solenoid, check wiring and connector", solutionAr: "اختبار صمام التطهير، فحص الأسلاك والموصل", relatedSensors: ["EVAP Pressure", "FTP Sensor"] },
  "P0340": { description: "Camshaft Position Sensor A Circuit", descriptionAr: "دائرة حساس موضع الكامشافت A", severity: "high", system: "Ignition", causes: ["Faulty CMP sensor", "Timing chain stretched", "Wiring damage", "PCM issue"], causesAr: ["حساس CMP تالف", "سلسلة التوقيت متمددة", "تلف أسلاك", "مشكلة PCM"], solution: "Replace CMP sensor, check timing chain, inspect wiring", solutionAr: "استبدال حساس CMP، فحص سلسلة التوقيت، فحص الأسلاك", relatedSensors: ["CMP Sensor", "CKP Sensor", "RPM"] },
  "P0128": { description: "Coolant Thermostat Below Regulating Temp", descriptionAr: "ثرموستات أقل من حرارة التنظيم", severity: "low", system: "Cooling", causes: ["Stuck open thermostat", "Low coolant", "Faulty ECT sensor"], causesAr: ["ثرموستات عالق مفتوح", "ماء تبريد منخفض", "حساس ECT تالف"], solution: "Replace thermostat, check coolant level and ECT sensor", solutionAr: "استبدال الثرموستات، فحص مستوى التبريد وحساس ECT", relatedSensors: ["ECT Sensor", "Coolant Temp", "Thermostat"] },
  "P2196": { description: "O2 Sensor Signal Biased/Stuck Rich B1S1", descriptionAr: "حساس O2 عالق على Rich بنك 1", severity: "medium", system: "Fuel", causes: ["Faulty O2 sensor", "Fuel pressure too high", "Leaking injector", "EVAP purge stuck open"], causesAr: ["حساس O2 تالف", "ضغط وقود مرتفع", "حاقن يسرب", "صمام EVAP عالق مفتوح"], solution: "Test O2 sensor response, check fuel pressure, inspect injectors", solutionAr: "اختبار استجابة حساس O2، فحص ضغط الوقود، فحص الحاقنات", relatedSensors: ["O2 B1S1", "Fuel Pressure", "Short Fuel Trim B1", "Long Fuel Trim B1"] },
  "P2111": { description: "Throttle Actuator Control System Stuck Open", descriptionAr: "نظام الخانق الإلكتروني عالق مفتوح", severity: "high", system: "Throttle", causes: ["Faulty throttle body", "Carbon buildup", "Wiring issue", "PCM fault"], causesAr: ["جسم خانق تالف", "تراكم كربون", "مشكلة أسلاك", "عطل PCM"], solution: "Clean throttle body, check wiring, replace if needed", solutionAr: "تنظيف جسم الخانق، فحص الأسلاك، استبدال إذا لزم", relatedSensors: ["TPS", "APP Sensor", "Throttle Motor", "Engine Load"] },
  "P0300": { description: "Random/Multiple Cylinder Misfire", descriptionAr: "اختلال احتراق عشوائي/متعدد", severity: "high", system: "Ignition", causes: ["Worn spark plugs", "Faulty coil pack", "Vacuum leak", "Low fuel pressure", "EGR stuck open"], causesAr: ["بواجي متآكلة", "كويل تالف", "تسريب فاكيوم", "ضغط وقود منخفض", "EGR عالق مفتوح"], solution: "Replace spark plugs and coils, check fuel pressure, inspect EGR", solutionAr: "استبدال البواجي والكويلات، فحص ضغط الوقود، فحص EGR", relatedSensors: ["CKP", "CMP", "Fuel Pressure", "MAF", "O2 B1S1"] },
};

/** Mode 02 - Freeze Frame PIDs */
const FREEZE_FRAME_PIDS: Record<string, { name: string; formula: (a: number, b?: number) => number; key: keyof FreezeFrameData }> = {
  "0202": { name: "DTC that caused FF", formula: (a, b) => (a * 256) + (b || 0), key: "dtcCode" as any },
  "0204": { name: "Engine Load", formula: (a) => (a * 100) / 255, key: "engineLoad" },
  "0205": { name: "Coolant Temp", formula: (a) => a - 40, key: "coolantTemp" },
  "0206": { name: "Short Fuel Trim B1", formula: (a) => ((a - 128) * 100) / 128, key: "shortFuelTrim" },
  "0207": { name: "Long Fuel Trim B1", formula: (a) => ((a - 128) * 100) / 128, key: "longFuelTrim" },
  "020A": { name: "Fuel Pressure", formula: (a) => a * 3, key: "fuelPressure" },
  "020C": { name: "RPM", formula: (a, b) => ((a * 256) + (b || 0)) / 4, key: "rpm" },
  "020D": { name: "Speed", formula: (a) => a, key: "speed" },
  "020E": { name: "Timing Advance", formula: (a) => (a / 2) - 64, key: "timingAdvance" },
  "020F": { name: "Intake Temp", formula: (a) => a - 40, key: "intakeTemp" },
  "0210": { name: "MAF Rate", formula: (a, b) => ((a * 256) + (b || 0)) / 100, key: "mafRate" },
  "0211": { name: "Throttle Position", formula: (a) => (a * 100) / 255, key: "throttlePos" },
};

/** Mode 06 Test Definitions */
const MODE6_TESTS: Record<string, { name: string; component: string; unit: string }> = {
  "01": { name: "O2 Sensor Rich→Lean Response", component: "O2 Sensor B1S1", unit: "ms" },
  "02": { name: "O2 Sensor Lean→Rich Response", component: "O2 Sensor B1S1", unit: "ms" },
  "03": { name: "O2 Sensor Rich→Lean Response", component: "O2 Sensor B1S2", unit: "ms" },
  "04": { name: "O2 Sensor Lean→Rich Response", component: "O2 Sensor B1S2", unit: "ms" },
  "05": { name: "Catalyst Monitor B1", component: "Catalyst B1", unit: "ratio" },
  "06": { name: "Catalyst Monitor B2", component: "Catalyst B2", unit: "ratio" },
  "07": { name: "EGR Flow Test", component: "EGR System", unit: "g/s" },
  "08": { name: "EVAP System Leak Test", component: "EVAP System", unit: "Pa" },
  "09": { name: "Misfire Cylinder 1", component: "Cylinder 1", unit: "count" },
  "0A": { name: "Misfire Cylinder 2", component: "Cylinder 2", unit: "count" },
  "0B": { name: "Misfire Cylinder 3", component: "Cylinder 3", unit: "count" },
  "0C": { name: "Misfire Cylinder 4", component: "Cylinder 4", unit: "count" },
  "0D": { name: "Misfire Cylinder 5", component: "Cylinder 5", unit: "count" },
  "0E": { name: "Misfire Cylinder 6", component: "Cylinder 6", unit: "count" },
  "21": { name: "Purge Flow Monitor", component: "EVAP Purge", unit: "%" },
  "31": { name: "A/C Refrigerant Monitor", component: "A/C System", unit: "kPa" },
  "41": { name: "Heated Catalyst B1", component: "Heated Catalyst B1", unit: "°C" },
};

/** OBD Standards (PID 011C) */
const OBD_STANDARDS: Record<number, string> = {
  1: "OBD-II (CARB)", 2: "OBD (EPA)", 3: "OBD + OBD-II", 4: "OBD-I",
  5: "Not OBD compliant", 6: "EOBD (Europe)", 7: "EOBD + OBD-II",
  8: "EOBD + OBD", 9: "EOBD + OBD + OBD-II", 10: "JOBD (Japan)",
  11: "JOBD + OBD-II", 12: "JOBD + EOBD", 13: "JOBD + EOBD + OBD-II",
  17: "EMD (Engine Manufacturer Diagnostics)", 18: "EMD+", 19: "HD OBD-C",
  20: "HD OBD", 21: "WWH OBD", 22: "HD EOBD-I", 23: "HD EOBD-I N",
  24: "HD EOBD-II", 25: "HD EOBD-II N",
};

/** Fuel Types (PID 0151) */
const FUEL_TYPES: Record<number, string> = {
  0: "غير محدد", 1: "بنزين", 2: "ميثانول", 3: "إيثانول", 4: "ديزل",
  5: "LPG", 6: "CNG", 7: "بروبان", 8: "كهربائي", 9: "بنزين + كهربائي (هايبرد)",
  10: "ديزل + كهربائي (هايبرد)", 13: "بنزين مباشر", 14: "ديزل مباشر",
};

// ═══════════════════════════════════════════════════════
// REFERENCE VALUES DATABASE
// ═══════════════════════════════════════════════════════

const DEFAULT_REFERENCE: ReferenceValues = {
  make: "Generic", model: "All", year: 2020,
  rpm: { idle: [600, 900], max: 7000 },
  coolantTemp: { normal: [80, 105], warning: 110, critical: 120 },
  voltage: { normal: [13.5, 14.7], low: 12.0, high: 15.5 },
  fuelPressure: { normal: [250, 450] },
  mafRate: { idle: [2, 7] },
  shortFuelTrim: { normal: [-10, 10] },
  longFuelTrim: { normal: [-10, 10] },
  oilTemp: { normal: [90, 120], warning: 130 },
};

const VEHICLE_REFERENCES: Record<string, Partial<ReferenceValues>> = {
  toyota: { rpm: { idle: [650, 850], max: 6500 }, coolantTemp: { normal: [82, 100], warning: 108, critical: 118 }, voltage: { normal: [13.8, 14.5], low: 12.2, high: 15.0 }, oilTemp: { normal: [90, 115], warning: 125 } },
  hyundai: { rpm: { idle: [700, 900], max: 6500 }, coolantTemp: { normal: [80, 100], warning: 110, critical: 120 }, voltage: { normal: [13.5, 14.5], low: 12.0, high: 15.2 } },
  nissan: { rpm: { idle: [650, 850], max: 6800 }, coolantTemp: { normal: [82, 102], warning: 110, critical: 120 }, voltage: { normal: [13.6, 14.6], low: 12.0, high: 15.3 } },
  ford: { rpm: { idle: [600, 800], max: 6500 }, coolantTemp: { normal: [85, 105], warning: 112, critical: 122 }, voltage: { normal: [13.5, 14.8], low: 11.8, high: 15.5 } },
  chevrolet: { rpm: { idle: [550, 800], max: 6000 }, coolantTemp: { normal: [85, 110], warning: 115, critical: 125 }, voltage: { normal: [13.5, 14.8], low: 11.8, high: 15.5 }, oilTemp: { normal: [90, 120], warning: 130 } },
  bmw: { rpm: { idle: [700, 900], max: 7000 }, coolantTemp: { normal: [85, 105], warning: 115, critical: 125 }, voltage: { normal: [13.8, 14.8], low: 12.5, high: 15.5 } },
  mercedes: { rpm: { idle: [650, 850], max: 6500 }, coolantTemp: { normal: [85, 105], warning: 112, critical: 122 }, voltage: { normal: [13.8, 14.8], low: 12.5, high: 15.5 } },
  gmc: { rpm: { idle: [550, 800], max: 6000 }, coolantTemp: { normal: [85, 110], warning: 115, critical: 125 }, voltage: { normal: [13.5, 14.8], low: 11.8, high: 15.5 }, oilTemp: { normal: [90, 120], warning: 130 } },
  kia: { rpm: { idle: [700, 900], max: 6500 }, coolantTemp: { normal: [80, 100], warning: 110, critical: 120 } },
  honda: { rpm: { idle: [650, 850], max: 7000 }, coolantTemp: { normal: [80, 100], warning: 108, critical: 118 } },
  mazda: { rpm: { idle: [650, 850], max: 6500 }, coolantTemp: { normal: [82, 102], warning: 110, critical: 120 } },
  mitsubishi: { rpm: { idle: [650, 850], max: 6500 }, coolantTemp: { normal: [82, 102], warning: 110, critical: 120 } },
  lexus: { rpm: { idle: [600, 800], max: 6500 }, coolantTemp: { normal: [82, 100], warning: 108, critical: 118 } },
  audi: { rpm: { idle: [700, 900], max: 7000 }, coolantTemp: { normal: [85, 105], warning: 115, critical: 125 } },
  volkswagen: { rpm: { idle: [700, 900], max: 6500 }, coolantTemp: { normal: [85, 105], warning: 112, critical: 122 } },
};

// ═══════════════════════════════════════════════════════
// ELM327 PROTOCOL SETTINGS
// ═══════════════════════════════════════════════════════

interface ProtocolConfig {
  code: string;
  name: string;
  nameAr: string;
  baudRate: number;
  canBits: number;
  timeout: number;
}

const PROTOCOLS: Record<string, ProtocolConfig> = {
  auto: { code: "0", name: "Auto Detect", nameAr: "اكتشاف تلقائي", baudRate: 0, canBits: 0, timeout: 5000 },
  j1850_pwm: { code: "1", name: "SAE J1850 PWM", nameAr: "J1850 PWM (فورد)", baudRate: 41600, canBits: 0, timeout: 3000 },
  j1850_vpw: { code: "2", name: "SAE J1850 VPW", nameAr: "J1850 VPW (جنرال موتورز)", baudRate: 10400, canBits: 0, timeout: 3000 },
  iso9141: { code: "3", name: "ISO 9141-2", nameAr: "ISO 9141 (أوروبي/آسيوي)", baudRate: 10400, canBits: 0, timeout: 5000 },
  kwp_5baud: { code: "4", name: "ISO 14230-4 KWP 5baud", nameAr: "KWP2000 بطيء", baudRate: 10400, canBits: 0, timeout: 5000 },
  kwp_fast: { code: "5", name: "ISO 14230-4 KWP Fast", nameAr: "KWP2000 سريع", baudRate: 10400, canBits: 0, timeout: 3000 },
  can_11_500: { code: "6", name: "ISO 15765-4 CAN 11/500", nameAr: "CAN 11bit/500kbaud", baudRate: 500000, canBits: 11, timeout: 2000 },
  can_29_500: { code: "7", name: "ISO 15765-4 CAN 29/500", nameAr: "CAN 29bit/500kbaud", baudRate: 500000, canBits: 29, timeout: 2000 },
  can_11_250: { code: "8", name: "ISO 15765-4 CAN 11/250", nameAr: "CAN 11bit/250kbaud", baudRate: 250000, canBits: 11, timeout: 2000 },
  can_29_250: { code: "9", name: "ISO 15765-4 CAN 29/250", nameAr: "CAN 29bit/250kbaud", baudRate: 250000, canBits: 29, timeout: 2000 },
  j1939: { code: "A", name: "SAE J1939 CAN 29/250", nameAr: "J1939 (شاحنات)", baudRate: 250000, canBits: 29, timeout: 3000 },
  user_can_11: { code: "B", name: "User CAN 11/125", nameAr: "CAN مخصص 11bit", baudRate: 125000, canBits: 11, timeout: 3000 },
  user_can_29: { code: "C", name: "User CAN 29/125", nameAr: "CAN مخصص 29bit", baudRate: 125000, canBits: 29, timeout: 3000 },
};

// ═══════════════════════════════════════════════════════
// MAIN OBD BLE SERVICE CLASS
// ═══════════════════════════════════════════════════════

export class OBDBleService {
  // BLE Connection
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private txCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private rxCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

  // Communication
  private responseBuffer: string = "";
  private responseResolve: ((value: string) => void) | null = null;
  private responseTimeout: NodeJS.Timeout | null = null;
  private commandQueue: Array<{ cmd: string; resolve: (v: string) => void; reject: (e: Error) => void; timeout: number }> = [];
  private isProcessingQueue: boolean = false;

  // Mutex/Lock - منع إرسال أوامر متوازية
  private _commandMutex: Promise<void> = Promise.resolve();
  private _mutexRelease: (() => void) | null = null;
  private _commandInProgress: boolean = false;

  // Error Handler موحد
  private _errorHistory: Array<{ timestamp: number; context: string; error: string; command?: string }> = [];
  private _onError: ((error: OBDError) => void) | null = null;

  // State
  private _status: ConnectionStatus = "disconnected";
  private _referenceValues: ReferenceValues = DEFAULT_REFERENCE;
  private _alerts: OBDAlert[] = [];
  private _scanHistory: ScanReport[] = [];
  private _detectedProtocol: string = "";
  private _supportedPIDs: Set<string> = new Set();
  private _adaptiveTiming: boolean = true;
  private _lastCommandTime: number = 0;
  private _commandDelay: number = 50; // ms between commands
  private _multiECU: boolean = false;
  private _ecuHeaders: string[] = [];
  private _readCycle: number = 0; // Cycle counter for rotating PIDs on slow protocols

  // Callbacks
  private _onLog: LogCallback | null = null;
  private _onStatusChange: ((status: ConnectionStatus) => void) | null = null;
  private _onDisconnect: (() => void) | null = null;
  private _onAlert: AlertCallback | null = null;

  // ═══ Getters ═══
  get status(): ConnectionStatus { return this._status; }
  get isConnected(): boolean { return this._status === "connected"; }
  get deviceName(): string { return this.device?.name || "Unknown Device"; }
  get alerts(): OBDAlert[] { return this._alerts; }
  get scanHistory(): ScanReport[] { return this._scanHistory; }
  get detectedProtocol(): string { return this._detectedProtocol; }
  get supportedPIDs(): Set<string> { return this._supportedPIDs; }

  // ═══ Getters (Error) ═══
  get errorHistory(): Array<{ timestamp: number; context: string; error: string; command?: string }> { return this._errorHistory; }
  get isCommandInProgress(): boolean { return this._commandInProgress; }

  // ═══ Setters ═══
  set onLog(cb: LogCallback | null) { this._onLog = cb; }
  set onStatusChange(cb: ((status: ConnectionStatus) => void) | null) { this._onStatusChange = cb; }
  set onDisconnect(cb: (() => void) | null) { this._onDisconnect = cb; }
  set onAlert(cb: AlertCallback | null) { this._onAlert = cb; }
  set onError(cb: ((error: OBDError) => void) | null) { this._onError = cb; }

  // ═══ Internal Helpers ═══
  private log(message: string, type: LogType) { this._onLog?.(message, type); }
  private setStatus(status: ConnectionStatus) { this._status = status; this._onStatusChange?.(status); }

  // ═══ Mutex/Lock — منع إرسال أوامر متوازية ═══
  private async acquireMutex(): Promise<void> {
    let release: () => void;
    const prev = this._commandMutex;
    this._commandMutex = new Promise<void>((resolve) => { release = resolve; });
    this._mutexRelease = release!;
    await prev;
    this._commandInProgress = true;
  }

  private releaseMutex(): void {
    this._commandInProgress = false;
    if (this._mutexRelease) {
      this._mutexRelease();
      this._mutexRelease = null;
    }
  }

  // ═══ Error Handler موحد ═══
  private handleError(context: OBDErrorContext, message: string, options?: { command?: string; rawResponse?: string; severity?: OBDErrorSeverity; retryable?: boolean }): void {
    const error: OBDError = {
      timestamp: Date.now(),
      context,
      message,
      command: options?.command,
      rawResponse: options?.rawResponse,
      severity: options?.severity || "medium",
      retryable: options?.retryable ?? true,
    };
    this._errorHistory.push({ timestamp: error.timestamp, context, error: message, command: options?.command });
    // احتفظ بآخر 50 خطأ فقط
    if (this._errorHistory.length > 50) this._errorHistory.shift();
    this.log(`✗ [${context}] ${message}${options?.command ? ` (cmd: ${options.command})` : ""}`, "error");
    this._onError?.(error);
  }

  /** مسح سجل الأخطاء */
  clearErrorHistory(): void { this._errorHistory = []; }

  // ═══════════════════════════════════════════════════════
  // REFERENCE VALUES MANAGEMENT
  // ═══════════════════════════════════════════════════════

  setVehicleReference(make: string, model?: string, year?: number): void {
    const makeKey = make.toLowerCase();
    const vehicleRef = VEHICLE_REFERENCES[makeKey];
    if (vehicleRef) {
      this._referenceValues = { ...DEFAULT_REFERENCE, ...vehicleRef, make, model: model || "All", year: year || 2020 };
      this.log(`✓ تم تحميل القيم المرجعية لـ ${make} ${model || ""}`, "info");
    } else {
      this._referenceValues = { ...DEFAULT_REFERENCE, make, model: model || "All", year: year || 2020 };
      this.log(`⚠ استخدام القيم المرجعية العامة لـ ${make}`, "info");
    }
  }

  getReferenceValues(): ReferenceValues { return this._referenceValues; }

  // ═══════════════════════════════════════════════════════
  // WEB BLUETOOTH SUPPORT CHECK
  // ═══════════════════════════════════════════════════════

  static isSupported(): boolean {
    return typeof navigator !== "undefined" && !!(navigator as any).bluetooth;
  }

  // ═══════════════════════════════════════════════════════
  // CONNECTION MANAGEMENT
  // ═══════════════════════════════════════════════════════

  async connect(): Promise<boolean> {
    if (!OBDBleService.isSupported()) {
      this.log("✗ Web Bluetooth غير مدعوم. استخدم Chrome/Edge على الكمبيوتر أو Android.", "error");
      this.setStatus("error");
      return false;
    }

    try {
      this.setStatus("connecting");
      this.log("🔍 جاري البحث عن أجهزة OBD2 BLE...", "info");

      // Try with name filters first, then fall back to acceptAllDevices
      // Some cheap ELM327 clones have non-standard names that don't match filters
      try {
        this.device = await (navigator as any).bluetooth.requestDevice({
          filters: [
            { namePrefix: "OBD" }, { namePrefix: "ELM" }, { namePrefix: "OBDII" },
            { namePrefix: "Vgate" }, { namePrefix: "Veepeak" }, { namePrefix: "iCar" },
            { namePrefix: "V-LINK" }, { namePrefix: "IOS-Vlink" }, { namePrefix: "BLE-LINK" },
            { namePrefix: "KONNWEI" }, { namePrefix: "Carista" }, { namePrefix: "UniCarScan" },
            { namePrefix: "OBDLink" }, { namePrefix: "LELink" }, { namePrefix: "BAFX" },
            { namePrefix: "Bluetooth" }, { namePrefix: "BT" }, { namePrefix: "HC" },
            { namePrefix: "SPP" }, { namePrefix: "Adapter" }, { namePrefix: "Car" },
            { namePrefix: "Auto" }, { namePrefix: "Scan" }, { namePrefix: "Diag" },
            { namePrefix: "Link" }, { namePrefix: "WiFi_OBD" }, { namePrefix: "WFi" },
            { namePrefix: "Android-Vlink" }, { namePrefix: "VEEPEAK" }, { namePrefix: "veepeak" },
            { services: [KNOWN_SERVICES[0]] }, // FFF0 service filter
            { services: [KNOWN_SERVICES[2]] }, // FFE0 service filter
          ],
          optionalServices: KNOWN_SERVICES,
        });
      } catch (filterError: any) {
        // If filtered scan fails (device not found), try acceptAllDevices
        // This allows users to manually select their OBD device from full list
        if (filterError.name === "NotFoundError") {
          this.log("⚠ لم يتم العثور على جهاز OBD معروف. جاري عرض جميع الأجهزة...", "info");
          this.device = await (navigator as any).bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: KNOWN_SERVICES,
          });
        } else {
          throw filterError;
        }
      }

      if (!this.device) {
        this.log("✗ لم يتم اختيار جهاز", "error");
        this.setStatus("disconnected");
        return false;
      }

      this.log(`✓ تم اختيار: ${this.device.name || "Unknown"}`, "info");
      this.device.addEventListener("gattserverdisconnected", () => this.handleDisconnect());

      // Connect GATT with retry logic
      // Some devices (especially on J1850 VPW cars) need multiple GATT connection attempts
      this.log("⟳ جاري الاتصال بـ GATT Server...", "info");
      let gattRetries = 3;
      while (gattRetries > 0) {
        try {
          // Add timeout wrapper for GATT connection
          this.server = await Promise.race([
            this.device.gatt!.connect(),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error("GATT connection timeout")), 15000)
            )
          ]);
          break; // Success
        } catch (gattError: any) {
          gattRetries--;
          if (gattRetries > 0) {
            this.log(`↻ إعادة محاولة GATT (${3 - gattRetries}/3)...`, "info");
            await new Promise(r => setTimeout(r, 2000)); // Wait before retry
          } else {
            throw gattError;
          }
        }
      }
      this.log("✓ GATT Server متصل", "received");

      // Discover characteristics
      await this.discoverCharacteristics();
      if (!this.txCharacteristic || !this.rxCharacteristic) {
        this.log("✗ لم يتم العثور على خصائص TX/RX المطلوبة", "error");
        this.setStatus("error");
        return false;
      }

      // Start notifications
      await this.rxCharacteristic.startNotifications();
      this.rxCharacteristic.addEventListener("characteristicvaluechanged", (event: any) => this.handleNotification(event));
      this.log("✓ تم تفعيل إشعارات RX", "received");

      // Initialize ELM327
      this.setStatus("initializing");
      const initialized = await this.initializeELM327();

      if (initialized) {
        this.setStatus("connected");
        this.log("═══ ✓ جاهز للفحص - اتصال فعلي ═══", "info");
        return true;
      } else {
        this.setStatus("error");
        return false;
      }

    } catch (error: any) {
      if (error.name === "NotFoundError") {
        this.log("تم إلغاء اختيار الجهاز", "info");
        this.setStatus("disconnected");
      } else {
        this.handleError("connection", error.message, { severity: "high", retryable: true });
        this.setStatus("error");
      }
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════
  // BLE CHARACTERISTIC DISCOVERY
  // ═══════════════════════════════════════════════════════

  private async discoverCharacteristics(): Promise<void> {
    if (!this.server) return;

    // Try known service/characteristic pairs first
    for (let i = 0; i < KNOWN_SERVICES.length; i++) {
      try {
        const service = await this.server.getPrimaryService(KNOWN_SERVICES[i]);
        this.log(`✓ خدمة: ${KNOWN_SERVICES[i].substring(4, 8).toUpperCase()}`, "received");

        // Try matching TX characteristic
        try {
          this.txCharacteristic = await service.getCharacteristic(KNOWN_TX_CHARACTERISTICS[i]);
        } catch {
          for (const uuid of KNOWN_TX_CHARACTERISTICS) {
            try { this.txCharacteristic = await service.getCharacteristic(uuid); break; } catch { /* next */ }
          }
        }

        // Try matching RX characteristic
        try {
          this.rxCharacteristic = await service.getCharacteristic(KNOWN_RX_CHARACTERISTICS[i]);
        } catch {
          for (const uuid of KNOWN_RX_CHARACTERISTICS) {
            try { this.rxCharacteristic = await service.getCharacteristic(uuid); break; } catch { /* next */ }
          }
        }

        // Some devices use same characteristic for TX/RX
        if (this.txCharacteristic && !this.rxCharacteristic) {
          this.rxCharacteristic = this.txCharacteristic;
        }

        if (this.txCharacteristic && this.rxCharacteristic) {
          this.log("✓ TX/RX Characteristics found", "received");
          return;
        }
      } catch { /* try next service */ }
    }

    // Fallback: scan all services accessible via optionalServices and log what we
    // actually find, so a device that still fails here can be diagnosed from the
    // on-screen log instead of guessing - Web Bluetooth only exposes services that
    // were declared in requestDevice()'s filters/optionalServices, so if this device's
    // real service UUID isn't in KNOWN_SERVICES, it won't show up here either.
    try {
      const services = await this.server.getPrimaryServices();
      this.log(`ℹ خدمات متاحة: ${services.length}`, "info");
      for (const service of services) {
        const chars = await service.getCharacteristics();
        this.log(`ℹ خدمة ${service.uuid} - ${chars.length} خاصية`, "info");
        for (const char of chars) {
          const props = Object.entries(char.properties)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(",");
          this.log(`  • ${char.uuid} (${props})`, "info");
          if (char.properties.write || char.properties.writeWithoutResponse) {
            if (!this.txCharacteristic) this.txCharacteristic = char;
          }
          if (char.properties.notify) {
            if (!this.rxCharacteristic) this.rxCharacteristic = char;
          }
        }
        if (this.txCharacteristic && this.rxCharacteristic) return;
      }
      if (services.length === 0) {
        this.log("✗ لا توجد خدمات متاحة - قد يستخدم الجهاز UUID غير مدعوم", "error");
      }
    } catch (e: any) {
      this.log(`✗ خطأ اكتشاف: ${e.message}`, "error");
    }
  }

  // ═══════════════════════════════════════════════════════
  // BLE NOTIFICATION HANDLER
  // ═══════════════════════════════════════════════════════

  private handleNotification(event: any) {
    const value = event.target.value;
    const decoder = new TextDecoder();
    const text = decoder.decode(value);
    this.responseBuffer += text;

    // ELM327 prompt character ">" indicates end of response
    if (this.responseBuffer.includes(">")) {
      const response = this.responseBuffer.replace(/>/g, "").trim();
      this.responseBuffer = "";
      if (this.responseResolve) {
        if (this.responseTimeout) clearTimeout(this.responseTimeout);
        this.responseResolve(response);
        this.responseResolve = null;
      }
    }
  }

  // ═══════════════════════════════════════════════════════
  // COMMAND SENDING WITH QUEUE
  // ═══════════════════════════════════════════════════════

  private async sendCommand(command: string, timeout: number = 3000): Promise<string> {
    if (!this.txCharacteristic) {
      this.handleError("connection", "غير متصل - لا يمكن إرسال أمر", { command, severity: "high", retryable: false });
      throw new Error("Not connected");
    }

    // ═══ Mutex Lock: انتظر حتى ينتهي الأمر السابق ═══
    await this.acquireMutex();

    try {
      // Enforce minimum delay between commands
      const now = Date.now();
      const elapsed = now - this._lastCommandTime;
      if (elapsed < this._commandDelay) {
        await new Promise(r => setTimeout(r, this._commandDelay - elapsed));
      }

      this.responseBuffer = "";
      const encoder = new TextEncoder();
      const cmdStr = command + "\r";

      // Split into chunks of 20 bytes (BLE MTU limit for most devices)
      const chunks: Uint8Array[] = [];
      const fullData = encoder.encode(cmdStr);
      for (let i = 0; i < fullData.length; i += 20) {
        chunks.push(fullData.slice(i, i + 20));
      }

      this.log(`>> ${command}`, "sent");

      try {
        for (const chunk of chunks) {
          if (this.txCharacteristic!.properties.writeWithoutResponse) {
            await this.txCharacteristic!.writeValueWithoutResponse(chunk.buffer as ArrayBuffer);
          } else {
            await this.txCharacteristic!.writeValue(chunk.buffer as ArrayBuffer);
          }
          if (chunks.length > 1) await new Promise(r => setTimeout(r, 10));
        }
      } catch (e: any) {
        this.handleError("ble", `فشل إرسال البيانات: ${e.message}`, { command, severity: "high", retryable: true });
        throw e;
      }

      this._lastCommandTime = Date.now();

      return await new Promise<string>((resolve, reject) => {
        this.responseResolve = (response) => {
          this.log(`<< ${response.substring(0, 80)}${response.length > 80 ? "..." : ""}`, "received");
          resolve(response);
        };
        this.responseTimeout = setTimeout(() => {
          this.responseResolve = null;
          const partial = this.responseBuffer.trim();
          this.responseBuffer = "";
          if (partial) {
            this.log(`<< ${partial} (timeout partial)`, "received");
            resolve(partial);
          } else {
            this.handleError("timeout", `انتهى الوقت بدون رد`, { command, severity: "medium", retryable: true });
            reject(new Error(`Timeout: ${command}`));
          }
        }, timeout);
      });
    } finally {
      // ═══ Mutex Release: افتح القفل للأمر التالي ═══
      this.releaseMutex();
    }
  }

  // ═══════════════════════════════════════════════════════
  // ELM327 INITIALIZATION
  // ═══════════════════════════════════════════════════════

  private async initializeELM327(): Promise<boolean> {
    try {
      // Reset
      this.log("⏳ ATZ - Reset adapter...", "info");
      const resetResp = await this.sendCommand("ATZ", 5000);
      if (!resetResp.includes("ELM") && !resetResp.includes("OK") && !resetResp.includes("STN")) {
        this.log("⚠ لم يتم التعرف على ELM327/STN - محاولة المتابعة", "error");
      }

      // Basic configuration
      await this.sendCommand("ATE0", 2000);  // Echo off
      await this.sendCommand("ATL0", 2000);  // Linefeeds off
      await this.sendCommand("ATS0", 2000);  // Spaces off (faster)
      await this.sendCommand("ATH0", 2000);  // Headers off
      await this.sendCommand("ATAT1", 2000); // Adaptive timing auto1

      // Set protocol to auto-detect
      await this.sendCommand("ATSP0", 3000);

      // Enable adaptive timing for faster responses
      if (this._adaptiveTiming) {
        await this.sendCommand("ATAT2", 2000); // Aggressive adaptive timing
      }

      // Set longer timeout for slower protocols (J1850 PWM/VPW, ISO 9141)
      await this.sendCommand("ATST FF", 2000); // Set timeout to max (255 * 4ms = 1020ms)
      
      // Allow bus to settle before first communication attempt
      // Critical for J1850 VPW (GM) and J1850 PWM (Ford) which need time to initialize
      await new Promise(r => setTimeout(r, 1000));

      // Test ECU communication with PID 0100 - with retry for slow protocols
      this.log("⏳ اختبار الاتصال بـ ECU...", "info");
      let pidResp = await this.sendCommand("0100", 20000);
      
      // If first attempt fails, try specific protocols
      // Priority order optimized for modern vehicles:
      // 1. CAN 11/500 (Toyota, Honda, Nissan, Hyundai, Ford 2008+, GM 2008+)
      // 2. CAN 29/500 (some trucks/heavy duty)
      // 3. CAN 11/250 (older CAN vehicles)
      // 4. CAN 29/250 (some European)
      // 5. J1850 PWM (Ford 1996-2007)
      // 6. J1850 VPW (GM 1996-2007)
      // 7. ISO 9141-2 (European/Asian pre-2006)
      // 8. KWP2000 5baud
      // 9. KWP2000 fast
      const isFailure = (resp: string) => 
        resp.includes("NO DATA") || resp.includes("UNABLE") || 
        resp.includes("ERROR") || resp.includes("BUS INIT") || 
        resp.includes("CAN ERROR") || resp.includes("?") ||
        resp.trim() === "";

      if (isFailure(pidResp)) {
        // Protocol scan order: CAN first (most modern vehicles 2006+)
        // Toyota, Honda, Nissan, Hyundai, Mazda, Subaru 2006+ = CAN 11bit/500k (ATSP6)
        // Then CAN 29bit, then legacy protocols (J1850, ISO, KWP)
        const protocolAttempts = [
          { cmd: "ATSP6", name: "CAN 11bit/500k (تويوتا/هوندا/نيسان/هيونداي 2006+)", timeout: 10000 },
          { cmd: "ATSP7", name: "CAN 29bit/500k", timeout: 10000 },
          { cmd: "ATSP8", name: "CAN 11bit/250k", timeout: 10000 },
          { cmd: "ATSP9", name: "CAN 29bit/250k", timeout: 10000 },
          { cmd: "ATSP1", name: "J1850 PWM (فورد 1996-2007)", timeout: 20000 },
          { cmd: "ATSP2", name: "J1850 VPW (GM/شيفروليه 1996-2007)", timeout: 25000 },
          { cmd: "ATSP3", name: "ISO 9141-2 (أوروبي/آسيوي قديم)", timeout: 20000 },
          { cmd: "ATSP4", name: "KWP2000 5baud", timeout: 20000 },
          { cmd: "ATSP5", name: "KWP2000 Fast", timeout: 12000 },
        ];

        let connected = false;
        for (const attempt of protocolAttempts) {
          // Reset protocol state before each attempt to prevent bus contamination
          await this.sendCommand("ATSP0", 2000);
          await new Promise(r => setTimeout(r, 300));
          
          this.log(`⏳ محاولة بروتوكول ${attempt.name}...`, "info");
          await this.sendCommand(attempt.cmd, 3000);
          
          // For slow protocols (J1850, ISO 9141, KWP), do a slow init first
          if (["ATSP1", "ATSP2", "ATSP3", "ATSP4", "ATSP5"].includes(attempt.cmd)) {
            await this.sendCommand("ATST FF", 2000); // Max timeout for slow protocols
            // J1850 VPW/PWM needs extra settling time for bus initialization
            const settleTime = ["ATSP1", "ATSP2"].includes(attempt.cmd) ? 2000 : 1000;
            await new Promise(r => setTimeout(r, settleTime)); // Wait for bus to settle
          }
          
          pidResp = await this.sendCommand("0100", attempt.timeout);
          
          // If first attempt fails on slow protocol, try once more with longer wait
          if (isFailure(pidResp) && ["ATSP1", "ATSP2", "ATSP3"].includes(attempt.cmd)) {
            this.log(`↻ إعادة محاولة ${attempt.name} بوقت أطول...`, "info");
            await new Promise(r => setTimeout(r, 2000)); // Extra settle time
            pidResp = await this.sendCommand("0100", attempt.timeout);
          }
          
          if (!isFailure(pidResp)) {
            this.log(`✓ نجح الاتصال عبر ${attempt.name}`, "received");
            connected = true;
            break;
          }
        }

        if (!connected) {
          // Last resort: try with headers ON and longer timeout
          this.log("⏳ محاولة أخيرة مع Headers ON...", "info");
          await this.sendCommand("ATH1", 2000);
          await this.sendCommand("ATSP0", 3000); // Back to auto
          await this.sendCommand("ATST FF", 2000);
          pidResp = await this.sendCommand("0100", 20000);
          
          if (isFailure(pidResp)) {
            await this.sendCommand("ATH0", 2000); // Headers off again
            this.log("✗ لم يتم الاتصال بـ ECU. تأكد أن:\n  1. المفتاح في وضع ON/RUN (بدون تشغيل المحرك)\n  2. جهاز OBD مثبت بشكل صحيح\n  3. فيوز OBD سليم", "error");
            return false;
          }
          await this.sendCommand("ATH0", 2000); // Headers off
        }
      }

      // Parse supported PIDs from 0100 response
      this.parseSupportedPIDs(pidResp, "01");

      // Get detected protocol
      const dpResp = await this.sendCommand("ATDPN");
      this._detectedProtocol = dpResp.replace(/[^A-Za-z0-9 /]/g, "").trim();
      this.log(`✓ البروتوكول: ${this._detectedProtocol}`, "info");

      // Adjust timing based on detected protocol
      const protoNum = parseInt(this._detectedProtocol.replace(/[^0-9]/g, "")) || 0;
      if (protoNum <= 5) {
        // Slower protocols (J1850, ISO 9141, KWP2000) - use longer command delays
        this._commandDelay = 120; // 120ms between commands
        this.log("✓ بروتوكول بطيء - تم ضبط التوقيت", "info");
      } else {
        // CAN protocols - faster
        this._commandDelay = 50;
      }

      // Get protocol description
      const dpDesc = await this.sendCommand("ATDP");
      this.log(`  ${dpDesc}`, "info");

      // Check for additional supported PIDs (0120, 0140)
      if (this._supportedPIDs.has("0120")) {
        const resp20 = await this.sendCommand("0120", 5000);
        this.parseSupportedPIDs(resp20, "01", 0x20);
      }
      if (this._supportedPIDs.has("0140")) {
        const resp40 = await this.sendCommand("0140", 5000);
        this.parseSupportedPIDs(resp40, "01", 0x40);
      }

      this.log(`✓ PIDs مدعومة: ${this._supportedPIDs.size}`, "info");

      // Check for multi-ECU
      await this.sendCommand("ATH1", 2000); // Headers on temporarily
      const multiCheck = await this.sendCommand("0100", 8000);
      const headerLines = multiCheck.split(/[\r\n]+/).filter(l => l.trim().length > 6);
      if (headerLines.length > 1) {
        this._multiECU = true;
        this._ecuHeaders = headerLines.map(l => l.substring(0, 3));
        this.log(`✓ Multi-ECU detected: ${this._ecuHeaders.length} ECUs`, "info");
      }
      await this.sendCommand("ATH0", 2000); // Headers off again

      return true;
    } catch (error: any) {
      this.handleError("protocol", `فشل تهيئة ELM327: ${error.message}`, { severity: "high", retryable: true });
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════
  // SUPPORTED PIDs PARSING
  // ═══════════════════════════════════════════════════════

  private parseSupportedPIDs(response: string, mode: string, offset: number = 0): void {
    const cleaned = response.replace(/[\s\r\n]/g, "");
    const modeResp = (parseInt(mode, 16) + 0x40).toString(16).toUpperCase().padStart(2, "0");

    const idx = cleaned.toUpperCase().indexOf(modeResp);
    if (idx === -1) return;

    // Skip mode response byte + PID byte (e.g., "4100" or "4120")
    const dataStart = idx + 4;
    const hexData = cleaned.substring(dataStart, dataStart + 8);
    if (hexData.length < 8) return;

    const bits = parseInt(hexData, 16);
    for (let i = 0; i < 32; i++) {
      if ((bits >> (31 - i)) & 1) {
        const pidNum = offset + i + 1;
        const pidHex = mode + pidNum.toString(16).toUpperCase().padStart(2, "0");
        this._supportedPIDs.add(pidHex);
      }
    }
  }

  // ═══════════════════════════════════════════════════════
  // PID READING
  // ═══════════════════════════════════════════════════════

  async readPID(pid: string): Promise<number | null> {
    if (!this.isConnected) return null;

    // Determine timeout based on protocol speed
    const protoNum = parseInt((this._detectedProtocol || "").replace(/[^0-9]/g, "")) || 6;
    const timeout = protoNum <= 5 ? 5000 : 3000; // Longer timeout for slow protocols

    try {
      const response = await this.sendCommand(pid, timeout);
      const result = this.parsePIDResponse(pid, response);
      
      // Retry once if null on slow protocols (J1850 PWM can be flaky)
      if (result === null && protoNum <= 5) {
        await new Promise(r => setTimeout(r, 100));
        const retryResp = await this.sendCommand(pid, timeout);
        return this.parsePIDResponse(pid, retryResp);
      }
      
      return result;
    } catch {
      // Retry once on timeout
      try {
        await new Promise(r => setTimeout(r, 150));
        const retryResp = await this.sendCommand(pid, timeout + 2000);
        return this.parsePIDResponse(pid, retryResp);
      } catch {
        return null;
      }
    }
  }

  private parsePIDResponse(pid: string, response: string): number | null {
    // Remove spaces, newlines, and common J1850 header artifacts
    let cleaned = response.replace(/[\s\r\n]/g, "");

    if (cleaned.includes("NODATA") || cleaned.includes("ERROR") || cleaned.includes("UNABLE") || cleaned.includes("STOPPED")) {
      return null;
    }

    // Remove J1850 PWM/VPW headers (3 bytes = 6 hex chars before mode response)
    // J1850 format: [priority][target][source][mode+0x40][pid][data...]
    // Also handle multi-line responses (take last valid line)
    const lines = response.split(/[\r\n]+/).filter(l => l.trim().length > 0 && !l.includes(">"));
    if (lines.length > 0) {
      // Use the last line that contains hex data (skip "SEARCHING..." etc)
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].replace(/[\s]/g, "");
        if (/^[0-9A-Fa-f]+$/.test(line) && line.length >= 4) {
          cleaned = line;
          break;
        }
      }
    }

    const mode = pid.substring(0, 2);
    const pidCode = pid.substring(2);
    const modeResponse = (parseInt(mode, 16) + 0x40).toString(16).toUpperCase().padStart(2, "0") + pidCode.toUpperCase();

    let idx = cleaned.toUpperCase().indexOf(modeResponse);
    
    // If not found directly, try skipping J1850 header bytes (6 hex chars)
    if (idx === -1 && cleaned.length > 6) {
      const afterHeader = cleaned.substring(6);
      const headerIdx = afterHeader.toUpperCase().indexOf(modeResponse);
      if (headerIdx !== -1) {
        idx = headerIdx + 6;
      }
    }
    
    // Still not found? Try looking for just the mode response byte
    if (idx === -1) {
      const modeRespByte = (parseInt(mode, 16) + 0x40).toString(16).toUpperCase().padStart(2, "0");
      const modeIdx = cleaned.toUpperCase().indexOf(modeRespByte);
      if (modeIdx !== -1) {
        // Verify next bytes match PID code
        const afterMode = cleaned.substring(modeIdx + 2, modeIdx + 4).toUpperCase();
        if (afterMode === pidCode.toUpperCase()) {
          idx = modeIdx;
        }
      }
    }
    
    if (idx === -1) return null;

    const dataStart = idx + modeResponse.length;
    const a = parseInt(cleaned.substring(dataStart, dataStart + 2), 16);
    if (isNaN(a)) return null;

    const b = parseInt(cleaned.substring(dataStart + 2, dataStart + 4), 16);
    const c = parseInt(cleaned.substring(dataStart + 4, dataStart + 6), 16);
    const d = parseInt(cleaned.substring(dataStart + 6, dataStart + 8), 16);

    const pidDef = OBD_PIDS[pid];
    if (!pidDef) return a;

    return pidDef.formula(a, isNaN(b) ? undefined : b, isNaN(c) ? undefined : c, isNaN(d) ? undefined : d);
  }

  // ═══════════════════════════════════════════════════════
  // LIVE DATA READING
  // ═══════════════════════════════════════════════════════

  async readLiveData(): Promise<Partial<OBDLiveData>> {
    const data: Partial<OBDLiveData> = {};

    // Determine if we're on a slow protocol (J1850 PWM/VPW, ISO 9141)
    const protoNum = parseInt((this._detectedProtocol || "").replace(/[^0-9]/g, "")) || 6;
    const isSlowProtocol = protoNum <= 5;
    const isCAN = protoNum >= 6;

    // Core PIDs (always read every cycle)
    const corePIDs: Array<{ pid: string; key: keyof OBDLiveData }> = [
      { pid: "010C", key: "rpm" },
      { pid: "010D", key: "speed" },
      { pid: "0105", key: "coolantTemp" },
      { pid: "0104", key: "engineLoad" },
      { pid: "0111", key: "throttlePos" },
    ];

    // Extended PIDs - prioritized for slow protocols
    const extPIDs: Array<{ pid: string; key: keyof OBDLiveData; priority: number }> = [
      { pid: "0106", key: "shortFuelTrim", priority: 1 },
      { pid: "0107", key: "longFuelTrim", priority: 1 },
      { pid: "010B", key: "intakeMAP", priority: 1 },
      { pid: "010F", key: "intakeTemp", priority: 1 },
      { pid: "0142", key: "voltage", priority: 1 },
      { pid: "012F", key: "fuelLevel", priority: 2 },
      { pid: "0110", key: "mafRate", priority: 2 },
      { pid: "010E", key: "timingAdvance", priority: 2 },
      { pid: "010A", key: "fuelPressure", priority: 2 },
      { pid: "0114", key: "o2SensorB1S1", priority: 2 },
      { pid: "0115", key: "o2SensorB1S2", priority: 2 },
      { pid: "0146", key: "ambientTemp", priority: 3 },
      { pid: "011F", key: "runTime", priority: 3 },
      { pid: "0121", key: "distanceWithMIL", priority: 3 },
      { pid: "0133", key: "barometricPressure", priority: 3 },
      { pid: "013C", key: "catalystTempB1S1", priority: 3 },
      { pid: "0123", key: "fuelRailPressure", priority: 3 },
      { pid: "012C", key: "commandedEGR", priority: 3 },
      { pid: "015C", key: "oilTemp", priority: 3 },
      { pid: "015E", key: "instantFuelConsumption", priority: 3 },
      { pid: "0162", key: "engineTorque", priority: 3 },
      // Advanced PIDs (priority 4 = read every 4th cycle on slow, always on CAN)
      { pid: "0170", key: "boostPressure", priority: 4 },
      { pid: "01A6", key: "transmissionTemp", priority: 4 },
      { pid: "0103", key: "fuelSystemStatus", priority: 4 },
      { pid: "014C", key: "commandedThrottle", priority: 4 },
      { pid: "0143", key: "absoluteLoad", priority: 4 },
      { pid: "0145", key: "relativeThrottle", priority: 4 },
      { pid: "0152", key: "ethanolPercent", priority: 4 },
      { pid: "0174", key: "turboRPM", priority: 4 },
      { pid: "0173", key: "exhaustPressure", priority: 4 },
      { pid: "017C", key: "dpfTemp", priority: 4 },
      { pid: "0183", key: "noxSensor", priority: 4 },
      { pid: "015D", key: "fuelInjectionTiming", priority: 4 },
      { pid: "0147", key: "absThrottleB", priority: 4 },
      { pid: "0149", key: "acceleratorPedalD", priority: 4 },
      { pid: "014A", key: "acceleratorPedalE", priority: 4 },
    ];

    // ═══ CAN Protocol: Use multi-PID requests for faster data acquisition ═══
    if (isCAN) {
      // CAN supports requesting up to 6 PIDs in a single command
      // Format: "01" + PID1 + PID2 + ... (max 6 per request)
      // Response contains all PIDs in sequence
      try {
        // Batch 1: Core PIDs (RPM + Speed + Coolant + Load + Throttle)
        const batch1Resp = await this.sendCommand("010C0D050411", 3000);
        this.parseMultiPIDResponse(batch1Resp, corePIDs, data);
      } catch {
        // Fallback to individual reads if multi-PID fails
        for (const { pid, key } of corePIDs) {
          const val = await this.readPID(pid);
          if (val !== null) (data as any)[key] = val;
        }
      }

      // Read all extended PIDs on CAN (fast enough)
      // Batch 2: Fuel trims + MAP + Intake temp + Voltage
      try {
        const batch2Resp = await this.sendCommand("0106070B0F42", 3000);
        const batch2PIDs = extPIDs.filter(p => ["0106", "0107", "010B", "010F", "0142"].includes(p.pid));
        this.parseMultiPIDResponse(batch2Resp, batch2PIDs, data);
      } catch {
        // Fallback
        for (const { pid, key } of extPIDs.filter(p => p.priority === 1)) {
          if (this._supportedPIDs.size === 0 || this._supportedPIDs.has(pid)) {
            const val = await this.readPID(pid);
            if (val !== null) (data as any)[key] = val;
          }
        }
      }

      // Remaining extended PIDs individually (some may not support multi-PID)
      for (const { pid, key, priority } of extPIDs) {
        if (priority <= 1) continue; // Already read in batch 2
        if (this._supportedPIDs.size === 0 || this._supportedPIDs.has(pid)) {
          const val = await this.readPID(pid);
          if (val !== null) (data as any)[key] = val;
        }
      }
    } else {
      // ═══ Slow Protocol: Sequential reads with priority rotation ═══
      // Read core PIDs first (RPM, Speed, Temp, Load, Throttle)
      for (const { pid, key } of corePIDs) {
        const val = await this.readPID(pid);
        if (val !== null) (data as any)[key] = val;
      }

      // For slow protocols, rotate extended PIDs across cycles
      // Cycle 0: priority 1 only (fastest refresh)
      // Cycle 1: priority 1 + 2
      // Cycle 2: priority 1 + 2 + 3
      // Cycle 3: priority 1 + 2 + 3 + 4 (full read with advanced PIDs)
      const cyclePhase = this._readCycle % 4;
      const maxPriority = cyclePhase === 0 ? 1 : cyclePhase === 1 ? 2 : cyclePhase === 2 ? 3 : 4;
      this._readCycle = (this._readCycle || 0) + 1;

      for (const { pid, key, priority } of extPIDs) {
        if (priority > maxPriority) continue;
        if (this._supportedPIDs.size === 0 || this._supportedPIDs.has(pid)) {
          const val = await this.readPID(pid);
          if (val !== null) (data as any)[key] = val;
        }
      }
    }

    // Calculate derived values
    if (data.mafRate && data.speed && data.speed > 0) {
      // L/100km = (MAF * 3600) / (speed * AFR * fuel_density)
      // AFR (stoichiometric) = 14.7, fuel density = 755 g/L
      data.instantFuelConsumption = data.instantFuelConsumption || ((data.mafRate * 3600) / (data.speed * 14.7 * 755)) * 100;
    }

    // Check alerts against reference values
    this.checkAlerts(data);

    return data;
  }

  /** Parse multi-PID CAN response (e.g., response to "010C0D050411") */
  private parseMultiPIDResponse(response: string, pids: Array<{ pid: string; key: keyof OBDLiveData }>, data: Partial<OBDLiveData>): void {
    const cleaned = response.replace(/[\s\r\n]/g, "");
    if (cleaned.includes("NODATA") || cleaned.includes("ERROR")) return;

    // Multi-PID response format: each PID response on separate line
    // Or concatenated: 41 0C xxxx 41 0D xx 41 05 xx ...
    for (const { pid, key } of pids) {
      const mode = pid.substring(0, 2);
      const pidCode = pid.substring(2);
      const modeResponse = (parseInt(mode, 16) + 0x40).toString(16).toUpperCase().padStart(2, "0") + pidCode.toUpperCase();

      const idx = cleaned.toUpperCase().indexOf(modeResponse);
      if (idx === -1) continue;

      const dataStart = idx + modeResponse.length;
      const a = parseInt(cleaned.substring(dataStart, dataStart + 2), 16);
      if (isNaN(a)) continue;
      const b = parseInt(cleaned.substring(dataStart + 2, dataStart + 4), 16);
      const c = parseInt(cleaned.substring(dataStart + 4, dataStart + 6), 16);
      const d = parseInt(cleaned.substring(dataStart + 6, dataStart + 8), 16);

      const pidDef = OBD_PIDS[pid];
      if (!pidDef) { (data as any)[key] = a; continue; }

      const value = pidDef.formula(a, isNaN(b) ? undefined : b, isNaN(c) ? undefined : c, isNaN(d) ? undefined : d);
      (data as any)[key] = value;
    }
  }

  // ═══════════════════════════════════════════════════════
  // FORD-SPECIFIC PIDs (Mode 22)
  // ═══════════════════════════════════════════════════════

  async readFordPIDs(): Promise<Record<string, { name: string; nameAr: string; value: number; unit: string }>> {
    const results: Record<string, { name: string; nameAr: string; value: number; unit: string }> = {};
    if (!this.isConnected) return results;

    this.log("═══ قراءة PIDs الخاصة بفورد (Mode 22) ═══", "info");

    // PCM PIDs - most commonly supported
    const fordPCMPids = ["221001", "221002", "221005", "221006", "221007", "221008", "221009", "22100A", "22100C", "22100E"];
    // TCM PIDs
    const fordTCMPids = ["222001", "222002", "222003", "222004", "222005"];
    // EcoBoost PIDs
    const fordEcoPids = ["224001", "224002", "224003", "224004", "224005"];

    const allFordPids = [...fordPCMPids, ...fordTCMPids, ...fordEcoPids];

    for (const pid of allFordPids) {
      try {
        const response = await this.sendCommand(pid, 2000);
        const cleaned = response.replace(/[\s\r\n]/g, "");
        if (cleaned.includes("NODATA") || cleaned.includes("ERROR")) continue;

        // Parse Mode 22 response: 62 + DID (2 bytes) + data
        const responsePrefix = "62" + pid.substring(2).toUpperCase();
        const idx = cleaned.toUpperCase().indexOf(responsePrefix);
        if (idx === -1) continue;

        const dataStart = idx + responsePrefix.length;
        const a = parseInt(cleaned.substring(dataStart, dataStart + 2), 16);
        if (isNaN(a)) continue;
        const b = parseInt(cleaned.substring(dataStart + 2, dataStart + 4), 16);

        const pidDef = FORD_PIDS[pid];
        if (!pidDef) continue;

        const value = pidDef.formula(a, isNaN(b) ? undefined : b);
        results[pid] = { name: pidDef.name, nameAr: pidDef.nameAr, value, unit: pidDef.unit };
        this.log(`  ✓ ${pidDef.nameAr}: ${value.toFixed(1)} ${pidDef.unit}`, "info");
      } catch {
        // PID not supported, skip
      }
    }

    this.log(`✓ تم قراءة ${Object.keys(results).length} PID خاص بفورد`, "info");
    return results;
  }

  /** Get Ford DTC details with related sensors */
  getFordDTCDetails(code: string): typeof FORD_DTC_DATABASE[string] | null {
    return FORD_DTC_DATABASE[code] || null;
  }

  /** Get all Ford DTC database */
  getFordDTCDatabase(): typeof FORD_DTC_DATABASE {
    return FORD_DTC_DATABASE;
  }

  /** Batch read multiple PIDs in one pass for faster data acquisition */
  async readBatchPIDs(pids: string[]): Promise<Map<string, number>> {
    const results = new Map<string, number>();
    if (!this.isConnected) return results;

    // Use parallel-like reading with shorter timeouts for speed
    for (const pid of pids) {
      try {
        const val = await this.readPID(pid);
        if (val !== null) results.set(pid, val);
      } catch {
        // Skip failed PIDs
      }
    }
    return results;
  }

  /** Fast live data reading - only core PIDs for maximum refresh rate */
  async readFastLiveData(): Promise<Partial<OBDLiveData>> {
    const data: Partial<OBDLiveData> = {};
    if (!this.isConnected) return data;

    // Only read 5 most critical PIDs for fast refresh
    const fastPIDs: Array<{ pid: string; key: keyof OBDLiveData }> = [
      { pid: "010C", key: "rpm" },
      { pid: "010D", key: "speed" },
      { pid: "0105", key: "coolantTemp" },
      { pid: "0104", key: "engineLoad" },
      { pid: "0111", key: "throttlePos" },
    ];

    for (const { pid, key } of fastPIDs) {
      const val = await this.readPID(pid);
      if (val !== null) (data as any)[key] = val;
    }

    return data;
  }

  // ═══════════════════════════════════════════════════════
  // SMART ALERTS SYSTEM
  // ═══════════════════════════════════════════════════════

  private checkAlerts(data: Partial<OBDLiveData>): void {
    const ref = this._referenceValues;

    // Coolant Temperature
    if (data.coolantTemp !== undefined) {
      if (data.coolantTemp >= ref.coolantTemp.critical) {
        this.triggerAlert("critical", "حرارة المحرك", data.coolantTemp, ref.coolantTemp.critical,
          `🔴 حرارة المحرك حرجة! ${data.coolantTemp}°C - أوقف السيارة فوراً!`);
      } else if (data.coolantTemp >= ref.coolantTemp.warning) {
        this.triggerAlert("warning", "حرارة المحرك", data.coolantTemp, ref.coolantTemp.warning,
          `🟡 حرارة المحرك مرتفعة ${data.coolantTemp}°C - راقب الوضع`);
      }
    }

    // Battery Voltage
    if (data.voltage !== undefined) {
      if (data.voltage < ref.voltage.low) {
        this.triggerAlert("critical", "جهد البطارية", data.voltage, ref.voltage.low,
          `🔴 جهد البطارية منخفض جداً ${data.voltage}V - فحص الدينمو والبطارية`);
      } else if (data.voltage > ref.voltage.high) {
        this.triggerAlert("warning", "جهد البطارية", data.voltage, ref.voltage.high,
          `🟡 جهد البطارية مرتفع ${data.voltage}V - فحص منظم الجهد`);
      }
    }

    // RPM
    if (data.rpm !== undefined) {
      if (data.rpm > ref.rpm.max) {
        this.triggerAlert("critical", "RPM", data.rpm, ref.rpm.max,
          `🔴 دورات المحرك عالية جداً! ${Math.round(data.rpm)} RPM`);
      }
    }

    // Fuel Trim
    if (data.shortFuelTrim !== undefined && Math.abs(data.shortFuelTrim) > 25) {
      this.triggerAlert("warning", "Short Fuel Trim", data.shortFuelTrim, 25,
        `🟡 Short Fuel Trim غير طبيعي ${data.shortFuelTrim.toFixed(1)}% - احتمال تسريب هواء أو مشكلة حقن`);
    }
    if (data.longFuelTrim !== undefined && Math.abs(data.longFuelTrim) > 20) {
      this.triggerAlert("warning", "Long Fuel Trim", data.longFuelTrim, 20,
        `🟡 Long Fuel Trim غير طبيعي ${data.longFuelTrim.toFixed(1)}% - فحص نظام الوقود`);
    }

    // Oil Temperature
    if (data.oilTemp !== undefined && ref.oilTemp) {
      if (data.oilTemp > ref.oilTemp.warning) {
        this.triggerAlert("warning", "حرارة الزيت", data.oilTemp, ref.oilTemp.warning,
          `🟡 حرارة الزيت مرتفعة ${data.oilTemp}°C - تحقق من مستوى الزيت`);
      }
    }

    // Engine Load sustained high
    if (data.engineLoad !== undefined && data.engineLoad > 90) {
      this.triggerAlert("warning", "حمل المحرك", data.engineLoad, 90,
        `🟡 حمل المحرك مرتفع جداً ${data.engineLoad.toFixed(0)}%`);
    }
  }

  private triggerAlert(type: "warning" | "critical", parameter: string, value: number, threshold: number, message: string): void {
    // Debounce: don't repeat same alert within 30 seconds
    const recentSame = this._alerts.find(a =>
      a.parameter === parameter && a.type === type &&
      (Date.now() - a.timestamp.getTime()) < 30000
    );
    if (recentSame) return;

    const alert: OBDAlert = { type, parameter, value, threshold, message, timestamp: new Date() };
    this._alerts.push(alert);
    this._onAlert?.(alert);
    this.log(`[ALERT] ${message}`, type === "critical" ? "error" : "info");
  }

  clearAlerts(): void { this._alerts = []; }

  // ═══════════════════════════════════════════════════════
  // DTC READING (Mode 03 - Confirmed, Mode 07 - Pending)
  // ═══════════════════════════════════════════════════════

  async readDTCs(): Promise<OBDDTCCode[]> {
    if (!this.isConnected) return [];
    try {
      this.log("⟳ جاري قراءة أكواد الأعطال (Mode 03)...", "info");
      const response = await this.sendCommand("03", 5000);
      return this.parseDTCResponse(response, "43");
    } catch (error: any) {
      this.handleError("command", `فشل قراءة DTC: ${error.message}`, { command: "03", severity: "medium", retryable: true });
      return [];
    }
  }

  async readPendingDTCs(): Promise<OBDDTCCode[]> {
    if (!this.isConnected) return [];
    try {
      this.log("⟳ جاري قراءة الأكواد المعلقة (Mode 07)...", "info");
      const response = await this.sendCommand("07", 5000);
      return this.parseDTCResponse(response, "47");
    } catch (error: any) {
      this.handleError("command", `فشل قراءة Pending DTC: ${error.message}`, { command: "07", severity: "medium", retryable: true });
      return [];
    }
  }

  private parseDTCResponse(response: string, modeResp: string): OBDDTCCode[] {
    const cleaned = response.replace(/[\s\r\n]/g, "");
    if (cleaned.includes("NODATA") || cleaned === modeResp + "00") return [];
    // "NO DATA" variants
    if (/NO\s*DATA/i.test(response)) return [];

    const dtcs: OBDDTCCode[] = [];

    // Handle multi-line responses (CAN vs non-CAN)
    const lines = response.split(/[\r\n]+/).filter(l => {
      const t = l.trim();
      return t.length > 0 && !t.includes(">") && !t.includes("SEARCHING") && !t.includes("...");
    });
    let allData = "";
    let isMultiFrame = false; // Track if we're in a CAN ISO-TP multi-frame response

    for (const line of lines) {
      const lineClean = line.replace(/\s/g, "").toUpperCase();
      
      // Skip non-hex lines
      if (!/^[0-9A-F]+$/i.test(lineClean)) continue;
      
      let dataLine = lineClean;
      
      // ── Handle CAN ISO-TP Multi-Frame responses ──
      // First Frame: 7E8 10 [length] 43 [count] [DTC data...]
      // Consecutive Frames: 7E8 21 [data...], 7E8 22 [data...], etc.
      // Format with headers ON: "7E810xx43..." (first), "7E821..." (consecutive)
      // Format with headers OFF: "10xx43..." (first), "21..." (consecutive)
      
      // CAN header present (7E8, 7E9, 7EA, etc.)
      if (/^7E[0-9A-F]/.test(dataLine)) {
        // Extract after CAN address (3 hex chars = 7E8)
        const afterHeader = dataLine.substring(3);
        
        // First Frame indicator: starts with "10" + length byte
        if (/^10[0-9A-F]{2}/.test(afterHeader)) {
          isMultiFrame = true;
          // Skip "10" + length byte (4 chars), then find modeResp
          const frameData = afterHeader.substring(4);
          if (frameData.startsWith(modeResp.toUpperCase())) {
            allData += frameData.substring(2); // Skip mode response byte
          }
          continue;
        }
        
        // Consecutive Frame indicator: starts with "2x" (21, 22, 23...)
        if (/^2[0-9A-F]/.test(afterHeader) && isMultiFrame) {
          // Skip sequence byte (2 chars), rest is data
          allData += afterHeader.substring(2);
          continue;
        }
        
        // Single Frame: contains modeResp directly
        const modeIdx = dataLine.indexOf(modeResp.toUpperCase());
        if (modeIdx >= 0) {
          dataLine = dataLine.substring(modeIdx);
        } else {
          continue;
        }
      }
      // No CAN header - check for ISO-TP frames without header (headers OFF)
      else if (/^10[0-9A-F]{2}/.test(dataLine) && dataLine.includes(modeResp.toUpperCase())) {
        // First Frame without CAN header: "100A4302..."
        isMultiFrame = true;
        const modeIdx = dataLine.indexOf(modeResp.toUpperCase());
        allData += dataLine.substring(modeIdx + 2);
        continue;
      }
      else if (/^2[0-9A-F]/.test(dataLine) && isMultiFrame) {
        // Consecutive Frame without CAN header: "21xxxx..."
        allData += dataLine.substring(2);
        continue;
      }
      
      // ── Remove J1850 PWM/VPW headers (3 bytes = 6 hex chars) ──
      // J1850 format: [priority 1B][target 1B][source 1B][data...]
      // Common headers: 486B10 (J1850 PWM), 486B28, 48 6B XX
      // The mode response (43/47) should appear AFTER the 3-byte header
      if (/^4[0-9A-F]{5}/.test(dataLine) && !dataLine.startsWith(modeResp.toUpperCase())) {
        // Check if mode response exists after potential 6-char header
        const modeIdx = dataLine.indexOf(modeResp.toUpperCase());
        if (modeIdx >= 4 && modeIdx <= 8) {
          // Header is the bytes before modeResp
          dataLine = dataLine.substring(modeIdx);
        } else if (modeIdx === -1) {
          // No mode response found - this line is likely just a header echo, skip it
          continue;
        }
      }
      
      // ── Remove ISO 9141/KWP2000 headers (3 bytes: 48 6B 10 or similar) ──
      if (/^(48|68)[0-9A-F]{4}/.test(dataLine) && !dataLine.startsWith(modeResp.toUpperCase())) {
        const modeIdx = dataLine.indexOf(modeResp.toUpperCase());
        if (modeIdx >= 0) {
          dataLine = dataLine.substring(modeIdx);
        } else {
          continue;
        }
      }
      
      // ── Extract data after mode response prefix ──
      if (dataLine.startsWith(modeResp.toUpperCase())) {
        allData += dataLine.substring(2);
      }
      // If the line is purely hex but doesn't start with modeResp,
      // only include it if we already have data (continuation frame)
      // Do NOT blindly append unknown hex data - this causes false positives
    }

    // If no data extracted from structured parsing, try simple extraction
    if (!allData) {
      const upperCleaned = cleaned.toUpperCase();
      const modeIdx = upperCleaned.indexOf(modeResp.toUpperCase());
      if (modeIdx >= 0) {
        allData = upperCleaned.substring(modeIdx + 2);
      }
    }
    
    // If still no data, response is empty/invalid
    if (!allData) return [];
    
    // Remove trailing padding (AA, 55, FF are common padding bytes in multi-frame)
    allData = allData.replace(/(AA|55|FF)+$/i, "");

    this.log(`[DTC Parse] Raw data after prefix removal: ${allData}`, "info");

    // ── Handle DTC count byte ──
    // Standard CAN format: 43 [count] [DTC1_high] [DTC1_low] [DTC2_high] [DTC2_low]...
    // J1850/ISO format: 43 [DTC1_high] [DTC1_low] [DTC2_high] [DTC2_low]...
    let startOffset = 0;
    
    // Check if first 2 chars represent a count byte
    const possibleCount = parseInt(allData.substring(0, 2), 16);
    const totalDataLen = allData.length - 2; // remaining after potential count
    
    if (possibleCount === 0) {
      // Count = 0 means no DTCs
      this.log(`[DTC Parse] Count byte = 0, no DTCs`, "info");
      return [];
    }
    
    if (allData.length % 4 !== 0 && allData.length >= 5) {
      // Odd length suggests count byte present
      if (possibleCount > 0 && possibleCount <= 10 && totalDataLen === possibleCount * 4) {
        startOffset = 2; // Skip count byte
        this.log(`[DTC Parse] Detected count byte: ${possibleCount} DTCs`, "info");
      }
    }
    
    // Also handle the case where count byte is 00 followed by padding (no DTCs)
    // e.g., "00 00 00 00 00 00" - all zeros means no DTCs
    if (allData.length >= 4) {
      const allZeros = /^(00)+$/.test(allData);
      if (allZeros) {
        this.log(`[DTC Parse] All zeros - no DTCs`, "info");
        return [];
      }
    }

    // Parse DTC pairs (each DTC = 4 hex chars = 2 bytes)
    for (let i = startOffset; i + 3 < allData.length; i += 4) {
      const rawPair = allData.substring(i, i + 4);
      const highByte = parseInt(rawPair.substring(0, 2), 16);
      const lowByte = rawPair.substring(2, 4);

      // Skip null/padding DTCs (0000)
      if (isNaN(highByte) || (highByte === 0 && lowByte === "00")) continue;

      // Decode DTC format per SAE J2012:
      // High byte: bits 7-6 = type (P/C/B/U), bits 5-4 = first digit, bits 3-0 = second digit
      // Low byte: third + fourth digits (hex string)
      const typeCode = (highByte >> 6) & 0x03;
      const types = ["P", "C", "B", "U"];
      const firstDigit = (highByte >> 4) & 0x03;
      const secondDigit = highByte & 0x0F;
      const code = `${types[typeCode]}${firstDigit}${secondDigit.toString(16).toUpperCase()}${lowByte.toUpperCase()}`;

      // Validate: must be valid DTC format and not P0000
      if (code !== "P0000" && code.length === 5 && /^[PCBU][0-3][0-9A-F]{3}$/.test(code)) {
        // Additional validation: skip codes that look like they came from header bytes
        // J1850 headers often produce C1xxx or C0xxx false positives when misinterpreted
        // If we have a count byte and we've already found that many DTCs, stop
        if (startOffset === 2 && dtcs.length >= possibleCount) break;
        
        dtcs.push({ code, raw: rawPair });
        this.log(`[DTC Parse] Found: ${code} (raw: ${rawPair})`, "info");
      }
    }

    this.log(`✓ تم قراءة ${dtcs.length} كود أعطال`, "info");
    return dtcs;
  }

  // ═══════════════════════════════════════════════════════
  // CLEAR DTCs (Mode 04)
  // ═══════════════════════════════════════════════════════

  async clearDTCs(): Promise<boolean> {
    if (!this.isConnected) return false;
    try {
      this.log("⟳ جاري مسح أكواد الأعطال (Mode 04)...", "info");
      const response = await this.sendCommand("04", 5000);
      const success = response.includes("44") || response.includes("OK");
      if (success) this.log("✓ تم مسح جميع أكواد الأعطال وإعادة ضبط الشاشات", "info");
      else this.log("✗ فشل مسح الأكواد", "error");
      return success;
    } catch {
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════
  // FREEZE FRAME (Mode 02)
  // ═══════════════════════════════════════════════════════

  async readFreezeFrame(): Promise<FreezeFrameData | null> {
    if (!this.isConnected) return null;

    try {
      this.log("⟳ جاري قراءة Freeze Frame (Mode 02)...", "info");

      // Read DTC that caused freeze frame (PID 02 02 00)
      const dtcResp = await this.sendCommand("020200", 3000);
      let dtcCode = "Unknown";
      const dtcCleaned = dtcResp.replace(/[\s\r\n]/g, "");

      if (!dtcCleaned.includes("NODATA")) {
        const idx = dtcCleaned.toUpperCase().indexOf("4202");
        if (idx !== -1) {
          const dataStart = idx + 4;
          const highByte = parseInt(dtcCleaned.substring(dataStart, dataStart + 2), 16);
          const lowByte = dtcCleaned.substring(dataStart + 2, dataStart + 4);
          if (!isNaN(highByte) && highByte !== 0) {
            const typeCode = (highByte >> 6) & 0x03;
            const types = ["P", "C", "B", "U"];
            const firstDigit = (highByte >> 4) & 0x03;
            const secondDigit = highByte & 0x0F;
            dtcCode = `${types[typeCode]}${firstDigit}${secondDigit.toString(16).toUpperCase()}${lowByte.toUpperCase()}`;
          }
        }
      }

      const frame: FreezeFrameData = {
        dtcCode,
        rpm: null, speed: null, coolantTemp: null, engineLoad: null,
        fuelPressure: null, intakeTemp: null, shortFuelTrim: null,
        longFuelTrim: null, timingAdvance: null, mafRate: null, throttlePos: null,
        fuelStatus: "", timestamp: new Date(),
      };

      // Read each freeze frame PID (Mode 02, frame 00)
      const ffPIDs: Array<{ cmd: string; key: keyof FreezeFrameData; formula: (a: number, b?: number) => number }> = [
        { cmd: "020C00", key: "rpm", formula: (a, b) => ((a * 256) + (b || 0)) / 4 },
        { cmd: "020D00", key: "speed", formula: (a) => a },
        { cmd: "020500", key: "coolantTemp", formula: (a) => a - 40 },
        { cmd: "020400", key: "engineLoad", formula: (a) => (a * 100) / 255 },
        { cmd: "020A00", key: "fuelPressure", formula: (a) => a * 3 },
        { cmd: "020F00", key: "intakeTemp", formula: (a) => a - 40 },
        { cmd: "020600", key: "shortFuelTrim", formula: (a) => ((a - 128) * 100) / 128 },
        { cmd: "020700", key: "longFuelTrim", formula: (a) => ((a - 128) * 100) / 128 },
        { cmd: "020E00", key: "timingAdvance", formula: (a) => (a / 2) - 64 },
        { cmd: "021000", key: "mafRate", formula: (a, b) => ((a * 256) + (b || 0)) / 100 },
        { cmd: "021100", key: "throttlePos", formula: (a) => (a * 100) / 255 },
      ];

      for (const { cmd, key, formula } of ffPIDs) {
        try {
          const resp = await this.sendCommand(cmd, 2000);
          const clean = resp.replace(/[\s\r\n]/g, "");
          if (clean.includes("NODATA")) continue;

          // Find response data after mode+pid bytes
          const pidHex = cmd.substring(2, 4);
          const searchStr = "42" + pidHex;
          const dataIdx = clean.toUpperCase().indexOf(searchStr.toUpperCase());
          if (dataIdx === -1) continue;

          const dStart = dataIdx + searchStr.length + 2; // +2 for frame number "00"
          const a = parseInt(clean.substring(dStart, dStart + 2), 16);
          const b = parseInt(clean.substring(dStart + 2, dStart + 4), 16);
          if (!isNaN(a)) {
            (frame as any)[key] = formula(a, isNaN(b) ? undefined : b);
          }
        } catch { /* skip */ }
      }

      // Read fuel system status
      try {
        const fsResp = await this.sendCommand("020300", 2000);
        if (!fsResp.includes("NODATA")) {
          const fsClean = fsResp.replace(/[\s\r\n]/g, "");
          const fsIdx = fsClean.toUpperCase().indexOf("4203");
          if (fsIdx !== -1) {
            const fsVal = parseInt(fsClean.substring(fsIdx + 6, fsIdx + 8), 16);
            const fsMap: Record<number, string> = { 1: "Open Loop", 2: "Closed Loop", 4: "Open Loop (driving)", 8: "Open Loop (fault)", 16: "Closed Loop (O2 fault)" };
            frame.fuelStatus = fsMap[fsVal] || `Status ${fsVal}`;
          }
        }
      } catch { /* skip */ }

      if (dtcCode === "Unknown" && frame.rpm === null && frame.speed === null) {
        this.log("ℹ لا توجد بيانات Freeze Frame متاحة", "info");
        return null;
      }

      this.log(`✓ Freeze Frame للكود: ${frame.dtcCode}`, "received");
      return frame;
    } catch (error: any) {
      this.handleError("command", `فشل Freeze Frame: ${error.message}`, { command: "02", severity: "low", retryable: true });
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════
  // MODE 6 - ON-BOARD MONITORING TEST RESULTS
  // ═══════════════════════════════════════════════════════

  async readMode6Tests(): Promise<Mode6TestResult[]> {
    if (!this.isConnected) return [];

    try {
      this.log("⟳ جاري قراءة اختبارات Mode 6...", "info");
      const results: Mode6TestResult[] = [];

      // For CAN protocols, Mode 06 uses TID (Test ID)
      // Format: 06 TID → Response: 46 TID COMP_ID TEST_VALUE MIN MAX
      for (const [testId, testDef] of Object.entries(MODE6_TESTS)) {
        try {
          const response = await this.sendCommand(`06${testId}`, 2500);
          const cleaned = response.replace(/[\s\r\n]/g, "");

          if (cleaned.includes("NODATA") || cleaned.includes("ERROR")) continue;

          // Parse CAN Mode 6 response
          // Format: 46 TID COMP VALUE(2bytes) MIN(2bytes) MAX(2bytes)
          const respIdx = cleaned.toUpperCase().indexOf("46" + testId.toUpperCase());
          if (respIdx === -1) continue;

          const data = cleaned.substring(respIdx + 4); // Skip "46" + TID
          if (data.length < 12) continue;

          // Component ID (1 byte)
          const compId = data.substring(0, 2);

          // Test value (2 bytes)
          const valueRaw = parseInt(data.substring(2, 6), 16);
          // Min limit (2 bytes)
          const minRaw = parseInt(data.substring(6, 10), 16);
          // Max limit (2 bytes)
          const maxRaw = parseInt(data.substring(10, 14), 16);

          // Scale factor depends on test type
          let scaleFactor = 1;
          if (testDef.unit === "ms") scaleFactor = 0.1;
          else if (testDef.unit === "ratio") scaleFactor = 0.001;
          else if (testDef.unit === "V") scaleFactor = 0.001;
          else if (testDef.unit === "g/s") scaleFactor = 0.01;
          else if (testDef.unit === "%") scaleFactor = 0.1;

          const value = valueRaw * scaleFactor;
          const minLimit = minRaw * scaleFactor;
          const maxLimit = maxRaw * scaleFactor;

          const status: "pass" | "fail" = (value >= minLimit && value <= maxLimit) ? "pass" : "fail";

          results.push({
            testId,
            testName: testDef.name,
            component: testDef.component + (compId !== "00" ? ` (${compId})` : ""),
            value,
            minLimit,
            maxLimit,
            unit: testDef.unit,
            status,
          });
        } catch { /* skip this test */ }
      }

      this.log(`✓ تم قراءة ${results.length} اختبار Mode 6 (${results.filter(r => r.status === "fail").length} راسب)`, "received");
      return results;
    } catch (error: any) {
      this.handleError("command", `فشل Mode 6: ${error.message}`, { command: "06", severity: "low", retryable: true });
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════
  // O2 SENSOR MONITORING (Mode 05)
  // ═══════════════════════════════════════════════════════

  async readO2Sensors(): Promise<O2SensorData[]> {
    if (!this.isConnected) return [];

    try {
      this.log("⟳ جاري قراءة حساسات O2 (Mode 05)...", "info");
      const sensors: O2SensorData[] = [];

      // Mode 05 TIDs for O2 sensor monitoring
      const o2Tests = [
        { tid: "0101", bank: 1, sensor: 1, type: "richToLean" },
        { tid: "0102", bank: 1, sensor: 1, type: "leanToRich" },
        { tid: "0201", bank: 1, sensor: 2, type: "richToLean" },
        { tid: "0202", bank: 1, sensor: 2, type: "leanToRich" },
      ];

      const sensorMap: Record<string, O2SensorData> = {};

      for (const test of o2Tests) {
        try {
          const resp = await this.sendCommand(`05${test.tid}`, 2000);
          const cleaned = resp.replace(/[\s\r\n]/g, "");
          if (cleaned.includes("NODATA")) continue;

          const key = `${test.bank}-${test.sensor}`;
          if (!sensorMap[key]) {
            sensorMap[key] = { bank: test.bank, sensor: test.sensor, voltage: 0, shortTermFuelTrim: 0, richToLean: 0, leanToRich: 0, status: "normal" };
          }

          // Parse value
          const idx = cleaned.indexOf("45");
          if (idx !== -1) {
            const val = parseInt(cleaned.substring(idx + 8, idx + 12), 16) * 0.005;
            if (test.type === "richToLean") sensorMap[key].richToLean = val;
            else sensorMap[key].leanToRich = val;
          }
        } catch { /* skip */ }
      }

      // Also read current O2 voltage from Mode 01
      const o2v = await this.readPID("0114");
      if (o2v !== null && sensorMap["1-1"]) {
        sensorMap["1-1"].voltage = o2v;
        sensorMap["1-1"].status = o2v < 0.1 || o2v > 0.9 ? "warning" : "normal";
      }

      sensors.push(...Object.values(sensorMap));
      this.log(`✓ تم قراءة ${sensors.length} حساس O2`, "received");
      return sensors;
    } catch (error: any) {
      this.handleError("command", `فشل O2 Sensors: ${error.message}`, { command: "05", severity: "low", retryable: true });
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════
  // VEHICLE INFORMATION (Mode 09)
  // ═══════════════════════════════════════════════════════

  async readVIN(): Promise<string> {
    if (!this.isConnected) return "";
    try {
      // VIN is Mode 09, PID 02 - multi-frame response
      const response = await this.sendCommand("0902", 8000);
      
      if (response.includes("NODATA") || response.includes("ERROR") || response.includes("UNABLE")) return "";

      this.log(`VIN raw: ${response.substring(0, 150)}`, "info");

      // ═══ METHOD 1: Simple/Legacy parsing (works best with J1850 PWM/VPW - Ford/GM) ═══
      // This method is proven to work with Ford vehicles
      // It removes all whitespace, strips 4902XX headers, and converts to ASCII
      const simpleParsed = this.parseVINSimple(response);
      if (simpleParsed.length === 17) {
        this.log(`✓ VIN (simple): ${simpleParsed}`, "received");
        return simpleParsed;
      }

      // ═══ METHOD 2: Advanced multi-frame parsing (CAN/ISO-TP) ═══
      const advancedParsed = this.parseVINAdvanced(response);
      if (advancedParsed.length === 17) {
        this.log(`✓ VIN (advanced): ${advancedParsed}`, "received");
        return advancedParsed;
      }

      // Return best result
      const best = simpleParsed.length >= advancedParsed.length ? simpleParsed : advancedParsed;
      if (best.length > 0) {
        this.log(`⚠ VIN partial (${best.length} chars): ${best}`, "info");
        return best;
      }
      return "";
    } catch (e: any) {
      this.handleError("command", `فشل قراءة VIN: ${e.message}`, { command: "0902", severity: "low", retryable: true });
      return "";
    }
  }

  /**
   * Simple VIN parsing - proven to work with J1850 PWM (Ford) and J1850 VPW (GM)
   * Strips all whitespace, removes 4902XX headers, converts hex to ASCII
   */
    private parseVINSimple(response: string): string {
    // Remove all whitespace and newlines
    const cleaned = response.replace(/[\s\r\n]/g, "");
    if (cleaned.includes("NODATA") || cleaned.includes("ERROR")) return "";
    
    let data = cleaned.toUpperCase();
    
    // إزالة headers البروتوكولات القديمة (J1850 PWM/VPW)
    // Ford/Mercury J1850 PWM: 48 6B 10 49 02 01 ...
    // GM J1850 VPW: 48 6B 10 49 02 01 ...
    // أيضاً: 486B10, 686B10, 486BFE, etc.
    data = data.replace(/[46][89A-F]6[Bb][0-9A-F]{2}/gi, "");
    
    // إزالة CAN headers (7E8, 7EA, etc.)
    data = data.replace(/7E[0-9A-F][0-9A-F]{2}/gi, "");
    
    // البحث عن 4902 (Mode 09 PID 02 response)
    const idx4902 = data.indexOf("4902");
    if (idx4902 !== -1) {
      data = data.substring(idx4902);
      // إزالة جميع headers الاستجابة (490201, 490202, 490203, 490204, 490205)
      data = data.replace(/4902[0-9A-F]{2}/gi, "");
    } else {
      // محاولة بديلة: بعض الأجهزة ترجع "49 02" بمسافات
      return "";
    }
    
    // إزالة أي J1850 headers متبقية
    data = data.replace(/[46][89A-F]6[Bb][0-9A-F]{2}/gi, "");
    
    // إزالة ISO-TP flow control bytes (0x10, 0x21, 0x22, etc.)
    data = data.replace(/^(10|1[0-9A-F])/i, "");
    
    // تحويل hex إلى ASCII
    let vin = "";
    for (let i = 0; i < data.length - 1; i += 2) {
      const charCode = parseInt(data.substring(i, i + 2), 16);
      if (charCode >= 48 && charCode <= 57) { // 0-9
        vin += String.fromCharCode(charCode);
      } else if (charCode >= 65 && charCode <= 90) { // A-Z
        vin += String.fromCharCode(charCode);
      } else if (charCode >= 97 && charCode <= 122) { // a-z -> A-Z
        vin += String.fromCharCode(charCode - 32);
      }
      // تخطي الأحرف غير الصالحة لـ VIN (لا توقف التحليل)
    }
    
    if (vin.length >= 17) {
      return vin.substring(0, 17);
    }
    return vin;
  }

  /**
   * Advanced VIN parsing for CAN/ISO-TP multi-frame responses
   */
  private parseVINAdvanced(response: string): string {
    const lines = response.split(/[\r\n]+/).filter(l => l.trim().length > 0 && !l.includes(">"));
    let hexData = "";

    // Check if it's multi-frame with line numbers (0:, 1:, 2:)
    const hasFrameNumbers = lines.some(l => /^[0-2]:/.test(l.trim()));
    
    if (hasFrameNumbers) {
      // ISO-TP multi-frame format: "0:49020131465032", "1:4D454...", "2:..."
      for (const line of lines) {
        const trimmed = line.trim();
        const colonIdx = trimmed.indexOf(":");
        if (colonIdx >= 0 && colonIdx <= 2) {
          const frameNum = parseInt(trimmed.substring(0, colonIdx));
          let frameData = trimmed.substring(colonIdx + 1).replace(/\s/g, "");
          if (frameNum === 0) {
            const idx4902 = frameData.toUpperCase().indexOf("4902");
            if (idx4902 !== -1) {
              hexData += frameData.substring(idx4902 + 6);
            }
          } else {
            hexData += frameData;
          }
        }
      }
    } else {
      // Check for CAN headers (7E8, 7E9, etc.)
      const hasCANHeaders = lines.some(l => /^7[eE][0-9a-fA-F]/.test(l.trim()));
      
      if (hasCANHeaders) {
        for (const line of lines) {
          const trimmed = line.trim();
          if (/^7[eE][0-9a-fA-F]/.test(trimmed)) {
            const parts = trimmed.split(/\s+/);
            if (parts.length > 1) {
              const dataBytes = parts.slice(1);
              const firstByte = parseInt(dataBytes[0], 16);
              if (firstByte === 0x10) {
                const frameHex = dataBytes.slice(1).join("");
                const idx4902 = frameHex.toUpperCase().indexOf("4902");
                if (idx4902 !== -1) {
                  hexData += frameHex.substring(idx4902 + 6);
                }
              } else if ((firstByte & 0xF0) === 0x20) {
                hexData += dataBytes.slice(1).join("");
              } else if (dataBytes.join("").toUpperCase().includes("4902")) {
                const frameHex = dataBytes.join("");
                const idx4902 = frameHex.toUpperCase().indexOf("4902");
                if (idx4902 !== -1) {
                  hexData += frameHex.substring(idx4902 + 6);
                }
              }
            }
          }
        }
      } else {
        // Fallback: no frame numbers, no CAN headers
        let allData = "";
        for (const line of lines) {
          const trimmed = line.trim().replace(/\s/g, "");
          if (/^[0-9A-Fa-f]{1,3}$/.test(trimmed) && trimmed.length <= 3) continue;
          allData += trimmed;
        }
        const idx4902 = allData.toUpperCase().indexOf("4902");
        if (idx4902 !== -1) {
          hexData = allData.substring(idx4902 + 6);
          hexData = hexData.replace(/4902[0-9A-Fa-f]{2}/gi, "");
        } else {
          hexData = allData;
        }
      }
    }

    // Remove any remaining non-hex characters
    hexData = hexData.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();

    // Convert hex to ASCII
    let vin = "";
    for (let i = 0; i < hexData.length - 1; i += 2) {
      const charCode = parseInt(hexData.substring(i, i + 2), 16);
      if (charCode >= 48 && charCode <= 57) {
        vin += String.fromCharCode(charCode);
      } else if (charCode >= 65 && charCode <= 90) {
        vin += String.fromCharCode(charCode);
      } else if (charCode >= 97 && charCode <= 122) {
        vin += String.fromCharCode(charCode - 32);
      }
    }

    if (vin.length >= 17) {
      return vin.substring(0, 17);
    }
    return vin;
  }

  async readECUName(): Promise<string> {
    if (!this.isConnected) return "";
    try {
      const response = await this.sendCommand("090A", 5000);
      const cleaned = response.replace(/[\s\r\n]/g, "");
      if (cleaned.includes("NODATA")) return "";

      let hexData = cleaned.replace(/490A[0-9A-Fa-f]{2}/g, "");
      let name = "";
      for (let i = 0; i < hexData.length - 1; i += 2) {
        const charCode = parseInt(hexData.substring(i, i + 2), 16);
        if (charCode >= 32 && charCode <= 126) name += String.fromCharCode(charCode);
      }
      return name.trim();
    } catch { return ""; }
  }

  async readCalibrationId(): Promise<string> {
    if (!this.isConnected) return "";
    try {
      const response = await this.sendCommand("0904", 5000);
      const cleaned = response.replace(/[\s\r\n]/g, "");
      if (cleaned.includes("NODATA")) return "";

      let hexData = cleaned.replace(/4904[0-9A-Fa-f]{2}/g, "");
      let calId = "";
      for (let i = 0; i < hexData.length - 1; i += 2) {
        const charCode = parseInt(hexData.substring(i, i + 2), 16);
        if (charCode >= 32 && charCode <= 126) calId += String.fromCharCode(charCode);
      }
      return calId.trim();
    } catch { return ""; }
  }

  // ═══════════════════════════════════════════════════════
  // I/M READINESS (Mode 01, PID 01)
  // ═══════════════════════════════════════════════════════

  async readReadiness(): Promise<Record<string, "pass" | "fail" | "na">> {
    if (!this.isConnected) return {};

    try {
      this.log("⟳ جاري قراءة I/M Readiness...", "info");
      const response = await this.sendCommand("0101", 3000);
      const cleaned = response.replace(/[\s\r\n]/g, "");

      const idx = cleaned.toUpperCase().indexOf("4101");
      if (idx === -1) return {};

      const dataStart = idx + 4;
      // Byte A: MIL status + DTC count
      const byteA = parseInt(cleaned.substring(dataStart, dataStart + 2), 16);
      // Byte B: Tests available (bits)
      const byteB = parseInt(cleaned.substring(dataStart + 2, dataStart + 4), 16);
      // Byte C: Tests incomplete (bits)
      const byteC = parseInt(cleaned.substring(dataStart + 4, dataStart + 6), 16);
      // Byte D: Additional tests
      const byteD = parseInt(cleaned.substring(dataStart + 6, dataStart + 8), 16);

      const milOn = (byteA & 0x80) !== 0;
      const dtcCount = byteA & 0x7F;

      if (milOn) {
        this.log(`⚠ MIL (Check Engine) مضاء - ${dtcCount} أكواد أعطال`, "error");
      }

      const tests: Record<string, "pass" | "fail" | "na"> = {};

      // Continuous monitors (Byte B bits 0-2 = available, Byte B bits 4-6 = incomplete)
      const continuousNames = ["Misfire", "Fuel System", "Components"];
      for (let i = 0; i < 3; i++) {
        const available = (byteB >> i) & 1;
        const incomplete = (byteB >> (i + 4)) & 1;
        tests[continuousNames[i]] = available ? (incomplete ? "fail" : "pass") : "na";
      }

      // Non-continuous monitors (Byte C = available, Byte D = incomplete)
      const nonContinuousNames = ["Catalyst", "Heated Catalyst", "Evaporative System", "Secondary Air", "A/C Refrigerant", "O2 Sensor", "O2 Sensor Heater", "EGR/VVT"];
      for (let i = 0; i < 8; i++) {
        const available = (byteC >> i) & 1;
        const incomplete = (byteD >> i) & 1;
        if (nonContinuousNames[i]) {
          tests[nonContinuousNames[i]] = available ? (incomplete ? "fail" : "pass") : "na";
        }
      }

      const passCount = Object.values(tests).filter(v => v === "pass").length;
      const failCount = Object.values(tests).filter(v => v === "fail").length;
      this.log(`✓ Readiness: ${passCount} ناجح, ${failCount} غير مكتمل`, "info");

      return tests;
    } catch (error: any) {
      this.handleError("command", `فشل Readiness: ${error.message}`, { command: "0101", severity: "low", retryable: true });
      return {};
    }
  }

  // ═══════════════════════════════════════════════════════
  // PROTOCOL MANAGEMENT
  // ═══════════════════════════════════════════════════════

  async getProtocol(): Promise<string> {
    if (!this.isConnected) return "";
    try {
      const resp = await this.sendCommand("ATDP");
      return resp.replace(/[\r\n]/g, "").trim();
    } catch { return ""; }
  }

  async switchProtocol(protocol: keyof typeof PROTOCOLS): Promise<boolean> {
    if (!this.isConnected) return false;
    const config = PROTOCOLS[protocol];
    if (!config) return false;

    try {
      this.log(`⟳ تبديل البروتوكول إلى: ${config.nameAr}...`, "info");
      await this.sendCommand(`ATSP${config.code}`, 3000);

      // Test connection with new protocol
      const testResp = await this.sendCommand("0100", config.timeout);
      if (testResp.includes("NODATA") || testResp.includes("ERROR")) {
        this.log(`✗ فشل الاتصال بالبروتوكول ${config.nameAr}`, "error");
        // Revert to auto
        await this.sendCommand("ATSP0", 3000);
        return false;
      }

      const dpResp = await this.sendCommand("ATDP");
      this._detectedProtocol = dpResp.replace(/[^A-Za-z0-9 /]/g, "").trim();
      this.log(`✓ تم التبديل إلى: ${this._detectedProtocol}`, "received");
      return true;
    } catch (error: any) {
      this.log(`✗ خطأ تبديل البروتوكول: ${error.message}`, "error");
      return false;
    }
  }

  async switchToJ1939(): Promise<boolean> { return this.switchProtocol("j1939"); }
  async switchToCANExtended(): Promise<boolean> { return this.switchProtocol("can_29_500"); }

  // ═══════════════════════════════════════════════════════
  // ENGINE HEALTH SCORE CALCULATION
  // ═══════════════════════════════════════════════════════

  calculateEngineHealth(data: {
    dtcCount: number;
    readiness: Record<string, "pass" | "fail" | "na">;
    mode6Results: Mode6TestResult[];
    liveData: Partial<OBDLiveData>;
    alerts: OBDAlert[];
  }): EngineHealth {
    const factors: EngineHealth["factors"] = [];

    // Factor 1: DTC Count (weight: 30%)
    const dtcScore = data.dtcCount === 0 ? 100 : data.dtcCount === 1 ? 60 : data.dtcCount <= 3 ? 30 : 0;
    factors.push({ name: "أكواد الأعطال", score: dtcScore, weight: 0.30, detail: data.dtcCount === 0 ? "لا توجد أعطال" : `${data.dtcCount} كود عطل` });

    // Factor 2: Readiness Tests (weight: 20%)
    const readinessEntries = Object.values(data.readiness);
    const passCount = readinessEntries.filter(v => v === "pass").length;
    const totalTests = readinessEntries.filter(v => v !== "na").length;
    const readinessScore = totalTests > 0 ? (passCount / totalTests) * 100 : 50;
    factors.push({ name: "جاهزية الفحص", score: readinessScore, weight: 0.20, detail: `${passCount}/${totalTests} ناجح` });

    // Factor 3: Mode 6 Tests (weight: 20%)
    const mode6Pass = data.mode6Results.filter(t => t.status === "pass").length;
    const mode6Total = data.mode6Results.length;
    const mode6Score = mode6Total > 0 ? (mode6Pass / mode6Total) * 100 : 70;
    factors.push({ name: "اختبارات المكونات", score: mode6Score, weight: 0.20, detail: `${mode6Pass}/${mode6Total} ناجح` });

    // Factor 4: Live Data Health (weight: 15%)
    let liveScore = 100;
    const ref = this._referenceValues;
    if (data.liveData.coolantTemp !== undefined) {
      if (data.liveData.coolantTemp > ref.coolantTemp.warning) liveScore -= 30;
      else if (data.liveData.coolantTemp < ref.coolantTemp.normal[0] - 10) liveScore -= 15;
    }
    if (data.liveData.voltage !== undefined) {
      if (data.liveData.voltage < ref.voltage.low || data.liveData.voltage > ref.voltage.high) liveScore -= 20;
    }
    if (data.liveData.shortFuelTrim !== undefined && Math.abs(data.liveData.shortFuelTrim) > 15) liveScore -= 15;
    if (data.liveData.longFuelTrim !== undefined && Math.abs(data.liveData.longFuelTrim) > 15) liveScore -= 15;
    liveScore = Math.max(0, liveScore);
    factors.push({ name: "البيانات الحية", score: liveScore, weight: 0.15, detail: liveScore >= 80 ? "طبيعية" : "تحتاج مراقبة" });

    // Factor 5: Alerts (weight: 15%)
    const criticalAlerts = data.alerts.filter(a => a.type === "critical").length;
    const warningAlerts = data.alerts.filter(a => a.type === "warning").length;
    const alertScore = Math.max(0, 100 - (criticalAlerts * 40) - (warningAlerts * 15));
    factors.push({ name: "التنبيهات", score: alertScore, weight: 0.15, detail: criticalAlerts > 0 ? `${criticalAlerts} حرج` : warningAlerts > 0 ? `${warningAlerts} تحذير` : "لا تنبيهات" });

    // Calculate weighted total
    const totalScore = Math.round(factors.reduce((sum, f) => sum + (f.score * f.weight), 0));

    // Determine category
    let category: EngineHealth["category"];
    if (totalScore >= 90) category = "excellent";
    else if (totalScore >= 75) category = "good";
    else if (totalScore >= 55) category = "fair";
    else if (totalScore >= 30) category = "poor";
    else category = "critical";

    return { score: totalScore, category, factors };
  }

  // ═══════════════════════════════════════════════════════
  // FULL SCAN REPORT
  // ═══════════════════════════════════════════════════════

  async generateFullReport(): Promise<ScanReport> {
    this.log("═══════════════════════════════════════", "info");
    this.log("       بدء الفحص الشامل الاحترافي      ", "info");
    this.log("═══════════════════════════════════════", "info");

    // Step 1: Vehicle Info
    this.log("⟳ [1/7] قراءة معلومات السيارة...", "info");
    const vin = await this.readVIN();
    const protocol = await this.getProtocol();
    const ecuName = await this.readECUName();

    // Step 2: Live Data
    this.log("⟳ [2/7] قراءة البيانات الحية...", "info");
    const liveData = await this.readLiveData();

    // Step 3: DTCs
    this.log("⟳ [3/7] قراءة أكواد الأعطال...", "info");
    const dtcCodes = await this.readDTCs();
    const pendingDtcs = await this.readPendingDTCs();

    // Step 4: Freeze Frame
    this.log("⟳ [4/7] قراءة Freeze Frame...", "info");
    const freezeFrame = await this.readFreezeFrame();

    // Step 5: Mode 6
    this.log("⟳ [5/7] قراءة اختبارات Mode 6...", "info");
    const mode6Results = await this.readMode6Tests();

    // Step 6: Readiness
    this.log("⟳ [6/7] قراءة I/M Readiness...", "info");
    const readinessTests = await this.readReadiness();

    // Step 7: O2 Sensors
    this.log("⟳ [7/7] قراءة حساسات O2...", "info");
    const o2Sensors = await this.readO2Sensors();

    // Calculate health score
    const health = this.calculateEngineHealth({
      dtcCount: dtcCodes.length,
      readiness: readinessTests,
      mode6Results,
      liveData,
      alerts: this._alerts,
    });

    const report: ScanReport = {
      vin,
      protocol,
      scanDate: new Date(),
      liveData,
      dtcCodes: [...dtcCodes, ...pendingDtcs.map(d => ({ ...d, code: `(P)${d.code}` }))],
      freezeFrames: freezeFrame ? [freezeFrame] : [],
      mode6Results,
      readinessTests,
      alerts: [...this._alerts],
      vehicleInfo: { vin, protocol, ecuName, obdStandard: "" },
      engineHealthScore: health.score,
      o2Sensors,
    };

    this._scanHistory.push(report);

    this.log("═══════════════════════════════════════", "info");
    this.log(`  ✓ اكتمل الفحص - صحة المحرك: ${health.score}% (${health.category})`, "info");
    this.log(`  • أعطال: ${dtcCodes.length} | Mode 6 راسب: ${mode6Results.filter(t => t.status === "fail").length}`, "info");
    this.log("═══════════════════════════════════════", "info");

    return report;
  }

  // ═══════════════════════════════════════════════════════
  // REPORT EXPORT
  // ═══════════════════════════════════════════════════════

  exportReportAsText(report: ScanReport): string {
    const line = "━".repeat(50);
    const doubleLine = "═".repeat(50);

    let text = `${doubleLine}\n`;
    text += `  تقرير فحص OBD2 الاحترافي - مركز مير\n`;
    text += `  Meir Professional OBD2 Scan Report\n`;
    text += `${doubleLine}\n\n`;

    text += `📅 التاريخ: ${report.scanDate.toLocaleString("ar-SA")}\n`;
    text += `🔑 VIN: ${report.vin || "غير متاح"}\n`;
    text += `📡 البروتوكول: ${report.protocol || "غير محدد"}\n`;
    if (report.vehicleInfo.ecuName) text += `🖥️ ECU: ${report.vehicleInfo.ecuName}\n`;
    if (report.engineHealthScore !== undefined) {
      const healthEmoji = report.engineHealthScore >= 90 ? "🟢" : report.engineHealthScore >= 75 ? "🟡" : report.engineHealthScore >= 55 ? "🟠" : "🔴";
      text += `${healthEmoji} صحة المحرك: ${report.engineHealthScore}%\n`;
    }
    text += `\n`;

    // Live Data
    text += `${line}\n  📊 البيانات الحية\n${line}\n`;
    const liveFields: Array<[string, any, string]> = [
      ["RPM", report.liveData.rpm?.toFixed(0), "rpm"],
      ["السرعة", report.liveData.speed, "km/h"],
      ["حرارة المحرك", report.liveData.coolantTemp, "°C"],
      ["جهد البطارية", report.liveData.voltage?.toFixed(1), "V"],
      ["حمل المحرك", report.liveData.engineLoad?.toFixed(1), "%"],
      ["دواسة الوقود", report.liveData.throttlePos?.toFixed(1), "%"],
      ["مستوى الوقود", report.liveData.fuelLevel?.toFixed(0), "%"],
      ["MAF", report.liveData.mafRate?.toFixed(2), "g/s"],
      ["توقيت الإشعال", report.liveData.timingAdvance?.toFixed(1), "°"],
      ["Short Fuel Trim", report.liveData.shortFuelTrim?.toFixed(1), "%"],
      ["Long Fuel Trim", report.liveData.longFuelTrim?.toFixed(1), "%"],
      ["حرارة الزيت", report.liveData.oilTemp, "°C"],
    ];
    for (const [name, val, unit] of liveFields) {
      if (val !== undefined && val !== null) text += `  ${name}: ${val} ${unit}\n`;
    }

    // DTCs
    text += `\n${line}\n  🔧 أكواد الأعطال (${report.dtcCodes.length})\n${line}\n`;
    if (report.dtcCodes.length === 0) {
      text += `  ✅ لا توجد أكواد أعطال - المحرك سليم\n`;
    } else {
      report.dtcCodes.forEach(dtc => { text += `  ❌ ${dtc.code}\n`; });
    }

    // Freeze Frame
    if (report.freezeFrames.length > 0) {
      const ff = report.freezeFrames[0];
      text += `\n${line}\n  📸 Freeze Frame\n${line}\n`;
      text += `  الكود المسبب: ${ff.dtcCode}\n`;
      if (ff.rpm !== null) text += `  RPM: ${ff.rpm.toFixed(0)}\n`;
      if (ff.speed !== null) text += `  السرعة: ${ff.speed} km/h\n`;
      if (ff.coolantTemp !== null) text += `  الحرارة: ${ff.coolantTemp}°C\n`;
      if (ff.engineLoad !== null) text += `  حمل المحرك: ${ff.engineLoad.toFixed(1)}%\n`;
      if (ff.timingAdvance !== null) text += `  الإشعال: ${ff.timingAdvance.toFixed(1)}°\n`;
      if (ff.fuelStatus) text += `  حالة الوقود: ${ff.fuelStatus}\n`;
    }

    // Mode 6
    if (report.mode6Results.length > 0) {
      text += `\n${line}\n  🧪 اختبارات Mode 6 (${report.mode6Results.length})\n${line}\n`;
      report.mode6Results.forEach(test => {
        const icon = test.status === "pass" ? "✅" : "❌";
        text += `  ${icon} ${test.component}: ${test.value.toFixed(2)} ${test.unit} [${test.minLimit.toFixed(2)} - ${test.maxLimit.toFixed(2)}]\n`;
      });
    }

    // Readiness
    text += `\n${line}\n  📋 I/M Readiness\n${line}\n`;
    Object.entries(report.readinessTests).forEach(([name, status]) => {
      const icon = status === "pass" ? "✅" : status === "fail" ? "❌" : "⚪";
      const label = status === "pass" ? "ناجح" : status === "fail" ? "غير مكتمل" : "غير مدعوم";
      text += `  ${icon} ${name}: ${label}\n`;
    });

    // Alerts
    if (report.alerts.length > 0) {
      text += `\n${line}\n  ⚠️ التنبيهات (${report.alerts.length})\n${line}\n`;
      report.alerts.forEach(alert => {
        text += `  ${alert.type === "critical" ? "🔴" : "🟡"} ${alert.message}\n`;
      });
    }

    text += `\n${doubleLine}\n`;
    text += `  تقرير صادر من: OBD Meir Pro - مركز مير للتشخيص\n`;
    text += `  الموقع: meirservic.co\n`;
    text += `${doubleLine}\n`;

    return text;
  }

  // ═══════════════════════════════════════════════════════
  // DATA LOGGER - تسجيل رحلة كاملة
  // ═══════════════════════════════════════════════════════

  private _dataLoggerActive: boolean = false;
  private _dataLoggerInterval: NodeJS.Timeout | null = null;
  private _dataLogEntries: DataLogEntry[] = [];
  private _dataLogStartTime: number = 0;

  startDataLogger(intervalMs: number = 500): void {
    if (this._dataLoggerActive || !this.isConnected) return;
    this._dataLoggerActive = true;
    this._dataLogStartTime = Date.now();
    this._dataLogEntries = [];
    this.log("▶ بدء تسجيل الرحلة...", "info");

    this._dataLoggerInterval = setInterval(async () => {
      if (!this.isConnected) { this.stopDataLogger(); return; }
      try {
        const liveData = await this.readLiveData();
        const entry: DataLogEntry = {
          timestamp: Date.now(),
          elapsed: Date.now() - this._dataLogStartTime,
          rpm: liveData.rpm || 0,
          speed: liveData.speed || 0,
          coolantTemp: liveData.coolantTemp || 0,
          throttlePos: liveData.throttlePos || 0,
          engineLoad: liveData.engineLoad || 0,
          voltage: liveData.voltage || 0,
          mafRate: liveData.mafRate || 0,
          fuelLevel: liveData.fuelLevel || 0,
          intakeTemp: liveData.intakeTemp || 0,
          shortFuelTrim: liveData.shortFuelTrim || 0,
          longFuelTrim: liveData.longFuelTrim || 0,
        };
        this._dataLogEntries.push(entry);
      } catch (e) { /* skip entry on error */ }
    }, intervalMs);
  }

  stopDataLogger(): DataLogEntry[] {
    this._dataLoggerActive = false;
    if (this._dataLoggerInterval) {
      clearInterval(this._dataLoggerInterval);
      this._dataLoggerInterval = null;
    }
    const duration = ((Date.now() - this._dataLogStartTime) / 1000).toFixed(0);
    this.log(`■ تم إيقاف التسجيل - ${this._dataLogEntries.length} نقطة في ${duration} ثانية`, "info");
    return [...this._dataLogEntries];
  }

  get isDataLoggerActive(): boolean { return this._dataLoggerActive; }
  get dataLogEntries(): DataLogEntry[] { return this._dataLogEntries; }

  exportDataLogCSV(): string {
    const headers = "Timestamp,Elapsed(ms),RPM,Speed(km/h),CoolantTemp(C),Throttle(%),Load(%),Voltage(V),MAF(g/s),Fuel(%),IntakeTemp(C),ShortFT(%),LongFT(%)";
    const rows = this._dataLogEntries.map(e =>
      `${new Date(e.timestamp).toISOString()},${e.elapsed},${e.rpm.toFixed(0)},${e.speed},${e.coolantTemp},${e.throttlePos.toFixed(1)},${e.engineLoad.toFixed(1)},${e.voltage.toFixed(2)},${e.mafRate.toFixed(2)},${e.fuelLevel.toFixed(0)},${e.intakeTemp},${e.shortFuelTrim.toFixed(1)},${e.longFuelTrim.toFixed(1)}`
    );
    return [headers, ...rows].join("\n");
  }

  // ═══════════════════════════════════════════════════════
  // PERFORMANCE METRICS - 0-100 km/h + HP Estimation
  // ═══════════════════════════════════════════════════════

  private _perfTestActive: boolean = false;
  private _perfTestInterval: NodeJS.Timeout | null = null;
  private _perfTestData: PerfTestEntry[] = [];
  private _perfTestStartTime: number = 0;
  private _perfTestResolve: ((result: PerformanceResult) => void) | null = null;

  async startPerformanceTest(vehicleWeightKg: number = 1500, timeoutSec: number = 60): Promise<PerformanceResult> {
    if (this._perfTestActive || !this.isConnected) {
      return { zeroTo100: 0, zeroTo60mph: 0, estimatedHP: 0, estimatedTorque: 0, maxRPM: 0, entries: [] };
    }

    this.log("⏱ بدء اختبار 0-100 km/h - ابدأ التسارع!", "info");
    this._perfTestActive = true;
    this._perfTestStartTime = 0;
    this._perfTestData = [];

    return new Promise<PerformanceResult>((resolve) => {
      this._perfTestResolve = resolve;

      const perfTimeout = setTimeout(() => {
        this.finishPerformanceTest(vehicleWeightKg);
      }, timeoutSec * 1000);

      this._perfTestInterval = setInterval(async () => {
        if (!this.isConnected) { clearTimeout(perfTimeout); this.finishPerformanceTest(vehicleWeightKg); return; }
        try {
          const rpmResp = await this.sendCommand("010C", 1000);
          const speedResp = await this.sendCommand("010D", 1000);
          const rpmVal = this.parsePIDResponse(rpmResp, "010C");
          const speedVal = this.parsePIDResponse(speedResp, "010D");
          const rpm = rpmVal !== null ? rpmVal : 0;
          const speed = speedVal !== null ? speedVal : 0;

          if (speed > 2 && this._perfTestStartTime === 0) {
            this._perfTestStartTime = Date.now();
            this.log("⏱ السيارة بدأت الحركة...", "info");
          }

          if (this._perfTestStartTime > 0) {
            this._perfTestData.push({ time: Date.now() - this._perfTestStartTime, speed, rpm });
          }

          if (speed >= 100) {
            clearTimeout(perfTimeout);
            this.finishPerformanceTest(vehicleWeightKg);
          }
        } catch (e) { /* skip */ }
      }, 200);
    });
  }

  private finishPerformanceTest(weightKg: number): void {
    this._perfTestActive = false;
    if (this._perfTestInterval) {
      clearInterval(this._perfTestInterval);
      this._perfTestInterval = null;
    }

    const entries = this._perfTestData;
    const maxSpeed = entries.length > 0 ? Math.max(...entries.map(e => e.speed)) : 0;
    const maxRPM = entries.length > 0 ? Math.max(...entries.map(e => e.rpm)) : 0;

    const reached100 = entries.find(e => e.speed >= 100);
    const zeroTo100 = reached100 ? reached100.time / 1000 : 0;

    const reached60mph = entries.find(e => e.speed >= 96.56);
    const zeroTo60mph = reached60mph ? reached60mph.time / 1000 : 0;

    let estimatedHP = 0;
    let estimatedTorque = 0;
    if (zeroTo100 > 0) {
      const v = 27.78;
      const power = (weightKg * v * v) / (2 * zeroTo100);
      estimatedHP = Math.round((power / 745.7) * 1.15);
      estimatedTorque = maxRPM > 0 ? Math.round((estimatedHP * 7127) / maxRPM) : 0;
    }

    const result: PerformanceResult = { zeroTo100, zeroTo60mph, estimatedHP, estimatedTorque, maxRPM, entries };

    if (zeroTo100 > 0) {
      this.log(`✓ 0-100: ${zeroTo100.toFixed(2)}s | HP: ~${estimatedHP} | Torque: ~${estimatedTorque} Nm`, "info");
    } else {
      this.log(`⚠ لم يتم الوصول لـ 100 km/h - أقصى سرعة: ${maxSpeed} km/h`, "info");
    }

    this._perfTestResolve?.(result);
    this._perfTestResolve = null;
  }

  get isPerfTestActive(): boolean { return this._perfTestActive; }

  // ═══════════════════════════════════════════════════════
  // MODE 08 - CONTROL OPERATIONS
  // ═══════════════════════════════════════════════════════

  async requestControlOperation(tid: string): Promise<Mode08Result> {
    if (!this.isConnected) return { supported: false, tid, response: "" };
    try {
      this.log(`⚠ Mode 08: طلب تحكم TID ${tid}...`, "info");
      const response = await this.sendCommand(`08${tid}`, 5000);
      const cleaned = response.replace(/[\s\r\n]/g, "");
      if (cleaned.includes("NODATA") || cleaned.includes("ERROR")) {
        return { supported: false, tid, response: cleaned };
      }
      const idx = cleaned.toUpperCase().indexOf("48");
      if (idx !== -1) {
        const data = cleaned.substring(idx + 2);
        this.log(`✓ Mode 08 TID ${tid}: ${data}`, "received");
        return { supported: true, tid, response: data };
      }
      return { supported: false, tid, response: cleaned };
    } catch (e: any) {
      this.log(`✗ Mode 08 error: ${e.message}`, "error");
      return { supported: false, tid, response: e.message };
    }
  }

  async getSupportedMode08TIDs(): Promise<string[]> {
    if (!this.isConnected) return [];
    try {
      const response = await this.sendCommand("0800", 3000);
      const cleaned = response.replace(/[\s\r\n]/g, "");
      if (cleaned.includes("NODATA")) return [];
      const idx = cleaned.toUpperCase().indexOf("4800");
      if (idx === -1) return [];
      const bitmask = cleaned.substring(idx + 4, idx + 12);
      const supported: string[] = [];
      for (let i = 0; i < 32; i++) {
        const byteIdx = Math.floor(i / 8);
        const bitIdx = 7 - (i % 8);
        const byte = parseInt(bitmask.substring(byteIdx * 2, byteIdx * 2 + 2), 16);
        if ((byte >> bitIdx) & 1) {
          supported.push((i + 1).toString(16).toUpperCase().padStart(2, "0"));
        }
      }
      this.log(`✓ Mode 08 TIDs: ${supported.join(", ")}`, "info");
      return supported;
    } catch { return []; }
  }

  // ═══════════════════════════════════════════════════════
  // MODE 09 PID 06 - CVN (Calibration Verification Number)
  // ═══════════════════════════════════════════════════════

  async readCVN(): Promise<string> {
    if (!this.isConnected) return "";
    try {
      this.log("⟳ قراءة CVN (رقم التحقق من المعايرة)...", "info");
      const response = await this.sendCommand("0906", 5000);
      const cleaned = response.replace(/[\s\r\n]/g, "");
      if (cleaned.includes("NODATA")) {
        this.log("⚠ CVN غير مدعوم في هذه السيارة", "info");
        return "";
      }
      let hexData = cleaned.replace(/4906[0-9A-Fa-f]{2}/gi, "");
      hexData = hexData.replace(/7E[0-9A-Fa-f]/gi, "");
      hexData = hexData.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
      if (hexData.length >= 8) {
        const cvn = hexData.substring(0, 8);
        this.log(`✓ CVN: ${cvn}`, "received");
        return cvn;
      }
      return hexData;
    } catch (e: any) {
      this.log(`✗ CVN error: ${e.message}`, "error");
      return "";
    }
  }

  // ═══════════════════════════════════════════════════════
  // WIFI OBD2 SUPPORT (ELM327 WiFi via WebSocket proxy)
  // ═══════════════════════════════════════════════════════

  private _wifiSocket: WebSocket | null = null;
  private _wifiConnected: boolean = false;

  async connectWiFi(proxyUrl: string = "ws://localhost:8080"): Promise<boolean> {
    try {
      this.log(`⟳ الاتصال بـ ELM327 WiFi عبر ${proxyUrl}...`, "info");
      this.setStatus("connecting");

      return new Promise((resolve) => {
        const ws = new WebSocket(proxyUrl);
        const wsTimeout = setTimeout(() => {
          ws.close();
          this.setStatus("error");
          this.log("✗ انتهى الوقت - تأكد من تشغيل البروكسي", "error");
          resolve(false);
        }, 10000);

        ws.onopen = async () => {
          clearTimeout(wsTimeout);
          this._wifiSocket = ws;
          this._wifiConnected = true;
          this.setStatus("initializing");
          this.log("✓ تم الاتصال بالبروكسي - جاري تهيئة ELM327...", "info");

          const initCmds = ["ATZ", "ATE0", "ATL0", "ATS0", "ATH0", "ATSP0"];
          for (const cmd of initCmds) {
            await this.sendWiFiCommand(cmd, 2000);
          }

          const testResp = await this.sendWiFiCommand("0100", 5000);
          if (testResp.includes("41") || testResp.includes("SEARCHING")) {
            this.setStatus("connected");
            this.log("✓ تم الاتصال بنجاح عبر WiFi!", "info");
            resolve(true);
          } else {
            this.setStatus("error");
            this.log("✗ فشل الاتصال بالسيارة عبر WiFi", "error");
            resolve(false);
          }
        };

        ws.onerror = () => {
          clearTimeout(wsTimeout);
          this.setStatus("error");
          this.log("✗ خطأ في الاتصال - تأكد من البروكسي والوصلة", "error");
          resolve(false);
        };

        ws.onclose = () => {
          this._wifiConnected = false;
          this._wifiSocket = null;
          if (this._status === "connected") {
            this.handleDisconnect();
          }
        };

        ws.onmessage = (event) => {
          const data = typeof event.data === "string" ? event.data : "";
          this.responseBuffer += data;
          if (data.includes(">")) {
            this.responseResolve?.(this.responseBuffer);
            this.responseBuffer = "";
          }
        };
      });
    } catch (e: any) {
      this.log(`✗ WiFi error: ${e.message}`, "error");
      this.setStatus("error");
      return false;
    }
  }

  private sendWiFiCommand(cmd: string, timeout: number = 3000): Promise<string> {
    return new Promise((resolve) => {
      if (!this._wifiSocket || this._wifiSocket.readyState !== WebSocket.OPEN) {
        resolve("");
        return;
      }
      this.responseBuffer = "";
      const timer = setTimeout(() => {
        resolve(this.responseBuffer);
        this.responseBuffer = "";
      }, timeout);

      this.responseResolve = (data) => {
        clearTimeout(timer);
        resolve(data);
      };

      this._wifiSocket.send(cmd + "\r");
      this.log(`WiFi> ${cmd}`, "sent");
    });
  }

  get isWiFiConnected(): boolean { return this._wifiConnected; }

  disconnectWiFi(): void {
    if (this._wifiSocket) {
      this._wifiSocket.close();
      this._wifiSocket = null;
    }
    this._wifiConnected = false;
    this.cleanup();
  }

  // ═══════════════════════════════════════════════════════
  // DISCONNECT & CLEANUP
  // ═══════════════════════════════════════════════════════

  disconnect(): void {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.cleanup();
  }

  private handleDisconnect() {
    this.log("✗ تم قطع الاتصال بالجهاز", "error");
    this.cleanup();
    this._onDisconnect?.();
    
    // Auto-reconnect: attempt to reconnect if device is still available
    if (this.device && this.device.gatt) {
      this.attemptAutoReconnect();
    }
  }

  private async attemptAutoReconnect(retries: number = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      this.log(`↻ إعادة الاتصال تلقائياً (${i + 1}/${retries})...`, "info");
      this.setStatus("connecting");
      
      // Wait with exponential backoff
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
      
      try {
        if (!this.device || !this.device.gatt) break;
        
        this.server = await Promise.race([
          this.device.gatt.connect(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error("Reconnect timeout")), 10000)
          )
        ]);
        
        // Re-discover characteristics
        await this.discoverCharacteristics();
        if (!this.txCharacteristic || !this.rxCharacteristic) continue;
        
        // Re-start notifications
        await this.rxCharacteristic.startNotifications();
        this.rxCharacteristic.addEventListener("characteristicvaluechanged", (event: any) => this.handleNotification(event));
        
        // Quick re-init (no full protocol scan needed)
        await this.sendCommand("ATE0", 2000);
        await this.sendCommand("ATL0", 2000);
        await this.sendCommand("ATS0", 2000);
        await this.sendCommand("ATH0", 2000);
        
        // Test connection
        const testResp = await this.sendCommand("0100", 5000);
        if (!testResp.includes("NODATA") && !testResp.includes("ERROR")) {
          this.setStatus("connected");
          this.log("✓ تم إعادة الاتصال بنجاح!", "info");
          return;
        }
      } catch (err: any) {
        this.log(`✗ فشل إعادة الاتصال: ${err.message}`, "error");
      }
    }
    
    this.setStatus("disconnected");
    this.log("✗ فشلت جميع محاولات إعادة الاتصال. اضغط 'اتصال' للمحاولة يدوياً.", "error");
  }

    private cleanup() {
    this.setStatus("disconnected");

    // ═══ تنظيف جميع Timers/Intervals ═══
    if (this.responseTimeout) {
      clearTimeout(this.responseTimeout);
      this.responseTimeout = null;
    }
    if (this._dataLoggerInterval) {
      clearInterval(this._dataLoggerInterval);
      this._dataLoggerInterval = null;
      this._dataLoggerActive = false;
    }
    if (this._perfTestInterval) {
      clearInterval(this._perfTestInterval);
      this._perfTestInterval = null;
      this._perfTestActive = false;
    }

    // ═══ تنظيف BLE Resources ═══
    this.txCharacteristic = null;
    this.rxCharacteristic = null;
    this.server = null;

    // ═══ تنظيف Communication State ═══
    this.responseBuffer = "";
    this.responseResolve = null;
    this.commandQueue = [];
    this.isProcessingQueue = false;

    // ═══ تنظيف Mutex ═══
    this._commandInProgress = false;
    this._commandMutex = Promise.resolve();
    if (this._mutexRelease) {
      this._mutexRelease();
      this._mutexRelease = null;
    }

    this.log("✗ تم تنظيف جميع الموارد", "info");
  }

  // ═══════════════════════════════════════════════════════
  // MULTI-ECU SCAN (ABS + AIRBAG + BCM)
  // ═══════════════════════════════════════════════════════

  /**
   * فحص ECU محدد بإرسال أمر Header مخصص
   * Header = عنوان ECU المستهدف (ISO 15765-4 CAN)
   */
  async scanECU(
    ecuHeader: string,
    ecuName: string,
    moduleId?: string,
    moduleArName?: string
  ): Promise<{ dtcs: OBDDTCCode[]; available: boolean }> {
    if (!this.isConnected) return { dtcs: [], available: false };
    try {
      this.log(`⤷ فحص ${ecuName} (Header: ${ecuHeader})...`, "info");

      // تفعيل Headers ON (مطلوب لبعض ELM327 adapters قبل ATSH)
      await this.sendCommand("ATH1", 1000);

      // تعيين Header للتوجيه للـ ECU المحدد
      await this.sendCommand(`ATSH${ecuHeader}`, 1500);

      // Ford MS-CAN: بعض وحدات فورد تحتاج ATFCSH للتحكم في التدفق
      const msCAN_headers = ["740", "726", "720", "730", "733", "7A0"];
      if (msCAN_headers.includes(ecuHeader.toUpperCase())) {
        await this.sendCommand(`ATFCSH${ecuHeader}`, 1000);
        await this.sendCommand("ATFCSD300000", 500);
        await this.sendCommand("ATFCSM1", 500);
      }

      // طلب أكواد الأعطال (Mode 03)
      const resp = await this.sendCommand("03", 5000);
      const cleaned = resp.replace(/[\s\r\n]/g, "").toUpperCase();
      const dtcs: OBDDTCCode[] = [];

      if (!cleaned.includes("NODATA") && !cleaned.includes("ERROR") && !cleaned.includes("UNABLE") && !cleaned.includes("STOPPED")) {
        // تحليل الاستجابة - دعم CAN ISO-TP multi-frame + single-frame
        const lines = resp.split(/\r\n|\n|\r/).filter(l => l.trim().length > 0);
        let allPayload = "";
        let isMultiFrame = false;

        for (const line of lines) {
          const lineCleaned = line.replace(/[\s]/g, "").toUpperCase();
          // تجاهل رسائل الحالة (ATSH echo, OK, etc)
          if (lineCleaned === "OK" || lineCleaned === "?" || lineCleaned.startsWith("AT")) continue;
          if (!/^[0-9A-F]+$/i.test(lineCleaned)) continue;

          // CAN header present (7E8, 7E9, 7EA, etc.) - Headers ON
          if (/^7E[0-9A-F]/.test(lineCleaned)) {
            const afterHeader = lineCleaned.substring(3);
            // First Frame: 10 xx 43 ...
            if (/^10[0-9A-F]{2}/.test(afterHeader)) {
              isMultiFrame = true;
              const frameData = afterHeader.substring(4); // Skip 10+length
              if (frameData.startsWith("43")) {
                allPayload += frameData.substring(2); // Skip "43"
              }
              continue;
            }
            // Consecutive Frame: 21, 22, 23...
            if (/^2[0-9A-F]/.test(afterHeader) && isMultiFrame) {
              allPayload += afterHeader.substring(2); // Skip sequence byte
              continue;
            }
            // Single Frame: contains 43 directly
            const idx43 = lineCleaned.indexOf("43");
            if (idx43 !== -1) {
              allPayload += lineCleaned.substring(idx43 + 2);
            }
            continue;
          }

          // No CAN header - ISO-TP without headers (Headers OFF)
          if (/^10[0-9A-F]{2}/.test(lineCleaned) && lineCleaned.includes("43")) {
            isMultiFrame = true;
            const idx43 = lineCleaned.indexOf("43");
            allPayload += lineCleaned.substring(idx43 + 2);
            continue;
          }
          if (/^2[0-9A-F]/.test(lineCleaned) && isMultiFrame) {
            allPayload += lineCleaned.substring(2);
            continue;
          }

          // Standard single-frame (no CAN header, no ISO-TP)
          const idx43 = lineCleaned.indexOf("43");
          if (idx43 !== -1) {
            allPayload += lineCleaned.substring(idx43 + 2);
          }
        }

        // Remove trailing padding (AA, 55, FF)
        allPayload = allPayload.replace(/(AA|55|FF)+$/i, "");

        // Parse DTCs from collected payload
        if (allPayload.length >= 4) {
          // Check for count byte
          let startOffset = 0;
          const possibleCount = parseInt(allPayload.substring(0, 2), 16);
          const remainingLen = allPayload.length - 2;
          if (possibleCount > 0 && possibleCount <= 15 && remainingLen === possibleCount * 4) {
            startOffset = 2; // Skip count byte
          } else if (allPayload.length % 4 !== 0 && possibleCount > 0 && possibleCount <= 15) {
            startOffset = 2; // Likely count byte
          }

          const maxDTCs = startOffset === 2 ? possibleCount : Math.floor((allPayload.length - startOffset) / 4);
          for (let i = 0; i < maxDTCs && i < 20; i++) {
            const offset = startOffset + i * 4;
            if (offset + 4 > allPayload.length) break;
            const b1 = parseInt(allPayload.substring(offset, offset + 2), 16);
            const b2 = parseInt(allPayload.substring(offset + 2, offset + 4), 16);
            if (isNaN(b1) || isNaN(b2) || (b1 === 0 && b2 === 0)) continue;
            const prefix = ["P", "C", "B", "U"][(b1 >> 6) & 0x03];
            const firstDigit = (b1 >> 4) & 0x03;
            const secondDigit = b1 & 0x0F;
            const code = `${prefix}${firstDigit}${secondDigit.toString(16).toUpperCase()}${b2.toString(16).toUpperCase().padStart(2, "0")}`;
            if (code !== "P0000" && /^[PCBU][0-3][0-9A-F]{3}$/.test(code)) {
              // تجنب التكرار
              if (!dtcs.find(d => d.code === code)) {
                dtcs.push({
                  code,
                  raw: allPayload.substring(offset, offset + 4),
                  module: moduleId,
                  moduleAr: moduleArName,
                });
              }
            }
          }
        }

        this.log(`✓ ${ecuName}: ${dtcs.length} عطل`, "received");
        return { dtcs, available: true };
      }
      this.log(`⚠ ${ecuName}: غير متاح`, "info");
      return { dtcs: [], available: false };
    } catch {
      return { dtcs: [], available: false };
    } finally {
      // إعادة Header الافتراضي (Engine ECU) وإلغاء FC overrides
      try {
        await this.sendCommand("ATH0", 500);     // Headers OFF
        await this.sendCommand("ATSH7DF", 1000); // Broadcast header (default)
        await this.sendCommand("ATFCSM0", 500);  // إلغاء Flow Control override
      } catch { /* ignore */ }
    }
  }

  /**
   * فحص جميع ECUs المعروفة
   */
    async scanAllECUs(): Promise<MultiECUScanResult> {
    if (!this.isConnected) return { engine: [], abs: [], airbag: [], bcm: [], transmission: [], available: {} };
    this.log("═══ بدء فحص جميع ECUs (دعم Ford MS-CAN) ═══", "info");
    const result: MultiECUScanResult = { engine: [], abs: [], airbag: [], bcm: [], transmission: [], available: {} };

    // Engine ECU (7E0) - HS-CAN
    const engineResult = await this.scanECU("7E0", "محرك PCM", "PCM", "وحدة التحكم بالمحرك");
    result.engine = engineResult.dtcs;
    result.available.engine = engineResult.available;

    // Transmission ECU (TCM) - فورد: 7E1 أو 7E2
    // يجب فحصه قبل ABS لأنه HS-CAN
    const tcmHeaders = [
      { h: "7E1", n: "TCM Ford (7E1)" },
      { h: "7E2", n: "TCM (7E2)" },
      { h: "7A2", n: "TCM (7A2)" },
      { h: "718", n: "TCM (718)" },
    ];
    for (const { h, n } of tcmHeaders) {
      const tcmResult = await this.scanECU(h, n, "TCM", "وحدة التحكم بالقير");
      if (tcmResult.available) {
        result.transmission = tcmResult.dtcs;
        result.available.transmission = true;
        break;
      }
    }

    // ABS/ESP ECU - فورد: 760 أو 7B0
    const absHeaders = [
      { h: "760", n: "ABS Ford (760)" },
      { h: "7B0", n: "ABS (7B0)" },
      { h: "713", n: "ABS (713)" },
      { h: "7A0", n: "ABS/TPMS (7A0)" },
      { h: "730", n: "ABS (730)" },
    ];
    for (const { h, n } of absHeaders) {
      const absResult = await this.scanECU(h, n, "ABS", "وحدة ABS");
      if (absResult.available) {
        result.abs = absResult.dtcs;
        result.available.abs = true;
        break;
      }
    }

    // Airbag/SRS ECU - فورد: 740 (RCM) - MS-CAN
    const airbagHeaders = [
      { h: "740", n: "RCM Ford Airbag (740)" },
      { h: "7D0", n: "SRS (7D0)" },
      { h: "7A8", n: "Airbag (7A8)" },
      { h: "750", n: "Airbag (750)" },
      { h: "726", n: "Airbag/BCM (726)" },
    ];
    for (const { h, n } of airbagHeaders) {
      const airbagResult = await this.scanECU(h, n, "RCM", "وحدة الوسائد الهوائية");
      if (airbagResult.available) {
        result.airbag = airbagResult.dtcs;
        result.available.airbag = true;
        break;
      }
    }

    // BCM (Body Control Module) - فورد: 726 أو 720 - MS-CAN
    const bcmHeaders = [
      { h: "726", n: "BCM Ford (726)" },
      { h: "720", n: "BCM (720)" },
      { h: "7B6", n: "BCM (7B6)" },
      { h: "7C0", n: "BCM (7C0)" },
    ];
    for (const { h, n } of bcmHeaders) {
      // تجنب تكرار header المستخدم في Airbag
      const usedAirbagHeader = result.available.airbag ?
        airbagHeaders.find(a => result.airbag.length > 0)?.h : null;
      if (h === usedAirbagHeader) continue;

      const bcmResult = await this.scanECU(h, n, "BCM", "وحدة التحكم بالهيكل");
      if (bcmResult.available) {
        result.bcm = bcmResult.dtcs;
        result.available.bcm = true;
        break;
      }
    }

    const totalDtcs = result.engine.length + result.abs.length + result.airbag.length + result.transmission.length + result.bcm.length;
    this.log(`═══ اكتمل فحص ECUs: ${totalDtcs} عطل إجمالي ═══`, "info");
    return result;
  }

  // ═══════════════════════════════════════════════════════
  // DIRECT CYLINDER MISFIRE READ (Mode 01 PID A1)
  // ═══════════════════════════════════════════════════════

  /**
   * قراءة Misfire مباشرة لكل أسطوانة (Mode 01 PID A1)
   * هذا PID يدعم حتى 12 أسطوانة
   */
  async readCylinderMisfiresDirect(): Promise<{ cyl: number; count: number; max: number }[]> {
    if (!this.isConnected) return [];
    try {
      this.log("⟳ قراءة Misfire مباشرة (PID A1)...", "info");
      const resp = await this.sendCommand("01A1", 3000);
      const cleaned = resp.replace(/[\s\r\n]/g, "").toUpperCase();

      if (cleaned.includes("NODATA") || cleaned.includes("ERROR")) {
        // محاولة بديلة: قراءة Mode 6 لكل أسطوانة
        this.log("⚠ PID A1 غير مدعوم - محاولة Mode 6...", "info");
        return await this.readCylinderMisfireMode6();
      }

      const idx41 = cleaned.indexOf("41A1");
      if (idx41 === -1) return await this.readCylinderMisfireMode6();

      const data = cleaned.substring(idx41 + 4);
      const results: { cyl: number; count: number; max: number }[] = [];

      // PID A1: كل أسطوانة = 2 bytes (16-bit counter)
      for (let i = 0; i < 12; i++) {
        const offset = i * 4;
        if (offset + 4 > data.length) break;
        const count = parseInt(data.substring(offset, offset + 4), 16);
        if (count === 0xFFFF) continue; // أسطوانة غير موجودة
        results.push({ cyl: i + 1, count, max: 100 });
      }

      this.log(`✓ تم قراءة ${results.length} أسطوانة مباشرةً`, "received");
      return results;
    } catch {
      return [];
    }
  }

  private async readCylinderMisfireMode6(): Promise<{ cyl: number; count: number; max: number }[]> {
    const mode6 = await this.readMode6Tests();
    const misfireTests = mode6.filter(t => t.component.includes("Cylinder"));
    return misfireTests.map((t, i) => ({ cyl: i + 1, count: t.value, max: t.maxLimit || 100 }));
  }

  // ═══════════════════════════════════════════════════════
  // TRANSMISSION DATA (Mode 01 PIDs)
  // ═══════════════════════════════════════════════════════

  async readTransmissionData(): Promise<TransmissionData> {
    const data: TransmissionData = { temp: null, gear: null, gearDesired: null, slipRatio: null, lockupStatus: null, oilPressure: null };
    if (!this.isConnected) return data;
    try {
      // درجة حرارة القير (PID A6)
      const tempVal = await this.readPID("01A6");
      if (tempVal !== null) data.temp = tempVal;

      // رقم الترس الفعلي (Mode 22 - مخصص للمصنع)
      try {
        const gearResp = await this.sendCommand("222002", 2000);
        const gCleaned = gearResp.replace(/[\s\r\n]/g, "").toUpperCase();
        const gIdx = gCleaned.indexOf("622002");
        if (gIdx !== -1) data.gear = parseInt(gCleaned.substring(gIdx + 6, gIdx + 8), 16);
      } catch { /* not supported */ }

      // الترس المطلوب (Mode 22)
      try {
        const gDesResp = await this.sendCommand("222001", 2000);
        const gdCleaned = gDesResp.replace(/[\s\r\n]/g, "").toUpperCase();
        const gdIdx = gdCleaned.indexOf("622001");
        if (gdIdx !== -1) data.gearDesired = parseInt(gdCleaned.substring(gdIdx + 6, gdIdx + 8), 16);
      } catch { /* not supported */ }

      this.log(`✓ بيانات القير: حرارة=${data.temp}°C ترس=${data.gear}`, "received");
    } catch (e: any) {
      this.log(`✗ خطأ بيانات القير: ${e.message}`, "error");
    }
    return data;
  }

  // ═══════════════════════════════════════════════════════
  // FUEL ECONOMY DATA
  // ═══════════════════════════════════════════════════════

  async readFuelEconomy(): Promise<FuelEconomyData> {
    const data: FuelEconomyData = { instantL100km: null, averageL100km: null, costPerKm: null, fuelPricePerLiter: 2.18, totalFuelUsed: null, range: null };
    if (!this.isConnected) return data;
    try {
      // معدل استهلاك الوقود الفوري (L/h) - PID 5E
      const fuelRateVal = await this.readPID("015E");
      const speedVal = await this.readPID("010D");

      if (fuelRateVal !== null && speedVal !== null && speedVal > 5) {
        // L/100km = (L/h) / (km/h) * 100
        data.instantL100km = (fuelRateVal / speedVal) * 100;
        data.costPerKm = (data.instantL100km / 100) * data.fuelPricePerLiter;
      }

      // مسافة منذ آخر مسح (PID 31)
      const distVal = await this.readPID("0131");
      if (distVal !== null) {
        data.totalFuelUsed = distVal; // km
        // تقدير المدى بناءً على مستوى الوقود
        const fuelLevelVal = await this.readPID("012F");
        if (fuelLevelVal !== null && data.instantL100km) {
          const tankCapacity = 60; // لتر (افتراضي)
          const remainingFuel = (fuelLevelVal / 100) * tankCapacity;
          data.range = (remainingFuel / (data.instantL100km / 100));
        }
      }

      this.log(`✓ استهلاك فوري: ${data.instantL100km?.toFixed(1)} L/100km`, "received");
    } catch (e: any) {
      this.log(`✗ خطأ بيانات الوقود: ${e.message}`, "error");
    }
    return data;
  }
  // ═══════════════════════════════════════════════════════
  // NISSAN CONSULT-III PLUS — UDS ROUTINE CONTROL
  // ═══════════════════════════════════════════════════════
  /**
   * Execute a Nissan Action Test via UDS Routine Control (0x31)
   * Uses proper ELM327 CAN header setup + UDS session management
   *
   * @param ecuHeader  - ECU CAN ID e.g. "7E0" (PCM), "740" (ABS), "746" (BCM)
   * @param cmds       - Array of hex commands WITHOUT spaces e.g. ["1003","3101020101"]
   * @param durationMs - How long to hold the ON state before sending OFF
   * @returns { success, response, log }
   */
  async executeNissanRoutine(
    ecuHeader: string,
    cmds: string[],
    durationMs: number = 2000
  ): Promise<{ success: boolean; response: string; log: string[] }> {
    const log: string[] = [];
    const send = async (cmd: string, timeout = 3000): Promise<string> => {
      // Remove ALL whitespace — critical for ELM327 compatibility
      const clean = cmd.replace(/\s+/g, "").toUpperCase();
      log.push(`>> ${clean}`);
      try {
        const resp = await this.sendCommand(clean, timeout);
        const r = resp.trim();
        log.push(`<< ${r}`);
        return r;
      } catch (e: any) {
        log.push(`!! ${e.message}`);
        throw e;
      }
    };

    if (!this.isConnected) {
      return { success: false, response: "NOT_CONNECTED", log: ["غير متصل بالجهاز"] };
    }

    try {
      // ── 1. Setup CAN headers ──────────────────────────────
      await send("ATH1", 1000);          // Headers ON (required for ATSH)
      await send("ATSH" + ecuHeader, 1000); // Set target ECU header
      // Flow control for multi-frame ISO-TP responses
      await send("ATFCSH" + ecuHeader, 1000);
      await send("ATFCSD300000", 1000);  // FC data: BS=0x30, ST=0x00, WFT=0x00
      await send("ATFCSM1", 1000);       // FC mode: send FC frames

      // ── 2. Open UDS Extended Diagnostic Session ───────────
      const sessResp = await send("1003", 3000); // DiagnosticSessionControl 0x03
      if (sessResp.includes("7F10") || sessResp.includes("NO DATA") || sessResp.includes("ERROR")) {
        // Some ECUs need programming session 0x02 first
        await send("1002", 2000);
        await send("1003", 3000);
      }

      // ── 3. Execute commands ───────────────────────────────
      let lastResp = "";
      for (const cmd of cmds) {
        const clean = cmd.replace(/\s+/g, "").toUpperCase();
        lastResp = await send(clean, 4000);
        await new Promise(r => setTimeout(r, 150));
      }

      // ── 4. Check response ─────────────────────────────────
      // Positive response for RoutineControl (31) = 71 xx xx
      // Negative response = 7F 31 xx
      const isPositive = lastResp.replace(/\s/g, "").toUpperCase().includes("71") ||
                         lastResp.includes("OK");
      const isNegative = lastResp.replace(/\s/g, "").toUpperCase().includes("7F31") ||
                         lastResp.includes("NO DATA") ||
                         lastResp.includes("ERROR");

      return {
        success: isPositive || (!isNegative && lastResp.length > 0),
        response: lastResp,
        log,
      };
    } catch (e: any) {
      return { success: false, response: e.message, log };
    } finally {
      // ── 5. Restore defaults ───────────────────────────────
      try {
        await this.sendCommand("ATH0", 500);   // Headers OFF
        await this.sendCommand("ATSH7DF", 500); // Default broadcast header
        await this.sendCommand("ATFCSM0", 500); // FC mode off
      } catch { /* ignore cleanup errors */ }
    }
  }




  // ═══════════════════════════════════════════════════════════════════════════
  // executeFordRoutine — Ford EEC-V (J2190) Output Test Mode
  // Supports both FORD_EEC5 (C410 header) and UDS (7E0 header) protocols
  // ═══════════════════════════════════════════════════════════════════════════
  async executeFordRoutine(
    protocol: "FORD_EEC5" | "UDS",
    ecuHeader: string,
    initCmds: string[],
    actionCmd: string,
    exitCmd: string,
    durationMs: number = 2000
  ): Promise<{ success: boolean; response: string; log: string[] }> {
    const log: string[] = [];
    const send = async (cmd: string, timeout = 3000): Promise<string> => {
      const clean = cmd.replace(/\s+/g, "").toUpperCase();
      log.push(`>> ${clean}`);
      try {
        const resp = await this.sendCommand(clean, timeout);
        const r = (resp || "").trim();
        log.push(`<< ${r}`);
        return r;
      } catch (e: any) {
        log.push(`!! ${e.message}`);
        throw e;
      }
    };

    if (!this.isConnected) {
      return { success: false, response: "NOT_CONNECTED", log: ["غير متصل بالجهاز"] };
    }

    try {
      if (protocol === "FORD_EEC5") {
        // ── Ford EEC-V (J2190) Output Test Mode ──────────────────────────────
        await send("ATH1", 1000);
        await send("ATSH" + ecuHeader, 1000);
        for (const cmd of initCmds) {
          const r = await send(cmd, 3000);
          await new Promise(res => setTimeout(res, 200));
          if (r.includes("NO DATA") || r.includes("ERROR")) {
            await new Promise(res => setTimeout(res, 500));
            await send(cmd, 3000);
          }
        }
        const actionResp = await send(actionCmd, 4000);
        if (durationMs > 0) {
          await new Promise(res => setTimeout(res, Math.min(durationMs, 30000)));
        }
        await send(exitCmd, 2000);
        const isNegative = actionResp.includes("NO DATA") ||
                           actionResp.includes("ERROR") ||
                           actionResp === "?" ||
                           actionResp === "";
        return { success: !isNegative, response: actionResp, log };
      } else {
        // ── UDS Mode 2F (InputOutputControlByIdentifier) ─────────────────────
        await send("ATH1", 1000);
        await send("ATSH" + ecuHeader, 1000);
        await send("ATFCSH" + ecuHeader, 1000);
        await send("ATFCSD300000", 1000);
        await send("ATFCSM1", 1000);
        for (const cmd of initCmds) {
          await send(cmd, 3000);
          await new Promise(res => setTimeout(res, 150));
        }
        const actionResp = await send(actionCmd, 4000);
        if (durationMs > 0) {
          await new Promise(res => setTimeout(res, Math.min(durationMs, 10000)));
        }
        await send(exitCmd, 2000);
        const clean = actionResp.replace(/\s/g, "").toUpperCase();
        const isPositive = clean.startsWith("6F") || clean.includes("6F");
        const isNegative = clean.includes("7F2F") ||
                           actionResp.includes("NO DATA") ||
                           actionResp.includes("ERROR");
        return {
          success: isPositive || (!isNegative && actionResp.length > 0),
          response: actionResp,
          log,
        };
      }
    } catch (e: any) {
      return { success: false, response: e.message, log };
    } finally {
      try {
        await this.sendCommand("ATH0", 500);
        await this.sendCommand("ATSH7DF", 500);
        await this.sendCommand("ATFCSM0", 500);
      } catch { /* ignore cleanup */ }
    }
  }

}

// ═══════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════

export const obdService = new OBDBleService();
