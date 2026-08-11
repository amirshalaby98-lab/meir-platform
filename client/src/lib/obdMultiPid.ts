/**
 * OBD-II Multi-PID Request & Auto-Reconnect & Live Charts
 * ═══════════════════════════════════════════════════════
 * 
 * Features:
 * - Multi-PID request (read up to 6 PIDs in one command)
 * - Auto-reconnect on disconnect with exponential backoff
 * - Live chart data buffer for real-time graphing
 * - Smart PID rotation for slow protocols
 * 
 * @version 1.0.0
 */

import type { OBDBleService, OBDLiveData } from "./obdBleService";

// ═══════════════════════════════════════════════════════
// MULTI-PID REQUEST
// ═══════════════════════════════════════════════════════

/**
 * Multi-PID request - CAN protocols support reading up to 6 PIDs at once
 * Command format: "01" + PID1 + PID2 + PID3 + ... (max 6)
 * Response: "41" + PID1 + DATA1 + PID2 + DATA2 + ...
 * 
 * This is 3-6x faster than reading each PID individually
 */
export interface MultiPIDGroup {
  name: string;
  nameAr: string;
  pids: string[]; // Array of PID codes (e.g., ["0C", "0D", "05"])
  keys: (keyof OBDLiveData)[]; // Corresponding keys in OBDLiveData
}

// Predefined groups for efficient reading
export const PID_GROUPS: MultiPIDGroup[] = [
  {
    name: "Core Engine",
    nameAr: "المحرك الأساسي",
    pids: ["0C", "0D", "05", "04", "11", "0F"],
    keys: ["rpm", "speed", "coolantTemp", "engineLoad", "throttlePos", "intakeTemp"],
  },
  {
    name: "Fuel System",
    nameAr: "نظام الوقود",
    pids: ["06", "07", "0A", "2F", "10", "0E"],
    keys: ["shortFuelTrim", "longFuelTrim", "fuelPressure", "fuelLevel", "mafRate", "timingAdvance"],
  },
  {
    name: "Secondary",
    nameAr: "ثانوي",
    pids: ["42", "5C", "46", "1F", "2F", "0E"],
    keys: ["voltage", "oilTemp", "ambientTemp", "runTime", "fuelLevel", "timingAdvance"],
  },
];

/**
 * Build a multi-PID command string
 * Only works on CAN protocols (6, 7, 8, 9)
 */
export function buildMultiPIDCommand(pids: string[]): string {
  // CAN supports max 6 PIDs per request
  const limited = pids.slice(0, 6);
  return "01" + limited.join("");
}

/**
 * Parse multi-PID response
 * Response format: "41" + PID1 + DATA1 + PID2 + DATA2 + ...
 */
export function parseMultiPIDResponse(response: string, requestedPids: string[]): Map<string, number[]> {
  const results = new Map<string, number[]>();
  
  // Clean response
  const cleaned = response.replace(/[\s\r\n>]/g, "").toUpperCase();
  
  // Find "41" response marker
  const idx = cleaned.indexOf("41");
  if (idx === -1) return results;
  
  let pos = idx + 2; // Skip "41"
  
  // Parse each PID response
  while (pos < cleaned.length - 1) {
    const pidByte = cleaned.substring(pos, pos + 2);
    pos += 2;
    
    // Find which requested PID this matches
    const matchedPid = requestedPids.find(p => p.toUpperCase() === pidByte);
    if (!matchedPid) break;
    
    // Determine data length based on PID
    const dataLen = getPIDDataLength(pidByte);
    const dataBytes: number[] = [];
    
    for (let i = 0; i < dataLen; i++) {
      if (pos + 2 > cleaned.length) break;
      const byte = parseInt(cleaned.substring(pos, pos + 2), 16);
      if (!isNaN(byte)) dataBytes.push(byte);
      pos += 2;
    }
    
    if (dataBytes.length > 0) {
      results.set(pidByte, dataBytes);
    }
  }
  
  return results;
}

/**
 * Get expected data length for a PID
 */
function getPIDDataLength(pid: string): number {
  const twoBytesPids = new Set(["0C", "10", "42", "1F", "21", "31", "34", "3C", "3E"]);
  const fourBytesPids = new Set(["02"]);
  
  if (fourBytesPids.has(pid.toUpperCase())) return 4;
  if (twoBytesPids.has(pid.toUpperCase())) return 2;
  return 1;
}

// ═══════════════════════════════════════════════════════
// AUTO-RECONNECT
// ═══════════════════════════════════════════════════════

export interface ReconnectConfig {
  enabled: boolean;
  maxAttempts: number;
  baseDelay: number; // ms
  maxDelay: number; // ms
  backoffMultiplier: number;
}

export const DEFAULT_RECONNECT_CONFIG: ReconnectConfig = {
  enabled: true,
  maxAttempts: 5,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
};

