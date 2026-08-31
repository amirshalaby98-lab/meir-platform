import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Wrench, Clock, Shield, MapPin, Cpu } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden" style={{
      backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663166202679/WEMMmNCeUUSJvvUyfwdWoi/hero-mechanic-cGqCeyu2QDzmWGK39cv5X7.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="absolute inset-0 bg-black/70"></div>
      <div className="container text-center relative z-10 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          فني سيارات يوصلك <span className="text-yellow-400">وين ما كنت</span>
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed">
          صيانة متنقلة في مكة وجدة. فحص وتشخيص وإصلاح عند بابك.
        </p>

        {/* زرين بارزين */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/service-request">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-xl sm:text-2xl px-10 sm:px-14 py-6 sm:py-8 shadow-2xl rounded-xl transition-all hover:scale-105 animate-pulse hover:animate-none">
              <Wrench className="w-6 h-6 ml-2" />
              اطلب خدمة الآن
            </Button>
          </Link>
          <Link href="/obd-scanner">
            <Button className="bg-white/10 hover:bg-white/20 text-white border-2 border-yellow-400 font-bold text-lg sm:text-xl px-8 sm:px-10 py-5 sm:py-7 shadow-xl rounded-xl transition-all hover:scale-105">
              <Cpu className="w-6 h-6 ml-2 text-yellow-400" />
              تشخيص ذكي مجاني
            </Button>
          </Link>
        </div>

        {/* مميزات مختصرة */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto">
          <div className="flex flex-col items-center gap-2 text-white/90">
            <Clock className="w-8 h-8 text-yellow-400" />
            <span className="text-sm font-medium">وصول سريع</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-white/90">
            <Shield className="w-8 h-8 text-yellow-400" />
            <span className="text-sm font-medium">فنيون معتمدون</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-white/90">
            <Wrench className="w-8 h-8 text-yellow-400" />
            <span className="text-sm font-medium">تشخيص ذكي</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-white/90">
            <MapPin className="w-8 h-8 text-yellow-400" />
            <span className="text-sm font-medium">مكة وجدة</span>
          </div>
        </div>
      </div>
    </section>
  );
}
