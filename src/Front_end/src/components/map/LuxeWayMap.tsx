import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useUIStore } from '@/store';
import { formatCurrency } from '@/utils';
import type { Vehicle, VehicleLocationResponse } from '@/types';
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
  vehicles: (Vehicle | VehicleLocationResponse)[];
  selectedVehicleId?: string;
  hoveredVehicleId?: string;
  onVehicleClick?: (vehicle: any) => void;
  onUserLocationChange?: (lat: number, lng: number) => void;
  onSelectionChange?: (vehicles: any[]) => void;
  height?: string;
  routePolyline?: string;
  pickupCoords?: [number, number];
  destCoords?: [number, number];
  interactive?: boolean;
  disableAutoPan?: boolean;
}

export const LuxeWayMap: React.FC<LuxeWayMapProps> = ({
  vehicles,
  selectedVehicleId,
  hoveredVehicleId,
  onVehicleClick,
  onUserLocationChange,
  onSelectionChange,
  height = '100%',
  routePolyline,
  pickupCoords,
  destCoords,
  interactive = true,
  disableAutoPan = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const activeMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const routeMarkersRef = useRef<maplibregl.Marker[]>([]);
  const activePopupRef = useRef<maplibregl.Popup | null>(null);
  const isMapLoadedRef = useRef(false);
  const { theme } = useUIStore();
  const isDark = theme === 'dark';

  const [revealedPriceVehicleIds, setRevealedPriceVehicleIds] = useState<Set<string>>(new Set());
  
  const selectedVehicleIdRef = useRef(selectedVehicleId);
  const vehiclesRef = useRef(vehicles);
  const revealedPriceVehicleIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    selectedVehicleIdRef.current = selectedVehicleId;
  }, [selectedVehicleId]);

  useEffect(() => {
    vehiclesRef.current = vehicles;
  }, [vehicles]);

  useEffect(() => {
    revealedPriceVehicleIdsRef.current = revealedPriceVehicleIds;
  }, [revealedPriceVehicleIds]);

  useEffect(() => {
    // Sync ref immediately so updateMarkers always has fresh data
    vehiclesRef.current = vehicles;
    selectedVehicleIdRef.current = selectedVehicleId;
    // Defer to allow DOM to settle, then render markers
    const t1 = setTimeout(() => updateMarkers(), 50);
    const t2 = setTimeout(() => updateMarkers(), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [vehicles, selectedVehicleId, revealedPriceVehicleIds]);

  const resolveCoords = (v: any, index: number): [number, number] | null => {
    let lat = v.latitude !== undefined ? v.latitude : v.location?.lat;
    let lng = v.longitude !== undefined ? v.longitude : v.location?.lng;
    
    if (typeof lat !== 'number' || typeof lng !== 'number' || lat === 0 || lng === 0 || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      if (vehiclesRef.current.length === 1) {
        return getCoordinates(v, index);
      }
      return null;
    }
    return [lat, lng];
  };

  const updateMarkers = () => {
    const map = mapRef.current;
    if (!map || !isMapLoadedRef.current) return;

    // Use ref to avoid stale closures in map event listeners
    const currentVehicles = vehiclesRef.current;
    if (currentVehicles.length === 0) return;

    // Dynamic threshold for JS-based spatial clustering based on zoom level
    const currentZoom = map.getZoom();
    const threshold = currentZoom < 8 ? 0.35 : currentZoom < 10 ? 0.16 : currentZoom < 12 ? 0.08 : currentZoom < 13.5 ? 0.03 : 0.005;

    interface MapCluster {
      id: string;
      lat: number;
      lng: number;
      count: number;
      vehicles: any[];
    }

    const clusters: MapCluster[] = [];

    currentVehicles.forEach((v, index) => {
      const coords = resolveCoords(v, index);
      if (!coords) return;
      const [lat, lng] = coords;

      let found = false;
      for (const c of clusters) {
        const dist = Math.sqrt(Math.pow(c.lat - lat, 2) + Math.pow(c.lng - lng, 2));
        if (dist < threshold) {
          c.vehicles.push(v);
          c.count++;
          // Weighted average coordinates for cluster center
          c.lat = (c.lat * (c.count - 1) + lat) / c.count;
          c.lng = (c.lng * (c.count - 1) + lng) / c.count;
          found = true;
          break;
        }
      }

      if (!found) {
        clusters.push({
          id: `cluster-${v.id}`,
          lat,
          lng,
          count: 1,
          vehicles: [v]
        });
      }
    });

    const visibleIds = new Set<string>();

    clusters.forEach(c => {
      const isCluster = c.count > 1;
      const id = isCluster ? c.id : c.vehicles[0].id;
      visibleIds.add(id);

      let marker = activeMarkersRef.current.get(id);
      let markerEl: HTMLDivElement;

      if (!marker) {
        markerEl = document.createElement('div');
        marker = new maplibregl.Marker({ element: markerEl })
          .setLngLat([c.lng, c.lat])
          .addTo(map);
        activeMarkersRef.current.set(id, marker);

        if (isCluster) {
          markerEl.addEventListener('click', (e) => {
            e.stopPropagation();
            // Zoom in slightly on click
            map.easeTo({
              center: [c.lng, c.lat],
              zoom: Math.min(16, map.getZoom() + 1.8),
              duration: 500
            });
            if (onSelectionChange) {
              onSelectionChange(c.vehicles);
            }
          });
        } else {
          const singleVehicle = c.vehicles[0];
          markerEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (onSelectionChange) {
              onSelectionChange([singleVehicle]);
            }
            if (onVehicleClick) {
              onVehicleClick(singleVehicle);
            }
          });
        }
      } else {
        markerEl = marker.getElement() as HTMLDivElement;
        marker.setLngLat([c.lng, c.lat]);
      }

      // Render styling
      if (isCluster) {
        markerEl.className = 'px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-full shadow-md font-extrabold text-xs text-slate-800 dark:text-slate-100 cursor-pointer hover:scale-105 transition-all select-none leading-none z-35 flex items-center justify-center';
        markerEl.innerText = `${c.count} xe`;
      } else {
        const singleVehicle = c.vehicles[0];
        const isSelected = selectedVehicleIdRef.current === singleVehicle.id;
        const pricePerDay = singleVehicle.pricePerDay;
        const displayPrice = pricePerDay >= 1000 
          ? `${(pricePerDay / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K`
          : `${pricePerDay}`;

        markerEl.className = 'relative cursor-pointer transition-all duration-200 hover:scale-110 select-none flex flex-col items-center group z-30';
        
        if (isSelected) {
          // Selected price marker: primary emerald background
          markerEl.innerHTML = `
            <div class="px-2.5 py-1.5 bg-emerald-600 dark:bg-emerald-700 text-white font-extrabold rounded-full shadow-lg border border-white/20 text-[11px] whitespace-nowrap leading-none flex items-center gap-1">
              <span>₫${displayPrice}</span>
            </div>
            <div class="w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-700 rotate-45 -mt-0.5 shadow-sm"></div>
          `;
        } else {
          // Normal price marker: white background with gold/dark border
          markerEl.innerHTML = `
            <div class="px-2.5 py-1.5 bg-white dark:bg-[#131F35] text-[#0B1221] dark:text-white font-extrabold rounded-full shadow-md border border-slate-200 dark:border-slate-800 text-[11px] whitespace-nowrap leading-none hover:border-[#D4AF37] dark:hover:border-[#D4AF37] transition-all">
              <span>₫${displayPrice}</span>
            </div>
            <div class="w-1.5 h-1.5 bg-white dark:bg-[#131F35] rotate-45 -mt-0.5 border-r border-b border-slate-200 dark:border-slate-800 transition-all"></div>
          `;
        }
      }
    });

    activeMarkersRef.current.forEach((marker, id) => {
      if (!visibleIds.has(id)) {
        marker.remove();
        activeMarkersRef.current.delete(id);
      }
    });
  };

  const syncGeoJson = () => {
    const map = mapRef.current;
    if (!map || !isMapLoadedRef.current) return;

    const source = map.getSource('vehicles-source') as maplibregl.GeoJSONSource;
    if (!source) return;

    const features = vehicles
      .map((v, index) => {
        const coords = resolveCoords(v, index);
        if (!coords) return null;

        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [coords[1], coords[0]]
          },
          properties: {
            id: v.id,
            name: v.name,
            brand: v.brand || '',
            pricePerDay: v.pricePerDay,
            rating: v.rating || 5.0,
            totalReviews: (v as any).totalReviews || (v as any).totalTrips || 0,
            thumbnail: (v as any).thumbnailUrl || (v as any).thumbnail || '',
            image: (v as any).images?.[0] || '',
            vehicleType: (v as any).vehicleType || (v as any).type || 'CAR',
            distanceKm: (v as any).distanceKm !== undefined ? (v as any).distanceKm : null
          }
        };
      })
      .filter(Boolean) as any[];

    source.setData({
      type: 'FeatureCollection',
      features
    });

    // Staggered delay: allow MapLibre to render tiles before computing JS clusters
    setTimeout(() => updateMarkers(), 150);
    setTimeout(() => updateMarkers(), 600);
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const defaultCenter: [number, number] = [106.660, 10.762];
    let initialCenter = defaultCenter;
    let initialZoom = 12;

    if (vehicles.length > 0) {
      const coords = resolveCoords(vehicles[0], 0);
      if (coords) {
        initialCenter = [coords[1], coords[0]];
        initialZoom = vehicles.length === 1 ? 15 : 12;
      }
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
    
    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    });
    map.addControl(geolocate, 'top-right');
    
    geolocate.on('geolocate', (position: any) => {
      const coords = position.coords;
      if (onUserLocationChange) {
        onUserLocationChange(coords.latitude, coords.longitude);
      }
    });

    mapRef.current = map;
    (window as any).luxewayMapInstance = map;

    map.on('load', () => {
      // Add source for vehicle points
      map.addSource('vehicles-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Cluster layers (invisible for hit test querying)
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'vehicles-source',
        filter: ['has', 'point_count'],
        paint: {
          'circle-radius': 22,
          'circle-opacity': 0,
          'circle-stroke-width': 0,
          'circle-stroke-color': 'transparent'
        }
      });

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'vehicles-source',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '({point_count})',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 0
        },
        paint: {
          'text-color': 'transparent'
        }
      });

      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'vehicles-source',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 0,
          'circle-opacity': 0
        }
      });

      // Click on cluster handler: zoom in
      map.on('click', 'clusters', async (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        if (!features.length) return;
        
        const clusterId = features[0].properties.cluster_id;
        const source = map.getSource('vehicles-source') as maplibregl.GeoJSONSource;
        
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          const coords = (features[0].geometry as any).coordinates;
          map.easeTo({
            center: coords,
            zoom: (zoom || 14) + 0.5,
            duration: 500
          });
        }).catch((err) => {
          console.error(err);
        });
      });

      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
      });

      const onMoveOrZoom = () => {
        updateMarkers();
      };
      
      map.on('move', onMoveOrZoom);
      map.on('moveend', onMoveOrZoom);
      map.on('zoom', onMoveOrZoom);
      map.on('zoomend', onMoveOrZoom);

      map.on('click', () => {
        if (onSelectionChange) {
          onSelectionChange([]);
        }
      });

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

      isMapLoadedRef.current = true;
      syncGeoJson();
      // Extra initial marker pass after style is stable
      setTimeout(() => updateMarkers(), 800);

      // Real-time geolocation auto-centering: only on full map pages, not embeds
      if (!disableAutoPan && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            map.flyTo({
              center: [lng, lat],
              zoom: 13.5,
              duration: 1500
            });
            
            const userLocEl = document.createElement('div');
            userLocEl.className = 'w-6 h-6 bg-blue-500 border-4 border-white rounded-full shadow-lg relative flex items-center justify-center';
            const pingEl = document.createElement('div');
            pingEl.className = 'absolute -inset-2 bg-blue-400/40 rounded-full animate-ping';
            userLocEl.appendChild(pingEl);
            
            new maplibregl.Marker({ element: userLocEl })
              .setLngLat([lng, lat])
              .addTo(map);

            if (onUserLocationChange) {
              onUserLocationChange(lat, lng);
            }
          },
          (err) => {
            console.warn('Automatic geolocation access was denied or failed:', err);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }
    });

    return () => {
      activeMarkersRef.current.forEach(m => m.remove());
      activeMarkersRef.current.clear();
      if (activePopupRef.current) {
        activePopupRef.current.remove();
      }
      map.remove();
      mapRef.current = null;
      isMapLoadedRef.current = false;
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

  // 3. Sync GeoJSON whenever vehicles or hover/select changes
  useEffect(() => {
    syncGeoJson();
  }, [vehicles, selectedVehicleId, hoveredVehicleId]);

  // 4. Zoom / Pan Fly camera & open popup when selectedVehicleId changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || vehicles.length === 0) return;
    if (disableAutoPan) return;

    if (selectedVehicleId) {
      const selected = vehicles.find(v => v.id === selectedVehicleId);
      if (selected) {
        const coords = resolveCoords(selected, vehicles.indexOf(selected));
        if (coords) {
          map.easeTo({
            center: [coords[1], coords[0]],
            zoom: 15.5,
            duration: 1500,
            essential: true
          });
          
          setTimeout(() => {
            if (activePopupRef.current) {
              activePopupRef.current.remove();
            }

            const popupContent = document.createElement('div');
            popupContent.className = 'flex gap-3 p-3 select-none items-center font-sans max-w-[280px] bg-[#0B1120] border border-[#1E2D45] rounded-2xl text-white shadow-2xl';
            
            const distanceKm = (selected as any).distanceKm;
            const distText = distanceKm !== null && distanceKm !== undefined
              ? `<span><i class="fa-solid fa-location-arrow text-[8px] text-[#C9A227] mr-0.5"></i>📍 ${Number(distanceKm).toFixed(1)} km</span>`
              : '';

            const searchParams = new URLSearchParams(window.location.search);
            const startDate = searchParams.get('startDate') || '';
            const endDate = searchParams.get('endDate') || '';
            const dateParams = (startDate && endDate) ? `?startDate=${startDate}&endDate=${endDate}` : '';

            const thumbnailSrc = (selected as any).images?.[0] || (selected as any).thumbnailUrl || (selected as any).thumbnail || FALLBACK_IMAGE;

            popupContent.innerHTML = `
              <img
                src="${thumbnailSrc}"
                alt="${selected.name}"
                class="w-16 h-16 object-cover rounded-xl border border-white/10 flex-shrink-0"
              />
              <div class="flex-1 min-w-0 pr-0.5">
                <span class="text-[8px] font-black text-[#C9A227] uppercase tracking-widest leading-none">${selected.brand || 'Luxury'}</span>
                <h4 class="font-extrabold text-xs text-white leading-tight truncate mt-0.5" title="${selected.name}">${selected.name}</h4>
                <div class="flex items-center gap-1 mt-0.5 text-xs">
                  <i class="fa-solid fa-star text-amber-500 text-[10px]"></i>
                  <span class="font-black text-[10px] text-white">${selected.rating ? Number(selected.rating).toFixed(1) : '5.0'}</span>
                  <span class="text-slate-400 text-[9px]">(${(selected as any).totalReviews || (selected as any).totalTrips || 0})</span>
                </div>
                <div class="flex items-center gap-2 mt-1 text-[9px] font-bold text-slate-400">
                  ${distText}
                </div>
                <div class="mt-2.5 flex items-center justify-between border-t border-slate-800/85 pt-2">
                  <span class="text-[10px] font-black text-[#C9A227]">${formatCurrency(selected.pricePerDay)}/ngày</span>
                  <a href="/marketplace/vehicles/${selected.id}${dateParams}" class="text-[9px] font-black bg-[#C9A227] hover:bg-[#E5C158] text-[#0B1120] px-2 py-1.5 rounded-lg transition-all shadow-md font-bold">Xem xe</a>
                </div>
              </div>
            `;

            const popup = new maplibregl.Popup({ closeButton: true, maxWidth: '300px', offset: 25 })
              .setLngLat([coords[1], coords[0]])
              .setDOMContent(popupContent)
              .addTo(map);

            activePopupRef.current = popup;
          }, 600);
          
          return;
        }
      }
    }
    
    if (vehicles.length > 1 && !selectedVehicleId) {
      try {
        const bounds = new maplibregl.LngLatBounds();
        let validCoordsCount = 0;
        vehicles.forEach((v, index) => {
          const coords = resolveCoords(v, index);
          if (coords) {
            bounds.extend([coords[1], coords[0]]);
            validCoordsCount++;
          }
        });
        if (validCoordsCount > 0) {
          map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 1200 });
        }
      } catch (e) {
        console.error(e);
      }
    } else if (vehicles.length === 1) {
      const coords = resolveCoords(vehicles[0], 0);
      if (coords) {
        map.easeTo({
          center: [coords[1], coords[0]],
          zoom: 15.5,
          duration: 1200,
          essential: true
        });
      }
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
    <div
      style={{ height, overscrollBehavior: 'contain' }}
      className="w-full h-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl relative z-10"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default LuxeWayMap;
