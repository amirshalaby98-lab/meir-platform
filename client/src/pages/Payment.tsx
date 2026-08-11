import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  CheckCircle2, 
  Copy,
  Loader2,
  ArrowRight
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type PaymentMethod = "stcpay" | "mada" | "bank";

export default function Payment() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stcpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Bank account details
  const bankDetails = {
    bankName: "البنك الأهلي السعودي",
    accountName: "مؤسسة مير للصيانة",
    accountNumber: "SA1234567890123456789012",
    iban: "SA1234567890123456789012",
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ!");
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (paymentMethod === "bank") {
        toast.success("تم تسجيل طلب الدفع! يرجى إرسال إيصال التحويل عبر واتساب.");
      } else {
        setIsCompleted(true);
        toast.success("تم الدفع بنجاح! سيتواصل معك الفني قريباً.");
      }
    } catch (error) {
      toast.error("فشلت عملية الدفع. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        
        <main className="flex-1 container py-12 flex items-center justify-center">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">تم الدفع بنجاح!</h2>
              <p className="text-gray-600 mb-6">
                تم تأكيد حجزك. سيتواصل معك الفني قريباً.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-right">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">رقم الحجز:</span>
                  <span className="font-bold">#12345</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">المبلغ المدفوع:</span>
                  <span className="font-bold">150 ريال</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">طريقة الدفع:</span>
                  <span className="font-bold">
                    {paymentMethod === "stcpay" ? "STC Pay" : "مدى"}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => window.location.href = "/track"}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold"
                >
                  تتبع حجزك
                  <ArrowRight className="w-4 h-4 mr-2" />
                </Button>
                <Button
                  onClick={() => window.location.href = "/"}
                  variant="outline"
                  className="w-full"
                >
                  العودة للرئيسية
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">إتمام الدفع</h1>
            <p className="text-gray-600">
              اختر طريقة الدفع المناسبة لك
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Payment Methods */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>طريقة الدفع</CardTitle>
                  <CardDescription>
                    اختر الطريقة المفضلة لديك
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                    {/* STC Pay */}
                    <Card className={`cursor-pointer transition-all ${paymentMethod === "stcpay" ? "border-2 border-yellow-500" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <RadioGroupItem value="stcpay" id="stcpay" />
                          <Label htmlFor="stcpay" className="flex items-center gap-3 cursor-pointer flex-1">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Smartphone className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-bold">STC Pay</div>
                              <div className="text-sm text-gray-600">الدفع عبر محفظة STC Pay</div>
                            </div>
                          </Label>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Mada */}
                    <Card className={`cursor-pointer transition-all ${paymentMethod === "mada" ? "border-2 border-yellow-500" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <RadioGroupItem value="mada" id="mada" />
                          <Label htmlFor="mada" className="flex items-center gap-3 cursor-pointer flex-1">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <CreditCard className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-bold">مدى</div>
                              <div className="text-sm text-gray-600">الدفع ببطاقة مدى</div>
                            </div>
                          </Label>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Bank Transfer */}
                    <Card className={`cursor-pointer transition-all ${paymentMethod === "bank" ? "border-2 border-yellow-500" : ""}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <RadioGroupItem value="bank" id="bank" />
                          <Label htmlFor="bank" className="flex items-center gap-3 cursor-pointer flex-1">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <div className="font-bold">تحويل بنكي</div>
                              <div className="text-sm text-gray-600">التحويل على حساب المؤسسة</div>
                            </div>
                          </Label>
                        </div>
                      </CardContent>
                    </Card>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Payment Details */}
              {paymentMethod === "bank" && (
                <Card className="border-yellow-400 bg-yellow-50">
                  <CardHeader>
                    <CardTitle>بيانات الحساب البنكي</CardTitle>
                    <CardDescription>
                      قم بالتحويل على الحساب التالي وأرسل الإيصال عبر واتساب
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-white p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">اسم البنك:</span>
                        <span className="font-bold">{bankDetails.bankName}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">اسم الحساب:</span>
                        <span className="font-bold">{bankDetails.accountName}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">رقم الآيبان:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{bankDetails.iban}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(bankDetails.iban)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border-r-4 border-yellow-500">
                      <p className="text-sm font-bold mb-2">⚠️ مهم:</p>
                      <p className="text-sm text-gray-700">
                        بعد التحويل، يرجى إرسال صورة الإيصال عبر واتساب على الرقم:{" "}
                        <a href="https://wa.me/966543257872" className="text-blue-600 font-bold">
                          0543257872
                        </a>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {paymentMethod === "mada" && (
                <Card>
                  <CardHeader>
                    <CardTitle>بيانات بطاقة مدى</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">رقم البطاقة</Label>
                      <Input
                        id="cardNumber"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        dir="ltr"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">تاريخ الانتهاء</Label>
                        <Input
                          id="expiry"
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          type="text"
                          placeholder="123"
                          maxLength={3}
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {paymentMethod === "stcpay" && (
                <Card>
                  <CardHeader>
                    <CardTitle>رقم STC Pay</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="stcNumber">رقم الجوال المسجل في STC Pay</Label>
                      <Input
                        id="stcNumber"
                        type="tel"
                        placeholder="05XXXXXXXX"
                        maxLength={10}
                        dir="ltr"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الخدمة:</span>
                      <span className="font-bold">تشخيص أعطال</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">التاريخ:</span>
                      <span className="font-bold">2024-01-15</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الوقت:</span>
                      <span className="font-bold">10:00 صباحاً</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الفني:</span>
                      <span className="font-bold">أحمد محمد</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">سعر الخدمة:</span>
                      <span>120 ريال</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">رسوم الانتقال:</span>
                      <span>30 ريال</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>خصم نقاط الولاء:</span>
                      <span>-0 ريال</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>الإجمالي:</span>
                    <span className="text-yellow-600">150 ريال</span>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري المعالجة...
                      </>
                    ) : (
                      <>
                        {paymentMethod === "bank" ? "تأكيد الطلب" : "ادفع الآن"}
                        <ArrowRight className="w-4 h-4 mr-2" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    بالمتابعة، أنت توافق على{" "}
                    <a href="#" className="text-blue-600">الشروط والأحكام</a>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
