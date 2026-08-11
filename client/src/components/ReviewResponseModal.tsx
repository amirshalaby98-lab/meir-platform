import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface ReviewResponseModalProps {
  isOpen: boolean;
  reviewId: number;
  customerName: string;
  reviewContent: string;
  onClose: () => void;
  onSubmit: (response: string) => Promise<void>;
}

/**
 * Review Response Modal Component
 * نموذج الرد على المراجعات
 */
export const ReviewResponseModal: React.FC<ReviewResponseModalProps> = ({
  isOpen,
  reviewId,
  customerName,
  reviewContent,
  onClose,
  onSubmit,
}) => {
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!response.trim()) {
      setError('يرجى إدخال رد على المراجعة');
      return;
    }

    if (response.length < 10) {
      setError('يجب أن يكون الرد على الأقل 10 أحرف');
      return;
    }

    if (response.length > 1000) {
      setError('يجب أن لا يتجاوز الرد 1000 حرف');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(response);
      setSuccess(true);
      setResponse('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ ما');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            الرد على المراجعة
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Original Review */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              المراجعة الأصلية من {customerName}
            </p>
            <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
              {reviewContent}
            </p>
          </div>

          {/* Response Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">
                  تم إرسال الرد بنجاح!
                </p>
              </div>
            )}

            {/* Response Textarea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ردك على المراجعة
              </label>
              <Tooltip
                content="اكتب ردك بشكل احترافي وودي. تجنب الرسائل الدفاعية أو العدائية."
                position="top"
                trigger="hover"
              >
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="شكراً على ملاحظاتك... أنا أقدر رأيك..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 resize-none"
                  rows={6}
                  disabled={isSubmitting}
                />
              </Tooltip>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {response.length}/1000 حرف
                </span>
                {response.length > 0 && (
                  <span
                    className={`${
                      response.length >= 10
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-orange-600 dark:text-orange-400'
                    }`}
                  >
                    {response.length < 10
                      ? `${10 - response.length} أحرف متبقية`
                      : '✓ جاهز للإرسال'}
                  </span>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                نصائح لرد فعال:
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• شكر العميل على ملاحظاته</li>
                <li>• اعتذر عن أي مشاكل واجهها</li>
                <li>• اشرح الخطوات التي ستتخذها لتحسين الخدمة</li>
                <li>• كن احترافياً وودياً في نبرتك</li>
              </ul>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || response.length < 10}
            className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                إرسال الرد
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Review Response List Component
 * قائمة الردود على المراجعات
 */
export const ReviewResponseList: React.FC<{
  responses: Array<{
    id: number;
    content: string;
    createdAt: string;
    updatedAt?: string;
  }>;
  isLoading?: boolean;
}> = ({ responses, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="text-center py-6 text-gray-600 dark:text-gray-400">
        لا توجد ردود حتى الآن
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {responses.map((response) => (
        <div
          key={response.id}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
        >
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
              ردك على المراجعة
            </p>
            <span className="text-xs text-yellow-700 dark:text-yellow-300">
              {new Date(response.createdAt).toLocaleDateString('ar-SA')}
            </span>
          </div>
          <p className="text-gray-900 dark:text-gray-100 text-sm leading-relaxed">
            {response.content}
          </p>
          {response.updatedAt && response.updatedAt !== response.createdAt && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              تم التحديث: {new Date(response.updatedAt).toLocaleDateString('ar-SA')}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
