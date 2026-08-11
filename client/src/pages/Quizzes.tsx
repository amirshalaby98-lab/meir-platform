import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";

export default function Quizzes() {
  const { toast } = useToast();
  const courses = trpc.courses.getAll.useQuery();
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  // Mock quiz data (will be replaced with real API)
  const mockQuizzes = [
    { id: 1, title: "أساسيات المحرك", questions: 10, passingScore: 70, duration: "15 دقيقة" },
    { id: 2, title: "نظام الفرامل", questions: 8, passingScore: 70, duration: "10 دقائق" },
    { id: 3, title: "نظام التعليق", questions: 12, passingScore: 70, duration: "20 دقيقة" },
    { id: 4, title: "الكهرباء والإلكترونيات", questions: 15, passingScore: 80, duration: "25 دقيقة" },
  ];

  const mockQuestions = [
    { question: "ما هو الضغط الطبيعي لزيت المحرك عند السرعة الخاملة؟", options: ["10-15 PSI", "25-65 PSI", "80-100 PSI", "5-8 PSI"], correct: 1 },
    { question: "ما هو سبب ارتفاع حرارة المحرك الأكثر شيوعاً؟", options: ["نقص زيت المحرك", "نقص سائل التبريد", "تلف البواجي", "انسداد فلتر الهواء"], correct: 1 },
    { question: "ما هو الفرق بين محرك OHV و DOHC؟", options: ["عدد الأسطوانات", "موقع عمود الكامات", "نوع الوقود", "حجم المحرك"], correct: 1 },
  ];

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const correctCount = newAnswers.filter((a, i) => a === mockQuestions[i].correct).length;
      setScore(Math.round((correctCount / mockQuestions.length) * 100));
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">اختبارات أكاديمية مير</h1>
        <p className="text-gray-600 text-center mb-8">اختبر معلوماتك واحصل على شهادة</p>

        {!selectedQuiz && !showResult && (
          <div className="grid md:grid-cols-2 gap-4">
            {mockQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedQuiz(quiz.id)}>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">{quiz.title}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>عدد الأسئلة: {quiz.questions}</p>
                    <p>نسبة النجاح: {quiz.passingScore}%</p>
                    <p>المدة: {quiz.duration}</p>
                  </div>
                  <Button className="w-full mt-4 bg-yellow-400 text-black hover:bg-yellow-500">
                    ابدأ الاختبار
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedQuiz && !showResult && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>السؤال {currentQuestion + 1} من {mockQuestions.length}</CardTitle>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {Math.round(((currentQuestion) / mockQuestions.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-yellow-400 h-2 rounded-full transition-all" style={{ width: `${((currentQuestion) / mockQuestions.length) * 100}%` }} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">{mockQuestions[currentQuestion].question}</h3>
              <div className="space-y-2">
                {mockQuestions[currentQuestion].options.map((option, i) => (
                  <button key={i} className="w-full text-right p-3 border rounded-lg hover:bg-yellow-50 hover:border-yellow-400 transition-all" onClick={() => handleAnswer(i)}>
                    {option}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {showResult && (
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <div className={`text-6xl mb-4 ${score >= 70 ? "text-green-500" : "text-red-500"}`}>
                {score >= 70 ? "🎉" : "😔"}
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {score >= 70 ? "مبروك! نجحت" : "لم تنجح"}
              </h2>
              <p className="text-4xl font-bold mb-4 text-yellow-600">{score}%</p>
              <p className="text-gray-600 mb-6">
                {score >= 70 ? "يمكنك الآن تحميل شهادتك" : "حاول مرة أخرى"}
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={resetQuiz}>رجوع للاختبارات</Button>
                {score >= 70 && (
                  <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
                    تحميل الشهادة
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
