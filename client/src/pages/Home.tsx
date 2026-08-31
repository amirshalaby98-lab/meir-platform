import { useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StatsCounter from "@/components/StatsCounter";
import ServicesSection from "@/components/ServicesSection";
import MarketplaceTeaser from "@/components/MarketplaceTeaser";
import CoverageMap from "@/components/CoverageMap";
import LoyaltyProgram from "@/components/LoyaltyProgram";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

export default function Home() {
  // Scroll to a section named by the URL hash (e.g. "/#services") once this
  // page has actually rendered - the browser's own scroll-to-anchor on load
  // fires before React mounts anything, so it silently misses the target.
  useEffect(() => {
    if (!window.location.hash) return;
    const id = window.location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <StatsCounter />
        <ServicesSection />
        <MarketplaceTeaser />
        <CoverageMap />
        <LoyaltyProgram />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
