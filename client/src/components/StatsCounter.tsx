import { useEffect, useState, useRef } from "react";

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  icon: string;
}

const stats: StatItem[] = [
  { value: 500, suffix: "+", label: "عميل راضي", icon: "👥" },
  { value: 1000, suffix: "+", label: "خدمة منجزة", icon: "🔧" },
  { value: 4.9, suffix: "", label: "تقييم العملاء", icon: "⭐" },
  { value: 30, suffix: " دقيقة", label: "متوسط وقت الوصول", icon: "⏱️" },
];

function AnimatedNumber({ target, suffix, isDecimal }: { target: number; suffix: string; isDecimal?: boolean }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCurrent(target);
              clearInterval(timer);
            } else {
              setCurrent(current);
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-3xl sm:text-4xl font-bold text-yellow-400">
      {isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString("ar-SA")}
      {suffix}
    </div>
  );
}

export default function StatsCounter() {
  return (
    <section className="py-14 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">إنجازاتنا بالأرقام</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, i) => (
            <div key={i} className="text-center p-4">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <AnimatedNumber target={stat.value} suffix={stat.suffix} isDecimal={stat.value % 1 !== 0} />
              <div className="text-gray-400 text-sm mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
