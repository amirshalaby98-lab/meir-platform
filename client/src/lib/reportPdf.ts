interface DtcCode {
  code: string;
  description?: string;
  descriptionAr?: string;
  severity?: string;
  system?: string;
}

const severityLabel = (severity?: string) => {
  if (severity === "high") return "خطورة عالية";
  if (severity === "medium") return "خطورة متوسطة";
  return "خطورة منخفضة";
};

function buildReportHtml(report: any): string {
  const dtcCodes = (report.dtcCodes as DtcCode[] | null) ?? [];
  const vehicleLabel = [report.make, report.model, report.year].filter(Boolean).join(" ") || "سيارة غير محددة";
  const scanDate = new Date(report.scanDate || report.createdAt);
  const dateLabel = scanDate.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
  const timeLabel = scanDate.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });

  const dtcRows = dtcCodes.length
    ? dtcCodes.map(dtc => `
      <tr>
        <td style="padding:8px;border:1px solid #e5e7eb;font-family:monospace;font-weight:bold;">${dtc.code}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${dtc.descriptionAr || dtc.description || "—"}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${dtc.system || "—"}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${severityLabel(dtc.severity)}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="4" style="padding:12px;text-align:center;color:#9ca3af;border:1px solid #e5e7eb;">لا توجد أكواد أعطال</td></tr>`;

  return `
    <div style="width:760px;padding:32px;background:#fff;font-family:Arial,Tahoma,sans-serif;direction:rtl;color:#111827;">
      <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #facc15;padding-bottom:16px;margin-bottom:20px;">
        <div>
          <div style="font-size:24px;font-weight:900;">مير</div>
          <div style="font-size:13px;color:#6b7280;">تقرير فحص OBD</div>
        </div>
        <div style="text-align:left;font-size:12px;color:#6b7280;">
          <div>${dateLabel}</div>
          <div>${timeLabel}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
        <div style="background:#f9fafb;border-radius:10px;padding:12px;">
          <div style="font-size:11px;color:#9ca3af;margin-bottom:4px;">السيارة</div>
          <div style="font-weight:bold;">${vehicleLabel}</div>
        </div>
        <div style="background:#f9fafb;border-radius:10px;padding:12px;">
          <div style="font-size:11px;color:#9ca3af;margin-bottom:4px;">نسبة صحة المحرك</div>
          <div style="font-weight:bold;">${report.healthScore ?? 0}%</div>
        </div>
        <div style="background:#f9fafb;border-radius:10px;padding:12px;">
          <div style="font-size:11px;color:#9ca3af;margin-bottom:4px;">رقم الهيكل (VIN)</div>
          <div style="font-weight:bold;font-family:monospace;">${report.vin || "—"}</div>
        </div>
        <div style="background:#f9fafb;border-radius:10px;padding:12px;">
          <div style="font-size:11px;color:#9ca3af;margin-bottom:4px;">الكيلومترات</div>
          <div style="font-weight:bold;">${report.mileage ? Number(report.mileage).toLocaleString("ar-SA") : "—"}</div>
        </div>
      </div>

      <div style="font-size:15px;font-weight:bold;margin-bottom:8px;">أكواد الأعطال (${dtcCodes.length})</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:20px;">
        <thead>
          <tr style="background:#111827;color:#fff;">
            <th style="padding:8px;border:1px solid #111827;">الكود</th>
            <th style="padding:8px;border:1px solid #111827;">الوصف</th>
            <th style="padding:8px;border:1px solid #111827;">النظام</th>
            <th style="padding:8px;border:1px solid #111827;">الخطورة</th>
          </tr>
        </thead>
        <tbody>${dtcRows}</tbody>
      </table>

      ${report.technicianNotes ? `
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px;margin-bottom:20px;">
          <div style="font-size:12px;font-weight:bold;color:#1d4ed8;margin-bottom:4px;">ملاحظات الفني</div>
          <div style="font-size:13px;color:#1e3a8a;">${report.technicianNotes}</div>
        </div>
      ` : ""}

      <div style="border-top:1px solid #e5e7eb;padding-top:12px;font-size:11px;color:#9ca3af;text-align:center;">
        تم إنشاء هذا التقرير بواسطة مير · meir.sa
      </div>
    </div>
  `;
}

export async function downloadReportPdf(report: any): Promise<void> {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-10000px";
  container.style.left = "-10000px";
  container.innerHTML = buildReportHtml(report);
  document.body.appendChild(container);

  try {
    const target = container.firstElementChild as HTMLElement;
    const canvas = await html2canvas(target, { scale: 2, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const dateStr = new Date(report.scanDate || report.createdAt).toISOString().slice(0, 10);
    pdf.save(`meir-obd-report-${dateStr}-${report.id}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
