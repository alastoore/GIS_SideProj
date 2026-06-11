// One-off: fetch healthcare facilities in Cebu province from OpenStreetMap
// (Overpass API) and save them as a GeoJSON asset for the map.
// Run with: node scripts/fetch_health_facilities.mjs

import { writeFileSync } from 'node:fs';

// Everything OSM knows as healthcare in Cebu province, plus the three
// highly-urbanized cities in case the province polygon excludes them.
const query = `
[out:json][timeout:180];
(
  area["name"="Cebu"]["admin_level"="4"]["boundary"="administrative"];
  area["name"~"^(Cebu City|Mandaue|Lapu-Lapu)$"]["admin_level"~"^(5|6)$"]["boundary"="administrative"];
)->.cebu;
(
  nwr["healthcare"](area.cebu);
  nwr["amenity"~"^(hospital|clinic|doctors|dentist|pharmacy)$"](area.cebu);
);
out center tags;
`;

function facilityType(tags) {
  const healthcare = tags.healthcare ?? '';
  const amenity = tags.amenity ?? '';
  if (healthcare === 'hospital' || amenity === 'hospital') return 'Hospital';
  if (healthcare === 'pharmacy' || amenity === 'pharmacy') return 'Pharmacy';
  if (healthcare === 'dentist' || amenity === 'dentist') return 'Dentist';
  if (healthcare === 'laboratory' || healthcare === 'sample_collection' || healthcare === 'blood_donation')
    return 'Laboratory';
  if (healthcare === 'centre' || healthcare === 'health_post') return 'Health Center';
  if (healthcare === 'birthing_centre' || healthcare === 'midwife') return 'Birthing Center';
  return 'Clinic';
}

// Many OSM features lack a `name` tag but identify themselves another way.
function facilityName(tags) {
  return (
    tags.name ??
    tags['name:en'] ??
    tags.official_name ??
    tags.alt_name ??
    tags.operator ??
    tags.brand ??
    ''
  ).trim();
}

const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

let data = null;
for (const url of MIRRORS) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'GIS_SideProj/1.0 (Cebu healthcare accessibility student project)',
      },
      body: 'data=' + encodeURIComponent(query),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    data = await res.json();
    console.log('Fetched from', url);
    break;
  } catch (err) {
    console.warn(`${url} failed: ${err.message}`);
  }
}
if (!data) throw new Error('All Overpass mirrors failed — try again in a few minutes.');

const raw = data.elements
  .map((el) => {
    const lon = el.lon ?? el.center?.lon;
    const lat = el.lat ?? el.center?.lat;
    if (lon == null || lat == null) return null;
    const tags = el.tags ?? {};
    return {
      lon,
      lat,
      name: facilityName(tags),
      type: facilityType(tags),
      isWay: el.type !== 'node',
    };
  })
  .filter(Boolean);

// Dedupe: the same facility is often mapped twice (a node and a building
// outline). Same normalized name + type within ~300m counts as a duplicate;
// prefer the building (way) since its center is usually more accurate.
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const kept = [];
for (const f of raw.sort((a, b) => Number(b.isWay) - Number(a.isWay))) {
  const dup =
    f.name &&
    kept.find(
      (k) =>
        k.type === f.type &&
        k.name &&
        norm(k.name) === norm(f.name) &&
        Math.abs(k.lat - f.lat) < 0.003 &&
        Math.abs(k.lon - f.lon) < 0.003
    );
  if (!dup) kept.push(f);
}

const features = kept.map((f) => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [f.lon, f.lat] },
  properties: { name: f.name, type: f.type },
}));

const counts = {};
let unnamed = 0;
for (const f of features) {
  counts[f.properties.type] = (counts[f.properties.type] ?? 0) + 1;
  if (!f.properties.name) unnamed++;
}
console.log(`Fetched ${raw.length} raw, kept ${features.length} after dedupe:`, counts);
console.log(`Unnamed facilities: ${unnamed}`);

writeFileSync(
  new URL('../src/assets/cebu_health_facilities.geojson', import.meta.url),
  JSON.stringify({ type: 'FeatureCollection', features })
);
writeFileSync(
  new URL('../src/assets/facility_type_counts.json', import.meta.url),
  JSON.stringify(counts)
);
console.log('Saved src/assets/cebu_health_facilities.geojson and facility_type_counts.json');
