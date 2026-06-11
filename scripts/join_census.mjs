// Replaces the corrupted `population` field in the barangay geojson with
// official PSA 2020 census counts (POPCEN 2020 via the PSGC publication
// datafile, mirrored at github.com/rguj/psgc-dif → data/psgc.csv).
//
// Join strategy: the geojson has no PSGC codes and barangay names repeat
// across municipalities, so we match each barangay polygon spatially
// (point-in-polygon of its bbox center) against PSA reference boundaries
// (github.com/faeldon/philippines-json-maps) which carry ADM4_PCODE, then
// look the code up in the PSGC table.
//
// Run with: node scripts/join_census.mjs   (idempotent; caches downloads in data/ref)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const GEOJSON = new URL('../src/assets/cebu_health_accessibility.geojson', import.meta.url);
const PSGC_CSV = new URL('../data/psgc.csv', import.meta.url);
const REF_DIR = new URL('../data/ref/', import.meta.url);
const RAW = 'https://raw.githubusercontent.com/faeldon/philippines-json-maps/master/2019/geojson';

mkdirSync(REF_DIR, { recursive: true });

async function cachedFetchJson(name, url) {
  const file = new URL(name, REF_DIR);
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
  const res = await fetch(url, { headers: { 'User-Agent': 'GIS_SideProj/1.0' } });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  const json = await res.json();
  writeFileSync(file, JSON.stringify(json));
  return json;
}

// ---- 1. PSGC table: correspondence_code -> 2020 census population ----
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const csv = parseCsv(readFileSync(PSGC_CSV, 'utf8'));
const header = csv[0];
const col = (n) => header.indexOf(n);
const iCode = col('correspondence_code');
const iLevel = col('geographic_level');
const iPop = col('popu_2020');
const popByCode = new Map();
for (let r = 1; r < csv.length; r++) {
  const row = csv[r];
  if (row[iLevel] !== 'Bgy') continue;
  const code = (row[iCode] ?? '').trim();
  const pop = parseInt(row[iPop], 10);
  if (code && Number.isFinite(pop)) popByCode.set(code, pop);
}
console.log('PSGC barangays with 2020 population:', popByCode.size);

// ---- 2. Reference boundaries for Cebu (province 0722 incl. HUC cities) ----
const tree = await cachedFetchJson(
  'repo-tree.json',
  'https://api.github.com/repos/faeldon/philippines-json-maps/git/trees/master?recursive=1'
);
const muniCodes = tree.tree
  .map((t) => t.path.match(/2019\/geojson\/barangays\/hires\/barangays-municity-ph(0722\d{5})\.0\.1\.json$/)?.[1])
  .filter(Boolean);
console.log('Cebu municipalities/cities:', muniCodes.length);

const refFeatures = [];
for (const code of muniCodes) {
  const j = await cachedFetchJson(
    `bgy-${code}.json`,
    `${RAW}/barangays/hires/barangays-municity-ph${code}.0.1.json`
  );
  refFeatures.push(...j.features);
}
console.log('Reference barangay polygons:', refFeatures.length);

// ---- 3. Spatial matching helpers ----
function bbox(geometry) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const scan = (c) => {
    if (typeof c[0] === 'number') {
      if (c[0] < minX) minX = c[0]; if (c[0] > maxX) maxX = c[0];
      if (c[1] < minY) minY = c[1]; if (c[1] > maxY) maxY = c[1];
    } else for (const x of c) scan(x);
  };
  scan(geometry.coordinates);
  return [minX, minY, maxX, maxY];
}

function pointInRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function pointInPolygon(pt, coords) {
  if (!pointInRing(pt, coords[0])) return false;
  for (let h = 1; h < coords.length; h++) {
    if (pointInRing(pt, coords[h])) return false;
  }
  return true;
}

function pointInFeature(pt, geometry) {
  if (geometry.type === 'Polygon') return pointInPolygon(pt, geometry.coordinates);
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some((poly) => pointInPolygon(pt, poly));
  }
  return false;
}

const refIndex = refFeatures.map((f) => ({ f, box: bbox(f.geometry) }));

function findRef(pt) {
  for (const { f, box } of refIndex) {
    if (pt[0] < box[0] || pt[0] > box[2] || pt[1] < box[1] || pt[1] > box[3]) continue;
    if (pointInFeature(pt, f.geometry)) return f;
  }
  return null;
}

function nearestRef(pt) {
  let best = null, bestD = Infinity;
  for (const { f, box } of refIndex) {
    const dx = pt[0] - (box[0] + box[2]) / 2;
    const dy = pt[1] - (box[1] + box[3]) / 2;
    const d = dx * dx + dy * dy;
    if (d < bestD) { bestD = d; best = f; }
  }
  return best;
}

// ---- 4. Join ----
const data = JSON.parse(readFileSync(GEOJSON, 'utf8'));
let matchedPip = 0, matchedNearest = 0, noPop = 0, nameMismatch = 0;
const norm = (s) => (s ?? '').toLowerCase().replace(/\(pob\.?\)/g, '').replace(/[^a-z0-9]/g, '');
const titleCase = (s) =>
  (s ?? '')
    .toLowerCase()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase())
    .replace(/\bOf\b/g, 'of');

for (const f of data.features) {
  const box = bbox(f.geometry);
  const pt = [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2];
  let ref = findRef(pt);
  if (ref) matchedPip++;
  else { ref = nearestRef(pt); if (ref) matchedNearest++; }

  let pop = null;
  if (ref) {
    const code = ref.properties.ADM4_PCODE.replace('PH', '');
    pop = popByCode.get(code) ?? null;
    if (norm(ref.properties.ADM4_EN) !== norm(f.properties.adm4_name)) nameMismatch++;
    f.properties.municipality = titleCase(ref.properties.ADM3_EN);
  } else {
    f.properties.municipality = null;
  }
  if (pop === null) noPop++;

  f.properties.population = pop;
  f.properties.facilities_per_10k =
    pop && pop > 0 ? Number(((f.properties.facilities / pop) * 10000).toFixed(2)) : null;
}

writeFileSync(GEOJSON, JSON.stringify(data));
console.log(`Matched by PIP: ${matchedPip}, by nearest fallback: ${matchedNearest}`);
console.log(`Name mismatches (info): ${nameMismatch}, no population found: ${noPop}`);
const total = data.features.reduce((a, f) => a + (f.properties.population ?? 0), 0);
console.log('Total Cebu population (2020 census):', total.toLocaleString());
