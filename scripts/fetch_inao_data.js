import axios from 'axios';
import fs from 'fs';
import path from 'path';
import * as turf from '@turf/turf';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const WFS_URL = 'https://data.geopf.fr/wfs/ows';
const ELEVATION_API_URL = 'https://api.open-meteo.com/v1/elevation';
const TARGET_DIR = path.join(__dirname, '../src/data/villages');

const VILLAGES = {
    // Done previously, but re-fetching to add Elevation/Slope
    'vosne-romanee': {
        name: 'Vosne-Romanée',
        koreanName: '본 로마네',
        region: 'Côte de Nuits',
        cql_filter: "denom ILIKE '%Vosne-Romanée%' OR denom ILIKE '%Romanée-Conti%' OR denom ILIKE '%Richebourg%' OR denom ILIKE '%Tâche%' OR denom ILIKE '%Romanée-Saint-Vivant%' OR denom ILIKE '%Grande Rue%'",
        description: "The pearl of the Côte. Home to the world's most famous vineyards."
    },
    'gevrey-chambertin': {
        name: 'Gevrey-Chambertin',
        koreanName: '주브레 샹베르탱',
        region: 'Côte de Nuits',
        cql_filter: "denom ILIKE '%Gevrey-Chambertin%' OR denom ILIKE '%Chambertin%' OR denom ILIKE '%Griotte-Chambertin%' OR denom ILIKE '%Latricières-Chambertin%' OR denom ILIKE '%Mazis-Chambertin%' OR denom ILIKE '%Mazoyères-Chambertin%' OR denom ILIKE '%Ruchottes-Chambertin%' OR denom ILIKE '%Chapelle-Chambertin%' OR denom ILIKE '%Charmes-Chambertin%'",
        description: "The king of Burgundy wines, famous for its powerful and structured Pinot Noir."
    },
    'chambolle-musigny': {
        name: 'Chambolle-Musigny',
        koreanName: '샹볼 뮈지니',
        region: 'Côte de Nuits',
        cql_filter: "denom ILIKE '%Chambolle-Musigny%' OR denom ILIKE '%Musigny%' OR denom ILIKE '%Bonnes-Mares%'",
        description: "Known for its elegance and finesse, often described as the 'Queen' of the Côte de Nuits."
    },
    // New Villages
    'morey-saint-denis': {
        name: 'Morey-Saint-Denis',
        koreanName: '모레 생 드니',
        region: 'Côte de Nuits',
        cql_filter: "denom ILIKE '%Morey-Saint-Denis%' OR denom ILIKE '%Clos de Tart%' OR denom ILIKE '%Clos des Lambrays%' OR denom ILIKE '%Clos Saint-Denis%' OR denom ILIKE '%Clos de la Roche%'",
        description: "Home to five Grand Crus, bridging the power of Gevrey and the elegance of Chambolle."
    },
    'nuits-saint-georges': {
        name: 'Nuits-Saint-Georges',
        koreanName: '뉘 생 조르주',
        region: 'Côte de Nuits',
        cql_filter: "denom ILIKE '%Nuits-Saint-Georges%'", // Nuits has no GC, but many 1ers
        description: "The southern capital of the Côte de Nuits, producing robust and age-worthy wines."
    },
    'fixin': {
        name: 'Fixin',
        koreanName: '픽생',
        region: 'Côte de Nuits',
        cql_filter: "denom ILIKE '%Fixin%'",
        description: "Often called the 'winter Gevrey', offering great value and structure."
    },
    'marsannay': {
        name: 'Marsannay',
        koreanName: '마르사네',
        region: 'Côte de Nuits',
        cql_filter: "denom ILIKE '%Marsannay%'",
        description: "The northernmost village, unique for producing Rosé along with Red and White."
    }
};

async function fetchElevationData(points) {
    // points: Array of {lat, lon}
    // Open-Meteo accepts arrays. Limit is huge but let's chunk to 50 to avoid 414 URI Too Long.
    const CHUNK_SIZE = 50;
    const results = [];

    for (let i = 0; i < points.length; i += CHUNK_SIZE) {
        const chunk = points.slice(i, i + CHUNK_SIZE);
        const lats = chunk.map(p => p.lat).join(',');
        const lons = chunk.map(p => p.lon).join(',');

        try {
            const res = await axios.get(ELEVATION_API_URL, {
                params: { latitude: lats, longitude: lons }
            });
            if (res.data && res.data.elevation) {
                results.push(...res.data.elevation);
            } else {
                // Fill with nulls if error/empty
                results.push(...new Array(chunk.length).fill(null));
            }
        } catch (e) {
            console.error("Elevation API error:", e.message);
            results.push(...new Array(chunk.length).fill(null));
        }
        // Polite delay
        await new Promise(r => setTimeout(r, 200));
    }
    return results;
}

