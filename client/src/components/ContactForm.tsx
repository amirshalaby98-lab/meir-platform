import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const createContact = trpc.contact.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("تم استقبال رسالتك! سنتواصل معك قريباً");

      // Reset form
      setFormData({ name: "", phone: "", email: "", message: "" });

      // Hide success message after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.email || !formData.message) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    createContact.mutate(formData);
  };

  return (
    <section className="py-20 bg-white">
      <div className="container">
        <h2 className="text-4xl font-bold text-center text-black mb-4">
          تواصل معنا
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          هل لديك استفسار أو تحتاج إلى خدمة طارئة؟ تواصل معنا الآن وسنرد عليك في أسرع وقت
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Phone className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-black mb-1">الهاتف</h3>
                <a
                  href="tel:+966543257872"
                  className="text-gray-600 hover:text-yellow-400 transition-colors"
                >
                  0543257872
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Mail className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-black mb-1">البريد الإلكتروني</h3>
                <a
                  href="mailto:info@meir.sa"
                  className="text-gray-600 hover:text-yellow-400 transition-colors"
                >
                  info@meir.sa
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <MapPin className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-black mb-1">المناطق</h3>
                <p className="text-gray-600">مكة المكرمة وجدة</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="اسمك الكامل"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                  disabled={createContact.isPending}
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="رقم الهاتف"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                  disabled={createContact.isPending}
                  required
                />
              </div>

              <input
                type="email"
                name="email"
                placeholder="بريدك الإلكتروني"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                disabled={createContact.isPending}
                required
              />

              <textarea
                name="message"
                placeholder="اكتب رسالتك هنا..."
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all resize-none"
                disabled={createContact.isPending}
                required
              />

              <Button
                type="submit"
                disabled={createContact.isPending}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 transition-all"
              >
                {createContact.isPending ? "جاري الإرسال..." : "أرسل الرسالة"}
              </Button>
            </form>

            {submitted && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-700 font-semibold">تم استقبال رسالتك بنجاح!</p>
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-black mb-3">تحتاج مساعدة فورية؟</h3>
          <p className="text-gray-700 mb-6">تواصل معنا عبر واتساب للحصول على استجابة سريعة</p>
          <a
            href="https://wa.me/966543257872?text=السلام%20عليكم%20ورحمة%20الله%20وبركاته"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3">
              💬 تواصل عبر واتساب
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
