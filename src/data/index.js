// Dynamic Data Loader
// Instead of importing all JSONs statically, we load them on demand.

import villagesRegistry, { VILLAGES_BY_REGION } from './villagesRegistry';
import fullSearchIndex from './searchIndex';

export { villagesRegistry, VILLAGES_BY_REGION };

// Function to load village data dynamically
export const loadVillageData = async (villageId) => {
    try {
        // We use Vite's dynamic import with a variable.
        // Vite needs to know the pattern.
        // Assuming files are in ./parcels/*.json
        const module = await import(`./parcels/${villageId}.json`);
        return module.default;
    } catch (error) {
        console.error(`Failed to load data for ${villageId}`, error);
        // Fallback for villages that don't have data files yet
        if (villagesRegistry[villageId]) {
            return {
                ...villagesRegistry[villageId],
                description: "Detailed map data coming soon...",
                parcels: []
            };
        }
        return null;
    }
};

// Search index helper
export const searchVillages = (term) => {
    if (!term) return [];
    const termLower = term.toLowerCase();

    // Search villages
    const villageMatches = Object.values(villagesRegistry).filter(v =>
        v.name.toLowerCase().includes(termLower) ||
        v.koreanName.includes(term)
    );

    // Search parcels
    const parcelMatches = fullSearchIndex.filter(p =>
        p.name.toLowerCase().includes(termLower) ||
        p.koreanName.includes(term)
    );

    return [...villageMatches, ...parcelMatches];
};
