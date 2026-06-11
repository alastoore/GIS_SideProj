import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import barangaySummary from '../../assets/barangay_summary.json';

interface BarangaySummary {
  municipality: string | null;
  population: number;
  facilities: number;
}

const SUMMARY = barangaySummary as BarangaySummary[];

const totalPopulation = SUMMARY.reduce((a, b) => a + (b.population ?? 0), 0);
const totalFacilities = SUMMARY.reduce((a, b) => a + b.facilities, 0);
const municipalities = new Set(SUMMARY.map((b) => b.municipality).filter(Boolean)).size;

const STATS = [
  {
    value: `${(totalPopulation / 1e6).toFixed(1)}M`,
    label: 'residents covered — PSA 2020 census',
  },
  { value: String(municipalities), label: 'cities & municipalities across Cebu' },
  { value: totalFacilities.toLocaleString(), label: 'health facilities on record — DOH' },
];

export const Hero = () => {
  const scrollTo = (selector: string) =>
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div id="top" className="relative overflow-hidden bg-background px-4 pt-44 pb-28 sm:px-6 lg:px-8">
      {/* Soft glow behind the headline */}
      <div className="pointer-events-none absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/8 blur-[80px]" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center text-center">
        <p className="font-mono text-xs tracking-widest text-muted-foreground">
          Cebu, Philippines · 1,203 barangays · updated June 2026
        </p>

        <h1 className="font-display mt-8 max-w-4xl text-5xl font-medium leading-[1.08] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          See where healthcare access{' '}
          <em className="text-amber-600 dark:text-amber-200/90">falls short</em>{' '}
          in Cebu.
        </h1>

        <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
          An open GIS atlas that ranks every barangay in the province by healthcare
          accessibility — made to help local government units see underserved communities
          and decide where the next health facility matters most.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            className="h-12 px-7 text-base shadow-lg shadow-cyan-500/20"
            onClick={() => scrollTo('#dashboard')}
          >
            View the analytics
            <ArrowDown className="size-4" />
          </Button>
          <Button
            variant="link"
            size="lg"
            className="h-12 text-base text-foreground/80"
            onClick={() => scrollTo('#map')}
          >
            or jump straight to the map →
          </Button>
        </div>

        <div className="mt-20 flex w-full max-w-3xl flex-col gap-8 sm:flex-row sm:gap-0">
          {STATS.map((item, i) => (
            <div
              key={item.label}
              className={
                i === 0
                  ? 'text-center sm:flex-1 sm:pr-8'
                  : 'text-center sm:flex-1 sm:border-l sm:border-border sm:px-8'
              }
            >
              <p className="font-mono text-4xl text-foreground">{item.value}</p>
              <p className="mt-2 text-sm leading-5 text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
