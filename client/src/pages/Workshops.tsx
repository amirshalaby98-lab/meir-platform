import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function Workshops() {
  const [city, setCity] = useState("");
  const { data, isLoading } = trpc.workshops.getApproved.useQuery({ city: city || undefined, page: 1, limit: 20 });

  const cities = ["الرياض", "جدة", "مكة", "المدينة", "الدمام", "الخبر", "أبها", "تبوك", "حائل", "جازان"];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">الورش المعتمدة</h1>
        <p className="text-gray-600 text-center mb-8">ابحث عن أفضل الورش القريبة منك</p>

        {/* City Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <Button variant={!city ? "default" : "outline"} onClick={() => setCity("")} className={!city ? "bg-yellow-400 text-black" : ""} size="sm">
            الكل
          </Button>
          {cities.map((c) => (
            <Button key={c} variant={city === c ? "default" : "outline"} onClick={() => setCity(c)} className={city === c ? "bg-yellow-400 text-black" : ""} size="sm">
              {c}
            </Button>
          ))}
        </div>

        {isLoading && <p className="text-center text-gray-500">جاري التحميل...</p>}

        {data && data.data.length === 0 && (
          <p className="text-center text-gray-500 py-12">لا توجد ورش في هذه المدينة حالياً</p>
        )}

        {data && data.data.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((workshop) => (
              <Card key={workshop.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1">{workshop.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{workshop.city} - {workshop.area}</p>
                  {(() => {
                    const specs = workshop.specialties as unknown as string[] | null;
                    if (!specs || !Array.isArray(specs)) return null;
                    return (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {specs.map((s: string, i: number) => (
                          <span key={i} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">{s}</span>
                        ))}
                      </div>
                    );
                  })()}
                  <div className="flex justify-between items-center mt-3 pt-3 border-t">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-bold">{workshop.rating}</span>
                      <span className="text-sm text-gray-400">({workshop.totalReviews})</span>
                    </div>
                    <span className="text-sm text-gray-500">{workshop.completedJobs} عملية</span>
                  </div>
                  {workshop.phone && (
                    <a href={`tel:${workshop.phone}`} className="block mt-3">
                      <Button className="w-full bg-green-500 text-white hover:bg-green-600" size="sm">
                        اتصل الآن
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
