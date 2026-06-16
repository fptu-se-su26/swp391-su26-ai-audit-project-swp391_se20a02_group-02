import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useUIStore } from '@/store';
import { formatCurrency } from '@/utils';
import type { Vehicle } from '@/types';
import { getCoordinates } from './VehicleMap';

const GOONG_MAPTILES_KEY = (import.meta as any).env.VITE_GOONG_MAPTILES_KEY || 'mock_goong_key';
const MAP_STYLE_URL = `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAPTILES_KEY}`;
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';

function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

export interface LuxeWayMapProps {
  vehicles: Vehicle[];
  selectedVehicleId?: string;
  hoveredVehicleId?: string;
  onVehicleClick?: (vehicle: Vehicle) => void;
  height?: string;
  routePolyline?: string;
  pickupCoords?: [number, number];
  destCoords?: [number, number];
  interactive?: boolean;
}

export const LuxeWayMap: React.FC<LuxeWayMapProps> = ({
  vehicles,
  selectedVehicleId,
  hoveredVehicleId,
  onVehicleClick,
  height = '100%',
  routePolyline,
  pickupCoords,
  destCoords,
  interactive = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const routeMarkersRef = useRef<maplibregl.Marker[]>([]);
  const activePopupRef = useRef<maplibregl.Popup | null>(null);
  const { theme } = useUIStore();
  const isDark = theme === 'dark';

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const defaultCenter: [number, number] = [106.660, 10.762];
    let initialCenter = defaultCenter;
    let initialZoom = 12;

    if (vehicles.length > 0) {
      const coords = getCoordinates(vehicles[0], 0);
      initialCenter = [coords[1], coords[0]];
      initialZoom = vehicles.length === 1 ? 15 : 12;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE_URL,
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: false,
      interactive
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new maplibregl.FullscreenControl(), 'top-right');
    map.addControl(new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    }), 'top-right');

    mapRef.current = map;

    // Load 3D buildings layer
    map.on('load', () => {
      try {
        const layers = map.getStyle().layers;
        let labelLayerId;
        for (let i = 0; i < layers.length; i++) {
          if (layers[i].type === 'symbol' && layers[i].layout && (layers[i].layout as any)['text-field']) {
            labelLayerId = layers[i].id;
            break;
          }
        }

        map.addLayer(
          {
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 15,
            paint: {
              'fill-extrusion-color': isDark ? '#1f2937' : '#e5e7eb',
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.6
            }
          },
          labelLayerId
        );
      } catch (err) {
        console.warn('Goong tiles 3D building source-layer failed or unsupported in this region', err);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [interactive]);

  // 2. Sync Paint properties on dark mode changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    try {
      if (map.getLayer('3d-buildings')) {
        map.setPaintProperty('3d-buildings', 'fill-extrusion-color', isDark ? '#1f2937' : '#e5e7eb');
      }
    } catch (e) {
      console.warn(e);
    }
  }, [isDark]);

  // 3. Sync Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentMarkers = markersRef.current;
    const newVehicleIds = new Set(vehicles.map(v => v.id));

    currentMarkers.forEach((marker, id) => {
      if (!newVehicleIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    });

    vehicles.forEach((v, index) => {
      const coords = getCoordinates(v, index);
      const isSelected = selectedVehicleId === v.id;
      const isHovered = hoveredVehicleId === v.id;

      const markerEl = document.createElement('div');
      markerEl.className = 'flex flex-col items-center select-none cursor-pointer group relative';
      
      const isCar = String(v.vehicleType).toUpperCase() === 'CAR' || (v as any).vehicleType === 'car';
      const iconClass = isCar ? 'fa-car' : 'fa-motorcycle';

      const bubbleEl = document.createElement('div');
      bubbleEl.className = `relative flex items-center justify-center w-11 h-11 rounded-full backdrop-blur-md transition-all duration-300 ease-out border shadow-lg`;
      
      if (isSelected) {
        bubbleEl.className += ' bg-amber-500 border-amber-300 text-white scale-110 shadow-[0_0_15px_rgba(245,158,11,0.9)] z-50';
      } else if (isHovered) {
        bubbleEl.className += ' bg-slate-900 border-amber-400 text-amber-400 scale-105 shadow-[0_0_8px_rgba(245,158,11,0.5)] z-40';
      } else {
        bubbleEl.className += ' bg-slate-950/80 border-white/20 text-white hover:scale-105 hover:border-amber-500/50';
      }

      bubbleEl.innerHTML = `<i class="fa-solid ${iconClass} text-base"></i>`;

      if (isSelected || vehicles.length === 1) {
        const pulseRing = document.createElement('div');
        pulseRing.className = 'absolute -inset-3.5 rounded-full border-2 border-amber-500 animate-ping opacity-50 pointer-events-none';
        bubbleEl.appendChild(pulseRing);
      }

      const priceEl = document.createElement('div');
      priceEl.className = `mt-1.5 px-2.5 py-0.5 rounded-full font-extrabold text-[10px] tracking-tight shadow-md transition-colors duration-250 border ${
        isSelected 
          ? 'bg-amber-500 border-amber-400 text-white font-black' 
          : 'bg-slate-950/85 border-slate-700/60 text-white font-bold'
      }`;
      priceEl.innerText = formatCurrency(v.pricePerDay);

      markerEl.appendChild(bubbleEl);
      markerEl.appendChild(priceEl);

      const setupPopup = () => {
        if (activePopupRef.current) {
          activePopupRef.current.remove();
        }

        const popupContent = document.createElement('div');
        popupContent.className = 'flex gap-3 p-3 select-none items-center font-sans max-w-[280px] bg-slate-900 border border-slate-800 rounded-2xl text-white shadow-2xl';
        
        const distanceVal = (1.5 + (index % 4) * 0.9).toFixed(1);
        const etaVal = (4 + (index % 4) * 3).toString();

        popupContent.innerHTML = `
          <img
            src="${v.images?.[0] || v.thumbnailUrl || FALLBACK_IMAGE}"
            alt="${v.name}"
            class="w-16 h-16 object-cover rounded-xl border border-white/10 flex-shrink-0"
          />
          <div class="flex-1 min-w-0 pr-0.5">
            <span class="text-[8px] font-black text-amber-500 uppercase tracking-widest leading-none">${v.brand || 'Luxury'}</span>
            <h4 class="font-extrabold text-xs text-white leading-tight truncate mt-0.5" title="${v.name}">${v.name}</h4>
            <div class="flex items-center gap-1 mt-0.5 text-xs">
              <i class="fa-solid fa-star text-amber-500 text-[10px]"></i>
              <span class="font-black text-[10px] text-white">${v.rating ? v.rating.toFixed(1) : '5.0'}</span>
              <span class="text-slate-450 text-[9px]">(${v.totalReviews || 0})</span>
            </div>
            <div class="flex items-center gap-2 mt-1 text-[9px] font-bold text-slate-400">
              <span><i class="fa-solid fa-location-arrow text-[8px] text-amber-500 mr-0.5"></i>${distanceVal} km</span>
              <span><i class="fa-solid fa-clock text-[8px] text-amber-500 mr-0.5"></i>${etaVal} mins</span>
            </div>
            <div class="mt-2.5 flex items-center justify-between border-t border-slate-800/80 pt-2">
              <span class="text-[10px] font-black text-amber-500">${formatCurrency(v.pricePerDay)}/day</span>
              <a href="/marketplace/vehicles/${v.id}" class="text-[9px] font-black bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded-lg transition-all shadow-md shadow-amber-500/10">Details</a>
            </div>
          </div>
        `;

        const popup = new maplibregl.Popup({ closeButton: true, maxWidth: '300px', offset: 25 })
          .setLngLat([coords[1], coords[0]])
          .setDOMContent(popupContent)
          .addTo(map);

        activePopupRef.current = popup;
      };

      markerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onVehicleClick) {
          onVehicleClick(v);
        }
        setupPopup();
      });

      let existingMarker = currentMarkers.get(v.id);
      if (existingMarker) {
        existingMarker.setLngLat([coords[1], coords[0]]);
        const oldEl = existingMarker.getElement();
        oldEl.innerHTML = '';
        oldEl.appendChild(bubbleEl);
        oldEl.appendChild(priceEl);
      } else {
        const marker = new maplibregl.Marker({ element: markerEl })
          .setLngLat([coords[1], coords[0]])
          .addTo(map);
        currentMarkers.set(v.id, marker);
      }
    });
  }, [vehicles, selectedVehicleId, hoveredVehicleId, isDark]);

  // 4. Zoom / Pan Fly camera
  useEffect(() => {
    const map = mapRef.current;
    if (!map || vehicles.length === 0) return;

    map.resize();

    if (selectedVehicleId) {
      const selected = vehicles.find(v => v.id === selectedVehicleId);
      if (selected) {
        const coords = getCoordinates(selected, vehicles.indexOf(selected));
        map.easeTo({
          center: [coords[1], coords[0]],
          zoom: 15.5,
          duration: 1500,
          essential: true
        });
        return;
      }
    }

    if (vehicles.length === 1) {
      const coords = getCoordinates(vehicles[0], 0);
      map.easeTo({
        center: [coords[1], coords[0]],
        zoom: 15.5,
        duration: 1500,
        essential: true
      });
      return;
    }

    try {
      const bounds = new maplibregl.LngLatBounds();
      vehicles.forEach((v, index) => {
        const coords = getCoordinates(v, index);
        bounds.extend([coords[1], coords[0]]);
      });
      map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 1200 });
    } catch (e) {
      console.error(e);
    }
  }, [vehicles, selectedVehicleId]);

  // 5. Sync Route Polyline
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateRoute = () => {
      if (map.getLayer('route-line')) map.removeLayer('route-line');
      if (map.getLayer('route-glow')) map.removeLayer('route-glow');
      if (map.getSource('route')) map.removeSource('route');

      if (routePolyline) {
        const decoded = decodePolyline(routePolyline);
        const geojsonCoordinates = decoded.map(c => [c[1], c[0]]);

        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: geojsonCoordinates
            }
          }
        });

        map.addLayer({
          id: 'route-glow',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#f59e0b', 'line-width': 8, 'line-opacity': 0.25 }
        });

        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#d97706', 'line-width': 4 }
        });

        try {
          const bounds = new maplibregl.LngLatBounds();
          geojsonCoordinates.forEach(coord => bounds.extend([coord[0], coord[1]]));
          map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 1000 });
        } catch (e) {
          console.error(e);
        }
      }
    };

    if (map.isStyleLoaded()) {
      updateRoute();
    } else {
      map.on('style.load', updateRoute);
    }

    return () => {
      map.off('style.load', updateRoute);
    };
  }, [routePolyline]);

  // 6. Sync Pickup & Destination Pins
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    routeMarkersRef.current.forEach(m => m.remove());
    routeMarkersRef.current = [];

    if (pickupCoords && destCoords) {
      const pinPickup = document.createElement('div');
      pinPickup.className = 'w-8 h-8 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow-lg';
      pinPickup.innerHTML = '<i class="fa-solid fa-map-pin text-white text-xs"></i>';
      
      const pinDest = document.createElement('div');
      pinDest.className = 'w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center shadow-lg';
      pinDest.innerHTML = '<i class="fa-solid fa-location-dot text-white text-xs"></i>';

      const m1 = new maplibregl.Marker({ element: pinPickup })
        .setLngLat([pickupCoords[1], pickupCoords[0]])
        .addTo(map);

      const m2 = new maplibregl.Marker({ element: pinDest })
        .setLngLat([destCoords[1], destCoords[0]])
        .addTo(map);

      routeMarkersRef.current = [m1, m2];
    }
  }, [pickupCoords, destCoords]);

  return (
    <div style={{ height }} className="w-full rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl relative z-10">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default LuxeWayMap;
