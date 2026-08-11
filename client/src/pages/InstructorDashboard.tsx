import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Plus,
  BarChart3,
  FileText,
  Settings,
} from "lucide-react";

export default function InstructorDashboard() {
  // بيانات تجريبية
  const stats = [
    { icon: BookOpen, label: "دوراتي", value: "4", change: "+2 هذا الشهر", color: "bg-blue-500" },
    { icon: Users, label: "المتدربين", value: "325", change: "+45 هذا الأسبوع", color: "bg-green-500" },
    { icon: Award, label: "الشهادات الصادرة", value: "287", change: "+12 اليوم", color: "bg-yellow-500" },
    { icon: TrendingUp, label: "التقييم", value: "4.9", change: "من 5.0", color: "bg-purple-500" },
  ];

  const recentCourses = [
    {
      id: 1,
      title: "تدريب صيانة البطاريات",
      students: 150,
      lessons: 12,
      status: "published",
      lastUpdated: "منذ يومين",
    },
    {
      id: 2,
      title: "تشخيص أعطال المحرك",
      students: 70,
      lessons: 22,
      status: "published",
      lastUpdated: "منذ أسبوع",
    },
    {
      id: 3,
      title: "أنظمة الكهرباء المتقدمة",
      students: 0,
      lessons: 8,
      status: "draft",
      lastUpdated: "منذ 3 أيام",
    },
  ];

  const recentStudents = [
    { name: "أحمد محمد", course: "تدريب البطاريات", progress: 85, joinedDate: "2024-12-01" },
    { name: "خالد السعيد", course: "تشخيص المحرك", progress: 45, joinedDate: "2024-12-15" },
    { name: "محمد الأحمدي", course: "تدريب البطاريات", progress: 92, joinedDate: "2024-11-28" },
    { name: "عبدالله القحطاني", course: "تشخيص المحرك", progress: 30, joinedDate: "2024-12-20" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-yellow-50 via-white to-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">لوحة تحكم المدرب</h1>
              <p className="text-xl text-gray-600">
                مرحباً م. أحمد السعيد - إدارة دوراتك ومتابعة متدربيك
              </p>
            </div>
            <Link href="/instructor/courses/new">
              <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
                <Plus className="w-5 h-5 ml-2" />
                إضافة دورة جديدة
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
                <div className="text-xs text-green-600 font-medium">{stat.change}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 border-b bg-white">
        <div className="container">
          <div className="flex flex-wrap gap-4">
            <Link href="/instructor/courses">
              <Button variant="outline" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                إدارة الدورات
              </Button>
            </Link>
            <Link href="/instructor/students">
              <Button variant="outline" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                متابعة المتدربين
              </Button>
            </Link>
            <Link href="/instructor/certificates">
              <Button variant="outline" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                إصدار الشهادات
              </Button>
            </Link>
            <Link href="/instructor/analytics">
              <Button variant="outline" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                الإحصائيات
              </Button>
            </Link>
            <Link href="/instructor/settings">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                الإعدادات
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Courses */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900">دوراتي الأخيرة</h2>
                <Link href="/instructor/courses">
                  <Button variant="outline">عرض الكل</Button>
                </Link>
              </div>

              <div className="space-y-4">
                {recentCourses.map((course) => (
                  <Card key={course.id} className="p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              course.status === "published"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {course.status === "published" ? "منشور" : "مسودة"}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{course.students} متدرب</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>{course.lessons} درس</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>آخر تحديث: {course.lastUpdated}</span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/instructor/courses/${course.id}/edit`}>
                        <Button variant="outline" size="sm">
                          تعديل
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Students */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">المتدربين الجدد</h2>
                <Link href="/instructor/students">
                  <Button variant="outline" size="sm">
                    عرض الكل
                  </Button>
                </Link>
              </div>

              <Card className="p-6">
                <div className="space-y-4">
                  {recentStudents.map((student, index) => (
                    <div key={index} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900">{student.name}</h4>
                          <p className="text-sm text-gray-600">{student.course}</p>
                        </div>
                        <span className="text-xs text-gray-500">{student.joinedDate}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">التقدم</span>
                          <span className="font-semibold text-gray-900">{student.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Quick Stats */}
              <Card className="p-6 mt-6 bg-gradient-to-br from-yellow-50 to-white">
                <h3 className="font-bold text-gray-900 mb-4">إحصائيات سريعة</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">معدل الإكمال</span>
                    <span className="font-bold text-gray-900">78%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">متوسط التقييم</span>
                    <span className="font-bold text-gray-900">4.9 ⭐</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">وقت المشاهدة</span>
                    <span className="font-bold text-gray-900">1,240 ساعة</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">معدل النجاح</span>
                    <span className="font-bold text-gray-900">95%</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
