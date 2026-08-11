import React, { useState } from "react";
import { X, Send, DollarSign, Clock, Wrench, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

export interface PriceQuote {
  id?: string;
  bookingId: number;
  laborCost: number;
  laborHours: number;
  partsCost: number;
  partsDescription: string;
  additionalCost?: number;
  additionalDescription?: string;
  discount?: number;
  discountReason?: string;
  totalCost: number;
  notes?: string;
  validUntil: Date;
  status?: "pending" | "accepted" | "rejected" | "expired";
}

interface PriceQuoteModalProps {
  isOpen: boolean;
  bookingId: number;
  customerName?: string;
  onClose: () => void;
  onSubmit: (quote: PriceQuote) => Promise<void>;
  isLoading?: boolean;
}

export function PriceQuoteModal({
  isOpen,
  bookingId,
  customerName = "العميل",
  onClose,
  onSubmit,
  isLoading = false,
}: PriceQuoteModalProps) {
  const [laborHours, setLaborHours] = useState(1);
  const [laborCost, setLaborCost] = useState(150); // Default hourly rate
  const [partsCost, setPartsCost] = useState(0);
  const [partsDescription, setPartsDescription] = useState("");
  const [additionalCost, setAdditionalCost] = useState(0);
  const [additionalDescription, setAdditionalDescription] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountReason, setDiscountReason] = useState("");
  const [notes, setNotes] = useState("");
  const [validDays, setValidDays] = useState(7);
  const [error, setError] = useState("");

  const totalLaborCost = laborHours * laborCost;
  const totalCost = totalLaborCost + partsCost + additionalCost - discount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (totalCost <= 0) {
      setError("يجب أن يكون إجمالي السعر أكبر من صفر");
      return;
    }

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    const quote: PriceQuote = {
      bookingId,
      laborCost,
      laborHours,
      partsCost,
      partsDescription,
      additionalCost: additionalCost || undefined,
      additionalDescription: additionalDescription || undefined,
      discount: discount || undefined,
      discountReason: discountReason || undefined,
      totalCost,
      notes: notes || undefined,
      validUntil,
    };

    try {
      await onSubmit(quote);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ في إرسال العرض");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            إرسال عرض سعر إلى {customerName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Labor Cost Section */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">تكلفة العمل</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد الساعات
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={laborHours}
                  onChange={(e) => setLaborHours(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر بالساعة (ر.س)
                </label>
                <input
                  type="number"
                  min="0"
                  value={laborCost}
                  onChange={(e) => setLaborCost(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-white rounded p-3 text-right">
              <p className="text-sm text-gray-600">إجمالي تكلفة العمل:</p>
              <p className="text-lg font-bold text-blue-600">
                {totalLaborCost.toFixed(2)} ر.س
              </p>
            </div>
          </div>

          {/* Parts Cost Section */}
          <div className="bg-green-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">تكلفة القطع</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف القطع المستخدمة
              </label>
              <textarea
                value={partsDescription}
                onChange={(e) => setPartsDescription(e.target.value)}
                placeholder="مثال: بطارية أصلية، مرشح هواء..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                إجمالي تكلفة القطع (ر.س)
              </label>
              <input
                type="number"
                min="0"
                value={partsCost}
                onChange={(e) => setPartsCost(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Additional Costs */}
          <div className="bg-orange-50 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">تكاليف إضافية (اختياري)</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف
              </label>
              <input
                type="text"
                value={additionalDescription}
                onChange={(e) => setAdditionalDescription(e.target.value)}
                placeholder="مثال: رسوم التوصيل، تكاليف إضافية..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المبلغ (ر.س)
              </label>
              <input
                type="number"
                min="0"
                value={additionalCost}
                onChange={(e) => setAdditionalCost(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Discount Section */}
          <div className="bg-purple-50 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">خصم (اختياري)</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مبلغ الخصم (ر.س)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سبب الخصم
                </label>
                <input
                  type="text"
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  placeholder="مثال: عرض خاص..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notes and Validity */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات إضافية
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أضف أي ملاحظات أو شروط إضافية..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صلاحية العرض (أيام)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={validDays}
                onChange={(e) => setValidDays(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Total Summary */}
          <div className="bg-gray-900 text-white rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>تكلفة العمل:</span>
              <span>{totalLaborCost.toFixed(2)} ر.س</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>تكلفة القطع:</span>
              <span>{partsCost.toFixed(2)} ر.س</span>
            </div>
            {additionalCost > 0 && (
              <div className="flex justify-between text-sm">
                <span>تكاليف إضافية:</span>
                <span>{additionalCost.toFixed(2)} ر.س</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-400">
                <span>خصم:</span>
                <span>-{discount.toFixed(2)} ر.س</span>
              </div>
            )}
            <div className="border-t border-gray-700 pt-2 flex justify-between font-bold text-lg">
              <span>الإجمالي:</span>
              <span className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                {totalCost.toFixed(2)} ر.س
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              <Send className="w-4 h-4" />
              {isLoading ? "جاري الإرسال..." : "إرسال العرض"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PriceQuoteModal;
