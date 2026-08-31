import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Package, MessageCircle, ArrowLeft } from "lucide-react";

export default function Marketplace() {
  const { data: products, isLoading } = trpc.products.getAll.useQuery({ activeOnly: true });

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">المتجر</h1>
          <p className="text-gray-500">اشترِ جهاز الفحص الخاص بمنصة مير، أو احجز استشارة فنية مباشرة</p>
        </div>

        {/* بطاقة الاستشارة الفنية */}
        <Link href="/consultations">
          <Card className="mb-10 bg-gradient-to-l from-gray-900 to-gray-800 text-white cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-7 h-7 text-black" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">استشارة فنية هندسية</h2>
                  <p className="text-gray-300 text-sm">تواصل مع مهندس متخصص لتشخيص مشكلة سيارتك عن بُعد</p>
                </div>
              </div>
              <ArrowLeft className="w-6 h-6 text-yellow-400 flex-shrink-0" />
            </CardContent>
          </Card>
        </Link>

        {/* المنتجات */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">المنتجات</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : !products?.length ? (
          <Card className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد منتجات متاحة حالياً</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product: any) => (
              <Link key={product.id} href={`/marketplace/products/${product.slug}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden h-full">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-16 h-16 text-gray-300" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                    {product.category && <p className="text-xs text-gray-400 mb-2">{product.category}</p>}
                    <p className="text-lg font-bold text-yellow-600">{product.price} ريال</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
