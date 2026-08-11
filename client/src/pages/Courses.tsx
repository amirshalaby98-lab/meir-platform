import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import {
  GraduationCap,
  Clock,
  Users,
  Star,
  Search,
  Filter,
  BookOpen,
  Award,
  TrendingUp,
} from "lucide-react";

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // بيانات تجريبية للدورات
  const courses = [
    {
      id: 1,
      slug: "battery-maintenance",
      title: "تدريب صيانة البطاريات",
      description: "تعلم كل شيء عن تشخيص وصيانة واستبدال بطاريات السيارات",
      thumbnail: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80",
      level: "beginner",
      levelText: "مبتدئ",
      category: "بطارية",
      duration: "أسبوعان",
      totalLessons: 12,
      totalDuration: 360,
      instructor: "م. أحمد السعيد",
      price: 500,
      enrolledCount: 150,
      rating: 4.9,
    },
    {
      id: 2,
      slug: "alternator-starter",
      title: "تدريب السلف والدينمو",
      description: "إصلاح وصيانة أنظمة الشحن والتشغيل بشكل احترافي",
      thumbnail: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
      level: "intermediate",
      levelText: "متوسط",
      category: "سلف ودينمو",
      duration: "3 أسابيع",
      totalLessons: 18,
      totalDuration: 540,
      instructor: "م. خالد محمد",
      price: 750,
      enrolledCount: 120,
      rating: 4.8,
    },
    {
      id: 3,
      slug: "ecu-diagnostics",
      title: "تشخيص ECU المتقدم",
      description: "تشخيص الأعطال الإلكترونية المعقدة باستخدام أجهزة OBD",
      thumbnail: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80",
      level: "advanced",
      levelText: "متقدم",
      category: "ECU",
      duration: "شهر واحد",
      totalLessons: 24,
      totalDuration: 720,
      instructor: "د. عبدالله الزهراني",
      price: 1200,
      enrolledCount: 80,
      rating: 5.0,
    },
    {
      id: 4,
      slug: "comprehensive-maintenance",
      title: "الصيانة الشاملة",
      description: "برنامج تدريبي شامل يغطي جميع أنظمة السيارة",
      thumbnail: "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800&q=80",
      level: "beginner",
      levelText: "مبتدئ - متقدم",
      category: "شامل",
      duration: "3 أشهر",
      totalLessons: 48,
      totalDuration: 1440,
      instructor: "م. فهد العتيبي",
      price: 2000,
      enrolledCount: 200,
      rating: 4.9,
    },
    {
      id: 5,
      slug: "electrical-systems",
      title: "أنظمة الكهرباء في السيارات",
      description: "فهم شامل لأنظمة الكهرباء والإلكترونيات في السيارات الحديثة",
      thumbnail: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
      level: "intermediate",
      levelText: "متوسط",
      category: "كهرباء",
      duration: "5 أسابيع",
      totalLessons: 20,
      totalDuration: 600,
      instructor: "م. سعد القحطاني",
      price: 900,
      enrolledCount: 95,
      rating: 4.7,
    },
    {
      id: 6,
      slug: "engine-diagnostics",
      title: "تشخيص أعطال المحرك",
      description: "تقنيات متقدمة لتشخيص وإصلاح أعطال المحرك",
      thumbnail: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
      level: "advanced",
      levelText: "متقدم",
      category: "محرك",
      duration: "6 أسابيع",
      totalLessons: 22,
      totalDuration: 660,
      instructor: "م. ماجد الشمري",
      price: 1100,
      enrolledCount: 70,
      rating: 4.8,
    },
  ];

  const stats = [
    { icon: BookOpen, label: "دورة تدريبية", value: "12+" },
    { icon: Users, label: "متدرب نشط", value: "500+" },
    { icon: Award, label: "شهادة إتمام", value: "450+" },
    { icon: TrendingUp, label: "معدل النجاح", value: "95%" },
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    return matchesSearch && matchesLevel && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-yellow-50 via-white to-gray-50">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 px-4 py-2 rounded-full mb-4">
              <GraduationCap className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-700">منصة مير للتدريب</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              طور مهاراتك مع أفضل الدورات التدريبية
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              تعلم من خبراء متخصصين واحصل على شهادات إتمام من الجهات التدريبية الشريكة
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث عن دورة تدريبية..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none text-lg"
                />
              </div>
            </div>
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

      {/* Filters */}
      <section className="py-8 border-b bg-white sticky top-20 z-10 shadow-sm">
        <div className="container">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <Filter className="w-5 h-5" />
              <span>تصفية حسب:</span>
            </div>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="all">جميع المستويات</option>
              <option value="beginner">مبتدئ</option>
              <option value="intermediate">متوسط</option>
              <option value="advanced">متقدم</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="all">جميع التخصصات</option>
              <option value="بطارية">بطارية</option>
              <option value="سلف ودينمو">سلف ودينمو</option>
              <option value="ECU">ECU</option>
              <option value="كهرباء">كهرباء</option>
              <option value="محرك">محرك</option>
              <option value="شامل">شامل</option>
            </select>

            <div className="mr-auto text-sm text-gray-600">
              <strong>{filteredCourses.length}</strong> دورة متاحة
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16">
        <div className="container">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">لم يتم العثور على دورات</h3>
              <p className="text-gray-600">جرب تغيير معايير البحث أو الفلترة</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <Link key={course.id} href={`/courses/${course.slug}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                        {course.levelText}
                      </div>
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-900">
                        {course.price} ر.س
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                          {course.category}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.totalLessons} درس</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold">{course.rating}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            ({course.enrolledCount} متدرب)
                          </span>
                        </div>
                        <Button
                          size="sm"
                          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                        >
                          عرض الدورة
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="py-12 bg-yellow-50">
        <div className="container max-w-4xl">
          <div className="bg-white p-8 rounded-2xl border-2 border-yellow-200 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-black text-xl font-bold">!</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">إخلاء مسؤولية</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  منصة مير تعمل كوسيط تقني لربط المتدربين بالجهات التدريبية الشريكة، ولا تتحمل أي مسؤولية قانونية أو تعليمية عن محتوى البرامج أو نتائج التدريب أو الشهادات الصادرة.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  جميع البرامج التدريبية تخضع لشروط وأحكام الجهة المقدمة. إتمام البرامج التدريبية يساهم في رفع فرص التقييم والانضمام حسب الاحتياج والمعايير المعتمدة، ولا يضمن التوظيف أو الانضمام المباشر.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
