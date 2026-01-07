// Côte de Nuits
// import marsannay from './villages/marsannay.json';
// import fixin from './villages/fixin.json';
// import geveryChambertin from './villages/gevrey-chambertin.json';
// import moreySaintDenis from './villages/morey-saint-denis.json';
import chambolleMusigny from './villages/chambolle-musigny.json';
// import vougeot from './villages/vougeot.json';
import vosneRomanee from './villages/vosne-romanee.json';
import flageyEchezeaux from './villages/flagey-echezeaux.json';
// import nuitsSaintGeorges from './villages/nuits-saint-georges.json';

// Côte de Beaune
// import aloxeCorton from './villages/aloxe-corton.json';
// import pernandVergelesses from './villages/pernand-vergelesses.json';
// import savignyLesBeaune from './villages/savigny-les-beaune.json';
// import beaune from './villages/beaune.json';
// import pommard from './villages/pommard.json';
// import volnay from './villages/volnay.json';
// import meursault from './villages/meursault.json';
import pulignyMontrachet from './villages/puligny-montrachet.json';
// import chassagneMontrachet from './villages/chassagne-montrachet.json';
// import santenay from './villages/santenay.json';
// import saintAubin from './villages/saint-aubin.json';
// import auxeyDuresses from './villages/auxey-duresses.json';
// import monthelie from './villages/monthelie.json';
// import maranges from './villages/maranges.json';
// import ladoix from './villages/ladoix.json';
// import choreyLesBeaune from './villages/chorey-les-beaune.json';

// Côte Chalonnaise
// import bouzeron from './villages/bouzeron.json';
// import rully from './villages/rully.json';
// import mercurey from './villages/mercurey.json';
// import givry from './villages/givry.json';
// import montagny from './villages/montagny.json';

// Mâconnais
// import pouillyFuisse from './villages/pouilly-fuisse.json';
// import saintVeran from './villages/saint-veran.json';
// import vireClesse from './villages/vire-clesse.json';

// 모든 데이터를 하나의 객체로 매핑
const villages = {
    // [chablis.id]: chablis,
    // Nuits
    // [marsannay.id]: marsannay,
    // [fixin.id]: fixin,
    // [geveryChambertin.id]: geveryChambertin,
    // [moreySaintDenis.id]: moreySaintDenis,
    [chambolleMusigny.id]: chambolleMusigny,
    // [vougeot.id]: vougeot,
    [vosneRomanee.id]: vosneRomanee,
    [flageyEchezeaux.id]: flageyEchezeaux,
    // [nuitsSaintGeorges.id]: nuitsSaintGeorges,
    // Beaune
    // [aloxeCorton.id]: aloxeCorton,
    // [pernandVergelesses.id]: pernandVergelesses,
    // [savignyLesBeaune.id]: savignyLesBeaune,
    // [beaune.id]: beaune,
    // [pommard.id]: pommard,
    // [volnay.id]: volnay,
    // [meursault.id]: meursault,
    [pulignyMontrachet.id]: pulignyMontrachet,
    // [chassagneMontrachet.id]: chassagneMontrachet,
    // [santenay.id]: santenay,
    // [saintAubin.id]: saintAubin,
    // [auxeyDuresses.id]: auxeyDuresses,
    // [monthelie.id]: monthelie,
    // [maranges.id]: maranges,
    // [ladoix.id]: ladoix,
    // [choreyLesBeaune.id]: choreyLesBeaune,
    // Chalonnaise
    // [bouzeron.id]: bouzeron,
    // [rully.id]: rully,
    // [mercurey.id]: mercurey,
    // [givry.id]: givry,
    // [montagny.id]: montagny,
    // Mâconnais
    // [pouillyFuisse.id]: pouillyFuisse,
    // [saintVeran.id]: saintVeran,
    // [vireClesse.id]: vireClesse,
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
