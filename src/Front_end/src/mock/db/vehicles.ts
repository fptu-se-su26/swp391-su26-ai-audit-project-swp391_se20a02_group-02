import { faker } from '@faker-js/faker';
import type { Vehicle, VehicleCategory, TransmissionType, FuelType, VehicleAddon } from '@/types';

faker.seed(42);

// ====== REAL UNSPLASH VEHICLE IMAGES (VIETNAM CONTEXT) ======
const VEHICLE_IMAGE_SETS: Record<string, string[]> = {
  economy: [
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop'
  ],
  family: [
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&auto=format&fit=crop'
  ],
  business: [
    'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop'
  ],
  electric: [
    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop'
  ],
  motorbike: [
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558980394-0a37b3636608?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&auto=format&fit=crop'
  ],
  suv: [
    'https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop'
  ],
  city_car: [
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=800&auto=format&fit=crop'
  ],
  tourism: [
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop'
  ]
};

// ====== VEHICLE DATA TEMPLATES (VIETNAM) ======
const VEHICLE_TEMPLATES = [
  // ---- MOTORBIKES ----
  { brand: 'Honda', model: 'Vision', category: 'motorbike' as VehicleCategory, hp: 9, speed: 90, acc: 10, price: 150000 },
  { brand: 'Honda', model: 'Air Blade', category: 'motorbike' as VehicleCategory, hp: 11, speed: 100, acc: 9, price: 200000 },
  { brand: 'Honda', model: 'SH Mode', category: 'motorbike' as VehicleCategory, hp: 11, speed: 100, acc: 9, price: 250000 },
  { brand: 'Honda', model: 'SH 125i', category: 'motorbike' as VehicleCategory, hp: 13, speed: 110, acc: 8, price: 300000 },
  { brand: 'Honda', model: 'SH 350i', category: 'motorbike' as VehicleCategory, hp: 29, speed: 140, acc: 6, price: 500000 },
  { brand: 'Honda', model: 'Lead', category: 'motorbike' as VehicleCategory, hp: 11, speed: 95, acc: 10, price: 180000 },
  { brand: 'Honda', model: 'Wave Alpha', category: 'motorbike' as VehicleCategory, hp: 8, speed: 85, acc: 12, price: 100000 },
  { brand: 'Honda', model: 'Future', category: 'motorbike' as VehicleCategory, hp: 9, speed: 90, acc: 11, price: 120000 },
  { brand: 'Honda', model: 'Winner X', category: 'motorbike' as VehicleCategory, hp: 15, speed: 120, acc: 7, price: 250000 },
  { brand: 'Yamaha', model: 'Janus', category: 'motorbike' as VehicleCategory, hp: 9, speed: 90, acc: 10, price: 150000 },
  { brand: 'Yamaha', model: 'Grande', category: 'motorbike' as VehicleCategory, hp: 8, speed: 95, acc: 11, price: 180000 },
  { brand: 'Yamaha', model: 'Exciter', category: 'motorbike' as VehicleCategory, hp: 15, speed: 120, acc: 7, price: 250000 },
  { brand: 'Yamaha', model: 'Sirius', category: 'motorbike' as VehicleCategory, hp: 8, speed: 90, acc: 11, price: 120000 },
  { brand: 'Suzuki', model: 'Raider', category: 'motorbike' as VehicleCategory, hp: 18, speed: 130, acc: 6, price: 300000 },
  { brand: 'Piaggio', model: 'Liberty', category: 'motorbike' as VehicleCategory, hp: 10, speed: 95, acc: 10, price: 200000 },
  { brand: 'Piaggio', model: 'Medley', category: 'motorbike' as VehicleCategory, hp: 15, speed: 110, acc: 8, price: 300000 },
  { brand: 'Vespa', model: 'Sprint', category: 'motorbike' as VehicleCategory, hp: 11, speed: 100, acc: 9, price: 400000 },
  { brand: 'SYM', model: 'Attila', category: 'motorbike' as VehicleCategory, hp: 9, speed: 90, acc: 11, price: 150000 },
  { brand: 'VinFast', model: 'Evo', category: 'motorbike' as VehicleCategory, hp: 3, speed: 70, acc: 12, price: 120000 },
  { brand: 'VinFast', model: 'Feliz', category: 'motorbike' as VehicleCategory, hp: 4, speed: 90, acc: 10, price: 150000 },
  { brand: 'VinFast', model: 'Klara', category: 'motorbike' as VehicleCategory, hp: 4, speed: 80, acc: 11, price: 180000 },
  { brand: 'VinFast', model: 'Vento', category: 'motorbike' as VehicleCategory, hp: 5, speed: 90, acc: 9, price: 250000 },
  { brand: 'VinFast', model: 'Theon', category: 'motorbike' as VehicleCategory, hp: 9, speed: 100, acc: 8, price: 350000 },
  // ---- CARS ----
  { brand: 'Toyota', model: 'Vios', category: 'economy' as VehicleCategory, hp: 107, speed: 180, acc: 10.5, price: 800000 },
  { brand: 'Toyota', model: 'Innova', category: 'family' as VehicleCategory, hp: 137, speed: 170, acc: 11.2, price: 1200000 },
  { brand: 'Toyota', model: 'Fortuner', category: 'suv' as VehicleCategory, hp: 148, speed: 185, acc: 11.0, price: 1500000 },
  { brand: 'Toyota', model: 'Corolla Cross', category: 'suv' as VehicleCategory, hp: 138, speed: 185, acc: 10.0, price: 1300000 },
  { brand: 'Mazda', model: '2', category: 'city_car' as VehicleCategory, hp: 110, speed: 180, acc: 10.2, price: 750000 },
  { brand: 'Mazda', model: '3', category: 'economy' as VehicleCategory, hp: 153, speed: 200, acc: 9.0, price: 900000 },
  { brand: 'Mazda', model: 'CX5', category: 'suv' as VehicleCategory, hp: 188, speed: 200, acc: 8.5, price: 1300000 },
  { brand: 'KIA', model: 'Morning', category: 'city_car' as VehicleCategory, hp: 83, speed: 160, acc: 13.0, price: 600000 },
  { brand: 'KIA', model: 'K3', category: 'economy' as VehicleCategory, hp: 126, speed: 190, acc: 10.5, price: 850000 },
  { brand: 'KIA', model: 'Carnival', category: 'family' as VehicleCategory, hp: 268, speed: 210, acc: 8.5, price: 2500000 },
  { brand: 'Hyundai', model: 'Accent', category: 'economy' as VehicleCategory, hp: 100, speed: 180, acc: 11.0, price: 800000 },
  { brand: 'Hyundai', model: 'Tucson', category: 'suv' as VehicleCategory, hp: 156, speed: 195, acc: 9.5, price: 1300000 },
  { brand: 'Hyundai', model: 'Santa Fe', category: 'suv' as VehicleCategory, hp: 202, speed: 210, acc: 8.0, price: 1800000 },
  { brand: 'Ford', model: 'Ranger', category: 'business' as VehicleCategory, hp: 210, speed: 180, acc: 10.0, price: 1400000 },
  { brand: 'Ford', model: 'Everest', category: 'suv' as VehicleCategory, hp: 210, speed: 190, acc: 9.5, price: 1600000 },
  { brand: 'Honda', model: 'City', category: 'economy' as VehicleCategory, hp: 119, speed: 190, acc: 10.0, price: 800000 },
  { brand: 'Honda', model: 'CRV', category: 'suv' as VehicleCategory, hp: 188, speed: 200, acc: 8.5, price: 1400000 },
  { brand: 'Mitsubishi', model: 'Xpander', category: 'family' as VehicleCategory, hp: 103, speed: 170, acc: 12.0, price: 1200000 },
  // ---- ELECTRIC CARS ----
  { brand: 'VinFast', model: 'VF3', category: 'electric' as VehicleCategory, hp: 43, speed: 100, acc: 14.0, price: 800000 },
  { brand: 'VinFast', model: 'VF5', category: 'electric' as VehicleCategory, hp: 134, speed: 130, acc: 10.9, price: 900000 },
  { brand: 'VinFast', model: 'VF6', category: 'electric' as VehicleCategory, hp: 174, speed: 150, acc: 8.9, price: 1200000 },
  { brand: 'VinFast', model: 'VF7', category: 'electric' as VehicleCategory, hp: 349, speed: 170, acc: 5.8, price: 1600000 },
  { brand: 'VinFast', model: 'VF8', category: 'electric' as VehicleCategory, hp: 349, speed: 200, acc: 5.5, price: 2000000 },
  { brand: 'VinFast', model: 'VF9', category: 'electric' as VehicleCategory, hp: 402, speed: 200, acc: 6.5, price: 3500000 },
];

