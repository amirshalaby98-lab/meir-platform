import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-yellow-400 to-yellow-500">
      <div className="container text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
          جاهز نحل المشكلة؟
        </h2>
        <p className="text-lg text-black/80 mb-8 max-w-2xl mx-auto">
          لا تنتظر! اتصل بنا الآن وسيصل إليك فنينا المحترف في أسرع وقت
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/price-calculator">
            <Button className="bg-black hover:bg-gray-900 text-yellow-400 font-bold text-lg px-10 py-6 shadow-lg">
              احسب التكلفة
            </Button>
          </Link>
          <a href="#booking">
            <Button className="bg-white/90 hover:bg-white text-black font-bold text-lg px-10 py-6 shadow-lg">
              اطلب فني الآن
            </Button>
          </a>
          <a
            href="https://wa.me/966543257872"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="border-black text-black hover:bg-black/10 font-bold text-lg px-10 py-6 shadow-lg">
              واتساب
            </Button>
          </a>
        </div>
</div>
    </section>
  );
}
