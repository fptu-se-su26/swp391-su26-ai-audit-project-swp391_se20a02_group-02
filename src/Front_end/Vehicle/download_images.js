const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const IMAGES_PER_VEHICLE = 4;
const DELAY_MS = 2000;

const headers = {
    'User-Agent': 'LuxeWayBot/1.0 (luxeway@example.com)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Assign a fixed color per brand so all images of the same brand use the same color keyword
const brandColors = {
    'Audi': 'white', 'BMW': 'white', 'Chevrolet': 'white', 'Ford': 'white',
    'Honda': 'white', 'Hyundai': 'white', 'Kia': 'white', 'Lexus': 'black',
    'Mazda': 'red', 'Mercedes-Benz': 'black', 'Mitsubishi': 'white',
    'Nissan': 'white', 'Peugeot': 'white', 'Porsche': 'white',
    'Subaru': 'white', 'Suzuki': 'white', 'Toyota': 'white',
    'VinFast': 'white', 'Volvo': 'white',
    'BMW Motorrad': 'white', 'Ducati': 'red', 'Harley-Davidson': 'black',
    'Kawasaki': 'green', 'KTM': 'orange', 'Royal Enfield': 'black',
    'SYM': 'white', 'Triumph': 'black', 'Vespa': 'white',
    'Yamaha': 'blue',
};

async function searchBingImages(query) {
    const searchQuery = encodeURIComponent(query);
    const url = `https://www.bing.com/images/search?q=${searchQuery}&first=1&count=30&qft=+filterui:photo-photo+filterui:imagesize-large`;

    try {
        const response = await fetch(url, { headers });
        const html = await response.text();

        const imageUrls = [];
        const regex = /murl&quot;:&quot;(https?:\/\/[^&]+?\.(?:jpg|jpeg|png|webp))/gi;
        let match;

        while ((match = regex.exec(html)) !== null) {
            let imgUrl = match[1];
            if (imgUrl.includes('favicon') || imgUrl.includes('logo') ||
                imgUrl.includes('icon') || imgUrl.includes('avatar') ||
                imgUrl.includes('badge') || imgUrl.length > 500) continue;
            imageUrls.push(imgUrl);
        }

        return imageUrls;
    } catch (e) {
        console.error(`  Search error: ${e.message}`);
        return [];
    }
}

async function downloadFile(url, destPath) {
    try {
        const response = await fetch(url, {
            headers: { ...headers, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            signal: AbortSignal.timeout(15000),
            redirect: 'follow'
        });
        if (!response.ok) return false;
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength < 5000) return false;
        fs.writeFileSync(destPath, Buffer.from(buffer));
        return true;
    } catch (e) {
        return false;
    }
}

async function downloadImagesForVehicle(vehicleName, destDir, brand, category) {
    const existing = fs.readdirSync(destDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    if (existing.length >= IMAGES_PER_VEHICLE) {
        console.log(`  [SKIP] Already has ${existing.length} images`);
        return existing.length;
    }

    const color = brandColors[brand] || 'white';
    const typeWord = category === 'Car' ? 'car' : 'motorcycle';
    
    // Search with specific color to get consistent results
    const searchTerm = `${vehicleName} ${color} ${typeWord} 2024 exterior`;
    const urls = await searchBingImages(searchTerm);

    if (urls.length === 0) {
        // Fallback: search without color
        const fallbackTerm = `${vehicleName} ${typeWord} exterior photo`;
        const fallbackUrls = await searchBingImages(fallbackTerm);
        urls.push(...fallbackUrls);
    }

    if (urls.length === 0) {
        console.log(`  [WARN] No images found`);
        return 0;
    }

    let downloaded = 0;
    for (let i = 0; i < urls.length && downloaded < IMAGES_PER_VEHICLE; i++) {
        const ext = urls[i].match(/\.(jpg|jpeg|png|webp)/i)?.[1] || 'jpg';
        const fileName = `${vehicleName.replace(/ /g, '_')}_${downloaded + 1}.${ext}`;
        const destPath = path.join(destDir, fileName);
        const success = await downloadFile(urls[i], destPath);
        if (success) downloaded++;
    }

    console.log(`  [OK] ${downloaded}/${IMAGES_PER_VEHICLE} images (color: ${color})`);
    return downloaded;
}

async function processAll() {
    const categories = ['Car', 'Motorbike'];
    let total = 0, totalImages = 0;

    for (const category of categories) {
        const catDir = path.join(baseDir, category);
        if (!fs.existsSync(catDir)) continue;

        const brands = fs.readdirSync(catDir, { withFileTypes: true })
            .filter(e => e.isDirectory()).map(e => e.name).sort();

        for (const brand of brands) {
            const brandDir = path.join(catDir, brand);
            const vehicles = fs.readdirSync(brandDir, { withFileTypes: true })
                .filter(e => e.isDirectory()).map(e => e.name).sort();

            console.log(`\n=== ${brand} (${category}) ===`);

            for (const vehicle of vehicles) {
                total++;
                console.log(`[${total}] ${vehicle}...`);
                const count = await downloadImagesForVehicle(
                    vehicle, path.join(brandDir, vehicle), brand, category
                );
                totalImages += count;
                await sleep(DELAY_MS);
            }
        }
    }

    console.log(`\n========================================`);
    console.log(`Done! ${total} vehicles, ${totalImages} images.`);
}

console.log('=== Vehicle Image Downloader v3 ===');
console.log('Strategy: Search with specific color per brand for consistency');
processAll();
