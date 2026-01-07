
// Côte de Nuits
import geveryChambertin from './villages/gevrey-chambertin.json';
import chambolleMusigny from './villages/chambolle-musigny.json';
import vosneRomanee from './villages/vosne-romanee.json';
import nuitsSaintGeorges from './villages/nuits-saint-georges.json';
// Côte de Beaune
import aloxeCorton from './villages/aloxe-corton.json';

// Placeholder data for imported but missing files to avoid build errors during zero-base reconstruction
// Ideally we would create files for all, but for now we mock the rest as simple objects if the file doesn't exist.
// However, since we are rebuilding index.js, we should only import what we have created.

const villages = {
    [geveryChambertin.id]: geveryChambertin,
    [chambolleMusigny.id]: chambolleMusigny,
    [vosneRomanee.id]: vosneRomanee, // This now includes Flagey
    [nuitsSaintGeorges.id]: nuitsSaintGeorges,
    [aloxeCorton.id]: aloxeCorton
};

// 검색을 위한 평탄화된 데이터 리스트 (Fuzzy Search 용)
export const searchIndex = Object.values(villages).flatMap(village => {
    // 1. 마을 자체 정보
    const items = [{
        type: 'village',
        id: village.id,
        name: village.name,
        koreanName: village.koreanName,
        keywords: [village.name, village.koreanName, village.description, village.region],
        data: village
    }];

    // 2. 마을 내의 밭(Parcels) 정보
    if (village.parcels) {
        village.parcels.forEach(parcel => {
            items.push({
                type: 'parcel',
                id: parcel.id,
                name: parcel.name,
                koreanName: parcel.koreanName,
                keywords: [
                    parcel.name,
                    parcel.koreanName,
                    village.name,
                    village.koreanName,
                    ...(parcel.producers || [])
                ],
                grade: parcel.grade,
                villageId: village.id,
                producers: parcel.producers,
                data: parcel
            });
        });
    }
    return items;
});

export default villages;
