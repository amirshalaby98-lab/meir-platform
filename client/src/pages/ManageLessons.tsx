import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function ManageLessons() {
  const { courseId } = useParams<{ courseId: string }>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    videoUrl: "",
    duration: 0,
    order: 1,
    published: 1,
  });

  const { data: course } = trpc.courses.getById.useQuery({
    id: parseInt(courseId!),
  });

  const { data: lessons, refetch } = trpc.lessons.getByCourseId.useQuery({
    courseId: parseInt(courseId!),
  });

  const createMutation = trpc.lessons.create.useMutation();
  const updateMutation = trpc.lessons.update.useMutation();
  const deleteMutation = trpc.lessons.delete.useMutation();

  useEffect(() => {
    if (lessons && !editingLesson) {
      setFormData((prev) => ({
        ...prev,
        order: lessons.length + 1,
      }));
    }
  }, [lessons, editingLesson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingLesson) {
        await updateMutation.mutateAsync({
          id: editingLesson.id,
          ...formData,
        });
        alert("تم تحديث الدرس بنجاح");
      } else {
        await createMutation.mutateAsync({
          courseId: parseInt(courseId!),
          ...formData,
        });
        alert("تم إضافة الدرس بنجاح");
      }
      
      setIsDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      alert("حدث خطأ: فشل في حفظ الدرس");
    }
  };

  const handleEdit = (lesson: any) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description,
      videoUrl: lesson.videoUrl || "",
      duration: lesson.duration,
      order: lesson.order,
      published: lesson.published,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الدرس؟")) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      alert("تم حذف الدرس بنجاح");
      refetch();
    } catch (error) {
      alert("حدث خطأ: فشل في حذف الدرس");
    }
  };

  const resetForm = () => {
    setEditingLesson(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      videoUrl: "",
      duration: 0,
      order: lessons ? lessons.length + 1 : 1,
      published: 1,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <div className="mb-6">
          <Link href="/instructor/courses">
            <Button variant="outline" className="mb-4">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى الدورات
            </Button>
          </Link>
          
          {course && (
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-2xl font-bold">{course.title}</h2>
              <p className="text-gray-600 mt-2">{course.description}</p>
              <div className="flex gap-4 mt-4 text-sm text-gray-500">
                <span>عدد الدروس: {lessons?.length || 0}</span>
                <span>إجمالي المدة: {course.totalDuration || 0} دقيقة</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">إدارة دروس الدورة</h1>
            <p className="text-gray-600 mt-2">
              إضافة وتعديل وحذف الدروس والفيديوهات
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-500 hover:bg-yellow-600">
                <Plus className="ml-2 h-4 w-4" />
                إضافة درس جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingLesson ? "تعديل الدرس" : "إضافة درس جديد"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    عنوان الدرس *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      // Auto-generate slug
                      if (!editingLesson) {
                        setFormData({
                          ...formData,
                          title: e.target.value,
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                            .replace(/[^\w\-]+/g, ""),
                        });
                      }
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Slug (رابط الدرس) *
                  </label>
                  <Input
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    الوصف *
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    رابط الفيديو (YouTube) *
                  </label>
                  <Input
                    value={formData.videoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, videoUrl: e.target.value })
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    يمكنك إضافة رابط YouTube أو أي رابط فيديو آخر
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      المدة (بالدقائق) *
                    </label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      الترتيب *
                    </label>
                    <Input
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-yellow-500 hover:bg-yellow-600">
                    {editingLesson ? "تحديث الدرس" : "إضافة الدرس"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {lessons?.map((lesson: any) => (
            <Card key={lesson.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-300">
                      {lesson.order}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold">{lesson.title}</h3>
                      <p className="text-gray-600 mt-1">{lesson.description}</p>
                      <div className="flex gap-4 mt-3 text-sm text-gray-500">
                        <span>المدة: {lesson.duration} دقيقة</span>
                        {lesson.videoUrl && (
                          <a
                            href={lesson.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            عرض الفيديو
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(lesson)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(lesson.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {!lessons || lessons.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            لا توجد دروس بعد. ابدأ بإضافة درس جديد!
          </div>
        )}
      </div>
    </div>
  );
}
