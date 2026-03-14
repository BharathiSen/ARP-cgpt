import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProblemSection from '@/components/ProblemSection';
import SolutionSection from '@/components/SolutionSection';
import FeatureGrid from '@/components/FeatureGrid';
import ProductDemo from '@/components/ProductDemo';
import AISection from '@/components/AISection';
import Pricing from '@/components/Pricing';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#05070f] text-white selection:bg-primary selection:text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <FeatureGrid />
      <ProductDemo />
      <AISection />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
