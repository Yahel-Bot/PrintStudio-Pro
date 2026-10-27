const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const bmp = require('bmp-js');
const sharp = require('sharp');
const uploadFormats = require('../upload_formats.json');
const normalizeImageForAnalysis = require('../image_normalizer');

test('mobile image formats all have an analysis path', () => {
    const directSharpFormats = new Set(
        Object.values(sharp.format)
            .filter(format => format.input.file)
            .flatMap(format => format.input.fileSuffix)
            .map(extension => extension.slice(1))
    );
    const normalizedFormats = new Set(['bmp', 'heic', 'heif']);

    for (const extension of uploadFormats.images) {
        assert.ok(
            directSharpFormats.has(extension) || normalizedFormats.has(extension),
            `No image analysis path is configured for .${extension}`
        );
    }
});

test('BMP uploads are normalized to a visible PNG for analysis', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'printstudio-upload-'));
    try {
        const bmpPath = path.join(tempDir, 'red.bmp');
        const bmpBuffer = bmp.encode({
            data: Buffer.from([255, 0, 0, 255]),
            width: 1,
            height: 1
        }).data;
        await fs.writeFile(bmpPath, bmpBuffer);

        const normalizedPath = await normalizeImageForAnalysis(bmpPath, tempDir);
        const { data, info } = await sharp(normalizedPath)
            .raw()
            .toBuffer({ resolveWithObject: true });

        assert.notEqual(normalizedPath, bmpPath);
        assert.deepEqual([info.width, info.height, info.channels], [1, 1, 3]);
        assert.deepEqual([...data], [255, 0, 0]);
    } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
    }
});

test('supported non-normalized images pass through unchanged', async () => {
    const imagePath = path.join(os.tmpdir(), 'sample.png');
    assert.equal(
        await normalizeImageForAnalysis(imagePath, os.tmpdir()),
        imagePath
    );
});
