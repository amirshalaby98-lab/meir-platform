import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function AddReview() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    rating: 5,
    comment: "",
    service: "",
    location: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const createReview = trpc.review.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("شكراً لتقييمك! سيتم مراجعته ونشره قريباً");

      // Reset form
      setFormData({
        name: "",
        rating: 5,
        comment: "",
        service: "",
        location: "",
      });

      // Redirect to home after 3 seconds
      setTimeout(() => {
        setLocation("/");
      }, 3000);
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const services = [
    { id: "battery", name: "🔋 بطارية" },
    { id: "starter", name: "⚡ سلف" },
    { id: "alternator", name: "🔌 دينمو" },
    { id: "ecu", name: "🧠 تشخيص ECU" },
    { id: "fuel-pump", name: "⛽ طرمبة بنزين" },
    { id: "roadside", name: "🛠️ أعطال الطريق" },
  ];

  const locations = [
    { id: "makkah", name: "مكة المكرمة" },
    { id: "jeddah", name: "جدة" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.comment || !formData.service || !formData.location) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    createReview.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-20">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-black mb-4">
            شارك تجربتك معنا
          </h1>
          <p className="text-center text-gray-600 mb-12">
            رأيك يهمنا! ساعدنا في تحسين خدماتنا من خلال مشاركة تقييمك
          </p>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الاسم
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="اسمك الكامل"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                  disabled={createReview.isPending}
                  required
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  التقييم
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, rating }))}
                      className="focus:outline-none"
                      disabled={createReview.isPending}
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          rating <= formData.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="mr-2 text-lg font-bold text-gray-700">
                    {formData.rating}/5
                  </span>
                </div>
              </div>

              {/* Service */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الخدمة
                </label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                  disabled={createReview.isPending}
                  required
                >
                  <option value="">اختر الخدمة</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.name}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الموقع
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all"
                  disabled={createReview.isPending}
                  required
                >
                  <option value="">اختر الموقع</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.name}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  تعليقك
                </label>
                <textarea
                  name="comment"
                  placeholder="شاركنا تجربتك مع خدماتنا..."
                  value={formData.comment}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all resize-none"
                  disabled={createReview.isPending}
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={createReview.isPending || submitted}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 rounded-lg transition-colors text-lg"
              >
                {createReview.isPending ? (
                  "جاري الإرسال..."
                ) : submitted ? (
                  <>
                    <CheckCircle className="w-5 h-5 ml-2 inline" />
                    تم إرسال التقييم!
                  </>
                ) : (
                  "إرسال التقييم"
                )}
              </Button>
            </form>

            {submitted && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-center">
                  شكراً لك! سيتم مراجعة تقييمك ونشره قريباً
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