const CITIES = [
  { city: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.8231, lng: 106.6297 },
  { city: 'Ha Noi', country: 'Vietnam', lat: 21.0285, lng: 105.8542 },
  { city: 'Da Nang', country: 'Vietnam', lat: 16.0471, lng: 108.2062 },
  { city: 'Hai Phong', country: 'Vietnam', lat: 20.8449, lng: 106.6881 },
  { city: 'Can Tho', country: 'Vietnam', lat: 10.0452, lng: 105.7469 },
  { city: 'Hue', country: 'Vietnam', lat: 16.4637, lng: 107.5909 },
  { city: 'Nha Trang', country: 'Vietnam', lat: 12.2388, lng: 109.1967 },
  { city: 'Da Lat', country: 'Vietnam', lat: 11.9404, lng: 108.4384 },
  { city: 'Quang Nam', country: 'Vietnam', lat: 15.5413, lng: 107.9710 },
];

const COMMON_FEATURES = [
  'Air Conditioning', 'Bluetooth', 'USB Port', 'Backup Camera',
  'Apple CarPlay', 'Android Auto', 'Dash Cam', 'Sunroof',
  'Leather Seats', 'Cruise Control', 'Keyless Entry', 'Helmet Included',
  'Rain Poncho Included', 'Phone Holder'
];

