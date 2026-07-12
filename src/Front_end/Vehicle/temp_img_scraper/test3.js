const https = require('https');

function searchBingImages(query) {
    const url = `https://www.bing.com/images/async?q=${encodeURIComponent(query)}&first=1&count=10`;
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const regex = /murl&quot;:&quot;(https?:\/\/[^&"]+)&quot;/g;
                let match;
                const urls = [];
                while ((match = regex.exec(data)) !== null && urls.length < 5) {
                    urls.push(match[1]);
                }
                resolve(urls);
            });
        }).on('error', reject);
    });
}

searchBingImages('Audi A4').then(console.log);
