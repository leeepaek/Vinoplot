const fs = require('fs');
const path = require('path');

const villagesDir = 'src/data/villages';
const mapsDir = 'src/assets/maps';

const villages = [
  'chablis', 'marsannay', 'fixin', 'gevrey-chambertin', 'morey-saint-denis',
  'chambolle-musigny', 'vougeot', 'vosne-romanee', 'flagey-echezeaux',
  'nuits-saint-georges', 'aloxe-corton', 'pernand-vergelesses',
  'savigny-les-beaune', 'beaune', 'pommard', 'volnay', 'meursault',
  'puligny-montrachet', 'chassagne-montrachet', 'santenay', 'saint-aubin',
  'auxey-duresses', 'monthelie', 'maranges', 'ladoix', 'chorey-les-beaune',
  'bouzeron', 'rully', 'mercurey', 'givry', 'montagny', 'pouilly-fuisse',
  'saint-veran', 'vire-clesse'
];

// Special data for the ones we care about
const specialData = {
  'marsannay': {
    name: 'Marsannay',
    koreanName: '마르사네',
    description: 'The northernmost village of the Côte de Nuits.',
    parcels: [
      {
        id: "les_longeroies",
        name: "Les Longeroies",
        koreanName: "레 롱즈루아",
        type: "Lieu-dit",
        grade: "Village (Premier Cru candidate)",
        description: "A very large vineyard spanning a kilometer from north to south, considered a top candidate for Premier Cru status.",
        metadata: {
          area: "36.00 ha",
          altitude: "275m",
          exposure: "South-East",
          soil: "Premeaux limestone and white oolite with marl"
        }
      },
      {
        id: "clos_du_roy",
        name: "Clos du Roy",
        koreanName: "클로 뒤 루아",
        type: "Lieu-dit",
        grade: "Village (Premier Cru candidate)",
        description: "Located in Chenôve, northernmost lieu-dit in Marsannay.",
        metadata: {
          area: "26.00 ha",
          altitude: "270m",
          exposure: "East-Southeast",
          soil: "Iron-rich gravel on limestone"
        }
      }
    ]
  },
  'santenay': {
    name: 'Santenay',
    koreanName: '상트네',
    description: 'The southern end of the Côte de Beaune.',
    parcels: [
      {
        id: "clos_de_tavannes",
        name: "Clos de Tavannes",
        koreanName: "클로 드 타반",
        type: "Premier Cru",
        grade: "Premier Cru",
        description: "Located at the northern end of Santenay, bordering Chassagne-Montrachet. Known for elegance.",
        metadata: {
          area: "5.30 ha",
          altitude: "240m-250m",
          exposure: "South-East",
          soil: "Marl and clay on Argovian limestone"
        }
      }
    ]
  },
  'chassagne-montrachet': {
    name: 'Chassagne-Montrachet',
    koreanName: '샤샤뉴-몽라셰',
    description: 'Shared home of the Montrachet Grand Cru.',
    parcels: [
      {
        id: "le_montrachet",
        name: "Le Montrachet",
        koreanName: "르 몽라셰",
        type: "Grand Cru",
        grade: "Grand Cru",
        description: "The Chassagne-Montrachet side of the legendary Grand Cru vineyard.",
        metadata: {
          area: "3.99 ha",
          altitude: "250m-270m",
          exposure: "East-Southeast",
          soil: "Brown limestone soils on Bathonian hard limestone"
        }
      }
    ]
  },
  'puligny-montrachet': {
    name: 'Puligny-Montrachet',
    koreanName: '퓰리니-몽라셰',
    description: 'Shared home of the Montrachet Grand Cru.',
    parcels: [
      {
        id: "montrachet",
        name: "Montrachet",
        koreanName: "몽라셰",
        type: "Grand Cru",
        grade: "Grand Cru",
        description: "The Puligny-Montrachet side of the legendary Grand Cru vineyard.",
        metadata: {
          area: "4.01 ha",
          altitude: "250m-270m",
          exposure: "East-Southeast",
          soil: "Brown limestone soils on Bathonian hard limestone"
        }
      }
    ]
  }
};

villages.forEach(id => {
  // JSON
  const data = specialData[id] || {
    id: id,
    name: id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
    koreanName: id, // Placeholder
    parcels: []
  };

  // Ensure ID is set
  data.id = id;

  fs.writeFileSync(path.join(villagesDir, `${id}.json`), JSON.stringify(data, null, 2));

  // SVG
  let svgContent = `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#fcfbf7" />
    <text x="400" y="300" text-anchor="middle" font-size="24" fill="#ccc">${data.name}</text>`;

  if (data.parcels.length > 0) {
    data.parcels.forEach((parcel, index) => {
      // Create a dummy path for the parcel
      // Distribute them nicely
      const x = 200 + (index * 150);
      const y = 200;
      // Simple organic shape
      const d = `M ${x} ${y} q 50 -20 100 0 t 50 50 t -50 50 t -100 0 z`;

      let color = '#DAA520'; // Village
      if (parcel.grade.includes('Premier Cru')) color = '#B8860B';
      if (parcel.grade.includes('Grand Cru')) color = '#8B0000';

      svgContent += `
    <path id="${parcel.id}" data-name="${parcel.name}" d="${d}" fill="${color}" opacity="0.7" stroke="black" stroke-width="1">
      <title>${parcel.name}</title>
    </path>`;
    });
  }

  svgContent += '</svg>';
  fs.writeFileSync(path.join(mapsDir, `${id}.svg`), svgContent);
});

console.log('Files created successfully.');
