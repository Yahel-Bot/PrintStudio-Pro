const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const startRemoteServer = require('../server');
const uploadFormats = require('../upload_formats.json');

test('QR upload endpoint persists and forwards every advertised file extension', async t => {
    const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'printstudio-mobile-upload-'));
    const uploadDir = path.join(rootDir, 'uploads');
    await fs.mkdir(uploadDir);

    const receivedPaths = [];
    const server = startRemoteServer(
        0,
        uploadDir,
        rootDir,
        filePath => receivedPaths.push(filePath),
        'test-token'
    );

    await new Promise((resolve, reject) => {
        server.once('listening', resolve);
        server.once('error', reject);
    });

    t.after(async () => {
        await new Promise(resolve => server.close(resolve));
        await fs.rm(rootDir, { recursive: true, force: true });
    });

    const port = server.address().port;
    const extensions = [...uploadFormats.documents, ...uploadFormats.images];
    for (let offset = 0; offset < extensions.length; offset += 20) {
        const formData = new FormData();
        for (const extension of extensions.slice(offset, offset + 20)) {
            formData.append('files', new Blob(['upload test']), `sample.${extension}`);
        }

        const response = await fetch(`http://127.0.0.1:${port}/upload/test-token`, {
            method: 'POST',
            body: formData
        });
        assert.equal(response.status, 200);
        assert.match(await response.text(), /La aplicación los está procesando/);
    }

    assert.equal(receivedPaths.length, extensions.length);
    for (const filePath of receivedPaths) {
        assert.ok(await fs.stat(filePath));
    }

    const unsupportedForm = new FormData();
    unsupportedForm.append(
        'files',
        new Blob(['not supported'], { type: 'image/png' }),
        'sample.unsupported'
    );
    const unsupportedResponse = await fetch(`http://127.0.0.1:${port}/upload/test-token`, {
        method: 'POST',
        body: unsupportedForm
    });
    assert.equal(unsupportedResponse.status, 400);
    assert.match(await unsupportedResponse.text(), /Tipo de archivo no permitido/);
});
