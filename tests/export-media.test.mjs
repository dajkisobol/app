import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verifyExport } from '../scripts/check-export-media.mjs';

function fixture(config, callback) {
  const root = mkdtempSync(join(tmpdir(), 'maturyta-export-'));
  const out = join(root, 'out');
  mkdirSync(join(out, 'books', 'dante'), { recursive: true });
  const text = Buffer.from('EPUB test fixture');
  const manifest = [{ path: '/books/dante/book.epub', bytes: text.length, sha256: createHash('sha256').update(text).digest('hex'), licensePath: '/books/dante/LICENSE.md' }];
  writeFileSync(join(out, 'books/dante/book.epub'), text);
  writeFileSync(join(out, 'books/dante/LICENSE.md'), 'License fixture');
  const configFile = join(root, 'config.json');
  const manifestFile = join(root, 'media.json');
  writeFileSync(configFile, JSON.stringify({ config }));
  writeFileSync(manifestFile, JSON.stringify(manifest));
  try { callback({ outputDir: out, configFile, manifestFile, expectedBasePath: '/app' }); }
  finally { rmSync(root, { recursive: true, force: true }); }
}

test('exported books and licenses are verified under the actual Pages prefix', () => {
  fixture({ basePath: '/app', env: { NEXT_PUBLIC_BASE_PATH: '/app' } }, options => {
    assert.deepEqual(verifyExport(options), { basePath: '/app', checkedFiles: 2 });
  });
});
test('the generated-config regression fails even when every book exists', () => {
  fixture({ basePath: '/app', env: {} }, options => assert.throws(() => verifyExport(options), /overriding generated next.config.js/));
});
test('an incorrect client prefix fails before the artifact can be published', () => {
  fixture({ basePath: '/app', env: { NEXT_PUBLIC_BASE_PATH: '' } }, options => assert.throws(() => verifyExport(options), /Media base path differs/));
});
test('Pages metadata must match both the router and media prefix', () => {
  fixture({ basePath: '/other', env: { NEXT_PUBLIC_BASE_PATH: '/other' } }, options => assert.throws(() => verifyExport(options), /does not match the Pages path/));
});
test('missing or corrupted files in the final export prevent publication', () => {
  fixture({ basePath: '/app', env: { NEXT_PUBLIC_BASE_PATH: '/app' } }, options => {
    rmSync(join(options.outputDir, 'books/dante/book.epub'));
    assert.throws(() => verifyExport(options), /Missing exported media/);
    writeFileSync(join(options.outputDir, 'books/dante/book.epub'), 'bad file');
    assert.throws(() => verifyExport(options), /wrong size|checksum mismatch/);
  });
});
test('a site at the domain root remains supported', () => {
  fixture({ basePath: '', env: { NEXT_PUBLIC_BASE_PATH: '' } }, options => {
    assert.deepEqual(verifyExport({ ...options, expectedBasePath: '' }), { basePath: '', checkedFiles: 2 });
  });
});
