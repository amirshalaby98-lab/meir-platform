import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Phone, MapPin, Wrench, CheckCircle, Clock, MessageCircle, Shield, CreditCard, Star, Calendar, Navigation, FileText } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HowItWorks() {
  const mainSteps = [
    {
      id: 1,
      icon: Phone,
      title: "اطلب الخدمة",
      description: "تواصل معنا عبر واتساب أو احجز موعد من الموقع",
      details: [
        "اختر الخدمة المطلوبة (بطارية، سلف، دينمو، إلخ)",
        "حدد موقعك بدقة (مكة أو جدة)",
        "اختر الوقت المناسب لك",
        "أضف تفاصيل سيارتك (اختياري لتسريع الخدمة)",
      ],
      color: "bg-yellow-400",
      iconColor: "text-black",
    },
    {
      id: 2,
      icon: Clock,
      title: "تأكيد الموعد",
      description: "نؤكد موعدك خلال دقائق ونرسل تفاصيل الفني",
      details: [
        "تلقي رسالة تأكيد فورية عبر واتساب",
        "معلومات الفني (الاسم، الصورة، التقييم)",
        "السعر التقديري للخدمة",
        "رقم الحجز لتتبع الطلب",
      ],
      color: "bg-blue-400",
      iconColor: "text-white",
    },
    {
      id: 3,
      icon: MapPin,
      title: "الفني في الطريق",
      description: "تتبع موقع الفني مباشرة حتى وصوله إليك",
      details: [
        "تتبع مباشر لموقع الفني على الخريطة",
        "إشعارات تلقائية عند اقتراب الفني",
        "إمكانية التواصل مع الفني مباشرة",
        "وقت الوصول المتوقع بدقة",
      ],
      color: "bg-green-400",
      iconColor: "text-white",
    },
    {
      id: 4,
      icon: Wrench,
      title: "التشخيص والإصلاح",
      description: "فحص دقيق وإصلاح احترافي في موقعك",
      details: [
        "فحص شامل للمشكلة باستخدام أجهزة متطورة",
        "شرح واضح للعطل والحل المقترح",
        "إصلاح فوري إذا كان العطل بسيطاً",
        "نقل للورشة المعتمدة إذا كان العطل ثقيلاً",
      ],
      color: "bg-orange-400",
      iconColor: "text-white",
    },
    {
      id: 5,
      icon: CheckCircle,
      title: "الدفع والتقييم",
      description: "ادفع بالطريقة المناسبة لك وشارك تقييمك",
      details: [
        "الدفع نقداً أو إلكترونياً (مدى، فيزا، ماستركارد)",
        "فاتورة إلكترونية فورية",
        "ضمان على الخدمة والقطع المستبدلة",
        "تقييم الخدمة واكسب نقاط ولاء",
      ],
      color: "bg-purple-400",
      iconColor: "text-white",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "ضمان الجودة",
      description: "نضمن جودة العمل والقطع المستخدمة لمدة 3 أشهر",
    },
    {
      icon: CreditCard,
      title: "أسعار شفافة",
      description: "لا توجد رسوم خفية - السعر المعلن هو السعر النهائي",
    },
    {
      icon: Star,
      title: "فنيون محترفون",
      description: "جميع فنيينا معتمدون وذوو خبرة عالية",
    },
    {
      icon: Calendar,
      title: "خدمة 24/7",
      description: "نعمل على مدار الساعة لخدمتك في أي وقت",
    },
  ];

  const faqs = [
    {
      question: "كم يستغرق وصول الفني؟",
      answer: "في الحالات العادية، يصل الفني خلال 30-45 دقيقة. في حالات الطوارئ، نسعى للوصول خلال 20 دقيقة.",
    },
    {
      question: "هل يمكنني تغيير أو إلغاء الموعد؟",
      answer: "نعم، يمكنك تغيير أو إلغاء الموعد مجاناً حتى 15 دقيقة قبل الموعد المحدد.",
    },
    {
      question: "ماذا لو كان العطل ثقيلاً ويحتاج ورشة؟",
      answer: "نقوم بنقل سيارتك مجاناً إلى أحد ورشنا المعتمدة ونتابع معك حتى اكتمال الإصلاح.",
    },
    {
      question: "هل تقدمون فواتير رسمية؟",
      answer: "نعم، نرسل فاتورة إلكترونية رسمية فوراً بعد إتمام الخدمة عبر واتساب والبريد الإلكتروني.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-yellow-50 to-white py-20">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl font-bold text-black mb-6">
                كيف تعمل خدمة مير؟
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                نجعل صيانة سيارتك سهلة وسريعة وشفافة. تعرف على رحلة الخدمة الكاملة من البداية للنهاية
              </p>
              <a
                href="https://wa.me/966543257872?text=سلام%20مير،%20عندي%20عطل%20وموقعي%20هو:"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold shadow-lg text-lg px-8 py-6">
                  <Phone className="w-5 h-5 ml-2" />
                  ابدأ الآن
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Detailed Steps */}
        <section className="py-20 bg-white">
          <div className="container">
            <h2 className="text-4xl font-bold text-black text-center mb-16">
              خطوات الخدمة بالتفصيل
            </h2>

            <div className="space-y-16">
              {mainSteps.map((step, index) => (
                <div key={step.id} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center`}>
                  {/* Icon Side */}
                  <div className="lg:w-1/3">
                    <div className="relative">
                      {/* Step Number */}
                      <div className="absolute -top-6 -right-6 w-16 h-16 bg-black text-yellow-400 rounded-full flex items-center justify-center font-bold text-2xl shadow-xl z-10">
                        {step.id}
                      </div>
                      
                      {/* Icon Container */}
                      <div className={`w-48 h-48 ${step.color} rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform hover:scale-105 transition-transform`}>
                        <step.icon className={`w-24 h-24 ${step.iconColor}`} />
                      </div>
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="lg:w-2/3">
                    <h3 className="text-3xl font-bold text-black mb-4">
                      {step.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-6">
                      {step.description}
                    </p>
                    <ul className="space-y-3">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-gray-50">
          <div className="container">
            <h2 className="text-4xl font-bold text-black text-center mb-16">
              لماذا تختار مير؟
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center">
                  <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20 bg-white">
          <div className="container max-w-4xl">
            <h2 className="text-4xl font-bold text-black text-center mb-16">
              أسئلة شائعة عن الخدمة
            </h2>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200">
                  <h3 className="text-xl font-bold text-black mb-3 flex items-start gap-3">
                    <MessageCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                    {faq.question}
                  </h3>
                  <p className="text-gray-700 mr-9">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">لديك سؤال آخر؟</p>
              <Link href="/">
                <Button variant="outline" className="border-2 border-yellow-400 text-black hover:bg-yellow-50 font-bold">
                  تواصل معنا
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-r from-yellow-400 to-orange-400">
          <div className="container text-center">
            <h2 className="text-4xl font-bold text-black mb-6">
              جاهز لتجربة الخدمة؟
            </h2>
            <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
              انضم لآلاف العملاء الراضين واحصل على خدمة صيانة احترافية في موقعك خلال دقائق
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://wa.me/966543257872?text=سلام%20مير،%20عندي%20عطل%20وموقعي%20هو:"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-black hover:bg-gray-800 text-yellow-400 font-bold shadow-xl text-lg px-8 py-6">
                  <Phone className="w-5 h-5 ml-2" />
                  اطلب فني الآن
                </Button>
              </a>
              <Link href="/price-calculator">
                <Button variant="outline" className="bg-white border-2 border-black text-black hover:bg-gray-100 font-bold text-lg px-8 py-6">
                  احسب التكلفة
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
