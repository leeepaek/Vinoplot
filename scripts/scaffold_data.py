import re
import os
import json

# Define the source file and target directory
source_file = 'src/data/index.js'
target_dir = 'src/data/villages'

# Ensure target directory exists
if not os.path.exists(target_dir):
    os.makedirs(target_dir)

# Read the index.js file
with open(source_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Regular expression to find imports like: import variableName from './villages/filename.json';
# We want to capture the filename.
import_pattern = re.compile(r"import\s+(\w+)\s+from\s+'\./villages/([^']+)'")
matches = import_pattern.findall(content)

print(f"Found {len(matches)} village imports.")

for var_name, filename in matches:
    filepath = os.path.join(target_dir, filename)
    village_id = filename.replace('.json', '')

    # Construct a minimal valid JSON structure
    # We add a dummy parcel to ensure structure exists
    data = {
        "id": village_id,
        "name": village_id.replace('-', ' ').title(),
        "koreanName": "", # Placeholder
        "description": f"Data for {village_id}",
        "parcels": []
    }

    # Specific handling for vosne-romanee to match user request (initially empty)
    if village_id == 'vosne-romanee':
        data['parcels'] = [
            {
                "id": "sample-parcel",
                "name": "Sample Parcel",
                # Empty polygon list as requested to represent "clean" state
                "coordinates": []
            }
        ]

    # Write the file as UTF-8 (No BOM)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Created {filepath}")

print("All files created.")
