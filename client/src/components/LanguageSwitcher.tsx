import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { i18n } = useTranslation();
  const isArabic = i18n.resolvedLanguage === "ar";

  return (
    <button
      onClick={() => i18n.changeLanguage(isArabic ? "en" : "ar")}
      className={`flex items-center gap-1.5 text-gray-700 hover:text-yellow-500 transition-colors font-medium text-sm ${className}`}
      title={isArabic ? "Switch to English" : "التبديل للعربية"}
    >
      <Languages className="w-4 h-4" />
      {isArabic ? "EN" : "AR"}
    </button>
  );
}
