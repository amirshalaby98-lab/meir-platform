import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Award, Gift, History, Phone, Star, TrendingUp } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MyPoints() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { data: points, refetch: refetchPoints } = trpc.loyalty.getPoints.useQuery(
    { phone, name },
    { enabled: isLoggedIn }
  );

  const { data: rewards } = trpc.loyalty.getRewards.useQuery(
    { phone },
    { enabled: isLoggedIn }
  );

  const { data: history } = trpc.loyalty.getHistory.useQuery(
    { phone },
    { enabled: isLoggedIn }
  );

  const redeemMutation = trpc.loyalty.redeemReward.useMutation({
    onSuccess: (data) => {
      toast.success(`تم الاستبدال بنجاح! حصلت على ${data.reward.name}`);
      refetchPoints();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast.error("يرجى إدخال رقم هاتف صحيح");
      return;
    }
    setIsLoggedIn(true);
    toast.success("تم تسجيل الدخول بنجاح!");
  };

  const handleRedeem = (rewardId: number) => {
    redeemMutation.mutate({ phone, rewardId });
  };

  if (!isLoggedIn) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-20">
          <div className="container max-w-md">
            <Card className="shadow-xl border-2">
              <CardHeader className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold">نقاط الولاء</CardTitle>
                <CardDescription className="text-lg">
                  تسجيل الدخول لعرض نقاطك ومكافآتك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base">
                      رقم الهاتف
                    </Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="05XXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pr-10 text-lg h-12"
                        dir="ltr"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base">
                      الاسم (اختياري)
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="أدخل اسمك"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-lg h-12"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                  >
                    عرض نقاطي
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">نقاط الولاء</h1>
            <p className="text-xl text-gray-600">
              مرحباً {points?.customerName}! اجمع النقاط واحصل على مكافآت رائعة
            </p>
          </div>

          {/* Points Summary */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Star className="w-6 h-6" />
                  نقاطك الحالية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold">{points?.points || 0}</div>
                <p className="text-yellow-100 mt-2">نقطة متاحة</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  إجمالي النقاط المكتسبة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600">
                  {points?.totalEarned || 0}
                </div>
                <p className="text-gray-600 mt-2">نقطة</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-6 h-6 text-purple-600" />
                  النقاط المستبدلة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-purple-600">
                  {points?.totalRedeemed || 0}
                </div>
                <p className="text-gray-600 mt-2">نقطة</p>
              </CardContent>
            </Card>
          </div>

          {/* Rewards */}
          <Card className="mb-12 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Gift className="w-7 h-7 text-yellow-600" />
                المكافآت المتاحة
              </CardTitle>
              <CardDescription className="text-lg">
                استبدل نقاطك بخصومات وخدمات مجانية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {rewards?.map((reward) => (
                  <Card
                    key={reward.id}
                    className={`border-2 ${
                      reward.canRedeem
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{reward.name}</span>
                        <span className="text-yellow-600 font-bold">
                          {reward.points} نقطة
                        </span>
                      </CardTitle>
                      <CardDescription className="text-base">
                        {reward.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {reward.canRedeem ? (
                        <Button
                          onClick={() => handleRedeem(reward.id)}
                          disabled={redeemMutation.isPending}
                          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                        >
                          استبدال الآن
                        </Button>
                      ) : (
                        <div className="text-center py-2 text-gray-600">
                          تحتاج إلى {reward.pointsNeeded} نقطة إضافية
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* History */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <History className="w-7 h-7 text-blue-600" />
                سجل النقاط
              </CardTitle>
              <CardDescription className="text-lg">
                تاريخ جميع عمليات النقاط الخاصة بك
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history && history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            item.type === "earn"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {item.type === "earn" ? "+" : "-"}
                          {Math.abs(item.points)}
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{item.reason}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(item.createdAt).toLocaleDateString("ar-SA", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          item.type === "earn" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {item.type === "earn" ? "+" : "-"}
                        {Math.abs(item.points)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-xl">لا توجد عمليات بعد</p>
                  <p className="text-base mt-2">
                    ابدأ بحجز خدمة لكسب نقاطك الأولى!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Box */}
          <Card className="mt-8 bg-blue-50 border-blue-200 shadow-lg">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4 text-blue-900">
                كيف تكسب النقاط؟
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  احصل على 10 نقاط عند إتمام كل حجز
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  استبدل 50 نقطة بخصم 10 ريال
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  استبدل 100 نقطة بخصم 25 ريال
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  استبدل 200 نقطة بخصم 60 ريال
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  استبدل 300 نقطة بخدمة مجانية كاملة!
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
