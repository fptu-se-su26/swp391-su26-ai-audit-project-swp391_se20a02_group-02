import apiClient from './api';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeocodeResult {
  address: string;
  lat: number;
  lng: number;
}

export interface AutocompleteSuggestion {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

export interface DirectionResult {
  distance: number; // km
  duration: number; // seconds
  duration_text: string;
  distance_text: string;
  polyline: string;
}

export interface NearbyVehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  pricePerDay: number;
  thumbnailUrl: string;
  vehicleType: 'CAR' | 'MOTORBIKE';
  latitude: number;
  longitude: number;
  distance_km: number;
  duration_min: number;
  distance_text: string;
  duration_text: string;
}

export interface BookingTrackingInfo {
  bookingId: string;
  status: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  pickupLocation: string;
  deliveryAddress: string;
  routeDistanceKm: number;
  estimatedTimeMin: number;
  routePolyline: string;
  vehicleId?: string;
  vehicleName?: string;
  currentLat?: number;
  currentLng?: number;
  locationStatus?: string;
  lastLocationUpdate?: string;
  trackingHistory: Array<{
    lat: number;
    lng: number;
    speed: number;
    timestamp: string;
  }>;
}

export const mapService = {
  /** Suggest places as user types */
  async autocomplete(input: string): Promise<AutocompleteSuggestion[]> {
    if (!input.trim()) return [];
    try {
      return await apiClient.get<AutocompleteSuggestion[]>(`/location/autocomplete?input=${encodeURIComponent(input)}`);
    } catch (error) {
      console.error('Autocomplete query failed:', error);
      return [];
    }
  },

  /** Resolve coordinates from place ID */
  async getPlaceDetail(placeId: string): Promise<GeocodeResult | null> {
    try {
      return await apiClient.get<GeocodeResult>(`/location/detail?placeId=${placeId}`);
    } catch (error) {
      console.error('Place detail query failed:', error);
      return null;
    }
  },

  /** Forward geocode: address -> coordinates */
  async geocode(address: string): Promise<GeocodeResult> {
    return await apiClient.post<GeocodeResult>('/location/geocode', { address });
  },

  /** Reverse geocode: coordinates -> address */
  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
    return await apiClient.post<GeocodeResult>('/location/reverse', { lat, lng });
  },

  /** Directions & polyline route calculation */
  async getDirection(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
  ): Promise<DirectionResult> {
    return await apiClient.post<DirectionResult>('/location/direction', {
      originLat,
      originLng,
      destLat,
      destLng,
    });
  },

  /** Search nearest/fastest available vehicles */
  async getNearbyVehicles(
    lat: number,
    lng: number,
    vehicleType?: string,
    sortBy = 'nearest'
  ): Promise<NearbyVehicle[]> {
    const typeParam = vehicleType ? `&vehicleType=${vehicleType}` : '';
    const response = await apiClient.get<{ vehicles: NearbyVehicle[] }>(
      `/location/vehicles/nearby?lat=${lat}&lng=${lng}${typeParam}&sortBy=${sortBy}`
    );
    return response.vehicles || [];
  },

  /** Update active coordinates for vehicle (typically owner simulating GPS) */
  async updateTrackingLocation(payload: {
    vehicleId: string;
    lat: number;
    lng: number;
    speed?: number;
    heading?: number;
    bookingId?: string;
    status?: string;
  }): Promise<boolean> {
    const res = await apiClient.post<{ success: boolean }>('/location/tracking/update', payload);
    return !!res.success;
  },

  /** Fetch active tracking route and history points for customer booking */
  async getBookingTracking(bookingId: string): Promise<BookingTrackingInfo> {
    return await apiClient.get<BookingTrackingInfo>(`/location/bookings/${bookingId}/tracking`);
  },
};

export default mapService;
