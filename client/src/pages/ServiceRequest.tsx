import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Car, Upload, CreditCard, CheckCircle2, ArrowRight, ArrowLeft, Video, FileText, AlertTriangle, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

type Step = "vehicle" | "complaint" | "video" | "payment" | "confirmation";

const STEPS: { key: Step; label: string; icon: any }[] = [
  { key: "vehicle", label: "بيانات المركبة", icon: Car },
  { key: "complaint", label: "وصف المشكلة", icon: FileText },
  { key: "video", label: "فيديو السيارة", icon: Video },
  { key: "payment", label: "الدفع", icon: CreditCard },
  { key: "confirmation", label: "التأكيد", icon: CheckCircle2 },
];

const CAR_MAKES = [
  "تويوتا", "هيونداي", "كيا", "نيسان", "شيفروليه", "فورد", "هوندا",
  "مرسيدس", "بي ام دبليو", "لكزس", "جي ام سي", "دودج", "جيب",
  "ميتسوبيشي", "مازدا", "سوبارو", "فولكسفاجن", "أودي", "بورش",
  "لاند روفر", "رنج روفر", "إنفينيتي", "كاديلاك", "لينكولن",
  "كرايسلر", "بيجو", "رينو", "سوزوكي", "إيسوزو", "أخرى"
];

const CAR_MODELS: Record<string, string[]> = {
  "تويوتا": ["كامري", "كورولا", "هايلكس", "لاندكروزر", "برادو", "ياريس", "رافشش", "افالون", "فورتشنر", "انوفا", "راش", "سيكويا", "افانزا", "هايس", "كوستر", "أخرى"],
  "هيونداي": ["أكسنت", "سوناتا", "إلنترا", "توسان", "سانتافي", "كريتا", "ازيرا", "باليسيد", "فيلوستر", "ستاريا", "أخرى"],
  "كيا": ["سيراتو", "أوبتيما", "سبورتاج", "سورينتو", "كارنيفال", "سيلتوس", "بيكانتو", "كادينزا", "ريو", "فورتي", "أخرى"],
  "نيسان": ["باترول", "صني", "ألتيما", "ماكسيما", "إكس تريل", "باثفايندر", "نافارا", "داتسون", "سنترا", "كيكس", "جوك", "أخرى"],
  "شيفروليه": ["تاهو", "سوبربان", "سيلفرادو", "ترافيرس", "كابتيفا", "كروز", "ماليبو", "امبالا", "كمارو", "لومينا", "أخرى"],
  "فورد": ["إكسبديشن", "إكسبلورر", "تورس", "فيوجن", "فوكس", "موستنج", "إيج", "رينجر", "فلكس", "فيستا", "أخرى"],
  "هوندا": ["أكورد", "سيفيك", "سيتي", "بايلوت", "أوديسي", "سي آر في", "اليزن", "أخرى"],
  "مرسيدس": ["اس كلاس", "سي كلاس", "إي كلاس", "جي كلاس", "جي إل إي", "جي إل إس", "أي ام جي", "جي إل بي", "أخرى"],
  "بي ام دبليو": ["الفئة الثالثة", "الفئة الخامسة", "الفئة السابعة", "إكس 3", "إكس 5", "إكس 6", "إكس 7", "أخرى"],
  "لكزس": ["إل إس", "إي إس", "جي إس", "جي إكس", "آر إكس", "إن إكس", "إل إكس", "أخرى"],
  "جي ام سي": ["يوكون", "سييرا", "تيرين", "أكاديا", "سافانا", "أخرى"],
  "دودج": ["تشارجر", "تشالنجر", "دورانجو", "رام", "كارافان", "أخرى"],
  "جيب": ["رانجلر", "شيروكي", "جراند شيروكي", "كومباس", "رينيجيد", "أخرى"],
  "ميتسوبيشي": ["لانسر", "باجيرو", "أوتلاندر", "مونتيرو", "إكليبس", "أخرى"],
  "مازدا": ["مازدا 3", "مازدا 6", "سي إكس 5", "سي إكس 9", "أخرى"],
  "سوبارو": ["فورستر", "أوتباك", "إمبريزا", "ليفورج", "أخرى"],
  "فولكسفاجن": ["جيتا", "تيجوان", "تواريج", "باسات", "جولف", "أخرى"],
  "أودي": ["أي 3", "أي 4", "أي 6", "أي 8", "كيو 3", "كيو 5", "كيو 7", "أخرى"],
  "بورش": ["كايين", "ماكان", "باناميرا", "كاريرا", "911", "أخرى"],
  "لاند روفر": ["ديفندر", "ديسكفري", "رينج روفر سبورت", "رينج روفر فوج", "أخرى"],
  "رنج روفر": ["رينج روفر", "رينج روفر سبورت", "رينج روفر فوج", "إيفوك", "أخرى"],
  "إنفينيتي": ["كيو إكس 50", "كيو إكس 60", "كيو إكس 80", "كيو 30", "كيو 60", "أخرى"],
  "كاديلاك": ["إسكاليد", "سي تي إس", "إكس تي إس", "أخرى"],
  "لينكولن": ["نافيجيتور", "إفياتور", "كونتيننتال", "أخرى"],
  "كرايسلر": ["باسيفيكا", "300", "أخرى"],
  "بيجو": ["301", "308", "3008", "5008", "508", "أخرى"],
  "رينو": ["داستر", "كوليوس", "ميجان", "سيمبول", "كابتشر", "أخرى"],
  "سوزوكي": ["فيتارا", "سويفت", "جيمني", "إرتيجا", "أخرى"],
  "إيسوزو": ["دي ماكس", "ميو إكس", "أخرى"],
  "أخرى": []
};

