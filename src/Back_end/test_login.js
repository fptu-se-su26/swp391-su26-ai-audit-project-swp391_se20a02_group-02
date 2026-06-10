const http = require('http');

function postLogin(path) {
  const data = JSON.stringify({ email: 'nguyen.van.a@gmail.com', password: 'password' });
  const req = http.request({
    hostname: 'localhost',
    port: 8080,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      console.log(`[${path}] Status: ${res.statusCode}`);
      console.log(`[${path}] Body: ${body}`);
    });
  });
  req.on('error', (e) => {
    console.error(`[${path}] Error: ${e.message}`);
  });
  req.write(data);
  req.end();
}

postLogin('/api/v1/auth/login');
postLogin('/auth/login');
