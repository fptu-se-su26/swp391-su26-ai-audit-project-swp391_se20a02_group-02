import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useUIStore } from '@/store';
import { formatCurrency } from '@/utils';
import type { Vehicle, VehicleLocationResponse } from '@/types';

import { getMapStyleUrl, installMapStyleFallback } from './mapStyle';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';

// ====== SPIDERFY CONFIG ======
const SPIDERFY_ZOOM_THRESHOLD = 16;
const SPIDERFY_RADIUS = 0.00028; // ~30m offset at city level
const SPIDERFY_LEG_COLOR = '#d1d5db';

// ====== ANIMATION CONFIG ======
const FLY_DURATION = 1200;
const MARKER_CLICK_SCALE_DURATION = 220;
const MOVE_DEBOUNCE_MS = 350;

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
  onMarkerHover?: (id: string | null) => void;
  onMapMoved?: () => void;
  onBoundsChange?: (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => void;
  height?: string;
  routePolyline?: string;
  pickupCoords?: [number, number];
  destCoords?: [number, number];
  interactive?: boolean;
  disableAutoPan?: boolean;
  initialCenter?: [number, number]; // [lng, lat]
  initialZoom?: number;
  /** If true, fitBounds will run on next vehicle update */
  shouldFitBounds?: boolean;
}

