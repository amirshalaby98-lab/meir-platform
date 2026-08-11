import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export default function PartsMarket() {
  const [searchQuery, setSearchQuery] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [vin, setVin] = useState("");
  const [searchMode, setSearchMode] = useState<"name" | "part" | "vin">("name");

  const { data, isLoading } = trpc.partsMarket.search.useQuery({
    query: searchMode === "name" ? searchQuery : undefined,
    partNumber: searchMode === "part" ? partNumber : undefined,
    vin: searchMode === "vin" ? vin : undefined,
    page: 1,
    limit: 20,
  }, { enabled: searchQuery.length > 0 || partNumber.length > 0 || vin.length > 0 });

  const categories = trpc.partsMarket.getCategories.useQuery();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">سوق قطع الغيار</h1>
        <p className="text-gray-600 text-center mb-8">ابحث عن قطع غيار أصلية ومستعملة</p>

        {/* Search Modes */}
        <div className="flex gap-2 justify-center mb-4">
          <Button variant={searchMode === "name" ? "default" : "outline"} onClick={() => setSearchMode("name")} className={searchMode === "name" ? "bg-yellow-400 text-black" : ""}>
            بحث بالاسم
          </Button>
          <Button variant={searchMode === "part" ? "default" : "outline"} onClick={() => setSearchMode("part")} className={searchMode === "part" ? "bg-yellow-400 text-black" : ""}>
            رقم القطعة
          </Button>
          <Button variant={searchMode === "vin" ? "default" : "outline"} onClick={() => setSearchMode("vin")} className={searchMode === "vin" ? "bg-yellow-400 text-black" : ""}>
            رقم VIN
          </Button>
        </div>

        {/* Search Input */}
        <div className="max-w-xl mx-auto mb-8">
          {searchMode === "name" && (
            <input className="w-full border rounded-lg p-3 text-lg" placeholder="ابحث عن قطعة... مثال: فلتر زيت كامري" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          )}
          {searchMode === "part" && (
            <input className="w-full border rounded-lg p-3 text-lg" placeholder="أدخل رقم القطعة... مثال: 04152-YZZA1" value={partNumber} onChange={(e) => setPartNumber(e.target.value)} />
          )}
          {searchMode === "vin" && (
            <input className="w-full border rounded-lg p-3 text-lg" placeholder="أدخل رقم الشاصي VIN..." value={vin} onChange={(e) => setVin(e.target.value)} />
          )}
        </div>

        {/* Categories */}
        {categories.data && categories.data.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {categories.data.map((cat) => (
              <span key={cat.category} className="bg-white border rounded-full px-3 py-1 text-sm cursor-pointer hover:bg-yellow-50" onClick={() => { setSearchMode("name"); setSearchQuery(cat.category || ""); }}>
                {cat.category} ({cat.count})
              </span>
            ))}
          </div>
        )}

        {/* Results */}
        {isLoading && <p className="text-center text-gray-500">جاري البحث...</p>}
        
        {data && data.data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">لا توجد نتائج</p>
            <p className="text-gray-400 text-sm mt-2">جرب كلمات بحث مختلفة أو غيّر طريقة البحث</p>
          </div>
        )}

        {data && data.data.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((part) => (
              <Card key={part.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{part.partName}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${part.condition === "new" ? "bg-green-100 text-green-700" : part.condition === "used" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                      {part.condition === "new" ? "جديد" : part.condition === "used" ? "مستعمل" : "مجدد"}
                    </span>
                  </div>
                  {part.partNumber && <p className="text-sm text-gray-500">رقم القطعة: {part.partNumber}</p>}
                  {part.oemNumber && <p className="text-sm text-gray-500">OEM: {part.oemNumber}</p>}
                  {part.category && <p className="text-sm text-gray-500">التصنيف: {part.category}</p>}
                  {part.description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{part.description}</p>}
                  <div className="flex justify-between items-center mt-3 pt-3 border-t">
                    <span className="text-xl font-bold text-yellow-600">{part.price} {part.currency}</span>
                    <span className="text-sm text-gray-500">الكمية: {part.quantity}</span>
                  </div>
                  <Button className="w-full mt-3 bg-yellow-400 text-black hover:bg-yellow-500">
                    تواصل مع البائع
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {data && (
          <p className="text-center text-sm text-gray-500 mt-4">
            عرض {data.data.length} من {data.total} نتيجة
          </p>
        )}
      </div>
    </div>
  );
}
