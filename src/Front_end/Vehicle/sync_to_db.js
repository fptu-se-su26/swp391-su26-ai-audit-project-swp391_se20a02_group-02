const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const vehicleDir = 'C:\\Users\\trung\\Desktop\\Vehicle';
const uploadsDir = 'c:\\Antigravity\\.antigravity\\All Project\\swp391-su26-ai-audit-project-swp391_se20a02_group-02\\src\\Back_end\\uploads';
const sqlFile = path.join(vehicleDir, 'sync.sql');

function uuid() { return crypto.randomUUID(); }

function sql(query) {
    try {
        return execSync(`sqlcmd -S localhost,1433 -d Car_rental_DB -U sa -P 123456 -Q "${query.replace(/"/g, '\\"')}" -W -s "|" -h -1`, 
            { encoding: 'utf8', timeout: 10000 });
    } catch(e) { console.error('SQL Error:', e.message); return ''; }
}

function sqlFromFile(filePath) {
    try {
        return execSync(`sqlcmd -S localhost,1433 -d Car_rental_DB -U sa -P 123456 -i "${filePath}"`, 
            { encoding: 'utf8', timeout: 60000 });
    } catch(e) { console.error('SQL File Error:', e.message); return ''; }
}

function getBaseName(name) { return name.replace(/ #\d+$/, '').trim(); }

function getImageFiles(category, brand, vehicleName) {
    const folderPath = path.join(vehicleDir, category, brand, vehicleName);
    if (!fs.existsSync(folderPath)) return [];
    return fs.readdirSync(folderPath).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)).map(f => path.join(folderPath, f));
}

function copyToUploads(srcPath) {
    const ext = path.extname(srcPath);
    const newName = uuid() + ext;
    fs.copyFileSync(srcPath, path.join(uploadsDir, newName));
    return { url: `uploads/${newName}`, filename: newName };
}

function main() {
    console.log('=== Syncing images to database ===\n');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    // Get data from DB
    const carsRaw = sql(`SELECT c.id, c.name, cb.name FROM cars c JOIN car_models cm ON c.model_id = cm.id JOIN car_brands cb ON cm.brand_id = cb.id ORDER BY cb.name, c.name`);
    const cars = carsRaw.trim().split('\n').filter(l => l.includes('|')).map(l => { const [id,name,brand] = l.trim().split('|'); return {id,name,brand}; });

    const motosRaw = sql(`SELECT m.id, m.name, mb.name FROM motorbikes m JOIN motorbike_models mm ON m.model_id = mm.id JOIN motorbike_brands mb ON mm.brand_id = mb.id ORDER BY mb.name, m.name`);
    const motos = motosRaw.trim().split('\n').filter(l => l.includes('|')).map(l => { const [id,name,brand] = l.trim().split('|'); return {id,name,brand}; });

    const vehRaw = sql(`SELECT id, name FROM vehicles ORDER BY name`);
    const vehicles = vehRaw.trim().split('\n').filter(l => l.includes('|')).map(l => { const [id,name] = l.trim().split('|'); return {id,name}; });

    console.log(`Cars: ${cars.length}, Motorbikes: ${motos.length}, Vehicles: ${vehicles.length}\n`);

    // Build SQL file
    let sqlLines = [];
    sqlLines.push('DELETE FROM car_images;');
    sqlLines.push('DELETE FROM motorbike_images;');
    sqlLines.push('');

    let totalCopied = 0;
    const processedCar = new Map();
    const processedMoto = new Map();

    // Process Cars
    console.log('=== Cars ===');
    for (const car of cars) {
        const baseName = getBaseName(car.name);
        if (!processedCar.has(baseName)) {
            const files = getImageFiles('Car', car.brand, baseName);
            if (files.length === 0) { console.log(`  [WARN] ${baseName}`); processedCar.set(baseName, []); continue; }
            const uploaded = files.map(f => copyToUploads(f));
            processedCar.set(baseName, uploaded);
            totalCopied += uploaded.length;
            console.log(`  [OK] ${baseName}: ${uploaded.length} images`);
        }
        const images = processedCar.get(baseName);
        if (images.length === 0) continue;
        for (let i = 0; i < images.length; i++) {
            const isPrimary = i === 0 ? 1 : 0;
            sqlLines.push(`INSERT INTO car_images (id, url, car_id, is_primary, sort_order) VALUES ('${uuid()}', '/${images[i].url}', '${car.id}', ${isPrimary}, ${i});`);
        }
    }

    // Process Motorbikes
    console.log('\n=== Motorbikes ===');
    for (const moto of motos) {
        const baseName = getBaseName(moto.name);
        if (!processedMoto.has(baseName)) {
            const files = getImageFiles('Motorbike', moto.brand, baseName);
            if (files.length === 0) { console.log(`  [WARN] ${baseName}`); processedMoto.set(baseName, []); continue; }
            const uploaded = files.map(f => copyToUploads(f));
            processedMoto.set(baseName, uploaded);
            totalCopied += uploaded.length;
            console.log(`  [OK] ${baseName}: ${uploaded.length} images`);
        }
        const images = processedMoto.get(baseName);
        if (images.length === 0) continue;
        for (let i = 0; i < images.length; i++) {
            const isPrimary = i === 0 ? 1 : 0;
            sqlLines.push(`INSERT INTO motorbike_images (id, url, motorbike_id, is_primary, sort_order) VALUES ('${uuid()}', '/${images[i].url}', '${moto.id}', ${isPrimary}, ${i});`);
        }
    }

    // Update vehicle thumbnails 
    console.log('\n=== Vehicle thumbnails ===');
    for (const v of vehicles) {
        const baseName = getBaseName(v.name);
        const motoImgs = processedMoto.get(baseName);
        if (motoImgs && motoImgs.length > 0) {
            sqlLines.push(`UPDATE vehicles SET thumbnail_url = '/${motoImgs[0].url}' WHERE id = '${v.id}';`);
        }
    }

    // Write SQL file
    fs.writeFileSync(sqlFile, sqlLines.join('\n'), 'utf8');
    console.log(`\nWrote ${sqlLines.length} SQL statements to sync.sql`);

    // Execute SQL file
    console.log('Executing SQL...');
    const result = sqlFromFile(sqlFile);
    console.log('SQL execution complete.');

    // Verify
    const carCount = sql(`SELECT COUNT(*) FROM car_images`).trim();
    const motoCount = sql(`SELECT COUNT(*) FROM motorbike_images`).trim();
    const vehThumb = sql(`SELECT COUNT(*) FROM vehicles WHERE thumbnail_url LIKE '%uploads%'`).trim();

    console.log(`\n========================================`);
    console.log(`Images copied to uploads/: ${totalCopied}`);
    console.log(`car_images rows: ${carCount}`);
    console.log(`motorbike_images rows: ${motoCount}`);
    console.log(`vehicles with new thumbnail: ${vehThumb}`);
    console.log('Done!');
}

main();
