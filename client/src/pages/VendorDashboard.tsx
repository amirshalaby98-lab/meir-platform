import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  BarChart3,
  Star,
  TrendingUp,
  Users,
  Package,
  Clock,
  DollarSign,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface VendorProfile {
  id: number;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  city: string;
  area: string;
  address: string;
  description: string;
  vendorType: string;
  status: string;
  rating: number;
  totalServices: number;
  totalEarnings: number;
  createdAt: Date;
}

interface VendorService {
  id: number;
  serviceName: string;
  description: string;
  price: number;
  category: string;
}

interface VendorStats {
  totalBookings: number;
  completedBookings: number;
  averageRating: number;
  totalEarnings: number;
  thisMonthEarnings: number;
  pendingBookings: number;
}

export default function VendorDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "services" | "bookings" | "earnings">("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<VendorService | null>(null);

  // Queries
  const { data: vendorProfile, isLoading: profileLoading } = trpc.vendors.getProfile.useQuery({ vendorId: 0 }, { retry: false });
  const { data: vendorServices, isLoading: servicesLoading } = trpc.vendors.getServices.useQuery({ vendorId: 0 }, { retry: false });

  // Mutations
  const updateProfileMutation = trpc.vendors.updateProfile.useMutation();
  const addServiceMutation = trpc.vendors.addService.useMutation();

  const [profileData, setProfileData] = useState<any>({});
  const [newService, setNewService] = useState<any>({
    serviceName: "",
    description: "",
    price: 0,
    category: "",
  });
  const [statsLoading] = useState(false);
  const vendorStats = { totalBookings: 0, completedBookings: 0, pendingBookings: 0, thisMonthEarnings: 0, totalEarnings: 0, averageRating: 0 };

  useEffect(() => {
    if (vendorProfile) {
      setProfileData({ ...vendorProfile });
    }
  }, [vendorProfile]);

  const handleUpdateProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync(profileData as any);
      setIsEditing(false);
      toast({ title: "✅ تم التحديث", description: "تم تحديث ملفك الشخصي بنجاح" });
    } catch (error) {
      toast({ title: "❌ خطأ", description: "حدث خطأ في تحديث الملف الشخصي" });
    }
  };

  const handleAddService = async () => {
    try {
      await addServiceMutation.mutateAsync(newService as any);
      setNewService({ serviceName: "", description: "", price: 0, category: "" });
      setIsAddingService(false);
      toast({ title: "✅ تم الإضافة", description: "تم إضافة الخدمة بنجاح" });
    } catch (error) {
      toast({ title: "❌ خطأ", description: "حدث خطأ في إضافة الخدمة" });
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    try {
      // await deleteServiceMutation.mutateAsync({ id: serviceId } as any);
      toast({ title: "✅ تم الحذف", description: "تم حذف الخدمة بنجاح" });
    } catch (error) {
      toast({ title: "❌ خطأ", description: "حدث خطأ في حذف الخدمة" });
    }
  };

  if (profileLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!vendorProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">لم يتم تسجيل الدخول</h2>
          <p className="text-slate-600 mb-4">يرجى تسجيل الدخول أولاً كبائع</p>
          <Button onClick={() => setLocation("/vendor/register")}>تسجيل كبائع</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">{vendorProfile.businessName}</h1>
              <p className="text-slate-600">لوحة تحكم البائع</p>
            </div>
            <div className="text-right">
                <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(typeof vendorProfile.rating === 'number' ? vendorProfile.rating : 0) ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-600">0 / 5.0</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex gap-2">
            {vendorProfile.status === "approved" && (
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4" />
                <span className="font-semibold">موافق عليه</span>
              </div>
            )}
            {vendorProfile.status === "pending" && (
              <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">قيد المراجعة</span>
              </div>
            )}
            {vendorProfile.status === "rejected" && (
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full">
                <AlertCircle className="w-4 h-4" />
                <span className="font-semibold">مرفوض</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {vendorStats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">إجمالي الحجوزات</p>
                  <p className="text-3xl font-bold text-blue-600">{vendorStats?.totalBookings || 0}</p>
                </div>
                <BarChart3 className="w-10 h-10 text-blue-300" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">المكتملة</p>
                  <p className="text-3xl font-bold text-green-600">{vendorStats?.completedBookings || 0}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-300" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">قيد الانتظار</p>
                  <p className="text-3xl font-bold text-yellow-600">{vendorStats?.pendingBookings || 0}</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-300" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">هذا الشهر</p>
                  <p className="text-3xl font-bold text-purple-600">{vendorStats?.thisMonthEarnings || 0} ريال</p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-300" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">الإجمالي</p>
                  <p className="text-3xl font-bold text-orange-600">{vendorStats?.totalEarnings || 0} ريال</p>
                </div>
                <DollarSign className="w-10 h-10 text-orange-300" />
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {["overview", "profile", "services", "bookings", "earnings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-yellow-500 text-yellow-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab === "overview" && "نظرة عامة"}
              {tab === "profile" && "الملف الشخصي"}
              {tab === "services" && "الخدمات"}
              {tab === "bookings" && "الحجوزات"}
              {tab === "earnings" && "الأرباح"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="flex gap-4 mb-6">
              <a href="/vendor-analytics" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                📊 عرض لوحة التحليلات
              </a>
            </div>
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">معلومات الملف الشخصي</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">اسم المتجر</p>
                  <p className="text-lg font-semibold">{vendorProfile.businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">اسم المالك</p>
                  <p className="text-lg font-semibold">{vendorProfile.ownerName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">الهاتف</p>
                  <p className="text-lg font-semibold">{vendorProfile.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">البريد الإلكتروني</p>
                  <p className="text-lg font-semibold">{vendorProfile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">التقييم</p>
                  <p className="text-lg font-semibold">0 / 5.0</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "profile" && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">تعديل الملف الشخصي</h2>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} className="gap-2">
                  <Edit2 className="w-4 h-4" />
                  تعديل
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>اسم المتجر</Label>
                    <Input
                      value={profileData.businessName || ""}
                      onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>اسم المالك</Label>
                    <Input
                      value={profileData.ownerName || ""}
                      onChange={(e) => setProfileData({ ...profileData, ownerName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>الهاتف</Label>
                    <Input
                      value={profileData.phone || ""}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      value={profileData.email || ""}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>المدينة</Label>
                    <Input
                      value={profileData.city || ""}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>الحي</Label>
                    <Input
                      value={profileData.area || ""}
                      onChange={(e) => setProfileData({ ...profileData, area: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>العنوان</Label>
                  <Input
                    value={profileData.address || ""}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label>الوصف</Label>
                  <Textarea
                    value={profileData.description || ""}
                    onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={updateProfileMutation.isPending}
                    className="gap-2 bg-green-500 hover:bg-green-600"
                  >
                    {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    حفظ التغييرات
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline">
                    إلغاء
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-slate-600">
                <p>اضغط على زر "تعديل" لتحديث معلومات ملفك الشخصي</p>
              </div>
            )}
          </Card>
        )}

        {activeTab === "services" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">الخدمات المقدمة</h2>
              <Button onClick={() => setIsAddingService(true)} className="gap-2 bg-green-500 hover:bg-green-600">
                <Plus className="w-4 h-4" />
                إضافة خدمة
              </Button>
            </div>

            {isAddingService && (
              <Card className="p-6 border-2 border-green-200">
                <h3 className="text-lg font-bold mb-4">إضافة خدمة جديدة</h3>
                <div className="space-y-4">
                  <div>
                    <Label>اسم الخدمة</Label>
                    <Input
                      placeholder="مثال: صيانة محرك"
                      value={newService.serviceName || ""}
                      onChange={(e) => setNewService({ ...newService, serviceName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>الفئة</Label>
                    <Select value={newService.category || ""} onValueChange={(v) => setNewService({ ...newService, category: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintenance">صيانة</SelectItem>
                        <SelectItem value="repair">إصلاح</SelectItem>
                        <SelectItem value="parts">قطع غيار</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>السعر (ريال)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newService.price || 0}
                      onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>الوصف</Label>
                    <Textarea
                      placeholder="وصف الخدمة"
                      value={newService.description || ""}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddService} disabled={addServiceMutation.isPending} className="gap-2 bg-green-500 hover:bg-green-600">
                      {addServiceMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      إضافة
                    </Button>
                    <Button onClick={() => setIsAddingService(false)} variant="outline">
                      إلغاء
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {vendorServices && vendorServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendorServices.map((service) => (
                  <Card key={service.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{service.serviceName}</h3>
                        <p className="text-sm text-slate-600">{(service as any).category || 'عام'}</p>
                      </div>
                      {false && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-slate-600 mb-4">{service.description}</p>
                    <p className="text-2xl font-bold text-yellow-600">{service.price} ريال</p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">لم تقم بإضافة أي خدمات بعد</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === "bookings" && (
          <Card className="p-12 text-center">
            <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">سيتم عرض الحجوزات هنا قريباً</p>
          </Card>
        )}

        {activeTab === "earnings" && (
          <Card className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">سيتم عرض تفاصيل الأرباح هنا قريباً</p>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}
