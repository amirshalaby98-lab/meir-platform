import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Award, Clock, Users, CheckCircle2, BookOpen } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function TrainingSection() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    program: "بطاريات",
    level: "مبتدئ",
    experience: "",
  });

  const programs = [
    {
      icon: "🔋",
      title: "تدريب البطاريات",
      description: "تشخيص وصيانة واستبدال البطاريات",
      duration: "أسبوعان",
      level: "مبتدئ - متوسط",
      topics: ["أنواع البطاريات", "الفحص والتشخيص", "الشحن والصيانة", "السلامة المهنية"],
    },
    {
      icon: "⚡",
      title: "تدريب السلف والدينمو",
      description: "إصلاح وصيانة أنظمة الشحن والتشغيل",
      duration: "3 أسابيع",
      level: "متوسط - متقدم",
      topics: ["نظام الشحن", "نظام التشغيل", "التشخيص الكهربائي", "الإصلاح والاستبدال"],
    },
    {
      icon: "🧠",
      title: "تشخيص ECU المتقدم",
      description: "تشخيص الأعطال الإلكترونية باستخدام أجهزة OBD",
      duration: "شهر واحد",
      level: "متقدم",
      topics: ["قراءة أكواد الأعطال", "تحليل البيانات", "برمجة ECU", "حل المشاكل المعقدة"],
    },
    {
      icon: "🛠️",
      title: "الصيانة الشاملة",
      description: "برنامج تدريبي شامل لجميع أنظمة السيارة",
      duration: "3 أشهر",
      level: "مبتدئ - متقدم",
      topics: ["المحرك", "الكهرباء", "التشخيص", "السلامة", "خدمة العملاء"],
    },
  ];

  const stats = [
    { icon: Users, label: "فني مدرب", value: "500+" },
    { icon: Award, label: "شهادة معتمدة", value: "450+" },
    { icon: GraduationCap, label: "برنامج تدريبي", value: "12" },
    { icon: CheckCircle2, label: "معدل النجاح", value: "95%" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `سلام مير، أرغب بالتسجيل في برنامج التدريب:\n\nالاسم: ${formData.name}\nالهاتف: ${formData.phone}\nالبريد: ${formData.email}\nالبرنامج: ${formData.program}\nالمستوى: ${formData.level}\nالخبرة: ${formData.experience}`;
    window.open(`https://wa.me/966543257872?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section id="training" className="py-20 bg-gradient-to-br from-gray-50 via-white to-yellow-50">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 px-4 py-2 rounded-full mb-4">
            <GraduationCap className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-semibold text-yellow-700">أكاديمية مير للتدريب</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            برامج تدريب احترافية للفنيين
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            انضم إلى أكاديمية مير واحصل على شهادات معتمدة في صيانة السيارات من خبراء متخصصين
          </p>
          <Link href="/courses">
            <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
              انتقل إلى منصة التدريب
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
              <stat.icon className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Training Programs */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">البرامج التدريبية</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {programs.map((program, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-5xl">{program.icon}</div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{program.title}</h4>
                    <p className="text-gray-600 mb-4">{program.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span>{program.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <BookOpen className="w-4 h-4 text-yellow-500" />
                    <span>{program.level}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">محتوى البرنامج:</div>
                  <ul className="space-y-2">
                    {program.topics.map((topic, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Registration Form */}
        <Card className="p-8 md:p-12 bg-gradient-to-br from-yellow-50 to-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-3">سجل الآن في برنامج التدريب</h3>
              <p className="text-gray-600">املأ النموذج وسنتواصل معك لتأكيد التسجيل</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="أدخل اسمك الكامل"
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
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البرنامج التدريبي *
                  </label>
                  <select
                    required
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  >
                    <option value="" disabled>اختر البرنامج</option>
                    <option value="بطاريات">تدريب البطاريات</option>
                    <option value="سلف ودينمو">تدريب السلف والدينمو</option>
                    <option value="ECU">تشخيص ECU المتقدم</option>
                    <option value="شامل">الصيانة الشاملة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المستوى الحالي *
                  </label>
                  <select
                    required
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  >
                    <option value="" disabled>اختر المستوى</option>
                    <option value="مبتدئ">مبتدئ</option>
                    <option value="متوسط">متوسط</option>
                    <option value="متقدم">متقدم</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    سنوات الخبرة
                  </label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="مثلاً: سنتان"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg py-6"
              >
                <GraduationCap className="w-5 h-5 ml-2" />
                سجل الآن عبر واتساب
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </section>
  );
}
