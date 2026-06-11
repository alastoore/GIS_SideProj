import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  CATEGORY_COLORS,
  CATEGORY_ORDER,
  FACILITY_COLORS,
} from '@/lib/map-constants';
import { SectionHeading } from '@/components/section-heading';
import barangaySummary from '../../assets/barangay_summary.json';
import facilityTypeCounts from '../../assets/facility_type_counts.json';

interface BarangaySummary {
  name: string;
  municipality: string | null;
  rank: number;
  category: string;
  population: number;
  facilities: number;
}

const SUMMARY = barangaySummary as BarangaySummary[];

// --- Population by access level ---
const categoryData = CATEGORY_ORDER.map((cat) => {
  const rows = SUMMARY.filter((b) => b.category === cat);
  return {
    category: cat.replace(' Access', ''),
    population: rows.reduce((a, b) => a + (b.population ?? 0), 0),
    barangays: rows.length,
    fill: CATEGORY_COLORS[cat],
  };
});

// --- Facility type breakdown (OSM markers) ---
const facilityData = Object.entries(facilityTypeCounts as Record<string, number>)
  .map(([type, count]) => ({ type, count, fill: FACILITY_COLORS[type] ?? '#94a3b8' }))
  .sort((a, b) => b.count - a.count);

// --- Lowest average access rank by municipality ---
const muniMap = new Map<string, { rankSum: number; n: number; population: number }>();
for (const b of SUMMARY) {
  if (!b.municipality) continue;
  const m = muniMap.get(b.municipality) ?? { rankSum: 0, n: 0, population: 0 };
  m.rankSum += b.rank;
  m.n += 1;
  m.population += b.population ?? 0;
  muniMap.set(b.municipality, m);
}
const muniData = [...muniMap.entries()]
  .map(([name, m]) => ({
    name,
    avgRank: Number((m.rankSum / m.n).toFixed(1)),
    population: m.population,
  }))
  .sort((a, b) => a.avgRank - b.avgRank)
  .slice(0, 10);

const compact = new Intl.NumberFormat('en', { notation: 'compact' });

const categoryChartConfig = {
  population: { label: 'Population' },
} satisfies ChartConfig;

const facilityChartConfig = Object.fromEntries(
  facilityData.map((f) => [f.type, { label: f.type, color: f.fill }])
) satisfies ChartConfig;

const muniChartConfig = {
  avgRank: { label: 'Avg. access rank' },
} satisfies ChartConfig;

export const Dashboard = () => (
  <section id="dashboard" className="bg-[#060c18] py-28">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <SectionHeading index="01" label="Analytics">
          The access gap, <em className="text-amber-200/90">in numbers.</em>
        </SectionHeading>
        <p className="mt-4 max-w-xl text-lg text-slate-400">
          Computed live from the same dataset behind the map — PSA 2020 census population and
          per-barangay accessibility percentiles.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl bg-[#0a1628]/40 ring-white/6">
          <CardHeader>
            <CardTitle>Population by access level</CardTitle>
            <CardDescription>2020 census population per accessibility quintile</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={categoryChartConfig} className="h-64 w-full">
              <BarChart data={categoryData} margin={{ top: 16 }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(v) => compact.format(v)}
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="population" radius={[6, 6, 0, 0]}>
                  {categoryData.map((d) => (
                    <Cell key={d.category} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-[#0a1628]/40 ring-white/6">
          <CardHeader>
            <CardTitle>Mapped facilities by type</CardTitle>
            <CardDescription>Geocoded markers from OpenStreetMap</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={facilityChartConfig} className="h-64 w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="type" />} />
                <Pie
                  data={facilityData}
                  dataKey="count"
                  nameKey="type"
                  innerRadius={50}
                  strokeWidth={2}
                  stroke="#0a1628"
                />
                <ChartLegend content={<ChartLegendContent nameKey="type" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-[#0a1628]/40 ring-white/6">
          <CardHeader>
            <CardTitle>Most underserved municipalities</CardTitle>
            <CardDescription>Lowest average barangay access rank (0–100)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={muniChartConfig} className="h-64 w-full">
              <BarChart data={muniData} layout="vertical" margin={{ left: 8, right: 28 }}>
                <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  width={104}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="avgRank" fill="#f97316" radius={4}>
                  <LabelList
                    dataKey="avgRank"
                    position="right"
                    className="fill-slate-400"
                    fontSize={11}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
);
