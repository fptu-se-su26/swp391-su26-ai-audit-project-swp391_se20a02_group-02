const fs = require('fs');
const path = require('path');
const https = require('https');

const baseDir = __dirname;
const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };

function searchBingImages(query) {
    const url = `https://www.bing.com/images/async?q=${encodeURIComponent(query + ' car exterior')}&first=1&count=20`;
    return new Promise((resolve, reject) => {
        https.get(url, { headers }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const regex = /murl&quot;:&quot;(https?:\/\/[^&"]+)&quot;/g;
                let match;
                const urls = [];
                while ((match = regex.exec(data)) !== null && urls.length < 4) {
                    urls.push(match[1]);
                }
                resolve(urls);
            });
        }).on('error', reject);
    });
}

async function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                resolve(false);
                return;
            }
            const fileStream = fs.createWriteStream(destPath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve(true);
            });
        }).on('error', (err) => {
            fs.unlink(destPath, () => {});
            resolve(false);
        });
        req.setTimeout(5000, () => {
            req.abort();
            resolve(false);
        });
    });
}

async function processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name === 'temp_img_scraper') continue;
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            const subDirs = fs.readdirSync(fullPath, { withFileTypes: true }).filter(e => e.isDirectory());
            if (subDirs.length === 0) {
                const vehicleName = entry.name;
                console.log(`Searching images for ${vehicleName}...`);
                const urls = await searchBingImages(vehicleName);
                let count = 1;
                for (let i = 0; i < urls.length; i++) {
                    const destPath = path.join(fullPath, `${count}.jpg`);
                    if (!fs.existsSync(destPath)) {
                        const success = await downloadFile(urls[i], destPath);
                        if (success) {
                            count++;
                        }
                    } else {
                        count++;
                    }
                    if (count > 4) break;
                }
                await new Promise(r => setTimeout(r, 1000)); // sleep 1s between queries
            } else {
                await processDirectory(fullPath);
            }
        }
    }
}

console.log('Starting Bing image downloads...');
processDirectory(baseDir).then(() => {
    console.log('Finished downloading all images!');
}).catch(console.error);
