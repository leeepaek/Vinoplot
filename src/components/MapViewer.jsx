import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// Simple in-memory cache to prevent redundant network requests
const svgCache = {};

const MapViewer = ({ villageId, onParcelClick }) => {
    const [svgContent, setSvgContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const containerRef = useRef(null);

    // Load SVG logic with caching
    useEffect(() => {
        if (!villageId) return;

        // Check cache first
        if (svgCache[villageId]) {
            setSvgContent(svgCache[villageId]);
            setLoading(false);
            setError(null);
            return;
        }

        const loadSvg = async () => {
            setLoading(true);
            setError(null);

            try {
                // Determine path - checking if it's a known vector map or needing fallback
                const response = await fetch(`/src/assets/maps/${villageId}.svg`);
                if (!response.ok) {
                    throw new Error(`Map not available for ${villageId}`);
                }

                const svgText = await response.text();
                // Store in cache
                svgCache[villageId] = svgText;
                setSvgContent(svgText);
            } catch (err) {
                console.warn('Error loading SVG:', err);
                setError(err.message);
                setSvgContent(null);
            } finally {
                setLoading(false);
            }
        };

        loadSvg();
    }, [villageId]);

    // Event listener attachment logic
    useEffect(() => {
        if (!svgContent || !containerRef.current) return;

        const container = containerRef.current;
        // Select all paths that have an ID (representing parcels)
        const paths = container.querySelectorAll('path[id]');

        const handleClick = (event) => {
            // Stop propagation to prevent bubbling if nested
            event.stopPropagation();

            const target = event.currentTarget;
            const parcelId = target.getAttribute('id');
            const parcelName = target.getAttribute('data-name');

            // Visual feedback handled by CSS (hover), but we could add active state here if needed

            if (onParcelClick && parcelId) {
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

        // Cleanup function
        return () => {
            paths.forEach(path => {
                path.removeEventListener('click', handleClick);
            });
        };
    }, [svgContent, onParcelClick, villageId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-serif">Loading terroir...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px] bg-zinc-50 rounded-lg">
                <div className="text-center text-zinc-500 max-w-md px-6">
                    <span className="text-4xl block mb-4">🗺️</span>
                    <h3 className="text-lg font-bold text-zinc-700 mb-2">Map Not Available</h3>
                    <p className="text-sm">{error}</p>
                    <p className="text-xs mt-4 text-zinc-400">
                        We are currently digitizing this region. <br/>
                        Please try <b>Gevrey-Chambertin</b> for a preview.
                    </p>
                </div>
            </div>
        );
    }

    if (!svgContent) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <p className="text-gray-500 italic font-serif">Select a village to explore its vineyards</p>
            </div>
        );
    }

    return (
        <div className="map-viewer-container w-full h-full bg-white transition-opacity duration-500 ease-in-out">
            <div
                ref={containerRef}
                className="w-full h-full flex items-center justify-center p-4"
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
