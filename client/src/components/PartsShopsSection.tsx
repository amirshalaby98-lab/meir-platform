import { Store, MapPin, Phone, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { trpc } from "@/lib/trpc";

const fallbackShops = [
  { id: 1, name: "محلات الأمانة لقطع الغيار", phone: "0543257872", city: "مكة المكرمة", area: "حي العزيزية", specialties: "قطع أصلية,بطاريات,زيوت ومحركات", rating: "4.8", status: "approved" as const },
  { id: 2, name: "مؤسسة النجاح لقطع السيارات", phone: "0543257872", city: "جدة", area: "حي الصفا", specialties: "قطع كهربائية,دينمو وسلف,أنظمة ECU", rating: "4.9", status: "approved" as const },
  { id: 3, name: "قطع غيار الخليج", phone: "0543257872", city: "مكة المكرمة", area: "حي النسيم", specialties: "قطع أمريكية,قطع يابانية,إكسسوارات", rating: "4.7", status: "approved" as const },
  { id: 4, name: "مركز الرياض لقطع الغيار", phone: "0543257872", city: "جدة", area: "حي الروضة", specialties: "قطع أوروبية,فلاتر وبواجي,طرمبات وقود", rating: "4.8", status: "approved" as const },
];

export default function PartsShopsSection() {
  const { data: dbShops, isLoading } = trpc.pricing.getApprovedPartsShops.useQuery();
  const shops = dbShops && dbShops.length > 0 ? dbShops : fallbackShops;

  const handleWhatsApp = (phone: string, name: string) => {
    const msg = encodeURIComponent(`السلام عليكم، أريد الاستفسار عن قطع الغيار من ${name}`);
    window.open(`https://wa.me/966${phone.slice(1)}?text=${msg}`, "_blank");
  };

  return (
    <section id="parts-shops" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">محلات القطع المعتمدة</h2>
          <p className="text-gray-600">قطع أصلية بأسعار منافسة من شركائنا الموثوقين</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-7 h-7 animate-spin text-yellow-500" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {shops.map((shop) => (
              <Card key={shop.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{shop.name}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <MapPin className="w-3 h-3" />
                      <span>{shop.city} - {shop.area}</span>
                    </div>
                  </div>
                  <span className="text-yellow-500 font-bold">{shop.rating || "4.5"} ★</span>
                </div>
                {shop.specialties && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {shop.specialties.split(",").map((s, i) => (
                      <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{s.trim()}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleWhatsApp(shop.phone, shop.name)} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm">
                    <MessageCircle className="w-3 h-3 ml-1" /> واتساب
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => window.open(`tel:${shop.phone}`, "_self")} className="flex-1 text-sm">
                    <Phone className="w-3 h-3 ml-1" /> اتصال
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