const COMMON_RULES = [
  'No smoking', 'Clean return required', 'Valid driving license required',
  'ID Card deposit required', 'Full tank return', 'No off-road driving'
];

const ADDONS: VehicleAddon[] = [
  { id: 'addon-helmet', name: 'Extra Helmet', description: 'Additional safety helmet', pricePerDay: 50000, icon: 'sports_motorsports' },
  { id: 'addon-driver', name: 'Professional Driver', description: 'Experienced local driver', pricePerDay: 500000, icon: 'person' },
  { id: 'addon-delivery', name: 'Doorstep Delivery', description: 'Vehicle delivered to you', pricePerDay: 100000, icon: 'local_shipping' },
  { id: 'addon-raincoat', name: 'Premium Raincoat', description: 'Full body raincoat', pricePerDay: 20000, icon: 'umbrella' },
];

const OWNER_IDS = ['owner-001', 'business-owner-001', 'user-010', 'user-011', 'user-012', 'user-013'];

export function generateVehicles(): Vehicle[] {
  const vehicles: Vehicle[] = [];

  for (let i = 0; i < 100; i++) {
    const template = VEHICLE_TEMPLATES[i % VEHICLE_TEMPLATES.length];
    const city = faker.helpers.arrayElement(CITIES);
    const category = template.category;
    const images = VEHICLE_IMAGE_SETS[category] || VEHICLE_IMAGE_SETS.economy;
    const shuffledImages = faker.helpers.shuffle([...images]);
    const vehicleImages = shuffledImages.slice(0, Math.min(4, shuffledImages.length));

    // Ensure we have at least 2 images
    while (vehicleImages.length < 2) {
      vehicleImages.push(images[0]);
    }

    const priceVariation = faker.number.float({ min: 0.9, max: 1.1 });
    const pricePerDay = Math.round(template.price * priceVariation / 1000) * 1000;
    const ownerId = faker.helpers.arrayElement(OWNER_IDS);
    const rating = parseFloat(faker.number.float({ min: 4.0, max: 5.0, fractionDigits: 1 }).toFixed(1));
    const totalReviews = faker.number.int({ min: 3, max: 150 });
    const year = faker.number.int({ min: 2019, max: 2024 });

    const colors = ['Black', 'White', 'Red', 'Blue', 'Silver', 'Grey'];
    const transmissions: TransmissionType[] = category === 'motorbike' || category === 'electric' ? ['automatic'] : ['automatic', 'manual'];
    const fuelTypes: FuelType[] = category === 'electric' ? ['electric'] : ['gasoline'];

    vehicles.push({
      id: `vehicle-${String(i + 1).padStart(3, '0')}`,
      ownerId,

      name: `${template.brand} ${template.model} ${year}`,
      brand: template.brand,
      model: template.model,
      year,
      category,
      description: `Experience a reliable and comfortable ride with the ${year} ${template.brand} ${template.model}. Perfect for navigating city streets or taking a road trip.`,
      images: vehicleImages,
      thumbnailUrl: vehicleImages[0],
      pricePerDay,
      pricePerWeek: Math.round(pricePerDay * 6),
      deposit: Math.round(pricePerDay * 2),
      location: {
        city: city.city,
        country: city.country,
        address: faker.location.streetAddress(),
        lat: city.lat + faker.number.float({ min: -0.05, max: 0.05 }),
        lng: city.lng + faker.number.float({ min: -0.05, max: 0.05 }),
        timezone: 'Asia/Ho_Chi_Minh',
      },
      specs: {
        horsepower: template.hp,
        topSpeed: template.speed,
        acceleration: template.acc,
        seats: category === 'motorbike' ? 2 : faker.helpers.arrayElement([4, 5, 7]),
        doors: category === 'motorbike' ? 0 : faker.helpers.arrayElement([4, 5]),
        transmission: faker.helpers.arrayElement(transmissions),
        fuelType: fuelTypes[0],
        range: category === 'electric' ? faker.number.int({ min: 100, max: 400 }) : undefined,
        engineSize: category !== 'electric' && category !== 'motorbike' ? faker.helpers.arrayElement(['1.5L', '2.0L', '2.5L']) : undefined,
        color: faker.helpers.arrayElement(colors),
        licensePlate: `${faker.number.int({ min: 29, max: 99 })}${faker.helpers.arrayElement(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z'])}-${faker.number.int({ min: 100, max: 999 })}.${faker.number.int({ min: 10, max: 99 })}`,
      },
      features: faker.helpers.arrayElements(COMMON_FEATURES, faker.number.int({ min: 4, max: 8 })),
      rules: faker.helpers.arrayElements(COMMON_RULES, faker.number.int({ min: 3, max: 6 })),
      insurance: {
        included: faker.datatype.boolean({ probability: 0.5 }),
        provider: faker.helpers.arrayElement(['Bao Viet', 'PVI', 'PTI', 'MIC']),
        coverage: 'Standard comprehensive',
      },
      availability: {
        blockedDates: [],
        minRentalDays: 1,
        maxRentalDays: faker.number.int({ min: 14, max: 30 }),
        advanceBookingDays: 1,
      },
      status: faker.helpers.weightedArrayElement([
        { weight: 80, value: 'available' },
        { weight: 15, value: 'rented' },
        { weight: 3, value: 'maintenance' },
        { weight: 2, value: 'pending_approval' },
      ]) as Vehicle['status'],
      rating,
      totalReviews,
      totalBookings: faker.number.int({ min: totalReviews, max: totalReviews + 50 }),
      isVerified: faker.datatype.boolean({ probability: 0.9 }),
      isFeatured: i < 12,
      wishlistedBy: [],
      createdAt: faker.date.past({ years: 1 }).toISOString(),
      updatedAt: faker.date.recent({ days: 10 }).toISOString(),
      addons: ADDONS.slice(0, faker.number.int({ min: 1, max: 4 })),
      instantBook: faker.datatype.boolean({ probability: 0.8 }),
      deliveryAvailable: faker.datatype.boolean({ probability: 0.8 }),
      deliveryFee: faker.number.int({ min: 50000, max: 150000 }),
    });
  }

  return vehicles;
}
