import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { mapService, BookingTrackingInfo } from '@/services/mapService';
import { vehicleService } from '@/services/vehicleService';
import { formatCurrency } from '@/utils';
import { useUIStore } from '@/store';
import { ArrowLeft, Navigation, MapPin, Compass, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const GOONG_MAPTILES_KEY = (import.meta as any).env.VITE_GOONG_MAPTILES_KEY || 'mock_goong_key';
const MAP_STYLE_URL = `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAPTILES_KEY}`;

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

export const CustomerBookingPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  const toast = useToast();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const vehicleMarkerRef = useRef<maplibregl.Marker | null>(null);
  const stompClientRef = useRef<Stomp.Client | null>(null);

  const [bookingInfo, setBookingInfo] = useState<BookingTrackingInfo | null>(null);
  const [vehicleLocation, setVehicleLocation] = useState<{ lat: number; lng: number; speed: number; heading: number } | null>(null);
  const [eta, setEta] = useState<number | null>(null); // in minutes
  const [loading, setLoading] = useState(true);

  // Smartcar IoT Control Panel State
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [togglingLock, setTogglingLock] = useState<boolean>(false);

  const handleLockToggle = async () => {
    if (!bookingInfo || !bookingInfo.vehicleId) return;
    
    setTogglingLock(true);
    try {
      const action = isLocked ? vehicleService.controlUnlock(bookingInfo.vehicleId) : vehicleService.controlLock(bookingInfo.vehicleId);
      const res = await action;
      
      if (res.success) {
        setIsLocked(res.isLocked);
        toast.success(
          res.isLocked ? 'Locked successfully!' : 'Unlocked successfully!',
          res.message
        );
      } else {
        toast.error('Control Action Failed', res.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Control Action Failed', 'An error occurred during vehicle command execution.');
    } finally {
      setTogglingLock(false);
    }
  };

  // 1. Fetch initial tracking info & draw static map elements
  useEffect(() => {
    if (!bookingId) return;

    mapService.getBookingTracking(bookingId)
      .then(info => {
        setBookingInfo(info);
        if (info.currentLat && info.currentLng) {
          setVehicleLocation({
            lat: info.currentLat,
            lng: info.currentLng,
            speed: 0,
            heading: 0
          });
        }
        setEta(info.estimatedTimeMin);
        
        // Fetch vehicle details lock status
        if (info.vehicleId) {
          vehicleService.getById(info.vehicleId)
            .then(vehicleData => {
              if (vehicleData && vehicleData.isLocked !== undefined) {
                setIsLocked(vehicleData.isLocked);
              }
            })
            .catch(err => console.error('Error fetching vehicle details:', err));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load booking tracking details', err);
        setLoading(false);
      });
  }, [bookingId]);

  // 2. Initialize MapLibre Map
  useEffect(() => {
    if (loading || !bookingInfo || !mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE_URL,
      center: [bookingInfo.pickupLng || 106.660, bookingInfo.pickupLat || 10.762],
      zoom: 13,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    mapRef.current = map;

    map.on('load', () => {
      // Fit bounds to cover pickup and dropoff
      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([bookingInfo.pickupLng, bookingInfo.pickupLat]);
      bounds.extend([bookingInfo.dropoffLng, bookingInfo.dropoffLat]);
      map.fitBounds(bounds, { padding: 80, maxZoom: 15 });

      // Draw Pickup Marker (Luxury Gold Glass Marker)
      const pickupEl = document.createElement('div');
      pickupEl.className = 'flex flex-col items-center select-none';
      pickupEl.innerHTML = `
        <div class="flex items-center justify-center w-8 h-8 rounded-full backdrop-blur-md bg-amber-500/80 border border-amber-300 shadow-lg text-white">
          <i class="fa-solid fa-house-user text-xs"></i>
        </div>
        <div class="mt-0.5 px-2 py-0.5 rounded bg-slate-900 text-[8px] font-black text-white uppercase tracking-wider">Pickup</div>
      `;
      new maplibregl.Marker({ element: pickupEl })
        .setLngLat([bookingInfo.pickupLng, bookingInfo.pickupLat])
        .addTo(map);

      // Draw Destination Marker (Luxury Cyan Glass Marker)
      const destEl = document.createElement('div');
      destEl.className = 'flex flex-col items-center select-none';
      destEl.innerHTML = `
        <div class="flex items-center justify-center w-8 h-8 rounded-full backdrop-blur-md bg-blue-500/80 border border-blue-300 shadow-lg text-white">
          <i class="fa-solid fa-flag text-xs"></i>
        </div>
        <div class="mt-0.5 px-2 py-0.5 rounded bg-slate-900 text-[8px] font-black text-white uppercase tracking-wider">Destination</div>
      `;
      new maplibregl.Marker({ element: destEl })
        .setLngLat([bookingInfo.dropoffLng, bookingInfo.dropoffLat])
        .addTo(map);

      // Draw Route Polyline
      if (bookingInfo.routePolyline) {
        const decodedCoords = decodePolyline(bookingInfo.routePolyline);
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

        // Add glow layer
        map.addLayer({
          id: 'route-glow',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 8,
            'line-opacity': 0.3
          }
        });

        // Add main route layer
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#2563eb',
            'line-width': 4
          }
        });
      }

      // Draw vehicle marker
      const initialLat = bookingInfo.currentLat || bookingInfo.pickupLat;
      const initialLng = bookingInfo.currentLng || bookingInfo.pickupLng;

      const vehicleEl = document.createElement('div');
      vehicleEl.className = 'flex flex-col items-center select-none relative z-50';
      vehicleEl.innerHTML = `
        <div class="pulse-ring absolute -inset-3 rounded-full border-2 border-emerald-500 animate-ping opacity-60 pointer-events-none"></div>
        <div class="relative flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-md bg-emerald-500 border border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.8)] text-white transition-all duration-300">
          <i class="fa-solid fa-car text-lg"></i>
        </div>
        <div class="mt-1 px-2.5 py-0.5 rounded bg-emerald-600 text-[9px] font-black text-white uppercase tracking-widest shadow-md">Driver</div>
      `;

      const vehicleMarker = new maplibregl.Marker({ element: vehicleEl })
        .setLngLat([initialLng, initialLat])
        .addTo(map);

      vehicleMarkerRef.current = vehicleMarker;
    });

    // 3. Connect to WebSockets
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = Stomp.over(socket);
    // Suppress spammy debug console logs
    stompClient.debug = () => {};

    stompClient.connect({}, () => {
      stompClientRef.current = stompClient;
      stompClient.subscribe(`/topic/tracking/${bookingInfo.bookingId}`, (message) => {
        const data = JSON.parse(message.body);
        
        // Handle lifecycle events
        if (data.event) {
          toast.info('Booking Status Updated', `The booking state is now: ${data.status}`);
          setBookingInfo(prev => prev ? { ...prev, status: data.status } : null);
          return;
        }

        if (data.lat !== undefined && data.lng !== undefined) {
          const lat = parseFloat(data.lat);
          const lng = parseFloat(data.lng);
          const speed = parseFloat(data.speed || 0);
          const heading = parseFloat(data.heading || 0);

          setVehicleLocation({ lat, lng, speed, heading });

          if (data.status) {
            setBookingInfo(prev => prev ? { ...prev, status: data.status } : null);
          }

          // Update ETA (Calculate simple countdown based on distance remaining or simulate steps)
          if (eta && eta > 1) {
            setEta(prev => (prev && prev > 1) ? prev - 1 : 1);
          }

          // Animate vehicle marker smoothly to new coordinates
          if (vehicleMarkerRef.current) {
            const currentMarker = vehicleMarkerRef.current;
            const startCoords = currentMarker.getLngLat();
            const targetCoords = [lng, lat];
            
            let start: number | null = null;
            const duration = 1200; // interpolate over 1.2s

            const animateMarker = (timestamp: number) => {
              if (!start) start = timestamp;
              const elapsed = timestamp - start;
              const progress = Math.min(elapsed / duration, 1);

              // Linear interpolation
              const curLng = startCoords.lng + (targetCoords[0] - startCoords.lng) * progress;
              const curLat = startCoords.lat + (targetCoords[1] - startCoords.lat) * progress;

              currentMarker.setLngLat([curLng, curLat]);

              if (progress < 1) {
                requestAnimationFrame(animateMarker);
              }
            };

            requestAnimationFrame(animateMarker);
          }
        }
      });
    }, (err) => {
      console.warn('Websockets connection lost. Reconnecting...', err);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (stompClientRef.current) {
        stompClientRef.current.disconnect(() => {});
        stompClientRef.current = null;
      }
    };
  }, [loading, bookingInfo]);

  if (loading) {
    return (
      <div className={`min-h-screen pt-20 flex flex-col items-center justify-center ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4" />
        <p className="text-sm font-bold uppercase tracking-wider">Loading GPS Tracking Coordinates...</p>
      </div>
    );
  }

  if (!bookingInfo) {
    return (
      <div className={`min-h-screen pt-20 flex flex-col items-center justify-center p-4 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="max-w-md text-center p-8 rounded-3xl bg-red-500/10 border border-red-500/20">
          <p className="text-sm font-bold text-red-500">Failed to retrieve coordinates for this booking or tracking is inactive.</p>
          <Link to="/dashboard/bookings" className="btn-primary mt-6 inline-block">Back to Bookings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-16 flex flex-col ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Upper Navigation Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-slate-900/60 backdrop-blur-md relative z-20">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/bookings" className="p-2.5 rounded-xl hover:bg-white/10 text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-tight">Active Delivery Tracking</h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Booking #{bookingInfo.bookingId.slice(-6).toUpperCase()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">{bookingInfo.status}</span>
        </div>
      </div>

      {/* Main Layout containing Map and Floating Glass Cards */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />
        
        {/* Floating Glass Panels */}
        <div className="absolute top-4 left-4 right-4 z-10 md:left-6 md:top-6 md:w-96 space-y-4">
          
          {/* Card 1: Live ETA Status Card */}
          <div className="rounded-[2rem] p-5 border border-white/10 shadow-2xl glass-dark text-white select-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimated Arrival</p>
                <h2 className="text-3xl font-black text-white mt-1 leading-none tracking-tight">
                  {eta ? `${eta} mins` : 'Calculating...'}
                </h2>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">Distance remaining: <span className="text-blue-400 font-bold">{bookingInfo.routeDistanceKm || '8.5'} km</span></p>
              </div>
              <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Navigation className="w-6 h-6 text-blue-400 transform rotate-45" />
              </div>
            </div>
          </div>

          {/* Card 2: Route Locations details */}
          <div className="rounded-[2rem] p-5 border border-white/10 shadow-2xl glass-dark text-white select-none">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0 text-amber-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pickup Address</p>
                  <p className="text-xs font-bold text-white mt-0.5 leading-relaxed line-clamp-1">{bookingInfo.pickupLocation || 'Ba Dinh, Hanoi'}</p>
                </div>
              </div>

              <div className="h-4 border-l border-dashed border-white/20 ml-4" />

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center flex-shrink-0 text-blue-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Delivery Address</p>
                  <p className="text-xs font-bold text-white mt-0.5 leading-relaxed line-clamp-1">{bookingInfo.deliveryAddress || 'Hoan Kiem, Hanoi'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Vehicle specs and GPS telematics */}
          <div className="rounded-[2rem] p-4.5 border border-white/10 shadow-2xl glass-dark text-white select-none">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-400 text-lg flex-shrink-0">
                <i className="fa-solid fa-car-side"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Assigned Vehicle</p>
                <h4 className="text-xs font-extrabold text-white truncate mt-0.5">{bookingInfo.vehicleName || 'Luxury Vehicle'}</h4>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] text-slate-300 font-semibold">Speed: <span className="font-extrabold text-white">{vehicleLocation?.speed ? vehicleLocation.speed.toFixed(0) : '0'} km/h</span></span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-arrows-to-dot text-emerald-400 text-sm"></i>
                <span className="text-[10px] text-slate-300 font-semibold">Heading: <span className="font-extrabold text-white">{vehicleLocation?.heading ? vehicleLocation.heading.toFixed(0) : '0'}°</span></span>
              </div>
            </div>
          </div>

          {/* Card 4: Smartcar Keyless Control Panel */}
          <div className="rounded-[2rem] p-5 border border-white/10 shadow-2xl glass-dark text-white select-none">
            <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-sm">
                  <i className="fa-solid fa-key"></i>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Smartcar Keyless Control</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">IoT Simulation (100% Real)</p>
                </div>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                isLocked 
                  ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {isLocked ? 'Locked' : 'Unlocked'}
              </span>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={handleLockToggle}
                disabled={togglingLock}
                className={`w-full py-3.5 rounded-xl font-display font-black uppercase text-xs tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 ${
                  isLocked 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10' 
                    : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/10'
                } disabled:opacity-50 disabled:pointer-events-none`}
              >
                {togglingLock ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Executing Command...
                  </>
                ) : isLocked ? (
                  <>
                    <i className="fa-solid fa-lock-open text-xs"></i>
                    Unlock Vehicle Doors
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-lock text-xs"></i>
                    Lock Vehicle Doors
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-450 leading-relaxed font-semibold">
                <div className="flex items-center gap-1.5 p-2.5 bg-slate-900/50 border border-white/5 rounded-xl">
                  <i className="fa-solid fa-gas-pump text-blue-400"></i>
                  <span>Fuel: <span className="text-white font-extrabold">78%</span></span>
                </div>
                <div className="flex items-center gap-1.5 p-2.5 bg-slate-900/50 border border-white/5 rounded-xl">
                  <i className="fa-solid fa-gauge text-blue-400"></i>
                  <span>Odo: <span className="text-white font-extrabold">12,450 km</span></span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerBookingPage;
