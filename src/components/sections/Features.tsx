import { Icon } from '../ui/Icon';

const FEATURES = [
  {
    id: 'gis',
    title: 'Interactive GIS mapping',
    desc: 'Overlay population density, transport routes, and facility catchment areas on a live map — updated as conditions change.',
    icon: 'layers',
  },
  {
    id: 'heatmaps',
    title: 'Accessibility heatmaps',
    desc: 'Color-coded risk zones reveal which communities are farthest from care and by how much, down to the barangay level.',
    icon: 'heat_map',
  },
  {
    id: 'recommendation',
    title: 'Placement engine',
    desc: 'Model the impact of new facilities before committing resources, ranked by projected coverage improvement and equity gain.',
    icon: 'auto_awesome',
  },
];

export const Features = () => (
  <section id="features" className="bg-[#060c18] py-28">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="mb-16 max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
          Core capabilities
        </p>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Built for planners who need to act, not just analyze.
        </h2>
      </div>

      <div className="grid gap-px rounded-3xl border border-white/8 bg-white/8 overflow-hidden sm:grid-cols-3">
        {FEATURES.map((f, i) => (
          <div
            key={f.id}
            className="group flex flex-col gap-6 bg-[#060c18] p-8 transition-colors hover:bg-[#0a1628]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
                <Icon name={f.icon} className="text-xl" />
              </div>
              <span className="font-mono text-xs text-slate-600">0{i + 1}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);