import { faker } from '@faker-js/faker';
import type { Vehicle, VehicleCategory, TransmissionType, FuelType, VehicleAddon } from '@/types';

faker.seed(42);

// ====== REAL UNSPLASH VEHICLE IMAGES ======
const VEHICLE_IMAGE_SETS: Record<string, string[]> = {
  supercar: [
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&auto=format&fit=crop',
  ],
  luxury: [
    'https://images.unsplash.com/photo-1631269662035-7c05051e51b1?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop',
  ],
  suv: [
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop',
  ],
  convertible: [
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop',
  ],
  classic: [
    'https://images.unsplash.com/photo-1566008885218-90abf9200ddb?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=800&auto=format&fit=crop',
  ],
  electric: [
    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop',
  ],
  van: [
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
  ],
};

// ====== VEHICLE DATA TEMPLATES ======
const VEHICLE_TEMPLATES = [
  // ---- SUPERCARS ----
  { brand: 'Ferrari', model: '488 Pista', category: 'supercar' as VehicleCategory, hp: 710, speed: 340, acc: 2.85, price: 1800 },
  { brand: 'Ferrari', model: 'F8 Tributo', category: 'supercar' as VehicleCategory, hp: 720, speed: 340, acc: 2.9, price: 1650 },
  { brand: 'Lamborghini', model: 'Huracán EVO', category: 'supercar' as VehicleCategory, hp: 640, speed: 325, acc: 2.9, price: 1900 },
  { brand: 'Lamborghini', model: 'Urus', category: 'suv' as VehicleCategory, hp: 650, speed: 305, acc: 3.6, price: 1200 },
  { brand: 'Porsche', model: '911 Turbo S', category: 'supercar' as VehicleCategory, hp: 650, speed: 330, acc: 2.7, price: 1200 },
  { brand: 'Porsche', model: '918 Spyder', category: 'supercar' as VehicleCategory, hp: 887, speed: 345, acc: 2.5, price: 3500 },
  { brand: 'McLaren', model: '720S', category: 'supercar' as VehicleCategory, hp: 720, speed: 341, acc: 2.9, price: 2200 },
  { brand: 'McLaren', model: '570S', category: 'supercar' as VehicleCategory, hp: 570, speed: 328, acc: 3.2, price: 1600 },
  { brand: 'Bugatti', model: 'Chiron', category: 'supercar' as VehicleCategory, hp: 1479, speed: 420, acc: 2.4, price: 8500 },
  { brand: 'Koenigsegg', model: 'Jesko', category: 'supercar' as VehicleCategory, hp: 1600, speed: 450, acc: 2.5, price: 12000 },
  // ---- LUXURY ----
  { brand: 'Rolls-Royce', model: 'Phantom', category: 'luxury' as VehicleCategory, hp: 563, speed: 250, acc: 5.1, price: 3500 },
  { brand: 'Rolls-Royce', model: 'Ghost', category: 'luxury' as VehicleCategory, hp: 563, speed: 250, acc: 4.8, price: 2800 },
  { brand: 'Rolls-Royce', model: 'Cullinan', category: 'suv' as VehicleCategory, hp: 563, speed: 250, acc: 4.9, price: 3200 },
  { brand: 'Bentley', model: 'Continental GT', category: 'luxury' as VehicleCategory, hp: 626, speed: 333, acc: 3.6, price: 2200 },
  { brand: 'Bentley', model: 'Bentayga', category: 'suv' as VehicleCategory, hp: 626, speed: 306, acc: 3.9, price: 2000 },
  { brand: 'Bentley', model: 'Flying Spur', category: 'luxury' as VehicleCategory, hp: 626, speed: 333, acc: 3.8, price: 2400 },
  { brand: 'Mercedes-Benz', model: 'S-Class AMG', category: 'luxury' as VehicleCategory, hp: 620, speed: 290, acc: 3.3, price: 1100 },
  { brand: 'Mercedes-Benz', model: 'G63 AMG', category: 'suv' as VehicleCategory, hp: 577, speed: 220, acc: 4.5, price: 1400 },
  { brand: 'BMW', model: 'M8 Competition', category: 'luxury' as VehicleCategory, hp: 617, speed: 305, acc: 3.2, price: 950 },
  { brand: 'Audi', model: 'RS7 Sportback', category: 'luxury' as VehicleCategory, hp: 591, speed: 305, acc: 3.6, price: 880 },
  // ---- CONVERTIBLES ----
  { brand: 'Ferrari', model: 'Portofino M', category: 'convertible' as VehicleCategory, hp: 620, speed: 320, acc: 3.45, price: 1400 },
  { brand: 'Lamborghini', model: 'Huracán Spyder', category: 'convertible' as VehicleCategory, hp: 610, speed: 324, acc: 3.4, price: 1750 },
  { brand: 'Porsche', model: '911 Cabriolet', category: 'convertible' as VehicleCategory, hp: 450, speed: 304, acc: 3.6, price: 900 },
  { brand: 'Aston Martin', model: 'DB11 Volante', category: 'convertible' as VehicleCategory, hp: 510, speed: 300, acc: 4.1, price: 1500 },
  { brand: 'McLaren', model: '720S Spider', category: 'convertible' as VehicleCategory, hp: 720, speed: 341, acc: 2.9, price: 2400 },
  // ---- CLASSIC ----
  { brand: 'Ferrari', model: '275 GTB', category: 'classic' as VehicleCategory, hp: 300, speed: 265, acc: 6.2, price: 2500 },
  { brand: 'Porsche', model: '911 Carrera 2.7 RS', category: 'classic' as VehicleCategory, hp: 210, speed: 240, acc: 5.8, price: 1800 },
  { brand: 'Mercedes-Benz', model: '300SL Gullwing', category: 'classic' as VehicleCategory, hp: 240, speed: 260, acc: 6.8, price: 3200 },
  // ---- ELECTRIC ----
  { brand: 'Rimac', model: 'Nevera', category: 'electric' as VehicleCategory, hp: 1914, speed: 412, acc: 1.85, price: 4500 },
  { brand: 'Tesla', model: 'Roadster', category: 'electric' as VehicleCategory, hp: 1000, speed: 410, acc: 1.9, price: 1800 },
  { brand: 'Porsche', model: 'Taycan Turbo S', category: 'electric' as VehicleCategory, hp: 761, speed: 260, acc: 2.8, price: 950 },
  { brand: 'Audi', model: 'e-tron GT RS', category: 'electric' as VehicleCategory, hp: 646, speed: 250, acc: 3.3, price: 780 },
  // ---- REPEAT to hit 100 ----
  { brand: 'Ferrari', model: 'SF90 Stradale', category: 'supercar' as VehicleCategory, hp: 986, speed: 340, acc: 2.5, price: 4200 },
  { brand: 'Lamborghini', model: 'Aventador SVJ', category: 'supercar' as VehicleCategory, hp: 770, speed: 350, acc: 2.8, price: 3800 },
  { brand: 'Aston Martin', model: 'Vantage F1', category: 'supercar' as VehicleCategory, hp: 528, speed: 314, acc: 3.7, price: 1300 },
  { brand: 'Maserati', model: 'MC20', category: 'supercar' as VehicleCategory, hp: 630, speed: 325, acc: 2.9, price: 1600 },
  { brand: 'McLaren', model: 'Artura', category: 'supercar' as VehicleCategory, hp: 671, speed: 330, acc: 3.0, price: 1750 },
  { brand: 'Porsche', model: 'GT3 RS', category: 'supercar' as VehicleCategory, hp: 525, speed: 296, acc: 3.2, price: 1100 },
];