async function fetchVillageData(villageId) {
    const config = VILLAGES[villageId];
    console.log(`\nFetching data for ${config.name}...`);

    try {
        const response = await axios.get(WFS_URL, {
            params: {
                service: 'WFS',
                version: '2.0.0',
                request: 'GetFeature',
                typeName: 'AOC-VITICOLES:aire_parcellaire',
                outputFormat: 'application/json',
                srsName: 'EPSG:4326',
                cql_filter: config.cql_filter
            }
        });

        const features = response.data.features;
        console.log(`Found ${features.length} parcels.`);

        // 1. Prepare Points for Elevation (Center, North, East) to calc Slope
        // Offset: 0.0001 deg ~ 11 meters
        const OFFSET = 0.0001;
        const queryPoints = [];

        // Pre-calculate centroids to avoid doing it twice
        const enrichedFeatures = features.map(f => {
            const center = turf.center(f);
            const [lon, lat] = center.geometry.coordinates;

            // Add to query list: Center, North, East
            queryPoints.push({ lat: lat, lon: lon });
            queryPoints.push({ lat: lat + OFFSET, lon: lon });
            queryPoints.push({ lat: lat, lon: lon + OFFSET });

            return { feature: f, center: [lon, lat] };
        });

        // 2. Fetch Elevations
        console.log(`Querying elevation for ${queryPoints.length} points...`);
        const elevations = await fetchElevationData(queryPoints);

        // 3. Process Parcels
        const parcels = enrichedFeatures.map((item, index) => {
            const f = item.feature;
            const props = f.properties;
            const denom = props.denom || "Unknown";

            // Determine Grade
            let grade = 'Village';
            if (denom.match(/Grand Cru/i) ||
                ['Romanée-Conti', 'La Tâche', 'Richebourg', 'La Romanée', 'La Grande Rue', 'Romanée-Saint-Vivant',
                 'Chambertin', 'Musigny', 'Bonnes-Mares', 'Clos de Vougeot', 'Echézeaux', 'Clos de Tart', 'Clos des Lambrays', 'Clos Saint-Denis', 'Clos de la Roche'].some(gc => denom.includes(gc) && !denom.includes('Petit'))) {
                grade = 'Grand Cru';
            } else if (denom.match(/Premier Cru/i)) {
                grade = 'Premier Cru';
            }

            // Area
            const areaHa = parseFloat((turf.area(f) / 10000).toFixed(4));

            // Elevation & Slope
            // Indices in flat array: index*3, index*3+1, index*3+2
            const idx = index * 3;
            const elC = elevations[idx]; // Center
            const elN = elevations[idx+1]; // North
            const elE = elevations[idx+2]; // East

            let altitude = elC;
            let slope = null;

            if (elC !== null && elN !== null && elE !== null) {
                // Rise over Run
                // approx distance in meters for 0.0001 deg
                const distY = 11.1; // roughly 11.1m per 0.0001 lat
                const distX = 11.1 * Math.cos(item.center[1] * Math.PI / 180); // adjust for latitude

                const dZ_dY = (elN - elC) / distY;
                const dZ_dX = (elE - elC) / distX;

                const slopeRatio = Math.sqrt(dZ_dX*dZ_dX + dZ_dY*dZ_dY);
                slope = parseFloat((slopeRatio * 100).toFixed(1)); // Percentage
                altitude = parseFloat(elC.toFixed(1));
            }

            // Geometry precision
            const geometry = turf.truncate(f.geometry, { precision: 6, coordinates: 2 });

            return {
                id: `VP-${villageId.toUpperCase().substring(0,2)}-${String(index + 1).padStart(3, '0')}`,
                name: denom,
                koreanName: "",
                grade: grade,
                village: config.name,
                area: areaHa,
                altitude: altitude,
                slope: slope,
                description: `Appellation: ${denom}`,
                coordinates: geometry.coordinates
            };
        });

        const outputData = {
            id: villageId,
            name: config.name,
            koreanName: config.koreanName,
            region: config.region,
            description: config.description,
            parcels: parcels
        };

        const outputPath = path.join(TARGET_DIR, `${villageId}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
        console.log(`Saved ${parcels.length} parcels to ${outputPath}`);

    } catch (error) {
        console.error(`Error fetching ${config.name}:`, error.message);
        if (error.response) console.error('Status:', error.response.status);
    }
}

async function main() {
    if (!fs.existsSync(TARGET_DIR)) {
        fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    const targets = Object.keys(VILLAGES);
    for (const vid of targets) {
        await fetchVillageData(vid);
    }
}

main();
