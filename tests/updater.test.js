const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { compareSemver } = require('../updater');

test('compareSemver accurately compares semantic version strings', () => {
    assert.equal(compareSemver('1.0.4', '1.0.3'), 1, '1.0.4 should be greater than 1.0.3');
    assert.equal(compareSemver('v1.0.4', '1.0.3'), 1, 'v-prefix should be handled correctly');
    assert.equal(compareSemver('1.0.3', '1.0.3'), 0, 'Identical versions should return 0');
    assert.equal(compareSemver('1.0.2', '1.0.3'), -1, '1.0.2 should be less than 1.0.3');
    assert.equal(compareSemver('2.0.0', '1.9.9'), 1, 'Major version bump should be detected');
    assert.equal(compareSemver('1.1.0', '1.0.9'), 1, 'Minor version bump should be detected');
});
