/**
 * OBD-II Professional PDF Report Generator
 * ═══════════════════════════════════════════
 * Generates branded PDF reports with Meir logo
 * Colors: Yellow (#F5C518), Black (#1A1A1A), White (#FFFFFF)
 * 
 * @version 1.0.0
 * @author مير - Meir Diagnostics
 */

import type { OBDLiveData, OBDDTCCode, FreezeFrameData, Mode6TestResult, O2SensorData, OBDAlert, OBDVehicleInfo, EngineHealth } from "./obdBleService";

// ═══════════════════════════════════════════════════════
// PDF REPORT TYPES
// ═══════════════════════════════════════════════════════

export interface PDFReportData {
  vehicleInfo: Partial<OBDVehicleInfo>;
  liveData: Partial<OBDLiveData>;
  dtcCodes: OBDDTCCode[];
  freezeFrames: FreezeFrameData[];
  mode6Results: Mode6TestResult[];
  o2Sensors: O2SensorData[];
  readinessTests: Record<string, "pass" | "fail" | "na">;
  alerts: OBDAlert[];
  engineHealth?: EngineHealth;
  scanDate: Date;
  dtcDescriptions?: Record<string, { en: string; ar: string }>;
  multiEcuResult?: {
    engine: OBDDTCCode[];
    abs: OBDDTCCode[];
    airbag: OBDDTCCode[];
    bcm: OBDDTCCode[];
    transmission: OBDDTCCode[];
  };
  // Vehicle identity fields
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
}

// ═══════════════════════════════════════════════════════
// BRAND COLORS & CONSTANTS
// ═══════════════════════════════════════════════════════

const BRAND = {
  yellow: "#F5C518",
  black: "#1A1A1A",
  darkGray: "#2D2D2D",
  lightGray: "#F5F5F5",
  white: "#FFFFFF",
  green: "#22C55E",
  red: "#EF4444",
  orange: "#F97316",
};

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
  <rect width="200" height="60" rx="8" fill="${BRAND.black}"/>
  <text x="100" y="42" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="${BRAND.yellow}">MEIR</text>
  <text x="100" y="56" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="${BRAND.white}">مير للخدمات</text>
