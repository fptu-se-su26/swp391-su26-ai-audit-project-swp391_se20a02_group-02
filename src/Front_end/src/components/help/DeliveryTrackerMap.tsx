import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Compass, ShieldAlert, Sparkles, RefreshCw, User, Phone, CheckCircle2 } from 'lucide-react';
import { deliverySimService } from '@/services/helpService';
import { useT } from '@/i18n/translations';
import SockJS from 'sockjs-client';
import { WS_URL } from '@/utils';

interface DeliveryTrackerMapProps {
  bookingId: string;
}

interface TrackingData {
  id: string;
  bookingId: string;
  status: 'WAITING_DEPARTURE' | 'EN_ROUTE' | 'ARRIVED' | 'COMPLETED';
  latitude: number;
  longitude: number;
  vehicleLatitude: number;
  vehicleLongitude: number;
  renterLatitude: number;
  renterLongitude: number;
  eta: string | null;
  distanceKm: number;
  speedKmh: number;
}

export const DeliveryTrackerMap: React.FC<DeliveryTrackerMapProps> = ({ bookingId }) => {
  const t = useT();
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ lat: number; lng: number }[]>([]);

  // 1. Fetch initial tracking status & setup WS subscription
  useEffect(() => {
    if (!bookingId) return;

    const loadTracking = async () => {
      setLoading(true);
      setError(null);
      try {
        // First try to load existing or initialize
        const res = await deliverySimService.initDeliveryTracking(bookingId);
        if (res) {
          setTracking(res);
          setHistory([{ lat: res.latitude, lng: res.longitude }]);
        }
      } catch (err: any) {
        console.error("Failed to load delivery tracking:", err);
        setError("Unable to find delivery dispatch for this booking. Confirm vehicle delivery is enabled.");
      } finally {
        setLoading(false);
      }
    };

    loadTracking();

    // 2. Setup WebSocket Live Subscription using native SockJS + manual STOMP frames
    let ws: WebSocket | null = null;
    let subscribed = false;
    try {
      ws = new SockJS(WS_URL) as unknown as WebSocket;

      ws.onopen = () => {
        // Send STOMP CONNECT frame
        ws!.send('CONNECT\naccept-version:1.1,1.0\nheart-beat:0,0\n\n\0');
      };

      ws.onmessage = (event: MessageEvent) => {
        const data: string = typeof event.data === 'string' ? event.data : '';
        if (!data) return;

        // STOMP CONNECTED — now subscribe
        if (data.startsWith('CONNECTED') && !subscribed) {
          subscribed = true;
          ws!.send(`SUBSCRIBE\nid:sub-delivery\ndestination:/topic/delivery/${bookingId}\n\n\0`);
        }

        // STOMP MESSAGE — parse body
        if (data.startsWith('MESSAGE')) {
          try {
            const bodyStart = data.indexOf('\n\n');
            if (bodyStart !== -1) {
              const body = data.substring(bodyStart + 2).replace(/\0$/, '');
              const updated: TrackingData = JSON.parse(body);
              setTracking(updated);
              setHistory(prev => [...prev, { lat: updated.latitude, lng: updated.longitude }]);
            }
          } catch (parseErr) {
            console.warn('Failed to parse STOMP message body:', parseErr);
          }
        }
      };

      ws.onerror = () => {
        console.warn('WebSocket connection failed for delivery tracking. Using REST only.');
      };
    } catch (wsErr) {
      console.warn('Failed to instantiate WebSocket client:', wsErr);
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        // Send STOMP DISCONNECT then close
        try { ws.send('DISCONNECT\n\n\0'); } catch {}
        ws.close();
      }
    };
  }, [bookingId]);

  // 3. Trigger simulation step
  const handleSimulateStep = async () => {
    if (!bookingId || !tracking) return;
    try {
      const updated = await deliverySimService.stepDeliveryTracking(bookingId);
      if (updated) {
        setTracking(updated);
        setHistory(prev => [...prev, { lat: updated.latitude, lng: updated.longitude }]);
      }
    } catch (err) {
      console.error("Failed to simulate delivery step:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] bg-slate-950/40 border border-slate-900 rounded-3xl p-6">
        <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium">Locating host transporter and vehicle GPS...</p>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] bg-slate-950/40 border border-slate-900 rounded-3xl p-6 text-center">
        <ShieldAlert className="w-12 h-12 text-amber-500/80 mb-4" />
        <p className="text-slate-200 text-sm font-semibold mb-2">{error || "No active delivery session"}</p>
        <p className="text-slate-500 text-xs max-w-sm">
          To initiate tracking, make sure your booking has delivery enabled. Enter booking ID **BK-DEV-CAR** or **BK-DEV-MOTO** in the concierge to run a demo simulation.
        </p>
      </div>
    );
  }

  // Calculate percentage of progress for the slider mockup
  const totalDist = 3.5;
  const currDist = tracking.distanceKm;
  const progressPct = Math.min(100, Math.max(0, ((totalDist - currDist) / totalDist) * 100));

  return (
    <div className="bg-slate-950/40 border border-slate-900 rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-2xl h-[450px]">
      {/* 1. Map Panel (Luxury Visual Coordinates Simulation) */}
      <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center p-4">
        {/* Radar grids */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.04)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px]" />

        {/* GPS coordinates overlays */}
        <span className="absolute top-4 left-4 text-[9px] text-slate-600 font-mono tracking-wider">
          LAT: {tracking.latitude.toFixed(6)} | LNG: {tracking.longitude.toFixed(6)}
        </span>
        <span className="absolute top-4 right-4 text-[9px] text-amber-500/50 font-mono flex items-center gap-1 font-semibold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} /> GPS ACTIVE
        </span>

        {/* Delivery Track Line Visualizer */}
        <div className="relative w-full max-w-md h-44 border border-amber-500/10 rounded-2xl bg-black/60 backdrop-blur flex flex-col justify-between p-6">
          {/* Start (Owner Spot) */}
          <div className="flex justify-between items-center z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs">
                🏢
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Origin</span>
                <span className="text-white text-xs font-bold">Luxury Showroom</span>
              </div>
            </div>

            {/* Destination (Renter Spot) */}
            <div className="flex items-center gap-2 text-right">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Destination</span>
                <span className="text-amber-400 text-xs font-bold">Your Location</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-xs text-amber-400">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Dotted path route */}
          <div className="absolute top-1/2 left-10 right-10 h-0.5 border-t-2 border-dashed border-amber-500/20 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-10 h-0.5 bg-gradient-to-r from-amber-500 to-yellow-600 -translate-y-1/2 z-0 transition-all duration-700"
            style={{ width: `${progressPct * 0.8}%` }}
          />

          {/* Vehicle Position indicator */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
            style={{ left: `calc(40px + ${progressPct * 0.8}%)` }}
            animate={{ y: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <Navigation className="w-4 h-4 text-white rotate-90" />
            </div>
            <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-amber-400 text-[8px] font-bold rounded-md mt-1 whitespace-nowrap">
              {tracking.speedKmh > 0 ? `${tracking.speedKmh.toFixed(0)} km/h` : 'Stopped'}
            </span>
          </motion.div>

          {/* ETA Overlay message */}
          <div className="text-center mt-4 border-t border-amber-500/10 pt-3 flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-semibold tracking-wide flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              {tracking.status === 'ARRIVED' ? 'Driver is outside!' : 'Premium Concierge Delivery'}
            </span>
            <span className="text-white text-xs font-bold">
              {tracking.eta ? `ETA: ${new Date(tracking.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Arrived'}
            </span>
          </div>
        </div>

        {/* Live coordinate history trail (visual only) */}
        <div className="absolute bottom-4 left-4 flex gap-1 items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Live Stream Coordinates</span>
        </div>
      </div>

      {/* 2. Side Panel (Delivery Stats & Driver Card) */}
      <div className="w-full lg:w-[350px] border-t lg:border-t-0 lg:border-l border-slate-900 bg-slate-950/70 p-6 flex flex-col justify-between">
        <div>
          {/* Section title */}
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">
              {t.help.deliveryTracker || "Delivery Tracker"}
            </h4>
            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-widest">
              {tracking.status === 'EN_ROUTE' ? t.help.statusEnRoute : tracking.status === 'ARRIVED' ? t.help.statusArrived : tracking.status}
            </span>
          </div>

          {/* Distance & ETA details */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-3">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Remaining</span>
              <span className="text-white font-extrabold text-base block mt-0.5">{tracking.distanceKm.toFixed(2)} km</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-3">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Est. Time</span>
              <span className="text-white font-extrabold text-base block mt-0.5">
                {tracking.eta ? `${Math.max(1, Math.floor(tracking.distanceKm * 4))} min` : '0 min'}
              </span>
            </div>
          </div>

          {/* Driver Card */}
          <div className="border border-slate-850 bg-slate-900/40 rounded-2xl p-4 mb-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex-1">
              <h5 className="text-white text-xs font-bold">Alex Mercer</h5>
              <p className="text-slate-500 text-[10px] mt-0.5">LuxeWay Valet Logistics</p>
            </div>
            <button className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-350 hover:text-white transition-colors cursor-pointer">
              <Phone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Demo Simulator Controller */}
        <div className="border-t border-slate-900 pt-4 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider">Demo Simulation Mode</span>
            <span className="font-mono">Booking: {bookingId}</span>
          </div>

          <button
            onClick={handleSimulateStep}
            disabled={tracking.status === 'ARRIVED' || tracking.status === 'COMPLETED'}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-950/20 disabled:from-slate-900 disabled:to-slate-900 disabled:text-slate-600 border border-amber-400/40 disabled:border-slate-800 cursor-pointer flex items-center justify-center gap-2"
          >
            {tracking.status === 'ARRIVED' || tracking.status === 'COMPLETED' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Delivery Arrived
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} /> Simulate GPS Step
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
