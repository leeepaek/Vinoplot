import axios from 'axios';
import fs from 'fs';
import path from 'path';
import * as turf from '@turf/turf';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const WFS_URL = 'https://data.geopf.fr/wfs/ows';
const TARGET_DIR = path.join(__dirname, '../src/data/villages');

const VILLAGES = {
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
    }
};

async function fetchVillageData(villageId) {
    const config = VILLAGES[villageId];
    console.log(`Fetching data for ${config.name}...`);

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
        console.log(`Found ${features.length} parcels for ${config.name}`);

        // Transform to internal schema
        const parcels = features.map((feature, index) => {
            const props = feature.properties;
            const denom = props.denom || "Unknown";

            // Determine Grade
            let grade = 'Village';
            // Simple heuristics for grade based on appellation string
            if (denom.match(/Grand Cru/i) ||
                ['Romanée-Conti', 'La Tâche', 'Richebourg', 'La Romanée', 'La Grande Rue', 'Romanée-Saint-Vivant',
                 'Chambertin', 'Musigny', 'Bonnes-Mares', 'Clos de Vougeot', 'Echézeaux'].some(gc => denom.includes(gc) && !denom.includes('Petit'))) {
                grade = 'Grand Cru';
            } else if (denom.match(/Premier Cru/i)) {
                grade = 'Premier Cru';
            }

            // Calculate Area (sq meters -> hectares)
            const areaSqM = turf.area(feature);
            const areaHa = parseFloat((areaSqM / 10000).toFixed(4));

            // Geometry precision reduction
            const geometry = turf.truncate(feature.geometry, { precision: 6, coordinates: 2 });

            return {
                id: `VP-${villageId.toUpperCase().substring(0,2)}-${String(index + 1).padStart(3, '0')}`,
                name: denom, // The AOC name is the best we have here
                koreanName: "",
                grade: grade,
                village: config.name,
                area: areaHa,
                description: `Appellation: ${denom}`,
                coordinates: geometry.coordinates // Store as GeoJSON [Lon, Lat]
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
        if (error.response) {
            // console.error('Data:', error.response.data); // Too verbose
            console.error('Status:', error.response.status);
        }
    }
}

async function main() {
    if (!fs.existsSync(TARGET_DIR)) {
        fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    await fetchVillageData('vosne-romanee');
    await fetchVillageData('gevrey-chambertin');
    await fetchVillageData('chambolle-musigny');
}

main();
