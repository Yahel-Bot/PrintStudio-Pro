const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bmp = require('bmp-js');
const convertHeic = require('heic-convert');
const sharp = require('sharp');

async function normalizeImageForAnalysis(filePath, tempDir) {
    const extension = path.extname(filePath).toLowerCase();
    if (!['.bmp', '.heic', '.heif'].includes(extension)) {
        return filePath;
    }

    const outputPath = path.join(tempDir, `img_${Date.now()}_${crypto.randomBytes(5).toString('hex')}.png`);

    if (extension === '.heic' || extension === '.heif') {
        const pngBuffer = await convertHeic({
            buffer: await fs.promises.readFile(filePath),
            format: 'PNG'
        });
        await fs.promises.writeFile(outputPath, pngBuffer);
        return outputPath;
    }

    const { data, width, height } = bmp.decode(fs.readFileSync(filePath));
    if (!width || !height || data.length !== width * height * 4) {
        throw new Error('El archivo BMP tiene dimensiones o datos inválidos.');
    }

    const rgb = Buffer.allocUnsafe(width * height * 3);
    for (let source = 0, target = 0; source < data.length; source += 4, target += 3) {
        rgb[target] = data[source + 3];
        rgb[target + 1] = data[source + 2];
        rgb[target + 2] = data[source + 1];
    }

    await sharp(rgb, { raw: { width, height, channels: 3 } }).png().toFile(outputPath);
    return outputPath;
}

module.exports = normalizeImageForAnalysis;
