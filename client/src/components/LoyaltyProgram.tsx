import { Link } from "wouter";

export default function LoyaltyProgram() {
  const tiers = [
    { name: "برونزي", points: "0 - 99", discount: "5%", icon: "🥉", color: "bg-amber-100 border-amber-300" },
    { name: "فضي", points: "100 - 299", discount: "10%", icon: "🥈", color: "bg-gray-100 border-gray-300" },
    { name: "ذهبي", points: "300 - 599", discount: "15%", icon: "🥇", color: "bg-yellow-100 border-yellow-400" },
    { name: "بلاتيني", points: "600+", discount: "20%", icon: "💎", color: "bg-blue-50 border-blue-300" },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">برنامج الولاء</h2>
          <p className="text-gray-600 max-w-lg mx-auto">اكسب نقاط مع كل خدمة واستبدلها بخصومات حصرية. كل 1 ريال = 1 نقطة</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-10">
          {tiers.map((tier, i) => (
            <div key={i} className={`rounded-xl p-5 text-center border-2 ${tier.color} transition-transform hover:scale-105`}>
              <div className="text-3xl mb-2">{tier.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1">{tier.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{tier.points} نقطة</p>
              <div className="bg-white rounded-lg py-2 px-3">
                <span className="text-lg font-bold text-green-600">{tier.discount}</span>
                <p className="text-[10px] text-gray-500">خصم على الخدمات</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 md:p-8 max-w-3xl mx-auto text-white text-center">
          <h3 className="text-xl font-bold mb-3">كيف تكسب النقاط؟</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl mb-1">🔧</div>
              <p className="text-sm font-semibold">كل خدمة</p>
              <p className="text-xs text-gray-400">1 ريال = 1 نقطة</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl mb-1">👥</div>
              <p className="text-sm font-semibold">دعوة صديق</p>
              <p className="text-xs text-gray-400">50 نقطة مجانية</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl mb-1">⭐</div>
              <p className="text-sm font-semibold">تقييم الخدمة</p>
              <p className="text-xs text-gray-400">10 نقاط لكل تقييم</p>
            </div>
          </div>
          <Link href="/my-points">
            <button className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg hover:bg-yellow-300 transition">
              شاهد نقاطك
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
