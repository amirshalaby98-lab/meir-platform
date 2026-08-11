import { useState } from "react";
import { useRoute } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import {
  Clock,
  Users,
  Star,
  BookOpen,
  Award,
  CheckCircle2,
  Play,
  FileText,
  Download,
  ArrowRight,
} from "lucide-react";

export default function CourseDetail() {
  const [, params] = useRoute("/courses/:slug");
  const slug = params?.slug;

  // بيانات تجريبية للدورة
  const course = {
    id: 1,
    slug: "battery-maintenance",
    title: "تدريب صيانة البطاريات",
    description:
      "دورة شاملة تغطي كل ما تحتاج لمعرفته عن بطاريات السيارات من الألف إلى الياء. ستتعلم كيفية تشخيص المشاكل، إجراء الصيانة الدورية، واستبدال البطاريات بشكل احترافي.",
    thumbnail: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&q=80",
    level: "beginner",
    levelText: "مبتدئ",
    category: "بطارية",
    duration: "أسبوعان",
    totalLessons: 12,
    totalDuration: 360,
    instructor: "م. أحمد السعيد",
    instructorBio: "مهندس ميكانيكا سيارات مع خبرة 15 عاماً في التدريب والصيانة",
    price: 500,
    enrolledCount: 150,
    rating: 4.9,
    published: true,
    whatYouWillLearn: [
      "أنواع البطاريات المختلفة وخصائصها",
      "كيفية فحص وتشخيص أعطال البطارية",
      "طرق الشحن الصحيحة والآمنة",
      "الصيانة الدورية للبطاريات",
      "معايير السلامة المهنية",
      "استبدال البطاريات بشكل احترافي",
      "التعامل مع البطاريات التالفة",
      "استخدام أدوات الفحص المتخصصة",
    ],
    requirements: [
      "لا يوجد متطلبات مسبقة",
      "الرغبة في التعلم والتطوير",
      "القدرة على العمل بشكل عملي",
    ],
    lessons: [
      {
        id: 1,
        title: "مقدمة عن بطاريات السيارات",
        duration: 30,
        type: "video",
        free: true,
      },
      {
        id: 2,
        title: "أنواع البطاريات",
        duration: 45,
        type: "video",
        free: false,
      },
      {
        id: 3,
        title: "أدوات الفحص والتشخيص",
        duration: 40,
        type: "video",
        free: false,
      },
      {
        id: 4,
        title: "كيفية فحص البطارية",
        duration: 35,
        type: "video",
        free: false,
      },
      {
        id: 5,
        title: "الشحن الصحيح للبطارية",
        duration: 30,
        type: "video",
        free: false,
      },
      {
        id: 6,
        title: "الصيانة الدورية",
        duration: 25,
        type: "video",
        free: false,
      },
      {
        id: 7,
        title: "استبدال البطارية",
        duration: 35,
        type: "video",
        free: false,
      },
      {
        id: 8,
        title: "السلامة المهنية",
        duration: 20,
        type: "video",
        free: false,
      },
      {
        id: 9,
        title: "التعامل مع البطاريات التالفة",
        duration: 30,
        type: "video",
        free: false,
      },
      {
        id: 10,
        title: "حالات عملية - الجزء الأول",
        duration: 40,
        type: "video",
        free: false,
      },
      {
        id: 11,
        title: "حالات عملية - الجزء الثاني",
        duration: 40,
        type: "video",
        free: false,
      },
      {
        id: 12,
        title: "الاختبار النهائي",
        duration: 30,
        type: "quiz",
        free: false,
      },
    ],
  };

  const [enrolled, setEnrolled] = useState(false);

  const handleEnroll = () => {
    // TODO: Implement enrollment logic
    setEnrolled(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-yellow-400/20 px-4 py-2 rounded-full mb-4">
                <span className="text-sm font-semibold text-yellow-400">{course.category}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-gray-300 mb-6">{course.description}</p>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{course.rating}</span>
                  <span className="text-gray-400">({course.enrolledCount} متدرب)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <BookOpen className="w-5 h-5" />
                  <span>{course.totalLessons} درس</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <span className="text-3xl font-bold text-yellow-400">{course.price} ر.س</span>
                <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                  {course.levelText}
                </span>
              </div>

              {enrolled ? (
                <Link href={`/courses/${course.slug}/learn`}>
                  <Button
                    size="lg"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg"
                  >
                    <Play className="w-5 h-5 ml-2" />
                    ابدأ التعلم الآن
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={handleEnroll}
                  size="lg"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg"
                >
                  سجل في الدورة
                </Button>
              )}
            </div>

            <div className="relative">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
                <Button
                  size="lg"
                  className="bg-white/90 hover:bg-white text-black rounded-full w-20 h-20"
                >
                  <Play className="w-8 h-8" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-16">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* What You'll Learn */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">ماذا ستتعلم؟</h2>
                <Card className="p-8">
                  <div className="grid md:grid-cols-2 gap-4">
                    {course.whatYouWillLearn.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Course Content */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">محتوى الدورة</h2>
                <Card className="p-6">
                  <div className="space-y-2">
                    {course.lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                            {lesson.free && (
                              <span className="text-xs text-green-600 font-medium">
                                معاينة مجانية
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">{lesson.duration} دقيقة</span>
                          {lesson.type === "video" ? (
                            <Play className="w-5 h-5 text-gray-400" />
                          ) : (
                            <FileText className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Requirements */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">المتطلبات</h2>
                <Card className="p-8">
                  <ul className="space-y-3">
                    {course.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <ArrowRight className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Instructor */}
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">المدرب</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{course.instructor}</h4>
                    <p className="text-sm text-gray-600">{course.instructorBio}</p>
                  </div>
                </div>
              </Card>

              {/* Course Includes */}
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">تتضمن الدورة</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Play className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-700">{course.totalDuration} دقيقة فيديو</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-700">{course.totalLessons} درس تفاعلي</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-700">مواد تعليمية قابلة للتحميل</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-700">شهادة إتمام من الجهة التدريبية</span>
                  </div>
                </div>
              </Card>

              {/* Legal Disclaimer */}
              <Card className="p-5 bg-yellow-50 border-2 border-yellow-200">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-black text-xs font-bold">!</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1 text-sm">إخلاء مسؤولية</h4>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      منصة مير تعمل كوسيط تقني فقط. إرسال الطلب لا يعني القبول النهائي ويخضع للمراجعة. الشهادة صادرة من الجهة التدريبية الشريكة.
                    </p>
                  </div>
                </div>
              </Card>

              {/* CTA */}
              {!enrolled && (
                <Card className="p-6 bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">ابدأ رحلتك التعليمية</h3>
                  <p className="text-gray-600 mb-4">سجل الآن واحصل على وصول كامل للدورة</p>
                  <Button
                    onClick={handleEnroll}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                  >
                    سجل الآن - {course.price} ر.س
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
