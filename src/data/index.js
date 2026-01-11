// Côte de Nuits
import vosneRomanee from './villages/vosne-romanee.json';

// Create a dummy structure for removed villages to prevent crashes if code references them
// But if they are not exported, it's fine.
// I'll just remove the imports.

const villages = {
    [vosneRomanee.id]: vosneRomanee,
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
                    ...(parcel.producers || []) // 생산자 정보도 키워드에 포함
                ],
                grade: parcel.grade || parcel.classification,
                villageId: village.id,
                producers: parcel.producers, // 생산자 데이터 직접 접근용
                data: parcel
            });
        });
    }
    return items;
});

export default villages;
