import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ar from "./locales/ar.json";
import en from "./locales/en.json";

export const RTL_LANGUAGES = new Set(["ar"]);

function applyDirection(lng: string) {
  const dir = RTL_LANGUAGES.has(lng) ? "rtl" : "ltr";
  document.documentElement.setAttribute("lang", lng);
  document.documentElement.setAttribute("dir", dir);
  document.body.setAttribute("dir", dir);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    lng: "ar",
    fallbackLng: "ar",
    supportedLngs: ["ar", "en"],
    detection: {
      order: ["localStorage"],
      caches: ["localStorage"],
      lookupLocalStorage: "meir-language",
    },
    interpolation: { escapeValue: false },
  });

applyDirection(i18n.resolvedLanguage || "ar");
i18n.on("languageChanged", applyDirection);

export default i18n;
