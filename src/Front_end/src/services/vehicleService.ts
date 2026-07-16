<<<<<<< HEAD
import { getDb, dbUpdate, dbCreate, dbDelete, STORAGE_KEYS } from '@/mock/db';
import type { Vehicle, VehicleFilters, ApiResponse } from '@/types';
import { faker } from '@faker-js/faker';

const DELAY = 400;
const delay = (ms = DELAY) => new Promise(r => setTimeout(r, ms));
=======
import apiClient from './api';
import type { Vehicle, VehicleFilters, ApiResponse, VehicleLocationResponse } from '@/types';
import { carService } from './carService';
import { motorbikeService } from './motorbikeService';
import { resolveImageUrl } from '@/utils';

// Storage key for wishlist fallback since backend may not have a dedicated endpoint yet
const WISHLIST_KEY = 'luxeway_wishlist';

// Helper function to map flat backend vehicle DTO to nested frontend Vehicle type
const mapVehicle = (v: any): Vehicle => {
  if (!v) return v;
  
  const defaultLocation = {
    city: v.city || '',
    country: v.country || 'Vietnam',
    address: v.address || '',
    lat: v.latitude || 0,
    lng: v.longitude || 0,
    timezone: 'Asia/Ho_Chi_Minh'
  };
  
  const defaultSpecs = {
    horsepower: v.horsepower || 0,
    topSpeed: v.topSpeed || 0,
    acceleration: v.acceleration || 0,
    seats: v.seats || 0,
    doors: v.doors || 4,
    transmission: v.transmission || 'automatic',
    fuelType: v.fuelType || 'gasoline',
    range: v.rangeKm || 0,
    engineSize: v.engineSize || '',
    color: v.color || '',
    licensePlate: v.licensePlate || ''
  };

  const defaultInsurance = {
    included: true,
    provider: 'LuxeWay Shield',
    coverage: 'Premium protection'
  };

  const defaultAvailability = {
    blockedDates: [],
    minRentalDays: 1,
    maxRentalDays: 30,
    advanceBookingDays: 1
  };

  // Backend may return images in vehicleImages/galleryImages in addition to images
  const rawImages = v.images?.length ? v.images 
    : v.vehicleImages?.length ? v.vehicleImages
    : v.galleryImages?.length ? [v.primaryImage, ...v.galleryImages].filter(Boolean)
    : v.primaryImage ? [v.primaryImage]
    : v.thumbnailUrl ? [v.thumbnailUrl]
    : [];
  const resolvedThumbnailUrl = resolveImageUrl(v.thumbnailUrl || v.primaryImage || rawImages[0] || '');
  const resolvedImages = rawImages.map((img: string) => resolveImageUrl(img)).filter(Boolean);
  const resolvedOwner = v.owner ? {
    ...v.owner,
    avatar: resolveImageUrl(v.owner.avatar)
  } : undefined;

  // Infer vehicleType from category if not explicitly set
  const motorbikeCategories = ['MOTORBIKE', 'SCOOTER', 'AUTOMATIC_SCOOTER', 'MANUAL_MOTORCYCLE',
    'SPORT_BIKE', 'TOURING_BIKE', 'ADVENTURE_BIKE', 'CLASSIC_BIKE', 'ELECTRIC_BIKE',
    'motorbike', 'scooter', 'automatic_scooter', 'manual_motorcycle',
    'sport_bike', 'touring_bike', 'adventure_bike', 'classic_bike', 'electric_bike'];
  const inferredType = v.vehicleType?.toLowerCase() ||
    (motorbikeCategories.includes(v.category) ? 'motorbike' : 'car');

  return {
    ...v,
    vehicleType: inferredType,
    thumbnailUrl: resolvedThumbnailUrl,
    images: resolvedImages,
    owner: resolvedOwner,
    category: (v.category || 'economy').toLowerCase(),
    location: {
      ...defaultLocation,
      ...(v.location || {})
    },
    specs: {
      ...defaultSpecs,
      ...(v.specs || {})
    },
    insurance: {
      ...defaultInsurance,
      ...(v.insurance || {})
    },
    availability: {
      ...defaultAvailability,
      ...(v.availability || {})
    },
    rules: v.rules || [],
    features: v.features || [],
    addons: v.addons || [],
    rating: v.rating !== undefined && v.rating !== null ? v.rating : 5.0,
    totalReviews: v.totalReviews !== undefined && v.totalReviews !== null ? v.totalReviews : 0,
    instantBook: v.instantBook !== undefined && v.instantBook !== null ? v.instantBook : false,
    deposit: v.deposit !== undefined && v.deposit !== null ? v.deposit : 0,
    // Vietnam market fields
    engineCc: v.engineCc || null,
    hasHelmet: v.hasHelmet || false,
    hasPhoneHolder: v.hasPhoneHolder || false,
    hasRaincoat: v.hasRaincoat || false,
    hasTouringPackage: v.hasTouringPackage || false,
    hasChauffeur: v.hasChauffeur || false,
    airportDelivery: v.airportDelivery || false,
    weddingRental: v.weddingRental || false,
    businessRental: v.businessRental || false,
  };
};
>>>>>>> origin/main

