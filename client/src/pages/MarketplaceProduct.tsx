import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Minus, Plus, ArrowRight } from "lucide-react";

export default function MarketplaceProduct() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const { data: product, isLoading } = trpc.products.getBySlug.useQuery({ slug: slug! }, { enabled: !!slug });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">المنتج غير موجود</p>
          <Link href="/marketplace" className="text-yellow-600 underline mt-2 inline-block">العودة للمتجر</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images: string[] = (product.images as string[] | null) || [];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/marketplace" className="text-gray-500 hover:text-gray-800 text-sm flex items-center gap-1 mb-4">
          <ArrowRight className="w-4 h-4" /> المتجر
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* الصور */}
          <div>
            <div className="aspect-square bg-white border rounded-xl flex items-center justify-center overflow-hidden mb-3">
              {images.length ? (
                <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-20 h-20 text-gray-300" />
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${activeImage === i ? "border-yellow-500" : "border-gray-200"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* التفاصيل */}
          <div>
            {product.category && <p className="text-sm text-gray-400 mb-1">{product.category}</p>}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-2xl font-bold text-yellow-600 mb-4">{product.price} ريال</p>
            {product.description && (
              <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line">{product.description}</p>
            )}

            {product.stockQuantity <= 0 ? (
              <Card className="p-4 bg-red-50 border-red-200 mb-4">
                <p className="text-red-700 text-sm font-medium">نفدت الكمية حالياً</p>
              </Card>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-sm font-medium text-gray-700">الكمية:</span>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                      className="p-2 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                  onClick={() => setLocation(`/marketplace/checkout/${product.id}?qty=${quantity}`)}
                >
                  اطلب الآن
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
