import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

export const Hero = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060c18] px-4 pt-32 pb-24 sm:px-6 lg:px-8">
      {/* Animated map grid — the signature element */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-grid-drift absolute inset-[-80px] opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34,211,238,0.6) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34,211,238,0.6) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Radial fade over grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_40%,#060c18_100%)]" />
      </div>

      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/8 blur-[80px]" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
          <Icon name="location_on" className="text-sm text-cyan-400" />
          Spatial healthcare intelligence
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl lg:leading-[1.05]">
          Map care gaps.<br />
          <span className="text-cyan-400">Place facilities</span> where<br />
          they matter most.
        </h1>

        <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
          HealthAccess combines live GIS data, accessibility scoring, and predictive placement models so health planners can close coverage gaps with confidence.
        </p>

        <div className="flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400"
            onClick={() => document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore features
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-white/10 text-slate-200 hover:bg-white/5"
            onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Contact sales
          </Button>
        </div>

        <div className="mt-4 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          {[
            { label: 'Live coverage maps', value: '24/7' },
            { label: 'Placement prediction accuracy', value: '98%' },
            { label: 'Faster site selection', value: '40%↓' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/8 bg-white/3 px-6 py-5 text-left backdrop-blur-sm"
            >
              <p className="font-mono text-3xl font-semibold text-white">{item.value}</p>
              <p className="mt-2 text-sm text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};