import { SectionHeading } from '@/components/section-heading';
import barangaySummary from '../../assets/barangay_summary.json';

interface BarangaySummary {
  rank: number;
  category: string;
  population: number;
  facilities: number;
  facilities_per_10k: number;
}

const SUMMARY = barangaySummary as BarangaySummary[];

// Real metrics derived from the barangay dataset at module load.
const totalPopulation = SUMMARY.reduce((acc, b) => acc + (b.population ?? 0), 0);
const veryLowPopulation = SUMMARY
  .filter((b) => b.category === 'Very Low Access')
  .reduce((acc, b) => acc + (b.population ?? 0), 0);
const veryLowShare = Math.round((veryLowPopulation / totalPopulation) * 100);
const noFacilityShare = Math.round(
  (SUMMARY.filter((b) => b.facilities === 0).length / SUMMARY.length) * 100
);
const perTenK = SUMMARY.map((b) => b.facilities_per_10k ?? 0).sort((a, b) => a - b);
const medianPer10k = perTenK[Math.floor(perTenK.length / 2)].toFixed(1);

const METRICS = [
  { value: SUMMARY.length.toLocaleString(), unit: '', label: 'barangays ranked by accessibility' },
  { value: String(veryLowShare), unit: '%', label: 'of the population lives in very-low-access areas' },
  { value: String(noFacilityShare), unit: '%', label: 'of barangays have no facility of their own' },
  { value: medianPer10k, unit: '/10k', label: 'median facilities per 10,000 residents' },
];

export const Analysis = () => (
  <section id="analysis" className="bg-muted/40 py-28">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading index="03" label="About the data">
            Public data, <em className="text-amber-600 dark:text-amber-200/90">transparent method.</em>
          </SectionHeading>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Every barangay is scored on healthcare accessibility and ranked as a percentile
            (0–100) across the province, then grouped into five equal access levels. No
            black-box models — the same numbers behind every chart and map view on this page.
          </p>
          <p className="mt-6 text-sm leading-6 text-muted-foreground/80">
            Population: PSA 2020 Census of Population and Housing, joined per barangay via
            PSGC codes. Facility counts: DOH records. Mapped facility locations:
            OpenStreetMap contributors. Boundaries: PSA administrative boundaries.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-10">
          {METRICS.map((m) => (
            <div key={m.label} className="border-t border-foreground/15 pt-5">
              <p className="font-mono text-4xl text-foreground">
                {m.value}
                <span className="text-xl text-muted-foreground">{m.unit}</span>
              </p>
              <p className="mt-2 text-sm leading-5 text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
