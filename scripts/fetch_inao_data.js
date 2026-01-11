import fs from 'fs';
import https from 'https';
import proj4 from 'proj4';

// Define projection systems
const sourcePrj = 'EPSG:2154'; // Lambert 93
const destPrj = 'EPSG:4326';   // WGS 84

proj4.defs(sourcePrj, "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

const burgundyBboxWGS84 = [2.5, 46.1, 5.6, 48.0];
const southWest = proj4(destPrj, sourcePrj, [burgundyBboxWGS84[0], burgundyBboxWGS84[1]]);
const northEast = proj4(destPrj, sourcePrj, [burgundyBboxWGS84[2], burgundyBboxWGS84[3]]);
const bboxString = `${southWest[0]},${southWest[1]},${northEast[0]},${northEast[1]}`;

// Known Grand Crus List (Manual Lookup for robustness)
const GRAND_CRUS = new Set([
  // Côte de Nuits
  "Chambertin", "Chambertin-Clos de Bèze", "Chapelle-Chambertin", "Charmes-Chambertin",
  "Griotte-Chambertin", "Latricières-Chambertin", "Mazis-Chambertin", "Mazoyères-Chambertin", "Ruchottes-Chambertin",
  "Clos de la Roche", "Clos Saint-Denis", "Clos de Tart", "Clos des Lambrays", "Bonnes-Mares",
  "Musigny", "Clos de Vougeot", "Echezeaux", "Grands-Echezeaux",
  "Richebourg", "Romanée-Conti", "Romanée-Saint-Vivant", "La Romanée", "La Tâche", "La Grande Rue",
  // Côte de Beaune
  "Corton", "Corton-Charlemagne", "Charlemagne",
  "Montrachet", "Chevalier-Montrachet", "Bâtard-Montrachet", "Bienvenues-Bâtard-Montrachet", "Criots-Bâtard-Montrachet",
  // Chablis (often have 'Grand Cru' in text, but good to ensure)
  "Chablis Grand Cru", "Chablis Grand Cru Blanchot", "Chablis Grand Cru Bougros", "Chablis Grand Cru Les Clos",
  "Chablis Grand Cru Grenouilles", "Chablis Grand Cru Preuses", "Chablis Grand Cru Valmur", "Chablis Grand Cru Vaudésir"
]);

function transformCoordinates(coords) {
  if (Array.isArray(coords[0])) {
    return coords.map(transformCoordinates);
  } else if (coords.length === 2 && typeof coords[0] === 'number') {
    return proj4(sourcePrj, destPrj, coords);
  } else {
    return coords;
  }
}

function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      if (res.statusCode !== 200) { reject(new Error(`Status: ${res.statusCode}`)); return; }
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    }).on('error', (e) => reject(e));
  });
}

