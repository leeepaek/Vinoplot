import axios from 'axios';

const WFS_URL = 'https://data.geopf.fr/wfs/ows';

async function inspectSchema() {
    try {
        const response = await axios.get(WFS_URL, {
            params: {
                service: 'WFS',
                version: '2.0.0',
                request: 'DescribeFeatureType',
                typeName: 'AOC-VITICOLES:aire_parcellaire',
                outputFormat: 'application/json'
            }
        });
        console.log("Schema:", JSON.stringify(response.data, null, 2));
    } catch (e) {
        console.log("DescribeFeatureType failed, trying GetFeature with count 1");
        try {
             const response = await axios.get(WFS_URL, {
                params: {
                    service: 'WFS',
                    version: '2.0.0',
                    request: 'GetFeature',
                    typeName: 'AOC-VITICOLES:aire_parcellaire',
                    outputFormat: 'application/json',
                    count: 1
                }
            });
            if (response.data.features && response.data.features.length > 0) {
                console.log("Feature Props:", Object.keys(response.data.features[0].properties));
                console.log("Sample:", response.data.features[0].properties);
            }
        } catch (e2) {
            console.error(e2);
        }
    }
}

inspectSchema();
