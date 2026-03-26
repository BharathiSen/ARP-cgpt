import Hero from "@/components/marketing/Hero";
import ProblemSection from "@/components/marketing/ProblemSection";
import HowItWorks from "@/components/marketing/HowItWorks";
import UseCases from "@/components/marketing/UseCases";
import FeatureGrid from "@/components/marketing/FeatureGrid";
import ProductDemo from "@/components/marketing/ProductDemo";
import DocsSection from "@/components/marketing/DocsSection";
import Pricing from "@/components/marketing/Pricing";
import CTA from "@/components/marketing/CTA";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#05070f] text-white selection:bg-primary selection:text-white overflow-x-hidden">
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <FeatureGrid />
      <UseCases />
      <ProductDemo />
      <DocsSection />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