const CITIES = [
  { city: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437 },
  { city: 'Miami', country: 'USA', lat: 25.7617, lng: -80.1918 },
  { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.006 },
  { city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 },
  { city: 'Monaco', country: 'Monaco', lat: 43.7384, lng: 7.4246 },
  { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
  { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { city: 'Beverly Hills', country: 'USA', lat: 34.0736, lng: -118.4004 },
  { city: 'Las Vegas', country: 'USA', lat: 36.1699, lng: -115.1398 },
  { city: 'Malibu', country: 'USA', lat: 34.0259, lng: -118.7798 },
  { city: 'St. Moritz', country: 'Switzerland', lat: 46.4977, lng: 9.8378 },
  { city: 'Cannes', country: 'France', lat: 43.5528, lng: 7.0174 },
];

const COMMON_FEATURES = [
  'Navigation System', 'Heated Seats', 'Ventilated Seats', 'Sunroof',
  'Premium Sound System', 'Apple CarPlay', 'Android Auto', 'Backup Camera',
  '360° Cameras', 'Blind Spot Monitor', 'Lane Assist', 'Adaptive Cruise Control',
  'Night Vision', 'Massage Seats', 'Ambient Lighting', 'Head-Up Display',
  'Launch Control', 'Track Mode', 'Ceramic Brakes', 'Carbon Fiber Package',
  'Sport Exhaust', 'Carbon Ceramic Brakes', 'Alcantara Interior',
];

const COMMON_RULES = [
  'No smoking', 'No pets', 'Clean return required', 'No off-road driving',
  'Minimum age 25', 'Valid international license required', 'Security deposit required',
  'Full tank return', 'Maximum 500km/day included', 'Track driving prohibited',
];

const ADDONS: VehicleAddon[] = [
  { id: 'addon-gps', name: 'GPS Navigator', description: 'Premium navigation device', pricePerDay: 15, icon: 'navigation' },
  { id: 'addon-chauffeur', name: 'Professional Chauffeur', description: 'Licensed professional driver', pricePerDay: 250, icon: 'person' },
  { id: 'addon-delivery', name: 'Doorstep Delivery', description: 'Vehicle delivered to your location', pricePerDay: 0, icon: 'local_shipping' },
  { id: 'addon-baby', name: 'Baby Seat', description: 'Premium safety-certified baby seat', pricePerDay: 10, icon: 'child_care' },
  { id: 'addon-wifi', name: 'Mobile WiFi Hotspot', description: 'Unlimited data hotspot device', pricePerDay: 12, icon: 'wifi' },
  { id: 'addon-tollpass', name: 'Toll Pass', description: 'Prepaid toll transponder', pricePerDay: 8, icon: 'toll' },
];

const OWNER_IDS = ['owner-001', 'business-owner-001', 'user-010', 'user-011', 'user-012', 'user-013'];

export function generateVehicles(): Vehicle[] {
  const vehicles: Vehicle[] = [];

  for (let i = 0; i < 100; i++) {
    const template = VEHICLE_TEMPLATES[i % VEHICLE_TEMPLATES.length];
    const city = faker.helpers.arrayElement(CITIES);
    const category = template.category;
    const images = VEHICLE_IMAGE_SETS[category] || VEHICLE_IMAGE_SETS.supercar;
    const shuffledImages = faker.helpers.shuffle([...images]);
    const vehicleImages = shuffledImages.slice(0, Math.min(4, shuffledImages.length));

    // Ensure we have at least 2 images
    while (vehicleImages.length < 2) {
      vehicleImages.push(images[0]);
    }

    const priceVariation = faker.number.float({ min: 0.8, max: 1.3 });
    const pricePerDay = Math.round(template.price * priceVariation);
    const ownerId = faker.helpers.arrayElement(OWNER_IDS);
    const rating = parseFloat(faker.number.float({ min: 4.0, max: 5.0, fractionDigits: 1 }).toFixed(1));
    const totalReviews = faker.number.int({ min: 3, max: 150 });
    const year = faker.number.int({ min: 2019, max: 2024 });

    const colors = ['Midnight Black', 'Pearl White', 'Racing Red', 'Sapphire Blue', 'Graphite Grey', 'Champagne Gold', 'British Racing Green', 'Arctic White'];
    const transmissions: TransmissionType[] = ['automatic', 'manual'];
    const fuelTypes: FuelType[] = category === 'electric' ? ['electric'] : ['gasoline'];

    vehicles.push({
      id: `vehicle-${String(i + 1).padStart(3, '0')}`,
      ownerId,
      businessId: ownerId === 'business-owner-001' ? 'business-002' : undefined,
      name: `${template.brand} ${template.model} ${year}`,
      brand: template.brand,
      model: template.model,
      year,
      category,
      description: `Experience the pinnacle of automotive engineering with the ${year} ${template.brand} ${template.model}. ${faker.lorem.sentences(3)}`,
      images: vehicleImages,
      thumbnailUrl: vehicleImages[0],
      pricePerDay,
      pricePerWeek: Math.round(pricePerDay * 6.5),
      deposit: Math.round(pricePerDay * 3),
      location: {
        city: city.city,
        country: city.country,
        address: faker.location.streetAddress(),
        lat: city.lat + faker.number.float({ min: -0.05, max: 0.05 }),
        lng: city.lng + faker.number.float({ min: -0.05, max: 0.05 }),
        timezone: 'America/New_York',
      },
      specs: {
        horsepower: template.hp,
        topSpeed: template.speed,
        acceleration: template.acc,
        seats: faker.helpers.arrayElement([2, 4, 5]),
        doors: faker.helpers.arrayElement([2, 4]),
        transmission: faker.helpers.arrayElement(transmissions),
        fuelType: fuelTypes[0],
        range: category === 'electric' ? faker.number.int({ min: 300, max: 600 }) : undefined,
        engineSize: category !== 'electric' ? faker.helpers.arrayElement(['3.9L V8', '4.0L V8', '6.5L V12', '5.0L V10', '3.0L I6']) : undefined,
        color: faker.helpers.arrayElement(colors),
        licensePlate: faker.vehicle.vrm(),
      },
      features: faker.helpers.arrayElements(COMMON_FEATURES, faker.number.int({ min: 6, max: 12 })),
      rules: faker.helpers.arrayElements(COMMON_RULES, faker.number.int({ min: 4, max: 7 })),
      insurance: {
        included: faker.datatype.boolean({ probability: 0.7 }),
        provider: faker.helpers.arrayElement(['Allianz Luxury', 'Chubb Premier', 'AXA Elite']),
        coverage: '$1,000,000 comprehensive',
      },
      availability: {
        blockedDates: [],
        minRentalDays: faker.number.int({ min: 1, max: 3 }),
        maxRentalDays: faker.number.int({ min: 14, max: 60 }),
        advanceBookingDays: faker.number.int({ min: 1, max: 7 }),
      },
      status: faker.helpers.weightedArrayElement([
        { weight: 80, value: 'available' },
        { weight: 12, value: 'rented' },
        { weight: 5, value: 'maintenance' },
        { weight: 3, value: 'pending_approval' },
      ]) as Vehicle['status'],
      rating,
      totalReviews,
      totalBookings: faker.number.int({ min: totalReviews, max: totalReviews + 50 }),
      isVerified: faker.datatype.boolean({ probability: 0.85 }),
      isFeatured: i < 9,
      wishlistedBy: [],
      createdAt: faker.date.past({ years: 2 }).toISOString(),
      updatedAt: faker.date.recent({ days: 30 }).toISOString(),
      addons: ADDONS.slice(0, faker.number.int({ min: 2, max: 6 })),
      instantBook: faker.datatype.boolean({ probability: 0.6 }),
      deliveryAvailable: faker.datatype.boolean({ probability: 0.7 }),
      deliveryFee: faker.number.int({ min: 50, max: 200 }),
    });
  }

  return vehicles;
}
