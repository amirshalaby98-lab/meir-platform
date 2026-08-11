import React, { useState } from "react";
import { useParams } from "wouter";
import { Calendar, MapPin, Phone, Mail, Wrench, Clock, AlertCircle, Send } from "lucide-react";
import { Button } from "../components/ui/button";
import { PriceQuoteModal, PriceQuote } from "../components/PriceQuoteModal";

interface Booking {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceType: string;
  location: string;
  scheduledDate: string;
  description: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  createdAt: string;
}

export function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [submittingQuote, setSubmittingQuote] = useState(false);

  React.useEffect(() => {
    // Fetch booking details
    const fetchBooking = async () => {
      try {
        setLoading(true);
        // Mock data - في الإنتاج، سيتم جلب البيانات من API
        const mockBooking: Booking = {
          id: parseInt(id || "1"),
          customerName: "أحمد محمد",
          customerPhone: "0543257872",
          customerEmail: "ahmed@example.com",
          serviceType: "صيانة دورية",
          location: "مكة المكرمة - حي النسيم",
          scheduledDate: "2026-05-30T10:00:00",
          description: "فحص شامل للسيارة وتغيير الزيت والفلاتر",
          status: "pending",
          createdAt: "2026-05-28T10:00:00",
        };
        setBooking(mockBooking);
      } catch (err) {
        setError(err instanceof Error ? err.message : "حدث خطأ في جلب البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleSubmitQuote = async (quote: PriceQuote) => {
    try {
      setSubmittingQuote(true);
      // في الإنتاج، سيتم إرسال البيانات إلى API
      console.log("Submitting quote:", quote);
      
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // يمكن إضافة إشعار هنا
      alert("تم إرسال العرض بنجاح!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ في إرسال العرض");
    } finally {
      setSubmittingQuote(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">لم يتم العثور على الحجز</p>
        </div>
      </div>
    );
  }

  const scheduledDate = new Date(booking.scheduledDate);
  const formattedDate = scheduledDate.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = scheduledDate.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusLabels = {
    pending: "قيد الانتظار",
    accepted: "مقبول",
    completed: "مكتمل",
    cancelled: "ملغى",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تفاصيل الحجز</h1>
          <p className="text-gray-600">رقم الحجز: #{booking.id}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">حالة الحجز</h2>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[booking.status]}`}>
                  {statusLabels[booking.status]}
                </span>
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">تفاصيل الخدمة</h2>

              <div className="flex gap-4">
                <Wrench className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">نوع الخدمة</p>
                  <p className="text-lg font-semibold text-gray-900">{booking.serviceType}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <MapPin className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">الموقع</p>
                  <p className="text-lg font-semibold text-gray-900">{booking.location}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Calendar className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">الموعد المحدد</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formattedDate} - {formattedTime}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">الوصف</p>
                <p className="text-gray-900 leading-relaxed">{booking.description}</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">بيانات العميل</h2>

              <div className="flex gap-4">
                <Phone className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">رقم الهاتف</p>
                  <a href={`tel:${booking.customerPhone}`} className="text-lg font-semibold text-blue-600 hover:underline">
                    {booking.customerPhone}
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <Mail className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                  <a href={`mailto:${booking.customerEmail}`} className="text-lg font-semibold text-blue-600 hover:underline">
                    {booking.customerEmail}
                  </a>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">اسم العميل</p>
                <p className="text-lg font-semibold text-gray-900">{booking.customerName}</p>
              </div>
            </div>
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h3 className="font-bold text-gray-900 mb-4">الإجراءات</h3>

              <Button
                onClick={() => setShowQuoteModal(true)}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold flex items-center justify-center gap-2 py-3"
              >
                <Send className="w-4 h-4" />
                إرسال عرض سعر
              </Button>

              <Button
                variant="outline"
                className="w-full"
              >
                <Clock className="w-4 h-4 mr-2" />
                تحديث الموعد
              </Button>

              <Button
                variant="outline"
                className="w-full"
              >
                إرسال رسالة
              </Button>

              <Button
                variant="outline"
                className="w-full text-red-600 hover:bg-red-50"
              >
                إلغاء الحجز
              </Button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>نصيحة:</strong> أرسل عرض سعر مفصل للعميل لزيادة فرص قبول الحجز
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Price Quote Modal */}
      <PriceQuoteModal
        isOpen={showQuoteModal}
        bookingId={booking.id}
        customerName={booking.customerName}
        onClose={() => setShowQuoteModal(false)}
        onSubmit={handleSubmitQuote}
        isLoading={submittingQuote}
      />
    </div>
  );
}

export default BookingDetails;
