const fs = require('fs');
const path = require('path');

const VILLAGE_DIR = 'src/data/villages';

function verifyData() {
    const files = fs.readdirSync(VILLAGE_DIR);
    let totalParcels = 0;
    let errors = [];

    files.forEach(file => {
        if (!file.endsWith('.json')) return;
        const filepath = path.join(VILLAGE_DIR, file);
        try {
            const content = fs.readFileSync(filepath, 'utf8');
            const data = JSON.parse(content);

            if (!data.id || !data.name || !data.parcels) {
                errors.push(`File ${file} missing required root fields.`);
            }

            if (!Array.isArray(data.parcels)) {
                errors.push(`File ${file}: parcels is not an array.`);
                return;
            }

            totalParcels += data.parcels.length;

            data.parcels.forEach((p, index) => {
                if (!p.id || !p.grade || !p.coordinates) {
                    errors.push(`File ${file} parcel #${index} missing fields.`);
                }

                // Check coordinates are [Lon, Lat] roughly in France (Lon: -5 to 10, Lat: 41 to 51)
                // Coordinates is MultiPolygon: [ [ [x,y], [x,y] ] ]
                // Just check the first point of the first ring of the first polygon
                const firstPoly = p.coordinates[0];
                if (firstPoly && firstPoly[0]) {
                    const firstPoint = firstPoly[0][0]; // [Lon, Lat]
                    const lon = firstPoint[0];
                    const lat = firstPoint[1];

                    if (lat < 40 || lat > 52 || lon < -6 || lon > 10) {
                         errors.push(`File ${file} parcel ${p.id} coordinates out of France bounds: [${lon}, ${lat}]`);
                    }
                } else {
                     errors.push(`File ${file} parcel ${p.id} has empty coordinates.`);
                }
            });

        } catch (e) {
            errors.push(`Error parsing ${file}: ${e.message}`);
        }
    });

    console.log(`Verified ${files.length} files.`);
    console.log(`Total parcels: ${totalParcels}`);

    if (errors.length > 0) {
        console.error("Errors found:");
        errors.forEach(e => console.error("- " + e));
        process.exit(1);
    } else {
        console.log("All checks passed!");
    }
}

verifyData();
