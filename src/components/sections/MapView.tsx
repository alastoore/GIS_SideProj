import { useRef, useCallback, useState } from 'react';
import Map, { Source, Layer, Popup } from 'react-map-gl/mapbox';
import type { MapLayerMouseEvent, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import geojsonData from '../../assets/cebu_health_accessibility.geojson';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface BarangayProps {
  adm4_name: string;
  population: number;
  facilities: number;
  facilities_per_10k: number;
  accessibility_score: number;
  category: string;
}

interface PopupInfo {
  longitude: number;
  latitude: number;
  properties: BarangayProps;
}

const fillLayer = {
  id: 'barangay-fill',
  type: 'fill' as const,
  paint: {
    'fill-color': [
      'interpolate',
      ['linear'],
      ['get', 'accessibility_score'],
      0,   '#1e3a5f',
      5,   '#164e63',
      15,  '#0e7490',
      25,  '#06b6d4',
      43,  '#22d3ee',
    ],
    'fill-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      0.9,
      0.65,
    ],
  },
};

const strokeLayer = {
  id: 'barangay-stroke',
  type: 'line' as const,
  paint: {
    'line-color': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      '#22d3ee',
      'rgba(255,255,255,0.08)',
    ],
    'line-width': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      1.5,
      0.4,
    ],
  },
};

export const MapView = () => {
  const mapRef = useRef<MapRef>(null);
  const hoveredId = useRef<string | number | null>(null);
  const [popup, setPopup] = useState<PopupInfo | null>(null);

  const onMouseMove = useCallback((e: MapLayerMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map || !e.features?.length) return;

    if (hoveredId.current !== null) {
      map.setFeatureState(
        { source: 'barangays', id: hoveredId.current },
        { hover: false }
      );
    }

    const feature = e.features[0];
    hoveredId.current = feature.id ?? null;

    if (hoveredId.current !== null) {
      map.setFeatureState(
        { source: 'barangays', id: hoveredId.current },
        { hover: true }
      );
    }

    setPopup({
      longitude: e.lngLat.lng,
      latitude: e.lngLat.lat,
      properties: feature.properties as BarangayProps,
    });
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
    setPopup(null);
  }, []);

  return (
    <section id="map" className="bg-[#060c18] py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
            Live coverage map
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Cebu healthcare accessibility.
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Barangay-level accessibility scores. Hover any area for details.
          </p>
        </div>

        {/* Legend */}
        <div className="mb-4 flex items-center gap-3">
          <span className="text-xs text-slate-500">Lower access</span>
          <div className="h-2 w-48 rounded-full"
            style={{ background: 'linear-gradient(to right, #1e3a5f, #0e7490, #22d3ee)' }}
          />
          <span className="text-xs text-slate-500">Higher access</span>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/8" style={{ height: '560px' }}>
          <Map
            ref={mapRef}
            initialViewState={{
              longitude: 124.0,
              latitude: 10.35,
              zoom: 8.5,
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
            interactiveLayerIds={['barangay-fill']}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
          >
            <Source
              id="barangays"
              type="geojson"
              data={geojsonData as any}
              generateId
            >
              <Layer {...fillLayer} />
              <Layer {...strokeLayer} />
            </Source>

            {popup && (
              <Popup
                longitude={popup.longitude}
                latitude={popup.latitude}
                closeButton={false}
                closeOnClick={false}
                anchor="bottom"
                offset={12}
              >
                <div className="min-w-[160px] rounded-xl bg-[#0a1628] p-3 text-sm text-white shadow-xl">
                  <p className="font-semibold text-white">{popup.properties.adm4_name}</p>
                  <div className="mt-2 space-y-1 text-xs text-slate-400">
                    <p>Score: <span className="text-cyan-400 font-mono">{popup.properties.accessibility_score > 0 ? popup.properties.accessibility_score.toFixed(2) : 'N/A'}</span></p>
                    <p>Facilities: <span className="text-white font-mono">{popup.properties.facilities ?? 0}</span></p>
                    <p>Per 10k: <span className="text-white font-mono">{popup.properties.facilities_per_10k > 0 ? popup.properties.facilities_per_10k.toFixed(2) : '0'}</span></p>
                    <p>Category: <span className={popup.properties.category === 'Moderate Access' ? 'text-cyan-400' : 'text-orange-400'}>{popup.properties.category}</span></p>
                  </div>
                </div>
              </Popup>
            )}
          </Map>
        </div>
      </div>
    </section>
  );
};