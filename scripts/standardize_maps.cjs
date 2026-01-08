const fs = require('fs');
const path = require('path');

const mapsDir = path.join(__dirname, '../src/assets/maps');

if (!fs.existsSync(mapsDir)) {
    console.error('Maps directory not found!');
    process.exit(1);
}

const files = fs.readdirSync(mapsDir).filter(file => file.endsWith('.svg'));

let errorCount = 0;

console.log(`Found ${files.length} SVG files. Starting standardization...`);

files.forEach(file => {
    const filePath = path.join(mapsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Linting (Basic XML check)
    if (!content.includes('<svg') || !content.includes('</svg>')) {
        console.error(`[LINT ERROR] ${file}: Invalid SVG structure.`);
        errorCount++;
        return;
    }

    // 2. Standardize viewBox
    // Regex to find viewBox="..." and replace it.
    // If it doesn't exist, we should add it (though in my generated ones it exists).

    const viewBoxRegex = /viewBox="[^"]*"/;
    const targetViewBox = 'viewBox="0 0 800 1000"';

    if (viewBoxRegex.test(content)) {
        content = content.replace(viewBoxRegex, targetViewBox);
    } else {
        // Insert before the first occurrence of > in <svg tag if missing (naive)
        content = content.replace('<svg', `<svg ${targetViewBox}`);
    }

    fs.writeFileSync(filePath, content);
    console.log(`[OK] ${file}: standardized.`);
});

if (errorCount > 0) {
    console.log(`Completed with ${errorCount} errors.`);
    process.exit(1);
} else {
    console.log('All files standardized successfully.');
}
