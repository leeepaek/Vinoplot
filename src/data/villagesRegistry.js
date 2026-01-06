// Light-weight registry for sidebar navigation
const villagesRegistry = {
    // Côte de Nuits
    'gevrey-chambertin': { id: 'gevrey-chambertin', name: 'Gevrey-Chambertin', koreanName: '쥬브레 샹베르탱', region: 'Côte de Nuits' },
    'morey-saint-denis': { id: 'morey-saint-denis', name: 'Morey-Saint-Denis', koreanName: '모레 생 드니', region: 'Côte de Nuits' },
    'chambolle-musigny': { id: 'chambolle-musigny', name: 'Chambolle-Musigny', koreanName: '샹볼 뮈지니', region: 'Côte de Nuits' },
    'vosne-romanee': { id: 'vosne-romanee', name: 'Vosne-Romanée', koreanName: '본 로마네', region: 'Côte de Nuits' },
    'nuits-saint-georges': { id: 'nuits-saint-georges', name: 'Nuits-Saint-Georges', koreanName: '뉘생 조르쥬', region: 'Côte de Nuits' },

    // Placeholder for others (to keep existing structure valid if needed)
    'marsannay': { id: 'marsannay', name: 'Marsannay', koreanName: '마르사네', region: 'Côte de Nuits' },
    'fixin': { id: 'fixin', name: 'Fixin', koreanName: '픽생', region: 'Côte de Nuits' },
    'vougeot': { id: 'vougeot', name: 'Vougeot', koreanName: '부조', region: 'Côte de Nuits' },
    'flagey-echezeaux': { id: 'flagey-echezeaux', name: 'Flagey-Echézeaux', koreanName: '플라제 에셰조', region: 'Côte de Nuits' },

    // Beaune Placeholders
    'aloxe-corton': { id: 'aloxe-corton', name: 'Aloxe-Corton', koreanName: '알록스 코르통', region: 'Côte de Beaune' },
    // ... add others if strictly necessary for the UI to not break, but minimal is fine for now.
};

export const VILLAGES_BY_REGION = {
    'Côte de Nuits': [
        'marsannay', 'fixin', 'gevrey-chambertin', 'morey-saint-denis',
        'chambolle-musigny', 'vougeot', 'vosne-romanee', 'flagey-echezeaux',
        'nuits-saint-georges'
    ],
    // Keeping the structure from MapExplorer
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

export default villagesRegistry;
