import { useState } from "react";
import { useRoute, Link } from "wouter";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  Circle,
  Play,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  Award,
  BookOpen,
} from "lucide-react";

export default function CourseLearn() {
  const [, params] = useRoute("/courses/:slug/learn");
  const slug = params?.slug;

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<number[]>([1]);

  // بيانات تجريبية
  const course = {
    id: 1,
    slug: "battery-maintenance",
    title: "تدريب صيانة البطاريات",
    totalLessons: 12,
    lessons: [
      {
        id: 1,
        title: "مقدمة عن بطاريات السيارات",
        duration: 30,
        type: "video",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        content: `
# مقدمة عن بطاريات السيارات

## نظرة عامة
بطارية السيارة هي المصدر الرئيسي للطاقة الكهربائية في السيارة. تقوم بتخزين الطاقة الكهربائية وتوفيرها للمحرك عند بدء التشغيل.

## أهمية البطارية
- تشغيل المحرك
- تشغيل الأنظمة الكهربائية
- تخزين الطاقة الزائدة من الدينمو

## مكونات البطارية
1. الألواح الموجبة والسالبة
2. المحلول الكهربائي (الحمض)
3. الغلاف الخارجي
4. الأقطاب (الموجب والسالب)
        `,
        attachments: [
          { name: "دليل البطاريات.pdf", url: "#" },
          { name: "جدول المواصفات.xlsx", url: "#" },
        ],
      },
      {
        id: 2,
        title: "أنواع البطاريات",
        duration: 45,
        type: "video",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        content: `
# أنواع بطاريات السيارات

## 1. البطاريات الرصاصية التقليدية (Flooded Lead-Acid)
- الأكثر شيوعاً
- تحتاج صيانة دورية
- سعر منخفض

## 2. بطاريات AGM (Absorbent Glass Mat)
- لا تحتاج صيانة
- أداء أفضل
- سعر أعلى

## 3. بطاريات الجل (Gel)
- مناسبة للظروف القاسية
- عمر افتراضي أطول

## 4. بطاريات الليثيوم (Lithium-Ion)
- خفيفة الوزن
- أداء عالي
- مكلفة
        `,
        attachments: [],
      },
      {
        id: 3,
        title: "أدوات الفحص والتشخيص",
        duration: 40,
        type: "video",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        content: `
# أدوات فحص البطاريات

## الأدوات الأساسية
1. **الملتيميتر (Multimeter)**
   - قياس الجهد
   - قياس التيار
   - فحص الاستمرارية

2. **جهاز فحص البطارية (Battery Tester)**
   - فحص سريع
   - قراءة دقيقة للحالة

3. **الهيدروميتر (Hydrometer)**
   - قياس كثافة الحمض
   - تحديد حالة الشحن
        `,
        attachments: [
          { name: "قائمة الأدوات.pdf", url: "#" },
        ],
      },
    ],
  };

  const currentLesson = course.lessons[currentLessonIndex];
  const progress = Math.round((completedLessons.length / course.totalLessons) * 100);

  const markAsComplete = () => {
    if (!completedLessons.includes(currentLesson.id)) {
      setCompletedLessons([...completedLessons, currentLesson.id]);
    }
    if (currentLessonIndex < course.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const goToNextLesson = () => {
    if (currentLessonIndex < course.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20">
        {/* Progress Bar */}
        <div className="bg-white border-b sticky top-20 z-10">
          <div className="container py-4">
            <div className="flex items-center justify-between mb-2">
              <Link href={`/courses/${slug}`}>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="w-4 h-4 ml-1" />
                  العودة إلى الدورة
                </Button>
              </Link>
              <div className="text-sm font-medium text-gray-600">
                {completedLessons.length} / {course.totalLessons} دروس مكتملة ({progress}%)
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Lessons List */}
            <div className="lg:col-span-1">
              <Card className="p-4 sticky top-36 max-h-[calc(100vh-200px)] overflow-y-auto">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  محتوى الدورة
                </h3>
                <div className="space-y-2">
                  {course.lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLessonIndex(index)}
                      className={`w-full text-right p-3 rounded-lg transition-colors ${
                        currentLessonIndex === index
                          ? "bg-yellow-50 border-2 border-yellow-400"
                          : "hover:bg-gray-50 border-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {completedLessons.includes(lesson.id) ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">
                            {index + 1}. {lesson.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{lesson.duration} دقيقة</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {progress === 100 && (
                  <Link href={`/certificates/${course.id}`}>
                    <Button className="w-full mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
                      <Award className="w-4 h-4 ml-2" />
                      احصل على الشهادة
                    </Button>
                  </Link>
                )}
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Lesson Title */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentLesson.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>الدرس {currentLessonIndex + 1} من {course.totalLessons}</span>
                  <span>•</span>
                  <span>{currentLesson.duration} دقيقة</span>
                </div>
              </div>

              {/* Video Player */}
              {currentLesson.type === "video" && (
                <Card className="overflow-hidden">
                  <div className="aspect-video bg-black">
                    <iframe
                      width="100%"
                      height="100%"
                      src={currentLesson.videoUrl}
                      title={currentLesson.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </Card>
              )}

              {/* Lesson Content */}
              <Card className="p-8">
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: currentLesson.content.replace(/\n/g, "<br />"),
                  }}
                />
              </Card>

              {/* Attachments */}
              {currentLesson.attachments && currentLesson.attachments.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    المرفقات
                  </h3>
                  <div className="space-y-2">
                    {currentLesson.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment.url}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-900">{attachment.name}</span>
                        </div>
                        <Download className="w-5 h-5 text-gray-600" />
                      </a>
                    ))}
                  </div>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  onClick={goToPreviousLesson}
                  disabled={currentLessonIndex === 0}
                  variant="outline"
                  size="lg"
                >
                  <ChevronRight className="w-5 h-5 ml-2" />
                  الدرس السابق
                </Button>

                {completedLessons.includes(currentLesson.id) ? (
                  <Button
                    onClick={goToNextLesson}
                    disabled={currentLessonIndex === course.lessons.length - 1}
                    size="lg"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                  >
                    الدرس التالي
                    <ChevronLeft className="w-5 h-5 mr-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={markAsComplete}
                    size="lg"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                  >
                    <CheckCircle2 className="w-5 h-5 ml-2" />
                    أكمل ومتابعة
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
