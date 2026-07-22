import React, { useEffect, useRef, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { formatCurrency } from '@/utils';
import type { Vehicle } from '@/types';
import { getMapStyleUrl, installMapStyleFallback } from './mapStyle';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';

// Helper to resolve coordinates
export const getCoordinates = (v: Vehicle, index: number): [number, number] => {
  let lat: number | undefined;
  let lng: number | undefined;

  const rawVehicle = v as unknown as Record<string, unknown>;
  if (typeof rawVehicle.latitude === 'number' && typeof rawVehicle.longitude === 'number') {
    lat = rawVehicle.latitude;
    lng = rawVehicle.longitude;
  }

  if ((lat === undefined || lng === undefined || lat === 0 || lng === 0) && v.location) {
    const rawLoc = v.location as unknown as Record<string, unknown>;
    if (typeof rawLoc.latitude === 'number' && typeof rawLoc.longitude === 'number') {
      lat = rawLoc.latitude;
      lng = rawLoc.longitude;
    }
  }

  if ((lat === undefined || lng === undefined || lat === 0 || lng === 0) && v.location) {
    if (typeof v.location.lat === 'number' && typeof v.location.lng === 'number') {
      lat = v.location.lat;
      lng = v.location.lng;
    }
  }

  // Fallbacks scattered deterministically
  if (lat === undefined || lng === undefined || lat === 0 || lng === 0) {
    const city = (v.location?.city || rawVehicle.city as string || 'Ho Chi Minh').toLowerCase();
    let base: [number, number] = [10.762, 106.660];
    
    if (city.includes('hà nội') || city.includes('ha noi')) {
      base = [21.0285, 105.8542];
    } else if (city.includes('đà nẵng') || city.includes('da nang')) {
      base = [16.0544, 108.2022];
    } else if (city.includes('nha trang')) {
      base = [12.2451, 109.1943];
    } else if (city.includes('đà lạt') || city.includes('da lat')) {
      base = [11.9404, 108.4583];
    }
    
    const angle = index * 137.5 * (Math.PI / 180); 
    const radius = 0.008 + (index % 5) * 0.003;
    lat = base[0] + Math.sin(angle) * radius;
    lng = base[1] + Math.cos(angle) * radius;
  }

  return [lat, lng];
};

// Polyline Decoder
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

interface VehicleMapProps {
  vehicles: Vehicle[];
  selectedVehicleId?: string;
  hoveredVehicleId?: string;
  onVehicleClick?: (vehicle: Vehicle) => void;
  height?: string;
  routePolyline?: string;
  pickupCoords?: [number, number];
  destCoords?: [number, number];
}

export const VehicleMapImpl: React.FC<VehicleMapProps> = ({
  vehicles,
  selectedVehicleId,
  hoveredVehicleId,
  onVehicleClick,
  height = '100%',
  routePolyline,
  pickupCoords,
  destCoords
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const routeMarkersRef = useRef<maplibregl.Marker[]>([]);
  const activePopupRef = useRef<maplibregl.Popup | null>(null);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Use Ho Chi Minh default center
    const defaultCenter: [number, number] = [106.660, 10.762]; // [lng, lat] for MapLibre
    let initialCenter = defaultCenter;
    let initialZoom = 12;

    if (vehicles.length > 0) {
      const coords = getCoordinates(vehicles[0], 0);
      initialCenter = [coords[1], coords[0]]; // [lng, lat]
      initialZoom = vehicles.length === 1 ? 15 : 12;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapStyleUrl(false),
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    installMapStyleFallback(map, false);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Sync Markers when vehicles list changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentMarkers = markersRef.current;
    const newVehicleIds = new Set(vehicles.map(v => v.id));

    // Remove obsolete markers
    currentMarkers.forEach((marker, id) => {
      if (!newVehicleIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    });

    // Add or update markers
    vehicles.forEach((v, index) => {
      const coords = getCoordinates(v, index);
      const isSelected = selectedVehicleId === v.id;
      const isHovered = hoveredVehicleId === v.id;

      // Create Custom HTML Marker Element
      const markerEl = document.createElement('div');
      markerEl.className = 'flex flex-col items-center select-none cursor-pointer group';
      
      const isCar = String(v.vehicleType).toUpperCase() === 'CAR' || (v as any).vehicleType === 'car';
      const iconClass = isCar ? 'fa-car' : 'fa-motorcycle';

      // Luxury Glass Element styling
      const bubbleEl = document.createElement('div');
      bubbleEl.className = `relative flex items-center justify-center w-11 h-11 rounded-full backdrop-blur-md transition-all duration-300 ease-out border shadow-lg`;
      
      // Dynamic styles for active, hover or standard states
      if (isSelected) {
        bubbleEl.className += ' bg-blue-600 border-blue-400 text-white scale-110 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-50';
      } else if (isHovered) {
        bubbleEl.className += ' bg-slate-800/90 border-blue-400 text-blue-400 scale-105 shadow-[0_0_8px_rgba(59,130,246,0.4)] z-40';
      } else {
        bubbleEl.className += ' bg-slate-900/75 border-white/20 text-white hover:scale-105 hover:border-white/40';
      }

      // FontAwesome Icon
      bubbleEl.innerHTML = `<i class="fa-solid ${iconClass} text-base"></i>`;

      // Pulse ring for detail page or selected vehicle
      if (isSelected || vehicles.length === 1) {
        const pulseRing = document.createElement('div');
        pulseRing.className = 'absolute -inset-3.5 rounded-full border-2 border-blue-500 animate-ping opacity-50 pointer-events-none';
        bubbleEl.appendChild(pulseRing);
      }

      // Price Tag element
      const priceEl = document.createElement('div');
      priceEl.className = `mt-1.5 px-2.5 py-0.5 rounded-full font-extrabold text-[10px] tracking-tight shadow-md transition-colors duration-250 border ${
        isSelected 
          ? 'bg-blue-600 border-blue-400 text-white' 
          : 'bg-slate-950/85 border-slate-700/60 text-white'
      }`;
      priceEl.innerText = formatCurrency(v.pricePerDay);

      markerEl.appendChild(bubbleEl);
      markerEl.appendChild(priceEl);

      // Add Click Listener
      markerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onVehicleClick) {
          onVehicleClick(v);
        }
        
        // Show detailed Popup
        if (activePopupRef.current) {
          activePopupRef.current.remove();
        }

        const popupContent = document.createElement('div');
        popupContent.className = 'flex gap-3 p-2.5 select-none items-center font-sans';
        popupContent.innerHTML = `
          <img
            src="${v.images?.[0] || v.thumbnailUrl || FALLBACK_IMAGE}"
            alt="${v.name}"
            class="w-16 h-14 object-cover rounded-lg bg-slate-100 flex-shrink-0"
          />
          <div class="flex-1 min-w-0 pr-1 text-slate-800 dark:text-slate-100">
            <span class="text-[9px] font-bold text-blue-500 uppercase tracking-widest">${v.brand}</span>
            <h4 class="font-extrabold text-xs leading-tight truncate mt-0.5 text-black" title="${v.name}">${v.name}</h4>
            <div class="flex items-center gap-1 mt-1 text-xs">
              <i class="fa-solid fa-star text-amber-500 text-[10px]"></i>
              <span class="font-bold text-[10px] text-slate-800">${v.rating ? v.rating.toFixed(1) : '5.0'}</span>
              <span class="text-slate-400 text-[9px]">(${v.totalReviews || 0})</span>
            </div>
            <div class="mt-2 flex items-center justify-between">
              <span class="text-[10px] font-extrabold text-slate-900">${formatCurrency(v.pricePerDay)}/day</span>
              <a href="/vehicles/${v.id}" class="text-[9px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700 transition-colors shadow-sm">Details</a>
            </div>
          </div>
        `;

        const popup = new maplibregl.Popup({ closeButton: true, maxWidth: '280px', offset: 25 })
          .setLngLat([coords[1], coords[0]])
          .setDOMContent(popupContent)
          .addTo(map);

        activePopupRef.current = popup;
      });

      // Update or create maplibre marker
      let existingMarker = currentMarkers.get(v.id);
      if (existingMarker) {
        existingMarker.setLngLat([coords[1], coords[0]]);
        // Replace inner element contents to update selected/hover states
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

  }, [vehicles, selectedVehicleId, hoveredVehicleId, onVehicleClick]);

  // 3. Zoom / Pan Camera to fit bounds or fly to selection
  useEffect(() => {
    const map = mapRef.current;
    if (!map || vehicles.length === 0) return;

    // Trigger map redraw to fix container sizing bugs
    map.resize();

    if (selectedVehicleId) {
      const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
      if (selectedVehicle) {
        const coords = getCoordinates(selectedVehicle, vehicles.indexOf(selectedVehicle));
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
      map.fitBounds(bounds, { padding: 50, maxZoom: 15, duration: 1200 });
    } catch (e) {
      console.error('Failed to fit bounds', e);
    }
  }, [vehicles, selectedVehicleId]);

  // 4. Sync Polyline Route
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateRoute = () => {
      if (map.getLayer('route-line')) map.removeLayer('route-line');
      if (map.getLayer('route-glow')) map.removeLayer('route-glow');
      if (map.getSource('route')) map.removeSource('route');

      if (routePolyline) {
        const decodedCoords = decodePolyline(routePolyline);
        const geojsonCoordinates = decodedCoords.map(c => [c[1], c[0]]);

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
          paint: { 'line-color': '#3b82f6', 'line-width': 8, 'line-opacity': 0.3 }
        });

        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#2563eb', 'line-width': 4 }
        });

        try {
          const bounds = new maplibregl.LngLatBounds();
          geojsonCoordinates.forEach(coord => bounds.extend([coord[0], coord[1]]));
          map.fitBounds(bounds, { padding: 50, maxZoom: 15, duration: 1000 });
        } catch (e) {
          console.error('Failed to fit route bounds', e);
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

  // 5. Sync Route Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    routeMarkersRef.current.forEach(m => m.remove());
    routeMarkersRef.current = [];

    if (pickupCoords && destCoords) {
      const el1 = document.createElement('div');
      el1.className = 'w-8 h-8 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow-lg';
      el1.innerHTML = '<i class="fa-solid fa-map-pin text-white text-xs"></i>';
      
      const el2 = document.createElement('div');
      el2.className = 'w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center shadow-lg';
      el2.innerHTML = '<i class="fa-solid fa-location-dot text-white text-xs"></i>';

      const marker1 = new maplibregl.Marker({ element: el1 })
        .setLngLat([pickupCoords[1], pickupCoords[0]])
        .addTo(map);

      const marker2 = new maplibregl.Marker({ element: el2 })
        .setLngLat([destCoords[1], destCoords[0]])
        .addTo(map);

      routeMarkersRef.current = [marker1, marker2];
    }
  }, [pickupCoords, destCoords]);

  return (
    <div style={{ height }} className="w-full rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl relative z-10">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export const VehicleMap = React.memo(VehicleMapImpl);
export default VehicleMap;
