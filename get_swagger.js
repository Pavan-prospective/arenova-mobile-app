const axios = require('axios');
const fs = require('fs');
async function run() {
  try {
    const res = await axios.get('https://arenova-backend-production-8430.up.railway.app/api-docs.json');
    fs.writeFileSync('swagger.json', JSON.stringify(res.data, null, 2));
    console.log("Wrote swagger.json successfully!");
  } catch (err) {
    console.log(err.message);
  }
}
run();
