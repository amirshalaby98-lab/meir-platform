import { Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function TestimonialsSection() {
  const { data: reviews } = trpc.review.getApproved.useQuery();

  // Fallback testimonials if no reviews in database
  const fallbackTestimonials = [
    {
      id: 1,
      name: "محمد علي",
      location: "مكة المكرمة",
      rating: 5,
      comment: "خدمة ممتازة جداً! الفني وصل في الوقت المحدد وحل المشكلة بسرعة واحترافية. أنصح الجميع بخدمات مير.",
      service: "استبدال البطارية",
    },
    {
      id: 2,
      name: "فاطمة محمود",
      location: "جدة",
      rating: 5,
      comment: "تعطلت سيارتي على الطريق وتواصلت معهم عبر واتساب. وصلوا في أقل من 30 دقيقة وحلوا المشكلة. شكراً لكم!",
      service: "خدمة طوارئ",
    },
    {
      id: 3,
      name: "أحمد سالم",
      location: "مكة المكرمة",
      rating: 5,
      comment: "الأسعار عادلة جداً والفنيين محترفين. تشخيص دقيق وشرح واضح لكل شيء. سأتعامل معهم مجدداً.",
      service: "تشخيص أعطال",
    },
    {
      id: 4,
      name: "ليلى عبدالله",
      location: "جدة",
      rating: 5,
      comment: "خدمة احترافية من البداية للنهاية. الفني كان ودود وملتزم بالمواعيد. أفضل خدمة صيانة استخدمتها.",
      service: "صيانة دينمو",
    },
    {
      id: 5,
      name: "سعود الغامدي",
      location: "مكة المكرمة",
      rating: 5,
      comment: "لا كلام عن الخدمة! فنيين محترفين وسريعين. بدون لف ودوران. موصى به 100%",
      service: "تشخيص ECU",
    },
    {
      id: 6,
      name: "نور الدين",
      location: "جدة",
      rating: 5,
      comment: "أفضل خدمة صيانة سيارات متنقلة في المنطقة. الفني وصل بسرعة والخدمة كانت احترافية جداً.",
      service: "استبدال طرمبة البنزين",
    },
  ];

  const testimonials = reviews && reviews.length > 0 
    ? reviews.map(review => ({
        id: review.id,
        name: review.name,
        location: review.location,
        service: review.service,
        rating: review.rating,
        comment: review.comment,
      }))
    : fallbackTestimonials;

  return (
    <section className="py-20 bg-gray-50">
      <div className="container">
        <h2 className="text-4xl font-bold text-center text-black mb-4">
          آراء عملائنا
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          اطلع على تقييمات عملائنا الراضين عن خدماتنا الاحترافية والسريعة
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100"
            >
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 mb-4 leading-relaxed">
                "{testimonial.comment}"
              </p>

              {/* Service Tag */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                  {testimonial.service}
                </span>
              </div>

              {/* Author Info */}
              <div className="border-t border-gray-200 pt-4">
                <p className="font-bold text-black">{testimonial.name}</p>
                <p className="text-sm text-gray-600">📍 {testimonial.location}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Review CTA */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-700 mb-4">
            هل استفدت من خدماتنا؟ شارك تقييمك معنا!
          </p>
          <Link href="/add-review">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-3">
              ⭐ أضف تقييمك
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
