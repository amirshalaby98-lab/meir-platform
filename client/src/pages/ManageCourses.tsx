import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Trash2, Eye, BookOpen } from "lucide-react";


export default function ManageCourses() {

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    thumbnail: "",
    level: "beginner" as "beginner" | "intermediate" | "advanced",
    category: "",
    duration: "",
    price: 0,
    instructor: "",
    published: 1,
  });

  const { data: courses, refetch } = trpc.courses.getAll.useQuery();
  const createMutation = trpc.courses.create.useMutation();
  const updateMutation = trpc.courses.update.useMutation();
  const deleteMutation = trpc.courses.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCourse) {
        await updateMutation.mutateAsync({
          id: editingCourse.id,
          ...formData,
        });
        alert("تم تحديث الدورة بنجاح");
      } else {
        await createMutation.mutateAsync(formData);
        alert("تم إضافة الدورة بنجاح");
      }
      
      setIsDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      alert("حدث خطأ: فشل في حفظ الدورة");
    }
  };

  const handleEdit = (course: any) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      slug: course.slug,
      description: course.description,
      thumbnail: course.thumbnail || "",
      level: course.level,
      category: course.category,
      duration: course.duration,
      price: course.price,
      instructor: course.instructor,
      published: course.published,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الدورة؟")) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      alert("تم حذف الدورة بنجاح");
      refetch();
    } catch (error) {
      alert("حدث خطأ: فشل في حذف الدورة");
    }
  };

  const resetForm = () => {
    setEditingCourse(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      thumbnail: "",
      level: "beginner",
      category: "",
      duration: "",
      price: 0,
      instructor: "",
      published: 1,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">إدارة الدورات التدريبية</h1>
            <p className="text-gray-600 mt-2">
              إضافة وتعديل وحذف الدورات التدريبية
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-500 hover:bg-yellow-600">
                <Plus className="ml-2 h-4 w-4" />
                إضافة دورة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCourse ? "تعديل الدورة" : "إضافة دورة جديدة"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    عنوان الدورة *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      // Auto-generate slug
                      if (!editingCourse) {
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
                    Slug (رابط الدورة) *
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
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    رابط الصورة
                  </label>
                  <Input
                    value={formData.thumbnail}
                    onChange={(e) =>
                      setFormData({ ...formData, thumbnail: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      المستوى *
                    </label>
                    <Select
                      value={formData.level}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, level: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">مبتدئ</SelectItem>
                        <SelectItem value="intermediate">متوسط</SelectItem>
                        <SelectItem value="advanced">متقدم</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      التصنيف *
                    </label>
                    <Input
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      placeholder="مثال: كهرباء السيارات"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      المدة *
                    </label>
                    <Input
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      placeholder="مثال: 8 أسابيع"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      السعر (ريال) *
                    </label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseFloat(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    المدرب *
                  </label>
                  <Input
                    value={formData.instructor}
                    onChange={(e) =>
                      setFormData({ ...formData, instructor: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    الحالة
                  </label>
                  <Select
                    value={formData.published.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, published: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">منشورة</SelectItem>
                      <SelectItem value="0">مسودة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-yellow-500 hover:bg-yellow-600">
                    {editingCourse ? "تحديث الدورة" : "إضافة الدورة"}
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
          {courses?.map((course: any) => (
            <Card key={course.id} className="p-6">
              <div className="flex items-start gap-4">
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-32 h-20 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{course.title}</h3>
                      <p className="text-gray-600 mt-1 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex gap-4 mt-3 text-sm text-gray-500">
                        <span>المستوى: {course.level === "beginner" ? "مبتدئ" : course.level === "intermediate" ? "متوسط" : "متقدم"}</span>
                        <span>السعر: {course.price} ريال</span>
                        <span>الدروس: {course.totalLessons || 0}</span>
                        <span className={course.published ? "text-green-600" : "text-orange-600"}>
                          {course.published ? "منشورة" : "مسودة"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/instructor/courses/${course.id}/lessons`}
                        title="إدارة الدروس"
                      >
                        <BookOpen className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/courses/${course.slug}`, "_blank")}
                        title="عرض الدورة"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(course)}
                        title="تعديل"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(course.id)}
                        className="text-red-600 hover:text-red-700"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {!courses || courses.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            لا توجد دورات بعد. ابدأ بإضافة دورة جديدة!
          </div>
        )}
      </div>
    </div>
  );
}
