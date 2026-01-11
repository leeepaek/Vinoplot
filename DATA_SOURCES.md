# Data Sources & Licensing Policy

## 1. Primary Data Source: INAO Open Data

To ensure legal compliance and accuracy, **VinoPlot** strictly relies on official government data provided by the **Institut National de l'Origine et de la Qualité (INAO)**.

*   **Source Portal:** [data.gouv.fr](https://www.data.gouv.fr/reuses/visualisation-geoportail-des-delimitations-des-aoc-viticoles)
*   **Dataset:** "Délimitations parcellaires des AOC viticoles"
*   **License:** **Etalab Open License 2.0** (Compatible with commercial reuse, requiring attribution).

## 2. Prohibition on BIVB Scraping

**Strictly Forbidden:**
*   Do **not** scrape, copy, or reverse-engineer data from the BIVB (Bureau Interprofessionnel des Vins de Bourgogne) website or their proprietary maps.
*   BIVB data is copyrighted and not available under an open license.

## 3. Data Processing Workflow

1.  **Download:** Fetch official Shapefiles/GeoJSON from the INAO/data.gouv.fr repository.
2.  **Process:** Use the internal tool `scripts/process_inao_geojson.js` to converting the raw government data into the application's optimized JSON format.
   *   *Input:* Raw INAO GeoJSON (WGS84).
   *   *Output:* `src/data/villages/[village].json`.
3.  **Attribution:** All maps generated must display the attribution: *"Source: INAO / IGN - Licence Ouverte Etalab"*.

## 4. Updates

*   Data should be re-verified annually against the `data.gouv.fr` repository for updates to appellation boundaries.
