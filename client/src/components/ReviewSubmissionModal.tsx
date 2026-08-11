import React, { useState } from 'react';
import { Star, X, Upload, AlertCircle } from 'lucide-react';

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  technicianId: number;
  technicianName: string;
  serviceName: string;
  onSuccess?: () => void;
}

export const ReviewSubmissionModal: React.FC<ReviewSubmissionModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  technicianId,
  technicianName,
  serviceName,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [priceRating, setPriceRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReview = async () => {
    if (!title.trim() || !content.trim()) {
      setError('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    if (content.length < 10) {
      setError('يجب أن تكون المراجعة على الأقل 10 أحرف');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          vendorId: technicianId,
          title,
          content,
          rating,
          qualityRating,
          priceRating,
          serviceRating,
          images,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل تقديم المراجعة');
      }

      onSuccess?.();
      onClose();
      // Reset form
      setTitle('');
      setContent('');
      setRating(5);
      setQualityRating(5);
      setPriceRating(5);
      setServiceRating(5);
      setImages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ ما');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-black">تقييم الخدمة</h2>
            <p className="text-sm text-gray-800">قيّم الفني {technicianName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-yellow-600 rounded-lg transition"
          >
            <X size={24} className="text-black" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Service Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">الخدمة: <span className="font-semibold text-black">{serviceName}</span></p>
            <p className="text-sm text-gray-600">الفني: <span className="font-semibold text-black">{technicianName}</span></p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-semibold text-black mb-3">
              التقييم العام <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">{rating} من 5 نجوم</p>
          </div>

          {/* Detailed Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Quality Rating */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                جودة العمل
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setQualityRating(star)}
                    className="transition"
                  >
                    <Star
                      size={20}
                      className={`${
                        star <= qualityRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Price Rating */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                السعر
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setPriceRating(star)}
                    className="transition"
                  >
                    <Star
                      size={20}
                      className={`${
                        star <= priceRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Service Rating */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                الخدمة
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setServiceRating(star)}
                    className="transition"
                  >
                    <Star
                      size={20}
                      className={`${
                        star <= serviceRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              عنوان المراجعة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: خدمة ممتازة وسريعة"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              تفاصيل المراجعة <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="شارك تجربتك مع الخدمة والفني..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              rows={5}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">{content.length}/1000</p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              إضافة صور (اختياري)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-yellow-400 transition cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                <p className="text-sm text-gray-600">اضغط لإضافة صور</p>
              </label>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-50 transition font-semibold"
              disabled={isSubmitting}
            >
              إلغاء
            </button>
            <button
              onClick={submitReview}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال المراجعة'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
