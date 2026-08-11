import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useState } from "react";

interface Invoice {
  id: string;
  date: string;
  service: string;
  technician: string;
  amount: number;
  status: "paid" | "pending" | "cancelled";
  items: { name: string; qty: number; price: number }[];
}

// Demo invoices - will be replaced with API data
const demoInvoices: Invoice[] = [
  {
    id: "INV-2026-001",
    date: "2026-05-28",
    service: "استبدال بطارية",
    technician: "أحمد محمد",
    amount: 350,
    status: "paid",
    items: [
      { name: "بطارية 70 أمبير", qty: 1, price: 280 },
      { name: "أجرة التركيب", qty: 1, price: 70 },
    ],
  },
  {
    id: "INV-2026-002",
    date: "2026-05-25",
    service: "تشخيص ECU",
    technician: "سالم عبدالله",
    amount: 150,
    status: "paid",
    items: [
      { name: "فحص كمبيوتر شامل", qty: 1, price: 100 },
      { name: "مسح أكواد الأعطال", qty: 1, price: 50 },
    ],
  },
  {
    id: "INV-2026-003",
    date: "2026-05-20",
    service: "إصلاح دينمو",
    technician: "فهد الغامدي",
    amount: 550,
    status: "paid",
    items: [
      { name: "دينمو جديد", qty: 1, price: 450 },
      { name: "أجرة التركيب", qty: 1, price: 100 },
    ],
  },
];

export default function MyInvoices() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">مدفوعة</span>;
      case "pending":
        return <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-semibold">معلقة</span>;
      case "cancelled":
        return <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-semibold">ملغية</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead title="فواتيري" description="عرض فواتير خدمات الصيانة" canonicalPath="/my-invoices" />
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">فواتيري</h1>

        {/* Invoice List */}
        <div className="space-y-4">
          {demoInvoices.map((invoice) => (
            <div
              key={invoice.id}
              onClick={() => setSelectedInvoice(invoice)}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-gray-900">{invoice.service}</h3>
                    {getStatusBadge(invoice.status)}
                  </div>
                  <p className="text-sm text-gray-500">
                    {invoice.id} • {new Date(invoice.date).toLocaleDateString("ar-SA")} • الفني: {invoice.technician}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-gray-900">{invoice.amount} ر.س</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Invoice Detail Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedInvoice(null)}></div>
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <button onClick={() => setSelectedInvoice(null)} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 text-xl">×</button>
              
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">فاتورة {selectedInvoice.id}</h2>
                <p className="text-sm text-gray-500 mt-1">{new Date(selectedInvoice.date).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">الخدمة:</span>
                  <span className="font-semibold">{selectedInvoice.service}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">الفني:</span>
                  <span className="font-semibold">{selectedInvoice.technician}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <h3 className="font-bold text-sm text-gray-700 mb-3">التفاصيل</h3>
                {selectedInvoice.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600">{item.name} × {item.qty}</span>
                    <span className="font-semibold">{item.price} ر.س</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center bg-yellow-50 rounded-xl p-4">
                <span className="font-bold text-gray-900">الإجمالي</span>
                <span className="text-2xl font-bold text-yellow-600">{selectedInvoice.amount} ر.س</span>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full mt-4 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition"
              >
                طباعة الفاتورة
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
