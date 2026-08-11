import React from "react";
import { Check, X, Clock, DollarSign } from "lucide-react";
import { Button } from "./ui/button";

export interface QuoteMessageData {
  id: string;
  senderName: string;
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
  validUntil: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  createdAt: string;
}

interface QuoteMessageProps {
  quote: QuoteMessageData;
  isOwn: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  isLoading?: boolean;
}

export function QuoteMessage({
  quote,
  isOwn,
  onAccept,
  onReject,
  isLoading = false,
}: QuoteMessageProps) {
  const validDate = new Date(quote.validUntil);
  const now = new Date();
  const isExpired = validDate < now;
  const daysLeft = Math.ceil(
    (validDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const statusColors = {
    pending: "border-yellow-200 bg-yellow-50",
    accepted: "border-green-200 bg-green-50",
    rejected: "border-red-200 bg-red-50",
    expired: "border-gray-200 bg-gray-50",
  };

  const statusLabels = {
    pending: "قيد الانتظار",
    accepted: "مقبول",
    rejected: "مرفوض",
    expired: "منتهي الصلاحية",
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4 text-yellow-600" />,
    accepted: <Check className="w-4 h-4 text-green-600" />,
    rejected: <X className="w-4 h-4 text-red-600" />,
    expired: <Clock className="w-4 h-4 text-gray-600" />,
  };

  return (
    <div
      className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-md border-2 rounded-lg p-4 ${statusColors[quote.status]}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b">
          <div>
            <p className="font-semibold text-gray-900">{quote.senderName}</p>
            <p className="text-xs text-gray-600">
              {new Date(quote.createdAt).toLocaleString("ar-SA")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {statusIcons[quote.status]}
            <span className="text-xs font-semibold text-gray-700">
              {statusLabels[quote.status]}
            </span>
          </div>
        </div>

        {/* Labor Cost */}
        <div className="mb-3 pb-3 border-b">
          <p className="text-sm font-semibold text-gray-900 mb-2">تكلفة العمل</p>
          <div className="flex justify-between text-sm text-gray-700">
            <span>{quote.laborHours} ساعة × {quote.laborCost} ر.س</span>
            <span className="font-semibold">{(quote.laborHours * quote.laborCost).toFixed(2)} ر.س</span>
          </div>
        </div>

        {/* Parts Cost */}
        {quote.partsCost > 0 && (
          <div className="mb-3 pb-3 border-b">
            <p className="text-sm font-semibold text-gray-900 mb-2">تكلفة القطع</p>
            <p className="text-xs text-gray-600 mb-1">{quote.partsDescription}</p>
            <div className="flex justify-between text-sm text-gray-700">
              <span>القطع</span>
              <span className="font-semibold">{quote.partsCost.toFixed(2)} ر.س</span>
            </div>
          </div>
        )}

        {/* Additional Costs */}
        {quote.additionalCost && quote.additionalCost > 0 && (
          <div className="mb-3 pb-3 border-b">
            <p className="text-sm font-semibold text-gray-900 mb-2">تكاليف إضافية</p>
            <p className="text-xs text-gray-600 mb-1">{quote.additionalDescription}</p>
            <div className="flex justify-between text-sm text-gray-700">
              <span>إضافي</span>
              <span className="font-semibold">{quote.additionalCost.toFixed(2)} ر.س</span>
            </div>
          </div>
        )}

        {/* Discount */}
        {quote.discount && quote.discount > 0 && (
          <div className="mb-3 pb-3 border-b">
            <p className="text-sm font-semibold text-gray-900 mb-2">خصم</p>
            {quote.discountReason && (
              <p className="text-xs text-gray-600 mb-1">{quote.discountReason}</p>
            )}
            <div className="flex justify-between text-sm text-green-700">
              <span>خصم</span>
              <span className="font-semibold">-{quote.discount.toFixed(2)} ر.س</span>
            </div>
          </div>
        )}

        {/* Notes */}
        {quote.notes && (
          <div className="mb-3 pb-3 border-b">
            <p className="text-sm font-semibold text-gray-900 mb-2">ملاحظات</p>
            <p className="text-xs text-gray-700">{quote.notes}</p>
          </div>
        )}

        {/* Total */}
        <div className="mb-4 p-3 bg-gray-900 text-white rounded flex items-center justify-between">
          <span className="font-semibold">الإجمالي</span>
          <span className="flex items-center gap-2 text-lg font-bold">
            <DollarSign className="w-4 h-4" />
            {quote.totalCost.toFixed(2)} ر.س
          </span>
        </div>

        {/* Validity Info */}
        <div className="mb-4 p-2 bg-white bg-opacity-50 rounded text-xs text-gray-700">
          {isExpired ? (
            <p className="text-red-600 font-semibold">انتهت صلاحية العرض</p>
          ) : (
            <p>
              صلاحية العرض: {daysLeft} أيام
              <br />
              {validDate.toLocaleDateString("ar-SA")}
            </p>
          )}
        </div>

        {/* Actions */}
        {!isOwn && quote.status === "pending" && !isExpired && (
          <div className="flex gap-2">
            <Button
              onClick={onAccept}
              disabled={isLoading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              قبول
            </Button>
            <Button
              onClick={onReject}
              disabled={isLoading}
              variant="outline"
              className="flex-1 text-red-600 border-red-300 hover:bg-red-50 font-semibold py-2 flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              رفض
            </Button>
          </div>
        )}

        {/* Status Badge for Accepted/Rejected */}
        {quote.status === "accepted" && (
          <div className="p-2 bg-green-100 rounded text-center">
            <p className="text-sm font-semibold text-green-800">✓ تم قبول العرض</p>
          </div>
        )}

        {quote.status === "rejected" && (
          <div className="p-2 bg-red-100 rounded text-center">
            <p className="text-sm font-semibold text-red-800">✗ تم رفض العرض</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuoteMessage;