// Helper function to map nested frontend Vehicle/updates to flat backend CreateVehicleRequest DTO
const transformToBackendPayload = (data: Partial<Vehicle>): any => {
  const payload: any = {
    name: data.name,
    brand: data.brand,
    model: data.model,
    vin: data.vin,
    year: data.year ? parseInt(data.year as any, 10) : undefined,
    category: data.category ? data.category.toUpperCase() : undefined,
    description: data.description,
    pricePerDay: data.pricePerDay,
    pricePerWeek: data.pricePerWeek,
    deposit: data.deposit,
    vehicleType: data.vehicleType ? data.vehicleType.toUpperCase() : undefined,
    instantBook: data.instantBook,
    deliveryAvailable: data.deliveryAvailable,
    deliveryFee: data.deliveryFee,
  };

  // Hoist location
  if (data.location) {
    payload.city = data.location.city;
    payload.country = data.location.country || 'Vietnam';
    payload.address = data.location.address;
    payload.latitude = data.location.lat !== undefined ? data.location.lat : (data as any).latitude;
    payload.longitude = data.location.lng !== undefined ? data.location.lng : (data as any).longitude;
  } else {
    payload.city = (data as any).city;
    payload.country = (data as any).country || 'Vietnam';
    payload.address = (data as any).address;
    payload.latitude = (data as any).latitude;
    payload.longitude = (data as any).longitude;
  }

  // Hoist specs
  if (data.specs) {
    payload.seats = data.specs.seats !== undefined ? parseInt(data.specs.seats as any, 10) : undefined;
    payload.doors = data.specs.doors !== undefined ? parseInt(data.specs.doors as any, 10) : undefined;
    payload.horsepower = data.specs.horsepower !== undefined ? parseInt(data.specs.horsepower as any, 10) : undefined;
    payload.topSpeed = data.specs.topSpeed !== undefined ? parseInt(data.specs.topSpeed as any, 10) : undefined;
    payload.transmission = data.specs.transmission ? data.specs.transmission.toUpperCase() : undefined;
    payload.fuelType = data.specs.fuelType ? data.specs.fuelType.toUpperCase() : undefined;
    payload.rangeKm = data.specs.range !== undefined ? parseInt(data.specs.range as any, 10) : (data as any).rangeKm;
    payload.engineSize = data.specs.engineSize;
    payload.color = data.specs.color;
    payload.licensePlate = data.specs.licensePlate;
  } else {
    payload.seats = (data as any).seats;
    payload.doors = (data as any).doors;
    payload.horsepower = (data as any).horsepower;
    payload.topSpeed = (data as any).topSpeed;
    payload.transmission = (data as any).transmission ? (data as any).transmission.toUpperCase() : undefined;
    payload.fuelType = (data as any).fuelType ? (data as any).fuelType.toUpperCase() : undefined;
    payload.rangeKm = (data as any).rangeKm;
    payload.engineSize = (data as any).engineSize;
    payload.color = (data as any).color;
    payload.licensePlate = (data as any).licensePlate;
  }

  // Hoist availability
  if (data.availability) {
    payload.minRentalDays = data.availability.minRentalDays !== undefined ? parseInt(data.availability.minRentalDays as any, 10) : undefined;
    payload.maxRentalDays = data.availability.maxRentalDays !== undefined ? parseInt(data.availability.maxRentalDays as any, 10) : undefined;
  }

  // Hoist motorbike/car fields
  payload.engineCc = data.engineCc;
  payload.hasHelmet = data.hasHelmet;
  payload.hasPhoneHolder = data.hasPhoneHolder;
  payload.hasRaincoat = data.hasRaincoat;
  payload.hasTouringPackage = data.hasTouringPackage;

  payload.hasChauffeur = data.hasChauffeur;
  payload.airportDelivery = data.airportDelivery;
  payload.weddingRental = data.weddingRental;
  payload.businessRental = data.businessRental;

  payload.features = data.features;
  
  if (data.images && data.images.length > 0) {
    payload.imageUrls = data.images;
  } else if ((data as any).imageUrls) {
    payload.imageUrls = (data as any).imageUrls;
  }

  // Ensure default fallback values for non-null required fields
  if (payload.transmission === undefined) {
    payload.transmission = 'AUTOMATIC';
  }
  if (payload.fuelType === undefined) {
    payload.fuelType = 'GASOLINE';
  }
  if (payload.seats === undefined) {
    payload.seats = 4;
  }
  if (payload.deposit === undefined) {
    payload.deposit = 0;
  }

  return payload;
};

