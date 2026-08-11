import React, { useState, useEffect } from 'react';
import { CheckCircle, Star, MessageSquare, AlertCircle } from 'lucide-react';
import { ReviewSubmissionModal } from './ReviewSubmissionModal';

interface CompletedBooking {
  id: number;
  name: string;
  service: string;
  technicianName: string;
  technicianId: number;
  status: string;
  completedAt?: string;
  reviewed?: boolean;
}

interface CompletedBookingsReviewProps {
  customerId?: number;
  customerPhone?: string;
}

export const CompletedBookingsReview: React.FC<CompletedBookingsReviewProps> = ({
  customerId,
  customerPhone,
}) => {
  const [bookings, setBookings] = useState<CompletedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<CompletedBooking | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchCompletedBookings();
  }, [customerId, customerPhone]);

  const fetchCompletedBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (customerId) params.append('customerId', customerId.toString());
      if (customerPhone) params.append('customerPhone', customerPhone);

      const response = await fetch(`/api/bookings/completed?${params}`);
      if (!response.ok) throw new Error('فشل تحميل الحجوزات');
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (booking: CompletedBooking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    setSelectedBooking(null);
    fetchCompletedBookings();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full" />
        </div>
        <p className="text-gray-600 mt-2">جاري تحميل الحجوزات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <CheckCircle className="mx-auto text-gray-400 mb-2" size={32} />
        <p className="text-gray-600">لا توجد حجوزات مكتملة</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-black mb-4">الحجوزات المكتملة</h2>
        <p className="text-gray-600 mb-6">
          قيّم الفنيين الذين قاموا بخدمتك وساعدنا في تحسين الخدمة
        </p>

        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-green-500" size={20} />
                  <h3 className="text-lg font-bold text-black">{booking.service}</h3>
                </div>
                <p className="text-sm text-gray-600">الفني: {booking.technicianName}</p>
                <p className="text-sm text-gray-600">اسم العميل: {booking.name}</p>
                {booking.completedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    تم الإنجاز: {new Date(booking.completedAt).toLocaleDateString('ar-SA')}
                  </p>
                )}
              </div>

              {booking.reviewed ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                  <Star className="text-yellow-400 fill-yellow-400" size={16} />
                  <span className="text-sm font-semibold text-green-700">تم التقييم</span>
                </div>
              ) : (
                <button
                  onClick={() => handleReviewClick(booking)}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition font-semibold"
                >
                  <Star size={18} />
                  قيّم الآن
                </button>
              )}
            </div>

            {!booking.reviewed && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3">
                <MessageSquare className="text-yellow-600 flex-shrink-0" size={18} />
                <p className="text-sm text-yellow-700">
                  شارك رأيك عن الخدمة والفني لمساعدة العملاء الآخرين
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {selectedBooking && (
        <ReviewSubmissionModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedBooking(null);
          }}
          bookingId={selectedBooking.id}
          technicianId={selectedBooking.technicianId}
          technicianName={selectedBooking.technicianName}
          serviceName={selectedBooking.service}
          onSuccess={handleReviewSuccess}
        />
      )}
    </>
  );
};
