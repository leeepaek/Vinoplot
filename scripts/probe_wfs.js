import axios from 'axios';

const WFS_URL = "https://data.geopf.fr/wfs/ows";

async function probe() {
    try {
        // Filter for 'Vosne-Romanée'
        // cql_filter is often supported by WFS. Or strictly use `denom LIKE ...`
        // Standard WFS 2.0 uses XML filters, but Geoserver often supports CQL_FILTER param.
        // Let's try CQL_FILTER first as it's easier.

        const filter = "denom ILIKE '%Vosne-Romanée%'"; // ILIKE is case insensitive in PostGIS/Geoserver
        const targetLayer = 'AOC-VITICOLES:aire_parcellaire';

        const featureUrl = `${WFS_URL}?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=${targetLayer}&COUNT=5&OUTPUTFORMAT=application/json&CQL_FILTER=${encodeURIComponent(filter)}`;

        console.log(`Fetching Vosne-Romanée features from ${featureUrl}`);

        const featureResponse = await axios.get(featureUrl);
        const features = featureResponse.data.features;

        if (features && features.length > 0) {
            console.log(`Found ${features.length} features.`);
            features.forEach((f, i) => {
                console.log(`Feature ${i+1}:`);
                console.log("Properties:", JSON.stringify(f.properties, null, 2));
                console.log("Geometry Type:", f.geometry.type);
                // Check if it's a small polygon (parcel) or huge (zone)
                // Just print the number of coordinates or rings
                if (f.geometry.type === 'Polygon') {
                    console.log("Rings:", f.geometry.coordinates.length);
                } else if (f.geometry.type === 'MultiPolygon') {
                    console.log("Polygons:", f.geometry.coordinates.length);
                }
            });
        } else {
            console.log("No features found for Vosne-Romanée.");
        }

    } catch (error) {
        console.error("Error probing WFS:", error.message);
        if (error.response) {
            console.log("Response data:", JSON.stringify(error.response.data).substring(0, 500));
        }
    }
}

probe();
