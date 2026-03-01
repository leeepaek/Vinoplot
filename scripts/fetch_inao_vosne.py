import urllib.request
import urllib.parse
import json
import os
import time

# Configuration
WFS_URL = "https://data.geopf.fr/wfs/ows"
OUTPUT_FILE = "src/data/geojson/inao_subset.geojson"
OS_DIR = os.path.dirname(OUTPUT_FILE)

if not os.path.exists(OS_DIR):
    os.makedirs(OS_DIR)

# Filter for "Vosne-Romanée" or "La Romanée"
# Note: "La Romanée" might appear as "Romanée (La)" or "La Romanée".
# "Vosne-Romanée" is the appellation.
# We will fetch features where appellation contains 'Vosne-Romanée' or 'La Romanée' (or 'Romanée' to be safe).
# CQL Filter: appellation ILIKE '%Vosne-Romanée%' OR appellation ILIKE '%Romanée%'
cql_filter = "appellation LIKE '%Vosne-Romanée%' OR appellation LIKE '%Romanée%'"

params = {
    "service": "WFS",
    "version": "2.0.0",
    "request": "GetFeature",
    "typeName": "AOC-VITICOLES:aire_parcellaire",
    "outputFormat": "application/json",
    "srsName": "EPSG:4326",
    "cql_filter": cql_filter
}

url = f"{WFS_URL}?{urllib.parse.urlencode(params)}"

print(f"Fetching data from {url}...")

try:
    with urllib.request.urlopen(url) as response:
        if response.status == 200:
            data = json.loads(response.read().decode('utf-8'))

            # Save raw data
            with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            print(f"Successfully saved {len(data.get('features', []))} features to {OUTPUT_FILE}")

            # Print unique appellations for debugging
            appellations = set()
            for f in data.get('features', []):
                props = f.get('properties', {})
                appellations.add(props.get('appellation'))
            print("Found appellations:", appellations)

        else:
            print(f"Error: {response.status} - {response.reason}")
except Exception as e:
    print(f"Failed to fetch data: {e}")
