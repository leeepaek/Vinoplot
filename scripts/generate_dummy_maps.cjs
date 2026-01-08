const fs = require('fs');
const path = require('path');

const villages = [
    'chablis',
    'marsannay', 'fixin', 'gevrey-chambertin', 'morey-saint-denis', 'chambolle-musigny', 'vougeot', 'vosne-romanee', 'nuits-saint-georges', 'flagey-echezeaux',
    'aloxe-corton', 'pernand-vergelesses', 'savigny-les-beaune', 'beaune', 'pommard', 'volnay', 'meursault', 'puligny-montrachet', 'chassagne-montrachet', 'santenay', 'saint-aubin', 'auxey-duresses', 'monthelie', 'maranges', 'ladoix', 'chorey-les-beaune',
    'bouzeron', 'rully', 'mercurey', 'givry', 'montagny',
    'pouilly-fuisse', 'saint-veran', 'vire-clesse'
];

const targetDir = path.join(__dirname, '../src/assets/maps');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

function generatePathData(complexity) {
    let d = "M10,10";
    for (let i = 0; i < complexity; i++) {
        const x = Math.random() * 800;
        const y = Math.random() * 1000;
        // bezier curve for "organic" look
        const c1x = x + (Math.random() - 0.5) * 50;
        const c1y = y + (Math.random() - 0.5) * 50;
        const c2x = x + (Math.random() - 0.5) * 50;
        const c2y = y + (Math.random() - 0.5) * 50;
        d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${x.toFixed(2)},${y.toFixed(2)}`;
    }
    d += " Z";
    return d;
}

villages.forEach(village => {
    // Determine complexity: normal villages get moderate complexity.
    // Monthelie gets EXTREME complexity to hit >120KB.
    const isMonthelie = village === 'monthelie';
    const complexity = isMonthelie ? 2500 : 100; // 2500 curves ~ big file

    let content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" id="${village}">\n`; // Wrong viewBox intentionally
    content += `  <!-- Generated map for ${village} -->\n`;

    // Generate multiple paths
    const pathCount = isMonthelie ? 50 : 10;

    for (let i = 0; i < pathCount; i++) {
        content += `  <path id="${village}_parcel_${i}" d="${generatePathData(complexity)}" fill="#DAA520" stroke="black" />\n`;
    }

    content += `</svg>`;

    fs.writeFileSync(path.join(targetDir, `${village}.svg`), content);
    console.log(`Generated ${village}.svg`);
});
