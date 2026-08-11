import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, Clock, Star, Phone, CheckCircle2, CreditCard, User, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";

type Step = "location" | "datetime" | "technician" | "payment" | "confirmation";

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00"
];

const CITIES = ["مكة المكرمة", "جدة"];
const AREAS: Record<string, string[]> = {
  "مكة المكرمة": ["العزيزية", "الشوقية", "النسيم", "الرصيفة", "العوالي", "الزاهر", "الحمراء"],
  "جدة": ["الصفا", "الروضة", "الحمراء", "المروة", "البوادي", "الفيصلية", "النزهة"],
};

const SERVICES = [
  { id: "battery", name: "بطارية", price: 150 },
  { id: "starter", name: "سلف", price: 200 },
  { id: "alternator", name: "دينمو", price: 250 },
  { id: "ecu", name: "تشخيص ECU", price: 100 },
  { id: "fuel-pump", name: "طرمبة بنزين", price: 300 },
  { id: "roadside", name: "أعطال الطريق", price: 120 },
];

export default function TechnicianBooking() {
  const [step, setStep] = useState<Step>("location");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [service, setService] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedTechnician, setSelectedTechnician] = useState<any>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isPaid, setIsPaid] = useState(false);

  const { data: technicians, isLoading } = trpc.technician.getAvailable.useQuery(
    { location: city },
    { enabled: !!city && step === "technician" }
  );

  const createBookingMutation = trpc.booking.create.useMutation({
    onSuccess: () => {
      setIsPaid(true);
      setStep("confirmation");
      toast.success("تم الحجز والدفع بنجاح!");
    },
    onError: () => {
      toast.error("فشل الحجز. يرجى المحاولة مرة أخرى.");
    },
  });

  const handlePayment = () => {
    if (!customerName || !customerPhone) {
      toast.error("يرجى إدخال اسمك ورقم جوالك");
      return;
    }

    createBookingMutation.mutate({
      name: customerName,
      phone: customerPhone,
      service,
      location: `${city} - ${area}${address ? ` - ${address}` : ""}`,
      date: selectedDate?.toISOString().split("T")[0] || "",
      time: selectedTime,
      notes: `فني: ${selectedTechnician?.name}`,
    });
  };

  const getStepNumber = () => {
    const steps: Step[] = ["location", "datetime", "technician", "payment", "confirmation"];
    return steps.indexOf(step) + 1;
  };

  const selectedService = SERVICES.find(s => s.id === service);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <Header />

      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          {step !== "confirmation" && (
            <div className="flex items-center justify-center gap-2 mb-8">
              {["الموقع", "الموعد", "الفني", "الدفع"].map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    getStepNumber() > i + 1 ? "bg-green-500 text-white" :
                    getStepNumber() === i + 1 ? "bg-yellow-500 text-black" :
                    "bg-gray-200 text-gray-500"
                  }`}>
                    {getStepNumber() > i + 1 ? "✓" : i + 1}
                  </div>
                  <span className={`text-sm hidden sm:inline ${getStepNumber() === i + 1 ? "font-bold" : "text-gray-500"}`}>{label}</span>
                  {i < 3 && <div className="w-6 h-0.5 bg-gray-300"></div>}
                </div>
              ))}
            </div>
          )}

          {/* Step 1: الموقع */}
          {step === "location" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-yellow-500" />
                  حدد موقع العمل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>المدينة *</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {CITIES.map(c => (
                      <Button
                        key={c}
                        variant={city === c ? "default" : "outline"}
                        className={city === c ? "bg-yellow-500 hover:bg-yellow-600 text-black" : ""}
                        onClick={() => { setCity(c); setArea(""); }}
                      >
                        {c}
                      </Button>
                    ))}
                  </div>
                </div>

                {city && (
                  <div>
                    <Label>الحي *</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {AREAS[city]?.map(a => (
                        <Button
                          key={a}
                          variant={area === a ? "default" : "outline"}
                          size="sm"
                          className={area === a ? "bg-yellow-500 hover:bg-yellow-600 text-black" : ""}
                          onClick={() => setArea(a)}
                        >
                          {a}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {area && (
                  <div>
                    <Label>عنوان إضافي (اختياري)</Label>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="مثال: شارع الملك فهد، بجوار مسجد..."
                      className="mt-1"
                    />
                  </div>
                )}

                {area && (
                  <div>
                    <Label>الخدمة المطلوبة *</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {SERVICES.map(s => (
                        <Button
                          key={s.id}
                          variant={service === s.id ? "default" : "outline"}
                          size="sm"
                          className={service === s.id ? "bg-yellow-500 hover:bg-yellow-600 text-black" : ""}
                          onClick={() => setService(s.id)}
                        >
                          {s.name} ({s.price} ر.س)
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => setStep("datetime")}
                  disabled={!city || !area || !service}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold mt-4"
                >
                  التالي <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: الموعد */}
          {step === "datetime" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  اختر الموعد
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>التاريخ *</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border mt-2"
                  />
                </div>

                {selectedDate && (
                  <div>
                    <Label>الوقت *</Label>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-2">
                      {TIME_SLOTS.map(time => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          size="sm"
                          className={selectedTime === time ? "bg-yellow-500 hover:bg-yellow-600 text-black" : ""}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("location")} className="flex-1">
                    رجوع
                  </Button>
                  <Button
                    onClick={() => setStep("technician")}
                    disabled={!selectedDate || !selectedTime}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                  >
                    التالي <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: اختيار الفني */}
          {step === "technician" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-yellow-500" />
                  اختر الفني
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-gray-600">جاري تحميل الفنيين...</p>
                  </div>
                ) : technicians && technicians.length > 0 ? (
                  <div className="space-y-3">
                    {technicians.map((tech: any) => (
                      <div
                        key={tech.id}
                        onClick={() => setSelectedTechnician(tech)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedTechnician?.id === tech.id
                            ? "border-yellow-500 bg-yellow-50"
                            : "border-gray-200 hover:border-yellow-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-yellow-500 text-black font-bold">
                              {tech.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-bold">{tech.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span>{tech.rating || 5}</span>
                              <span>•</span>
                              <span>{tech.completedJobs || 0} خدمة</span>
                            </div>
                            {tech.specialization && (
                              <p className="text-xs text-gray-500 mt-1">{tech.specialization}</p>
                            )}
                          </div>
                          {selectedTechnician?.id === tech.id && (
                            <CheckCircle2 className="w-6 h-6 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>لا يوجد فنيون متاحون حالياً في {city}</p>
                    <p className="text-sm mt-2">يرجى اختيار موقع أو وقت آخر</p>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <Button variant="outline" onClick={() => setStep("datetime")} className="flex-1">
                    رجوع
                  </Button>
                  <Button
                    onClick={() => setStep("payment")}
                    disabled={!selectedTechnician}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                  >
                    التالي <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: الدفع */}
          {step === "payment" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-yellow-500" />
                  الدفع وتأكيد الحجز
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* ملخص الحجز */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <h4 className="font-bold text-base mb-2">ملخص الحجز</h4>
                  <div className="flex justify-between"><span className="text-gray-600">الموقع:</span><span>{city} - {area}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">التاريخ:</span><span>{selectedDate?.toLocaleDateString("ar-SA")}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">الوقت:</span><span>{selectedTime}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">الخدمة:</span><span>{selectedService?.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">الفني:</span><span>{selectedTechnician?.name}</span></div>
                  <hr />
                  <div className="flex justify-between font-bold text-base"><span>المبلغ:</span><span>{selectedService?.price} ر.س</span></div>
                </div>

                {/* بيانات العميل */}
                <div className="space-y-3">
                  <div>
                    <Label>اسمك *</Label>
                    <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="اسمك الكامل" />
                  </div>
                  <div>
                    <Label>رقم الجوال *</Label>
                    <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="05xxxxxxxx" dir="ltr" />
                  </div>
                </div>

                {/* زر الدفع */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("technician")} className="flex-1">
                    رجوع
                  </Button>
                  <Button
                    onClick={handlePayment}
                    disabled={createBookingMutation.isPending || !customerName || !customerPhone}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                  >
                    {createBookingMutation.isPending ? "جاري الدفع..." : `ادفع ${selectedService?.price} ر.س`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: التأكيد - عرض بيانات الفني */}
          {step === "confirmation" && isPaid && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-800 mb-2">تم الحجز والدفع بنجاح!</h2>
                <p className="text-green-700 mb-6">سيتواصل معك الفني في الموعد المحدد</p>

                {/* بيانات الفني */}
                <div className="bg-white rounded-xl p-6 shadow-sm text-right space-y-4 max-w-sm mx-auto">
                  <div className="text-center mb-4">
                    <Avatar className="w-16 h-16 mx-auto mb-2">
                      <AvatarFallback className="bg-yellow-500 text-black text-xl font-bold">
                        {selectedTechnician?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold">{selectedTechnician?.name}</h3>
                    {selectedTechnician?.specialization && (
                      <p className="text-sm text-gray-600">{selectedTechnician.specialization}</p>
                    )}
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">رقم الجوال</p>
                        <a href={`tel:${selectedTechnician?.phone}`} className="font-bold text-lg text-green-700 hover:underline" dir="ltr">
                          {selectedTechnician?.phone}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">الموعد</p>
                        <p className="font-bold">{selectedDate?.toLocaleDateString("ar-SA")} - {selectedTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-xs text-gray-500">الموقع</p>
                        <p className="font-bold">{city} - {area}</p>
                      </div>
                    </div>
                  </div>

                  {/* زر اتصال واتساب */}
                  <a
                    href={`https://wa.me/${selectedTechnician?.phone?.replace(/^0/, "966")}?text=مرحباً، حجزت موعد عن طريق مير بتاريخ ${selectedDate?.toLocaleDateString("ar-SA")} الساعة ${selectedTime}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg text-center mt-4"
                  >
                    تواصل واتساب مع الفني
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
