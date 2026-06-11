import { useRef, useCallback, useState } from 'react';
import Map, { Source, Layer, Popup } from 'react-map-gl/mapbox';
import type { MapLayerMouseEvent, MapRef } from 'react-map-gl/mapbox';
import type { FeatureCollection } from 'geojson';
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

// Flat fill for base color reference
const fillLayer = {
  id: 'barangay-fill',
  type: 'fill' as const,
  paint: {
    'fill-color': 'transparent',
    'fill-opacity': 0,
  },
};

// 3D extrusion layer — height driven by accessibility_score
const extrusionLayer = {
  id: 'barangay-extrusion',
  type: 'fill-extrusion' as const,
  paint: {
    'fill-extrusion-color': [
      'case',
      ['boolean', ['feature-state', 'clicked'], false],
      '#f0abfc', // popped-out color: pink/violet highlight
      [
        'interpolate',
        ['linear'],
        ['get', 'accessibility_score'],
        0,  '#1e3a5f',
        5,  '#164e63',
        15, '#0e7490',
        25, '#06b6d4',
        43, '#22d3ee',
      ],
    ],
    'fill-extrusion-height': [
      'case',
      ['boolean', ['feature-state', 'clicked'], false],
      8000, // clicked barangay pops way up
      [
        'interpolate',
        ['linear'],
        ['get', 'accessibility_score'],
        0,  200,
        5,  800,
        15, 2000,
        25, 4000,
        43, 6000,
      ],
    ],
    'fill-extrusion-base': 0,
    'fill-extrusion-opacity': [
      'case',
      ['boolean', ['feature-state', 'clicked'], false],
      1,
      [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.95,
        0.75,
      ],
    ],
  },
};

const strokeLayer = {
  id: 'barangay-stroke',
  type: 'line' as const,
  paint: {
    'line-color': [
      'case',
      ['boolean', ['feature-state', 'clicked'], false],
      '#f0abfc',
      [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        '#22d3ee',
        'rgba(255,255,255,0.08)',
      ],
    ],
    'line-width': [
      'case',
      ['boolean', ['feature-state', 'clicked'], false],
      2,
      [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        1.5,
        0.4,
      ],
    ],
  },
};

export const MapView = () => {
  const mapRef = useRef<MapRef>(null);
  const hoveredId = useRef<string | number | null>(null);
  const clickedId = useRef<string | number | null>(null);
  const [popup, setPopup] = useState<PopupInfo | null>(null);
  const [pinnedPopup, setPinnedPopup] = useState<PopupInfo | null>(null);

  const onLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Real 3D buildings at high zoom
    map.addLayer({
      id: '3d-buildings',
      source: 'composite',
      'source-layer': 'building',
      filter: ['==', 'extrude', 'true'],
      type: 'fill-extrusion',
      minzoom: 12,
      paint: {
        'fill-extrusion-color': '0d1f38',
        'fill-extrusion-height': [
          'interpolate', ['linear'], ['zoom'],
          12, 0,
          12.05, ['get', 'height'],
        ],
        'fill-extrusion-base': [
          'interpolate', ['linear'], ['zoom'],
          12, 0,
          12.05, ['get', 'min_height'],
        ],
        'fill-extrusion-opacity': 0.6,
      },
    });
  }, []);

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

  const onClick = useCallback((e: MapLayerMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Clear previous clicked
    if (clickedId.current !== null) {
      map.setFeatureState(
        { source: 'barangays', id: clickedId.current },
        { clicked: false }
      );
    }

    if (!e.features?.length) {
      clickedId.current = null;
      setPinnedPopup(null);
      setPopup(null);
      return;
    }

    const feature = e.features[0];
    clickedId.current = feature.id ?? null;

    if (clickedId.current !== null) {
      map.setFeatureState(
        { source: 'barangays', id: clickedId.current },
        { clicked: true }
      );
    }

    const pinned: PopupInfo = {
      longitude: e.lngLat.lng,
      latitude: e.lngLat.lat,
      properties: feature.properties as BarangayProps,
    };
    setPinnedPopup(pinned);
    setPopup(null);
  }, []);

  const activePopup = pinnedPopup ?? popup;

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
            Barangay polygons extruded by accessibility score. Click any area to pin details.
          </p>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <span className="text-xs text-slate-500">Lower access</span>
          <div
            className="h-2 w-48 rounded-full"
            style={{ background: 'linear-gradient(to right, #1e3a5f, #0e7490, #22d3ee)' }}
          />
          <span className="text-xs text-slate-500">Higher access</span>
        </div>

        <div
          className="overflow-hidden rounded-3xl border border-white/8"
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
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
            interactiveLayerIds={['barangay-fill', 'barangay-extrusion']}
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
              <Layer {...extrusionLayer} />
              <Layer {...strokeLayer} />
            </Source>

            {activePopup && (
              <Popup
                longitude={activePopup.longitude}
                latitude={activePopup.latitude}
                closeButton={pinnedPopup !== null}
                closeOnClick={false}
                anchor="bottom"
                offset={12}
                onClose={() => {
                  const map = mapRef.current?.getMap();
                  if (map && clickedId.current !== null) {
                    map.setFeatureState(
                      { source: 'barangays', id: clickedId.current },
                      { clicked: false }
                    );
                  }
                  clickedId.current = null;
                  setPinnedPopup(null);
                }}
              >
                <div className="min-w-40 rounded-xl bg-[#0a1628] p-3 text-sm text-white shadow-xl">
                  <p className="font-semibold text-white">
                    {activePopup.properties.adm4_name}
                  </p>
                  {pinnedPopup && (
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-fuchsia-400">
                      Selected
                    </p>
                  )}
                  <div className="mt-2 space-y-1 text-xs text-slate-400">
                    <p>
                      Score:{' '}
                      <span className="font-mono text-cyan-400">
                        {activePopup.properties.accessibility_score > 0
                          ? activePopup.properties.accessibility_score.toFixed(2)
                          : 'N/A'}
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
                    <p>
                      Category:{' '}
                      <span
                        className={
                          activePopup.properties.category === 'Moderate Access'
                            ? 'text-cyan-400'
                            : 'text-orange-400'
                        }
                      >
                        {activePopup.properties.category}
                      </span>
                    </p>
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