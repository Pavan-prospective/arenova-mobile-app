const axios = require('axios');

async function test() {
  try {
    const res = await axios.put('https://arenova-backend-production-8430.up.railway.app/api/coach-app/onboarding', 
    {
      experience: 5,
      bio: "bio",
      address: { city: "Hyderabad" },
      sports: ["Cricket"]
    });
    console.log(res.data);
  } catch (err) {
    console.log("Error:", err.response ? err.response.data : err.message);
  }
}

test();
