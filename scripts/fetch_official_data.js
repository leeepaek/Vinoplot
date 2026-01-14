import axios from 'axios';
import * as turf from '@turf/turf';
import fs from 'fs';
import path from 'path';

const WFS_URL = "https://data.geopf.fr/wfs/ows";
const LAYER_NAME = "AOC-VITICOLES:aire_parcellaire";
const TARGET_DIR = "src/data/villages";

// Configuration for all supported villages
// Each entry maps the output filename (id) to a search config.
const VILLAGES = {
    // Côte de Nuits
    "marsannay": {
        name: "Marsannay",
        region: "Côte de Nuits",
        searches: ["Marsannay"],
        grades: { "Marsannay": "Village" } // Also 'Marsannay Rose' etc.
    },
    "fixin": {
        name: "Fixin",
        region: "Côte de Nuits",
        searches: ["Fixin"],
        grades: { "Fixin premier cru": "Premier Cru", "Fixin": "Village" }
    },
    "gevrey-chambertin": {
        name: "Gevrey-Chambertin",
        region: "Côte de Nuits",
        searches: [
            "Gevrey-Chambertin",
            "Chambertin", "Chambertin-Clos de Bèze", "Chapelle-Chambertin",
            "Charmes-Chambertin", "Griotte-Chambertin", "Latricières-Chambertin",
            "Mazis-Chambertin", "Ruchottes-Chambertin", "Mazoyères-Chambertin"
        ],
        // Logic will handle "premier cru" detection automatically
    },
    "morey-saint-denis": {
        name: "Morey-Saint-Denis",
        region: "Côte de Nuits",
        searches: [
            "Morey-Saint-Denis",
            "Clos de Tart", "Clos des Lambrays", "Clos Saint-Denis", "Clos de la Roche", "Bonnes-Mares"
        ]
    },
    "chambolle-musigny": {
        name: "Chambolle-Musigny",
        region: "Côte de Nuits",
        searches: [
            "Chambolle-Musigny",
            "Musigny", "Bonnes-Mares"
        ]
    },
    "vougeot": {
        name: "Vougeot",
        region: "Côte de Nuits",
        searches: ["Vougeot", "Clos de Vougeot"]
    },
    "vosne-romanee": {
        name: "Vosne-Romanée",
        region: "Côte de Nuits",
        searches: [
            "Vosne-Romanée",
            "Romanée-Conti", "La Tâche", "Richebourg", "La Romanée", "Romanée-Saint-Vivant", "La Grande Rue"
        ]
    },
    "flagey-echezeaux": {
        name: "Flagey-Echézeaux",
        region: "Côte de Nuits",
        searches: ["Echézeaux", "Grands Echézeaux", "Echezeaux", "Grands Echezeaux"]
        // Note: Village wines from Flagey are sold as Vosne-Romanée, so they appear in vosne-romanee.json
    },
    "nuits-saint-georges": {
        name: "Nuits-Saint-Georges",
        region: "Côte de Nuits",
        searches: ["Nuits-Saint-Georges"]
    },

    // Côte de Beaune
    "aloxe-corton": {
        name: "Aloxe-Corton",
        region: "Côte de Beaune",
        searches: ["Aloxe-Corton", "Corton", "Corton-Charlemagne", "Charlemagne"]
    },
    "pernand-vergelesses": {
        name: "Pernand-Vergelesses",
        region: "Côte de Beaune",
        searches: ["Pernand-Vergelesses", "Corton", "Corton-Charlemagne"] // Shared Grand Crus
    },
    "ladoix": {
        name: "Ladoix-Serrigny",
        region: "Côte de Beaune",
        searches: ["Ladoix", "Corton", "Corton-Charlemagne"]
    },
    "savigny-les-beaune": {
        name: "Savigny-lès-Beaune",
        region: "Côte de Beaune",
        searches: ["Savigny-lès-Beaune"]
    },
    "chorey-les-beaune": {
        name: "Chorey-lès-Beaune",
        region: "Côte de Beaune",
        searches: ["Chorey-lès-Beaune"]
    },
    "beaune": {
        name: "Beaune",
        region: "Côte de Beaune",
        searches: ["Beaune"]
    },
    "pommard": {
        name: "Pommard",
        region: "Côte de Beaune",
        searches: ["Pommard"]
    },
    "volnay": {
        name: "Volnay",
        region: "Côte de Beaune",
        searches: ["Volnay"]
    },
    "monthelie": {
        name: "Monthelie",
        region: "Côte de Beaune",
        searches: ["Monthelie", "Monthélie"]
    },
    "auxey-duresses": {
        name: "Auxey-Duresses",
        region: "Côte de Beaune",
        searches: ["Auxey-Duresses"]
    },
    "meursault": {
        name: "Meursault",
        region: "Côte de Beaune",
        searches: ["Meursault"]
    },
    "puligny-montrachet": {
        name: "Puligny-Montrachet",
        region: "Côte de Beaune",
        searches: [
            "Puligny-Montrachet",
            "Montrachet", "Chevalier-Montrachet", "Bâtard-Montrachet", "Bienvenues-Bâtard-Montrachet"
        ]
    },
    "chassagne-montrachet": {
        name: "Chassagne-Montrachet",
        region: "Côte de Beaune",
        searches: [
            "Chassagne-Montrachet",
            "Montrachet", "Bâtard-Montrachet", "Criots-Bâtard-Montrachet"
        ]
    },
    "saint-aubin": {
        name: "Saint-Aubin",
        region: "Côte de Beaune",
        searches: ["Saint-Aubin"]
    },
    "santenay": {
        name: "Santenay",
        region: "Côte de Beaune",
        searches: ["Santenay"]
    },
    "maranges": {
        name: "Maranges",
        region: "Côte de Beaune",
        searches: ["Maranges"]
    },

    // Côte Chalonnaise
    "bouzeron": {
        name: "Bouzeron",
        region: "Côte Chalonnaise",
        searches: ["Bouzeron"]
    },
    "rully": {
        name: "Rully",
        region: "Côte Chalonnaise",
        searches: ["Rully"]
    },
    "mercurey": {
        name: "Mercurey",
        region: "Côte Chalonnaise",
        searches: ["Mercurey"]
    },
    "givry": {
        name: "Givry",
        region: "Côte Chalonnaise",
        searches: ["Givry"]
    },
    "montagny": {
        name: "Montagny",
        region: "Côte Chalonnaise",
        searches: ["Montagny"]
    },

    // Mâconnais
    "pouilly-fuisse": {
        name: "Pouilly-Fuissé",
        region: "Mâconnais",
        searches: ["Pouilly-Fuissé"]
    },
    "saint-veran": {
        name: "Saint-Véran",
        region: "Mâconnais",
        searches: ["Saint-Véran"]
    },
    "vire-clesse": {
        name: "Viré-Clessé",
        region: "Mâconnais",
        searches: ["Viré-Clessé"]
    },

    // Chablis
    "chablis": {
        name: "Chablis",
        region: "Chablis",
        searches: ["Chablis", "Chablis Grand Cru", "Petit Chablis"]
    }
};

