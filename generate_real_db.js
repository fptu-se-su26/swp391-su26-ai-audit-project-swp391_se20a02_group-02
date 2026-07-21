const fs = require('fs');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

const imagesDir = './src/Front_end/src/image';
const images = fs.readdirSync(imagesDir);

let sql = `
USE car_rental_platform;
GO

-- 1. Create 3 specific accounts
DELETE FROM users WHERE email IN ('nguyen.van.a@gmail.com', 'pham.minh.d@gmail.com', 'admin@luxeway.vn');

INSERT INTO users (id, email, password_hash, first_name, last_name, role, verified, created_at, updated_at) VALUES 
(NEWID(), 'nguyen.van.a@gmail.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Nguyen Van', 'A', 'customer', 1, GETDATE(), GETDATE()),
(NEWID(), 'pham.minh.d@gmail.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Pham Minh', 'D', 'owner', 1, GETDATE(), GETDATE()),
(NEWID(), 'admin@luxeway.vn', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Admin', 'LuxeWay', 'admin', 1, GETDATE(), GETDATE());

DECLARE @ownerId NVARCHAR(36) = (SELECT id FROM users WHERE email = 'pham.minh.d@gmail.com');

-- 2. Clear existing vehicles to avoid duplicates (optional, we'll just clear all vehicles for a fresh start)
DELETE FROM vehicles;

-- 3. Insert real vehicles
`;

// Helper to map image filename to brand and model
function parseVehicle(filename) {
    let originalName = filename.replace(/\.[^/.]+$/, ""); // remove extension
    let name = originalName.toLowerCase();
    
    // Clean up the model name
    let cleanModel = originalName.replace(/_/g, ' ').replace(/-/g, ' ');
    // Remove brand from model name if it exists (case-insensitive)
    let brandWords = ['toyota', 'honda', 'mazda', 'madaz', 'mercedes', 'mereedes', 'benz', 'bmw', 'audi', 'hyundai', 'kia', 'ford', 'porsche', 'vinfast', 'yamaha', 'kawasaki', 'kawaski', 'ktm', 'nissan', 'mitsubishi', 'mitsibishi', 'lexus', 'royal', 'enfield', 'sym'];
    let words = cleanModel.split(' ');
    cleanModel = words.filter(w => !brandWords.includes(w.toLowerCase())).join(' ');
    if (cleanModel.trim() === '') cleanModel = 'Standard';
    
    let category = 'SEDAN';
    let type = 'CAR';
    let brand = 'Toyota';
    let model = cleanModel.trim();
    let price = 1000000;
    
    name = name.toLowerCase();
    if (name.includes('bmw')) { brand = 'BMW'; price = 2500000; }
    else if (name.includes('honda')) { brand = 'Honda'; }
    else if (name.includes('mazda') || name.includes('madaz')) { brand = 'Mazda'; }
    else if (name.includes('mereedes') || name.includes('mercedes')) { brand = 'Mercedes-Benz'; price = 3000000; }
    else if (name.includes('toyota')) { brand = 'Toyota'; }
    else if (name.includes('hyundai')) { brand = 'Hyundai'; }
    else if (name.includes('kia')) { brand = 'Kia'; }
    else if (name.includes('porsche')) { brand = 'Porsche'; price = 6000000; category = 'BUSINESS'; }
    else if (name.includes('vinfast')) { brand = 'VinFast'; }
    else if (name.includes('yamaha')) { brand = 'Yamaha'; type = 'MOTORBIKE'; price = 150000; }
    else if (name.includes('kawasaki')) { brand = 'Kawasaki'; type = 'MOTORBIKE'; price = 250000; }
    else if (name.includes('ktm')) { brand = 'KTM'; type = 'MOTORBIKE'; price = 200000; }
    else if (name.includes('sh') || name.includes('vision') || name.includes('air_blade') || name.includes('winner') || name.includes('motobike')) {
        type = 'MOTORBIKE';
        price = 150000;
        brand = 'Honda'; // guess
        if (name.includes('motobike')) brand = 'Yamaha';
    } else if (name.includes('audi')) { brand = 'Audi'; price = 2500000; }
    else if (name.includes('lexus')) { brand = 'Lexus'; price = 3000000; }
    else if (name.includes('nissan')) { brand = 'Nissan'; price = 800000; }
    else if (name.includes('mitsubishi') || name.includes('mitsibishi')) { brand = 'Mitsubishi'; price = 900000; }
    else if (name.includes('ford')) { brand = 'Ford'; price = 1200000; }
    else if (name.includes('royal')) { brand = 'Royal Enfield'; type = 'MOTORBIKE'; price = 300000; }
    else if (name.includes('sym')) { brand = 'SYM'; type = 'MOTORBIKE'; price = 100000; }
    
    // Set some motorcycle prices for demo
    if (name.includes('sh_150i')) { price = 5000; } // The user requested SH 150i to be 5,000 VND
    
    if (type === 'MOTORBIKE') category = 'SCOOTER';
    if (name.includes('suv') || name.includes('cx-5') || name.includes('santa')) category = 'SUV';
    if (name.includes('carnival')) category = 'FAMILY';
    
    // Ignore non-vehicle images (like city ones, logo)
    if (name.includes('city') || name.includes('dalat') || name.includes('danang') || name.includes('hanoi') || name.includes('hochiminh') || name.includes('hue') || name.includes('hếu') || name.includes('nhatrang') || name.includes('logo') || name.includes('car')) {
        return null;
    }
    
    return { brand, model, type, category, price, filename };
}

let idx = 1;
for (let img of images) {
    let v = parseVehicle(img);
    if (!v) continue;
    
    let id = uuidv4();
    let plate = (v.type === 'CAR' ? '51K-' : '59S1-') + (1000 + idx);
    let url = '/src/image/' + v.filename; // React/Vite alias or correct path
    // Let's actually use the direct URL that Vite can serve or a public URL! Wait, if we use '/src/image/filename.jpg', it might fail in frontend. We'll use '/images/vehicles/filename' and I will copy them!
    
    sql += `
INSERT INTO vehicles (id, owner_id, name, brand, model, year, category, vehicle_type, description, price_per_day, deposit, city, country, address, latitude, longitude, seats, doors, transmission, fuel_type, license_plate, thumbnail_url, status, approval_status, is_verified, is_featured, instant_book, delivery_available, rating, total_reviews, total_bookings, created_at, updated_at)
VALUES ('${id}', @ownerId, '${v.brand} ${v.model}', '${v.brand}', '${v.model}', 2024, '${v.category}', '${v.type}', 'Beautiful ${v.model}', ${v.price}, ${v.price * 3}, 'Ho Chi Minh City', 'Vietnam', '123 Main St', 10.762622, 106.660172, ${v.type==='CAR'?5:2}, ${v.type==='CAR'?4:0}, 'AUTOMATIC', 'GASOLINE', '${plate}', '/images/vehicles/${v.filename}', 'AVAILABLE', 'APPROVED', 1, ${idx%3===0?1:0}, 1, 1, 4.8, 15, 30, GETDATE(), GETDATE());
`;
    idx++;
}

fs.writeFileSync('insert_real.sql', sql);
console.log('Done generating insert_real.sql with ' + idx + ' vehicles');
