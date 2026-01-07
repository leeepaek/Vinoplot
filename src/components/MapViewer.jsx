import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const MapViewer = ({ villageId, onParcelClick }) => {
    const [svgContent, setSvgContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!villageId) return;

        const loadSvg = async () => {
            setLoading(true);
            setError(null);

            try {
                // Strictly load SVG from public/maps/
                const response = await fetch(`/maps/${villageId}.svg`);
                if (!response.ok) {
                    throw new Error(`Failed to load map for ${villageId}`);
                }

                const svgText = await response.text();
                setSvgContent(svgText);
            } catch (err) {
                console.error('Error loading SVG:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadSvg();
    }, [villageId]);

    useEffect(() => {
        if (!svgContent) return;

        // Add click handlers to all paths in the SVG
        const container = document.getElementById('svg-map-container');
        if (!container) return;

        // Explicitly target path elements with an ID (parcels)
        const paths = container.querySelectorAll('path[id]');

        const handleClick = (event) => {
            const parcelId = event.currentTarget.getAttribute('id');
            const parcelName = event.currentTarget.getAttribute('data-name');

            // Verify binding
            console.log('Parcel clicked:', parcelId, parcelName);

            if (onParcelClick) {
                onParcelClick({
                    id: parcelId,
                    name: parcelName,
                    villageId
                });
            }
        };

        paths.forEach(path => {
            path.style.cursor = 'pointer';
            path.addEventListener('click', handleClick);
        });

        // Cleanup
        return () => {
            paths.forEach(path => {
                path.removeEventListener('click', handleClick);
            });
        };
    }, [svgContent, onParcelClick, villageId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading map...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center text-red-600">
                    <p className="font-semibold">Failed to load map</p>
                    <p className="text-sm mt-2">{error}</p>
                    <p className="text-xs text-gray-500 mt-1">Please ensure {villageId}.svg exists in public/maps/</p>
                </div>
            </div>
        );
    }

    if (!svgContent) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-gray-500">Select a village to view its map</p>
            </div>
        );
    }

    return (
        <div className="map-viewer-container w-full h-full">
            <div
                id="svg-map-container"
                className="w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: svgContent }}
            />
        </div>
    );
};

MapViewer.propTypes = {
    villageId: PropTypes.string,
    onParcelClick: PropTypes.func
};

export default MapViewer;
