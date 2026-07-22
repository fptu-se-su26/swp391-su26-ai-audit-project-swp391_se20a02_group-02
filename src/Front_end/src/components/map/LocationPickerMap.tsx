import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getMapStyleUrl, installMapStyleFallback } from './mapStyle';

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  zoom?: number;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  lat,
  lng,
  onChange,
  zoom = 13
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getMapStyleUrl(false),
      center: [lng || 106.660, lat || 10.762],
      zoom: zoom,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    installMapStyleFallback(map, false);
    mapRef.current = map;

    // Create marker
    const marker = new maplibregl.Marker({ color: '#2563eb' })
      .setLngLat([lng || 106.660, lat || 10.762])
      .addTo(map);
    markerRef.current = marker;

    // Click handler
    map.on('click', (e) => {
      const { lng: newLng, lat: newLat } = e.lngLat;
      onChange(newLat, newLng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Sync marker and center when lat/lng props change
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    marker.setLngLat([lng, lat]);
    map.easeTo({ center: [lng, lat], duration: 800 });
  }, [lat, lng]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default LocationPickerMap;
