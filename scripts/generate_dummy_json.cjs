const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../src/data/villages');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// List of IDs from index.js
const villages = [
    'chablis',
    'marsannay', 'fixin', 'gevrey-chambertin', 'morey-saint-denis', 'chambolle-musigny', 'vougeot', 'vosne-romanee', 'nuits-saint-georges', 'flagey-echezeaux',
    'aloxe-corton', 'pernand-vergelesses', 'savigny-les-beaune', 'beaune', 'pommard', 'volnay', 'meursault', 'puligny-montrachet', 'chassagne-montrachet', 'santenay', 'saint-aubin', 'auxey-duresses', 'monthelie', 'maranges', 'ladoix', 'chorey-les-beaune',
    'bouzeron', 'rully', 'mercurey', 'givry', 'montagny',
    'pouilly-fuisse', 'saint-veran', 'vire-clesse'
];

villages.forEach(id => {
    const data = {
        id: id,
        name: id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        koreanName: id, // Placeholder
        description: `Description for ${id}`,
        region: 'Burgundy',
        parcels: []
    };
    fs.writeFileSync(path.join(targetDir, `${id}.json`), JSON.stringify(data, null, 2));
    console.log(`Generated ${id}.json`);
});
