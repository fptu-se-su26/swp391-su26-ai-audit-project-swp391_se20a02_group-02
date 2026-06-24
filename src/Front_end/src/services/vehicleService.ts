import { getDb, dbUpdate, dbCreate, dbDelete, STORAGE_KEYS } from '@/mock/db';
import type { Vehicle, VehicleFilters, ApiResponse } from '@/types';
import { faker } from '@faker-js/faker';

const DELAY = 400;
const delay = (ms = DELAY) => new Promise(r => setTimeout(r, ms));

export const vehicleService = {
  async getAll(filters?: VehicleFilters, page = 1, pageSize = 12): Promise<ApiResponse<Vehicle[]>> {
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

  async getById(id: string): Promise<Vehicle | null> {
    await delay(300);
    const { vehicles } = getDb();
    return vehicles.find(v => v.id === id) || null;
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
