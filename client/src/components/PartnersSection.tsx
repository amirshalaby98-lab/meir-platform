import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, CheckCircle2, Wrench, Shield, Clock } from "lucide-react";

export default function PartnersSection() {
  const partners = [
    {
      name: "ورشة النخبة للسيارات",
      specialty: "صيانة محركات",
      location: "مكة المكرمة",
    },
    {
      name: "مركز الخليج للصيانة",
      specialty: "كهرباء وإلكترونيات",
      location: "جدة",
    },
    {
      name: "ورشة الأمانة المتقدمة",
      specialty: "ميكانيكا عامة",
      location: "مكة المكرمة",
    },
    {
      name: "مركز التميز للسيارات",
      specialty: "فحص شامل",
      location: "جدة",
    },
  ];

  const features = [
    {
      icon: CheckCircle2,
      title: "ورش معتمدة",
      description: "جميع ورشنا المتعاونة معتمدة ومرخصة",
    },
    {
      icon: Shield,
      title: "ضمان الجودة",
      description: "نضمن جودة العمل في جميع الورش المتعاونة",
    },
    {
      icon: Clock,
      title: "سرعة الإنجاز",
      description: "نلتزم بمواعيد التسليم المحددة",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-yellow-500 text-black hover:bg-yellow-600">
            <Building2 className="w-4 h-4 ml-1" />
            شبكة الورش المتعاونة
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            متعاونون مع أفضل الورش المعتمدة
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            عندما يكون العطل ثقيلاً ويحتاج إلى معدات متخصصة، نقوم بنقل سيارتك إلى أحد ورشنا المتعاونة المعتمدة لضمان أفضل خدمة ممكنة
          </p>
        </div>

        {/* How It Works */}
        <Card className="mb-12 border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-white">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Wrench className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">كيف نعمل؟</h3>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      1
                    </span>
                    <p>
                      <strong>الفحص الأولي:</strong> يقوم فنيونا بفحص سيارتك في موقعك أولاً
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      2
                    </span>
                    <p>
                      <strong>التقييم:</strong> إذا كان العطل بسيطاً، نصلحه في الموقع فوراً
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      3
                    </span>
                    <p>
                      <strong>النقل للورشة:</strong> إذا كان العطل ثقيلاً، نقوم بنقل السيارة إلى ورشة معتمدة متخصصة
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      4
                    </span>
                    <p>
                      <strong>المتابعة:</strong> نبقى على تواصل معك حتى اكتمال الإصلاح وإعادة السيارة
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-yellow-400 transition-all hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Partners Grid */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-8">ورشنا المتعاونة</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partners.map((partner, index) => (
              <Card key={index} className="hover:shadow-xl transition-all hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-black" />
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-center">{partner.name}</h4>
                  <div className="space-y-2 text-sm text-center">
                    <Badge variant="secondary" className="w-full">
                      {partner.specialty}
                    </Badge>
                    <p className="text-gray-600">{partner.location}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-2 text-green-600 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-bold">معتمدة</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-black to-gray-900 text-white border-0">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-3">
                هل تحتاج إلى صيانة متخصصة؟
              </h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                لا تقلق! فريقنا سيقوم بتقييم العطل واختيار أفضل حل لك - سواء كان الإصلاح في الموقع أو في ورشة متخصصة
              </p>
              <a
                href="https://wa.me/966543257872?text=مرحباً، أحتاج إلى فحص سيارتي"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 rounded-lg transition-all transform hover:scale-105"
              >
                احجز فحص مجاني الآن
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
