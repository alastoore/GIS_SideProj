import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-24 overflow-hidden rounded-b-[3rem] mx-2 mt-2">
      {/* Background Layer */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0f172a]" />
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1z6LLH1f1pcn9YT7a-CG4XvkRxVnmdt9-SWDZQHKyBGqm5iNCmL_ol0QmBLTBiekw7ke4OzKYfexawpJZzFcE7ZrFvvAAXCivxafdvAnjmpHhIfR6Dtijg-AhP0HUHXfOlrt7YjTcEpd-oj6bozbyRxD5GJooP_ADRFyQzyiS84PNKoX2KaSiWC_qLTaMGE4K9wQz5PT5EnBaLS4jWmRGSn18vl0iw8GFUY1KTjGpEGRqVz8tijNkSnRd5eF9llwMQLNxPfq4Uw0"
          className="w-full h-full object-cover opacity-20"
          alt="GIS Map Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f172a]/60 to-[#0f172a]" />
      </div>

      <div className="container mx-auto px-margin-desktop text-center max-w-4xl relative z-10">
        <header className="inline-flex items-center gap-2 bg-slate-900/70 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full mb-8 shadow-sm">
          <Icon name="spatial_tracking" className="text-secondary" />
          <span className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">
            Spatial Intelligence & Data-Driven Healthcare
          </span>
        </header>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight leading-[1.1]">
          Visualizing Healthcare Accessibility for <span className="text-secondary-fixed">Every Community</span>
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          A data-driven GIS platform that identifies healthcare gaps, analyzes accessibility, 
          and recommends optimal facility locations using spatial analysis.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="w-full sm:w-auto">
            Explore Interactive Map <Icon name="map" />
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            View Dashboard <Icon name="dashboard" />
          </Button>
        </div>
      </div>
    </section>
  );
};