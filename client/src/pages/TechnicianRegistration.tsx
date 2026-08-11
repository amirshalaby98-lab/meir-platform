import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Wrench, CheckCircle, Clock, XCircle } from "lucide-react";

const specializations = [
  "ميكانيكا عامة",
  "كهرباء سيارات",
  "بطاريات ودينمو",
  "تكييف وتبريد",
  "فرامل ومكابح",
  "عفشة وتوجيه",
  "قير وناقل حركة",
  "محركات",
  "بودي وسمكرة",
  "برمجة وكمبيوتر",
  "إطارات وبنشر",
  "زيوت وفلاتر",
  "أخرى",
];

const locations = [
  "مكة المكرمة",
  "جدة",
  "الرياض",
  "المدينة المنورة",
  "الدمام",
  "الخبر",
  "الطائف",
  "أبها",
  "تبوك",
  "أخرى",
];

export default function TechnicianRegistration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    nationalId: "",
    specialization: "",
    yearsExperience: 0,
    location: "",
  });

  // التحقق من حالة التسجيل
  const { data: registration, isLoading } = trpc.technician.getMyRegistration.useQuery();
  const registerMutation = trpc.technician.register.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "تم إرسال الطلب ✅",
          description: data.message,
        });
      } else {
        toast({
          title: "تنبيه",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.nationalId || !formData.specialization || !formData.location) {
      toast({
        title: "خطأ",
        description: "يرجى تعبئة جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  // إذا كان مسجل مسبقاً - عرض حالة الطلب
  if (registration?.registered) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md bg-gray-900 border-gray-700">
          <CardHeader className="text-center">
            {registration.status === "pending" && (
              <>
                <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-yellow-500">طلبك قيد المراجعة</CardTitle>
                <CardDescription className="text-gray-400 text-lg mt-2">
                  تم استلام طلبك بنجاح وسيتم مراجعته من قبل الإدارة. سنبلغك فور الموافقة.
                </CardDescription>
              </>
            )}
            {registration.status === "approved" && (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-green-500">تمت الموافقة ✅</CardTitle>
                <CardDescription className="text-gray-400 text-lg mt-2">
                  تهانينا! تم قبول طلبك. يمكنك الآن استقبال الطلبات.
                </CardDescription>
              </>
            )}
            {registration.status === "rejected" && (
              <>
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-red-500">تم رفض الطلب</CardTitle>
                <CardDescription className="text-gray-400 text-lg mt-2">
                  نأسف، تم رفض طلبك. يمكنك التواصل مع الإدارة لمعرفة السبب.
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => setLocation("/")} variant="outline" className="mt-4">
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // نموذج التسجيل
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-lg bg-gray-900 border-gray-700">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl text-white">تسجيل فني جديد</CardTitle>
          <CardDescription className="text-gray-400">
            أكمل بياناتك للانضمام كفني في منصة مير
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* الاسم الكامل */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">الاسم الكامل *</Label>
              <Input
                id="name"
                placeholder="أدخل اسمك الكامل"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-800 border-gray-600 text-white"
                required
              />
            </div>

            {/* رقم الهوية */}
            <div className="space-y-2">
              <Label htmlFor="nationalId" className="text-gray-300">رقم الهوية الوطنية *</Label>
              <Input
                id="nationalId"
                placeholder="أدخل رقم الهوية (10 أرقام)"
                value={formData.nationalId}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData({ ...formData, nationalId: val });
                }}
                className="bg-gray-800 border-gray-600 text-white"
                maxLength={10}
                required
              />
            </div>

            {/* رقم الهاتف */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-300">رقم الجوال *</Label>
              <Input
                id="phone"
                placeholder="05xxxxxxxx"
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData({ ...formData, phone: val });
                }}
                className="bg-gray-800 border-gray-600 text-white"
                maxLength={10}
                required
              />
            </div>

            {/* التخصص */}
            <div className="space-y-2">
              <Label className="text-gray-300">التخصص *</Label>
              <Select
                value={formData.specialization}
                onValueChange={(val) => setFormData({ ...formData, specialization: val })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="اختر تخصصك" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* سنوات الخبرة */}
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-gray-300">سنوات الخبرة *</Label>
              <Input
                id="experience"
                type="number"
                min={0}
                max={50}
                placeholder="عدد سنوات الخبرة"
                value={formData.yearsExperience || ""}
                onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })}
                className="bg-gray-800 border-gray-600 text-white"
                required
              />
            </div>

            {/* المنطقة */}
            <div className="space-y-2">
              <Label className="text-gray-300">المنطقة *</Label>
              <Select
                value={formData.location}
                onValueChange={(val) => setFormData({ ...formData, location: val })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="اختر منطقتك" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* زر الإرسال */}
            <Button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 text-lg"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "جاري الإرسال..." : "إرسال طلب التسجيل"}
            </Button>

            <p className="text-gray-500 text-sm text-center mt-2">
              سيتم مراجعة طلبك من قبل الإدارة وإبلاغك بالنتيجة
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
