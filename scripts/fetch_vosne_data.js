import axios from 'axios';
import proj4 from 'proj4';
import fs from 'fs';

proj4.defs("EPSG:2154", "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

const WFS_URL = "https://data.geopf.fr/wfs/ows";
const LAYER_NAME = "AOC-VITICOLES:aire_parcellaire";

const KOREAN_NAMES = {
    'ROMANEE CONTI': '로마네 꽁띠',
    'LA ROMANEE': '라 로마네',
    'LA TACHE': '라 타슈',
    'RICHEBOURG': '리슈부르',
    'ROMANEE SAINT VIVANT': '로마네 생 비방',
    'LA GRANDE RUE': '라 그랑 뤼',
    'ECHEZEAUX': '에셰조',
    'GRANDS ECHEZEAUX': '그랑 에셰조',
    'VOSNE ROMANEE': '본 로마네',
    'VOSNE-ROMANEE': '본 로마네',
    'VOSNE-ROMANEE PREMIER CRU': '본 로마네 프리미에 크뤼'
};

const GRAND_CRUS = [
    'ROMANEE CONTI', 'LA ROMANEE', 'LA TACHE', 'RICHEBOURG',
    'ROMANEE SAINT VIVANT', 'LA GRANDE RUE', 'ECHEZEAUX', 'GRANDS ECHEZEAUX'
];

function normalize(str) {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
}

function determineGradeAndName(denomString) {
    if (!denomString) return null;

    // Split by comma and clean up
    const denoms = denomString.split(',').map(d => normalize(d));

    // Check for Grand Cru
    for (const gc of GRAND_CRUS) {
        const normalizedGC = normalize(gc);
        // Exact match or includes? "Romanée-Conti" normalized is "ROMANEE CONTI".
        // The denom list contains "ROMANEE CONTI" after normalization.
        // d.includes(normalizedGC) should work.
        if (denoms.some(d => d === normalizedGC)) {
            return { grade: 'Grand Cru', name: gc };
        }
    }

    // Check for Premier Cru
    // "VOSNE ROMANEE PREMIER CRU"
    if (denoms.some(d => d.includes('VOSNE ROMANEE') && d.includes('PREMIER CRU'))) {
        return { grade: 'Premier Cru', name: 'VOSNE-ROMANEE PREMIER CRU' };
    }

    // Check for Village
    // "VOSNE ROMANEE"
    // Be careful not to match "VOSNE ROMANEE PREMIER CRU" here if order matters, but we checked PC first.
    // Also "Bourgogne" might be in the list, we want to prioritize Vosne.
    if (denoms.some(d => d === 'VOSNE ROMANEE')) {
        return { grade: 'Village', name: 'VOSNE-ROMANEE' };
    }

    return null;
}

function getColor(grade) {
    switch (grade) {
        case 'Grand Cru': return '#8B0000';
        case 'Premier Cru': return '#B8860B';
        default: return '#DAA520';
    }
}

async function fetchVosneData() {
    const min = proj4("EPSG:4326", "EPSG:2154", [4.93, 47.14]);
    const max = proj4("EPSG:4326", "EPSG:2154", [4.99, 47.19]);
    const bbox2154 = `${min[0]},${min[1]},${max[0]},${max[1]}`;

    console.log(`Fetching with BBOX: ${bbox2154}`);
    try {
        const response = await axios.get(WFS_URL, {
            params: {
                service: 'WFS',
                version: '1.0.0',
                request: 'GetFeature',
                typeName: LAYER_NAME,
                outputFormat: 'application/json',
                bbox: bbox2154
            }
        });
        return response.data.features || [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function main() {
    const allFeatures = await fetchVosneData();
    console.log(`Fetched ${allFeatures.length} features.`);

    const parcels = [];

    for (let i = 0; i < allFeatures.length; i++) {
        const feature = allFeatures[i];
        const props = feature.properties;
        const geom = feature.geometry;

        if (!geom || !geom.coordinates) continue;

        const info = determineGradeAndName(props.denom || props.APPELLATIO); // check lowercase denom first
        if (!info) continue;

        let coordinates = [];
        const coords = geom.coordinates;
        const type = geom.type;

        const transform = (pair) => {
            if (pair[0] > 10000 || pair[1] > 10000) {
                 const t = proj4("EPSG:2154", "EPSG:4326", pair);
                 return [t[1], t[0]];
            } else {
                 return [pair[1], pair[0]];
            }
        };

        if (type === 'Polygon') {
             coordinates = coords[0].map(transform);
        } else if (type === 'MultiPolygon') {
             coordinates = coords.map(poly => poly[0].map(transform));
        }

        const koreanName = KOREAN_NAMES[info.name] || info.name;

        parcels.push({
            id: props.gml_id || `parcel-${i}`,
            name: info.name,
            koreanName: koreanName,
            grade: info.grade,
            village: 'Vosne-Romanée',
            coordinates: coordinates,
            description: `Appellation: ${info.name}`,
            color: getColor(info.grade)
        });
    }

    const uniqueParcels = Array.from(new Map(parcels.map(item => [item.id, item])).values());

    const output = {
        id: "vosne-romanee",
        name: "Vosne-Romanée",
        koreanName: "본 로마네",
        region: "Côte de Nuits",
        description: "부르고뉴의 가장 위대한 레드 와인 생산지. 로마네 꽁띠를 비롯한 전설적인 그랑 크뤼들의 고향입니다.",
        center: [47.1600, 4.9540],
        zoom: 14,
        parcels: uniqueParcels
    };

    fs.writeFileSync('src/data/villages/vosne-romanee.json', JSON.stringify(output, null, 2));
    console.log(`Saved ${uniqueParcels.length} parcels to src/data/villages/vosne-romanee.json`);
}

main();
