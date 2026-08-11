import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/lib/trpc";
import { CheckCircle, XCircle, Eye } from "lucide-react";

export default function VendorApprovals() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<"pending" | "verified" | "all">("pending");
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const pendingQuery = trpc.vendors.getPendingVendors.useQuery();
  const verifiedQuery = trpc.vendors.getVerifiedVendors.useQuery();
  const allQuery = trpc.vendors.getAllVendors.useQuery();
  const detailsQuery = trpc.vendors.getVendorDetails.useQuery(
    { vendorId: selectedVendor?.id || 0 },
    { enabled: !!selectedVendor }
  );

  const approveMutation = trpc.vendors.approveVendor.useMutation();
  const rejectMutation = trpc.vendors.rejectVendor.useMutation();

  const vendorTypeLabels = {
    parts_shop: "متجر قطع غيار",
    technician: "فني صيانة",
    junkyard: "تشليح معتمد",
  };

  const statusLabels = {
    pending: "قيد الانتظار",
    verified: "تم التحقق",
    approved: "موافق عليه",
    rejected: "مرفوض",
    suspended: "معلق",
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    verified: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    suspended: "bg-gray-100 text-gray-800",
  };

  const getVendors = () => {
    if (selectedTab === "pending") return pendingQuery.data || [];
    if (selectedTab === "verified") return verifiedQuery.data || [];
    return allQuery.data || [];
  };

  const handleApprove = async (vendor: any) => {
    try {
      await approveMutation.mutateAsync({ vendorId: vendor.id });
      toast({
        title: "تم الموافقة",
        description: `تم الموافقة على ${vendor.businessName}`,
      });
      pendingQuery.refetch();
      verifiedQuery.refetch();
      allQuery.refetch();
      setShowDetailsDialog(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message,
      });
    }
  };

  const handleReject = async () => {
    if (!selectedVendor) return;

    try {
      await rejectMutation.mutateAsync({
        vendorId: selectedVendor.id,
        reason: rejectReason,
      });
      toast({
        title: "تم الرفض",
        description: `تم رفض ${selectedVendor.businessName}`,
      });
      pendingQuery.refetch();
      verifiedQuery.refetch();
      allQuery.refetch();
      setShowDetailsDialog(false);
      setShowRejectDialog(false);
      setRejectReason("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message,
      });
    }
  };

  const vendors = getVendors();

  return (
    <AdminLayout title="إدارة البائعين">
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة البائعين</h1>
          <p className="text-gray-600">مراجعة والموافقة على طلبات البائعين الجدد</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setSelectedTab("pending")}
            className={`px-4 py-2 font-medium border-b-2 ${
              selectedTab === "pending"
                ? "border-yellow-500 text-yellow-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            قيد الانتظار ({pendingQuery.data?.length || 0})
          </button>
          <button
            onClick={() => setSelectedTab("verified")}
            className={`px-4 py-2 font-medium border-b-2 ${
              selectedTab === "verified"
                ? "border-yellow-500 text-yellow-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            تم التحقق ({verifiedQuery.data?.length || 0})
          </button>
          <button
            onClick={() => setSelectedTab("all")}
            className={`px-4 py-2 font-medium border-b-2 ${
              selectedTab === "all"
                ? "border-yellow-500 text-yellow-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            الكل ({allQuery.data?.length || 0})
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المتجر</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>المالك</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>المدينة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor: any) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.businessName}</TableCell>
                  <TableCell>{vendorTypeLabels[vendor.vendorType as keyof typeof vendorTypeLabels]}</TableCell>
                  <TableCell>{vendor.ownerName}</TableCell>
                  <TableCell>{vendor.phone}</TableCell>
                  <TableCell>{vendor.city}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[vendor.status as keyof typeof statusColors]}>
                      {statusLabels[vendor.status as keyof typeof statusLabels]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedVendor(vendor);
                        setShowDetailsDialog(true);
                      }}
                    >
                      <Eye className="w-4 h-4 ml-2" />
                      عرض
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>تفاصيل البائع</DialogTitle>
            </DialogHeader>

            {selectedVendor && (
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">اسم المتجر</Label>
                    <p className="font-medium">{selectedVendor.businessName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">النوع</Label>
                    <p className="font-medium">
                      {vendorTypeLabels[selectedVendor.vendorType as keyof typeof vendorTypeLabels]}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">اسم المالك</Label>
                    <p className="font-medium">{selectedVendor.ownerName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">الهاتف</Label>
                    <p className="font-medium">{selectedVendor.phone}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">البريد الإلكتروني</Label>
                    <p className="font-medium">{selectedVendor.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">المدينة</Label>
                    <p className="font-medium">{selectedVendor.city}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">المنطقة</Label>
                    <p className="font-medium">{selectedVendor.area}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">الحالة</Label>
                    <Badge className={statusColors[selectedVendor.status as keyof typeof statusColors]}>
                      {statusLabels[selectedVendor.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                </div>

                {/* Address */}
                {selectedVendor.address && (
                  <div>
                    <Label className="text-gray-600">العنوان التفصيلي</Label>
                    <p className="font-medium">{selectedVendor.address}</p>
                  </div>
                )}

                {/* Description */}
                {selectedVendor.description && (
                  <div>
                    <Label className="text-gray-600">وصف الخدمات</Label>
                    <p className="font-medium">{selectedVendor.description}</p>
                  </div>
                )}

                {/* Documents */}
                {detailsQuery.data?.documents && detailsQuery.data.documents.length > 0 && (
                  <div>
                    <Label className="text-gray-600">المستندات</Label>
                    <div className="space-y-2">
                      {detailsQuery.data.documents.map((doc: any) => (
                        <a
                          key={doc.id}
                          href={doc.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:underline"
                        >
                          {doc.documentType}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Services */}
                {detailsQuery.data?.services && detailsQuery.data.services.length > 0 && (
                  <div>
                    <Label className="text-gray-600">الخدمات</Label>
                    <div className="space-y-2">
                      {detailsQuery.data.services.map((service: any) => (
                        <div key={service.id} className="p-2 bg-gray-50 rounded">
                          <p className="font-medium">{service.serviceName}</p>
                          {service.description && (
                            <p className="text-sm text-gray-600">{service.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejection Reason */}
                {selectedVendor.rejectionReason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <Label className="text-red-600">سبب الرفض</Label>
                    <p className="text-red-800">{selectedVendor.rejectionReason}</p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              {selectedVendor?.status === "verified" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <XCircle className="w-4 h-4 ml-2" />
                    رفض
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedVendor)}
                    disabled={approveMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 ml-2" />
                    {approveMutation.isPending ? "جاري..." : "موافقة"}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>رفض الطلب</DialogTitle>
            </DialogHeader>

            <div>
              <Label>سبب الرفض</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="اشرح سبب رفض الطلب..."
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleReject}
                disabled={rejectMutation.isPending || !rejectReason}
                className="bg-red-600 hover:bg-red-700"
              >
                {rejectMutation.isPending ? "جاري..." : "رفض"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
