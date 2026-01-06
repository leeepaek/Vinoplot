import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// 밭 뷰 조작을 위한 내부 컴포넌트
const MapController = ({ center, zoom, highlightedId, parcels }) => {
    const map = useMap();

    // 1. 기본 센터 이동 (지역 변경 시)
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom, { duration: 1.5 });
        }
    }, [center, zoom, map]);

    // 2. 하이라이트된 밭으로 이동 (리스트 클릭 시)
    useEffect(() => {
        if (highlightedId && parcels) {
            const targetParcel = parcels.find(p => p.id === highlightedId);
            if (targetParcel && targetParcel.coordinates) {
                const coords = targetParcel.coordinates[0];
                if (coords && coords.length > 0) {
                    const latSum = coords.reduce((sum, p) => sum + p[0], 0);
                    const lngSum = coords.reduce((sum, p) => sum + p[1], 0);
                    const centerLat = latSum / coords.length;
                    const centerLng = lngSum / coords.length;

                    map.flyTo([centerLat, centerLng], 16, { duration: 1.0 });
                }
            }
        }
    }, [highlightedId, parcels, map]);

    return null;
};

// 개별 폴리곤 컴포넌트 (Memoization 적용)
const ParcelPolygon = React.memo(({ parcel, isHighlighted, onClick }) => {
    const isGrand = parcel.grade === 'Grand Cru';
    const isPremier = parcel.grade === 'Premier Cru';
    const isVillage = !isGrand && !isPremier;

    // 등급별 색상 정의
    const baseColor = isGrand ? '#D4AF37' :  // Gold
        isPremier ? '#FB923C' : // Orange-400 (Amber)
            '#A1A1AA';              // Zinc-400 (Silver)

    const pathOptions = useMemo(() => ({
        color: isHighlighted ? '#ffffff' : baseColor,
        weight: isHighlighted ? 3 : 1.5,
        fillColor: baseColor,
        fillOpacity: isHighlighted ? 0.4 : (isVillage ? 0.15 : 0.05),
        dashArray: isPremier ? '5, 5' : null
    }), [isHighlighted, baseColor, isPremier, isVillage]);

    const eventHandlers = useMemo(() => ({
        click: (e) => {
            const map = e.target._map;
            map.fitBounds(e.target.getBounds(), { padding: [50, 50], duration: 1 });
            if (onClick) onClick(parcel.id);
        }
    }), [parcel.id, onClick]);

    return (
        <Polygon
            positions={parcel.coordinates}
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

const WineMap = ({ data, highlightedId, onParcelClick }) => {

    if (!data || !data.parcels) {
        return <div className="text-zinc-500 text-center py-20">No map data available</div>;
    }

    const { center, zoom, parcels } = data;

    return (
        <div className="w-full h-full relative bg-zinc-900 border-l border-zinc-800">
            <MapContainer
                center={center || [47.1852, 4.9431]}
                zoom={zoom || 14}
                style={{ height: '100%', width: '100%', background: '#1a1a1a' }}
                scrollWheelZoom={true}
            >
                {/* 1. 위성 지도 레이어 (Esri World Imagery) */}
                <TileLayer
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />

                {/* 시인성을 위한 딤 레이어 */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.2)', pointerEvents: 'none', zIndex: 400 }}></div>

                {/* 맵 컨트롤러 (FlyTo 로직) */}
                <MapController
                    center={center}
                    zoom={zoom}
                    highlightedId={highlightedId}
                    parcels={parcels}
                />

                {/* 데이터 없음 안내 (오버레이) */}
                {(!parcels || parcels.length === 0) && (
                    <div className="leaflet-top leaflet-right" style={{ pointerEvents: 'none', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <div className="bg-black/70 backdrop-blur-md text-white px-6 py-4 rounded-xl border border-white/10 shadow-2xl text-center">
                            <span className="text-2xl mb-2 block">🗺️</span>
                            <p className="text-sm font-bold">No Vineyard Data Yet</p>
                            <p className="text-xs text-zinc-400 mt-1">Detailed map coming soon.</p>
                        </div>
                    </div>
                )}

                {/* 폴리곤 리렌더링 최적화 */}
                {parcels.map(parcel => (
                    <ParcelPolygon
                        key={parcel.id}
                        parcel={parcel}
                        isHighlighted={highlightedId === parcel.id}
                        onClick={onParcelClick}
                    />
                ))}
            </MapContainer>

            {/* 범례 */}
            <div className="absolute bottom-6 right-6 bg-zinc-900/90 backdrop-blur border border-zinc-700 p-4 rounded-xl z-[1000]">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Legend</h4>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-[#D4AF37] opacity-80 border border-[#D4AF37]"></div>
                    <span className="text-xs text-zinc-300">Grand Cru</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-[#FB923C] opacity-80 border border-[#FB923C] border-dashed"></div>
                    <span className="text-xs text-zinc-300">Premier Cru</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-[#A1A1AA] opacity-80 border border-[#A1A1AA]"></div>
                    <span className="text-xs text-zinc-300">Village (Lieu-dit)</span>
                </div>
            </div>
        </div>
    );
};

export default WineMap;