export const vehicleService = {
  async getAll(filters?: VehicleFilters, page = 1, pageSize = 12): Promise<ApiResponse<Vehicle[]>> {
<<<<<<< HEAD
    await delay();
    let { vehicles } = getDb();

    // Apply filters
    if (filters) {
      if (filters.location) {
        const loc = filters.location.toLowerCase();
        vehicles = vehicles.filter(v =>
          v.location.city.toLowerCase().includes(loc) ||
          v.location.country.toLowerCase().includes(loc)
        );
      }
      if (filters.category?.length) {
        vehicles = vehicles.filter(v => filters.category!.includes(v.category));
      }
      if (filters.brands?.length) {
        vehicles = vehicles.filter(v => filters.brands!.includes(v.brand));
      }
      if (filters.minPrice !== undefined) {
        vehicles = vehicles.filter(v => v.pricePerDay >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        vehicles = vehicles.filter(v => v.pricePerDay <= filters.maxPrice!);
      }
      if (filters.minSeats !== undefined) {
        vehicles = vehicles.filter(v => v.specs.seats >= filters.minSeats!);
      }
      if (filters.transmission?.length) {
        vehicles = vehicles.filter(v => filters.transmission!.includes(v.specs.transmission));
      }
      if (filters.fuelType?.length) {
        vehicles = vehicles.filter(v => filters.fuelType!.includes(v.specs.fuelType));
      }
      if (filters.minRating !== undefined) {
        vehicles = vehicles.filter(v => v.rating >= filters.minRating!);
      }
      if (filters.instantBook) {
        vehicles = vehicles.filter(v => v.instantBook);
      }
      if (filters.verified) {
        vehicles = vehicles.filter(v => v.isVerified);
      }
      if (filters.deliveryAvailable) {
        vehicles = vehicles.filter(v => v.deliveryAvailable);
      }

      // Sort
      switch (filters.sortBy) {
        case 'price_asc': vehicles.sort((a, b) => a.pricePerDay - b.pricePerDay); break;
        case 'price_desc': vehicles.sort((a, b) => b.pricePerDay - a.pricePerDay); break;
        case 'rating': vehicles.sort((a, b) => b.rating - a.rating); break;
        case 'newest': vehicles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
        case 'popular': vehicles.sort((a, b) => b.totalBookings - a.totalBookings); break;
        default: break;
=======
    try {
      const queryParams = new URLSearchParams({
        page: (page - 1).toString(), // Spring Data JPA is 0-indexed
        size: pageSize.toString()
      });
      
      if (filters) {
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.location) queryParams.append('location', filters.location);
        // Vehicle type filter (CAR | MOTORBIKE)
        if (filters.vehicleType) queryParams.append('vehicleType', filters.vehicleType.toUpperCase());
        // Send ALL selected categories as repeated params: category=suv&category=economy
        if (filters.category && filters.category.length > 0) {
          filters.category.forEach(cat => queryParams.append('category', cat.toUpperCase()));
        }
        // Send ALL selected brands as repeated params: brand=toyota&brand=honda
        if (filters.brands && filters.brands.length > 0) {
          filters.brands.forEach(b => queryParams.append('brand', b.toLowerCase()));
        }
        if (filters.minPrice !== undefined && filters.minPrice > 0) queryParams.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString());
        if (filters.minSeats !== undefined) queryParams.append('minSeats', filters.minSeats.toString());
        if (filters.transmission && filters.transmission.length > 0) {
          queryParams.append('transmission', filters.transmission[0]);
        }
        if (filters.fuelType && filters.fuelType.length > 0) {
          queryParams.append('fuelType', filters.fuelType[0]);
        }
        if (filters.minRating !== undefined) queryParams.append('minRating', filters.minRating.toString());
        if (filters.instantBook) queryParams.append('instantBook', 'true');
        if (filters.deliveryAvailable) queryParams.append('deliveryAvailable', 'true');
        if (filters.isFeatured) queryParams.append('isFeatured', 'true');
        if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
        if (filters.keyword) queryParams.append('keyword', filters.keyword);
        if (filters.userLat !== undefined) queryParams.append('userLat', filters.userLat.toString());
        if (filters.userLng !== undefined) queryParams.append('userLng', filters.userLng.toString());
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        // Motorbike-specific filters
        if (filters.minEngineCc !== undefined) queryParams.append('minEngineCc', filters.minEngineCc.toString());
        if (filters.maxEngineCc !== undefined) queryParams.append('maxEngineCc', filters.maxEngineCc.toString());
        if (filters.hasHelmet) queryParams.append('hasHelmet', 'true');
        if (filters.hasPhoneHolder) queryParams.append('hasPhoneHolder', 'true');
        if (filters.hasRaincoat) queryParams.append('hasRaincoat', 'true');
        if (filters.hasTouringPackage) queryParams.append('hasTouringPackage', 'true');
        // Car-specific filters
        if (filters.hasChauffeur) queryParams.append('hasChauffeur', 'true');
        if (filters.airportDelivery) queryParams.append('airportDelivery', 'true');
        if (filters.weddingRental) queryParams.append('weddingRental', 'true');
        if (filters.businessRental) queryParams.append('businessRental', 'true');
>>>>>>> origin/main
      }
    }

    // Only show available
    vehicles = vehicles.filter(v => v.status === 'available');

    const total = vehicles.length;
    const start = (page - 1) * pageSize;
    const paginated = vehicles.slice(start, start + pageSize);

    return {
      data: paginated,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getMapVehicles(filters?: VehicleFilters, signal?: AbortSignal): Promise<VehicleLocationResponse[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.location) queryParams.append('location', filters.location);
        if (filters.keyword) queryParams.append('keyword', filters.keyword);
        if (filters.userLat !== undefined) queryParams.append('userLat', filters.userLat.toString());
        if (filters.userLng !== undefined) queryParams.append('userLng', filters.userLng.toString());
        if (filters.vehicleType) queryParams.append('vehicleType', filters.vehicleType.toUpperCase());
        if (filters.category && filters.category.length > 0) {
          filters.category.forEach(cat => queryParams.append('category', cat.toUpperCase()));
        }
        if (filters.brands && filters.brands.length > 0) {
          filters.brands.forEach(b => queryParams.append('brand', b.toLowerCase()));
        }
        if (filters.minPrice !== undefined && filters.minPrice > 0) queryParams.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString());
        if (filters.minSeats !== undefined) queryParams.append('minSeats', filters.minSeats.toString());
        if (filters.transmission && filters.transmission.length > 0) {
          queryParams.append('transmission', filters.transmission[0]);
        }
        if (filters.fuelType && filters.fuelType.length > 0) {
          queryParams.append('fuelType', filters.fuelType[0]);
        }
        if (filters.minRating !== undefined) queryParams.append('minRating', filters.minRating.toString());
        if (filters.instantBook) queryParams.append('instantBook', 'true');
        if (filters.deliveryAvailable) queryParams.append('deliveryAvailable', 'true');
        if (filters.isFeatured) queryParams.append('isFeatured', 'true');
        if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        if (filters.minEngineCc !== undefined) queryParams.append('minEngineCc', filters.minEngineCc.toString());
        if (filters.maxEngineCc !== undefined) queryParams.append('maxEngineCc', filters.maxEngineCc.toString());
        if (filters.hasHelmet) queryParams.append('hasHelmet', 'true');
        if (filters.hasPhoneHolder) queryParams.append('hasPhoneHolder', 'true');
        if (filters.hasRaincoat) queryParams.append('hasRaincoat', 'true');
        if (filters.hasTouringPackage) queryParams.append('hasTouringPackage', 'true');
        if (filters.hasChauffeur) queryParams.append('hasChauffeur', 'true');
        if (filters.airportDelivery) queryParams.append('airportDelivery', 'true');
        if (filters.weddingRental) queryParams.append('weddingRental', 'true');
        if (filters.businessRental) queryParams.append('businessRental', 'true');
      }
      
      const response = await apiClient.get<any>(`/vehicles/map?${queryParams.toString()}`, { signal });
      const list = Array.isArray(response) ? response : response?.data || [];
      return list;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      console.error('Failed to get map vehicles', error);
      return [];
    }
  },

  async getById(id: string): Promise<Vehicle | null> {
<<<<<<< HEAD
    await delay(300);
    const { vehicles } = getDb();
    return vehicles.find(v => v.id === id) || null;
=======
    try {
      if (id.startsWith('CAR-') || id.toLowerCase().includes('car')) {
        const car = await carService.getById(id);
        if (car) return car;
      }
      if (id.startsWith('BIKE-') || id.startsWith('VM-') || id.toLowerCase().includes('bike') || id.toLowerCase().includes('vm-')) {
        const bike = await motorbikeService.getById(id);
        if (bike) return bike;
      }
      
      // Fallbacks
      try {
        const response = await apiClient.get<any>(`/vehicles/${id}`);
        if (response.vehicle) return mapVehicle(response.vehicle);
      } catch (_) {}

      // Try carService as general fallback
      try {
        const car = await carService.getById(id);
        if (car) return car;
      } catch (_) {}

      // Try motorbikeService as general fallback
      try {
        const bike = await motorbikeService.getById(id);
        if (bike) return bike;
      } catch (_) {}
      return null;
    } catch (error) {
      console.error(`Failed to get vehicle ${id}`, error);
      return null;
    }
>>>>>>> origin/main
  },

  async getVehicleDetail(id: string): Promise<Vehicle | null> {
    try {
      const response = await apiClient.get<any>(`/vehicles/${id}/detail`);
      // Backend wraps in { vehicle: {...} }
      const v = response.vehicle || response.data?.vehicle || response.data || response;
      return v && v.id ? mapVehicle(v) : null;
    } catch (error) {
      console.error(`Failed to get vehicle detail ${id}`, error);
      return null;
    }
  },

  async getFeatured(): Promise<Vehicle[]> {
    await delay(300);
    const { vehicles } = getDb();
    return vehicles.filter(v => v.isFeatured && v.status === 'available').slice(0, 9);
  },

  async getByOwner(ownerId: string): Promise<Vehicle[]> {
    await delay(300);
    const { vehicles } = getDb();
    return vehicles.filter(v => v.ownerId === ownerId);
  },

  async search(query: string): Promise<Vehicle[]> {
    await delay(200);
    const { vehicles } = getDb();
    const q = query.toLowerCase();
    return vehicles
      .filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.location.city.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
      )
      .filter(v => v.status === 'available')
      .slice(0, 8);
  },

  async create(ownerId: string, data: Partial<Vehicle>): Promise<Vehicle> {
<<<<<<< HEAD
    await delay(600);
    const { vehicles } = getDb();
    const newVehicle: Vehicle = {
      id: `vehicle-${faker.string.uuid()}`,
      ownerId,
      name: data.name || '',
      brand: data.brand || '',
      model: data.model || '',
      year: data.year || new Date().getFullYear(),
      category: data.category || 'luxury',
      description: data.description || '',
      images: data.images || [],
      thumbnailUrl: data.images?.[0] || '',
      pricePerDay: data.pricePerDay || 0,
      deposit: data.deposit || 0,
      location: data.location || { city: '', country: '', address: '', lat: 0, lng: 0, timezone: '' },
      specs: data.specs || {
        horsepower: 0, topSpeed: 0, acceleration: 0, seats: 4, doors: 4,
        transmission: 'automatic', fuelType: 'gasoline', color: '', licensePlate: '',
      },
      features: data.features || [],
      rules: data.rules || [],
      insurance: data.insurance || { included: false, provider: '', coverage: '' },
      availability: { blockedDates: [], minRentalDays: 1, maxRentalDays: 30, advanceBookingDays: 1 },
      status: 'pending_approval',
      rating: 0,
      totalReviews: 0,
      totalBookings: 0,
      isVerified: false,
      isFeatured: false,
      wishlistedBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      addons: [],
      instantBook: false,
      deliveryAvailable: false,
      deliveryFee: 0,
      ...data,
    } as Vehicle;

    dbCreate(STORAGE_KEYS.VEHICLES, vehicles, newVehicle);
    return newVehicle;
  },

  async update(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
    await delay(500);
    const { vehicles } = getDb();
    return dbUpdate(STORAGE_KEYS.VEHICLES, vehicles, id, { ...updates, updatedAt: new Date().toISOString() } as Partial<Vehicle>);
=======
    const transformed = transformToBackendPayload(data);
    const payload = { ...transformed, ownerId };
    const response = await apiClient.post<any>('/vehicles', payload);
    return response.vehicle ? mapVehicle(response.vehicle) : (payload as Vehicle); 
  },

  async update(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
    try {
      const transformed = transformToBackendPayload(updates);
      const response = await apiClient.put<any>(`/vehicles/${id}`, transformed);
      return response.vehicle ? mapVehicle(response.vehicle) : null;
    } catch (error) {
      return null;
    }
>>>>>>> origin/main
  },

  async controlLock(id: string): Promise<{ success: boolean; isLocked: boolean; message: string }> {
    try {
      const response = await apiClient.post<any>(`/vehicles/${id}/control-lock`, {});
      return response;
    } catch (error) {
      return { success: false, isLocked: true, message: 'Failed to lock vehicle' };
    }
  },

  async controlUnlock(id: string): Promise<{ success: boolean; isLocked: boolean; message: string }> {
    try {
      const response = await apiClient.post<any>(`/vehicles/${id}/control-unlock`, {});
      return response;
    } catch (error) {
      return { success: false, isLocked: false, message: 'Failed to unlock vehicle' };
    }
  },

  async delete(id: string): Promise<boolean> {
    await delay(400);
    const { vehicles } = getDb();
    return dbDelete(STORAGE_KEYS.VEHICLES, vehicles, id);
  },

  async toggleWishlist(vehicleId: string, userId: string): Promise<boolean> {
    await delay(200);
    const { vehicles } = getDb();
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return false;

    const isWishlisted = vehicle.wishlistedBy.includes(userId);
    const wishlistedBy = isWishlisted
      ? vehicle.wishlistedBy.filter(id => id !== userId)
      : [...vehicle.wishlistedBy, userId];

    dbUpdate(STORAGE_KEYS.VEHICLES, vehicles, vehicleId, { wishlistedBy } as Partial<Vehicle>);
    return !isWishlisted;
  },

  async getWishlist(userId: string): Promise<Vehicle[]> {
    await delay(300);
    const { vehicles } = getDb();
    return vehicles.filter(v => v.wishlistedBy.includes(userId));
  },

  async getAIRecommendations(userId: string): Promise<Vehicle[]> {
    await delay(800);
    const { vehicles, bookings } = getDb();

    // Heuristic: find most booked categories by user
    const userBookings = bookings.filter(b => b.renterId === userId);
    const bookedVehicleIds = userBookings.map(b => b.vehicleId);
    const bookedVehicles = vehicles.filter(v => bookedVehicleIds.includes(v.id));

    // Find most common category
    const categoryCounts: Record<string, number> = {};
    bookedVehicles.forEach(v => {
      categoryCounts[v.category] = (categoryCounts[v.category] || 0) + 1;
    });

    const preferredCategory = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0];

    // Return top-rated vehicles in that category or just top rated overall
    return vehicles
      .filter(v => v.status === 'available' && (preferredCategory ? v.category === preferredCategory : true))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  },

  getBrands(): string[] {
    const { vehicles } = getDb();
    return [...new Set(vehicles.map(v => v.brand))].sort();
  },

  getCities(): string[] {
    const { vehicles } = getDb();
    return [...new Set(vehicles.map(v => v.location.city))].sort();
  },
};
