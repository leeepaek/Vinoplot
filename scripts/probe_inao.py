import urllib.request
import urllib.parse
import json

# Probe
url = "https://data.geopf.fr/wfs/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=AOC-VITICOLES:aire_parcellaire&outputFormat=application/json&maxFeatures=1"

print(f"Probing {url}...")
try:
    with urllib.request.urlopen(url) as response:
        data = json.loads(response.read().decode('utf-8'))
        print("Schema check:")
        if data['features']:
            print(data['features'][0]['properties'].keys())
            print("Sample props:", data['features'][0]['properties'])
        else:
            print("No features found.")
except Exception as e:
    print(f"Probe failed: {e}")
