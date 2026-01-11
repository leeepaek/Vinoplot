import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * script: process_inao_geojson.js
 * Usage: node scripts/process_inao_geojson.js <input_file> <village_id> <village_name>
 *
 * Transforms raw INAO GeoJSON data into the application's strict schema.
 * Note: INAO data often has specific property names like 'ID_PARCEL', 'LBL_PARCEL', 'TXT_LB_AOC'.
 * This script maps them to 'id', 'name', 'grade'.
 */

const args = process.argv.slice(2);
if (args.length < 3) {
    console.error("Usage: node scripts/process_inao_geojson.js <input_file> <village_id> <village_name_human>");
    process.exit(1);
}

const [inputFile, villageId, villageName] = args;
const outputDir = path.join(__dirname, '../src/data/villages');
const outputFile = path.join(outputDir, `${villageId}.json`);

// Helper to determine grade based on appellation name (heuristic)
function determineGrade(aocName) {
    const lower = aocName.toLowerCase();
    if (lower.includes('grand cru')) return 'Grand Cru';
    if (lower.includes('1er cru') || lower.includes('premier cru')) return 'Premier Cru';
    if (lower.includes('village')) return 'Village';
    // Fallback logic for specific Burgundy naming conventions
    return 'Village';
}

try {
    const rawData = fs.readFileSync(inputFile, 'utf-8');
    const geojson = JSON.parse(rawData);

    const processedParcels = geojson.features.map((feature, index) => {
        const props = feature.properties || {};

        // Map INAO properties to our schema
        // Note: Adjust these keys based on the actual attributes found in the INAO Shapefile/GeoJSON
        // Common keys: NOM_CRU, NOM_COMMUNE, LBL_AOC, etc.
        const name = props.NOM_CRU || props.LBL_AOC || props.name || `Parcel ${index + 1}`;
        const grade = determineGrade(props.LBL_AOC || props.grade || name);

        // Calculate simplified centroid or use provided geometry (simplified for JSON size)
        // For now, we keep the geometry as 'coordinates' if it's a Polygon
        let coordinates = [];
        if (feature.geometry.type === 'Polygon') {
            coordinates = feature.geometry.coordinates[0]; // Outer ring
        } else if (feature.geometry.type === 'MultiPolygon') {
            coordinates = feature.geometry.coordinates[0][0]; // First polygon's outer ring
        }

        return {
            id: `${villageId}-${props.ID_PARCEL || index}`,
            name: name,
            koreanName: props.koreanName || "", // Placeholder for future translation
            grade: grade,
            area: props.SURFACE_HA || 0, // In Hectares if available
            coordinates: coordinates,
            description: props.description || `Appellation: ${props.LBL_AOC || 'Unknown'}`,
            producers: [] // To be populated separately
        };
    });

    const villageData = {
        id: villageId,
        name: villageName,
        koreanName: "", // To be filled
        region: "Côte de Nuits", // Default, arguably should be an arg or determined
        description: `Cadastral data sourced from INAO.`,
        parcels: processedParcels
    };

    if (!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(villageData, null, 2));
    console.log(`Successfully processed ${processedParcels.length} parcels into ${outputFile}`);

} catch (error) {
    console.error("Error processing file:", error);
    process.exit(1);
}
