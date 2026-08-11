import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function BookingForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    date: "",
    time: "",
    location: "",
    notes: "",
    carType: "",
    carBrand: "",
    carModel: "",
    carYear: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const createBooking = trpc.booking.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("تم حجز موعدك بنجاح! سنتواصل معك قريباً");

      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        service: "",
        date: "",
        time: "",
        location: "",
        notes: "",
        carType: "",
        carBrand: "",
        carModel: "",
        carYear: "",
      });

      // Hide success message after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const services = [
    { id: "battery", name: "🔋 بطارية" },
    { id: "starter", name: "⚡ سلف" },
    { id: "alternator", name: "🔌 دينمو" },
    { id: "ecu", name: "🧠 تشخيص ECU" },
    { id: "fuel-pump", name: "⛽ طرمبة بنزين" },
    { id: "roadside", name: "🛠️ أعطال الطريق" },
  ];

  const locations = [
    { id: "makkah", name: "مكة المكرمة" },
    { id: "jeddah", name: "جدة" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.phone ||
      !formData.service ||
      !formData.date ||
      !formData.time ||
      !formData.location
    ) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    createBooking.mutate(formData);
  };

  return (
    <section id="booking" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container">
        <h2 className="text-4xl font-bold text-center text-black mb-4">
          احجز موعدك الآن
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          اختر الخدمة المطلوبة والوقت المناسب لك، وسيصل إليك فنينا المحترف في الموعد المحدد
        </p>

        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="اسمك الكامل"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                disabled={createBooking.isPending}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="رقم الهاتف"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                disabled={createBooking.isPending}
                required
              />
            </div>

            {/* Email (optional) */}
            <input
              type="email"
              name="email"
              placeholder="البريد الإلكتروني (اختياري)"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
              disabled={createBooking.isPending}
            />

            {/* Service Selection */}
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
              disabled={createBooking.isPending}
              required
            >
              <option value="">اختر الخدمة</option>
              {services.map((service) => (
                <option key={service.id} value={service.name}>
                  {service.name}
                </option>
              ))}
            </select>

            {/* Location Selection */}
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
              disabled={createBooking.isPending}
              required
            >
              <option value="">اختر الموقع</option>
              {locations.map((location) => (
                <option key={location.id} value={location.name}>
                  {location.name}
                </option>
              ))}
            </select>

            {/* Vehicle Information */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-bold text-black">🚗 معلومات السيارة</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  name="carType"
                  value={formData.carType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                  disabled={createBooking.isPending}
                >
                  <option value="">نوع السيارة (اختياري)</option>
                  <option value="سيدان">سيدان</option>
                  <option value="صالون">صالون</option>
                  <option value="دفع رباعي">دفع رباعي (SUV)</option>
                  <option value="شاحنة">شاحنة</option>
                  <option value="فان">فان</option>
                  <option value="رياضية">رياضية</option>
                </select>

                <select
                  name="carBrand"
                  value={formData.carBrand}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                  disabled={createBooking.isPending}
                >
                  <option value="">الماركة (اختياري)</option>
                  <option value="تويوتا">تويوتا</option>
                  <option value="هيونداي">هيونداي</option>
                  <option value="فورد">فورد</option>
                  <option value="شيفروليه">شيفروليه</option>
                  <option value="نيسان">نيسان</option>
                  <option value="كيا">كيا</option>
                  <option value="مازدا">مازدا</option>
                  <option value="ميتسوبيشي">ميتسوبيشي</option>
                  <option value="هوندا">هوندا</option>
                  <option value="مرسيدس">مرسيدس</option>
                  <option value="BMW">BMW</option>
                  <option value="أودي">أودي</option>
                  <option value="لكزس">لكزس</option>
                  <option value="غيرها">غيرها</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="carModel"
                  placeholder="الموديل (مثلاً: كامري، سوناتا)"
                  value={formData.carModel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                  disabled={createBooking.isPending}
                />

                <select
                  name="carYear"
                  value={formData.carYear}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                  disabled={createBooking.isPending}
                >
                  <option value="">سنة الصنع (اختياري)</option>
                  {Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                  disabled={createBooking.isPending}
                  required
                />
              </div>
              <div className="relative">
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                  disabled={createBooking.isPending}
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <textarea
              name="notes"
              placeholder="ملاحظات إضافية (اختياري)"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all resize-none"
              disabled={createBooking.isPending}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={createBooking.isPending || submitted}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 rounded-lg transition-colors text-lg"
            >
              {createBooking.isPending ? (
                "جاري الحجز..."
              ) : submitted ? (
                <>
                  <CheckCircle className="w-5 h-5 ml-2 inline" />
                  تم الحجز بنجاح!
                </>
              ) : (
                "احجز الآن"
              )}
            </Button>
          </form>

          {/* WhatsApp Quick Booking */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-black mb-2">حجز سريع عبر واتساب</h3>
              <p className="text-gray-600">أرسل بياناتك مباشرة عبر واتساب</p>
            </div>
            <a
              href="https://wa.me/966543257872?text=مرحباً%20مير%2C%20أريد%20حجز%20موعد%20لصيانة%20سيارتي%0A%0A👤%20الاسم%3A%20%0A📞%20الهاتف%3A%20%0A🔧%20الخدمة%3A%20%0A📍%20الموقع%3A%20%0A📅%20التاريخ%3A%20%0A⏰%20الوقت%3A%20"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <span className="text-2xl">💬</span>
              <span>فتح واتساب للحجز السريع</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
