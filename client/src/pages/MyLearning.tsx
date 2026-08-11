import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Play,
  CheckCircle2,
  Calendar,
  Target,
} from "lucide-react";

export default function MyLearning() {
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  // بيانات تجريبية
  const stats = [
    { icon: BookOpen, label: "دورات نشطة", value: "3" },
    { icon: CheckCircle2, label: "دورات مكتملة", value: "2" },
    { icon: Award, label: "شهادات", value: "2" },
    { icon: Clock, label: "ساعات التعلم", value: "45" },
  ];

  const activeCourses = [
    {
      id: 1,
      slug: "battery-maintenance",
      title: "تدريب صيانة البطاريات",
      thumbnail: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80",
      progress: 60,
      completedLessons: 7,
      totalLessons: 12,
      lastAccessed: "منذ يومين",
      nextLesson: "الصيانة الدورية",
    },
    {
      id: 2,
      slug: "alternator-starter",
      title: "تدريب السلف والدينمو",
      thumbnail: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
      progress: 35,
      completedLessons: 6,
      totalLessons: 18,
      lastAccessed: "منذ أسبوع",
      nextLesson: "إصلاح الدينمو",
    },
    {
      id: 3,
      slug: "ecu-diagnostics",
      title: "تشخيص ECU المتقدم",
      thumbnail: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
      progress: 15,
      completedLessons: 4,
      totalLessons: 24,
      lastAccessed: "منذ 3 أيام",
      nextLesson: "قراءة أكواد الأعطال",
    },
  ];

  const completedCourses = [
    {
      id: 4,
      slug: "basic-maintenance",
      title: "الصيانة الأساسية للسيارات",
      thumbnail: "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800&q=80",
      completedDate: "2024-12-15",
      certificateId: "CERT-2024-001",
      rating: 5,
    },
    {
      id: 5,
      slug: "electrical-systems",
      title: "أنظمة الكهرباء في السيارات",
      thumbnail: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
      completedDate: "2024-11-20",
      certificateId: "CERT-2024-002",
      rating: 4,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-yellow-50 via-white to-gray-50">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">رحلتي التعليمية</h1>
            <p className="text-xl text-gray-600">
              تتبع تقدمك واستمر في تطوير مهاراتك
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <stat.icon className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8 border-b bg-white sticky top-20 z-10 shadow-sm">
        <div className="container">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === "active"
                  ? "bg-yellow-400 text-black"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              الدورات النشطة ({activeCourses.length})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === "completed"
                  ? "bg-yellow-400 text-black"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              الدورات المكتملة ({completedCourses.length})
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container">
          {activeTab === "active" ? (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">دوراتي النشطة</h2>
                <Link href="/courses">
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
                    تصفح المزيد من الدورات
                  </Button>
                </Link>
              </div>

              {activeCourses.length === 0 ? (
                <Card className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    لم تسجل في أي دورة بعد
                  </h3>
                  <p className="text-gray-600 mb-6">ابدأ رحلتك التعليمية الآن</p>
                  <Link href="/courses">
                    <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
                      استكشف الدورات
                    </Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {activeCourses.map((course) => (
                    <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-all">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center justify-between text-white text-sm mb-2">
                            <span>{course.progress}% مكتمل</span>
                            <span>
                              {course.completedLessons}/{course.totalLessons} دروس
                            </span>
                          </div>
                          <div className="w-full bg-white/30 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                          {course.title}
                        </h3>

                        <div className="space-y-2 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            <span>الدرس التالي: {course.nextLesson}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>آخر دخول: {course.lastAccessed}</span>
                          </div>
                        </div>

                        <Link href={`/courses/${course.slug}/learn`}>
                          <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
                            <Play className="w-4 h-4 ml-2" />
                            متابعة التعلم
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">الدورات المكتملة</h2>

              {completedCourses.length === 0 ? (
                <Card className="p-12 text-center">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    لم تكمل أي دورة بعد
                  </h3>
                  <p className="text-gray-600">استمر في التعلم لتحصل على شهاداتك الأولى</p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {completedCourses.map((course) => (
                    <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-all">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          مكتمل
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                          {course.title}
                        </h3>

                        <div className="space-y-2 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>تاريخ الإتمام: {course.completedDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            <span>رقم الشهادة: {course.certificateId}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/certificates/${course.certificateId}`} className="flex-1">
                            <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
                              <Award className="w-4 h-4 ml-2" />
                              عرض الشهادة
                            </Button>
                          </Link>
                          <Link href={`/courses/${course.slug}`}>
                            <Button variant="outline" size="icon">
                              <TrendingUp className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
