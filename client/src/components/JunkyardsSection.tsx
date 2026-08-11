import { Wrench, MapPin, Phone, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { trpc } from "@/lib/trpc";

const fallbackJunkyards = [
  { id: 1, name: "تشليح الفيصل المعتمد", phone: "0543257872", city: "مكة المكرمة", area: "طريق جدة السريع", specialties: "قطع يابانية,قطع أمريكية,محركات مفحوصة", rating: "4.7", status: "approved" as const },
  { id: 2, name: "تشليح المدينة للسيارات", phone: "0543257872", city: "جدة", area: "حي الحمراء", specialties: "قطع أوروبية,قطع كورية,جيربوكسات", rating: "4.8", status: "approved" as const },
  { id: 3, name: "تشليح النخبة", phone: "0543257872", city: "مكة المكرمة", area: "حي الشرائع", specialties: "قطع فاخرة,قطع رياضية,أنظمة كهربائية", rating: "4.9", status: "approved" as const },
  { id: 4, name: "تشليح الخليج المتحد", phone: "0543257872", city: "جدة", area: "طريق مكة القديم", specialties: "قطع جميع الأنواع,محركات وجيربوكسات,قطع ثقيلة", rating: "4.6", status: "approved" as const },
];

export default function JunkyardsSection() {
  const { data: dbJunkyards, isLoading } = trpc.pricing.getApprovedJunkyards.useQuery();
  const junkyards = dbJunkyards && dbJunkyards.length > 0 ? dbJunkyards : fallbackJunkyards;

  const handleWhatsApp = (phone: string, name: string) => {
    const msg = encodeURIComponent(`السلام عليكم، أريد الاستفسار عن قطع الغيار من ${name}`);
    window.open(`https://wa.me/966${phone.slice(1)}?text=${msg}`, "_blank");
  };

  return (
    <section id="junkyards" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">التشاليح المعتمدة</h2>
          <p className="text-gray-600">قطع غيار مستعملة مفحوصة مع ضمان</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-7 h-7 animate-spin text-yellow-500" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {junkyards.map((j) => (
              <Card key={j.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{j.name}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <MapPin className="w-3 h-3" />
                      <span>{j.city} - {j.area}</span>
                    </div>
                  </div>
                  <span className="text-yellow-500 font-bold">{j.rating || "4.5"} ★</span>
                </div>
                {j.specialties && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {j.specialties.split(",").map((s, i) => (
                      <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{s.trim()}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleWhatsApp(j.phone, j.name)} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm">
                    <MessageCircle className="w-3 h-3 ml-1" /> واتساب
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => window.open(`tel:${j.phone}`, "_self")} className="flex-1 text-sm">
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
