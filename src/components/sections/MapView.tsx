import { useRef, useCallback, useState, useMemo } from 'react';
import Map, { Source, Layer, Marker, Popup } from 'react-map-gl/mapbox';
import type { MapMouseEvent, MapRef } from 'react-map-gl/mapbox';
import type { FeatureCollection, Point } from 'geojson';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  CirclePlus,
  Loader2,
  Search,
  Timer,
  X,
} from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CATEGORY_COLORS,
  CATEGORY_STYLES,
  FACILITY_COLORS,
  FACILITY_TYPES,
} from '@/lib/map-constants';
import { pointInFeature } from '@/lib/geo';
import { SectionHeading } from '@/components/section-heading';
import geojsonData from '../../assets/cebu_health_accessibility.geojson';
import facilitiesData from '../../assets/cebu_health_facilities.geojson';
import barangaySummary from '../../assets/barangay_summary.json';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const MAPBOX_STYLE = import.meta.env.VITE_MAPBOX_STYLE ?? 'mapbox://styles/mapbox/standard';
const MAPBOX_TOKEN_MISSING = !MAPBOX_TOKEN;

if (MAPBOX_TOKEN_MISSING) {
  console.warn(
    'Missing Mapbox token: add VITE_MAPBOX_TOKEN to a local .env file and restart the Vite dev server.'
  );
}

interface BarangayProps {
  adm4_name: string;
  population: number;
  facilities: number;
  facilities_per_10k: number;
  access_rank: number;
  access_category: string;
}

interface BarangaySummary {
  id: number;
  name: string;
  municipality: string | null;
  rank: number;
  category: string;
  population: number;
  facilities: number;
  facilities_per_10k: number;
  centroid: [number, number];
}

type SortKey = 'rank' | 'name' | 'municipality' | 'population' | 'facilities';
const PAGE_SIZE = 15;

// Drive-time contour colors (cool hues, distinct from the choropleth).
const ISO_COLORS: Record<number, string> = {
  15: '#22d3ee',
  30: '#3b82f6',
  60: '#8b5cf6',
};

interface IsoState {
  kind: 'facility' | 'placement';
  label: string;
  point: [number, number];
  data: FeatureCollection;
  minutes: number[];
  stats?: {
    barangays: number;
    population: number;
    veryLow: number;
    veryLowPop: number;
  };
}

async function fetchIsochrone(
  lng: number,
  lat: number,
  minutes: number[]
): Promise<FeatureCollection> {
  const url =
    `https://api.mapbox.com/isochrone/v1/mapbox/driving/${lng},${lat}` +
    `?contours_minutes=${minutes.join(',')}&polygons=true&denoise=1&access_token=${MAPBOX_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Isochrone request failed: ${res.status}`);
  return res.json();
}

const isoFillLayer: any = {
  id: 'iso-fill',
  type: 'fill' as const,
  slot: 'middle',
  paint: {
    'fill-color': [
      'match', ['get', 'contour'],
      15, ISO_COLORS[15],
      30, ISO_COLORS[30],
      60, ISO_COLORS[60],
      '#3b82f6',
    ],
    'fill-opacity': 0.18,
  },
};

const isoLineLayer: any = {
  id: 'iso-line',
  type: 'line' as const,
  slot: 'middle',
  paint: {
    'line-color': [
      'match', ['get', 'contour'],
      15, ISO_COLORS[15],
      30, ISO_COLORS[30],
      60, ISO_COLORS[60],
      '#3b82f6',
    ],
    'line-width': 1.5,
    'line-dasharray': [2, 1],
  },
};

const SUMMARY = barangaySummary as BarangaySummary[];

interface PopupInfo {
  longitude: number;
  latitude: number;
  properties: BarangayProps;
}

// Flat choropleth — color driven by access_rank percentile (0-100), with
// hover/click highlight colors via feature-state.
const fillLayer: any = {
  id: 'barangay-fill',
  type: 'fill' as const,
  slot: 'middle',
  paint: {
    'fill-color': [
      'case',
      ['boolean', ['feature-state', 'clicked'], false],
      '#f0abfc', // selected: pink/violet highlight
      ['boolean', ['feature-state', 'hover'], false],
      '#22d3ee', // hovered: cyan highlight
      [
        'interpolate',
        ['linear'],
        ['get', 'access_rank'],
        0,   '#dc2626',
        25,  '#f97316',
        50,  '#facc15',
        75,  '#84cc16',
        100, '#22c55e',
      ],
    ],
    // Semi-transparent so the basemap (roads, labels, terrain) shows through.
    'fill-opacity': 0.45,
  },
};

