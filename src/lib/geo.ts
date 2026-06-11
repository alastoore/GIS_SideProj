import type { Geometry, Position } from 'geojson';

function pointInRing([x, y]: Position, ring: Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function pointInPolygon(pt: Position, coords: Position[][]): boolean {
  if (!pointInRing(pt, coords[0])) return false;
  for (let h = 1; h < coords.length; h++) {
    if (pointInRing(pt, coords[h])) return false;
  }
  return true;
}

/** Ray-cast point-in-polygon for GeoJSON Polygon/MultiPolygon geometries. */
export function pointInFeature(pt: Position, geometry: Geometry): boolean {
  if (geometry.type === 'Polygon') return pointInPolygon(pt, geometry.coordinates);
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some((poly) => pointInPolygon(pt, poly));
  }
  return false;
}
