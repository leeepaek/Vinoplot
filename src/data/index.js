
// Côte de Nuits
import geveryChambertin from './villages/gevrey-chambertin.json';
import chambolleMusigny from './villages/chambolle-musigny.json';
import vosneRomanee from './villages/vosne-romanee.json';
import nuitsSaintGeorges from './villages/nuits-saint-georges.json';
import marsannay from './villages/marsannay.json';
import fixin from './villages/fixin.json';
import moreySaintDenis from './villages/morey-saint-denis.json';
import vougeot from './villages/vougeot.json';

// Côte de Beaune
import aloxeCorton from './villages/aloxe-corton.json';
import pernandVergelesses from './villages/pernand-vergelesses.json';
import savignyLesBeaune from './villages/savigny-les-beaune.json';
import beaune from './villages/beaune.json';
import pommard from './villages/pommard.json';
import volnay from './villages/volnay.json';
import meursault from './villages/meursault.json';
import pulignyMontrachet from './villages/puligny-montrachet.json';
import chassagneMontrachet from './villages/chassagne-montrachet.json';
import santenay from './villages/santenay.json';
import saintAubin from './villages/saint-aubin.json';
import auxeyDuresses from './villages/auxey-duresses.json';
import monthelie from './villages/monthelie.json';
import maranges from './villages/maranges.json';
import ladoix from './villages/ladoix.json';
import choreyLesBeaune from './villages/chorey-les-beaune.json';

const villages = {
    // Core (High Precision)
    [geveryChambertin.id]: geveryChambertin,
    [chambolleMusigny.id]: chambolleMusigny,
    [vosneRomanee.id]: vosneRomanee, // Includes Flagey
    [nuitsSaintGeorges.id]: nuitsSaintGeorges,
    [aloxeCorton.id]: aloxeCorton,

    // Nuits (Placeholder)
    [marsannay.id]: marsannay,
    [fixin.id]: fixin,
    [moreySaintDenis.id]: moreySaintDenis,
    [vougeot.id]: vougeot,

    // Beaune (Placeholder)
    [pernandVergelesses.id]: pernandVergelesses,
    [savignyLesBeaune.id]: savignyLesBeaune,
    [beaune.id]: beaune,
    [pommard.id]: pommard,
    [volnay.id]: volnay,
    [meursault.id]: meursault,
    [pulignyMontrachet.id]: pulignyMontrachet,
    [chassagneMontrachet.id]: chassagneMontrachet,
    [santenay.id]: santenay,
    [saintAubin.id]: saintAubin,
    [auxeyDuresses.id]: auxeyDuresses,
    [monthelie.id]: monthelie,
    [maranges.id]: maranges,
    [ladoix.id]: ladoix,
    [choreyLesBeaune.id]: choreyLesBeaune,
};

// Search Index Builder
export const searchIndex = Object.values(villages).flatMap(village => {
    // 1. Village Info
    const items = [{
        type: 'village',
        id: village.id,
        name: village.name,
        koreanName: village.koreanName,
        keywords: [village.name, village.koreanName, village.description, village.region],
        data: village
    }];

    // 2. Parcel Info
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