function parseDenom(denom) {
  if (!denom) return { grade: 'Unknown', appellation: 'Unknown', climat: null };

  const parts = denom.split(',').map(p => p.trim());

  let bestMatch = { grade: 'Regionale', appellation: 'Bourgogne', climat: null };
  let maxScore = 0;

  for (const p of parts) {
    let score = 1;
    let currentGrade = 'Regionale';
    let currentAppellation = p;
    let currentClimat = null;

    // 1. Check Exact Grand Cru Match
    if (GRAND_CRUS.has(p)) {
        score = 10;
        currentGrade = "Grand Cru";
        currentAppellation = p;
        // For Chablis Grand Cru with Climat suffix
        if (p.startsWith('Chablis Grand Cru ')) {
             currentAppellation = 'Chablis Grand Cru';
             currentClimat = p.replace('Chablis Grand Cru ', '');
        }
    }
    // 2. Check "Grand Cru" substring (fallback)
    else if (p.toLowerCase().includes("grand cru")) {
        score = 9;
        currentGrade = "Grand Cru";
        // Attempt parsing
        const match = p.match(/(.+) [Gg]rand [Cc]ru(?: (.+))?/);
        if (match) {
            currentAppellation = `${match[1]} Grand Cru`;
            currentClimat = match[2] || null;
        } else {
             currentAppellation = p;
        }
    }
    // 3. Premier Cru
    else if (p.toLowerCase().includes("premier cru") || p.includes("1er Cru")) {
        score = 8;
        currentGrade = "Premier Cru";
        // Parse "Village Premier Cru Climat"
        // Common format: "Vosne-Romanée premier cru Les Beaux Monts"
        // Or "Pouilly-Fuissé premier cru"
        const match = p.match(/(.+) premier cru(?: (.+))?/i);
        if (match) {
            currentAppellation = `${match[1]} Premier Cru`;
            currentClimat = match[2] || null;
        } else {
            currentAppellation = p;
        }
    }
    // 4. Village (heuristic: not Bourgogne/Coteaux/Crémant/Macon generic)
    // Be careful: "Vosne-Romanée" is Village. "Bourgogne" is Regionale.
    else if (!p.startsWith('Bourgogne') && !p.startsWith('Coteaux') && !p.startsWith('Crémant') && p !== 'Mâcon') {
        score = 5;
        currentGrade = "Village";
        currentAppellation = p;
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = { grade: currentGrade, appellation: currentAppellation, climat: currentClimat };
    }
    // Tie breaker: Prefer one with Climat defined
    else if (score === maxScore) {
        if (currentClimat && !bestMatch.climat) {
             bestMatch = { grade: currentGrade, appellation: currentAppellation, climat: currentClimat };
        }
    }
  }

  // Cleanup
  if (bestMatch.climat === bestMatch.appellation) bestMatch.climat = null;

  return bestMatch;
}

async function main() {
  const outputDir = 'src/data/geojson';
  const outputFile = `${outputDir}/inao_burgundy_parcels.json`;

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  console.log('Fetching Burgundy AOC data (Final Pass)...');

  const baseUrl = "https://data.geopf.fr/wfs/ows";
  const typeName = "AOC-VITICOLES:aire_parcellaire";
  const cqlFilter = `BBOX(geom, ${bboxString})`;
  const limit = 2000;
  let startIndex = 0;
  let allFeatures = [];
  let totalFeatures = 0;

  try {
    const initialUrl = `${baseUrl}?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=${typeName}&COUNT=1&OUTPUTFORMAT=application/json&CQL_FILTER=${encodeURIComponent(cqlFilter)}`;
    const initialData = await fetchData(initialUrl);
    totalFeatures = initialData.totalFeatures || initialData.numberMatched;
    console.log(`Total features: ${totalFeatures}`);

    while (startIndex < totalFeatures) {
       process.stdout.write(`Fetching ${startIndex}... `);
       const url = `${baseUrl}?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=${typeName}&COUNT=${limit}&STARTINDEX=${startIndex}&OUTPUTFORMAT=application/json&CQL_FILTER=${encodeURIComponent(cqlFilter)}`;
       const data = await fetchData(url);
       if (data.features) allFeatures = allFeatures.concat(data.features);
       startIndex += limit;
    }
    console.log(`\nDownloaded ${allFeatures.length} features.`);
    console.log('Processing...');

    const processedFeatures = allFeatures.map(feature => {
      // Transform
      if (feature.geometry && feature.geometry.coordinates) {
        feature.geometry.coordinates = transformCoordinates(feature.geometry.coordinates);
      }

      const denom = feature.properties.denom;
      const parsed = parseDenom(denom);

      return {
        type: "Feature",
        id: feature.properties.gml_id,
        properties: {
            id: feature.properties.gml_id,
            grade: parsed.grade,
            appellation: parsed.appellation,
            climat: parsed.climat,
            // Keep original for debug
            raw_denom: denom
        },
        geometry: feature.geometry
      };
    });

    const geoJson = { type: "FeatureCollection", features: processedFeatures };

    fs.writeFileSync(outputFile, JSON.stringify(geoJson, null, 2), { encoding: 'utf8' });
    console.log(`Saved to ${outputFile}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