</svg>`;

// ═══════════════════════════════════════════════════════
// PDF GENERATION (Using jsPDF-like HTML approach)
// ═══════════════════════════════════════════════════════

/**
 * Generate a professional PDF report as a downloadable Blob.
 * Uses HTML-to-PDF approach via browser print for maximum compatibility.
 */
export function generatePDFReport(data: PDFReportData): void {
  const html = buildReportHTML(data);
  
  // Open in new window and trigger print
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    // Fallback: download as HTML
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meir-report-${formatDate(data.scanDate)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();
  
  // Auto-trigger print after load
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
}

/**
 * Generate report as downloadable HTML file
 */
export function downloadReportHTML(data: PDFReportData): void {
  const html = buildReportHTML(data);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `meir-diagnostic-report-${formatDate(data.scanDate)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════
// HTML REPORT BUILDER
// ═══════════════════════════════════════════════════════

function buildReportHTML(data: PDFReportData): string {
  const healthScore = data.engineHealth?.score ?? 0;
  const healthCategory = data.engineHealth?.category ?? "unknown";
  const healthColor = healthScore >= 80 ? BRAND.green : healthScore >= 60 ? BRAND.orange : BRAND.red;

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>تقرير فحص مير - ${formatDate(data.scanDate)}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      background: ${BRAND.white};
      color: ${BRAND.black};
      font-size: 11px;
      line-height: 1.5;
      direction: rtl;
    }
    .page { page-break-after: always; padding: 20px; }
    .page:last-child { page-break-after: auto; }
    
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background: ${BRAND.black};
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .header-logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header-logo .brand-name {
      font-size: 28px;
      font-weight: bold;
      color: ${BRAND.yellow};
      letter-spacing: 2px;
    }
    .header-logo .brand-sub {
      font-size: 10px;
      color: ${BRAND.white};
      opacity: 0.8;
    }
    .header-info {
      text-align: left;
      color: ${BRAND.white};
      font-size: 10px;
    }
    .header-info .date { color: ${BRAND.yellow}; font-weight: bold; }
    
    /* Health Score */
    .health-section {
      text-align: center;
      padding: 20px;
      background: linear-gradient(135deg, ${BRAND.black} 0%, ${BRAND.darkGray} 100%);
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .health-score {
      font-size: 64px;
      font-weight: bold;
      color: ${healthColor};
    }
    .health-label {
      font-size: 14px;
      color: ${BRAND.white};
      margin-top: 5px;
    }
    .health-bar {
      width: 80%;
      max-width: 300px;
      height: 8px;
      background: rgba(255,255,255,0.2);
      border-radius: 4px;
      margin: 10px auto 0;
      overflow: hidden;
    }
    .health-bar-fill {
      height: 100%;
      width: ${healthScore}%;
      background: ${healthColor};
      border-radius: 4px;
      transition: width 1s;
    }
    
    /* Sections */
    .section {
      margin-bottom: 18px;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      overflow: hidden;
    }
    .section-title {
      background: ${BRAND.yellow};
      color: ${BRAND.black};
      padding: 8px 15px;
      font-size: 13px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-body { padding: 12px 15px; }
    
    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    th {
      background: ${BRAND.lightGray};
      padding: 6px 8px;
      text-align: right;
      font-weight: 600;
      border-bottom: 2px solid ${BRAND.yellow};
    }
    td {
      padding: 5px 8px;
      border-bottom: 1px solid #F0F0F0;
    }
    tr:nth-child(even) td { background: #FAFAFA; }
    
    /* Status badges */
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 9px;
      font-weight: bold;
    }
    .badge-pass { background: #DCFCE7; color: #166534; }
    .badge-fail { background: #FEE2E2; color: #991B1B; }
    .badge-na { background: #F3F4F6; color: #6B7280; }
    .badge-warning { background: #FEF3C7; color: #92400E; }
    .badge-critical { background: #FEE2E2; color: #991B1B; }
    
    /* Grid */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
    .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; }
    
    /* Data card */
    .data-card {
      background: ${BRAND.lightGray};
      border-radius: 6px;
      padding: 8px 10px;
      text-align: center;
    }
    .data-card .value {
      font-size: 18px;
      font-weight: bold;
      color: ${BRAND.black};
    }
    .data-card .label {
      font-size: 9px;
      color: #6B7280;
      margin-top: 2px;
    }
    
    /* DTC */
    .dtc-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 0;
      border-bottom: 1px solid #F0F0F0;
    }
    .dtc-code {
      font-family: monospace;
      font-size: 13px;
      font-weight: bold;
      color: ${BRAND.red};
      background: #FEE2E2;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .dtc-desc { font-size: 10px; color: #374151; }
    
    /* Footer */
    .footer {
      text-align: center;
      padding: 15px;
      font-size: 9px;
      color: #9CA3AF;
      border-top: 1px solid #E5E7EB;
      margin-top: 20px;
    }
    .footer a { color: ${BRAND.yellow}; text-decoration: none; }
    
    /* Alerts */
    .alert-item {
      padding: 6px 10px;
      margin-bottom: 5px;
      border-radius: 4px;
      font-size: 10px;
      display: flex;
      justify-content: space-between;
    }
    .alert-warning { background: #FEF3C7; border-right: 3px solid ${BRAND.orange}; }
    .alert-critical { background: #FEE2E2; border-right: 3px solid ${BRAND.red}; }
    
    /* Print optimization */
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <!-- Page 1: Overview -->
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="header-logo">
        <div>
          <div class="brand-name">MEIR</div>
          <div class="brand-sub">مير للخدمات والتشخيص</div>
        </div>
      </div>
      <div class="header-info">
        <div class="date">${formatDateAr(data.scanDate)}</div>
        <div>تقرير فحص شامل</div>
        <div>meirservic.co</div>
      </div>
    </div>

    <!-- Health Score -->
    <div class="health-section">
      <div class="health-score">${healthScore}%</div>
      <div class="health-label">صحة المحرك - ${getHealthCategoryAr(healthCategory)}</div>
      <div class="health-bar"><div class="health-bar-fill"></div></div>
    </div>

    <!-- Vehicle Info -->
    <div class="section">
      <div class="section-title">معلومات السيارة</div>
      <div class="section-body">
        <div class="grid-4">
          ${data.make ? `<div class="data-card"><div class="value" style="font-size:14px;">${data.make}</div><div class="label">الماركة</div></div>` : ""}
          ${data.model ? `<div class="data-card"><div class="value" style="font-size:14px;">${data.model}</div><div class="label">الموديل</div></div>` : ""}
          ${data.year ? `<div class="data-card"><div class="value">${data.year}</div><div class="label">سنة الصنع</div></div>` : ""}
          ${data.mileage ? `<div class="data-card"><div class="value" style="font-size:12px;">${data.mileage.toLocaleString()}</div><div class="label">الكيلومترات</div></div>` : ""}
        </div>
        <div class="grid-4" style="margin-top:8px;">
          <div class="data-card">
            <div class="value" style="font-size:10px; word-break:break-all;">${data.vehicleInfo.vin || "—"}</div>
            <div class="label">رقم الشاسيه (VIN)</div>
          </div>
          <div class="data-card">
            <div class="value" style="font-size:11px;">${data.vehicleInfo.protocol || "Auto"}</div>
            <div class="label">بروتوكول الاتصال</div>
          </div>
          <div class="data-card">
            <div class="value" style="font-size:11px;">${data.vehicleInfo.ecuName || "—"}</div>
            <div class="label">ECU</div>
          </div>
          <div class="data-card">
            <div class="value" style="font-size:11px;">${data.vehicleInfo.obdStandard || "—"}</div>
            <div class="label">معيار OBD</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Data Summary -->
    <div class="section">
      <div class="section-title">بيانات التشخيص الحية</div>
      <div class="section-body">
        <div class="grid-4">
          ${buildDataCard("RPM", data.liveData.rpm?.toFixed(0) || "—", "دورة/دقيقة")}
          ${buildDataCard("السرعة", data.liveData.speed?.toString() || "—", "km/h")}
          ${buildDataCard("حرارة المحرك", data.liveData.coolantTemp?.toString() || "—", "°C")}
          ${buildDataCard("الجهد", data.liveData.voltage?.toFixed(1) || "—", "V")}
          ${buildDataCard("حمل المحرك", data.liveData.engineLoad?.toFixed(1) || "—", "%")}
          ${buildDataCard("الخنق", data.liveData.throttlePos?.toFixed(1) || "—", "%")}
          ${buildDataCard("الوقود", data.liveData.fuelLevel?.toFixed(0) || "—", "%")}
          ${buildDataCard("MAF", data.liveData.mafRate?.toFixed(2) || "—", "g/s")}
          ${buildDataCard("Short FT", data.liveData.shortFuelTrim?.toFixed(1) || "—", "%")}
          ${buildDataCard("Long FT", data.liveData.longFuelTrim?.toFixed(1) || "—", "%")}
          ${buildDataCard("حرارة السحب", data.liveData.intakeTemp?.toString() || "—", "°C")}
          ${buildDataCard("ضغط الوقود", data.liveData.fuelPressure?.toString() || "—", "kPa")}
        </div>
      </div>
    </div>

    <!-- Alerts -->
    ${data.alerts.length > 0 ? `
    <div class="section">
      <div class="section-title">تنبيهات</div>
      <div class="section-body">
        ${data.alerts.map(a => `
          <div class="alert-item alert-${a.type}">
            <span>${a.message}</span>
            <span class="badge badge-${a.type}">${a.type === "critical" ? "حرج" : "تحذير"}</span>
          </div>
        `).join("")}
      </div>
    </div>
    ` : ""}
  </div>

  <!-- Page 2: DTCs & Readiness -->
  <div class="page">
    <div class="header">
      <div class="header-logo">
        <div>
          <div class="brand-name" style="font-size:20px;">MEIR</div>
          <div class="brand-sub">تقرير الأعطال والجاهزية</div>
        </div>
      </div>
      <div class="header-info">
        <div class="date">${formatDateAr(data.scanDate)}</div>
      </div>
    </div>

    <!-- DTC Codes -->
    <div class="section">
      <div class="section-title">أكواد الأعطال (DTC) - ${data.dtcCodes.length} كود</div>
      <div class="section-body">
        ${data.dtcCodes.length === 0 ? '<p style="text-align:center; color:#22C55E; font-weight:bold;">✓ لا توجد أعطال مسجلة</p>' : 
          data.dtcCodes.map(dtc => {
            const desc = data.dtcDescriptions?.[dtc.code];
            return `<div class="dtc-item">
              <span class="dtc-code">${dtc.code}</span>
              <span class="dtc-desc">${desc ? `${desc.ar} (${desc.en})` : "—"}</span>
            </div>`;
          }).join("")
        }
      </div>
    </div>

    <!-- Multi-ECU Results -->
    ${data.multiEcuResult && (data.multiEcuResult.abs.length + data.multiEcuResult.airbag.length + data.multiEcuResult.transmission.length + data.multiEcuResult.bcm.length) > 0 ? `
    <div class="section">
      <div class="section-title">أعطال الأنظمة الأخرى</div>
      <div class="section-body">
        ${data.multiEcuResult.abs.length > 0 ? `<div style="margin-bottom:8px"><strong style="color:#EF4444">🛑 ABS/ESP (${data.multiEcuResult.abs.length} عطل):</strong> ${data.multiEcuResult.abs.map(d => `<span style="font-family:monospace;background:#FEE2E2;padding:2px 6px;border-radius:4px;margin:2px">${d.code}</span>`).join('')}</div>` : ''}
        ${data.multiEcuResult.airbag.length > 0 ? `<div style="margin-bottom:8px"><strong style="color:#F97316">💨 Airbag/SRS (${data.multiEcuResult.airbag.length} عطل):</strong> ${data.multiEcuResult.airbag.map(d => `<span style="font-family:monospace;background:#FED7AA;padding:2px 6px;border-radius:4px;margin:2px">${d.code}</span>`).join('')}</div>` : ''}
        ${data.multiEcuResult.transmission.length > 0 ? `<div style="margin-bottom:8px"><strong style="color:#A855F7">⚙️ ناقل الحركة (${data.multiEcuResult.transmission.length} عطل):</strong> ${data.multiEcuResult.transmission.map(d => `<span style="font-family:monospace;background:#E9D5FF;padding:2px 6px;border-radius:4px;margin:2px">${d.code}</span>`).join('')}</div>` : ''}
        ${data.multiEcuResult.bcm.length > 0 ? `<div style="margin-bottom:8px"><strong style="color:#6B7280">📱 BCM (${data.multiEcuResult.bcm.length} عطل):</strong> ${data.multiEcuResult.bcm.map(d => `<span style="font-family:monospace;background:#F3F4F6;padding:2px 6px;border-radius:4px;margin:2px">${d.code}</span>`).join('')}</div>` : ''}
      </div>
    </div>` : ''}

    <!-- I/M Readiness -->
    <div class="section">
      <div class="section-title">جاهزية الأنظمة (I/M Readiness)</div>
      <div class="section-body">
        <table>
          <thead>
            <tr><th>الاختبار</th><th>الحالة</th></tr>
          </thead>
          <tbody>
            ${Object.entries(data.readinessTests).map(([test, status]) => `
              <tr>
                <td>${getReadinessTestAr(test)}</td>
                <td><span class="badge badge-${status === 'fail' ? 'warning' : status}">${status === "pass" ? "جاهز ✓" : status === "fail" ? "يحتاج مراجعة" : "غير متوفر"}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Freeze Frame -->
    ${data.freezeFrames.length > 0 ? `
    <div class="section">
      <div class="section-title">بيانات لحظة العطل (Freeze Frame)</div>
      <div class="section-body">
        ${data.freezeFrames.map(ff => `
          <div style="margin-bottom:8px; padding:8px; background:#FAFAFA; border-radius:4px;">
            <strong style="color:${BRAND.red};">${ff.dtcCode}</strong>
            <div class="grid-4" style="margin-top:5px;">
              ${ff.rpm !== null ? buildDataCard("RPM", ff.rpm.toString(), "") : ""}
              ${ff.speed !== null ? buildDataCard("سرعة", ff.speed.toString(), "km/h") : ""}
              ${ff.coolantTemp !== null ? buildDataCard("حرارة", ff.coolantTemp.toString(), "°C") : ""}
              ${ff.engineLoad !== null ? buildDataCard("حمل", ff.engineLoad.toFixed(0), "%") : ""}
            </div>
          </div>
        `).join("")}
      </div>
    </div>
    ` : ""}
  </div>

  <!-- Page 3: Mode 6 & O2 Sensors -->
  ${(data.mode6Results.length > 0 || data.o2Sensors.length > 0) ? `
  <div class="page">
    <div class="header">
      <div class="header-logo">
        <div>
          <div class="brand-name" style="font-size:20px;">MEIR</div>
          <div class="brand-sub">نتائج الاختبارات المتقدمة</div>
        </div>
      </div>
      <div class="header-info">
        <div class="date">${formatDateAr(data.scanDate)}</div>
      </div>
    </div>

    <!-- Mode 6 -->
    ${data.mode6Results.length > 0 ? `
    <div class="section">
      <div class="section-title">Mode 6 - نتائج اختبارات المحرك</div>
      <div class="section-body">
        <table>
          <thead>
            <tr><th>الاختبار</th><th>المكون</th><th>القيمة</th><th>الحد الأدنى</th><th>الحد الأقصى</th><th>الحالة</th></tr>
          </thead>
          <tbody>
            ${data.mode6Results.slice(0, 20).map(t => `
              <tr>
                <td>${t.testName}</td>
                <td>${t.component}</td>
                <td><strong>${t.value} ${t.unit}</strong></td>
                <td>${t.minLimit} ${t.unit}</td>
                <td>${t.maxLimit} ${t.unit}</td>
                <td><span class="badge badge-${t.status}">${t.status === "pass" ? "ناجح" : "فاشل"}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
    ` : ""}

    <!-- O2 Sensors -->
    ${data.o2Sensors.length > 0 ? `
    <div class="section">
      <div class="section-title">حساسات الأكسجين (O2 Sensors)</div>
      <div class="section-body">
        <table>
          <thead>
            <tr><th>الحساس</th><th>الجهد</th><th>Fuel Trim</th><th>Rich→Lean</th><th>Lean→Rich</th><th>الحالة</th></tr>
          </thead>
          <tbody>
            ${data.o2Sensors.map(s => `
              <tr>
                <td>Bank ${s.bank} / Sensor ${s.sensor}</td>
                <td>${s.voltage.toFixed(3)} V</td>
                <td>${s.shortTermFuelTrim.toFixed(1)}%</td>
                <td>${s.richToLean} ms</td>
                <td>${s.leanToRich} ms</td>
                <td><span class="badge badge-${s.status === "normal" ? "pass" : s.status === "warning" ? "warning" : "fail"}">${s.status === "normal" ? "طبيعي" : s.status === "warning" ? "تحذير" : "حرج"}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
    ` : ""}
  </div>
  ` : ""}

  <!-- Footer -->
  <div class="footer">
    <p>تم إنشاء هذا التقرير بواسطة <strong style="color:${BRAND.yellow};">MEIR</strong> - مير للخدمات والتشخيص</p>
    <p><a href="https://meirservic.co">meirservic.co</a> | تقرير تلقائي - ${formatDateAr(data.scanDate)}</p>
    <p style="margin-top:5px; font-size:8px;">هذا التقرير للأغراض الإرشادية فقط ولا يغني عن الفحص المتخصص</p>
  </div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════

function buildDataCard(label: string, value: string, unit: string): string {
  return `<div class="data-card">
    <div class="value">${value}<span style="font-size:9px; color:#6B7280;"> ${unit}</span></div>
    <div class="label">${label}</div>
  </div>`;
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

function formatDateAr(date: Date): string {
  const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} - ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

function getHealthCategoryAr(category: string): string {
  const map: Record<string, string> = {
    excellent: "ممتاز",
    good: "جيد",
    fair: "مقبول",
    poor: "ضعيف",
    critical: "حرج",
    unknown: "غير محدد",
  };
  return map[category] || category;
}

function getReadinessTestAr(test: string): string {
  const map: Record<string, string> = {
    misfire: "اختبار الإشعال (Misfire)",
    fuelSystem: "نظام الوقود",
    components: "المكونات الإلكترونية",
    catalyst: "المحول الحفاز (Catalyst)",
    heatedCatalyst: "المحول الحفاز المسخن",
    evaporativeSystem: "نظام التبخر (EVAP)",
    secondaryAir: "الهواء الثانوي",
    acRefrigerant: "مبرد التكييف",
    oxygenSensor: "حساس الأكسجين",
    oxygenSensorHeater: "سخان حساس الأكسجين",
    egrSystem: "نظام EGR",
    catalystMonitor: "مراقب المحول الحفاز",
    exhaustGasSensor: "حساس غاز العادم",
    pmFilter: "فلتر الجسيمات (DPF)",
    boostPressure: "ضغط التوربو",
    noxMonitor: "مراقب NOx",
    nmhcCatalyst: "محول NMHC",
  };
  return map[test] || test;
}
