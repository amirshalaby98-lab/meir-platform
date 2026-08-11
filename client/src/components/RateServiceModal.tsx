import { useState } from "react";

interface RateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  technicianName?: string;
  bookingId?: string;
}

export default function RateServiceModal({ isOpen, onClose, technicianName = "الفني", bookingId }: RateServiceModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Save rating (can be connected to API later)
    console.log({ rating, comment, bookingId });
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setRating(0);
      setComment("");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {submitted ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">شكراً لتقييمك!</h3>
            <p className="text-gray-600">تقييمك يساعدنا على تحسين خدماتنا</p>
          </div>
        ) : (
          <>
            <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 text-xl">×</button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-3xl">👨‍🔧</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">قيّم الخدمة</h3>
              <p className="text-gray-500 text-sm mt-1">كيف كانت تجربتك مع {technicianName}؟</p>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6" dir="ltr">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-3xl transition-transform hover:scale-125"
                >
                  {star <= (hoveredRating || rating) ? "⭐" : "☆"}
                </button>
              ))}
            </div>

            {rating > 0 && (
              <p className="text-center text-sm text-gray-500 mb-4">
                {rating === 5 && "ممتاز! 🎉"}
                {rating === 4 && "جيد جداً 👍"}
                {rating === 3 && "جيد 🙂"}
                {rating === 2 && "مقبول 😐"}
                {rating === 1 && "ضعيف 😞"}
              </p>
            )}

            {/* Comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="أضف تعليقك (اختياري)..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-24 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
              dir="rtl"
            />

            <button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="w-full mt-4 bg-yellow-400 text-black font-bold py-3 rounded-xl hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إرسال التقييم
            </button>
          </>
        )}
      </div>
    </div>
  );
}
