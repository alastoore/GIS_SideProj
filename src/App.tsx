import { useScroll } from './hooks/useScroll';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/sections/Hero';
import { Features } from './components/sections/Features';
import { Analysis } from './components/sections/Analysis';
import { CTA } from './components/sections/CTA';
import { Footer } from './components/layout/Footer';

export default function App() {
  const isScrolled = useScroll();

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-secondary/30 selection:text-secondary-fixed">
      <Navbar scrolled={isScrolled} />
      <main>
        <Hero />
        <Features />
        <Analysis />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}