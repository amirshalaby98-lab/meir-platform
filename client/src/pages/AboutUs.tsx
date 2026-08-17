import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Target, Lightbulb, ShieldCheck, Scan, Users, Award, GraduationCap, Heart } from "lucide-react";

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-gray-600">
          <span className="mt-1.5 w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AboutUs() {
  const { t } = useTranslation();

  const introParagraphs = t("about.introParagraphs", { returnObjects: true }) as string[];
  const customerRightsItems = t("about.customerRightsItems", { returnObjects: true }) as string[];
  const networkItems = t("about.networkItems", { returnObjects: true }) as string[];
  const qualityItems = t("about.qualityItems", { returnObjects: true }) as string[];
  const communityItems = t("about.communityItems", { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 max-w-4xl mx-auto leading-tight">
              {t("about.heroTitle")}
            </h1>
            <p className="text-lg text-yellow-400 font-semibold max-w-2xl mx-auto">
              {t("about.heroSubtitle")}
            </p>
          </div>
        </section>

        {/* Intro */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-gray-900">{t("about.introTitle")}</h2>
              <div className="space-y-4">
                {introParagraphs?.map((p, i) => (
                  <p key={i} className="text-gray-600 leading-relaxed">{p}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Scanner */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid md:grid-cols-[auto_1fr] gap-6 items-start">
              <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <Scan className="w-7 h-7 text-black" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">{t("about.scannerTitle")}</h2>
                <p className="text-gray-600 leading-relaxed">{t("about.scannerBody")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Rights */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid md:grid-cols-[auto_1fr] gap-6 items-start">
              <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-7 h-7 text-black" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">{t("about.customerRightsTitle")}</h2>
                <p className="text-gray-600 leading-relaxed mb-4">{t("about.customerRightsIntro")}</p>
                {customerRightsItems && <BulletList items={customerRightsItems} />}
              </div>
            </div>
          </div>
        </section>

        {/* Network */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid md:grid-cols-[auto_1fr] gap-6 items-start">
              <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-7 h-7 text-black" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">{t("about.networkTitle")}</h2>
                <p className="text-gray-600 leading-relaxed mb-4">{t("about.networkIntro")}</p>
                {networkItems && <BulletList items={networkItems} />}
                <p className="text-gray-600 leading-relaxed mt-4">{t("about.networkOutro")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quality */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid md:grid-cols-[auto_1fr] gap-6 items-start">
              <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="w-7 h-7 text-black" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">{t("about.qualityTitle")}</h2>
                <p className="text-gray-600 leading-relaxed mb-4">{t("about.qualityIntro")}</p>
                {qualityItems && <BulletList items={qualityItems} />}
                <p className="text-gray-600 leading-relaxed mt-4">{t("about.qualityOutro")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Training */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid md:grid-cols-[auto_1fr] gap-6 items-start">
              <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-7 h-7 text-black" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">{t("about.trainingTitle")}</h2>
                <p className="text-gray-600 leading-relaxed">{t("about.trainingBody")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Community */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid md:grid-cols-[auto_1fr] gap-6 items-start">
              <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="w-7 h-7 text-black" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">{t("about.communityTitle")}</h2>
                <p className="text-gray-600 leading-relaxed mb-4">{t("about.communityIntro")}</p>
                {communityItems && <BulletList items={communityItems} />}
              </div>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-2xl p-8">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-yellow-400">{t("about.visionTitle")}</h3>
                <p className="text-gray-300 leading-relaxed">{t("about.visionBody")}</p>
              </div>
              <div className="bg-gray-800 rounded-2xl p-8">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-yellow-400">{t("about.missionTitle")}</h3>
                <p className="text-gray-300 leading-relaxed">{t("about.missionBody")}</p>
              </div>
            </div>
            <p className="text-center text-lg font-semibold text-yellow-400 mt-12 max-w-2xl mx-auto">
              {t("about.closingLine")}
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-yellow-400">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">{t("about.ctaTitle")}</h2>
            <p className="text-gray-800 mb-8 max-w-lg mx-auto">{t("about.ctaSubtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/service-request">
                <button className="bg-black text-white font-bold px-8 py-4 rounded-lg hover:bg-gray-900 transition">
                  {t("common.requestService")}
                </button>
              </Link>
              <Link href="/obd-scanner">
                <button className="bg-gray-900 text-white font-bold px-8 py-4 rounded-lg hover:bg-gray-800 transition border border-white">
                  {t("common.freeDiagnosis")}
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
