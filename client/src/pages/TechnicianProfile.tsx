import { trpc } from "@/lib/trpc";
import { useRoute } from "wouter";
import { Phone, Mail, MapPin, Star, Package, Award, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TechnicianReviewsDisplay } from "@/components/TechnicianReviewsDisplay";

export default function TechnicianProfile() {
  const [, params] = useRoute("/technician/:id");
  const technicianId = params?.id ? parseInt(params.id) : 0;

  const { data: technician } = trpc.technician.getById.useQuery({ id: technicianId });
  const { data: bookings } = trpc.technician.getBookings.useQuery({ technicianId });

  if (!technician) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">الفني غير موجود</h2>
          <Button onClick={() => (window.location.href = "/")} className="bg-yellow-400 hover:bg-yellow-500 text-black">
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  const completedBookings = bookings?.filter((b) => b.status === "completed") || [];
  const pendingBookings = bookings?.filter((b) => b.status === "pending" || b.status === "confirmed") || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "busy":
        return "bg-yellow-100 text-yellow-800";
      case "offline":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "متاح";
      case "busy":
        return "مشغول";
      case "offline":
        return "غير متصل";
      default:
        return status;
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBookingStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "معلق";
      case "confirmed":
        return "مؤكد";
      case "completed":
        return "مكتمل";
      case "cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-lg p-8 mb-8 text-black">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-5xl">👨‍🔧</span>
            </div>
            <div className="flex-1 text-center md:text-right">
              <h1 className="text-4xl font-bold mb-2">{technician.name}</h1>
              <p className="text-lg opacity-90 mb-3">{technician.specialization || "فني صيانة سيارات"}</p>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(technician.status)}`}>
                {getStatusText(technician.status)}
              </span>
            </div>
            <div className="flex gap-4">
              <a
                href={`tel:${technician.phone}`}
                className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                اتصل الآن
              </a>
              <a
                href={`https://wa.me/966${technician.phone.slice(1)}?text=مرحباً، أريد التواصل معك بخصوص خدمة صيانة السيارات`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <span className="text-xl">💬</span>
                واتساب
              </a>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">التقييم</p>
                <p className="text-3xl font-bold text-black">{technician.rating}</p>
              </div>
              <Award className="w-12 h-12 text-yellow-400" />
            </div>
            <div className="flex gap-1 mt-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < technician.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">المهام المكتملة</p>
                <p className="text-3xl font-bold text-black">{technician.completedJobs}</p>
              </div>
              <Package className="w-12 h-12 text-green-400" />
            </div>
            <p className="text-xs text-gray-500 mt-3">إجمالي المهام المنجزة</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">الحجوزات الحالية</p>
                <p className="text-3xl font-bold text-black">{pendingBookings.length}</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-400" />
            </div>
            <p className="text-xs text-gray-500 mt-3">قيد التنفيذ</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">معدل النجاح</p>
                <p className="text-3xl font-bold text-black">
                  {technician.completedJobs > 0 ? Math.round((completedBookings.length / technician.completedJobs) * 100) : 100}%
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-400" />
            </div>
            <p className="text-xs text-gray-500 mt-3">نسبة إتمام المهام</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-black mb-6">معلومات الاتصال</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">رقم الهاتف</p>
                <p className="text-lg font-bold text-black">{technician.phone}</p>
              </div>
            </div>

            {technician.email && (
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                  <p className="text-lg font-bold text-black">{technician.email}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">منطقة العمل</p>
                <p className="text-lg font-bold text-black">{technician.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Specialization */}
        {technician.specialization && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">التخصصات</h2>
            <div className="flex flex-wrap gap-3">
              {technician.specialization.split("،").map((spec, index) => (
                <span key={index} className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-semibold">
                  {spec.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Current Bookings */}
        {pendingBookings.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-black mb-6">الحجوزات الحالية ({pendingBookings.length})</h2>
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <div key={booking.id} className="bg-gray-50 rounded-lg p-4 border-r-4 border-blue-400">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-black">{booking.name}</h3>
                      <p className="text-sm text-gray-600">{booking.service}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getBookingStatusColor(booking.status)}`}>
                      {getBookingStatusText(booking.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{booking.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{booking.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🕐</span>
                      <span>{booking.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Bookings */}
        {completedBookings.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-black mb-6">المهام المكتملة ({completedBookings.length})</h2>
            <div className="space-y-4">
              {completedBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="bg-gray-50 rounded-lg p-4 border-r-4 border-green-400">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-black">{booking.name}</h3>
                      <p className="text-sm text-gray-600">{booking.service}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">مكتمل</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{booking.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🕐</span>
                      <span>{booking.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <TechnicianReviewsDisplay
            technicianId={technicianId}
            technicianName={technician.name}
            averageRating={technician.rating}
            totalReviews={technician.completedJobs}
          />
        </div>
      </div>
    </div>
  );
}
