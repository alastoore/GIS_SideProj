import { useScroll } from './hooks/useScroll';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/sections/Hero';
import { Dashboard } from './components/sections/Dashboard';
import { MapView } from './components/sections/MapView';
import { Analysis } from './components/sections/Analysis';
import { Footer } from './components/layout/Footer';

export default function App() {
  const isScrolled = useScroll();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#060c18] font-sans antialiased">
      <Navbar scrolled={isScrolled} />
      <main>
        <Hero />
        <Dashboard />
        <MapView />
        <Analysis />
      </main>
      <Footer />
    </div>
  );
}
