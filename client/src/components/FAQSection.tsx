import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQSection() {
  const faqs = [
    {
      question: "ما هي مناطق الخدمة؟",
      answer:
        "نقدم خدماتنا في مكة المكرمة وجدة. نعمل على مدار 24 ساعة يومياً لخدمتك في جميع أنحاء المدينتين.",
    },
    {
      question: "كم يستغرق وصول الفني؟",
      answer:
        "عادةً ما يصل الفني خلال 30-45 دقيقة من وقت الاتصال، حسب موقعك وحالة الطريق. في حالات الطوارئ، نحاول الوصول في أسرع وقت ممكن.",
    },
    {
      question: "ما هي طرق الدفع المتاحة؟",
      answer:
        "نقبل الدفع النقدي، التحويل البنكي، وبطاقات الائتمان. يمكنك الدفع بعد إتمام الخدمة مباشرة.",
    },
    {
      question: "هل تقدمون ضمان على الخدمات؟",
      answer:
        "نعم، نقدم ضمان على جميع قطع الغيار والخدمات المقدمة. مدة الضمان تختلف حسب نوع الخدمة والقطعة المستبدلة.",
    },
    {
      question: "كيف يمكنني حجز موعد؟",
      answer:
        "يمكنك حجز موعد من خلال نموذج الحجز في الموقع، أو التواصل معنا مباشرة عبر واتساب على الرقم 0543257872.",
    },
    {
      question: "هل تقدمون خدمة الطوارئ؟",
      answer:
        "نعم، نقدم خدمة طوارئ على مدار 24 ساعة. إذا تعطلت سيارتك على الطريق، اتصل بنا فوراً وسنصل إليك في أسرع وقت.",
    },
    {
      question: "ما هي تكلفة الخدمات؟",
      answer:
        "التكلفة تختلف حسب نوع الخدمة والقطع المطلوبة. نقدم تقييم مجاني قبل بدء العمل، وأسعارنا تنافسية جداً مقارنة بالسوق.",
    },
    {
      question: "هل تعملون في أيام العطلات؟",
      answer:
        "نعم، نعمل طوال أيام الأسبوع بما في ذلك العطلات والأعياد. خدماتنا متاحة 24/7 لراحتك.",
    },
    {
      question: "هل يمكنني إلغاء أو تعديل الموعد؟",
      answer:
        "نعم، يمكنك إلغاء أو تعديل موعدك بالتواصل معنا عبر واتساب أو الهاتف. نفضل الإشعار المسبق قدر الإمكان.",
    },
    {
      question: "ما هي الخدمات التي تقدمونها؟",
      answer:
        "نقدم مجموعة واسعة من الخدمات تشمل: استبدال البطارية، إصلاح السلف والدينمو، تشخيص أعطال ECU، صيانة طرمبة البنزين، وحل جميع أعطال الطريق.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container">
        <h2 className="text-4xl font-bold text-center text-black mb-4">
          الأسئلة الشائعة
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          إجابات على أكثر الأسئلة شيوعاً حول خدماتنا وطرق العمل
        </p>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-gray-50 border border-gray-200 rounded-lg px-6 data-[state=open]:bg-yellow-50 data-[state=open]:border-yellow-300 transition-colors"
              >
                <AccordionTrigger className="text-right hover:no-underline py-4">
                  <span className="font-bold text-black text-lg">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-lg text-gray-700 mb-4">
            لم تجد إجابة لسؤالك؟ تواصل معنا مباشرة
          </p>
          <a
            href="https://wa.me/966543257872?text=لدي%20سؤال%20عن%20خدماتكم"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors"
          >
            💬 تواصل عبر واتساب
          </a>
        </div>
      </div>
    </section>
  );
}
