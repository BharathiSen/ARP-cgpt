import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProblemSection from '@/components/ProblemSection';
import HowItWorks from '@/components/HowItWorks';
import UseCases from '@/components/UseCases';
import FeatureGrid from '@/components/FeatureGrid';
import ProductDemo from '@/components/ProductDemo';
import DocsSection from '@/components/DocsSection';
import Pricing from '@/components/Pricing';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#05070f] text-white selection:bg-primary selection:text-white overflow-x-hidden">
      <Navbar />
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
