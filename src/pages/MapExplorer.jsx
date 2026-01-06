import React, { useState } from 'react';
import MapViewer from '../components/MapViewer';
import ParcelModal from '../components/ParcelModal';
import { villagesRegistry, loadVillageData, searchVillages, VILLAGES_BY_REGION } from '../data/index';

function MapExplorer() {
    const [selectedVillage, setSelectedVillage] = useState(null);
    const [villageData, setVillageData] = useState(null);
    const [selectedParcel, setSelectedParcel] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    // Load village data when selection changes
    React.useEffect(() => {
        if (selectedVillage) {
            setLoadingData(true);
            loadVillageData(selectedVillage).then(data => {
                setVillageData(data);
                setLoadingData(false);
            });
        } else {
            setVillageData(null);
        }
    }, [selectedVillage]);

    const handleParcelClick = (parcelInfo) => {
        if (villageData && villageData.parcels) {
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
        setSearchResults([]);
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.length > 1) {
            const results = searchVillages(term);
            setSearchResults(results);

            // Auto-select if exact match village
            const exactVillage = results.find(r =>
                !r.villageId && (r.name.toLowerCase() === term.toLowerCase() || r.koreanName === term)
            );
            if (exactVillage) {
                handleVillageSelect(exactVillage.id);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleSearchResultClick = (result) => {
        if (result.villageId) {
            // It's a parcel
            handleVillageSelect(result.villageId);
            // Optionally we could highlight the parcel, but for now just go to village
        } else {
            // It's a village
            handleVillageSelect(result.id);
        }
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
                        placeholder="Search villages... (e.g., Vosne, 뫼르소, Chambertin)"
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full max-w-2xl px-6 py-4 text-lg border-2 border-amber-300 rounded-lg focus:outline-none focus:border-red-600 shadow-md"
                    />
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 w-full max-w-2xl bg-white shadow-xl rounded-b-lg z-50 max-h-60 overflow-y-auto">
                            {searchResults.map((result) => (
                                <div
                                    key={result.id + (result.villageId ? result.villageId : '')}
                                    onClick={() => handleSearchResultClick(result)}
                                    className="px-6 py-3 hover:bg-amber-50 cursor-pointer border-b border-gray-100 last:border-0"
                                >
                                    <div className="font-semibold text-gray-800">{result.koreanName} ({result.name})</div>
                                    <div className="text-sm text-gray-500">
                                        {result.villageId ? `Parcel in ${villagesRegistry[result.villageId]?.koreanName}` : 'Village'}
                                    </div>
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
                                            const vReg = villagesRegistry[villageId];
                                            return (
                                                <button
                                                    key={villageId}
                                                    onClick={() => handleVillageSelect(villageId)}
                                                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedVillage === villageId
                                                            ? 'bg-red-600 text-white font-semibold'
                                                            : 'hover:bg-amber-100 text-gray-700'
                                                        }`}
                                                >
                                                    {vReg?.koreanName || villageId}
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
                            {selectedVillage && villageData ? (
                                <>
                                    <div className="mb-6">
                                        <h2 className="text-3xl font-bold text-red-900">
                                            {villageData.koreanName || selectedVillage}
                                        </h2>
                                        <p className="text-gray-600 mt-1">
                                            {villageData.description}
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
                            ) : loadingData ? (
                                <div className="h-96 flex items-center justify-center text-gray-400">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                                </div>
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
