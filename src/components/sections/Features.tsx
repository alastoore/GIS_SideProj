import { Icon } from '../ui/Icon';
import { cn } from '../../lib/utils';

const FEATURE_DATA = [
  {
    id: 'gis',
    title: 'Interactive GIS Mapping',
    desc: 'Powered by Mapbox for real-time spatial visualization. Layer multi-source data including population density and transport networks.',
    icon: 'layers',
    size: 'large',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1z6LLH1f1pcn9YT7a-CG4XvkRxVnmdt9-SWDZQHKyBGqm5iNCmL_ol0QmBLTBiekw7ke4OzKYfexawpJZzFcE7ZrFvvAAXCivxafdvAnjmpHhIfR6Dtijg-AhP0HUHXfOlrt7YjTcEpd-oj6bozbyRxD5GJooP_ADRFyQzyiS84PNKoX2KaSiWC_qLTaMGE4K9wQz5PT5EnBaLS4jWmRGSn18vl0iw8GFUY1KTjGpEGRqVz8tijNkSnRd5eF9llwMQLNxPfq4Uw0'
  },
  {
    id: 'heatmaps',
    title: 'Accessibility Heatmaps',
    desc: 'Color-coded coverage analysis (Green, Yellow, Red) using gravity models to determine where help is needed most.',
    icon: 'texture',
    size: 'tall',
  },
  {
    id: 'ai',
    title: 'Recommendation Engine',
    desc: 'Population-aware suggestions for new facilities. AI suggests impactful locations to maximize community health outcomes.',
    icon: 'auto_awesome',
    size: 'wide',
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-[#0f172a]">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Advanced GIS Toolset</h2>
          <p className="text-lg text-slate-400">Leveraging cutting-edge spatial algorithms.</p>
        </div>

        <div className="grid grid-cols-12 gap-6 max-w-6xl mx-auto">
          {FEATURE_DATA.map((feature) => (
            <div
              key={feature.id}
              className={cn(
                "bg-slate-800/40 p-8 rounded-3xl border border-slate-700 group hover:shadow-xl transition-all flex flex-col",
                feature.size === 'large' && "col-span-12 lg:col-span-8 h-[500px]",
                feature.size === 'tall' && "col-span-12 lg:col-span-4 lg:row-span-2",
                feature.size === 'wide' && "col-span-12 lg:col-span-8"
              )}
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-700 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Icon name={feature.icon} className="text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 mb-6">{feature.desc}</p>
              
              {feature.image && (
                <div className="mt-auto h-48 rounded-2xl overflow-hidden border border-slate-700">
                  <img src={feature.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="Preview" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};