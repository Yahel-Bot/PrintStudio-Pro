const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

test('version manifest is synchronized with package.json', () => {
    const pkgPath = path.join(__dirname, '..', 'package.json');
    const versionPath = path.join(__dirname, '..', 'version.json');

    assert.ok(fs.existsSync(pkgPath), 'package.json must exist');
    assert.ok(fs.existsSync(versionPath), 'version.json must exist');

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const manifest = JSON.parse(fs.readFileSync(versionPath, 'utf8'));

    assert.equal(manifest.version, pkg.version, 'version.json version must match package.json version');
    assert.equal(manifest.name, pkg.name, 'version.json name must match package.json name');
    assert.ok(manifest.productName, 'version.json must specify productName');
    assert.ok(manifest.author, 'version.json must specify author');

    // Verify package.json build.files packages version.json
    const buildFiles = pkg.build?.files || [];
    assert.ok(buildFiles.includes('version.json'), 'package.json build.files must include version.json');
});
