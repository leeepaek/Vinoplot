import React, { useState } from 'react';
import MapViewer from '../components/MapViewer';
import ParcelModal from '../components/ParcelModal';
import villagesData from '../data/index';
import searchIndex from '../data/searchIndex';

// Village list with regions
const VILLAGES_BY_REGION = {
    'Côte de Nuits': [
        'marsannay', 'fixin', 'gevrey-chambertin', 'morey-saint-denis',
        'chambolle-musigny', 'vougeot', 'vosne-romanee',
        'nuits-saint-georges'
    ],
    'Côte de Beaune': [
        'aloxe-corton', 'pernand-vergelesses', 'savigny-les-beaune', 'beaune',
        'pommard', 'volnay', 'meursault', 'puligny-montrachet',
        'chassagne-montrachet', 'santenay', 'saint-aubin', 'auxey-duresses',
        'monthelie', 'maranges', 'ladoix', 'chorey-les-beaune'
    ],
    'Côte Chalonnaise': [
        'bouzeron', 'rully', 'mercurey', 'givry', 'montagny'
    ],
    'Mâconnais': [
        'pouilly-fuisse', 'saint-veran', 'vire-clesse'
    ],
    'Chablis': [
        'chablis'
    ]
};

function MapExplorer() {
    const [selectedVillage, setSelectedVillage] = useState(null);
    const [selectedParcel, setSelectedParcel] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleParcelClick = (parcelInfo) => {
        // Find the parcel data from JSON
        const villageData = villagesData[parcelInfo.villageId];
        if (villageData) {
            const parcel = villageData.parcels.find(p => p.id === parcelInfo.id);
            if (parcel) {
                setSelectedParcel({
                    ...parcel,
                    village: villageData.koreanName || villageData.name
                });
            }
        }
    };

    const handleVillageSelect = (villageId) => {
        setSelectedVillage(villageId);
        setSearchTerm('');
    };

    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.length > 1) {
            const lowerTerm = term.toLowerCase();
            const results = searchIndex.filter(item =>
                item.keywords.some(k => k && k.toLowerCase().includes(lowerTerm))
            );
            setSearchResults(results.slice(0, 10)); // Limit to 10 results
        } else {
            setSearchResults([]);
        }
    };

    const handleSearchResultClick = (result) => {
        if (result.type === 'village') {
            setSelectedVillage(result.id);
        } else if (result.type === 'parcel') {
            setSelectedVillage(result.villageId);
            // Wait for village to load then select parcel?
            // For now, just setting the village is a good start,
            // ideally we would pass an initialParcelId to MapViewer or trigger modal.
            // Let's trigger the modal directly if we have the data.
            handleParcelClick({
                id: result.id,
                name: result.name,
                villageId: result.villageId
            });
        }
        setSearchTerm('');
        setSearchResults([]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-red-900 to-amber-900 text-white shadow-lg">
                <div className="container mx-auto px-6 py-6">
                    <h1 className="text-4xl font-bold">VinoPlot Burgundy Maps</h1>
                    <p className="text-amber-200 mt-2">Interactive vineyard maps of Burgundy wine regions</p>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8">
                {/* Search Bar */}
                <div className="mb-8 relative">
                    <input
                        type="text"
                        placeholder="Search villages or parcels... (e.g., Vosne, Richebourg, 뫼르소)"
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full max-w-2xl px-6 py-4 text-lg border-2 border-amber-300 rounded-lg focus:outline-none focus:border-red-600 shadow-md"
                    />
                    {searchResults.length > 0 && (
                        <div className="absolute z-10 w-full max-w-2xl mt-2 bg-white rounded-lg shadow-xl border border-amber-200 max-h-96 overflow-y-auto">
                            {searchResults.map((result, idx) => (
                                <div
                                    key={`${result.type}-${result.id}-${idx}`}
                                    onClick={() => handleSearchResultClick(result)}
                                    className="px-6 py-3 hover:bg-amber-50 cursor-pointer border-b border-gray-100 last:border-0"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="font-bold text-red-900">{result.koreanName || result.name}</span>
                                            <span className="text-xs ml-2 px-2 py-0.5 rounded bg-gray-200 text-gray-600 uppercase">{result.type}</span>
                                        </div>
                                        {result.type === 'parcel' && (
                                            <span className="text-sm text-gray-500">{villagesData[result.villageId]?.koreanName}</span>
                                        )}
                                    </div>
                                    {result.type === 'parcel' && (
                                        <div className="text-xs text-gray-400 mt-1">
                                            {result.grade} • Producers: {result.producers?.length || 0}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Village Selector Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                            <h2 className="text-2xl font-bold text-red-900 mb-4">Select Village</h2>

                            {Object.entries(VILLAGES_BY_REGION).map(([region, villages]) => (
                                <div key={region} className="mb-6">
                                    <h3 className="text-sm font-semibold text-amber-800 mb-2 uppercase tracking-wide">
                                        {region}
                                    </h3>
                                    <div className="space-y-1">
                                        {villages.map(villageId => {
                                            const villageData = villagesData[villageId];
                                            return (
                                                <button
                                                    key={villageId}
                                                    onClick={() => handleVillageSelect(villageId)}
                                                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedVillage === villageId
                                                            ? 'bg-red-600 text-white font-semibold'
                                                            : 'hover:bg-amber-100 text-gray-700'
                                                        }`}
                                                >
                                                    {villageData?.koreanName || villageId}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Map Display Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-xl p-8">
                            {selectedVillage ? (
                                <>
                                    <div className="mb-6">
                                        <h2 className="text-3xl font-bold text-red-900">
                                            {villagesData[selectedVillage]?.koreanName || selectedVillage}
                                        </h2>
                                        <p className="text-gray-600 mt-1">
                                            {villagesData[selectedVillage]?.description}
                                        </p>
                                    </div>

                                    <div className="border-2 border-amber-200 rounded-lg overflow-hidden bg-amber-50">
                                        <MapViewer
                                            villageId={selectedVillage}
                                            onParcelClick={handleParcelClick}
                                        />
                                    </div>

                                    <div className="mt-6 text-sm text-gray-500 text-center">
                                        💡 Click on any parcel to view detailed information
                                    </div>
                                </>
                            ) : (
                                <div className="h-96 flex items-center justify-center text-gray-400">
                                    <div className="text-center">
                                        <svg className="w-24 h-24 mx-auto mb-4 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
                                        </svg>
                                        <p className="text-xl font-semibold">Select a village from the sidebar</p>
                                        <p className="mt-2">or use the search bar to find a specific location</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Parcel Modal */}
            {selectedParcel && (
                <ParcelModal
                    parcel={selectedParcel}
                    onClose={() => setSelectedParcel(null)}
                />
            )}
        </div>
    );
}

export default MapExplorer;
