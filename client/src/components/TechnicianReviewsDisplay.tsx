import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

interface Review {
  id: number;
  title: string;
  content: string;
  rating: number;
  qualityRating?: number;
  priceRating?: number;
  serviceRating?: number;
  customerName?: string;
  createdAt: string;
  helpful: number;
  unhelpful: number;
  images?: string[];
}

interface TechnicianReviewsDisplayProps {
  technicianId: number;
  technicianName: string;
  averageRating?: number;
  totalReviews?: number;
}

export const TechnicianReviewsDisplay: React.FC<TechnicianReviewsDisplayProps> = ({
  technicianId,
  technicianName,
  averageRating = 0,
  totalReviews = 0,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'helpful'>('recent');

  useEffect(() => {
    fetchReviews();
  }, [technicianId, sortBy]);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/reviews/technician/${technicianId}?sort=${sortBy}`
      );
      if (!response.ok) throw new Error('فشل تحميل المراجعات');
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId: number) => {
    try {
      await fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' });
      fetchReviews();
    } catch (err) {
      console.error('Error marking as helpful:', err);
    }
  };

  const handleUnhelpful = async (reviewId: number) => {
    try {
      await fetch(`/api/reviews/${reviewId}/unhelpful`, { method: 'POST' });
      fetchReviews();
    } catch (err) {
      console.error('Error marking as unhelpful:', err);
    }
  };

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gradient-to-r from-yellow-50 to-white border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-black mb-2">تقييمات {technicianName}</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {renderStars(averageRating, 24)}
                <span className="text-3xl font-bold text-black">{averageRating.toFixed(1)}</span>
              </div>
              <p className="text-gray-600">
                بناءً على <span className="font-semibold text-black">{totalReviews}</span> مراجعة
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex gap-2">
        <button
          onClick={() => setSortBy('recent')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            sortBy === 'recent'
              ? 'bg-yellow-400 text-black'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          الأحدث
        </button>
        <button
          onClick={() => setSortBy('rating')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            sortBy === 'rating'
              ? 'bg-yellow-400 text-black'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          الأعلى تقييماً
        </button>
        <button
          onClick={() => setSortBy('helpful')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            sortBy === 'helpful'
              ? 'bg-yellow-400 text-black'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          الأكثر فائدة
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full" />
          </div>
          <p className="text-gray-600 mt-2">جاري تحميل المراجعات...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* No Reviews */}
      {!loading && reviews.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <MessageSquare className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-600">لا توجد مراجعات حتى الآن</p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
            {/* Review Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(review.rating)}
                  <span className="text-sm font-semibold text-gray-600">
                    {review.rating} من 5
                  </span>
                </div>
                <h4 className="text-lg font-bold text-black">{review.title}</h4>
                <p className="text-sm text-gray-600">
                  {review.customerName || 'عميل'} • {new Date(review.createdAt).toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>

            {/* Review Content */}
            <p className="text-gray-700 mb-4 leading-relaxed">{review.content}</p>

            {/* Detailed Ratings */}
            {(review.qualityRating || review.priceRating || review.serviceRating) && (
              <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                {review.qualityRating && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">جودة العمل</p>
                    <div className="flex gap-1">
                      {renderStars(review.qualityRating, 12)}
                    </div>
                  </div>
                )}
                {review.priceRating && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">السعر</p>
                    <div className="flex gap-1">
                      {renderStars(review.priceRating, 12)}
                    </div>
                  </div>
                )}
                {review.serviceRating && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">الخدمة</p>
                    <div className="flex gap-1">
                      {renderStars(review.serviceRating, 12)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg hover:opacity-80 transition cursor-pointer"
                  />
                ))}
              </div>
            )}

            {/* Review Footer - Helpful/Unhelpful */}
            <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
              <button
                onClick={() => handleHelpful(review.id)}
                className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition"
              >
                <ThumbsUp size={18} />
                <span className="text-sm">{review.helpful}</span>
              </button>
              <button
                onClick={() => handleUnhelpful(review.id)}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition"
              >
                <ThumbsDown size={18} />
                <span className="text-sm">{review.unhelpful}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