export class AutoReconnect {
  private config: ReconnectConfig;
  private attempts: number = 0;
  private timer: NodeJS.Timeout | null = null;
  private _isReconnecting: boolean = false;
  private _onAttempt: ((attempt: number, maxAttempts: number) => void) | null = null;
  private _onSuccess: (() => void) | null = null;
  private _onFailed: (() => void) | null = null;

  constructor(config: Partial<ReconnectConfig> = {}) {
    this.config = { ...DEFAULT_RECONNECT_CONFIG, ...config };
  }

  get isReconnecting(): boolean { return this._isReconnecting; }
  
  set onAttempt(cb: ((attempt: number, maxAttempts: number) => void) | null) { this._onAttempt = cb; }
  set onSuccess(cb: (() => void) | null) { this._onSuccess = cb; }
  set onFailed(cb: (() => void) | null) { this._onFailed = cb; }

  /**
   * Start reconnection process
   * @param connectFn - The function that performs the actual connection
   */
  async start(connectFn: () => Promise<boolean>): Promise<boolean> {
    if (!this.config.enabled || this._isReconnecting) return false;
    
    this._isReconnecting = true;
    this.attempts = 0;

    while (this.attempts < this.config.maxAttempts) {
      this.attempts++;
      this._onAttempt?.(this.attempts, this.config.maxAttempts);

      try {
        const success = await connectFn();
        if (success) {
          this._isReconnecting = false;
          this.attempts = 0;
          this._onSuccess?.();
          return true;
        }
      } catch {
        // Connection failed, will retry
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        this.config.baseDelay * Math.pow(this.config.backoffMultiplier, this.attempts - 1),
        this.config.maxDelay
      );

      await new Promise(resolve => {
        this.timer = setTimeout(resolve, delay);
      });
    }

    this._isReconnecting = false;
    this._onFailed?.();
    return false;
  }

  /**
   * Cancel ongoing reconnection
   */
  cancel(): void {
    this._isReconnecting = false;
    this.attempts = 0;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * Reset attempt counter (call on successful manual connect)
   */
  reset(): void {
    this.attempts = 0;
  }
}

// ═══════════════════════════════════════════════════════
// LIVE CHART DATA BUFFER
// ═══════════════════════════════════════════════════════

export interface ChartDataPoint {
  timestamp: number;
  value: number;
}

export interface ChartSeries {
  key: keyof OBDLiveData;
  name: string;
  nameAr: string;
  unit: string;
  color: string;
  data: ChartDataPoint[];
  min: number;
  max: number;
  current: number;
  avg: number;
}

export class LiveChartBuffer {
  private buffers: Map<string, ChartDataPoint[]> = new Map();
  private maxPoints: number;
  private startTime: number;

  constructor(maxPoints: number = 300) { // 5 minutes at 1Hz
    this.maxPoints = maxPoints;
    this.startTime = Date.now();
  }

  /**
   * Add a data point for a parameter
   */
  push(key: string, value: number): void {
    if (!this.buffers.has(key)) {
      this.buffers.set(key, []);
    }
    
    const buffer = this.buffers.get(key)!;
    buffer.push({ timestamp: Date.now() - this.startTime, value });
    
    // Trim if exceeds max
    if (buffer.length > this.maxPoints) {
      buffer.shift();
    }
  }

  /**
   * Get chart data for a parameter
   */
  getData(key: string): ChartDataPoint[] {
    return this.buffers.get(key) || [];
  }

  /**
   * Get statistics for a parameter
   */
  getStats(key: string): { min: number; max: number; avg: number; current: number } {
    const data = this.buffers.get(key) || [];
    if (data.length === 0) return { min: 0, max: 0, avg: 0, current: 0 };
    
    let min = Infinity, max = -Infinity, sum = 0;
    for (const point of data) {
      if (point.value < min) min = point.value;
      if (point.value > max) max = point.value;
      sum += point.value;
    }
    
    return {
      min,
      max,
      avg: sum / data.length,
      current: data[data.length - 1].value,
    };
  }

