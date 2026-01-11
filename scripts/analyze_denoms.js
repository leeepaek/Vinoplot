import https from 'https';
import fs from 'fs';
import proj4 from 'proj4';

// Define projection systems (needed just for bbox calculation logic if reused, but here we just need the URL)
const sourcePrj = 'EPSG:2154';
const destPrj = 'EPSG:4326';
proj4.defs(sourcePrj, "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

const burgundyBboxWGS84 = [2.5, 46.1, 5.6, 48.0];
const southWest = proj4(destPrj, sourcePrj, [burgundyBboxWGS84[0], burgundyBboxWGS84[1]]);
const northEast = proj4(destPrj, sourcePrj, [burgundyBboxWGS84[2], burgundyBboxWGS84[3]]);
const bboxString = `${southWest[0]},${southWest[1]},${northEast[0]},${northEast[1]}`;

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

async function main() {
  console.log('Fetching unique denoms...');
  const baseUrl = "https://data.geopf.fr/wfs/ows";
  const typeName = "AOC-VITICOLES:aire_parcellaire";
  const cqlFilter = `BBOX(geom, ${bboxString})`;

  // We don't need geometries, just denom.
  // WFS 2.0 supports `propertyName` to fetch specific fields.
  const limit = 5000;
  let startIndex = 0;
  let totalFeatures = 0;
  const uniqueDenoms = new Set();

  try {
     // Get Count
    const initialUrl = `${baseUrl}?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=${typeName}&COUNT=1&OUTPUTFORMAT=application/json&CQL_FILTER=${encodeURIComponent(cqlFilter)}`;
    const initialData = await fetchData(initialUrl);
    totalFeatures = initialData.totalFeatures || initialData.numberMatched;
    console.log(`Total features: ${totalFeatures}`);

    while (startIndex < totalFeatures) {
       // Fetch only denom field to save bandwidth/time?
       // PROPERTYNAME=denom (WFS 2.0 uses PROPERTYNAME)
       const url = `${baseUrl}?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=${typeName}&COUNT=${limit}&STARTINDEX=${startIndex}&OUTPUTFORMAT=application/json&CQL_FILTER=${encodeURIComponent(cqlFilter)}&PROPERTYNAME=denom`;

       const data = await fetchData(url);
       if (data.features) {
         data.features.forEach(f => {
             if (f.properties && f.properties.denom) {
                 uniqueDenoms.add(f.properties.denom);
             }
         });
       }
       process.stdout.write(`.`);
       startIndex += limit;
    }
    console.log('\nDone.');

    const sortedDenoms = Array.from(uniqueDenoms).sort();
    fs.writeFileSync('unique_denoms.txt', sortedDenoms.join('\n'));
    console.log('Saved unique_denoms.txt');

    // Print them
    console.log('--- UNIQUE DENOM VALUES ---');
    console.log(sortedDenoms.join('\n'));

  } catch (e) {
      console.error(e);
  }
}

main();
