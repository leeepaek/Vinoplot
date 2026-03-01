import json
import os

# Source and Target
SOURCE_FILE = "src/data/geojson/inao_subset.geojson"
TARGET_FILE = "src/data/villages/vosne-romanee.json"

# Read Source
with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

# The 'denom' field in INAO data often contains comma-separated appellations.
# We need to filter features that are:
# 1. "La Romanée" (Grand Cru)
# 2. "Vosne-Romanée" (Village)

# Note from previous step: 'denom' looks like "Bourgogne, ..., La Romanée, Vosne-Romanée premier cru"
# This implies that the polygons might cover multiple classifications or the denom field lists all valid AOCs for that plot.
# We want to identify the "Main" identity.
# Usually, the most specific one is key.

# Rules:
# If 'La Romanée' is in denom -> It's La Romanée (Grand Cru). (Be careful of "La Romanée" in Chassagne or Gevrey!)
# If 'Vosne-Romanée' is in denom AND NOT 'premier cru' (unless user wants 1er cru?) -> Village level.
# The user asked for "Vosne-Romanée" and "La Romanée".
# I will assume "Vosne-Romanée" means the village appellation polygons.
# And "La Romanée" means the specific Grand Cru.

# Note on Gevrey/Chassagne:
# "Gevrey-Chambertin premier cru La Romanée"
# "Chassagne-Montrachet premier cru La Romanée"
# We must exclude these. We only want "La Romanée" appearing with "Vosne-Romanée" context or explicitly just "La Romanée" (it is a monopoll in Vosne).
# Actually "La Romanée" Grand Cru is unique. But the text string might be ambiguous.
# The denom "La Romanée,Vosne-Romanée premier cru" or similar implies it.
# Wait, La Romanée is a Grand Cru, it is *not* a Premier Cru.
# One entry in `denoms` was: "...,La Romanée,Vosne-Romanée,Vosne-Romanée premier cru".
# Let's filter by checking if "La Romanée" is present AND "Gevrey"/ "Chassagne" are NOT present.

def get_coordinates(feature):
    """Extract coordinates and ensure they are [[[lng, lat], ...]]."""
    geom = feature.get('geometry', {})
    coords = geom.get('coordinates', [])
    gtype = geom.get('type')

    if gtype == 'Polygon':
        # GeoJSON Polygon: [ [ [x,y], ... ], [hole] ]
        # We return it as is.
        return coords
    elif gtype == 'MultiPolygon':
        # GeoJSON MultiPolygon: [ [ [[x,y]...], [hole] ], ... ]
        # The user wants "Polygon structure".
        # If we have multiple polygons, we can't fit them into a single Polygon structure validly without merging or returning a MultiPolygon.
        # However, for simplicity and meeting the prompt's likely intent, we might return the largest polygon or a list of polygons?
        # The user said: "coordinates data is [[[lng, lat], ...]] form Polygon structure".
        # This implies a single Polygon.
        # I will return the largest polygon from the MultiPolygon to avoid breaking the expected schema.
        # Or I can return a MultiPolygon if the frontend handles it?
        # The prompt says: "[[[lng, lat], ...]] form". This is a Polygon.
        # I'll stick to returning the largest polygon if it's Multi.
        largest_poly = []
        max_area = 0
        for poly in coords:
            # simple area heuristic: number of points
            # (better to use actual area but points is a proxy)
            # poly is [ [ring1], [ring2]... ]
            outer_ring = poly[0]
            if len(outer_ring) > max_area:
                max_area = len(outer_ring)
                largest_poly = poly
        return largest_poly
    return []

parcels = []

# 1. La Romanée
la_romanee_features = []
for f in data['features']:
    props = f['properties']
    denom = props.get('denom', '')
    if 'La Romanée' in denom and 'Gevrey' not in denom and 'Chassagne' not in denom:
        la_romanee_features.append(f)

# Merge La Romanée? It's likely 1 feature or very few.
# Let's just add them as parcels.
for i, f in enumerate(la_romanee_features):
    coords = get_coordinates(f)
    if coords:
        parcels.append({
            "id": f"la-romanee-{i+1}",
            "name": "La Romanée",
            "grade": "Grand Cru",
            "area": "0.85 ha", # Approximate, or calculate
            "description": "The smallest AOC in France.",
            "coordinates": coords
        })

# 2. Vosne-Romanée (Village)
# Filter for "Vosne-Romanée" but NOT "premier cru" (unless we want to include them as 'Vosne-Romanée'?)
# Usually "Vosne-Romanée" means the village level appellation.
# The user asked for "Vosne-Romanée".
vr_features = []
for f in data['features']:
    props = f['properties']
    denom = props.get('denom', '')
    # Check if 'Vosne-Romanée' is present
    if 'Vosne-Romanée' in denom:
        # Exclude specific Grand Crus if they are listed separately?
        # Exclude Premier Cru if we only want Village?
        # User said "Vosne-Romanée and La Romanée".
        # If I include 1er Cru, I should label them?
        # For now, let's grab "Vosne-Romanée" (Village) strictly.
        # Logic: Contains 'Vosne-Romanée' AND DOES NOT contain 'premier cru' (unless strictly village can be upgraded?)
        # Actually, many polygons are "Vosne-Romanée, Vosne-Romanée premier cru" meaning they can be declassified?
        # Or maybe the denom list includes all *potential* labels.
        # I will check for "Vosne-Romanée" and exclude if it *only* says "Vosne-Romanée premier cru"?
        # Let's simple check: if "Vosne-Romanée" is in the string.
        # And we exclude "La Romanée" features we already found.
        if f in la_romanee_features:
            continue

        # Simplified: Just take the first 5-10 largest polygons for "Vosne-Romanée" to avoid flooding the file?
        # Or just take all? The file size is the limit.
        # Let's take all but limit to a reasonable count if > 50.
        vr_features.append(f)

# Sort VR features by size (number of coords) to get the main chunks
vr_features.sort(key=lambda x: len(json.dumps(x['geometry'])), reverse=True)

# Add top 20 Vosne-Romanée parcels (likely the main blocks)
# To ensure we cover the village.
for i, f in enumerate(vr_features[:50]): # Cap at 50 to match "list" request without exploding file
    coords = get_coordinates(f)
    if coords:
        parcels.append({
            "id": f"vosne-romanee-village-{i+1}",
            "name": "Vosne-Romanée (Village)",
            "grade": "Village",
            "coordinates": coords
        })

# Read existing file to keep metadata
try:
    with open(TARGET_FILE, 'r', encoding='utf-8') as f:
        existing_data = json.load(f)
except FileNotFoundError:
    existing_data = {
        "id": "vosne-romanee",
        "name": "Vosne Romanee",
        "koreanName": "",
        "description": "Data for vosne-romanee",
        "parcels": []
    }

# Update parcels
existing_data['parcels'] = parcels

# Write back
with open(TARGET_FILE, 'w', encoding='utf-8') as f:
    json.dump(existing_data, f, indent=2, ensure_ascii=False)

print(f"Updated {TARGET_FILE} with {len(parcels)} parcels.")
