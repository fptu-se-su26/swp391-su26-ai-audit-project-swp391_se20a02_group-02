import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useUIStore } from '@/store';
import { formatCurrency } from '@/utils';
import type { Vehicle } from '@/types';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800';

// Helper to resolve deterministic coordinates for a vehicle based on priority and fallbacks
export const getCoordinates = (v: Vehicle, index: number): [number, number] => {
  let lat: number | undefined;
  let lng: number | undefined;

  // 1. Check root level coordinates
  const rawVehicle = v as unknown as Record<string, unknown>;
  if (typeof rawVehicle.latitude === 'number' && typeof rawVehicle.longitude === 'number') {
    lat = rawVehicle.latitude;
    lng = rawVehicle.longitude;
  }

  // 2. Check location properties (latitude/longitude)
  if ((lat === undefined || lng === undefined || lat === 0 || lng === 0) && v.location) {
    const rawLoc = v.location as unknown as Record<string, unknown>;
    if (typeof rawLoc.latitude === 'number' && typeof rawLoc.longitude === 'number') {
      lat = rawLoc.latitude;
      lng = rawLoc.longitude;
    }
  }

  // 3. Check location properties (lat/lng)
  if ((lat === undefined || lng === undefined || lat === 0 || lng === 0) && v.location) {
    if (typeof v.location.lat === 'number' && typeof v.location.lng === 'number') {
      lat = v.location.lat;
      lng = v.location.lng;
    }
  }

  // 4. City-based fallback coordinates (Da Nang, Ha Noi, Ho Chi Minh City, Hue, Hoi An, Nha Trang)
  if (lat === undefined || lng === undefined || lat === 0 || lng === 0) {
    const rawVehicle = v as unknown as Record<string, unknown>;
    const city = (v.location?.city || rawVehicle.city as string || 'Ho Chi Minh').toLowerCase();
    let base: [number, number] = [10.762, 106.660]; // Ho Chi Minh City default
    
    if (city.includes('hà nội') || city.includes('ha noi')) {
      base = [21.0285, 105.8542];
    } else if (city.includes('đà nẵng') || city.includes('da nang')) {
      base = [16.0544, 108.2022];
    } else if (city.includes('nha trang')) {
      base = [12.2451, 109.1943];
    } else if (city.includes('đà lạt') || city.includes('da lat')) {
      base = [11.9404, 108.4583];
    } else if (city.includes('phú quốc') || city.includes('phu quoc')) {
      base = [10.2899, 103.9840];
    } else if (city.includes('hue') || city.includes('huế')) {
      base = [16.4637, 107.5908];
    } else if (city.includes('hoi an') || city.includes('hội an')) {
      base = [15.8801, 108.3380];
    }
    
    // Deterministic offset to prevent overlaps
    const angle = index * 137.5 * (Math.PI / 180); 
    const radius = 0.008 + (index % 5) * 0.003; // Radius in degrees (~800m - 2.5km scatter)
    lat = base[0] + Math.sin(angle) * radius;
    lng = base[1] + Math.cos(angle) * radius;
  }

  return [lat, lng];
};

// Component to dynamically fit map view bounds based on vehicles
const MapController: React.FC<{ vehicles: Vehicle[]; selectedVehicleId?: string }> = ({ vehicles, selectedVehicleId }) => {
  const map = useMap();

  useEffect(() => {
    if (vehicles.length === 0) return;

    // Single vehicle mode or selected vehicle prioritization
    if (vehicles.length === 1) {
      const coords = getCoordinates(vehicles[0], 0);
      map.setView(coords, 16); // Detail page zoom level (15-17)
      return;
    }

    if (selectedVehicleId) {
      const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
      if (selectedVehicle) {
        const coords = getCoordinates(selectedVehicle, vehicles.indexOf(selectedVehicle));
        map.setView(coords, 14);
        return;
      }
    }

    try {
      const coordsList = vehicles.map((v, idx) => getCoordinates(v, idx));
      const bounds = L.latLngBounds(coordsList);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } catch (e) {
      console.error('Failed to fit bounds', e);
    }
  }, [vehicles, selectedVehicleId, map]);

  return null;
};

interface VehicleMapProps {
  vehicles: Vehicle[];
  selectedVehicleId?: string;
  hoveredVehicleId?: string;
  onVehicleClick?: (vehicle: Vehicle) => void;
  height?: string;
}

