import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mapsDir = path.resolve(__dirname, '../assets/maps');

console.log(`Minifying SVGs in ${mapsDir}...`);

fs.readdir(mapsDir, (err, files) => {
    if (err) {
        console.error("Could not list the directory.", err);
        process.exit(1);
    }

    files.forEach(file => {
        if (path.extname(file) === '.svg') {
            const filePath = path.join(mapsDir, file);
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error reading ${file}:`, err);
                    return;
                }

                // Simple Minification Logic
                const minified = data
                    .replace(/\n/g, '') // Remove newlines
                    .replace(/\s+/g, ' ') // Collapse spaces
                    .replace(/>\s+</g, '><') // Remove spaces between tags
                    .replace(/<!--[\s\S]*?-->/g, ''); // Remove comments

                fs.writeFile(filePath, minified, (err) => {
                    if (err) {
                        console.error(`Error writing ${file}:`, err);
                    } else {
                        console.log(`Minified ${file}`);
                    }
                });
            });
        }
    });
});
