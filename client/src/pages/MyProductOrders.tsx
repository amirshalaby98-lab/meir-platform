import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Package, AlertTriangle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "بانتظار الدفع",
  paid: "تم تأكيد الدفع",
  processing: "جاري التجهيز",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-red-100 text-red-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-yellow-100 text-yellow-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function MyProductOrders() {
  const { user, loading: authLoading } = useAuth();
  const { data: orders, isLoading } = trpc.productOrders.getMyOrders.useQuery(undefined, { enabled: !!user });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
          <Card className="p-8 text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">يرجى تسجيل الدخول أولاً</h2>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 mt-2" onClick={() => (window.location.href = getLoginUrl())}>
              تسجيل / دخول
            </Button>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">طلباتي من المتجر</h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : !orders?.length ? (
          <Card className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">لا توجد طلبات بعد</p>
            <Link href="/marketplace" className="text-yellow-600 underline">تصفح المتجر</Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{order.productNameSnapshot} × {order.quantity}</p>
                  <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                    <span>{new Date(order.createdAt).toLocaleDateString("ar-SA")}</span>
                    <span className="font-bold text-gray-900">{order.totalPrice} ريال</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
