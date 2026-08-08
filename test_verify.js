const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('https://arenova-backend-production-8430.up.railway.app/api/auth/coach/verify-firebase', {
      firebaseIdToken: "fake_token_123"
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.log("Error:", err.response ? err.response.data : err.message);
  }
}

test();
