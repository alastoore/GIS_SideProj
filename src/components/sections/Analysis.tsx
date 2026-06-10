const METRICS = [
  { value: '92', unit: '/100', label: 'Coverage score' },
  { value: '18', unit: 'min', label: 'Avg. travel time' },
  { value: '4.8', unit: '/5', label: 'Facility readiness' },
  { value: '80', unit: '%', label: 'At-risk zone visibility' },
];

export const Analysis = () => (
  <section id="analysis" className="bg-[#07101f] py-28">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
            Accessibility analytics
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Insights that help planners act faster.
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-400">
            Compare coverage across municipalities, surface resource gaps, and model what-if scenarios with transparent scores — not black-box outputs.
          </p>
          <div className="mt-8 h-px w-16 bg-cyan-500/40" />
          <p className="mt-6 text-sm text-slate-500">
            Data sourced from DOH and PSA. Updated quarterly.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {METRICS.map((m) => (
            <div
              key={m.label}
              className="rounded-3xl border border-white/8 bg-[#060c18] p-6 transition hover:border-cyan-500/20"
            >
              <p className="font-mono text-4xl font-semibold text-white">
                {m.value}
                <span className="text-xl text-slate-500">{m.unit}</span>
              </p>
              <p className="mt-3 text-sm text-slate-500">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);