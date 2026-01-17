import chablis from './villages/chablis.json';
// Côte de Nuits
import marsannay from './villages/marsannay.json';
import fixin from './villages/fixin.json';
import geveryChambertin from './villages/gevrey-chambertin.json';
import moreySaintDenis from './villages/morey-saint-denis.json';
import chambolleMusigny from './villages/chambolle-musigny.json';
import vougeot from './villages/vougeot.json';
import vosneRomanee from './villages/vosne-romanee.json';
import nuitsSaintGeorges from './villages/nuits-saint-georges.json';
import flageyEchezeaux from './villages/flagey-echezeaux.json';
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
// Côte Chalonnaise
import bouzeron from './villages/bouzeron.json';
import rully from './villages/rully.json';
import mercurey from './villages/mercurey.json';
import givry from './villages/givry.json';
import montagny from './villages/montagny.json';
// Mâconnais
import pouillyFuisse from './villages/pouilly-fuisse.json';
import saintVeran from './villages/saint-veran.json';
import vireClesse from './villages/vire-clesse.json';

// Global Search Index (Pre-built)
import globalSearchIndex from './global_search_index.json';

// 모든 데이터를 하나의 객체로 매핑
const villages = {
    [chablis.id]: chablis,
    // Nuits
    [marsannay.id]: marsannay,
    [fixin.id]: fixin,
    [geveryChambertin.id]: geveryChambertin,
    [moreySaintDenis.id]: moreySaintDenis,
    [chambolleMusigny.id]: chambolleMusigny,
    [vougeot.id]: vougeot,
    [vosneRomanee.id]: vosneRomanee,
    [flageyEchezeaux.id]: flageyEchezeaux,
    [nuitsSaintGeorges.id]: nuitsSaintGeorges,
    // Beaune
    [aloxeCorton.id]: aloxeCorton,
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
    // Chalonnaise
    [bouzeron.id]: bouzeron,
    [rully.id]: rully,
    [mercurey.id]: mercurey,
    [givry.id]: givry,
    [montagny.id]: montagny,
    // Mâconnais
    [pouillyFuisse.id]: pouillyFuisse,
    [saintVeran.id]: saintVeran,
    [vireClesse.id]: vireClesse,
};

// Export pre-built index
export const searchIndex = globalSearchIndex;

export default villages;