const strokeLayer: any = {
  id: 'barangay-stroke',
  type: 'line' as const,
  slot: 'middle',
  paint: {
    'line-color': [
      'case',
      ['boolean', ['feature-state', 'clicked'], false],
      '#f0abfc',
      [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        '#22d3ee',
        'rgba(255,255,255,0.45)',
      ],
    ],
    'line-width': [
      'case',
      ['boolean', ['feature-state', 'clicked'], false],
      3,
      [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        2.5,
        1,
      ],
    ],
  },
};

const facilityCircleLayer: any = {
  id: 'facility-circles',
  type: 'circle' as const,
  slot: 'top',
  paint: {
    'circle-color': [
      'match',
      ['get', 'type'],
      'Hospital', FACILITY_COLORS.Hospital,
      'Clinic', FACILITY_COLORS.Clinic,
      'Health Center', FACILITY_COLORS['Health Center'],
      'Birthing Center', FACILITY_COLORS['Birthing Center'],
      '#94a3b8',
    ],
    'circle-radius': [
      'interpolate', ['linear'], ['zoom'],
      8, 3,
      11, 5,
      14, 8,
    ],
    'circle-stroke-color': [
      'match',
      ['get', 'type'],
      'Health Center', '#0f172a', // white dots need a dark ring
      '#ffffff',
    ],
    'circle-stroke-width': 1,
    'circle-opacity': 0.9,
  },
};

const facilityLabelLayer: any = {
  id: 'facility-labels',
  type: 'symbol' as const,
  slot: 'top',
  minzoom: 10.5, // labels only once zoomed in enough to read them
  layout: {
    'text-field': [
      'case',
      ['==', ['get', 'name'], ''],
      ['get', 'type'],
      ['concat', ['get', 'name'], '\n', ['get', 'type']],
    ],
    'text-size': 11,
    'text-anchor': 'top' as const,
    'text-offset': [0, 0.8],
    'text-optional': true,
  },
  paint: {
    'text-color': '#ffffff',
    'text-halo-color': 'rgba(0,0,0,0.7)',
    'text-halo-width': 1.2,
  },
};