export const VehicleMapImpl: React.FC<VehicleMapProps> = ({
  vehicles,
  selectedVehicleId,
  hoveredVehicleId,
  onVehicleClick,
  height = '100%'
}) => {
  const { theme } = useUIStore();

  const lightTilesUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  const darkTilesUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  
  const tileUrl = theme === 'dark' ? darkTilesUrl : lightTilesUrl;
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  // Helper to generate premium html price markers
  const getCustomMarkerIcon = (v: Vehicle, isSelected: boolean, isHovered: boolean) => {
    const formattedPrice = formatCurrency(v.pricePerDay);
    const hasInstant = v.instantBook;
    const isSingle = vehicles.length === 1;

    // Pulse ring only in detail page (single marker mode)
    const pulseRing = isSingle
      ? `<div class="absolute -inset-3.5 rounded-full border-2 border-accent animate-ping opacity-60 pointer-events-none"></div>`
      : '';

    const pinClass = isSelected
      ? "bg-accent border-accent text-white scale-110 shadow-lg shadow-accent/30 font-extrabold"
      : isHovered
        ? "bg-white border-accent text-accent dark:bg-slate-900 scale-105 shadow-md shadow-accent/15"
        : "bg-slate-950/90 border-slate-700/80 text-white dark:bg-slate-900/90 hover:scale-105 shadow-sm";

    const dotClass = isSelected || isHovered ? "bg-accent" : "bg-slate-400";

    const instantIcon = hasInstant
      ? `<svg class="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`
      : '';

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="flex flex-col items-center select-none" style="transform: translate(0, -10px);">
          <div class="px-2.5 py-1.5 rounded-full text-xs font-bold shadow-lg border flex items-center gap-1 transition-all duration-200 ${pinClass}">
            ${instantIcon}
            <span>${formattedPrice}</span>
          </div>
          <div class="w-2.5 h-2.5 rounded-full border border-white shadow-sm mt-1 transition-colors ${dotClass} relative">
            ${pulseRing}
          </div>
        </div>
      `,
      iconSize: [80, 45],
      iconAnchor: [40, 45],
    });
  };

  const defaultCenter: [number, number] = [10.762, 106.660];

  const markers = useMemo(() => {
    return vehicles.map((v, index) => {
      const coords = getCoordinates(v, index);
      const isSelected = selectedVehicleId === v.id;
      const isHovered = hoveredVehicleId === v.id;

      return (
        <Marker
          key={v.id}
          position={coords}
          icon={getCustomMarkerIcon(v, isSelected, isHovered)}
          eventHandlers={{
            click: () => {
              if (onVehicleClick) {
                onVehicleClick(v);
              }
            }
          }}
        >
          <Popup closeButton={true} maxWidth={280} minWidth={240}>
            <div className="flex gap-3 p-3.5 select-none items-center">
              <img
                src={v.images?.[0] || v.thumbnailUrl || FALLBACK_IMAGE}
                alt={v.name}
                className="w-20 h-16 object-cover rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0"
              />
              <div className="flex-1 min-w-0 pr-2">
                <span className="text-[9px] font-bold text-accent uppercase tracking-widest">{v.brand}</span>
                <h4 className="font-extrabold text-foreground text-xs leading-tight truncate mt-0.5" title={v.name}>{v.name}</h4>
                <div className="flex items-center gap-1 mt-1 text-xs">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-405" />
                  <span className="font-bold text-foreground text-[10px]">{v.rating ? v.rating.toFixed(1) : '5.0'}</span>
                  <span className="text-slate-400 text-[9px]">({v.totalReviews || 0})</span>
                </div>
                <div className="mt-2.5 flex items-baseline justify-between gap-1">
                  <span className="text-[11px] font-extrabold text-foreground whitespace-nowrap">{formatCurrency(v.pricePerDay)}/day</span>
                  <Link
                    to={`/vehicles/${v.id}`}
                    className="text-[9px] font-extrabold bg-accent text-white px-2 py-1 rounded-lg hover:bg-blue-600 transition-colors shadow-sm shadow-accent/15"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      );
    });
  }, [vehicles, selectedVehicleId, hoveredVehicleId, onVehicleClick]);

  return (
    <div style={{ height }} className="w-full rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl relative z-10">
      <MapContainer
        center={vehicles.length > 0 ? getCoordinates(vehicles[0], 0) : defaultCenter}
        zoom={vehicles.length === 1 ? 16 : 12}
        className="w-full h-full"
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
      >
        <TileLayer
          attribution={attribution}
          url={tileUrl}
        />
        
        <MapController vehicles={vehicles} selectedVehicleId={selectedVehicleId} />

        {markers}
      </MapContainer>
    </div>
  );
};

// Wrap in React.memo for performance optimization
export const VehicleMap = React.memo(VehicleMapImpl);
export default VehicleMap;