export const LuxeWayMap: React.FC<LuxeWayMapProps> = ({
  vehicles,
  selectedVehicleId,
  hoveredVehicleId,
  onVehicleClick,
  onUserLocationChange,
  onSelectionChange,
  onMarkerHover,
  onMapMoved,
  onBoundsChange,
  height = '100%',
  routePolyline,
  pickupCoords,
  destCoords,
  interactive = true,
  disableAutoPan = false,
  initialCenter,
  initialZoom,
  shouldFitBounds = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const activeMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const activePopupRef = useRef<maplibregl.Popup | null>(null);
  const routeMarkersRef = useRef<maplibregl.Marker[]>([]);
  const spiderLegsRef = useRef<maplibregl.Marker[]>([]);
  const isMapLoadedRef = useRef(false);
  const isUserDraggingRef = useRef(false);
  const moveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFitBoundsVehiclesRef = useRef<string>('');
  const [mapReady, setMapReady] = useState(false);
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  const mapStyleUrl = getMapStyleUrl(isDark);

  const selectedVehicleIdRef = useRef(selectedVehicleId);
  const hoveredVehicleIdRef = useRef(hoveredVehicleId);
  const vehiclesRef = useRef(vehicles);

  useEffect(() => { selectedVehicleIdRef.current = selectedVehicleId; }, [selectedVehicleId]);
  useEffect(() => { hoveredVehicleIdRef.current = hoveredVehicleId; }, [hoveredVehicleId]);
  useEffect(() => { vehiclesRef.current = vehicles; }, [vehicles]);

  const emitBounds = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = map.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    onBoundsChange?.({
      minLat: sw.lat,
      maxLat: ne.lat,
      minLng: sw.lng,
      maxLng: ne.lng,
    });
  }, [onBoundsChange]);

  // ====== COORDINATE RESOLUTION ======
  const resolveCoords = useCallback((v: any, index: number): [number, number] | null => {
    // Try direct latitude/longitude fields first (VehicleLocationResponse shape)
    let lat = v.latitude !== undefined ? v.latitude : v.location?.lat;
    let lng = v.longitude !== undefined ? v.longitude : v.location?.lng;

    // Also try nested location.latitude/longitude
    if ((typeof lat !== 'number' || lat === 0) && v.location) {
      lat = v.location.latitude ?? v.location.lat;
      lng = v.location.longitude ?? v.location.lng;
    }

    const isValid = typeof lat === 'number' && typeof lng === 'number'
      && lat !== 0 && lng !== 0
      && lat >= -90 && lat <= 90
      && lng >= -180 && lng <= 180;

    if (!isValid) {
      return null;
    }
    return [lat, lng];
  }, []);

  // ====== FORMAT PRICE ======
  const formatPrice = (pricePerDay: number): string => {
    if (pricePerDay >= 1000000) {
      return `${(pricePerDay / 1000000).toLocaleString('en-US', { maximumFractionDigits: 1 })}M`;
    }
    if (pricePerDay >= 1000) {
      return `${(pricePerDay / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K`;
    }
    return `${pricePerDay}`;
  };

  // ====== SPIDERFY: Spread overlapping markers at max zoom ======
  const clearSpiderLegs = () => {
    spiderLegsRef.current.forEach(m => m.remove());
    spiderLegsRef.current = [];
  };

  // ====== MARKER STYLING ======
  const getOrMakeInner = (markerEl: HTMLDivElement): HTMLDivElement => {
    let inner = markerEl.querySelector('.luxeway-marker-inner') as HTMLDivElement;
    if (!inner) {
      inner = document.createElement('div');
      inner.className = 'luxeway-marker-inner';
      markerEl.appendChild(inner);
    }
    return inner;
  };

  const applyMarkerStyle = (markerEl: HTMLDivElement, vehicle: any, isSelected: boolean, isHovered: boolean) => {
    const el = getOrMakeInner(markerEl);
    const thumbnailSrc = vehicle.thumbnailUrl || vehicle.thumbnail || vehicle.image || FALLBACK_IMAGE;
    const displayPrice = formatPrice(vehicle.pricePerDay || vehicle.finalPrice || 0);

    el.style.cssText = `
      display:flex; align-items:center; gap:7px;
      padding:4px 12px 4px 4px; background:#ffffff;
      border:${isSelected ? '2.5px' : '2px'} solid ${isSelected ? '#D4AF37' : isHovered ? '#D4AF37' : '#0F172A'};
      border-radius:999px;
      box-shadow:${isSelected
        ? '0 0 0 4px rgba(212,175,55,0.28), 0 12px 28px rgba(15,23,42,0.24)'
        : isHovered
          ? '0 0 0 3px rgba(212,175,55,0.22), 0 10px 22px rgba(15,23,42,0.2)'
          : '0 8px 18px rgba(15,23,42,0.18)'};
      font-size:13px; font-weight:900; color:#0f172a;
      cursor:pointer; user-select:none;
      transform:scale(${isSelected ? '1.08' : '1'});
      transition:all 250ms cubic-bezier(0.4,0,0.2,1);
      z-index:${isSelected ? '999' : isHovered ? '45' : '30'};
      white-space:nowrap;
      position:relative;
    `;

    el.innerHTML = `
      <img src="${thumbnailSrc}" alt="" style="width:34px;height:34px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid #f8fafc;background:#e2e8f0;" onerror="this.style.display='none'" />
      <span>${displayPrice}</span>
      <span style="position:absolute;left:50%;bottom:-8px;width:12px;height:12px;background:#D4AF37;border-right:2px solid #0F172A;border-bottom:2px solid #0F172A;transform:translateX(-50%) rotate(45deg);border-radius:0 0 3px 0;"></span>
    `;
  };

  const applyClusterStyle = (markerEl: HTMLDivElement, count: number, isHovered: boolean = false) => {
    const el = getOrMakeInner(markerEl);
    const label = count >= 100 ? '99+' : `${count} xe`;
    el.style.cssText = `
      display:flex; align-items:center; justify-content:center;
      min-width:58px; height:40px; padding:0 16px;
      background:#0f172a; border:2px solid #D4AF37;
      border-radius:999px;
      box-shadow:${isHovered ? '0 14px 30px rgba(15,23,42,0.28)' : '0 10px 22px rgba(15,23,42,0.22)'};
      font-size:13px; font-weight:900; color:#ffffff;
      cursor:pointer; user-select:none;
      transform:scale(${isHovered ? '1.05' : '1'});
      transition:all 200ms ease-out;
    `;
    el.textContent = label;
  };

  // ====== MARKER CLICK ANIMATION ======
  const animateMarkerClick = (markerEl: HTMLDivElement) => {
    const el = getOrMakeInner(markerEl);
    el.style.transition = `transform ${MARKER_CLICK_SCALE_DURATION}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
    el.style.transform = 'scale(1.15)';
    setTimeout(() => {
      const isStillSelected = selectedVehicleIdRef.current === markerEl.dataset.vehicleId;
      el.style.transform = isStillSelected ? 'scale(1.08)' : 'scale(1)';
    }, MARKER_CLICK_SCALE_DURATION);
  };

  // ====== UPDATE MARKERS (Main Render Loop) ======
  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !isMapLoadedRef.current) return;

    const currentVehicles = vehiclesRef.current;
    if (currentVehicles.length === 0) {
      // Clear all markers when no vehicles
      activeMarkersRef.current.forEach(m => m.remove());
      activeMarkersRef.current.clear();
      clearSpiderLegs();
      return;
    }

    const currentZoom = map.getZoom();
    const bounds = map.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    // ====== CLUSTERING (JS-based spatial) ======
    const threshold = currentZoom < 8 ? 0.35 : currentZoom < 10 ? 0.16 : currentZoom < 12 ? 0.08 : currentZoom < 13.5 ? 0.03 : 0.005;

    interface MapCluster {
      id: string;
      lat: number;
      lng: number;
      count: number;
      vehicles: any[];
    }

    const clusters: MapCluster[] = [];

    const addVehicleToCluster = (v: any, index: number, enforceViewport: boolean) => {
      const coords = resolveCoords(v, index);
      if (!coords) return;
      const [lat, lng] = coords;

      // ====== VIEWPORT FILTERING (Marker Virtualization) ======
      if (enforceViewport && (lng < sw.lng || lng > ne.lng || lat < sw.lat || lat > ne.lat)) return;

      let found = false;
      for (const c of clusters) {
        const dist = Math.sqrt(Math.pow(c.lat - lat, 2) + Math.pow(c.lng - lng, 2));
        if (dist < threshold) {
          c.vehicles.push(v);
          c.count++;
          c.lat = (c.lat * (c.count - 1) + lat) / c.count;
          c.lng = (c.lng * (c.count - 1) + lng) / c.count;
          found = true;
          break;
        }
      }

      if (!found) {
        clusters.push({ id: `cluster-${v.id}`, lat, lng, count: 1, vehicles: [v] });
      }
    };

    currentVehicles.forEach((v, index) => {
      addVehicleToCluster(v, index, true);
    });

    if (clusters.length === 0 && currentVehicles.length > 0) {
      currentVehicles.forEach((v, index) => {
        addVehicleToCluster(v, index, false);
      });
    }

    // ====== SPIDERFY: At max zoom, spread overlapping clusters ======
    clearSpiderLegs();
    const spiderfiedClusters: MapCluster[] = [];

    clusters.forEach(c => {
      if (c.count > 1 && currentZoom >= SPIDERFY_ZOOM_THRESHOLD) {
        // Spiderfy: distribute into individual markers in a circle
        const angleStep = (2 * Math.PI) / c.count;
        c.vehicles.forEach((v, i) => {
          const angle = i * angleStep;
          const offsetLat = c.lat + SPIDERFY_RADIUS * Math.cos(angle);
          const offsetLng = c.lng + SPIDERFY_RADIUS * Math.sin(angle);
          spiderfiedClusters.push({
            id: v.id,
            lat: offsetLat,
            lng: offsetLng,
            count: 1,
            vehicles: [v],
          });

          // Draw spider leg (line from center to offset)
          const legEl = document.createElement('div');
          legEl.style.cssText = `
            position:absolute; width:1px; height:1px;
            pointer-events:none; z-index:1;
          `;
          // Simple visual: a thin dotted line marker at center
          const legMarker = new maplibregl.Marker({ element: legEl })
            .setLngLat([c.lng, c.lat])
            .addTo(map);
          spiderLegsRef.current.push(legMarker);
        });
      } else {
        spiderfiedClusters.push(c);
      }
    });

    // ====== RENDER MARKERS ======
    const visibleIds = new Set<string>();

    spiderfiedClusters.forEach(c => {
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
            map.flyTo({
              center: [c.lng, c.lat],
              zoom: Math.min(18, map.getZoom() + 2),
              duration: FLY_DURATION,
              essential: true,
              curve: 1.42,
            });
            if (onSelectionChange) onSelectionChange(c.vehicles);
          });
          markerEl.addEventListener('mouseenter', () => {
            applyClusterStyle(markerEl, c.count, true);
          });
          markerEl.addEventListener('mouseleave', () => {
            applyClusterStyle(markerEl, c.count, false);
          });
        } else {
          const singleVehicle = c.vehicles[0];
          markerEl.dataset.vehicleId = singleVehicle.id;

          markerEl.addEventListener('click', (e) => {
            e.stopPropagation();
            animateMarkerClick(markerEl);
            if (onSelectionChange) onSelectionChange([singleVehicle]);

            // Remove previous popup if any
            if (activePopupRef.current) {
              activePopupRef.current.remove();
              activePopupRef.current = null;
            }

            // Create interactive MapLibre Popup over marker
            const popupContent = document.createElement('div');
            popupContent.style.cssText = 'padding:10px; width:240px; font-family:sans-serif; background:#ffffff; border-radius:16px; border:2px solid #D4AF37; box-shadow:0 16px 36px rgba(15,23,42,0.25); color:#0f172a;';

            const thumb = singleVehicle.thumbnailUrl || singleVehicle.thumbnail || singleVehicle.image || FALLBACK_IMAGE;
            const priceStr = formatCurrency(singleVehicle.pricePerDay || singleVehicle.finalPrice || 0);

            popupContent.innerHTML = `
              <div style="position:relative; width:100%; height:120px; border-radius:12px; overflow:hidden; margin-bottom:8px; background:#f1f5f9; cursor:pointer;" onclick="window.location.href='/vehicles/${singleVehicle.id}'">
                <img src="${thumb}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='${FALLBACK_IMAGE}'" />
                ${singleVehicle.instantBook ? '<span style="position:absolute; top:6px; left:6px; background:#fbbf24; color:#0f172a; font-size:10px; font-weight:900; padding:2px 6px; border-radius:6px; text-transform:uppercase;">⚡ Đặt ngay</span>' : ''}
              </div>
              <h4 style="font-size:12px; font-weight:900; margin:0 0 4px 0; text-transform:uppercase; color:#0f172a; line-height:1.3; display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden; cursor:pointer;" onclick="window.location.href='/vehicles/${singleVehicle.id}'">
                ${singleVehicle.name}
              </h4>
              <div style="display:flex; align-items:center; gap:6px; font-size:11px; color:#64748b; margin-bottom:8px;">
                <span style="color:#f59e0b; font-weight:bold;">⭐ ${Number(singleVehicle.rating || 5.0).toFixed(1)}</span>
                <span>·</span>
                <span style="font-weight:600;">${singleVehicle.totalTrips || 0} chuyến</span>
              </div>
              <div style="font-size:10px; color:#94a3b8; margin-bottom:10px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                📍 ${singleVehicle.address || singleVehicle.city || 'Việt Nam'}
              </div>
              <div style="display:flex; align-items:center; justify-content:space-between; padding-top:8px; border-top:1px solid #f1f5f9;">
                <div>
                  <span style="font-size:14px; font-weight:900; color:#D4AF37;">${priceStr}</span>
                  <span style="font-size:10px; color:#64748b; font-weight:600;">/ngày</span>
                </div>
                <button id="popup-book-btn-${singleVehicle.id}" style="background:#D4AF37; color:#0f172a; border:none; padding:7px 14px; border-radius:10px; font-size:11px; font-weight:900; cursor:pointer; transition:transform 150ms; white-space:nowrap;" onclick="window.location.href='/vehicles/${singleVehicle.id}'">
                  ĐẶT XE NGAY →
                </button>
              </div>
            `;

            popupContent.addEventListener('click', (ev) => {
              ev.stopPropagation();
              if (onVehicleClick) {
                onVehicleClick(singleVehicle);
              } else {
                window.location.href = `/vehicles/${singleVehicle.id}`;
              }
            });

            const popup = new maplibregl.Popup({
              offset: 24,
              closeButton: true,
              closeOnClick: false,
              anchor: 'bottom',
              maxWidth: '280px',
            })
              .setLngLat([c.lng, c.lat])
              .setDOMContent(popupContent)
              .addTo(map);

            activePopupRef.current = popup;
          });

          markerEl.addEventListener('mouseenter', () => {
            if (onMarkerHover) onMarkerHover(singleVehicle.id);
            if (selectedVehicleIdRef.current !== singleVehicle.id) {
              applyMarkerStyle(markerEl, singleVehicle, false, true);
            }
          });

          markerEl.addEventListener('mouseleave', () => {
            if (onMarkerHover) onMarkerHover(null);
            if (selectedVehicleIdRef.current !== singleVehicle.id) {
              applyMarkerStyle(markerEl, singleVehicle, false, false);
            }
          });
        }
      } else {
        markerEl = marker.getElement() as HTMLDivElement;
        marker.setLngLat([c.lng, c.lat]);
      }

      // Apply current visual state
      if (isCluster) {
        applyClusterStyle(markerEl, c.count, false);
      } else {
        const sv = c.vehicles[0];
        const isSelected = selectedVehicleIdRef.current === sv.id;
        const isHovered = hoveredVehicleIdRef.current === sv.id;
        applyMarkerStyle(markerEl, sv, isSelected, isHovered);
      }
    });

    // Remove markers no longer visible
    activeMarkersRef.current.forEach((marker, id) => {
      if (!visibleIds.has(id)) {
        marker.remove();
        activeMarkersRef.current.delete(id);
      }
    });
  }, [resolveCoords, onSelectionChange, onVehicleClick, onMarkerHover]);

  // ====== HOVER SYNC: Update marker styles when hoveredVehicleId changes from parent ======
  useEffect(() => {
    activeMarkersRef.current.forEach((marker, id) => {
      const el = marker.getElement() as HTMLDivElement;
      if (!el.dataset.vehicleId) return; // Skip clusters
      const vehicle = vehiclesRef.current.find(v => v.id === id);
      if (!vehicle) return;
      const isSelected = selectedVehicleIdRef.current === id;
      const isHovered = hoveredVehicleId === id;
      applyMarkerStyle(el, vehicle, isSelected, isHovered);
    });
  }, [hoveredVehicleId]);

  // ====== VEHICLE/SELECTION CHANGES → Update Markers ======
  useEffect(() => {
    vehiclesRef.current = vehicles;
    selectedVehicleIdRef.current = selectedVehicleId;
    const t1 = setTimeout(() => updateMarkers(), 50);
    const t2 = setTimeout(() => updateMarkers(), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [vehicles, selectedVehicleId, mapReady, updateMarkers]);

  // ====== INITIALIZE MAP ======
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const defaultCenter: [number, number] = initialCenter || [106.660, 10.762]; // HCM default
    const defaultZoom = initialZoom || 12.5; // City-level, never show whole Vietnam

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyleUrl,
      center: defaultCenter,
      zoom: defaultZoom,
      attributionControl: false,
      interactive,
    });

    // Navigation controls (zoom +/-)
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    installMapStyleFallback(map, isDark);

    mapRef.current = map;
    (window as any).luxewayMapInstance = map;

    map.on('load', () => {
      // Add GeoJSON source for potential layer queries
      map.addSource('vehicles-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Invisible cluster/point layers for hit testing
      map.addLayer({
        id: 'clusters', type: 'circle', source: 'vehicles-source',
        filter: ['has', 'point_count'],
        paint: { 'circle-radius': 0, 'circle-opacity': 0 },
      });
      map.addLayer({
        id: 'unclustered-point', type: 'circle', source: 'vehicles-source',
        filter: ['!', ['has', 'point_count']],
        paint: { 'circle-radius': 0, 'circle-opacity': 0 },
      });

      // ====== MAP MOVEMENT: Detect user drag vs programmatic ======
      map.on('dragstart', () => { isUserDraggingRef.current = true; });

      const handleMoveEnd = () => {
        // Debounce move events for performance
        if (moveDebounceRef.current) clearTimeout(moveDebounceRef.current);
        moveDebounceRef.current = setTimeout(() => {
          updateMarkers();
          emitBounds();
          if (isUserDraggingRef.current && onMapMoved) {
            onMapMoved();
            isUserDraggingRef.current = false;
          }
        }, MOVE_DEBOUNCE_MS);
      };

      map.on('moveend', handleMoveEnd);
      map.on('zoomend', () => {
        updateMarkers();
        emitBounds();
      });

      // Click on empty map → deselect
      map.on('click', (e) => {
        // Check if click was on a marker
        const features = map.queryRenderedFeatures(e.point);
        if (features.length === 0) {
          if (onSelectionChange) onSelectionChange([]);
        }
      });

      // 3D buildings layer (subtle, not overpowering)
      try {
        const layers = map.getStyle().layers;
        let labelLayerId;
        for (let i = 0; i < layers.length; i++) {
          if (layers[i].type === 'symbol' && layers[i].layout && (layers[i].layout as any)['text-field']) {
            labelLayerId = layers[i].id;
            break;
          }
        }

        const sources = map.getStyle().sources || {};
        if (sources.composite && !map.getLayer('3d-buildings')) {
          map.addLayer({
            id: '3d-buildings', source: 'composite', 'source-layer': 'building',
            filter: ['==', 'extrude', 'true'], type: 'fill-extrusion', minzoom: 15,
            paint: {
              'fill-extrusion-color': isDark ? '#1f2937' : '#e5e7eb',
              'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'height']],
              'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'min_height']],
              'fill-extrusion-opacity': 0.6,
            },
          }, labelLayerId);
        }
      } catch (err) {
        // 3D buildings not available on all tile sets
      }

      isMapLoadedRef.current = true;
      setMapReady(true);
      updateMarkers();
      emitBounds();
      setTimeout(() => updateMarkers(), 800);
    });

    return () => {
      activeMarkersRef.current.forEach(m => m.remove());
      activeMarkersRef.current.clear();
      clearSpiderLegs();
      routeMarkersRef.current.forEach(m => m.remove());
      routeMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
      isMapLoadedRef.current = false;
      setMapReady(false);
      if (moveDebounceRef.current) clearTimeout(moveDebounceRef.current);
    };
  }, [interactive]);

  // ====== THEME CHANGE ======
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoadedRef.current) return;
    map.setStyle(mapStyleUrl);
  }, [mapStyleUrl]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    try {
      if (map.getLayer('3d-buildings')) {
        map.setPaintProperty('3d-buildings', 'fill-extrusion-color', isDark ? '#1f2937' : '#e5e7eb');
      }
    } catch (e) { /* */ }
  }, [isDark]);

  // ====== FIT BOUNDS / FLY TO SELECTED ======
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !isMapLoadedRef.current || vehicles.length === 0) return;
    if (disableAutoPan) return;

    // If a vehicle is selected, fly to it (premium animation)
    if (selectedVehicleId) {
      const selected = vehicles.find(v => v.id === selectedVehicleId);
      if (selected) {
        const coords = resolveCoords(selected, vehicles.indexOf(selected));
        if (coords) {
          map.flyTo({
            center: [coords[1], coords[0]],
            zoom: Math.max(map.getZoom(), 14.5),
            duration: FLY_DURATION,
            essential: true,
            curve: 1.42,
          });
          return;
        }
      }
    }

    // ====== SMART FIT BOUNDS ======
    // Only fit on first load or when vehicles change (not on user pan)
    if (!shouldFitBounds) return;
    const vehicleIds = vehicles.map(v => v.id).sort().join(',');
    const fitKey = `${vehicleIds}|${initialCenter?.join(',') || ''}|${initialZoom || ''}`;
    if (fitKey === lastFitBoundsVehiclesRef.current) return;
    lastFitBoundsVehiclesRef.current = fitKey;

    if (vehicles.length === 1) {
      const coords = resolveCoords(vehicles[0], 0);
      if (coords) {
        map.flyTo({
          center: [coords[1], coords[0]],
          zoom: 15,
          duration: FLY_DURATION,
          essential: true,
          curve: 1.42,
        });
      }
    } else if (vehicles.length > 1 && shouldFitBounds) {
      try {
        const bounds = new maplibregl.LngLatBounds();
        let validCount = 0;
        vehicles.forEach((v, i) => {
          const coords = resolveCoords(v, i);
          if (coords) {
            bounds.extend([coords[1], coords[0]]);
            validCount++;
          }
        });
        if (validCount > 0) {
          map.fitBounds(bounds, {
            padding: { top: 90, bottom: 180, left: 70, right: 70 },
            maxZoom: initialCenter ? 13.5 : 11.5,
            duration: FLY_DURATION,
          });
        }
      } catch (e) {
        console.error('fitBounds error:', e);
      }
    }
  }, [vehicles, selectedVehicleId, shouldFitBounds, resolveCoords, disableAutoPan, mapReady, initialCenter, initialZoom]);

  // ====== FLY TO INITIAL CENTER when it changes (city switch) ======
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoadedRef.current || !initialCenter) return;
    map.flyTo({
      center: initialCenter,
      zoom: initialZoom || 12.5,
      duration: FLY_DURATION,
      essential: true,
      curve: 1.42,
    });
  }, [initialCenter?.[0], initialCenter?.[1]]);

  // ====== ROUTE POLYLINE ======
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
            type: 'Feature', properties: {},
            geometry: { type: 'LineString', coordinates: geojsonCoordinates },
          },
        });

        map.addLayer({
          id: 'route-glow', type: 'line', source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#f59e0b', 'line-width': 8, 'line-opacity': 0.25 },
        });

        map.addLayer({
          id: 'route-line', type: 'line', source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#d97706', 'line-width': 4 },
        });

        try {
          const bounds = new maplibregl.LngLatBounds();
          geojsonCoordinates.forEach(coord => bounds.extend([coord[0], coord[1]]));
          map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: FLY_DURATION });
        } catch (e) { console.error(e); }
      }
    };

    if (map.isStyleLoaded()) updateRoute();
    else map.on('style.load', updateRoute);
    return () => { map.off('style.load', updateRoute); };
  }, [routePolyline]);

  // ====== PICKUP & DESTINATION PINS ======
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
        .setLngLat([pickupCoords[1], pickupCoords[0]]).addTo(map);
      const m2 = new maplibregl.Marker({ element: pinDest })
        .setLngLat([destCoords[1], destCoords[0]]).addTo(map);

      routeMarkersRef.current = [m1, m2];
    }
  }, [pickupCoords, destCoords]);

  return (
    <div
      style={{ height, overscrollBehavior: 'contain' }}
      className="w-full h-full overflow-hidden relative z-10"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default LuxeWayMap;
