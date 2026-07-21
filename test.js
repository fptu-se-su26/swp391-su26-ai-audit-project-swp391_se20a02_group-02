const axios = require('axios');
axios.post('http://localhost:8080/api/v1/auth/login', {
  email: 'customer@luxeway.vn',
  password: 'password'
}).then(r => console.log(r.data))
  .catch(e => console.error(e.response ? e.response.data : e.message));