// Known Grand Crus Set for easy lookup
const GRAND_CRUS = new Set([
    "Romanée-Conti", "La Tâche", "Richebourg", "La Romanée", "Romanée-Saint-Vivant", "La Grande Rue",
    "Echézeaux", "Grands Echézeaux",
    "Chambertin", "Chambertin-Clos de Bèze", "Chapelle-Chambertin", "Charmes-Chambertin", "Griotte-Chambertin", "Latricières-Chambertin", "Mazis-Chambertin", "Ruchottes-Chambertin", "Mazoyères-Chambertin",
    "Clos de Tart", "Clos des Lambrays", "Clos Saint-Denis", "Clos de la Roche", "Bonnes-Mares",
    "Musigny",
    "Clos de Vougeot",
    "Corton", "Corton-Charlemagne", "Charlemagne",
    "Montrachet", "Chevalier-Montrachet", "Bâtard-Montrachet", "Bienvenues-Bâtard-Montrachet", "Criots-Bâtard-Montrachet",
    "Chablis Grand Cru", "Vaudésir", "Valmur", "Les Clos", "Grenouilles", "Preuses", "Blanchot", "Bougros" // Chablis climats are usually just "Chablis Grand Cru" AOC but with denomination
]);

// Helper to determine Grade and specific Name from 'denom' string
function parseDenom(denom, villageName) {
    const parts = denom.split(',');
    let grade = "Village";
    let name = villageName; // Default name if no specific climat found
    let specificNameFound = false;

    // Sort parts by length descending to match longest specific name first?
    // Or just iterate.

    // Check for Grand Cru first (usually standalone AOCs)
    for (const part of parts) {
        if (GRAND_CRUS.has(part) || part.includes("Grand Cru")) {
            grade = "Grand Cru";
            name = part;
            specificNameFound = true;
            break; // Priority
        }
    }

    if (!specificNameFound) {
        // Check for Premier Cru
        for (const part of parts) {
            if (part.toLowerCase().includes("premier cru")) {
                grade = "Premier Cru";
                // Extract name: e.g. "Vosne-Romanée premier cru Les Suchots" -> "Les Suchots"
                // Sometimes it's "Appellation Premier Cru Climat"
                // We want just the Climat name.
                // Typical format: "[Appellation] premier cru [Climat]"

                // Remove "premier cru" and "Appellation"
                // This is tricky.
                // Strategy: if the string ends with the climat name.
                // Let's assume the longest part containing "premier cru" has the info.

                // regex: /.*premier cru\s+(.*)/i
                const match = part.match(/premier cru\s+(.*)/i);
                if (match && match[1]) {
                    name = match[1].trim();
                    specificNameFound = true;
                } else {
                    // It might be just "Vosne-Romanée premier cru" without climat
                    name = `${villageName} Premier Cru`;
                }
                break; // Found 1er cru
            }
        }
    }

    if (!specificNameFound && grade === "Village") {
         // Village level. Try to see if there is a Climat mentioned?
         // In "Aire Parcellaire", Village level usually doesn't have the Climat name in `denom`.
         // `denom` is just "Vosne-Romanée".
         // So we default to the Village Name.
         name = villageName;
    }

    return { grade, name };
}

