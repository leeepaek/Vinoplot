import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from 'react-leaflet';
import villagesData from '../data/index';
import 'leaflet/dist/leaflet.css';

// Helper to flip coordinates from [Lon, Lat] (GeoJSON) to [Lat, Lon] (Leaflet)
// GeoJSON: [x, y], Leaflet: [y, x]
// Input might be Polygon (array of rings) or MultiPolygon (array of polygons)
const flipCoordinates = (coords) => {
    if (!coords) return [];

    // Check depth to detect Polygon vs MultiPolygon
    // Polygon: [ [ [Lon, Lat], ... ], ... ] -> Depth 3
    // MultiPolygon: [ [ [ [Lon, Lat], ... ], ... ] ] -> Depth 4

    const getDepth = (arr) => Array.isArray(arr) ? 1 + getDepth(arr[0]) : 0;
    const depth = getDepth(coords);

    if (depth === 3) {
        // Polygon
        return coords.map(ring => ring.map(pt => [pt[1], pt[0]]));
    } else if (depth === 4) {
        // MultiPolygon
        return coords.map(poly => poly.map(ring => ring.map(pt => [pt[1], pt[0]])));
    }
    return coords;
};

// Calculate approximate center of a polygon or multipolygon
const calculateCenter = (coords) => {
    if (!coords || coords.length === 0) return null;

    // Flatten to list of points
    const points = [];
    const getDepth = (arr) => Array.isArray(arr) ? 1 + getDepth(arr[0]) : 0;
    const depth = getDepth(coords);

    if (depth === 3) { // Polygon
        coords[0].forEach(p => points.push(p));
    } else if (depth === 4) { // MultiPolygon
        coords.forEach(poly => poly[0].forEach(p => points.push(p)));
    }

    if (points.length === 0) return null;

    const sum = points.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
    // Return [Lon, Lat] -> [Lat, Lon]
    return [sum[1] / points.length, sum[0] / points.length];
};

const MapController = ({ center, zoom, highlightedId, parcels }) => {
    const map = useMap();

    useEffect(() => {
        if (highlightedId && parcels) {
            const parcel = parcels.find(p => p.id === highlightedId);
            if (parcel && parcel.coordinates) {
                 const target = calculateCenter(parcel.coordinates);
                 if (target) {
                     map.flyTo(target, 16, { duration: 1.5 });
                     return;
                 }
            }
        }

        if (center) {
            map.flyTo(center, zoom, { duration: 1.5 });
        }
    }, [center, zoom, map, highlightedId, parcels]);

    return null;
};

const ParcelPolygon = React.memo(({ parcel, isHighlighted, onClick }) => {
    const isGrand = parcel.grade === 'Grand Cru';
    const isPremier = parcel.grade === 'Premier Cru';
    const isVillage = !isGrand && !isPremier;

    const baseColor = isGrand ? '#D4AF37' :
        isPremier ? '#FB923C' :
            '#A1A1AA';

    const pathOptions = useMemo(() => ({
        color: isHighlighted ? '#FFD700' : baseColor, // Gold highlight
        weight: isHighlighted ? 3 : 1.5,
        fillColor: baseColor,
        fillOpacity: isHighlighted ? 0.4 : (isVillage ? 0.15 : 0.05),
        dashArray: isPremier ? '5, 5' : null
    }), [isHighlighted, baseColor, isPremier, isVillage]);

    const eventHandlers = useMemo(() => ({
        click: (e) => {
            if (onClick) onClick(parcel);
        }
    }), [parcel, onClick]);

    // Flip coordinates for Leaflet
    const leafletPositions = useMemo(() => flipCoordinates(parcel.coordinates), [parcel.coordinates]);

    return (
        <Polygon
            positions={leafletPositions}
            pathOptions={pathOptions}
            eventHandlers={eventHandlers}
        >
            <Tooltip sticky direction="top" opacity={1} className="custom-tooltip-leaflet">
                <div className="font-sans text-sm font-bold text-black">
                    {parcel.name}
                    <span className="block text-xs font-normal text-gray-600">
                        {parcel.koreanName}
                    </span>
                </div>
            </Tooltip>
        </Polygon>
    );
});

const WineMap = ({ villageId, onParcelClick, highlightedId }) => {
    const data = villagesData[villageId];

    // Default to Vosne coordinates if no data
    const center = [47.16, 4.95];
    const zoom = 14;

    if (!data) {
         return <div className="text-zinc-500 text-center py-20">Select a village to view the map</div>;
    }

    return (
        <div className="w-full h-full relative bg-zinc-900 border-l border-zinc-800">
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%', background: '#1a1a1a' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='Tiles &copy; Esri'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />

                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.2)', pointerEvents: 'none', zIndex: 400 }}></div>

                <MapController
                    center={center}
                    zoom={zoom}
                    highlightedId={highlightedId}
                    parcels={data.parcels}
                />

                {data.parcels && data.parcels.map(parcel => (
                    <ParcelPolygon
                        key={parcel.id}
                        parcel={parcel}
                        isHighlighted={highlightedId === parcel.id}
                        onClick={onParcelClick}
                    />
                ))}
            </MapContainer>
        </div>
    );
};

export default WineMap;
