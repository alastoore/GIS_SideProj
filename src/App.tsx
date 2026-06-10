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
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans antialiased">
      
      <Navbar scrolled={isScrolled} />

      <main className="w-full">
        
        {/* HERO - FULL SCREEN */}
        <section className="min-h-screen flex items-center justify-center px-6">
          <Hero />
        </section>

        {/* FEATURES */}
        <section className=" flex items-center px-6">
          <div className="w-full">
            <Features />
          </div>
        </section>

        {/* ANALYSIS */}
        <section className="min-h-screen flex items-center px-6">
          <div className="w-full">
            <Analysis />
          </div>
        </section>

        {/* CTA */}
        <section className="min-h-screen flex items-center justify-center px-6">
          <CTA />
        </section>

      </main>

      <Footer />
    </div>
  );
}
