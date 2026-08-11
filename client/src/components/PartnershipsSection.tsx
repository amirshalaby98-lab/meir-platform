import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Handshake, Building2, TrendingUp, Users, CheckCircle2, Sparkles } from "lucide-react";
import { useState } from "react";

export default function PartnershipsSection() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    website: "",
    trainingType: "",
    message: "",
  });

  const partners = [
    {
      name: "أكاديمية التميز للتدريب التقني",
      logo: "🎓",
      description: "متخصصون في تدريب الفنيين على أحدث التقنيات",
      specialization: "تشخيص ECU والإلكترونيات",
      trainees: "150+ فني",
      rating: "4.9",
    },
    {
      name: "معهد المهارات الفنية المتقدمة",
      logo: "⚙️",
      description: "خبرة 15 عاماً في تدريب فنيي السيارات",
      specialization: "الميكانيكا والكهرباء",
      trainees: "200+ فني",
      rating: "4.8",
    },
    {
      name: "مركز الابتكار للتدريب المهني",
      logo: "💡",
      description: "برامج تدريبية معتمدة دولياً",
      specialization: "الصيانة الشاملة",
      trainees: "100+ فني",
      rating: "4.7",
    },
    {
      name: "أكاديمية المستقبل التقنية",
      logo: "🚀",
      description: "تدريب عملي على أحدث المعدات",
      specialization: "أنظمة الشحن والتشغيل",
      trainees: "80+ فني",
      rating: "4.9",
    },
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "نمو مستمر",
      description: "الوصول إلى شبكة واسعة من الفنيين الباحثين عن التدريب",
    },
    {
      icon: Users,
      title: "تدفق متواصل",
      description: "ضمان تدفق مستمر من المتدربين المؤهلين",
    },
    {
      icon: Handshake,
      title: "شراكة استراتيجية",
      description: "تعاون طويل الأمد مع علامة تجارية موثوقة",
    },
    {
      icon: Sparkles,
      title: "تسويق مجاني",
      description: "عرض شركتك على موقعنا ومنصاتنا الرقمية",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `سلام مير، نرغب في عقد شراكة تدريبية:\n\nاسم الشركة: ${formData.companyName}\nالشخص المسؤول: ${formData.contactPerson}\nالهاتف: ${formData.phone}\nالبريد: ${formData.email}\nالموقع: ${formData.website}\nنوع التدريب: ${formData.trainingType}\n\nالرسالة:\n${formData.message}`;
    window.open(`https://wa.me/966543257872?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section id="partnerships" className="py-20 bg-gradient-to-br from-white via-yellow-50 to-gray-50">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 px-4 py-2 rounded-full mb-4">
            <Handshake className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-semibold text-yellow-700">شركاء النجاح</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            شركاؤنا في التدريب والتطوير
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            نتعاون مع أفضل مراكز التدريب المعتمدة لتطوير مهارات الفنيين وتقديم أفضل خدمة للعملاء
          </p>
        </div>

        {/* Partners Grid */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">شركاؤنا المعتمدون</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {partners.map((partner, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-6xl">{partner.logo}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-xl font-bold text-gray-900">{partner.name}</h4>
                      <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded">
                        <span className="text-yellow-600 text-sm">⭐</span>
                        <span className="text-sm font-semibold text-yellow-700">{partner.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{partner.description}</p>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-700">
                      <strong>التخصص:</strong> {partner.specialization}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-700">
                      <strong>عدد المتدربين:</strong> {partner.trainees}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            مزايا الشراكة مع مير
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <benefit.icon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h4>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Partnership Form */}
        <Card className="p-8 md:p-12 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                هل أنت مركز تدريب؟ انضم لشركائنا
              </h3>
              <p className="text-gray-600">
                املأ النموذج وسنتواصل معك لمناقشة فرص الشراكة
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الشركة / المركز *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="أكاديمية التميز"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الشخص المسؤول *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="أحمد محمد"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="05XXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="info@academy.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الموقع الإلكتروني
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="https://academy.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع التدريب المقدم *
                  </label>
                  <select
                    required
                    value={formData.trainingType}
                    onChange={(e) => setFormData({ ...formData, trainingType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  >
                    <option value="">اختر النوع</option>
                    <option value="ميكانيكا">ميكانيكا السيارات</option>
                    <option value="كهرباء">كهرباء السيارات</option>
                    <option value="إلكترونيات">إلكترونيات وتشخيص ECU</option>
                    <option value="شامل">تدريب شامل</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رسالة / معلومات إضافية
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                  placeholder="أخبرنا المزيد عن مركزكم التدريبي وبرامجكم..."
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg py-6"
              >
                <Handshake className="w-5 h-5 ml-2" />
                تواصل معنا للشراكة
              </Button>
            </form>

            <div className="mt-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">ما الذي نبحث عنه في الشريك؟</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• مركز تدريب معتمد ومرخص</li>
                    <li>• خبرة في تدريب فنيي السيارات</li>
                    <li>• التزام بمعايير الجودة العالية</li>
                    <li>• القدرة على تقديم شهادات معتمدة</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
