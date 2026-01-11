# Data Sources

## Primary Source: INAO (via IGN)

The project relies on official **INAO (Institut National de l'Origine et de la Qualité)** data for the cadastral mapping of Burgundy AOC vineyards. This ensures high precision and legal compliance.

-   **Source**: IGN Géoplateforme WFS Service
-   **Layer**: `AOC-VITICOLES:aire_parcellaire` (Délimitations parcellaires AOC viticoles)
-   **License**: Etalab Open License (compatible with Open Data)
-   **Format**: GeoJSON (converted from EPSG:2154 to EPSG:4326)
-   **File**: `src/data/geojson/inao_burgundy_parcels.json`

## Fallback Source: OpenStreetMap (OSM)

OSM data is used *only* when specific areas or details are missing from the official INAO dataset.

## Update Process

1.  Run `node scripts/fetch_inao_data.js` to download and update the raw INAO data.
2.  (Future) Run a processing script to distribute this data into the village-specific JSON files in `src/data/villages/`.
