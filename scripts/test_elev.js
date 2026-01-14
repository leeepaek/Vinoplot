import axios from 'axios';

const ELEVATION_API_URL = 'https://api.open-meteo.com/v1/elevation';

async function testElevation() {
    const points = [];
    for(let i=0; i<50; i++) {
        points.push({lat: 47.15 + i*0.0001, lon: 4.95 + i*0.0001});
    }

    const lats = points.map(p => p.lat).join(',');
    const lons = points.map(p => p.lon).join(',');

    console.log("URL Length:", (ELEVATION_API_URL + "?latitude=" + lats + "&longitude=" + lons).length);

    try {
        const res = await axios.get(ELEVATION_API_URL, {
            params: { latitude: lats, longitude: lons }
        });
        console.log("Success! Count:", res.data.elevation.length);
        console.log("Sample:", res.data.elevation[0]);
    } catch (e) {
        console.error("Error:", e.message);
        if(e.response) console.error("Status:", e.response.status, e.response.data);
    }
}

testElevation();
