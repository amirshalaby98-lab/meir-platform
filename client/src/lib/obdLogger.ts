/**
 * OBD2 Professional Logger - نظام تسجيل احترافي
 * ═══════════════════════════════════════════════════════
 * يسجل كل عملية BLE/OBD مع:
 * - Timestamp دقيق
 * - اسم الجهاز + RSSI
 * - الأمر المرسل + الرد
 * - مدة التنفيذ (ms)
 * - نوع الخطأ إن وجد
 * 
 * @version 1.0.0
 * @author مير - Meir Diagnostics
 */

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

export type LogLevel = "debug" | "info" | "warn" | "error" | "critical";

export interface OBDLogEntry {
  id: number;
  timestamp: number;
  level: LogLevel;
  category: "ble" | "command" | "response" | "protocol" | "connection" | "system";
  message: string;
  details?: {
    device?: string;
    rssi?: number;
    uuid?: string;
    command?: string;
    response?: string;
    duration?: number;
    error?: string;
    protocol?: string;
    bytesSent?: number;
    bytesReceived?: number;
  };
}

export interface LoggerConfig {
  maxEntries: number;
  minLevel: LogLevel;
  enableConsole: boolean;
  enableExport: boolean;
}

// ═══════════════════════════════════════════════════════
// LOGGER CLASS
// ═══════════════════════════════════════════════════════

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4,
};

export class OBDLogger {
  private entries: OBDLogEntry[] = [];
  private idCounter: number = 0;
  private config: LoggerConfig;
  private sessionStart: number;
  private _onNewEntry: ((entry: OBDLogEntry) => void) | null = null;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      maxEntries: 500,
      minLevel: "info",
      enableConsole: false,
      enableExport: true,
      ...config,
    };
    this.sessionStart = Date.now();
  }

  // ═══ Configuration ═══
  set onNewEntry(cb: ((entry: OBDLogEntry) => void) | null) { this._onNewEntry = cb; }
  get logEntries(): OBDLogEntry[] { return [...this.entries]; }
  get entryCount(): number { return this.entries.length; }

  setLevel(level: LogLevel): void { this.config.minLevel = level; }

  // ═══ Logging Methods ═══

  /** تسجيل أمر مرسل */
  command(cmd: string, device?: string): number {
    const entry = this.addEntry("info", "command", `>> ${cmd}`, { command: cmd, device });
    return entry.id;
  }

  /** تسجيل رد مستلم مع ربطه بالأمر */
  response(cmd: string, resp: string, durationMs: number, device?: string): void {
    const truncated = resp.length > 100 ? resp.substring(0, 100) + "..." : resp;
    this.addEntry("info", "response", `<< ${truncated} (${durationMs}ms)`, {
      command: cmd,
      response: resp,
      duration: durationMs,
      device,
      bytesReceived: resp.length,
    });
  }

  /** تسجيل اتصال BLE */
  connection(action: "scanning" | "connecting" | "connected" | "disconnected" | "reconnecting", device?: string, rssi?: number, uuid?: string): void {
    const messages: Record<string, string> = {
      scanning: "🔍 جاري البحث عن أجهزة...",
      connecting: `⟳ جاري الاتصال${device ? ` بـ ${device}` : ""}...`,
      connected: `✓ متصل${device ? ` بـ ${device}` : ""}${rssi ? ` (RSSI: ${rssi})` : ""}`,
      disconnected: "✗ تم قطع الاتصال",
      reconnecting: "↻ إعادة اتصال تلقائي...",
    };
    this.addEntry(
      action === "disconnected" ? "warn" : "info",
      "connection",
      messages[action],
      { device, rssi, uuid }
    );
  }

  /** تسجيل بروتوكول */
  protocol(action: string, protocol?: string): void {
    this.addEntry("info", "protocol", action, { protocol });
  }

  /** تسجيل خطأ */
  error(message: string, details?: { command?: string; error?: string; device?: string }): void {
    this.addEntry("error", "system", `✗ ${message}`, details);
  }

  /** تسجيل خطأ حرج */
  critical(message: string, details?: { command?: string; error?: string }): void {
    this.addEntry("critical", "system", `🚨 ${message}`, details);
  }

  /** تسجيل معلومة عامة */
  info(message: string): void {
    this.addEntry("info", "system", message);
  }

  /** تسجيل تحذير */
  warn(message: string, details?: { command?: string }): void {
    this.addEntry("warn", "system", `⚠ ${message}`, details);
  }

  /** تسجيل debug */
  debug(message: string, details?: Record<string, unknown>): void {
    this.addEntry("debug", "system", message, details as any);
  }

  // ═══ Export & Analysis ═══

  /** تصدير السجل كنص */
  exportAsText(): string {
    const lines = this.entries.map(e => {
      const time = new Date(e.timestamp).toLocaleTimeString("ar-SA", { hour12: false });
      const dur = e.details?.duration ? ` [${e.details.duration}ms]` : "";
      return `[${time}] [${e.level.toUpperCase()}] ${e.message}${dur}`;
    });
    return lines.join("\n");
  }

  /** تصدير السجل كـ JSON */
  exportAsJSON(): string {
    return JSON.stringify({
      sessionStart: this.sessionStart,
      sessionDuration: Date.now() - this.sessionStart,
      totalEntries: this.entries.length,
      errors: this.entries.filter(e => e.level === "error" || e.level === "critical").length,
      entries: this.entries,
    }, null, 2);
  }

  /** إحصائيات الجلسة */
  getStats(): { total: number; errors: number; avgResponseTime: number; sessionDuration: number } {
    const responses = this.entries.filter(e => e.category === "response" && e.details?.duration);
    const avgTime = responses.length > 0
      ? Math.round(responses.reduce((sum, e) => sum + (e.details?.duration || 0), 0) / responses.length)
      : 0;
    return {
      total: this.entries.length,
      errors: this.entries.filter(e => e.level === "error" || e.level === "critical").length,
      avgResponseTime: avgTime,
      sessionDuration: Date.now() - this.sessionStart,
    };
  }

  /** مسح السجل */
  clear(): void {
    this.entries = [];
    this.idCounter = 0;
    this.sessionStart = Date.now();
  }

  // ═══ Internal ═══

  private addEntry(
    level: LogLevel,
    category: OBDLogEntry["category"],
    message: string,
    details?: OBDLogEntry["details"]
  ): OBDLogEntry {
    if (LOG_LEVELS[level] < LOG_LEVELS[this.config.minLevel]) {
      return { id: -1, timestamp: 0, level, category, message };
    }

    const entry: OBDLogEntry = {
      id: ++this.idCounter,
      timestamp: Date.now(),
      level,
      category,
      message,
      details,
    };

    this.entries.push(entry);

    // حافظ على الحد الأقصى
    if (this.entries.length > this.config.maxEntries) {
      this.entries = this.entries.slice(-this.config.maxEntries);
    }

    // Console output (development)
    if (this.config.enableConsole) {
      const prefix = `[OBD ${level.toUpperCase()}]`;
      if (level === "error" || level === "critical") {
        console.error(prefix, message, details || "");
      } else if (level === "warn") {
        console.warn(prefix, message, details || "");
      } else {
        console.log(prefix, message, details || "");
      }
    }

    this._onNewEntry?.(entry);
    return entry;
  }
}

// ═══ Singleton Instance ═══
export const obdLogger = new OBDLogger();