const YEARS = Array.from({ length: 30 }, (_, i) => (2026 - i).toString());

export default function ServiceRequest() {
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>("vehicle");
  
  // Vehicle data
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [color, setColor] = useState("");
  const [mileage, setMileage] = useState("");
  
  // Complaint
  const [complaint, setComplaint] = useState("");
  
  // Video
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [videoUploaded, setVideoUploaded] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "stc_pay" | "mada" | "card" | "cash">("bank_transfer");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>("");
  
  // Order
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  
  // Terms
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Mutations
  const createOrderMutation = trpc.serviceOrders.create.useMutation({
    onSuccess: (data) => {
      setOrderId(data.orderId);
      setOrderNumber(data.orderNumber);
      toast.success("تم إنشاء الطلب بنجاح");
    },
    onError: (err) => {
      toast.error(err.message || "فشل إنشاء الطلب");
    },
  });
  
  const uploadVideoMutation = trpc.serviceOrders.uploadVideo.useMutation({
    onSuccess: () => {
      setVideoUploaded(true);
      setUploading(false);
      toast.success("تم رفع الفيديو بنجاح");
    },
    onError: (err) => {
      setUploading(false);
      toast.error(err.message || "فشل رفع الفيديو");
    },
  });
  
  const submitPaymentMutation = trpc.serviceOrders.submitPayment.useMutation({
    onSuccess: () => {
      setStep("confirmation");
      toast.success("تم تسجيل الدفع بنجاح! سيتم مراجعة طلبك");
    },
    onError: (err) => {
      toast.error(err.message || "فشل تسجيل الدفع");
    },
  });

  // حماية الصفحة - يجب تسجيل الدخول
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
          <Card className="p-8 text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">يرجى تسجيل الدخول أولاً</h2>
            <p className="text-gray-600 mb-4">لطلب خدمة يرجى تسجيل الدخول أو إنشاء حساب جديد</p>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3"
              onClick={() => window.location.href = getLoginUrl()}
            >
              تسجيل / دخول
            </Button>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  const currentStepIndex = STEPS.findIndex(s => s.key === step);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate type
    const allowedTypes = ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("نوع الملف غير مدعوم. يرجى رفع فيديو (MP4, MOV, WebM, AVI)");
      return;
    }
    
    // Validate size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("حجم الفيديو يتجاوز الحد الأقصى (50MB)");
      return;
    }
    
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleReceiptSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم صورة الإيصال يتجاوز الحد الأقصى (5MB)");
      return;
    }
    
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = () => setReceiptPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreateOrder = async () => {
    if (!make || !model || !year) {
      toast.error("يرجى إدخال بيانات المركبة الأساسية");
      return;
    }
    if (!complaint.trim()) {
      toast.error("يرجى وصف المشكلة");
      return;
    }
    
    createOrderMutation.mutate({
      vehicleBrand: make,
      vehicleModel: model,
      vehicleYear: year,
      plateNumber: plateNumber || undefined,
      color: color || undefined,
      mileage: mileage ? parseInt(mileage) : undefined,
      complaint,
      customerPhone: "0500000000", // سيتم تحديثه من بيانات المستخدم
    });
  };

  const handleUploadVideo = async () => {
    if (!videoFile || !orderId) return;
    
    setUploading(true);
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadVideoMutation.mutate({
        orderId,
        originalName: videoFile.name,
        mimeType: videoFile.type,
        fileSize: videoFile.size,
        videoBase64: base64,
      });
    };
    reader.readAsDataURL(videoFile);
  };

  const handleSubmitPayment = async () => {
    if (!orderId) return;
    
    let receiptImage: string | undefined;
    if (receiptFile) {
      receiptImage = receiptPreview;
    }
    
    submitPaymentMutation.mutate({
      orderId,
      paymentType: "inspection" as const,
      amount: "200.00",
      paymentMethod: paymentMethod === "card" ? "credit_card" as const : paymentMethod,
      reference: `PAY-${Date.now()}`,
      receiptBase64: receiptImage ? receiptImage.split(",")[1] : undefined,
    });
  };

  const goNext = () => {
    const idx = currentStepIndex;
    if (idx < STEPS.length - 1) {
      // Validation before moving
      if (step === "vehicle") {
        if (!make || !model || !year) {
          toast.error("يرجى إدخال نوع المركبة والموديل والسنة");
          return;
        }
      }
      if (step === "complaint") {
        if (!complaint.trim()) {
          toast.error("يرجى وصف المشكلة");
          return;
        }
        // Create order when moving from complaint to video
        if (!orderId) {
          handleCreateOrder();
          return; // Will move to next step after success
        }
      }
      if (step === "video") {
        if (!videoUploaded && videoFile) {
          toast.error("يرجى رفع الفيديو أولاً");
          return;
        }
      }
      setStep(STEPS[idx + 1].key);
    }
  };

  const goBack = () => {
    const idx = currentStepIndex;
    if (idx > 0) {
      setStep(STEPS[idx - 1].key);
    }
  };

  // Auto-advance after order creation
  if (orderId && step === "complaint") {
    setStep("video");
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">طلب خدمة فحص وصيانة</h1>
        <p className="text-center text-muted-foreground mb-8">رسوم الفحص: <span className="font-bold text-primary">200 ريال</span></p>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === currentStepIndex;
            const isDone = i < currentStepIndex;
            return (
              <div key={s.key} className="flex flex-col items-center gap-1 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isDone ? "bg-green-500 text-white" : isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs text-center ${isActive ? "font-bold text-primary" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`absolute h-0.5 w-full ${isDone ? "bg-green-500" : "bg-muted"}`} style={{ display: "none" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            
            {/* Step 1: Vehicle Info */}
            {step === "vehicle" && (
              <div className="space-y-4">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    بيانات المركبة
                  </CardTitle>
                </CardHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="make">نوع المركبة *</Label>
                    <select
                      id="make"
                      value={make}
                      onChange={(e) => { setMake(e.target.value); setModel(""); }}
                      className="w-full mt-1 p-2 border rounded-md bg-background"
                    >
                      <option value="">اختر النوع</option>
                      {CAR_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="model">الموديل *</Label>
                    {make && CAR_MODELS[make] && CAR_MODELS[make].length > 0 ? (
                      <select
                        id="model"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md bg-background"
                      >
                        <option value="">اختر الموديل</option>
                        {CAR_MODELS[make].map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    ) : (
                      <Input
                        id="model"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="اكتب الموديل..."
                      />
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="year">سنة الصنع *</Label>
                    <select
                      id="year"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md bg-background"
                    >
                      <option value="">اختر السنة</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="plate">رقم اللوحة</Label>
                    <Input
                      id="plate"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      placeholder="اختياري"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="color">اللون</Label>
                    <Input
                      id="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="اختياري"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="mileage">عداد الكيلومترات</Label>
                    <Input
                      id="mileage"
                      type="number"
                      value={mileage}
                      onChange={(e) => setMileage(e.target.value)}
                      placeholder="اختياري"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Complaint */}
            {step === "complaint" && (
              <div className="space-y-4">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    وصف المشكلة
                  </CardTitle>
                </CardHeader>
                
                <div>
                  <Label htmlFor="complaint">اشرح المشكلة اللي تواجهها في السيارة *</Label>
                  <Textarea
                    id="complaint"
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    placeholder="مثال: السيارة ما تشتغل، فيه صوت غريب من المحرك، لمبة المكينة مضيئة..."
                    rows={5}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">كلما كان الوصف أدق، كلما كان التشخيص أسرع</p>
                </div>
              </div>
            )}

            {/* Step 3: Video Upload */}
            {step === "video" && (
              <div className="space-y-4">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    فيديو حالة السيارة
                  </CardTitle>
                </CardHeader>
                
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  {!videoFile ? (
                    <>
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground mb-2">ارفع فيديو قصير لحالة السيارة</p>
                      <p className="text-xs text-muted-foreground mb-4">MP4, MOV, WebM, AVI - حد أقصى 50MB</p>
                      <Button onClick={() => videoInputRef.current?.click()} variant="outline">
                        اختر فيديو
                      </Button>
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm,video/x-msvideo"
                        onChange={handleVideoSelect}
                        className="hidden"
                      />
                    </>
                  ) : (
                    <div className="space-y-3">
                      {videoPreview && (
                        <video
                          src={videoPreview}
                          controls
                          className="max-h-48 mx-auto rounded-lg"
                        />
                      )}
                      <p className="text-sm font-medium">{videoFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                      
                      {!videoUploaded ? (
                        <div className="flex gap-2 justify-center">
                          <Button
                            onClick={handleUploadVideo}
                            disabled={uploading}
                          >
                            {uploading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                                جاري الرفع...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 ml-2" />
                                رفع الفيديو
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setVideoFile(null);
                              setVideoPreview("");
                            }}
                          >
                            تغيير
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>تم رفع الفيديو بنجاح</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <p className="font-medium">نصائح لفيديو أفضل:</p>
                      <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                        <li>صوّر المحرك وهو شغال إذا فيه صوت غريب</li>
                        <li>صوّر لوحة العدادات إذا فيه لمبات تحذير</li>
                        <li>صوّر المنطقة المتضررة من الخارج</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground text-center">
                  رفع الفيديو اختياري لكنه يساعد الفني في التشخيص المبدئي
                </p>
              </div>
            )}

            {/* Step 4: Payment */}
            {step === "payment" && (
              <div className="space-y-4">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    دفع رسوم الفحص
                  </CardTitle>
                </CardHeader>
                
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">200 ريال</p>
                  <p className="text-sm text-muted-foreground">رسوم الفحص والتشخيص</p>
                </div>
                
                <div>
                  <Label className="text-base font-medium">اختر طريقة الدفع:</Label>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {[
                      { value: "bank_transfer", label: "تحويل بنكي" },
                      { value: "stc_pay", label: "STC Pay" },
                      { value: "mada", label: "مدى" },
                      { value: "card", label: "بطاقة ائتمانية" },
                    ].map(method => (
                      <button
                        key={method.value}
                        onClick={() => setPaymentMethod(method.value as any)}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          paymentMethod === method.value
                            ? "border-primary bg-primary/5 text-primary font-medium"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {paymentMethod === "bank_transfer" && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="font-medium text-sm">معلومات التحويل:</p>
                    <div className="text-sm space-y-1">
                      <p>البنك: <span className="font-medium">الراجحي</span></p>
                      <p>رقم الحساب: <span className="font-medium">IBAN SA...</span></p>
                      <p>اسم المستفيد: <span className="font-medium">مؤسسة مير للخدمات</span></p>
                    </div>
                    
                    <div className="pt-3">
                      <Label htmlFor="receipt">ارفق صورة الإيصال</Label>
                      <Input
                        id="receipt"
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptSelect}
                        className="mt-1"
                      />
                      {receiptPreview && (
                        <img src={receiptPreview} alt="إيصال" className="mt-2 max-h-32 rounded-lg" />
                      )}
                    </div>
                  </div>
                )}
                
                {paymentMethod === "stc_pay" && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="font-medium text-sm">حوّل المبلغ عبر STC Pay إلى:</p>
                    <p className="text-lg font-bold mt-1">05XXXXXXXX</p>
                    <div className="pt-3">
                      <Label htmlFor="receipt-stc">ارفق صورة الإيصال</Label>
                      <Input
                        id="receipt-stc"
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptSelect}
                        className="mt-1"
                      />
                      {receiptPreview && (
                        <img src={receiptPreview} alt="إيصال" className="mt-2 max-h-32 rounded-lg" />
                      )}
                    </div>
                  </div>
                )}
                
                {/* Checkbox الشروط والأحكام */}
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    أوافق على{" "}
                    <a href="/terms" target="_blank" className="text-primary underline font-medium">الشروط والأحكام</a>
                    {" "}وسياسة الاستخدام
                  </label>
                </div>
                
                <Button
                  onClick={handleSubmitPayment}
                  disabled={submitPaymentMutation.isPending || !termsAccepted}
                  className="w-full"
                  size="lg"
                >
                  {submitPaymentMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                      جاري التسجيل...
                    </>
                  ) : (
                    "تأكيد الدفع"
                  )}
                </Button>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {step === "confirmation" && (
              <div className="text-center space-y-4 py-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold">تم تسجيل طلبك بنجاح!</h2>
                <p className="text-muted-foreground">رقم الطلب: <span className="font-bold text-primary">{orderNumber}</span></p>
                <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2 text-right">
                  <p>سيتم مراجعة طلبك والتحقق من الدفع</p>
                  <p>بعد التأكيد، سيتم تعيين فني لك</p>
                  <p>ستصلك إشعارات بكل تحديث على طلبك</p>
                </div>
                <div className="flex gap-3 justify-center pt-4">
                  <Button variant="outline" onClick={() => window.location.href = "/my-orders"}>
                    تتبع طلبي
                  </Button>
                  <Button onClick={() => window.location.href = "/"}>
                    الرئيسية
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        {step !== "confirmation" && step !== "payment" && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={goBack}
              disabled={currentStepIndex === 0}
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              السابق
            </Button>
            <Button
              onClick={goNext}
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  التالي
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
