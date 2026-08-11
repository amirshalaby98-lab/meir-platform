import { Phone, MessageCircle, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

const fallbackTrucks = [
  { id: 1, name: "سطحة الأمانة", phone: "0543257872", city: "مكة المكرمة", area: "العزيزية", rating: "4.9", services: "نقل داخل المدينة,نقل بين المدن,متوفر 24/7", price: "من 150 ريال", status: "approved" as const },
  { id: 2, name: "سطحة السرعة", phone: "0543257872", city: "جدة", area: "الروضة", rating: "4.8", services: "نقل سريع,تأمين شامل,متوفر 24/7", price: "من 180 ريال", status: "approved" as const },
  { id: 3, name: "سطحة الثقة", phone: "0543257872", city: "مكة المكرمة", area: "الشوقية", rating: "4.7", services: "نقل آمن,أسعار منافسة", price: "من 140 ريال", status: "approved" as const },
  { id: 4, name: "سطحة الإتقان", phone: "0543257872", city: "جدة", area: "الحمراء", rating: "4.9", services: "نقل فاخر,تأمين كامل", price: "من 200 ريال", status: "approved" as const },
];

export default function TowTrucksSection() {
  const { data: dbTrucks, isLoading } = trpc.pricing.getApprovedTowTrucks.useQuery();
  const towTrucks = dbTrucks && dbTrucks.length > 0 ? dbTrucks : fallbackTrucks;

  const handleWhatsApp = (phone: string, name: string) => {
    const msg = encodeURIComponent(`مرحباً، أريد الاستفسار عن خدمات ${name}`);
    window.open(`https://wa.me/${phone.replace(/^0/, "966")}?text=${msg}`, "_blank");
  };

  return (
    <section id="tow-trucks" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">السطحات المعتمدة</h2>
          <p className="text-gray-600">نقل سيارتك بأمان مع سطحات موثوقة</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-7 h-7 animate-spin text-yellow-500" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {towTrucks.map((truck) => (
              <Card key={truck.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{truck.name}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <MapPin className="w-3 h-3" />
                      <span>{truck.city} - {truck.area}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-yellow-500 font-bold">{truck.rating || "4.5"} ★</span>
                    {truck.price && <p className="text-xs text-gray-500">{truck.price}</p>}
                  </div>
                </div>
                {truck.services && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {truck.services.split(",").map((s, i) => (
                      <span key={i} className="bg-yellow-50 text-yellow-700 text-xs px-2 py-0.5 rounded-full">{s.trim()}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleWhatsApp(truck.phone, truck.name)} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm">
                    <MessageCircle className="w-3 h-3 ml-1" /> واتساب
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => window.open(`tel:${truck.phone}`, "_self")} className="flex-1 text-sm">
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
