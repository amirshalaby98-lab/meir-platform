import { Link } from "wouter";
import { ShoppingBag, MessageCircle, ArrowLeft } from "lucide-react";

export default function MarketplaceTeaser() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">المتجر</h2>
          <p className="text-gray-500">اشترِ جهاز الفحص الخاص بمنصة مير، أو احجز استشارة فنية مباشرة</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link href="/marketplace">
            <div className="bg-gray-900 text-white rounded-2xl p-6 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow h-full">
              <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-7 h-7 text-black" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">جهاز الفحص</h3>
                <p className="text-gray-300 text-sm">تسوّق جهاز فحص السيارات الخاص بمير</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            </div>
          </Link>
          <Link href="/consultations">
            <div className="bg-gray-100 rounded-2xl p-6 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow h-full">
              <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-7 h-7 text-black" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">استشارة فنية</h3>
                <p className="text-gray-500 text-sm">تواصل مع مهندس متخصص لتشخيص مشكلتك</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
