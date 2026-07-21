fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer@luxeway.vn', password: 'password' })
})
.then(res => res.json().then(data => ({ status: res.status, data })))
.then(console.log)
.catch(console.error);
