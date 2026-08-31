import { useState } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Truck, CreditCard, CheckCircle2, ArrowRight, ArrowLeft, AlertTriangle, Loader2, Package } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

type Step = "shipping" | "payment" | "confirmation";

const STEPS: { key: Step; label: string; icon: any }[] = [
  { key: "shipping", label: "بيانات الشحن", icon: Truck },
  { key: "payment", label: "الدفع", icon: CreditCard },
  { key: "confirmation", label: "التأكيد", icon: CheckCircle2 },
];

export default function MarketplaceCheckout() {
  const { productId } = useParams<{ productId: string }>();
  const initialQty = parseInt(new URLSearchParams(window.location.search).get("qty") || "1", 10) || 1;
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>("shipping");

  const [quantity, setQuantity] = useState(initialQty);
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "stc_pay" | "mada" | "card" | "cash">("bank_transfer");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [totalPrice, setTotalPrice] = useState("");

  const { data: publicProducts, isLoading: productLoading } = trpc.products.getAll.useQuery({ activeOnly: false });
  const resolvedProduct = publicProducts?.find((p: any) => p.id === parseInt(productId!, 10));

  const createOrderMutation = trpc.productOrders.create.useMutation({
    onSuccess: (data) => {
      setOrderId(data.orderId);
      setOrderNumber(data.orderNumber);
      setTotalPrice(data.totalPrice);
      setStep("payment");
    },
    onError: (err) => toast.error(err.message || "فشل إنشاء الطلب"),
  });

  const submitPaymentMutation = trpc.productOrders.submitPayment.useMutation({
    onSuccess: () => {
      setStep("confirmation");
      toast.success("تم تسجيل الدفع بنجاح! سيتم مراجعة طلبك");
    },
    onError: (err) => toast.error(err.message || "فشل تسجيل الدفع"),
  });

  if (authLoading || productLoading) {
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
            <p className="text-gray-600 mb-4">لإتمام الطلب يرجى تسجيل الدخول أو إنشاء حساب جديد</p>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              تسجيل / دخول
            </Button>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  if (!resolvedProduct) {
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

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);
  const estimatedTotal = (parseFloat(resolvedProduct.price) * quantity).toFixed(2);

  const handleReceiptSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم صورة الإيصال يتجاوز الحد الأقصى (5MB)");
      return;
    }
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = () => setReceiptPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreateOrder = () => {
    if (!shippingName || !shippingPhone || !shippingAddress || !shippingCity) {
      toast.error("يرجى تعبئة كل بيانات الشحن");
      return;
    }
    createOrderMutation.mutate({
      productId: resolvedProduct.id,
      quantity,
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingCity,
      customerPhone: shippingPhone,
    });
  };

  const handleSubmitPayment = () => {
    if (!orderId) return;
    submitPaymentMutation.mutate({
      orderId,
      paymentMethod: paymentMethod === "card" ? ("credit_card" as const) : paymentMethod,
      reference: `PO-PAY-${Date.now()}`,
      receiptBase64: receiptPreview ? receiptPreview.split(",")[1] : undefined,
      mimeType: receiptFile?.type,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-2">إتمام الطلب</h1>
        <p className="text-center text-gray-500 mb-8">{resolvedProduct.name}</p>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === currentStepIndex;
            const isDone = i < currentStepIndex;
            return (
              <div key={s.key} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isDone ? "bg-green-500 text-white" : isActive ? "bg-yellow-500 text-black" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs text-center ${isActive ? "font-bold text-gray-900" : "text-gray-500"}`}>{s.label}</span>
              </div>
            );
          })}
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            {step === "shipping" && (
              <div className="space-y-4">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="w-5 h-5" /> بيانات الشحن
                  </CardTitle>
                </CardHeader>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between text-sm">
                  <span>{resolvedProduct.name} × {quantity}</span>
                  <span className="font-bold">{estimatedTotal} ريال</span>
                </div>

                <div>
                  <Label htmlFor="shippingName">الاسم الكامل *</Label>
                  <Input id="shippingName" value={shippingName} onChange={(e) => setShippingName(e.target.value)} placeholder="اسمك الكامل" />
                </div>
                <div>
                  <Label htmlFor="shippingPhone">رقم الجوال *</Label>
                  <Input id="shippingPhone" value={shippingPhone} onChange={(e) => setShippingPhone(e.target.value)} placeholder="05xxxxxxxx" dir="ltr" />
                </div>
                <div>
                  <Label htmlFor="shippingCity">المدينة *</Label>
                  <Input id="shippingCity" value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} placeholder="مثال: الرياض" />
                </div>
                <div>
                  <Label htmlFor="shippingAddress">العنوان بالتفصيل *</Label>
                  <Input id="shippingAddress" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} placeholder="الحي، الشارع، رقم المبنى" />
                </div>

                <Button
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                  size="lg"
                  onClick={handleCreateOrder}
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري الإنشاء...
                    </>
                  ) : (
                    "متابعة للدفع"
                  )}
                </Button>
              </div>
            )}

            {step === "payment" && (
              <div className="space-y-4">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> الدفع
                  </CardTitle>
                </CardHeader>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-700">{totalPrice} ريال</p>
                  <p className="text-sm text-gray-500">رقم الطلب: {orderNumber}</p>
                </div>

                <div>
                  <Label className="text-base font-medium">اختر طريقة الدفع:</Label>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {[
                      { value: "bank_transfer", label: "تحويل بنكي" },
                      { value: "stc_pay", label: "STC Pay" },
                      { value: "mada", label: "مدى" },
                      { value: "card", label: "بطاقة ائتمانية" },
                    ].map((method) => (
                      <button
                        key={method.value}
                        onClick={() => setPaymentMethod(method.value as any)}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          paymentMethod === method.value
                            ? "border-yellow-500 bg-yellow-50 text-yellow-700 font-medium"
                            : "border-gray-200 hover:border-yellow-300"
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === "bank_transfer" && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="font-medium text-sm">معلومات التحويل:</p>
                    <div className="text-sm space-y-1">
                      <p>البنك: <span className="font-medium">الراجحي</span></p>
                      <p>رقم الحساب: <span className="font-medium">IBAN SA...</span></p>
                      <p>اسم المستفيد: <span className="font-medium">مؤسسة مير للخدمات</span></p>
                    </div>
                    <div className="pt-3">
                      <Label htmlFor="receipt">ارفق صورة الإيصال</Label>
                      <Input id="receipt" type="file" accept="image/*" onChange={handleReceiptSelect} className="mt-1" />
                      {receiptPreview && <img src={receiptPreview} alt="إيصال" className="mt-2 max-h-32 rounded-lg" />}
                    </div>
                  </div>
                )}

                {paymentMethod === "stc_pay" && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-sm">حوّل المبلغ عبر STC Pay إلى:</p>
                    <p className="text-lg font-bold mt-1">05XXXXXXXX</p>
                    <div className="pt-3">
                      <Label htmlFor="receipt-stc">ارفق صورة الإيصال</Label>
                      <Input id="receipt-stc" type="file" accept="image/*" onChange={handleReceiptSelect} className="mt-1" />
                      {receiptPreview && <img src={receiptPreview} alt="إيصال" className="mt-2 max-h-32 rounded-lg" />}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked === true)} className="mt-0.5" />
                  <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    أوافق على <a href="/terms" target="_blank" className="text-yellow-600 underline font-medium">الشروط والأحكام</a> وسياسة الاستخدام
                  </label>
                </div>

                <Button
                  onClick={handleSubmitPayment}
                  disabled={submitPaymentMutation.isPending || !termsAccepted}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                  size="lg"
                >
                  {submitPaymentMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري التسجيل...
                    </>
                  ) : (
                    "تأكيد الدفع"
                  )}
                </Button>
              </div>
            )}

            {step === "confirmation" && (
              <div className="text-center space-y-4 py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold">تم تسجيل طلبك بنجاح!</h2>
                <p className="text-gray-500">رقم الطلب: <span className="font-bold text-yellow-600">{orderNumber}</span></p>
                <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2 text-right">
                  <p>سيتم مراجعة طلبك والتحقق من الدفع</p>
                  <p>بعد التأكيد، سيتم تجهيز الطلب وشحنه</p>
                  <p>يمكنك متابعة حالة طلبك من صفحة طلباتي</p>
                </div>
                <div className="flex gap-3 justify-center pt-4">
                  <Button variant="outline" onClick={() => (window.location.href = "/my-product-orders")}>
                    طلباتي
                  </Button>
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-black" onClick={() => (window.location.href = "/marketplace")}>
                    المتجر
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {step === "shipping" && (
          <Link href={`/marketplace/products/${resolvedProduct.slug}`} className="text-gray-500 hover:text-gray-800 text-sm flex items-center gap-1 w-fit">
            <ArrowRight className="w-4 h-4" /> رجوع للمنتج
          </Link>
        )}
      </main>
      <Footer />
    </div>
  );
}
