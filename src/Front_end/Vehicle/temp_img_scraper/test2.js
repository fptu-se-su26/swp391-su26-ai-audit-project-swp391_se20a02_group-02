const https = require('https');

function searchYahooImages(query) {
    const url = `https://images.search.yahoo.com/search/images?p=${encodeURIComponent(query)}`;
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const regex = /imgurl=(https?:\/\/[^&]+)/g;
                let match;
                const urls = [];
                while ((match = regex.exec(data)) !== null && urls.length < 5) {
                    urls.push(decodeURIComponent(match[1]));
                }
                resolve(urls);
            });
        }).on('error', reject);
    });
}

searchYahooImages('Audi A4').then(console.log);
