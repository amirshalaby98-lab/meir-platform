import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, User, Phone, MapPin, Wrench, Calendar } from "lucide-react";

export default function PendingTechnicians() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const { data: pendingTechnicians, isLoading } = trpc.technician.getPending.useQuery();

  const approveMutation = trpc.technician.approve.useMutation({
    onSuccess: () => {
      toast({ title: "تمت الموافقة ✅", description: "تم قبول الفني بنجاح" });
      utils.technician.getPending.invalidate();
    },
    onError: (err) => {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    },
  });

  const rejectMutation = trpc.technician.reject.useMutation({
    onSuccess: () => {
      toast({ title: "تم الرفض", description: "تم رفض طلب الفني" });
      utils.technician.getPending.invalidate();
    },
    onError: (err) => {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-yellow-500" />
        <h1 className="text-2xl font-bold text-white">طلبات تسجيل الفنيين</h1>
        {pendingTechnicians && pendingTechnicians.length > 0 && (
          <Badge variant="destructive" className="text-sm">
            {pendingTechnicians.length} طلب معلق
          </Badge>
        )}
      </div>

      {!pendingTechnicians || pendingTechnicians.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">لا توجد طلبات معلقة حالياً</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingTechnicians.map((tech: any) => (
            <Card key={tech.id} className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-yellow-500" />
                    {tech.name}
                  </CardTitle>
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                    قيد المراجعة
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{tech.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Wrench className="w-4 h-4 text-gray-500" />
                    <span>{tech.specialization || "غير محدد"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{tech.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{tech.yearsExperience || 0} سنة خبرة</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <span className="text-gray-500">الهوية:</span>
                    <span>{tech.nationalId || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <span className="text-gray-500">تاريخ الطلب:</span>
                    <span>{new Date(tech.createdAt).toLocaleDateString("ar-SA")}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-gray-700">
                  <Button
                    onClick={() => approveMutation.mutate({ id: tech.id })}
                    disabled={approveMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 ml-2" />
                    موافقة
                  </Button>
                  <Button
                    onClick={() => rejectMutation.mutate({ id: tech.id })}
                    disabled={rejectMutation.isPending}
                    variant="destructive"
                  >
                    <XCircle className="w-4 h-4 ml-2" />
                    رفض
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
