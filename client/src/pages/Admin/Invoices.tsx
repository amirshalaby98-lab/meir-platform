import { useState } from "react";
import { FileText, Plus, Download, Trash2, Edit } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useToast } from "../../hooks/use-toast";
import { trpc } from "../../lib/trpc";
import AdminLayout from "@/components/AdminLayout";

export default function InvoicesManagement() {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    bookingId: "",
    invoiceNumber: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    serviceDescription: "",
    amount: "",
    taxAmount: "",
    discountAmount: "",
    finalAmount: "",
  });

  const { data: invoices, refetch } = trpc.notifications.getInvoices.useQuery();
  const createInvoice = trpc.notifications.createInvoice.useMutation();
  const updateStatus = trpc.notifications.updateInvoiceStatus.useMutation();
  const deleteInvoice = trpc.notifications.deleteInvoice.useMutation();

  const filteredInvoices = statusFilter === "all"
    ? invoices
    : invoices?.filter((inv: any) => inv.status === statusFilter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createInvoice.mutateAsync({
        bookingId: parseInt(formData.bookingId),
        invoiceNumber: formData.invoiceNumber,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        serviceDescription: formData.serviceDescription,
        amount: formData.amount,
        taxAmount: formData.taxAmount,
        discountAmount: formData.discountAmount,
        finalAmount: formData.finalAmount,
      });
      toast({ title: "تم الإضافة", description: "تم إنشاء الفاتورة بنجاح" });
      setFormData({
        bookingId: "",
        invoiceNumber: "",
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        serviceDescription: "",
        amount: "",
        taxAmount: "",
        discountAmount: "",
        finalAmount: "",
      });
      setShowAddForm(false);
      refetch();
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء الحفظ" });
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus as any });
      refetch();
      toast({ title: "تم التحديث", description: "تم تحديث حالة الفاتورة" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) return;
    try {
      await deleteInvoice.mutateAsync({ id });
      refetch();
      toast({ title: "تم الحذف", description: "تم حذف الفاتورة بنجاح" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ" });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      issued: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "مسودة",
      issued: "صادرة",
      paid: "مدفوعة",
      cancelled: "ملغاة",
    };
    return labels[status] || status;
  };

  return (
    <AdminLayout title="إدارة الفواتير">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">إجمالي الفواتير</p>
                <p className="text-3xl font-bold text-gray-900">{invoices?.length || 0}</p>
              </div>
              <FileText className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">مدفوعة</p>
                <p className="text-3xl font-bold text-green-600">
                  {invoices?.filter((i: any) => i.status === "paid").length || 0}
                </p>
              </div>
              <FileText className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">قيد الانتظار</p>
                <p className="text-3xl font-bold text-blue-600">
                  {invoices?.filter((i: any) => i.status === "issued").length || 0}
                </p>
              </div>
              <FileText className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full bg-yellow-500 hover:bg-yellow-600"
            >
              <Plus className="w-4 h-4 ml-2" />
              فاتورة جديدة
            </Button>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">إضافة فاتورة جديدة</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>رقم الحجز</Label>
                <Input
                  type="number"
                  value={formData.bookingId}
                  onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>رقم الفاتورة</Label>
                <Input
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>اسم العميل</Label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>هاتف العميل</Label>
                <Input
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>بريد العميل</Label>
                <Input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                />
              </div>
              <div>
                <Label>وصف الخدمة</Label>
                <Input
                  value={formData.serviceDescription}
                  onChange={(e) => setFormData({ ...formData, serviceDescription: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>المبلغ الأساسي</Label>
                <Input
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>الضريبة</Label>
                <Input
                  value={formData.taxAmount}
                  onChange={(e) => setFormData({ ...formData, taxAmount: e.target.value })}
                />
              </div>
              <div>
                <Label>الخصم</Label>
                <Input
                  value={formData.discountAmount}
                  onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                />
              </div>
              <div>
                <Label>المبلغ النهائي</Label>
                <Input
                  value={formData.finalAmount}
                  onChange={(e) => setFormData({ ...formData, finalAmount: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" className="flex-1">إضافة</Button>
                <Button 
                  type="button" 
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddForm(false)}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4">
          <Label>فلترة حسب الحالة</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفواتير</SelectItem>
              <SelectItem value="draft">مسودة</SelectItem>
              <SelectItem value="issued">صادرة</SelectItem>
              <SelectItem value="paid">مدفوعة</SelectItem>
              <SelectItem value="cancelled">ملغاة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الفاتورة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices?.map((invoice: any) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{invoice.customerName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{invoice.finalAmount} ريال</td>
                    <td className="px-6 py-4 text-sm">
                      <Select value={invoice.status} onValueChange={(v) => handleStatusChange(invoice.id, v)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">مسودة</SelectItem>
                          <SelectItem value="issued">صادرة</SelectItem>
                          <SelectItem value="paid">مدفوعة</SelectItem>
                          <SelectItem value="cancelled">ملغاة</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(invoice.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(invoice.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