async function fetchVillageData(villageId, config) {
    console.log(`Processing ${villageId} (${config.name})...`);

    // Build CQL Filter
    // denom ILIKE '%search1%' OR denom ILIKE '%search2%' ...
    const conditions = config.searches.map(s => `denom ILIKE '%${s}%'`);
    const filter = conditions.join(" OR ");

    const url = `${WFS_URL}?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=${LAYER_NAME}&COUNT=10000&OUTPUTFORMAT=application/json&SRSNAME=EPSG:4326&CQL_FILTER=${encodeURIComponent(filter)}`;

    try {
        const response = await axios.get(url);
        const features = response.data.features;

        if (!features || features.length === 0) {
            console.warn(`No features found for ${villageId}`);
            return null;
        }

        console.log(`  Found ${features.length} parcels.`);

        const parcels = features.map(f => {
            const { grade, name } = parseDenom(f.properties.denom, config.name);

            // Calculate Area
            const area = turf.area(f); // in square meters
            const areaHa = (area / 10000).toFixed(4); // hectares

            // Ensure coordinates are [Lon, Lat] (GeoJSON standard)
            // WFS with SRSNAME=EPSG:4326 usually returns [Lon, Lat] in JSON,
            // but sometimes [Lat, Lon] depending on server config (axis order).
            // However, axios + standard GeoJSON usually handles it.
            // Let's check a point. If Lat > 90, it's definitely wrong? No, Lat is max 90.
            // France is roughly Lon [ -5, 10 ], Lat [ 41, 51 ].
            // If first coord is > 40, it's likely Lat.
            // Let's inspect the first point of the first feature.

            let geometry = f.geometry;

            return {
                id: f.properties.gml_id, // e.g. "aire_parcellaire.12345"
                name: name,
                koreanName: "", // Blank as per instruction
                grade: grade,
                village: config.name,
                area: parseFloat(areaHa),
                coordinates: geometry.coordinates, // This is the raw structure
                description: "",
                producers: [] // Empty
            };
        });

        // Construct Village Object
        const villageData = {
            id: villageId,
            name: config.name,
            koreanName: "", // Blank
            region: config.region,
            description: `Official parcel data for ${config.name} from IGN/INAO.`,
            parcels: parcels
        };

        return villageData;

    } catch (err) {
        console.error(`  Error fetching ${villageId}:`, err.message);
        return null;
    }
}

async function main() {
    console.log("Starting full data import from INAO/IGN WFS...");

    // Ensure target directory exists
    if (!fs.existsSync(TARGET_DIR)) {
        fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    for (const [id, config] of Object.entries(VILLAGES)) {
        const data = await fetchVillageData(id, config);
        if (data) {
            const filepath = path.join(TARGET_DIR, `${id}.json`);
            fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
            console.log(`  Saved ${filepath}`);
        }
    }

    console.log("Import complete.");
}

main();
