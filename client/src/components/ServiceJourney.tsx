import { Phone, MapPin, Wrench, CheckCircle, Clock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function ServiceJourney() {
  const steps = [
    {
      id: 1,
      icon: Phone,
      title: "اطلب الخدمة",
      description: "تواصل معنا عبر واتساب أو احجز موعد من الموقع",
      color: "bg-yellow-400",
      iconColor: "text-black",
    },
    {
      id: 2,
      icon: Clock,
      title: "تأكيد الموعد",
      description: "نؤكد موعدك خلال دقائق ونرسل تفاصيل الفني",
      color: "bg-blue-400",
      iconColor: "text-white",
    },
    {
      id: 3,
      icon: MapPin,
      title: "الفني في الطريق",
      description: "تتبع موقع الفني مباشرة حتى وصوله إليك",
      color: "bg-green-400",
      iconColor: "text-white",
    },
    {
      id: 4,
      icon: Wrench,
      title: "التشخيص والإصلاح",
      description: "فحص دقيق وإصلاح احترافي في موقعك",
      color: "bg-orange-400",
      iconColor: "text-white",
    },
    {
      id: 5,
      icon: CheckCircle,
      title: "الدفع والتقييم",
      description: "ادفع بالطريقة المناسبة لك وشارك تقييمك",
      color: "bg-purple-400",
      iconColor: "text-white",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-4">
            كيف تعمل خدمة مير؟
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            خمس خطوات بسيطة تفصلك عن حل مشكلة سيارتك. سريع، واضح، وبدون تعقيد
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop Only */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-yellow-200 via-blue-200 via-green-200 via-orange-200 to-purple-200 -z-10" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Step Card */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-100 h-full flex flex-col">
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 -right-4 w-10 h-10 bg-black text-yellow-400 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.id}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 ${step.color} rounded-lg flex items-center justify-center mb-4 mx-auto`}>
                    <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-black text-center mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow - Desktop Only */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -left-4 transform -translate-y-1/2 text-gray-300 text-3xl">
                    ←
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border-2 border-yellow-200">
            <h3 className="text-2xl font-bold text-black mb-4">
              جاهز لتجربة الخدمة؟
            </h3>
            <p className="text-gray-700 mb-6 max-w-xl mx-auto">
              انضم لآلاف العملاء الراضين واحصل على خدمة صيانة احترافية في موقعك
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://wa.me/966543257872?text=سلام%20مير،%20عندي%20عطل%20وموقعي%20هو:"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold shadow-lg text-lg px-8 py-6">
                  <Phone className="w-5 h-5 ml-2" />
                  اطلب فني الآن
                </Button>
              </a>
              <Link href="/how-it-works">
                <Button variant="outline" className="border-2 border-yellow-400 text-black hover:bg-yellow-50 font-bold text-lg px-8 py-6">
                  اعرف المزيد عن الخدمة
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
