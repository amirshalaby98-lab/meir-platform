import { useState } from "react";
import { useLocation } from "wouter";
import Header from "../components/Header";
import { trpc } from "../lib/trpc";
import { useAuth } from "../_core/hooks/useAuth";
import { Car, Plus, Trash2, Edit3, Star, StarOff, Fuel, Calendar, Hash, Gauge, ArrowLeft, CheckCircle } from "lucide-react";

type FuelType = "gasoline" | "diesel" | "hybrid" | "electric";

interface VehicleFormData {
  make: string;
  model: string;
  year: string;
  vin: string;
  mileage: string;
  color: string;
  plateNumber: string;
  fuelType: FuelType;
  notes: string;
}

const emptyForm: VehicleFormData = {
  make: "",
  model: "",
  year: "",
  vin: "",
  mileage: "",
  color: "",
  plateNumber: "",
  fuelType: "gasoline",
  notes: "",
};

const fuelTypeLabels: Record<FuelType, string> = {
  gasoline: "بنزين",
  diesel: "ديزل",
  hybrid: "هجين",
  electric: "كهربائي",
};

const fuelTypeColors: Record<FuelType, string> = {
  gasoline: "bg-blue-100 text-blue-800",
  diesel: "bg-gray-100 text-gray-800",
  hybrid: "bg-green-100 text-green-800",
  electric: "bg-yellow-100 text-yellow-800",
};

