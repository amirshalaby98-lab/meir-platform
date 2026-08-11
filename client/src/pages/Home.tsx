import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StatsCounter from "@/components/StatsCounter";
import ServicesSection from "@/components/ServicesSection";
import CoverageMap from "@/components/CoverageMap";
import TowTrucksSection from "@/components/TowTrucksSection";
import PartsShopsSection from "@/components/PartsShopsSection";
import JunkyardsSection from "@/components/JunkyardsSection";
import LoyaltyProgram from "@/components/LoyaltyProgram";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <StatsCounter />
        <ServicesSection />
        <CoverageMap />
        <TowTrucksSection />
        <PartsShopsSection />
        <JunkyardsSection />
        <LoyaltyProgram />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
