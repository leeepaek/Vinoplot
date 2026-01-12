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
            setSvgContent(null);

            try {
                // Dynamic import using Vite's glob import feature logic or explicit import
                // Since villageId is dynamic, we need to handle the import carefully.
                // In Vite, we can use `import.meta.glob` or `import` with string interpolation if it follows a pattern.
                // However, dynamic import with variable requires the file to be in the build graph.

                // Using dynamic import with template literal (Vite supports this if the path is relative)
                // Note: The path must be relative to the current file or absolute.
                // ../assets/maps/${villageId}.svg

                const module = await import(`../assets/maps/${villageId}.svg`);

                // If the SVG is imported as a module (e.g., via vite-plugin-svgr or raw), it might be different.
                // By default in Vite, importing an SVG gives its URL.
                // To get the content, we usually need `?raw` suffix or fetch the URL.
                // But `import()` with variables and query suffixes is tricky.

                // Let's try fetching the URL returned by the import.
                const response = await fetch(module.default);
                const text = await response.text();
                setSvgContent(text);

            } catch (err) {
                console.warn('Direct import failed, trying raw fetch override for development or alternative loading', err);

                // Fallback: If we are in an environment where we can't use dynamic import easily for arbitrary strings
                // (though Vite usually handles `import(path)` well if the glob is predictable).
                // Let's try to fetch assuming the assets are served (which might not be true in production if not in public).
                // But the user *insisted* on `src/assets/maps`.

                // Alternative: Use import.meta.glob
                const modules = import.meta.glob('../assets/maps/*.svg', { as: 'url' });
                const path = `../assets/maps/${villageId}.svg`;

                if (modules[path]) {
                    try {
                        const url = await modules[path]();
                        const response = await fetch(url);
                        const text = await response.text();
                        setSvgContent(text);
                    } catch (e) {
                         console.error('Glob load failed', e);
                         setError(`Failed to load map for ${villageId}`);
                    }
                } else {
                    setError(`Map not found: ${villageId}`);
                }
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

        const paths = container.querySelectorAll('path[id]');

        const handleClick = (event) => {
            const parcelId = event.currentTarget.getAttribute('id');
            const parcelName = event.currentTarget.getAttribute('data-name');

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
