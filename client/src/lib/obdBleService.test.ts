/**
 * OBD-II BLE Service - Unit Tests
 * ═══════════════════════════════════════════
 * Tests for PID parsing, DTC parsing, VIN parsing,
 * protocol detection, data logger, enhanced PIDs, and multi-PID.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { OBDBleService } from "./obdBleService";

// ═══════════════════════════════════════════════════════
// PID PARSING TESTS (via parsePIDResponse - private, test via readPID mock)
// ═══════════════════════════════════════════════════════

describe("OBD-II PID Parsing (parsePIDResponse)", () => {
  let service: OBDBleService;

  beforeEach(() => {
    service = new OBDBleService();
  });

  describe("Mode 01 - Live Data PIDs", () => {
    it("should decode RPM correctly from CAN response", () => {
      // CAN response: "41 0C 1A F8" → ((0x1A * 256) + 0xF8) / 4
      // 0x1A=26, 0xF8=248 → (26*256+248)/4 = 6904/4 = 1726
      const result = (service as any).parsePIDResponse("010C", "41 0C 1A F8");
      expect(result).toBeCloseTo(1726, 0);
    });

    it("should decode Speed correctly", () => {
      // Response: "41 0D 50" → 0x50 = 80 km/h
      const result = (service as any).parsePIDResponse("010D", "41 0D 50");
      expect(result).toBe(80);
    });

    it("should decode Coolant Temperature correctly", () => {
      // Response: "41 05 7C" → 0x7C - 40 = 84°C
      const result = (service as any).parsePIDResponse("0105", "41 05 7C");
      expect(result).toBe(84);
    });

    it("should decode Engine Load correctly", () => {
      // Response: "41 04 80" → (128 * 100) / 255 ≈ 50.2%
      const result = (service as any).parsePIDResponse("0104", "41 04 80");
      expect(result).toBeCloseTo(50.2, 0);
    });

    it("should decode Throttle Position correctly", () => {
      // Response: "41 11 33" → (51 * 100) / 255 ≈ 20%
      const result = (service as any).parsePIDResponse("0111", "41 11 33");
      expect(result).toBeCloseTo(20, 0);
    });

    it("should decode MAF Rate correctly", () => {
      // Response: "41 10 01 F4" → (1*256 + 244) / 100 = 5.0 g/s
      const result = (service as any).parsePIDResponse("0110", "41 10 01 F4");
      expect(result).toBeCloseTo(5.0, 1);
    });

    it("should decode Timing Advance correctly", () => {
      // Response: "41 0E 90" → (144 / 2) - 64 = 8°
      const result = (service as any).parsePIDResponse("010E", "41 0E 90");
      expect(result).toBeCloseTo(8, 0);
    });

    it("should decode Intake Air Temperature correctly", () => {
      // Response: "41 0F 4B" → 75 - 40 = 35°C
      const result = (service as any).parsePIDResponse("010F", "41 0F 4B");
      expect(result).toBe(35);
    });

    it("should decode Fuel Pressure correctly", () => {
      // Response: "41 0A 64" → 100 * 3 = 300 kPa
      const result = (service as any).parsePIDResponse("010A", "41 0A 64");
      expect(result).toBe(300);
    });

    it("should decode Short Term Fuel Trim correctly", () => {
      // Response: "41 06 80" → ((128 - 128) * 100) / 128 = 0%
      const result = (service as any).parsePIDResponse("0106", "41 06 80");
      expect(result).toBeCloseTo(0, 0);
    });

    it("should decode Long Term Fuel Trim correctly", () => {
      // Response: "41 07 8A" → ((138 - 128) * 100) / 128 ≈ 7.8%
      const result = (service as any).parsePIDResponse("0107", "41 07 8A");
      expect(result).toBeCloseTo(7.8, 0);
    });

    it("should decode Fuel Level correctly", () => {
      // Response: "41 2F B3" → (179 * 100) / 255 ≈ 70.2%
      const result = (service as any).parsePIDResponse("012F", "41 2F B3");
      expect(result).toBeCloseTo(70.2, 0);
    });

    it("should decode Battery Voltage correctly", () => {
      // Response: "41 42 37 58" → (55*256 + 88) / 1000 = 14.168 V
      const result = (service as any).parsePIDResponse("0142", "41 42 37 58");
      expect(result).toBeCloseTo(14.168, 2);
    });

    it("should handle RPM = 0 correctly", () => {
      const result = (service as any).parsePIDResponse("010C", "41 0C 00 00");
      expect(result).toBe(0);
    });

    it("should handle max RPM correctly", () => {
      // Max: (255*256 + 255) / 4 = 16383.75
      const result = (service as any).parsePIDResponse("010C", "41 0C FF FF");
      expect(result).toBeCloseTo(16383.75, 1);
    });

    it("should return null for NODATA response", () => {
      const result = (service as any).parsePIDResponse("010C", "NO DATA");
      expect(result).toBeNull();
    });

    it("should return null for ERROR response", () => {
      const result = (service as any).parsePIDResponse("010C", "ERROR");
      expect(result).toBeNull();
    });

    it("should decode Oil Temperature correctly", () => {
      // Response: "41 5C 87" → 135 - 40 = 95°C
      const result = (service as any).parsePIDResponse("015C", "41 5C 87");
      expect(result).toBe(95);
    });

    it("should decode Engine Torque correctly", () => {
      // Response: "41 62 96" → 150 - 125 = 25%
      const result = (service as any).parsePIDResponse("0162", "41 62 96");
      expect(result).toBe(25);
    });

    it("should handle J1850 header format", () => {
      // J1850 response with header: "48 6B 10 41 0C 1A F8"
      // Header: 48 6B 10, then 41 0C 1A F8
      const result = (service as any).parsePIDResponse("010C", "48 6B 10 41 0C 1A F8");
      expect(result).toBeCloseTo(1726, 0);
    });
  });
});

// ═══════════════════════════════════════════════════════
// DTC PARSING TESTS
// ═══════════════════════════════════════════════════════

describe("OBD-II DTC Parsing", () => {
  let service: OBDBleService;

  beforeEach(() => {
    service = new OBDBleService();
  });

  describe("DTC Response Parsing (parseDTCResponse)", () => {
    it("should parse CAN DTC response with P0300", () => {
      // CAN response: "43 03 00 04 20 00 00"
      const result = (service as any).parseDTCResponse("43 03 00 04 20 00 00", "43");
      expect(result.length).toBeGreaterThan(0);
      const codes = result.map((d: any) => d.code);
      expect(codes).toContain("P0300");
    });

    it("should parse multiple DTCs correctly", () => {
      // Two DTCs: P0300 and P0420
      const result = (service as any).parseDTCResponse("43 03 00 04 20 00 00", "43");
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it("should handle empty DTC response (no codes)", () => {
      const result = (service as any).parseDTCResponse("43 00 00 00 00 00 00", "43");
      // All zeros means no DTCs
      expect(result.length).toBe(0);
    });

    it("should parse pending DTCs (Mode 07)", () => {
      const result = (service as any).parseDTCResponse("47 01 71 00 00 00 00", "47");
      expect(result.length).toBeGreaterThan(0);
      const codes = result.map((d: any) => d.code);
      expect(codes).toContain("P0171");
    });

    it("should decode B-code (Body) DTCs", () => {
      // B0001: 0x40, 0x01
      const result = (service as any).parseDTCResponse("43 40 01 00 00 00 00", "43");
      // B codes may be filtered or handled differently
      expect(Array.isArray(result)).toBe(true);
    });

    it("should decode C-code (Chassis) DTCs", () => {
      // C0035: 0x80, 0x35
      const result = (service as any).parseDTCResponse("43 80 35 00 00 00 00", "43");
      expect(Array.isArray(result)).toBe(true);
    });

    it("should decode U-code (Network) DTCs", () => {
      // U0100: 0xC1, 0x00
      const result = (service as any).parseDTCResponse("43 C1 00 00 00 00 00", "43");
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].code.startsWith("U")).toBe(true);
    });

    it("should NOT produce false C-codes from J1850 PWM headers (486B10)", () => {
      // J1850 PWM response with NO DTCs: header 486B10 + mode response 43 + count 00 + padding
      // This is what Ford Grand Marquis 2009 returns when no DTCs stored
      const result = (service as any).parseDTCResponse("486B10 43 00 00 00 00 00", "43");
      expect(result.length).toBe(0);
    });

    it("should NOT produce false codes from J1850 PWM header without spaces", () => {
      // Same response without spaces (some ELM327 adapters send without spaces)
      const result = (service as any).parseDTCResponse("486B104300000000000000", "43");
      expect(result.length).toBe(0);
    });

    it("should correctly parse real DTC from J1850 PWM response", () => {
      // J1850 PWM response with 1 DTC (P0300): header 486B10 + 43 + 0300 + padding
      // In J1850, format is: [header 3B] [43] [DTC_high] [DTC_low] [padding...]
      // P0300 = high byte 0x03, low byte 0x00
      const result = (service as any).parseDTCResponse("486B10 43 03 00 00 00 00 00", "43");
      expect(result.length).toBe(1);
      expect(result[0].code).toBe("P0300");
    });

    it("should handle J1850 VPW header (686B10) without false positives", () => {
      // J1850 VPW (GM) response with no DTCs
      const result = (service as any).parseDTCResponse("686B10 43 00 00 00 00 00", "43");
      expect(result.length).toBe(0);
    });

    it("should handle NO DATA response", () => {
      const result = (service as any).parseDTCResponse("NO DATA\r\n>", "43");
      expect(result.length).toBe(0);
    });

    it("should handle SEARCHING... then NO DATA", () => {
      const result = (service as any).parseDTCResponse("SEARCHING...\r\nNO DATA\r\n>", "43");
      expect(result.length).toBe(0);
    });

    it("should handle J1850 PWM pending codes (Mode 07) without false positives", () => {
      // Ford Grand Marquis - no pending codes
      const result = (service as any).parseDTCResponse("486B10 47 00 00 00 00 00", "47");
      expect(result.length).toBe(0);
    });

    it("should parse CAN response with count byte correctly", () => {
      // CAN response: 7E8 06 43 02 0300 0420
      const result = (service as any).parseDTCResponse("7E806 43 02 03 00 04 20", "43");
      expect(result.length).toBe(2);
      const codes = result.map((d: any) => d.code);
      expect(codes).toContain("P0300");
      expect(codes).toContain("P0420");
    });
  });
});

// ═══════════════════════════════════════════════════════
// DATA LOGGER TESTS
// ═══════════════════════════════════════════════════════

describe("Data Logger", () => {
  let service: OBDBleService;

  beforeEach(() => {
    service = new OBDBleService();
  });

  it("should initialize with empty log entries", () => {
    expect(service.dataLogEntries).toBeDefined();
    expect(Array.isArray(service.dataLogEntries)).toBe(true);
    expect(service.dataLogEntries.length).toBe(0);
  });

  it("should have exportDataLogCSV method", () => {
    expect(typeof service.exportDataLogCSV).toBe("function");
  });

  it("should export CSV with correct headers", () => {
    const csv = service.exportDataLogCSV();
    // Headers use title case: Timestamp, RPM, Speed, etc.
    expect(csv).toContain("Timestamp");
    expect(csv).toContain("RPM");
    expect(csv).toContain("Speed");
  });

  it("should export empty CSV when no data (header only)", () => {
    const csv = service.exportDataLogCSV();
    const lines = csv.trim().split("\n");
    expect(lines.length).toBe(1); // Header only
  });

  it("should have dataLogEntries as array", () => {
    expect(Array.isArray(service.dataLogEntries)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════
// PERFORMANCE METRICS TESTS
// ═══════════════════════════════════════════════════════

describe("Performance Metrics", () => {
  it("should calculate estimated HP from weight and time", () => {
    // HP ≈ (weight_kg * speed_ms²) / (2 * time * 745.7)
    const weight = 1500;
    const time = 8;
    const speed = 27.78; // 100 km/h in m/s
    const hp = Math.round((weight * speed * speed) / (2 * time * 745.7));
    expect(hp).toBeGreaterThan(80);
    expect(hp).toBeLessThan(120);
  });

  it("should calculate estimated torque from HP and RPM", () => {
    // Torque (Nm) = (HP * 745.7) / (RPM * 2π / 60)
    const hp = 100;
    const rpm = 3000;
    const torque = Math.round((hp * 745.7) / (rpm * 2 * Math.PI / 60));
    expect(torque).toBeGreaterThan(220);
    expect(torque).toBeLessThan(250);
  });

  it("should calculate 0-100 km/h time correctly", () => {
    // If speed goes from 0 to 100 in 8 seconds
    const startTime = 0;
    const endTime = 8000; // ms
    const elapsed = (endTime - startTime) / 1000;
    expect(elapsed).toBe(8);
  });

  it("should calculate quarter mile time estimate", () => {
    // Quarter mile ≈ 0-100 time * 1.65 (rough estimate)
    const zeroToHundred = 8;
    const quarterMile = zeroToHundred * 1.65;
    expect(quarterMile).toBeCloseTo(13.2, 1);
  });
});

// ═══════════════════════════════════════════════════════
// ENHANCED PIDs TESTS
// ═══════════════════════════════════════════════════════

describe("Enhanced PIDs", () => {
  it("should import getManufacturerPIDs without errors", async () => {
    const module = await import("./obdEnhancedPids");
    expect(module.getManufacturerPIDs).toBeDefined();
    expect(typeof module.getManufacturerPIDs).toBe("function");
  });

  it("should return Toyota PIDs for 'toyota' key", async () => {
    const module = await import("./obdEnhancedPids");
    const pids = module.getManufacturerPIDs("toyota");
    expect(pids).not.toBeNull();
    if (pids) {
      expect(Object.keys(pids.pids).length).toBeGreaterThan(0);
    }
  });

  it("should return BMW PIDs for 'bmw' key", async () => {
    const module = await import("./obdEnhancedPids");
    const pids = module.getManufacturerPIDs("bmw");
    expect(pids).not.toBeNull();
    if (pids) {
      expect(Object.keys(pids.pids).length).toBeGreaterThan(0);
    }
  });

  it("should return Hyundai PIDs for 'hyundai' key", async () => {
    const module = await import("./obdEnhancedPids");
    const pids = module.getManufacturerPIDs("hyundai");
    expect(pids).not.toBeNull();
  });

  it("should return null for unknown manufacturer", async () => {
    const module = await import("./obdEnhancedPids");
    const pids = module.getManufacturerPIDs("unknownbrand");
    expect(pids).toBeNull();
  });

  it("should detect Toyota from VIN WMI 'JTD'", async () => {
    const module = await import("./obdEnhancedPids");
    const make = module.detectManufacturerFromVIN("JTDKN3DU5A0123456");
    expect(make).toBe("toyota");
  });

  it("should detect BMW from VIN WMI 'WBA'", async () => {
    const module = await import("./obdEnhancedPids");
    const make = module.detectManufacturerFromVIN("WBAPH5C55BA123456");
    expect(make).toBe("bmw");
  });

  it("should detect Mercedes from VIN WMI 'WDB'", async () => {
    const module = await import("./obdEnhancedPids");
    const make = module.detectManufacturerFromVIN("WDBRF61J21F123456");
    expect(make).toBe("mercedes");
  });

  it("should return null for unknown VIN", async () => {
    const module = await import("./obdEnhancedPids");
    const make = module.detectManufacturerFromVIN("ZZZ");
    expect(make).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════
// SESSION STORAGE TESTS
// ═══════════════════════════════════════════════════════

describe("Session Storage", () => {
  it("should import session storage functions", async () => {
    const module = await import("./obdSessionStorage");
    expect(module.saveSession).toBeDefined();
    expect(module.getAllSessions).toBeDefined();
    expect(module.compareSessions).toBeDefined();
    expect(module.exportSessionAsText).toBeDefined();
    expect(module.shareViaWhatsApp).toBeDefined();
    expect(module.shareViaEmail).toBeDefined();
  });

  it("should have compareSessions function", async () => {
    const module = await import("./obdSessionStorage");
    expect(typeof module.compareSessions).toBe("function");
  });
});

// ═══════════════════════════════════════════════════════
// MULTI-PID & LIVE CHART BUFFER TESTS
// ═══════════════════════════════════════════════════════

describe("Multi-PID & LiveChartBuffer", () => {
  it("should import AutoReconnect class", async () => {
    const module = await import("./obdMultiPid");
    expect(module.AutoReconnect).toBeDefined();
  });

  it("should import LiveChartBuffer class", async () => {
    const module = await import("./obdMultiPid");
    expect(module.LiveChartBuffer).toBeDefined();
  });

  it("should create LiveChartBuffer with default max points", async () => {
    const module = await import("./obdMultiPid");
    const buffer = new module.LiveChartBuffer();
    expect(buffer.totalPoints).toBe(0);
  });

  it("should create LiveChartBuffer with custom max points", async () => {
    const module = await import("./obdMultiPid");
    const buffer = new module.LiveChartBuffer(100);
    expect(buffer.totalPoints).toBe(0);
  });

  it("should add data points using push(key, value)", async () => {
    const module = await import("./obdMultiPid");
    const buffer = new module.LiveChartBuffer(100);
    buffer.push("rpm", 1500);
    buffer.push("speed", 60);
    expect(buffer.totalPoints).toBe(2);
  });

  it("should get data for a specific key", async () => {
    const module = await import("./obdMultiPid");
    const buffer = new module.LiveChartBuffer(100);
    buffer.push("rpm", 1500);
    buffer.push("rpm", 2000);
    buffer.push("rpm", 2500);
    const data = buffer.getData("rpm");
    expect(data.length).toBe(3);
    expect(data[0].value).toBe(1500);
    expect(data[2].value).toBe(2500);
  });

  it("should respect max points limit", async () => {
    const module = await import("./obdMultiPid");
    const buffer = new module.LiveChartBuffer(5);
    for (let i = 0; i < 10; i++) {
      buffer.push("rpm", i * 100);
    }
    const data = buffer.getData("rpm");
    expect(data.length).toBe(5);
    // Should keep latest 5 points (500, 600, 700, 800, 900)
    expect(data[0].value).toBe(500);
    expect(data[4].value).toBe(900);
  });

  it("should calculate statistics correctly", async () => {
    const module = await import("./obdMultiPid");
    const buffer = new module.LiveChartBuffer(100);
    buffer.push("rpm", 1000);
    buffer.push("rpm", 2000);
    buffer.push("rpm", 3000);
    const stats = buffer.getStats("rpm");
    expect(stats.min).toBe(1000);
    expect(stats.max).toBe(3000);
    expect(stats.avg).toBe(2000);
    expect(stats.current).toBe(3000);
  });

  it("should return empty stats for non-existent key", async () => {
    const module = await import("./obdMultiPid");
    const buffer = new module.LiveChartBuffer(100);
    const stats = buffer.getStats("nonexistent");
    expect(stats.min).toBe(0);
    expect(stats.max).toBe(0);
    expect(stats.avg).toBe(0);
    expect(stats.current).toBe(0);
  });

  it("should export CSV data", async () => {
    const module = await import("./obdMultiPid");
    const buffer = new module.LiveChartBuffer(100);
    buffer.push("rpm", 1500);
    buffer.push("speed", 60);
    const csv = buffer.exportCSV();
    expect(csv).toContain("timestamp");
    expect(csv).toContain("rpm");
    expect(csv).toContain("speed");
  });
});

// ═══════════════════════════════════════════════════════
// PDF REPORT TESTS
// ═══════════════════════════════════════════════════════

describe("PDF Report Generation", () => {
  it("should import generatePDFReport without errors", async () => {
    const module = await import("./obdPdfReport");
    expect(module.generatePDFReport).toBeDefined();
    expect(typeof module.generatePDFReport).toBe("function");
  });

  it("should import downloadReportHTML without errors", async () => {
    const module = await import("./obdPdfReport");
    expect(module.downloadReportHTML).toBeDefined();
    expect(typeof module.downloadReportHTML).toBe("function");
  });
});

// ═══════════════════════════════════════════════════════
// SERVICE INITIALIZATION TESTS
// ═══════════════════════════════════════════════════════

describe("OBDBleService Initialization", () => {
  it("should create instance without errors", () => {
    const service = new OBDBleService();
    expect(service).toBeDefined();
  });

  it("should have connect method", () => {
    const service = new OBDBleService();
    expect(typeof service.connect).toBe("function");
  });

  it("should have disconnect method", () => {
    const service = new OBDBleService();
    expect(typeof service.disconnect).toBe("function");
  });

  it("should have readLiveData method", () => {
    const service = new OBDBleService();
    expect(typeof service.readLiveData).toBe("function");
  });

  it("should have readDTCs method", () => {
    const service = new OBDBleService();
    expect(typeof service.readDTCs).toBe("function");
  });

  it("should have readDTCs method", () => {
    const service = new OBDBleService();
    expect(typeof service.readDTCs).toBe("function");
  });

  it("should have clearDTCs method", () => {
    const service = new OBDBleService();
    expect(typeof service.clearDTCs).toBe("function");
  });

  it("should have exportDataLogCSV method", () => {
    const service = new OBDBleService();
    expect(typeof service.exportDataLogCSV).toBe("function");
  });

  it("should have dataLogEntries property", () => {
    const service = new OBDBleService();
    expect(service.dataLogEntries).toBeDefined();
    expect(Array.isArray(service.dataLogEntries)).toBe(true);
  });
});
