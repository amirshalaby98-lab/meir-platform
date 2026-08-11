/**
 * Scanner Controller - طبقة وسيطة لإدارة دورة حياة الفحص
 * ═══════════════════════════════════════════════════════
 * تدير: اتصال → تهيئة → قراءة → تحليل → فصل
 * تبسط التفاعل بين UI و obdBleService
 * 
 * @version 1.0.0
 * @author مير - Meir Diagnostics
 */

import { OBDBleService } from "./obdBleService";
import { obdLogger, OBDLogger } from "./obdLogger";
import type { OBDLiveData, OBDDTCCode, ConnectionStatus, LogType } from "./obdBleService";

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

export type ScanPhase = "idle" | "connecting" | "initializing" | "reading" | "analyzing" | "complete" | "error";

export interface ScanSession {
  id: string;
  startTime: number;
  endTime?: number;
  phase: ScanPhase;
  deviceName?: string;
  protocol?: string;
  vin?: string;
  make?: string;
  liveData: Partial<OBDLiveData>;
  dtcCodes: OBDDTCCode[];
  pendingDtcs: OBDDTCCode[];
  readinessTests: Record<string, string>;
  errors: Array<{ timestamp: number; message: string }>;
}

export interface ScannerState {
  phase: ScanPhase;
  connectionStatus: ConnectionStatus;
  isReading: boolean;
  currentSession: ScanSession | null;
  lastError: string | null;
}

export interface ScannerCallbacks {
  onPhaseChange?: (phase: ScanPhase) => void;
  onConnectionChange?: (status: ConnectionStatus) => void;
  onLiveData?: (data: Partial<OBDLiveData>) => void;
  onDTCsRead?: (dtcs: OBDDTCCode[], pending: OBDDTCCode[]) => void;
  onError?: (message: string) => void;
  onLog?: (message: string, type: LogType) => void;
}

// ═══════════════════════════════════════════════════════
// SCANNER CONTROLLER
// ═══════════════════════════════════════════════════════

export class ScannerController {
  private service: OBDBleService;
  private logger: OBDLogger;
  private state: ScannerState;
  private callbacks: ScannerCallbacks = {};
  private readInterval: ReturnType<typeof setInterval> | null = null;

  constructor(service: OBDBleService) {
    this.service = service;
    this.logger = obdLogger;
    this.state = {
      phase: "idle",
      connectionStatus: "disconnected",
      isReading: false,
      currentSession: null,
      lastError: null,
    };
  }

  // ═══ Getters ═══
  get currentPhase(): ScanPhase { return this.state.phase; }
  get isConnected(): boolean { return this.service.isConnected; }
  get isReading(): boolean { return this.state.isReading; }
  get session(): ScanSession | null { return this.state.currentSession; }
  get obdService(): OBDBleService { return this.service; }

  // ═══ Configuration ═══
  setCallbacks(callbacks: ScannerCallbacks): void {
    this.callbacks = callbacks;
    // Wire service callbacks
    this.service.onLog = (msg, type) => {
      this.callbacks.onLog?.(msg, type);
    };
    this.service.onStatusChange = (status) => {
      this.state.connectionStatus = status;
      this.callbacks.onConnectionChange?.(status);
    };
    this.service.onDisconnect = () => {
      this.setPhase("idle");
      this.stopReading();
      this.callbacks.onConnectionChange?.("disconnected");
    };
  }

  // ═══ Connection Flow ═══

  /** اتصال بجهاز OBD عبر Bluetooth */
  async connect(): Promise<boolean> {
    this.setPhase("connecting");
    this.logger.connection("connecting");

    const startTime = Date.now();
    const success = await this.service.connect();

    if (success) {
      this.logger.connection("connected", this.service.deviceName || undefined);
      this.setPhase("idle");
      this.startNewSession();
      return true;
    } else {
      this.logger.error("فشل الاتصال");
      this.setPhase("error");
      this.state.lastError = "فشل الاتصال بالجهاز";
      this.callbacks.onError?.("فشل الاتصال بالجهاز");
      return false;
    }
  }

