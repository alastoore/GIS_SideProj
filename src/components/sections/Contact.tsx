import { Button } from '../ui/Button';

export const Contact = () => (
  <section id="contact" className="bg-[#07101f] py-28">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
            Get in touch
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Talk to our GIS planning team.
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
            Share your coverage goals and we'll show you how to combine spatial data with facility planning to deliver measurable improvements in access.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-white/8 bg-[#060c18] p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Email</p>
            <p className="mt-2 font-mono text-base text-white">hello@healthaccess.ai</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-[#060c18] p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Office</p>
            <p className="mt-2 font-mono text-base text-white">Manila, Philippines</p>
          </div>
          <div className="rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Speak with sales
            </p>
            <p className="mt-2 mb-4 text-sm text-slate-400">
              30-minute walkthrough, no commitment.
            </p>
            <Button
              className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              size="md"
            >
              Book a demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
);