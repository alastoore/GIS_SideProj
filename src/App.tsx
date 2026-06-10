import { useScroll } from './hooks/useScroll';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/sections/Hero';
import { Features } from './components/sections/Features';
import { Analysis } from './components/sections/Analysis';
import { CTA } from './components/sections/CTA';
import { Contact } from './components/sections/Contact';
import { Footer } from './components/layout/Footer';
import { MapView } from './components/sections/MapView';

export default function App() {
  const isScrolled = useScroll();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#060c18] font-sans antialiased">
      <Navbar scrolled={isScrolled} />
      <main>
        <Hero />
        <Features />
        <Analysis />
        <MapView />
        <CTA />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}