import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Phone, Mail, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function TrackBooking() {
  const [bookingId, setBookingId] = useState("");
  const [searchedId, setSearchedId] = useState<number | null>(null);

  const { data: booking, isLoading, error } = trpc.tracking.getBooking.useQuery(
    { id: searchedId! },
    { enabled: searchedId !== null }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(bookingId);
    if (isNaN(id) || id <= 0) {
      toast.error("يرجى إدخال رقم حجز صحيح");
      return;
    }
    setSearchedId(id);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: <AlertCircle className="w-12 h-12 text-yellow-500" />,
          title: "معلق",
          description: "تم استلام طلبك وسيتم مراجعته قريباً",
          color: "bg-yellow-50 border-yellow-200",
        };
      case "confirmed":
        return {
          icon: <CheckCircle className="w-12 h-12 text-blue-500" />,
          title: "مؤكد",
          description: "تم تأكيد حجزك! فنينا في الطريق إليك",
          color: "bg-blue-50 border-blue-200",
        };
      case "completed":
        return {
          icon: <CheckCircle className="w-12 h-12 text-green-500" />,
          title: "مكتمل",
          description: "تم إتمام الخدمة بنجاح! نشكرك على ثقتك",
          color: "bg-green-50 border-green-200",
        };
      case "cancelled":
        return {
          icon: <XCircle className="w-12 h-12 text-red-500" />,
          title: "ملغي",
          description: "تم إلغاء الحجز",
          color: "bg-red-50 border-red-200",
        };
      default:
        return {
          icon: <AlertCircle className="w-12 h-12 text-gray-500" />,
          title: status,
          description: "",
          color: "bg-gray-50 border-gray-200",
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-20">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-black mb-4">
            تتبع حجزك
          </h1>
          <p className="text-center text-gray-600 mb-12">
            أدخل رقم الحجز لمعرفة حالة طلبك
          </p>

          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <form onSubmit={handleSearch} className="flex gap-4">
              <input
                type="number"
                placeholder="رقم الحجز"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                required
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8"
              >
                <Search className="w-5 h-5 ml-2" />
                بحث
              </Button>
            </form>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
              <p className="mt-4 text-gray-600">جاري البحث...</p>
            </div>
          )}

          {/* Error State */}
          {error && searchedId !== null && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-800 mb-2">لم يتم العثور على الحجز</h3>
              <p className="text-red-600">
                رقم الحجز غير صحيح أو غير موجود. يرجى التحقق من الرقم والمحاولة مرة أخرى
              </p>
            </div>
          )}

          {/* Booking Details */}
          {booking && !error && (
            <div className="space-y-6">
              {/* Status Card */}
              <div className={`border rounded-lg p-8 text-center ${getStatusInfo(booking.status).color}`}>
                <div className="flex justify-center mb-4">
                  {getStatusInfo(booking.status).icon}
                </div>
                <h2 className="text-2xl font-bold text-black mb-2">
                  {getStatusInfo(booking.status).title}
                </h2>
                <p className="text-gray-700">
                  {getStatusInfo(booking.status).description}
                </p>
              </div>

              {/* Booking Info Card */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-xl font-bold text-black mb-6">تفاصيل الحجز</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-yellow-600">#{booking.id}</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">رقم الحجز</p>
                      <p className="font-semibold text-black">{booking.id}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">👤</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">الاسم</p>
                      <p className="font-semibold text-black">{booking.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">رقم الهاتف</p>
                      <p className="font-semibold text-black">{booking.phone}</p>
                    </div>
                  </div>

                  {booking.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                        <p className="font-semibold text-black">{booking.email}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">🔧</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">الخدمة</p>
                      <p className="font-semibold text-black">{booking.service}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">الموقع</p>
                      <p className="font-semibold text-black">{booking.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">التاريخ</p>
                      <p className="font-semibold text-black">{booking.date}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">الوقت</p>
                      <p className="font-semibold text-black">{booking.time}</p>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">📝</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">ملاحظات</p>
                        <p className="font-semibold text-black">{booking.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Support */}
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-bold text-black mb-2">هل تحتاج مساعدة؟</h3>
                <p className="text-gray-700 mb-4">تواصل معنا مباشرة عبر واتساب</p>
                <a
                  href={`https://wa.me/966543257872?text=مرحباً، لدي استفسار عن الحجز رقم ${booking.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-green-500 hover:bg-green-600 text-white font-bold">
                    💬 تواصل عبر واتساب
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
