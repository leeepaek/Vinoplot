import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { geoData } from '../data/mockGeoData';

// 선택된 밭이나 하이라이트된 밭으로 지도 중심 이동
function FocusMap({ center }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 15, { duration: 2 });
    }, [center, map]);
    return null;
}

const RealWineMap = ({ highlightQuery }) => {
    // 기본 스타일
    const defaultStyle = {
        fillColor: '#800020', // Burgundy
        weight: 1,
        opacity: 1,
        color: '#a1a1aa', // Zinc-400 border
        fillOpacity: 0.4
    };

    // 하이라이트 스타일
    const highlightStyle = {
        fillColor: '#EED9C4', // Champagne
        weight: 3,
        color: '#fbbf24', // Amber-400 border
        fillOpacity: 0.7,
        dashArray: ''
    };

    // 흐림 스타일 (다른 곳이 하이라이트 될 때)
    const dimmedStyle = {
        fillColor: '#27272a', // Zinc-800
        weight: 1,
        color: '#52525b',
        fillOpacity: 0.2
    };

    const getStyle = (parcel) => {
        if (!highlightQuery) return defaultStyle;

        const query = highlightQuery.toLowerCase();
        const isMatch = parcel.name.toLowerCase().includes(query) ||
            parcel.id.toLowerCase().includes(query);

        if (isMatch) return highlightStyle;
        return dimmedStyle;
    };

    // 하이라이트된 밭의 중심점 찾기 (Focus용)
    const targetParcel = highlightQuery
        ? geoData.parcels.find(p =>
            p.name.toLowerCase().includes(highlightQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(highlightQuery.toLowerCase())
        )
        : null;

    // 중심 좌표 설정 (타겟이 있으면 타겟 중심, 없으면 전체 중심)
    // Polygon 좌표가 [[lat, lng], ...] 형태이므로 첫 좌표를 대략적 중심으로 사용
    const center = targetParcel ? targetParcel.coordinates[0] : geoData.center;

    return (
        <div className="w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 z-0 relative">
            <MapContainer
                center={geoData.center}
                zoom={geoData.zoom}
                style={{ height: '100%', width: '100%', background: '#1c1c1c' }}
                scrollWheelZoom={false}
            >
                <FocusMap center={center} />

                {/* Dark Matter Tile for Dark Mode */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {geoData.parcels.map((parcel) => (
                    <Polygon
                        key={parcel.id}
                        positions={parcel.coordinates}
                        pathOptions={getStyle(parcel)}
                    >
                        <Popup className="custom-popup">
                            <div className="font-sans text-center">
                                <h3 className="text-lg font-bold text-burgundy-900 font-serif mb-1">{parcel.name}</h3>
                                <span className="inline-block px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-bold mb-2 border border-zinc-300">
                                    {parcel.type}
                                </span>
                                <p className="text-sm text-zinc-600 font-light">{parcel.description}</p>
                            </div>
                        </Popup>
                    </Polygon>
                ))}
            </MapContainer>
        </div>
    );
};

export default RealWineMap;
