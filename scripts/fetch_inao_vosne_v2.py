import urllib.request
import urllib.parse
import json
import os
import time

# Configuration
WFS_URL = "https://data.geopf.fr/wfs/ows"
OUTPUT_FILE = "src/data/geojson/inao_subset.geojson"

# Filter for "Vosne-Romanée" or "La Romanée" using 'denom' field.
# WFS 1.0.0 uses CQL_FILTER (often case sensitive, but let's try 'LIKE')
# Note: 'denom' is the field name found in probe.

# Filters:
# denom LIKE '%Vosne-Romanée%'
# denom LIKE '%La Romanée%' (Wait, is it 'Romanée (La)'?)
# Let's try broad search.

cql = "denom LIKE '%Vosne-Romanée%' OR denom LIKE '%Romanée%'"

params = {
    "service": "WFS",
    "version": "1.0.0", # Downgrade to 1.0.0 often works better for simple CQL
    "request": "GetFeature",
    "typeName": "AOC-VITICOLES:aire_parcellaire",
    "outputFormat": "application/json",
    "srsName": "EPSG:4326",
    "CQL_FILTER": cql
}

url = f"{WFS_URL}?{urllib.parse.urlencode(params)}"

print(f"Fetching data from {url}...")

try:
    with urllib.request.urlopen(url) as response:
        if response.status == 200:
            data = json.loads(response.read().decode('utf-8'))

            with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            print(f"Successfully saved {len(data.get('features', []))} features to {OUTPUT_FILE}")

            # Print unique denoms
            denoms = set()
            for f in data.get('features', []):
                props = f.get('properties', {})
                denoms.add(props.get('denom'))
            print("Found denoms:", denoms)

        else:
            print(f"Error: {response.status} - {response.reason}")
except Exception as e:
    print(f"Failed to fetch data: {e}")
