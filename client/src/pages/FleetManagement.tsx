import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";

export default function FleetManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"overview" | "vehicles" | "maintenance" | "register">("overview");
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);

  const companies = trpc.fleet.getMyCompanies.useQuery();
  const vehicles = trpc.fleet.getVehicles.useQuery({ companyId: selectedCompany || 0 }, { enabled: !!selectedCompany });
  const stats = trpc.fleet.getStats.useQuery({ companyId: selectedCompany || 0 }, { enabled: !!selectedCompany });
  const maintenance = trpc.fleet.getMaintenanceHistory.useQuery({ companyId: selectedCompany || 0 }, { enabled: !!selectedCompany });

  const registerCompany = trpc.fleet.registerCompany.useMutation();
  const addVehicle = trpc.fleet.addVehicle.useMutation();

  const [newCompany, setNewCompany] = useState({ companyName: "", contactPerson: "", phone: "", email: "", vehicleCount: 0, contractType: "monthly" as const });
  const [newVehicle, setNewVehicle] = useState({ plateNumber: "", make: "", model: "", year: "", mileage: 0 });

  const handleRegister = async () => {
    try {
      await registerCompany.mutateAsync(newCompany);
      toast({ title: "تم التسجيل", description: "تم تسجيل شركتك بنجاح" });
      companies.refetch();
      setActiveTab("overview");
    } catch (e) {
      toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", variant: "destructive" });
    }
  };

  const handleAddVehicle = async () => {
    if (!selectedCompany) return;
    try {
      await addVehicle.mutateAsync({ companyId: selectedCompany, ...newVehicle });
      toast({ title: "تمت الإضافة", description: "تمت إضافة المركبة بنجاح" });
      vehicles.refetch();
      setNewVehicle({ plateNumber: "", make: "", model: "", year: "", mileage: 0 });
    } catch (e) {
      toast({ title: "خطأ", description: "حدث خطأ", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">إدارة الأساطيل</h1>
        <p className="text-gray-600 text-center mb-8">إدارة مركبات شركتك وجدولة الصيانة</p>

        {/* Tabs */}
        <div className="flex gap-2 justify-center mb-6 flex-wrap">
          {[
            { id: "overview", label: "نظرة عامة" },
            { id: "vehicles", label: "المركبات" },
            { id: "maintenance", label: "الصيانة" },
            { id: "register", label: "تسجيل شركة" },
          ].map((tab) => (
            <Button key={tab.id} variant={activeTab === tab.id ? "default" : "outline"} onClick={() => setActiveTab(tab.id as any)} className={activeTab === tab.id ? "bg-yellow-400 text-black" : ""}>
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Company Selector */}
        {companies.data && companies.data.length > 0 && activeTab !== "register" && (
          <div className="max-w-md mx-auto mb-6">
            <select className="w-full border rounded-lg p-2" value={selectedCompany || ""} onChange={(e) => setSelectedCompany(Number(e.target.value))}>
              <option value="">اختر الشركة</option>
              {companies.data.map((c) => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          </div>
        )}

        {/* Overview */}
        {activeTab === "overview" && selectedCompany && stats.data && (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-yellow-600">{stats.data.vehicles?.total || 0}</p><p className="text-sm text-gray-500">إجمالي المركبات</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-600">{stats.data.vehicles?.active || 0}</p><p className="text-sm text-gray-500">نشطة</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-orange-600">{stats.data.vehicles?.inService || 0}</p><p className="text-sm text-gray-500">في الصيانة</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-blue-600">{stats.data.maintenance?.completed || 0}</p><p className="text-sm text-gray-500">صيانات مكتملة</p></CardContent></Card>
          </div>
        )}

        {/* Vehicles */}
        {activeTab === "vehicles" && selectedCompany && (
          <div>
            <Card className="mb-4">
              <CardHeader><CardTitle>إضافة مركبة</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <input className="border rounded p-2" placeholder="رقم اللوحة" value={newVehicle.plateNumber} onChange={(e) => setNewVehicle({ ...newVehicle, plateNumber: e.target.value })} />
                  <input className="border rounded p-2" placeholder="الماركة" value={newVehicle.make} onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })} />
                  <input className="border rounded p-2" placeholder="الموديل" value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} />
                  <input className="border rounded p-2" placeholder="السنة" value={newVehicle.year} onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })} />
                  <Button className="bg-yellow-400 text-black hover:bg-yellow-500" onClick={handleAddVehicle}>إضافة</Button>
                </div>
              </CardContent>
            </Card>
            {vehicles.data && vehicles.data.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {vehicles.data.map((v) => (
                  <Card key={v.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold">{v.make} {v.model} {v.year}</h3>
                          <p className="text-sm text-gray-500">لوحة: {v.plateNumber}</p>
                          {v.mileage && <p className="text-sm text-gray-500">الكيلومترات: {v.mileage?.toLocaleString()}</p>}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${v.status === "active" ? "bg-green-100 text-green-700" : v.status === "in_service" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                          {v.status === "active" ? "نشط" : v.status === "in_service" ? "في الصيانة" : "خارج الخدمة"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">لا توجد مركبات مسجلة</p>
            )}
          </div>
        )}

        {/* Maintenance */}
        {activeTab === "maintenance" && selectedCompany && (
          <div>
            {maintenance.data && maintenance.data.length > 0 ? (
              <div className="space-y-3">
                {maintenance.data.map((m) => (
                  <Card key={m.id}>
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">{m.serviceType}</h3>
                        <p className="text-sm text-gray-500">{m.description}</p>
                        {m.scheduledDate && <p className="text-sm text-gray-400">الموعد: {new Date(m.scheduledDate).toLocaleDateString("ar-SA")}</p>}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${m.status === "completed" ? "bg-green-100 text-green-700" : m.status === "scheduled" ? "bg-blue-100 text-blue-700" : m.status === "in_progress" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                        {m.status === "completed" ? "مكتمل" : m.status === "scheduled" ? "مجدول" : m.status === "in_progress" ? "قيد التنفيذ" : "ملغي"}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">لا يوجد سجل صيانة</p>
            )}
          </div>
        )}

        {/* Register Company */}
        {activeTab === "register" && (
          <Card className="max-w-lg mx-auto">
            <CardHeader><CardTitle>تسجيل شركة جديدة</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <input className="w-full border rounded-lg p-2" placeholder="اسم الشركة" value={newCompany.companyName} onChange={(e) => setNewCompany({ ...newCompany, companyName: e.target.value })} />
              <input className="w-full border rounded-lg p-2" placeholder="الشخص المسؤول" value={newCompany.contactPerson} onChange={(e) => setNewCompany({ ...newCompany, contactPerson: e.target.value })} />
              <input className="w-full border rounded-lg p-2" placeholder="رقم الجوال" value={newCompany.phone} onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })} />
              <input className="w-full border rounded-lg p-2" placeholder="البريد الإلكتروني" value={newCompany.email} onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })} />
              <select className="w-full border rounded-lg p-2" value={newCompany.contractType} onChange={(e) => setNewCompany({ ...newCompany, contractType: e.target.value as any })}>
                <option value="monthly">عقد شهري</option>
                <option value="yearly">عقد سنوي</option>
                <option value="per_service">حسب الخدمة</option>
              </select>
              <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-500" onClick={handleRegister} disabled={!newCompany.companyName || !newCompany.phone}>
                تسجيل الشركة
              </Button>
            </CardContent>
          </Card>
        )}

        {!selectedCompany && activeTab !== "register" && companies.data && companies.data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">لم تسجل شركة بعد</p>
            <Button className="bg-yellow-400 text-black hover:bg-yellow-500" onClick={() => setActiveTab("register")}>
              سجل شركتك الآن
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
