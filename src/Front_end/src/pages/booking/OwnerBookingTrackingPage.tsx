import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { mapService, BookingTrackingInfo } from '@/services/mapService';
import { WS_URL } from '@/utils';
import { useUIStore } from '@/store';
import { ArrowLeft, Play, Square, Compass, RefreshCw, Layers } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { bookingService } from '@/services/bookingService';
import { getMapStyleUrl, installMapStyleFallback } from '@/components/map/mapStyle';

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

// Calculate compass heading
function calculateHeading(from: [number, number], to: [number, number]): number {
  const lat1 = from[0] * Math.PI / 180;
  const lon1 = from[1] * Math.PI / 180;
  const lat2 = to[0] * Math.PI / 180;
  const lon2 = to[1] * Math.PI / 180;
  
  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  let brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

export const OwnerBookingTrackingPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  const toast = useToast();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const vehicleMarkerRef = useRef<maplibregl.Marker | null>(null);
  const stompClientRef = useRef<Stomp.Client | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [bookingInfo, setBookingInfo] = useState<BookingTrackingInfo | null>(null);
  const [vehicleLocation, setVehicleLocation] = useState<{ lat: number; lng: number; speed: number; heading: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const normalizedBookingStatus = String(bookingInfo?.status || '').toLowerCase();
  const isWaitingForCustomerPayment = ['waiting_payment', 'payment_rejected', 'payment_expired'].includes(normalizedBookingStatus);
  const isWaitingForPaymentReview = normalizedBookingStatus === 'payment_pending';
  const isCancelled = normalizedBookingStatus.includes('cancel');
  const isCompleted = ['completed', 'return_completed'].includes(normalizedBookingStatus);
  const canStartPickup = ['confirmed', 'payment_verified', 'owner_approved', 'ready_for_pickup'].includes(normalizedBookingStatus);
  const canStartTrip = ['picking_up', 'ready_for_pickup', 'checked_out'].includes(normalizedBookingStatus);
  const canCompleteTrip = ['active', 'in_progress', 'in_rental', 'return_pending'].includes(normalizedBookingStatus);

  const lifecycleMessage = (() => {
    if (isWaitingForCustomerPayment) {
      return {
        title: 'Waiting for customer payment',
        body: 'The renter has signed or prepared the booking but has not completed payment yet. Owner lifecycle actions are locked until payment is submitted and confirmed.',
        tone: 'amber',
      };
    }
    if (isWaitingForPaymentReview) {
      return {
        title: 'Payment submitted - waiting review',
        body: 'The renter has submitted payment. Keep the vehicle reserved, then wait for admin/payment confirmation before pickup or trip actions.',
        tone: 'blue',
      };
    }
    if (isCancelled) {
      return {
        title: 'Booking is cancelled',
        body: 'This booking has been cancelled. Tracking and trip lifecycle actions are closed.',
        tone: 'red',
      };
    }
    if (isCompleted) {
      return {
        title: 'Trip completed',
        body: 'The rental lifecycle is complete. No further owner transition is required.',
        tone: 'emerald',
      };
    }
    return null;
  })();

  const handleUpdateBookingStatus = async (newStatus: 'picking_up' | 'active' | 'completed') => {
    if (!bookingId) return;
    setUpdatingStatus(true);
    try {
      const res = await bookingService.updateStatus(bookingId, newStatus);
      if (res) {
        toast.success('Status Updated', `Booking status transitioned to ${newStatus.toUpperCase()}`);
        setBookingInfo(prev => prev ? { ...prev, status: newStatus.toUpperCase() } : null);
      } else {
        toast.error('Update Failed', 'Failed to update booking status state on the backend.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Update Failed', 'An error occurred while calling update status API.');
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  // Simulator State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simIndex, setSimIndex] = useState(0);
  const [simCoords, setSimCoords] = useState<[number, number][]>([]);
  const [vehicleStatus, setVehicleStatus] = useState('DELIVERING');

  // 1. Fetchinitial coordinate data
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
        
        // Decode polyline points for simulator
        if (info.routePolyline) {
          const coords = decodePolyline(info.routePolyline);
          setSimCoords(coords);
        }
        
        if (info.locationStatus) {
          setVehicleStatus(info.locationStatus);
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load tracking data for owner', err);
        setLoading(false);
      });
  }, [bookingId]);

  // 2. Initialize MapLibre Map
  useEffect(() => {
    if (loading || !bookingInfo || !mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapStyleUrl(isDark),
      center: [bookingInfo.pickupLng || 106.660, bookingInfo.pickupLat || 10.762],
      zoom: 13,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    installMapStyleFallback(map, isDark);
    mapRef.current = map;

    map.on('load', () => {
      // Fit bounds
      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([bookingInfo.pickupLng, bookingInfo.pickupLat]);
      bounds.extend([bookingInfo.dropoffLng, bookingInfo.dropoffLat]);
      map.fitBounds(bounds, { padding: 80, maxZoom: 15 });

      // Draw Pickup Pin
      const pickupEl = document.createElement('div');
      pickupEl.className = 'flex flex-col items-center select-none';
      pickupEl.innerHTML = `
        <div class="flex items-center justify-center w-8 h-8 rounded-full backdrop-blur-md bg-amber-500/80 border border-amber-300 shadow-lg text-white">
          <i class="fa-solid fa-house-user text-xs"></i>
        </div>
      `;
      new maplibregl.Marker({ element: pickupEl })
        .setLngLat([bookingInfo.pickupLng, bookingInfo.pickupLat])
        .addTo(map);

      // Draw Dropoff Pin
      const destEl = document.createElement('div');
      destEl.className = 'flex flex-col items-center select-none';
      destEl.innerHTML = `
        <div class="flex items-center justify-center w-8 h-8 rounded-full backdrop-blur-md bg-blue-500/80 border border-blue-300 shadow-lg text-white">
          <i class="fa-solid fa-flag text-xs"></i>
        </div>
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

        map.addLayer({
          id: 'route-glow',
          type: 'line',
          source: 'route',
          paint: {
            'line-color': '#3b82f6',
            'line-width': 8,
            'line-opacity': 0.3
          }
        });

        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
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
      `;

      const vehicleMarker = new maplibregl.Marker({ element: vehicleEl })
        .setLngLat([initialLng, initialLat])
        .addTo(map);

      vehicleMarkerRef.current = vehicleMarker;
    });

    // 4. Connect WebSockets Stomp client
    const socket = new SockJS(WS_URL);
    const stompClient = Stomp.over(socket);
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

          // Smooth marker slide interpolation
          if (vehicleMarkerRef.current) {
            const currentMarker = vehicleMarkerRef.current;
            const startCoords = currentMarker.getLngLat();
            const targetCoords = [lng, lat];
            
            let start: number | null = null;
            const duration = 1200;

            const animateMarker = (timestamp: number) => {
              if (!start) start = timestamp;
              const elapsed = timestamp - start;
              const progress = Math.min(elapsed / duration, 1);

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
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [loading, bookingInfo]);

  // 5. Start / Stop Simulator logic
  const toggleSimulation = () => {
    if (isSimulating) {
      // Stop
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      setIsSimulating(false);
    } else {
      // Start
      if (simCoords.length === 0) return;
      setIsSimulating(true);
      
      let index = simIndex;
      
      const interval = setInterval(async () => {
        if (index >= simCoords.length) {
          clearInterval(interval);
          setIsSimulating(false);
          setSimIndex(0);
          return;
        }

        const point = simCoords[index];
        const nextPoint = index < simCoords.length - 1 ? simCoords[index + 1] : point;
        
        const heading = calculateHeading(point, nextPoint);
        const speed = index === simCoords.length - 1 ? 0 : 45 + Math.random() * 15; // km/h

        // Post coordinate telemetry to backend update endpoint
        await mapService.updateTrackingLocation({
          vehicleId: bookingInfo!.vehicleId!,
          lat: point[0],
          lng: point[1],
          speed,
          heading,
          bookingId: bookingInfo!.bookingId,
          status: vehicleStatus
        });

        setSimIndex(index);
        index++;
      }, 3000); // Trigger coordinates push every 3 seconds

      simulationIntervalRef.current = interval;
    }
  };

  const resetSimulation = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setIsSimulating(false);
    setSimIndex(0);
    if (simCoords.length > 0 && vehicleMarkerRef.current) {
      vehicleMarkerRef.current.setLngLat([bookingInfo!.pickupLng, bookingInfo!.pickupLat]);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen pt-20 flex flex-col items-center justify-center ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4" />
        <p className="text-sm font-bold uppercase tracking-wider">Loading GPS Simulator Control Console...</p>
      </div>
    );
  }

  if (!bookingInfo) {
    return (
      <div className={`min-h-screen pt-20 flex flex-col items-center justify-center p-4 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="max-w-md text-center p-8 rounded-3xl bg-red-500/10 border border-red-500/20">
          <p className="text-sm font-bold text-red-500">Failed to retrieve coordinates for this booking or tracking is inactive.</p>
          <Link to="/owner/bookings" className="btn-primary mt-6 inline-block">Back to Host Bookings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-16 flex flex-col ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Upper Navigation Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-slate-900/60 backdrop-blur-md relative z-20">
        <div className="flex items-center gap-3">
          <Link to="/owner/bookings" className="p-2.5 rounded-xl hover:bg-white/10 text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-extrabold text-sm text-white tracking-tight">GPS Telemetry Simulator & Monitor</h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Booking #{bookingInfo.bookingId.slice(-6).toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Main Layout containing Map and Floating Glass Control Console */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />
        
        {/* Floating Glass Panels */}
        <div className="absolute top-4 left-4 right-4 z-10 md:left-6 md:top-6 md:w-96 space-y-4">
          
          {/* Card 1: GPS Control Console */}
          <div className="rounded-[2rem] p-5 border border-white/10 shadow-2xl glass-dark text-white select-none">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white tracking-tight">Simulator Console</h3>
            </div>

            <div className="space-y-4">
              {/* Simulator Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={toggleSimulation}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                    isSimulating 
                      ? 'bg-red-500 hover:bg-red-650 text-white shadow-lg shadow-red-500/20' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
                  }`}
                >
                  {isSimulating ? (
                    <>
                      <Square className="w-4 h-4 fill-white" /> Stop Simulation
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" /> Start Simulation
                    </>
                  )}
                </button>
                <button
                  onClick={resetSimulation}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
                  title="Reset Simulator"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              {simCoords.length > 0 && (
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                    <span>PROGRESS</span>
                    <span>{simIndex + 1} / {simCoords.length} STEPS</span>
                  </div>
                  <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-blue-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${((simIndex + 1) / simCoords.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Status Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  Vehicle Status Modifier
                </label>
                <select
                  value={vehicleStatus}
                  onChange={e => setVehicleStatus(e.target.value)}
                  className="w-full bg-slate-850 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 font-bold"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="BOOKED">BOOKED</option>
                  <option value="DELIVERING">DELIVERING (Transit)</option>
                  <option value="RENTING">RENTING (Active Trip)</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 1.5: Booking Status Transitions */}
          <div className="rounded-[2rem] p-5 border border-white/10 shadow-2xl glass-dark text-white select-none">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-455">
                <i className="fa-solid fa-route text-sm"></i>
              </div>
              <h3 className="font-bold text-sm text-white tracking-tight">Booking Lifecycle</h3>
            </div>

            <div className="space-y-2.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current State: <span className="text-emerald-450 font-extrabold">{bookingInfo.status}</span></p>
              
              {lifecycleMessage ? (
                <div className={`rounded-2xl border p-4 text-xs leading-relaxed ${
                  lifecycleMessage.tone === 'amber'
                    ? 'border-amber-400/30 bg-amber-400/10 text-amber-100'
                    : lifecycleMessage.tone === 'blue'
                      ? 'border-blue-400/30 bg-blue-400/10 text-blue-100'
                      : lifecycleMessage.tone === 'red'
                        ? 'border-red-400/30 bg-red-400/10 text-red-100'
                        : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
                }`}>
                  <p className="font-black uppercase tracking-wider mb-1">{lifecycleMessage.title}</p>
                  <p className="opacity-85">{lifecycleMessage.body}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <button
                    disabled={updatingStatus || !canStartPickup}
                    onClick={() => handleUpdateBookingStatus('picking_up')}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-truck-ramp-box"></i> Start Pickup/Delivery (PICKING_UP)
                  </button>
                  <button
                    disabled={updatingStatus || !canStartTrip}
                    onClick={() => handleUpdateBookingStatus('active')}
                    className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-key"></i> Start Trip (ACTIVE)
                  </button>
                  <button
                    disabled={updatingStatus || !canCompleteTrip}
                    onClick={() => handleUpdateBookingStatus('completed')}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-circle-check"></i> Complete Trip (COMPLETED)
                  </button>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Actions unlock in order: confirmed booking, pickup/delivery, active trip, then completed trip.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: GPS Telematics Monitor */}
          <div className="rounded-[2rem] p-5 border border-white/10 shadow-2xl glass-dark text-white select-none">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Live Telematics Feed</h4>
            
            <div className="space-y-2.5 text-xs font-semibold">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Current Lat:</span>
                <span className="font-mono text-white">{vehicleLocation?.lat ? vehicleLocation.lat.toFixed(6) : 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Current Lng:</span>
                <span className="font-mono text-white">{vehicleLocation?.lng ? vehicleLocation.lng.toFixed(6) : 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Current Speed:</span>
                <span className="text-emerald-400 font-extrabold">{vehicleLocation?.speed ? `${vehicleLocation.speed.toFixed(1)} km/h` : '0.0 km/h'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Bearing Heading:</span>
                <span className="text-blue-400 font-extrabold">{vehicleLocation?.heading ? `${vehicleLocation.heading.toFixed(0)}°` : '0°'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Status State:</span>
                <span className="text-amber-400 font-extrabold">{vehicleStatus}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OwnerBookingTrackingPage;
