// Enriches the barangay geojson with display-friendly fields derived from the
// raw accessibility_score (which is an unbounded composite, mostly negative):
//   - access_rank: percentile rank 0-100 (higher = better access)
//   - access_category: quintile label (Very Low … Very High)
// Also emits src/assets/barangay_summary.json — a small lookup used by the
// search box, ranking table, and Analysis metrics, with `id` matching the
// mapbox generateId feature index.
// Run with: node scripts/enrich_accessibility.mjs   (idempotent)

import { readFileSync, writeFileSync } from 'node:fs';

const GEOJSON = new URL('../src/assets/cebu_health_accessibility.geojson', import.meta.url);
const SUMMARY = new URL('../src/assets/barangay_summary.json', import.meta.url);

const data = JSON.parse(readFileSync(GEOJSON, 'utf8'));
const features = data.features;

// Percentile rank from raw score ordering.
const sorted = features
  .map((f, i) => ({ i, score: f.properties.accessibility_score }))
  .sort((a, b) => a.score - b.score);
const ranks = new Array(features.length);
sorted.forEach(({ i }, pos) => {
  ranks[i] = (pos / (features.length - 1)) * 100;
});

function category(rank) {
  if (rank < 20) return 'Very Low Access';
  if (rank < 40) return 'Low Access';
  if (rank < 60) return 'Moderate Access';
  if (rank < 80) return 'High Access';
  return 'Very High Access';
}

function centroid(geometry) {
  // bbox center — good enough for fly-to targets
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const scan = (coords) => {
    if (typeof coords[0] === 'number') {
      minX = Math.min(minX, coords[0]); maxX = Math.max(maxX, coords[0]);
      minY = Math.min(minY, coords[1]); maxY = Math.max(maxY, coords[1]);
    } else {
      for (const c of coords) scan(c);
    }
  };
  scan(geometry.coordinates);
  return [Number(((minX + maxX) / 2).toFixed(5)), Number(((minY + maxY) / 2).toFixed(5))];
}

const summary = features.map((f, i) => {
  const rank = Number(ranks[i].toFixed(1));
  const cat = category(rank);
  f.properties.access_rank = rank;
  f.properties.access_category = cat;
  return {
    id: i, // matches mapbox generateId feature id
    name: f.properties.adm4_name,
    municipality: f.properties.municipality ?? null,
    rank,
    category: cat,
    population: f.properties.population,
    facilities: f.properties.facilities,
    facilities_per_10k: f.properties.facilities_per_10k,
    centroid: centroid(f.geometry),
  };
});

writeFileSync(GEOJSON, JSON.stringify(data));
writeFileSync(SUMMARY, JSON.stringify(summary));

const cats = {};
for (const s of summary) cats[s.category] = (cats[s.category] ?? 0) + 1;
console.log('Enriched', summary.length, 'barangays:', cats);
console.log('Summary size:', (JSON.stringify(summary).length / 1024).toFixed(0), 'KB');
