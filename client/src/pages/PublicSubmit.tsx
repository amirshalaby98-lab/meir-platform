import { useState } from "react";
import Header from "../components/Header";
import { trpc } from "../lib/trpc";

type ServiceType = "tow_truck" | "parts_shop" | "junkyard" | "workshop";

export default function PublicSubmit() {
  const [serviceType, setServiceType] = useState<ServiceType | "">("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Common fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");

  // Tow truck fields
  const [truckType, setTruckType] = useState("");
  const [plateNumber, setPlateNumber] = useState("");

  // Parts shop / Junkyard fields
  const [specialties, setSpecialties] = useState("");
  const [description, setDescription] = useState("");

  // Workshop fields
  const [workshopServices, setWorkshopServices] = useState("");

  const addTowTruck = trpc.pricing.publicAddTowTruck.useMutation();
  const addPartsShop = trpc.pricing.publicAddPartsShop.useMutation();
  const addJunkyard = trpc.pricing.publicAddJunkyard.useMutation();
  const addWorkshop = trpc.pricing.publicAddWorkshop.useMutation();

  const handleSubmit = async () => {
    if (!name || !phone || !city || !serviceType) return;
    setLoading(true);

    try {
      if (serviceType === "tow_truck") {
        await addTowTruck.mutateAsync({
          name,
          phone,
          city,
          area: district || city,
        });
      } else if (serviceType === "parts_shop") {
        await addPartsShop.mutateAsync({
          name,
          phone,
          city,
          area: district || city,
          specialty: specialties || "قطع غيار عامة",
        });
      } else if (serviceType === "junkyard") {
        await addJunkyard.mutateAsync({
          name,
          phone,
          city,
          area: district || city,
          specialty: specialties || "تشاليح عامة",
        });
      } else if (serviceType === "workshop") {
        await addWorkshop.mutateAsync({
          name,
          phone,
          city,
          area: district || city,
          specialty: workshopServices || "صيانة عامة",
        });
      }
      setSubmitted(true);
    } catch {
      alert("حدث خطأ، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const serviceTypes: { key: ServiceType; label: string; icon: string }[] = [
    { key: "tow_truck", label: "سطحة", icon: "🚛" },
    { key: "parts_shop", label: "محل قطع غيار", icon: "🔧" },
    { key: "junkyard", label: "تشليح", icon: "🏭" },
    { key: "workshop", label: "ورشة", icon: "🔩" },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-6 pt-24 text-center">
          <div className="bg-gray-900 border border-green-500/30 rounded-2xl p-8">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">تم إرسال طلبك بنجاح</h2>
            <p className="text-gray-400 mb-6">سيتم مراجعة بياناتك والموافقة عليها خلال 24 ساعة</p>
            <button
              onClick={() => { setSubmitted(false); setServiceType(""); setName(""); setPhone(""); setCity(""); setDistrict(""); }}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-xl"
            >
              إضافة خدمة أخرى
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      <Header />
      <div className="max-w-lg mx-auto px-4 py-6 pt-24">
        <h1 className="text-2xl font-bold text-yellow-400 mb-2">أضف خدمتك في مير</h1>
        <p className="text-gray-400 text-sm mb-6">سجّل بياناتك وسنضيفك في المنصة بعد المراجعة</p>

        {/* Service Type Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {serviceTypes.map((s) => (
            <button
              key={s.key}
              onClick={() => setServiceType(s.key)}
              className={`p-4 rounded-xl text-center transition border ${
                serviceType === s.key
                  ? "bg-yellow-500/10 border-yellow-500 text-yellow-400"
                  : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600"
              }`}
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-sm font-bold">{s.label}</div>
            </button>
          ))}
        </div>

        {serviceType && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
            {/* Common Fields */}
            <div>
              <label className="text-sm text-gray-400 block mb-1">الاسم *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={serviceType === "tow_truck" ? "اسم صاحب السطحة" : "اسم المحل/الورشة"}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:border-yellow-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">رقم الجوال *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:border-yellow-500 outline-none"
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-400 block mb-1">المدينة *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:border-yellow-500 outline-none"
                >
                  <option value="">اختر المدينة</option>
                  <option value="مكة">مكة</option>
                  <option value="جدة">جدة</option>
                  <option value="الرياض">الرياض</option>
                  <option value="المدينة">المدينة</option>
                  <option value="الطائف">الطائف</option>
                  <option value="الدمام">الدمام</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">الحي</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="اسم الحي"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:border-yellow-500 outline-none"
                />
              </div>
            </div>

            {/* Tow Truck Specific */}
            {serviceType === "tow_truck" && (
              <>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">نوع السطحة</label>
                  <select
                    value={truckType}
                    onChange={(e) => setTruckType(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:border-yellow-500 outline-none"
                  >
                    <option value="">اختر النوع</option>
                    <option value="سطحة عادية">سطحة عادية</option>
                    <option value="سطحة هيدروليك">سطحة هيدروليك</option>
                    <option value="ونش">ونش</option>
                    <option value="سطحة مغلقة">سطحة مغلقة</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">رقم اللوحة</label>
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="رقم لوحة السطحة"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:border-yellow-500 outline-none"
                  />
                </div>
              </>
            )}

            {/* Parts Shop / Junkyard Specific */}
            {(serviceType === "parts_shop" || serviceType === "junkyard") && (
              <>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">التخصصات</label>
                  <input
                    type="text"
                    value={specialties}
                    onChange={(e) => setSpecialties(e.target.value)}
                    placeholder={serviceType === "parts_shop" ? "مثال: تويوتا، هيونداي، كيا" : "مثال: يابانية، كورية، أمريكية"}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:border-yellow-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">وصف إضافي</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="أي معلومات إضافية..."
                    rows={2}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:border-yellow-500 outline-none resize-none"
                  />
                </div>
              </>
            )}

            {/* Workshop Specific */}
            {serviceType === "workshop" && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">الخدمات المقدمة</label>
                <input
                  type="text"
                  value={workshopServices}
                  onChange={(e) => setWorkshopServices(e.target.value)}
                  placeholder="مثال: ميكانيكا، كهرباء، برمجة، بودي"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:border-yellow-500 outline-none"
                />
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !name || !phone || !city}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-3 rounded-xl transition"
            >
              {loading ? "جاري الإرسال..." : "إرسال الطلب"}
            </button>

            <p className="text-xs text-gray-500 text-center">
              سيتم مراجعة بياناتك والموافقة عليها من قبل إدارة مير
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