export default function MyVehicles() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<VehicleFormData>(emptyForm);
  const [successMsg, setSuccessMsg] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const vehiclesQuery = trpc.vehicles.getMyVehicles.useQuery(undefined, {
    enabled: !!user,
  });

  const addMutation = trpc.vehicles.addVehicle.useMutation({
    onSuccess: () => {
      vehiclesQuery.refetch();
      setShowForm(false);
      setForm(emptyForm);
      setSuccessMsg("تمت إضافة السيارة بنجاح");
      setTimeout(() => setSuccessMsg(""), 3000);
    },
  });

  const updateMutation = trpc.vehicles.updateVehicle.useMutation({
    onSuccess: () => {
      vehiclesQuery.refetch();
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setSuccessMsg("تم تحديث بيانات السيارة");
      setTimeout(() => setSuccessMsg(""), 3000);
    },
  });

  const deleteMutation = trpc.vehicles.deleteVehicle.useMutation({
    onSuccess: () => {
      vehiclesQuery.refetch();
      setDeleteConfirm(null);
      setSuccessMsg("تم حذف السيارة");
      setTimeout(() => setSuccessMsg(""), 3000);
    },
  });

  const setDefaultMutation = trpc.vehicles.setDefaultVehicle.useMutation({
    onSuccess: () => {
      vehiclesQuery.refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      make: form.make,
      model: form.model,
      year: form.year ? parseInt(form.year) : undefined,
      vin: form.vin || undefined,
      mileage: form.mileage ? parseInt(form.mileage) : undefined,
      color: form.color || undefined,
      plateNumber: form.plateNumber || undefined,
      fuelType: form.fuelType,
      notes: form.notes || undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      addMutation.mutate(data);
    }
  };

  const handleEdit = (vehicle: NonNullable<typeof vehiclesQuery.data>[0]) => {
    setEditingId(vehicle.id);
    setForm({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year?.toString() ?? "",
      vin: vehicle.vin ?? "",
      mileage: vehicle.mileage?.toString() ?? "",
      color: vehicle.color ?? "",
      plateNumber: vehicle.plateNumber ?? "",
      fuelType: (vehicle.fuelType as FuelType) ?? "gasoline",
      notes: vehicle.notes ?? "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">يجب تسجيل الدخول</h2>
          <p className="text-gray-500 mb-6">سجّل دخولك لإدارة سياراتك وعرض تقارير الفحص</p>
          <button
            onClick={() => navigate("/select-role")}
            className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl hover:bg-yellow-500 transition"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/obd-scanner")}
              className="p-2 rounded-lg hover:bg-gray-200 transition"
              title="العودة للماسح"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">سياراتي</h1>
              <p className="text-sm text-gray-500">إدارة سياراتك المسجلة</p>
            </div>
          </div>
          {!showForm && (
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
              className="flex items-center gap-2 bg-yellow-400 text-black font-bold px-4 py-2 rounded-xl hover:bg-yellow-500 transition"
            >
              <Plus className="w-4 h-4" />
              إضافة سيارة
            </button>
          )}
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl mb-4">
            <CheckCircle className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? "تعديل بيانات السيارة" : "إضافة سيارة جديدة"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الماركة *</label>
                  <input
                    type="text"
                    value={form.make}
                    onChange={e => setForm(f => ({ ...f, make: e.target.value }))}
                    placeholder="مثال: تويوتا، هوندا"
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الموديل *</label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                    placeholder="مثال: كامري، سيفيك"
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سنة الصنع</label>
                  <input
                    type="number"
                    value={form.year}
                    onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                    placeholder="2020"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع الوقود</label>
                  <select
                    value={form.fuelType}
                    onChange={e => setForm(f => ({ ...f, fuelType: e.target.value as FuelType }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="gasoline">بنزين</option>
                    <option value="diesel">ديزل</option>
                    <option value="hybrid">هجين</option>
                    <option value="electric">كهربائي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهيكل (VIN)</label>
                  <input
                    type="text"
                    value={form.vin}
                    onChange={e => setForm(f => ({ ...f, vin: e.target.value.toUpperCase() }))}
                    placeholder="17 خانة"
                    maxLength={17}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الكيلومترات</label>
                  <input
                    type="number"
                    value={form.mileage}
                    onChange={e => setForm(f => ({ ...f, mileage: e.target.value }))}
                    placeholder="50000"
                    min="0"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اللون</label>
                  <input
                    type="text"
                    value={form.color}
                    onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    placeholder="أبيض، أسود..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم اللوحة</label>
                  <input
                    type="text"
                    value={form.plateNumber}
                    onChange={e => setForm(f => ({ ...f, plateNumber: e.target.value }))}
                    placeholder="أ ب ج 1234"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="أي ملاحظات إضافية عن السيارة..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={addMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-yellow-400 text-black font-bold py-2.5 rounded-xl hover:bg-yellow-500 transition disabled:opacity-50"
                >
                  {addMutation.isPending || updateMutation.isPending ? "جاري الحفظ..." : editingId ? "حفظ التعديلات" : "إضافة السيارة"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 bg-gray-100 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-200 transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Vehicles List */}
        {vehiclesQuery.isLoading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            جاري التحميل...
          </div>
        ) : vehiclesQuery.data && vehiclesQuery.data.length > 0 ? (
          <div className="space-y-4">
            {vehiclesQuery.data.map(vehicle => (
              <div
                key={vehicle.id}
                className={`bg-white rounded-2xl shadow-sm border-2 transition ${vehicle.isDefault ? "border-yellow-400" : "border-gray-100"}`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Car className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 text-lg">
                            {vehicle.make} {vehicle.model}
                          </h3>
                          {vehicle.isDefault && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                              الافتراضية
                            </span>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${fuelTypeColors[vehicle.fuelType as FuelType ?? "gasoline"]}`}>
                          {fuelTypeLabels[vehicle.fuelType as FuelType ?? "gasoline"]}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!vehicle.isDefault && (
                        <button
                          onClick={() => setDefaultMutation.mutate({ id: vehicle.id })}
                          className="p-2 text-gray-400 hover:text-yellow-500 transition"
                          title="تعيين كافتراضية"
                        >
                          <StarOff className="w-4 h-4" />
                        </button>
                      )}
                      {vehicle.isDefault && (
                        <Star className="w-4 h-4 text-yellow-500" />
                      )}
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="p-2 text-gray-400 hover:text-blue-500 transition"
                        title="تعديل"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(vehicle.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    {vehicle.year && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{vehicle.year}</span>
                      </div>
                    )}
                    {vehicle.mileage && (
                      <div className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-gray-400" />
                        <span>{vehicle.mileage.toLocaleString("ar-SA")} كم</span>
                      </div>
                    )}
                    {vehicle.vin && (
                      <div className="flex items-center gap-1.5 col-span-2">
                        <Hash className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-mono text-xs">{vehicle.vin}</span>
                      </div>
                    )}
                    {vehicle.plateNumber && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-medium">
                          {vehicle.plateNumber}
                        </span>
                      </div>
                    )}
                    {vehicle.color && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500">اللون:</span>
                        <span>{vehicle.color}</span>
                      </div>
                    )}
                  </div>

                  {vehicle.notes && (
                    <p className="mt-2 text-xs text-gray-400 border-t border-gray-50 pt-2">{vehicle.notes}</p>
                  )}

                  {/* Delete Confirmation */}
                  {deleteConfirm === vehicle.id && (
                    <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
                      <p className="text-sm text-red-700 mb-2">هل أنت متأكد من حذف هذه السيارة؟</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => deleteMutation.mutate({ id: vehicle.id })}
                          disabled={deleteMutation.isPending}
                          className="flex-1 bg-red-500 text-white text-sm font-medium py-1.5 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                        >
                          {deleteMutation.isPending ? "جاري الحذف..." : "نعم، احذف"}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-1.5 rounded-lg hover:bg-gray-200 transition"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Car className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">لا توجد سيارات مسجلة</h3>
            <p className="text-gray-400 text-sm mb-6">أضف سيارتك لربط تقارير الفحص بها</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-yellow-400 text-black font-bold px-6 py-2.5 rounded-xl hover:bg-yellow-500 transition"
            >
              إضافة سيارتي الأولى
            </button>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/obd-scanner")}
            className="flex items-center justify-center gap-2 bg-black text-white font-medium py-3 rounded-xl hover:bg-gray-900 transition"
          >
            <Fuel className="w-4 h-4" />
            فحص OBD
          </button>
          <button
            onClick={() => navigate("/my-obd-reports")}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition"
          >
            <Hash className="w-4 h-4" />
            تقاريري
          </button>
        </div>
      </div>
    </div>
  );
}