export const MapView = () => {
  const mapRef = useRef<MapRef>(null);
  const hoveredId = useRef<string | number | null>(null);
  const clickedId = useRef<string | number | null>(null);
  const [popup, setPopup] = useState<PopupInfo | null>(null);
  const [pinnedPopup, setPinnedPopup] = useState<PopupInfo | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTypes, setActiveTypes] = useState<string[]>(FACILITY_TYPES);
  const [placementMode, setPlacementMode] = useState(false);
  const [isoState, setIsoState] = useState<IsoState | null>(null);
  const [isoLoading, setIsoLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [page, setPage] = useState(0);
  const [tableQuery, setTableQuery] = useState('');

  const sortedRows = useMemo(() => {
    const q = tableQuery.trim().toLowerCase();
    const rows = q
      ? SUMMARY.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            (b.municipality ?? '').toLowerCase().includes(q)
        )
      : SUMMARY;
    return [...rows].sort((a, b) => {
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      const cmp =
        typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb));
      return cmp * sortDir;
    });
  }, [sortKey, sortDir, tableQuery]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const pageRows = sortedRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(1);
    }
    setPage(0);
  };

  const facilityFilter = useMemo(
    () => ['in', ['get', 'type'], ['literal', activeTypes]] as any,
    [activeTypes]
  );

  const toggleType = (type: string) => {
    setActiveTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearClicked = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map && clickedId.current !== null) {
      map.setFeatureState(
        { source: 'barangays', id: clickedId.current },
        { clicked: false }
      );
    }
    clickedId.current = null;
  }, []);

  // Shared by the search box and the ranking table: fly to a barangay,
  // highlight it, and pin its detail popup.
  const selectBarangay = useCallback((b: BarangaySummary) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    clearClicked();
    clickedId.current = b.id;
    map.setFeatureState({ source: 'barangays', id: b.id }, { clicked: true });

    setPinnedPopup({
      longitude: b.centroid[0],
      latitude: b.centroid[1],
      properties: {
        adm4_name: b.name,
        population: b.population,
        facilities: b.facilities,
        facilities_per_10k: b.facilities_per_10k,
        access_rank: b.rank,
        access_category: b.category,
      },
    });
    setPopup(null);

    map.flyTo({ center: b.centroid, zoom: 11, duration: 1800 });
    document.querySelector('#map')?.scrollIntoView({ behavior: 'smooth' });
  }, [clearClicked]);

  const onMouseMove = useCallback((e: MapMouseEvent) => {
    const map = mapRef.current?.getMap();
    const feature = e.features?.find((f) => f.layer?.id === 'barangay-fill');
    if (!map || !feature) return;

    if (hoveredId.current !== null) {
      map.setFeatureState(
        { source: 'barangays', id: hoveredId.current },
        { hover: false }
      );
    }

    hoveredId.current = feature.id ?? null;

    if (hoveredId.current !== null) {
      map.setFeatureState(
        { source: 'barangays', id: hoveredId.current },
        { hover: true }
      );
    }

    // Only show hover popup if nothing is clicked
    if (clickedId.current === null) {
      setPopup({
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
        properties: feature.properties as BarangayProps,
      });
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map && hoveredId.current !== null) {
      map.setFeatureState(
        { source: 'barangays', id: hoveredId.current },
        { hover: false }
      );
    }
    hoveredId.current = null;
    if (clickedId.current === null) setPopup(null);
  }, []);

  // Barangays whose centroid falls inside any isochrone contour.
  const computeCoverage = (iso: FeatureCollection): IsoState['stats'] => {
    let barangays = 0, population = 0, veryLow = 0, veryLowPop = 0;
    for (const b of SUMMARY) {
      const inside = iso.features.some((f) => pointInFeature(b.centroid, f.geometry));
      if (!inside) continue;
      barangays += 1;
      population += b.population ?? 0;
      if (b.category === 'Very Low Access') {
        veryLow += 1;
        veryLowPop += b.population ?? 0;
      }
    }
    return { barangays, population, veryLow, veryLowPop };
  };

  const onClick = useCallback(async (e: MapMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map || MAPBOX_TOKEN_MISSING) return;

    // What-if mode: any click tests a hypothetical facility location.
    if (placementMode) {
      const { lng, lat } = e.lngLat;
      setIsoLoading(true);
      try {
        const iso = await fetchIsochrone(lng, lat, [30]);
        setIsoState({
          kind: 'placement',
          label: 'Hypothetical facility',
          point: [lng, lat],
          data: iso,
          minutes: [30],
          stats: computeCoverage(iso),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsoLoading(false);
      }
      return;
    }

    // Clicking a facility marker shows its drive-time coverage.
    const facility = e.features?.find((f) => f.layer?.id === 'facility-circles');
    if (facility) {
      const [lng, lat] = (facility.geometry as Point).coordinates;
      const label =
        (facility.properties?.name as string) || (facility.properties?.type as string);
      setIsoLoading(true);
      try {
        const iso = await fetchIsochrone(lng, lat, [15, 30, 60]);
        setIsoState({
          kind: 'facility',
          label,
          point: [lng, lat],
          data: iso,
          minutes: [15, 30, 60],
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsoLoading(false);
      }
      return;
    }

    clearClicked();

    const feature = e.features?.find((f) => f.layer?.id === 'barangay-fill');
    if (!feature) {
      setPinnedPopup(null);
      setPopup(null);
      return;
    }

    clickedId.current = feature.id ?? null;

    if (clickedId.current !== null) {
      map.setFeatureState(
        { source: 'barangays', id: clickedId.current },
        { clicked: true }
      );
    }

    setPinnedPopup({
      longitude: e.lngLat.lng,
      latitude: e.lngLat.lat,
      properties: feature.properties as BarangayProps,
    });
    setPopup(null);
  }, [clearClicked, placementMode]);

  const onLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Mapbox Standard ships its own 3D buildings and landmarks;
    // configure the basemap instead of adding a custom building layer.
    map.setConfigProperty('basemap', 'lightPreset', 'dusk');
    map.setConfigProperty('basemap', 'show3dObjects', true);
  }, []);

  const activePopup = pinnedPopup ?? popup;

  return (
    <section id="map" className="bg-[#060c18] py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <SectionHeading index="02" label="Coverage map">
            Every barangay, <em className="text-amber-200/90">on the map.</em>
          </SectionHeading>
          <p className="mt-4 max-w-xl text-lg text-slate-400">
            Barangays colored by accessibility percentile, with healthcare facility markers.
            Click a barangay to pin details, a facility for its drive-time reach — or test a
            new location with what-if placement.
          </p>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={searchOpen}
                className="w-64 justify-between text-slate-400"
              >
                <span className="flex items-center gap-2">
                  <Search className="size-3.5" />
                  Search barangay…
                </span>
                <ChevronsUpDown className="size-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
              <Command>
                <CommandInput placeholder="Type a barangay name…" />
                <CommandList>
                  <CommandEmpty>No barangay found.</CommandEmpty>
                  <CommandGroup>
                    {SUMMARY.map((b) => (
                      <CommandItem
                        key={b.id}
                        value={`${b.name}-${b.id}`}
                        keywords={[b.name, b.municipality ?? '']}
                        onSelect={() => {
                          setSearchOpen(false);
                          selectBarangay(b);
                        }}
                      >
                        <span className="truncate">{b.name}</span>
                        <span className="ml-auto truncate pl-2 text-right text-xs text-muted-foreground">
                          {b.municipality}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button
            variant={placementMode ? 'default' : 'outline'}
            onClick={() => setPlacementMode((p) => !p)}
          >
            <CirclePlus className="size-3.5" />
            What-if placement
          </Button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Lower access</span>
            <div
              className="h-2 w-40 rounded-full"
              style={{ background: 'linear-gradient(to right, #dc2626, #facc15, #22c55e)' }}
            />
            <span className="text-xs text-slate-500">Higher access</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {FACILITY_TYPES.map((label) => {
              const active = activeTypes.includes(label);
              return (
                <Badge
                  key={label}
                  asChild
                  variant="outline"
                  className={
                    active
                      ? 'cursor-pointer gap-1.5 border-white/15 text-slate-300'
                      : 'cursor-pointer gap-1.5 border-white/5 text-slate-600 opacity-50'
                  }
                >
                  <button type="button" onClick={() => toggleType(label)} aria-pressed={active}>
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full border border-white/40"
                      style={{ backgroundColor: active ? FACILITY_COLORS[label] : 'transparent' }}
                    />
                    {label}
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>

        <div
          className="relative overflow-hidden rounded-3xl border border-white/8"
          style={{ height: '560px' }}
        >
            <Map
              ref={mapRef}
              initialViewState={{
                longitude: 124.0,
                latitude: 10.35,
                zoom: 8.5,
                pitch: 60,
                bearing: -10,
              }}
              style={{ width: '100%', height: '100%' }}
              mapStyle={MAPBOX_STYLE}
              mapboxAccessToken={MAPBOX_TOKEN}
              interactiveLayerIds={['barangay-fill', 'facility-circles']}
              cursor={placementMode ? 'crosshair' : undefined}
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
              onClick={onClick}
              onLoad={onLoad}
            >
            <Source
              id="barangays"
              type="geojson"
              data={geojsonData as FeatureCollection}
              generateId
            >
              <Layer {...fillLayer} />
              <Layer {...strokeLayer} />
            </Source>

            <Source id="facilities" type="geojson" data={facilitiesData as FeatureCollection}>
              <Layer {...facilityCircleLayer} filter={facilityFilter} />
              <Layer {...facilityLabelLayer} filter={facilityFilter} />
            </Source>

            {isoState && (
              <Source id="isochrone" type="geojson" data={isoState.data}>
                <Layer {...isoFillLayer} />
                <Layer {...isoLineLayer} />
              </Source>
            )}

            {isoState?.kind === 'placement' && (
              <Marker longitude={isoState.point[0]} latitude={isoState.point[1]} anchor="center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-cyan-500 shadow-lg shadow-cyan-500/40">
                  <CirclePlus className="h-4 w-4 text-slate-950" />
                </div>
              </Marker>
            )}

            {activePopup && (
              <Popup
                longitude={activePopup.longitude}
                latitude={activePopup.latitude}
                closeButton={pinnedPopup !== null}
                closeOnClick={false}
                anchor="bottom"
                offset={12}
                onClose={() => {
                  clearClicked();
                  setPinnedPopup(null);
                }}
              >
                <Card size="sm" className="min-w-44 rounded-xl bg-[#0a1628] shadow-xl ring-white/10">
                  <CardContent>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">
                        {activePopup.properties.adm4_name}
                      </p>
                      {pinnedPopup && (
                        <Badge className="bg-fuchsia-500/15 text-[10px] font-semibold uppercase tracking-widest text-fuchsia-300">
                          Selected
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-slate-400">
                      <p>
                        Access rank:{' '}
                        <span className="font-mono text-cyan-400">
                          {Math.round(activePopup.properties.access_rank)}/100
                        </span>
                      </p>
                      <p>
                        Population:{' '}
                        <span className="font-mono text-white">
                          {(activePopup.properties.population ?? 0).toLocaleString()}
                        </span>
                      </p>
                      <p>
                        Facilities:{' '}
                        <span className="font-mono text-white">
                          {activePopup.properties.facilities ?? 0}
                        </span>
                      </p>
                      <p>
                        Per 10k:{' '}
                        <span className="font-mono text-white">
                          {activePopup.properties.facilities_per_10k > 0
                            ? activePopup.properties.facilities_per_10k.toFixed(2)
                            : '0'}
                        </span>
                      </p>
                      <div className="flex items-center gap-1.5">
                        Category:{' '}
                        <Badge
                          variant="outline"
                          className={CATEGORY_STYLES[activePopup.properties.access_category] ?? 'border-white/15 text-slate-400'}
                        >
                          {activePopup.properties.access_category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Popup>
            )}
          </Map>

          {/* Overlay: hint, loading, and isochrone result cards */}
          {placementMode && !isoState && !isoLoading && (
            <Card size="sm" className="absolute left-4 top-4 z-10 bg-[#0a1628]/90 ring-white/10 backdrop-blur">
              <CardContent className="text-xs text-slate-300">
                Click anywhere on the map to test a facility location.
              </CardContent>
            </Card>
          )}

          {isoLoading && (
            <Card size="sm" className="absolute left-4 top-4 z-10 bg-[#0a1628]/90 ring-white/10 backdrop-blur">
              <CardContent className="flex items-center gap-2 text-xs text-slate-300">
                <Loader2 className="size-3.5 animate-spin text-cyan-400" />
                Calculating drive times…
              </CardContent>
            </Card>
          )}

          {isoState && !isoLoading && (
            <Card size="sm" className="absolute left-4 top-4 z-10 max-w-72 bg-[#0a1628]/90 ring-white/10 backdrop-blur">
              <CardContent>
                <div className="flex items-start justify-between gap-3">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <Timer className="size-3.5 shrink-0 text-cyan-400" />
                    {isoState.label}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Clear drive-time overlay"
                    onClick={() => setIsoState(null)}
                  >
                    <X />
                  </Button>
                </div>

                {isoState.kind === 'facility' ? (
                  <div className="mt-2 space-y-1.5 text-xs text-slate-400">
                    <p>Drive-time coverage from this facility:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {isoState.minutes.map((m) => (
                        <Badge
                          key={m}
                          variant="outline"
                          className="gap-1.5 border-white/10 text-slate-300"
                        >
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: ISO_COLORS[m] }}
                          />
                          {m} min
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  isoState.stats && (
                    <div className="mt-2 space-y-1 text-xs text-slate-400">
                      <p>
                        Within a 30-minute drive:{' '}
                        <span className="font-mono text-white">
                          {isoState.stats.barangays}
                        </span>{' '}
                        barangays,{' '}
                        <span className="font-mono text-white">
                          {isoState.stats.population.toLocaleString()}
                        </span>{' '}
                        residents.
                      </p>
                      <p>
                        Including{' '}
                        <span className="font-mono text-red-400">{isoState.stats.veryLow}</span>{' '}
                        very-low-access barangays (
                        <span className="font-mono text-red-400">
                          {isoState.stats.veryLowPop.toLocaleString()}
                        </span>{' '}
                        residents) that would gain coverage.
                      </p>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="mt-8 rounded-2xl bg-[#0a1628]/40 ring-white/6">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="font-display text-xl">Barangay explorer</CardTitle>
            <CardDescription className="text-slate-400">
              Search, sort, and click any of the {SUMMARY.length.toLocaleString()} barangays to
              locate it on the map.
            </CardDescription>
            <div className="relative mt-3 max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
              <Input
                value={tableQuery}
                onChange={(e) => {
                  setTableQuery(e.target.value);
                  setPage(0);
                }}
                placeholder="Filter by barangay or municipality…"
                aria-label="Filter barangays by name or municipality"
                className="h-9 border-white/10 bg-white/5 pl-9 text-sm placeholder:text-slate-600"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/8 hover:bg-transparent">
                  {(
                    [
                      ['name', 'Barangay', 'text-left'],
                      ['municipality', 'Municipality', 'text-left'],
                      ['rank', 'Access rank', 'text-right'],
                      [null, 'Category', 'text-left'],
                      ['population', 'Population', 'text-right'],
                      ['facilities', 'Facilities', 'text-right'],
                    ] as [SortKey | null, string, string][]
                  ).map(([key, label, align]) => (
                    <TableHead
                      key={label}
                      className={`text-xs uppercase tracking-wider text-slate-400 ${align}`}
                      aria-sort={
                        key === sortKey
                          ? sortDir === 1
                            ? 'ascending'
                            : 'descending'
                          : undefined
                      }
                    >
                      {key ? (
                        <button
                          type="button"
                          aria-label={`Sort by ${label.toLowerCase()}`}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/60"
                          onClick={() => toggleSort(key)}
                        >
                          {label}
                          {sortKey === key ? (
                            sortDir === 1 ? (
                              <ChevronUp className="size-3.5 text-cyan-400" />
                            ) : (
                              <ChevronDown className="size-3.5 text-cyan-400" />
                            )
                          ) : (
                            <ArrowUpDown className="size-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        label
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.length === 0 && (
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                      No barangay matches “{tableQuery}” — try a different spelling.
                    </TableCell>
                  </TableRow>
                )}
                {pageRows.map((b) => (
                  <TableRow
                    key={b.id}
                    tabIndex={0}
                    aria-label={`Show ${b.name}, ${b.municipality ?? 'Cebu'} on the map`}
                    className="cursor-pointer border-white/5 odd:bg-white/[0.02] hover:bg-cyan-500/5 focus-visible:bg-cyan-500/5 focus-visible:outline-none"
                    onClick={() => selectBarangay(b)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectBarangay(b);
                      }
                    }}
                  >
                    <TableCell className="font-medium text-foreground">{b.name}</TableCell>
                    <TableCell className="text-slate-400">{b.municipality}</TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center justify-end gap-2.5">
                        <span className="font-mono text-foreground">{b.rank.toFixed(1)}</span>
                        <span
                          className="h-1.5 w-14 overflow-hidden rounded-full bg-white/10"
                          aria-hidden="true"
                        >
                          <span
                            className="block h-full rounded-full"
                            style={{
                              width: `${Math.max(3, b.rank)}%`,
                              backgroundColor: CATEGORY_COLORS[b.category] ?? '#64748b',
                            }}
                          />
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={CATEGORY_STYLES[b.category] ?? 'border-white/15 text-slate-400'}
                      >
                        {b.category.replace(' Access', '')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-slate-300">
                      {b.population.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-slate-300">
                      {b.facilities}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                {sortedRows.length === 0
                  ? 'No matches'
                  : `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, sortedRows.length)} of ${sortedRows.length.toLocaleString()}`}
                {tableQuery.trim() && sortedRows.length > 0 && ' matching barangays'}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Previous page"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft /> Prev
                </Button>
                <span className="font-mono text-xs text-slate-400">
                  {page + 1} / {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Next page"
                  disabled={page >= pageCount - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
