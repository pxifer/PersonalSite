import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const sourcePath = path.join('src', 'assets', 'social-card.svg');
const outputPath = path.join('public', 'social-card.png');
const source = await readFile(sourcePath);
await sharp(source).png({ compressionLevel: 9 }).toFile(outputPath);
console.log(`Generated ${outputPath}`);
