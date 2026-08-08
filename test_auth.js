const axios = require('axios');

async function test() {
  try {
    const res1 = await axios.post('https://arenova-backend-production-8430.up.railway.app/api/auth/coach/register-step1', {
      name: "Virat Coach",
      phone: "9876543220",
      sports: ["Cricket"]
    });
    console.log("Register response:", res1.data);

    const res2 = await axios.post('https://arenova-backend-production-8430.up.railway.app/api/auth/coach/verify-otp', {
      method: "phone",
      phone: "9876543220",
      otp: "123456"
    });
    console.log("Verify OTP response:", res2.data);
  } catch (err) {
    console.log("Error:", err.response ? err.response.data : err.message);
  }
}

test();
