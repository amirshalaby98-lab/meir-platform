import { useState, useEffect } from "react";
import { Link } from "wouter";

export default function PromoBanner() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Set promo end date to 7 days from now (rolling promo)
    const stored = localStorage.getItem("promo_end_date");
    let endDate: Date;
    if (stored) {
      endDate = new Date(stored);
      if (endDate < new Date()) {
        // Reset if expired
        endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        localStorage.setItem("promo_end_date", endDate.toISOString());
      }
    } else {
      endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      localStorage.setItem("promo_end_date", endDate.toISOString());
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;
      if (distance < 0) {
        clearInterval(timer);
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (dismissed) return null;

  return (
    <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
      </div>
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-right">
            <span className="text-2xl animate-bounce">🎉</span>
            <div>
              <p className="font-bold text-lg">خصم 20% على أول خدمة!</p>
              <p className="text-red-100 text-sm">استخدم كود: MEIR20</p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-200">ينتهي خلال:</span>
            <div className="flex gap-1">
              {[
                { val: timeLeft.days, label: "يوم" },
                { val: timeLeft.hours, label: "ساعة" },
                { val: timeLeft.minutes, label: "دقيقة" },
                { val: timeLeft.seconds, label: "ثانية" },
              ].map((t, i) => (
                <div key={i} className="bg-white/20 rounded px-2 py-1 text-center min-w-[40px]">
                  <div className="text-sm font-bold font-mono">{String(t.val).padStart(2, "0")}</div>
                  <div className="text-[9px] text-red-200">{t.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/price-calculator">
              <button className="bg-white text-red-600 font-bold px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition">
                احسب السعر
              </button>
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="text-white/60 hover:text-white text-xl leading-none"
              aria-label="إغلاق"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