  /** فصل الاتصال */
  disconnect(): void {
    this.stopReading();
    this.service.disconnect();
    this.endSession();
    this.setPhase("idle");
    this.logger.connection("disconnected");
  }

  // ═══ Reading Flow ═══

  /** بدء القراءة الحية */
  startReading(intervalMs: number = 1000): void {
    if (!this.isConnected) return;
    this.state.isReading = true;
    this.setPhase("reading");

    this.readInterval = setInterval(async () => {
      try {
        const data = await this.service.readLiveData();
        if (this.state.currentSession) {
          this.state.currentSession.liveData = data;
        }
        this.callbacks.onLiveData?.(data);
      } catch (e: any) {
        this.logger.error(`خطأ قراءة: ${e.message}`);
      }
    }, intervalMs);
  }

  /** إيقاف القراءة الحية */
  stopReading(): void {
    this.state.isReading = false;
    if (this.readInterval) {
      clearInterval(this.readInterval);
      this.readInterval = null;
    }
    if (this.state.phase === "reading") {
      this.setPhase("idle");
    }
  }

  // ═══ DTC Flow ═══

  /** قراءة أكواد الأعطال */
  async readDTCs(): Promise<{ confirmed: OBDDTCCode[]; pending: OBDDTCCode[] }> {
    if (!this.isConnected) return { confirmed: [], pending: [] };

    const confirmed = await this.service.readDTCs();
    const pending = await this.service.readPendingDTCs();

    if (this.state.currentSession) {
      this.state.currentSession.dtcCodes = confirmed;
      this.state.currentSession.pendingDtcs = pending;
    }

    this.callbacks.onDTCsRead?.(confirmed, pending);
    return { confirmed, pending };
  }

  /** مسح أكواد الأعطال */
  async clearDTCs(): Promise<boolean> {
    if (!this.isConnected) return false;
    return await this.service.clearDTCs();
  }

  // ═══ Full Scan Flow ═══

  /** فحص شامل: DTC + Readiness + VIN */
  async runFullScan(): Promise<ScanSession | null> {
    if (!this.isConnected) return null;
    this.setPhase("reading");

    try {
      // 1. قراءة DTC
      const { confirmed, pending } = await this.readDTCs();

      // 2. قراءة Readiness
      const readiness = await this.service.readReadiness();
      if (this.state.currentSession) {
        this.state.currentSession.readinessTests = readiness;
      }

      // 3. قراءة VIN
      const vin = await this.service.readVIN();
      if (this.state.currentSession && vin) {
        this.state.currentSession.vin = vin;
      }

      this.setPhase("complete");
      return this.state.currentSession;
    } catch (e: any) {
      this.logger.error(`فشل الفحص الشامل: ${e.message}`);
      this.setPhase("error");
      this.state.lastError = e.message;
      this.callbacks.onError?.(e.message);
      return null;
    }
  }

  // ═══ Session Management ═══

  private startNewSession(): void {
    this.state.currentSession = {
      id: Date.now().toString(36),
      startTime: Date.now(),
      phase: "idle",
      deviceName: this.service.deviceName || undefined,
      protocol: this.service.detectedProtocol || undefined,
      liveData: {},
      dtcCodes: [],
      pendingDtcs: [],
      readinessTests: {},
      errors: [],
    };
  }

  private endSession(): void {
    if (this.state.currentSession) {
      this.state.currentSession.endTime = Date.now();
      this.state.currentSession.phase = "complete";
    }
  }

  // ═══ Internal ═══

  private setPhase(phase: ScanPhase): void {
    this.state.phase = phase;
    if (this.state.currentSession) {
      this.state.currentSession.phase = phase;
    }
    this.callbacks.onPhaseChange?.(phase);
  }

  /** تنظيف جميع الموارد */
  cleanup(): void {
    this.stopReading();
    if (this.isConnected) {
      this.service.disconnect();
    }
    this.service.onLog = null;
    this.service.onStatusChange = null;
    this.service.onDisconnect = null;
    this.service.onAlert = null;
    this.service.onError = null;
    this.state.currentSession = null;
    this.logger.info("تم تنظيف ScannerController");
  }
}