  /**
   * Get all series for chart display
   */
  getAllSeries(): ChartSeries[] {
    const seriesConfig: Array<{ key: keyof OBDLiveData; name: string; nameAr: string; unit: string; color: string }> = [
      { key: "rpm", name: "RPM", nameAr: "دورات المحرك", unit: "rpm", color: "#ef4444" },
      { key: "speed", name: "Speed", nameAr: "السرعة", unit: "km/h", color: "#3b82f6" },
      { key: "coolantTemp", name: "Coolant Temp", nameAr: "حرارة المحرك", unit: "°C", color: "#f97316" },
      { key: "engineLoad", name: "Engine Load", nameAr: "حمل المحرك", unit: "%", color: "#8b5cf6" },
      { key: "throttlePos", name: "Throttle", nameAr: "الخنق", unit: "%", color: "#10b981" },
      { key: "voltage", name: "Voltage", nameAr: "الجهد", unit: "V", color: "#eab308" },
      { key: "mafRate", name: "MAF", nameAr: "MAF", unit: "g/s", color: "#06b6d4" },
      { key: "shortFuelTrim", name: "Short FT", nameAr: "Short FT", unit: "%", color: "#ec4899" },
      { key: "longFuelTrim", name: "Long FT", nameAr: "Long FT", unit: "%", color: "#14b8a6" },
      { key: "oilTemp", name: "Oil Temp", nameAr: "حرارة الزيت", unit: "°C", color: "#f59e0b" },
      { key: "fuelPressure", name: "Fuel Pressure", nameAr: "ضغط الوقود", unit: "kPa", color: "#6366f1" },
      { key: "timingAdvance", name: "Timing", nameAr: "الإشعال", unit: "°", color: "#84cc16" },
    ];

    return seriesConfig
      .filter(cfg => this.buffers.has(cfg.key) && (this.buffers.get(cfg.key)?.length || 0) > 0)
      .map(cfg => {
        const stats = this.getStats(cfg.key);
        return {
          ...cfg,
          data: this.getData(cfg.key),
          ...stats,
        };
      });
  }

  /**
   * Clear all buffers
   */
  clear(): void {
    this.buffers.clear();
    this.startTime = Date.now();
  }

  /**
   * Get elapsed time in seconds
   */
  get elapsed(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Get total data points across all buffers
   */
  get totalPoints(): number {
    let total = 0;
    this.buffers.forEach(buffer => { total += buffer.length; });
    return total;
  }

  /**
   * Export buffer data as CSV
   */
  exportCSV(): string {
    const keys = Array.from(this.buffers.keys());
    if (keys.length === 0) return "";
    
    // Header
    let csv = "timestamp_ms," + keys.join(",") + "\n";
    
    // Find all unique timestamps
    const allTimestamps = new Set<number>();
    this.buffers.forEach(buffer => {
      buffer.forEach(point => allTimestamps.add(point.timestamp));
    });
    
    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);
    
    // Build rows
    for (const ts of sortedTimestamps) {
      const row: string[] = [ts.toString()];
      for (const key of keys) {
        const buffer = this.buffers.get(key) || [];
        const point = buffer.find(p => p.timestamp === ts);
        row.push(point ? point.value.toFixed(2) : "");
      }
      csv += row.join(",") + "\n";
    }
    
    return csv;
  }
}

// ═══════════════════════════════════════════════════════
// SMART PID ROTATION (for slow protocols)
// ═══════════════════════════════════════════════════════

/**
 * On slow protocols (J1850, ISO 9141), we can't read all PIDs every cycle.
 * This rotates through PID groups to maintain responsiveness.
 * 
 * Priority levels:
 * - HIGH: Read every cycle (RPM, Speed, Coolant Temp)
 * - MEDIUM: Read every 2nd cycle (Load, Throttle, Fuel Trim)
 * - LOW: Read every 5th cycle (Oil Temp, Voltage, MAF)
 */
export interface PIDPriority {
  pid: string;
  key: keyof OBDLiveData;
  priority: "high" | "medium" | "low";
  interval: number; // Read every N cycles
}

export const PID_PRIORITIES: PIDPriority[] = [
  // HIGH - every cycle
  { pid: "010C", key: "rpm", priority: "high", interval: 1 },
  { pid: "010D", key: "speed", priority: "high", interval: 1 },
  { pid: "0105", key: "coolantTemp", priority: "high", interval: 1 },
  // MEDIUM - every 2 cycles
  { pid: "0104", key: "engineLoad", priority: "medium", interval: 2 },
  { pid: "0111", key: "throttlePos", priority: "medium", interval: 2 },
  { pid: "0106", key: "shortFuelTrim", priority: "medium", interval: 2 },
  { pid: "0107", key: "longFuelTrim", priority: "medium", interval: 2 },
  { pid: "010F", key: "intakeTemp", priority: "medium", interval: 2 },
  // LOW - every 5 cycles
  { pid: "0142", key: "voltage", priority: "low", interval: 5 },
  { pid: "015C", key: "oilTemp", priority: "low", interval: 5 },
  { pid: "0110", key: "mafRate", priority: "low", interval: 5 },
  { pid: "010A", key: "fuelPressure", priority: "low", interval: 5 },
  { pid: "012F", key: "fuelLevel", priority: "low", interval: 5 },
  { pid: "010E", key: "timingAdvance", priority: "low", interval: 5 },
  { pid: "0146", key: "ambientTemp", priority: "low", interval: 5 },
];

/**
 * Get PIDs to read for the current cycle
 */
export function getPIDsForCycle(cycle: number, supportedPIDs: Set<string>): PIDPriority[] {
  return PID_PRIORITIES.filter(p => {
    // Check if PID is supported
    if (!supportedPIDs.has(p.pid.toUpperCase()) && !supportedPIDs.has(p.pid)) return false;
    // Check if this cycle should read this PID
    return cycle % p.interval === 0;
  });
}
