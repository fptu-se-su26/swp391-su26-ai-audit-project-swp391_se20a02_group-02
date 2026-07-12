const { image_search } = require('duckduckgo-images-api');
image_search({ query: "Audi A4", moderate: true, iterations: 1 }).then(results => {
    console.log(results.slice(0, 3));
}).catch(console.error);
