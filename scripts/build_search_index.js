import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../src/data/villages');
const OUTPUT_FILE = path.join(__dirname, '../src/data/global_search_index.json');

// Helper to normalize string for fuzzy search (strip accents, lowercase)
const normalize = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
};

async function buildIndex() {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    const masterIndex = [];

    console.log(`Scanning ${files.length} village files...`);

    for (const file of files) {
        const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
        const villageData = JSON.parse(content);

        // 1. Index the Village itself
        masterIndex.push({
            type: 'village',
            id: villageData.id,
            name: villageData.name,
            koreanName: villageData.koreanName,
            keywords: [
                villageData.name,
                villageData.koreanName,
                normalize(villageData.name),
                villageData.region
            ].filter(Boolean).join(' '),
            data: {
                description: villageData.description,
                region: villageData.region
            }
        });

        // 2. Index Parcels
        if (villageData.parcels) {
            villageData.parcels.forEach(parcel => {
                // Generate keywords
                const keywords = new Set();
                keywords.add(parcel.name);
                keywords.add(normalize(parcel.name));
                keywords.add(villageData.name);
                keywords.add(villageData.koreanName);
                if (parcel.koreanName) keywords.add(parcel.koreanName);

                // Add specific climat parts if applicable
                // e.g. "Vosne-Romanée 1er Cru Les Malconsorts" -> "Malconsorts"
                const parts = parcel.name.split(' ');
                parts.forEach(p => {
                    if (p.length > 3) keywords.add(normalize(p));
                });

                masterIndex.push({
                    type: 'parcel',
                    id: parcel.id,
                    name: parcel.name,
                    koreanName: parcel.koreanName || "", // Fallback empty
                    grade: parcel.grade,
                    village: villageData.name,
                    keywords: Array.from(keywords).join(' '),
                    data: {
                        area: parcel.area,
                        altitude: parcel.altitude,
                        slope: parcel.slope
                    }
                });
            });
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(masterIndex, null, 2));
    console.log(`Global Index built with ${masterIndex.length} entries.`);
    console.log(`Saved to ${OUTPUT_FILE}`);
}

buildIndex();
