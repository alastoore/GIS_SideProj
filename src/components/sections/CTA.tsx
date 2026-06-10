import { Button } from '../ui/Button';

export const CTA = () => (
  <section className="bg-[#060c18] py-28">
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/15 bg-[#07101f] px-8 py-16 text-center sm:px-16">
        {/* Subtle glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-3xl" />

        <p className="relative text-xs font-semibold uppercase tracking-widest text-cyan-400">
          Ready to close coverage gaps?
        </p>
        <h2 className="relative mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Better facility decisions start with better data.
        </h2>
        <p className="relative mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-400">
          See how live GIS analytics and placement modeling can sharpen your next site strategy — in a 30-minute demo.
        </p>

        <div className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400"
          >
            Request a demo
          </Button>
          <Button variant="outline" size="lg" className="border-white/10 text-slate-200 hover:bg-white/5">
            Contact sales
          </Button>
        </div>
      </div>
    </div>
  </section>
);