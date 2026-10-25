import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { unzipSync, strFromU8 } from 'fflate';
import { fileFormat } from '../src/lib/media-files.ts';
import { speechChunks } from '../src/lib/ebook-reader.ts';

const media = JSON.parse(readFileSync(new URL('../src/lib/book-media.json', import.meta.url)));
const rawCatalog = readFileSync(new URL('../src/lib/books_catalog_200.ts', import.meta.url), 'utf8');
const catalog = JSON.parse(rawCatalog.slice(rawCatalog.indexOf('= [') + 2, rawCatalog.lastIndexOf(']') + 1));

test('media belongs to real catalog books; no fabricated availability or demo audio', () => {
  const ids = new Set(catalog.map(b => b.id));
  assert.equal(ids.size, 200);
  assert.equal(new Set(media.map(m => m.id)).size, media.length);
  for (const source of media) {
    assert.ok(ids.has(source.bookId), source.bookId);
    assert.equal(source.language, 'cs');
    assert.ok(source.license && source.licenseUrl && source.verifiedAt && source.sourceUrl);
    assert.ok(source.path.startsWith('/books/'));
    assert.doesNotMatch(JSON.stringify(source), /soundhelix|oceansofpdf|oceanofpdf|\/cz\/katalog-sluzeb\/eknihy\//i);
  }
  assert.doesNotMatch(rawCatalog, /soundhelix|oceansofpdf|\/cz\/katalog-sluzeb\/eknihy\//i);
});

test('every distributed media file and attribution exists and matches its recorded checksum', () => {
  for (const source of media) {
    const path = new URL(`../public${source.path}`, import.meta.url);
    assert.ok(existsSync(path), source.path);
    const bytes = readFileSync(path);
    assert.equal(bytes.length, source.bytes, source.id);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256, source.id);
    const license = readFileSync(new URL(`../public${source.licensePath}`, import.meta.url), 'utf8');
    if (source.format === 'EPUB') {
      assert.match(license, /není vázán autorskými právy/);
      assert.match(license, /by-nc-sa\/3\.0\/cz/);
    } else if (source.format === 'TXT') assert.match(license, /FULL PROJECT GUTENBERG LICENSE/);
    else assert.match(license, /Public Domain Mark/);
  }
});

test('a complete recording includes all declared chapters and real checked MP3 files', () => {
  for (const source of media.filter(m => m.kind === 'audiobook')) {
    assert.equal(source.tracks.length, source.expectedTracks);
    let total = 0;
    for (const track of source.tracks) {
      const data = readFileSync(new URL(`../public${track.url}`, import.meta.url));
      assert.equal(data.length, track.bytes);
      assert.equal(createHash('sha256').update(data).digest('hex'), track.sha256);
      assert.ok(data.subarray(0, 3).toString() === 'ID3' || data[0] === 0xff && (data[1] & 0xe0) === 0xe0);
      assert.ok(track.durationSeconds > 0);
      total += data.length;
    }
    assert.equal(total, source.totalBytes);
    assert.ok(source.durationSeconds > 60);
  }
});

test('every EPUB has a real Czech publication, ordered chapters and readable content', () => {
  for (const source of media.filter(m => m.format === 'EPUB')) {
    const archive = unzipSync(readFileSync(new URL(`../public${source.path}`, import.meta.url)));
    assert.equal(strFromU8(archive.mimetype), 'application/epub+zip');
    const container = strFromU8(archive['META-INF/container.xml']);
    const root = /full-path=["']([^"']+)["']/.exec(container)?.[1];
    assert.ok(root && archive[root], source.id);
    const opf = strFromU8(archive[root]);
    assert.match(opf, /(?:<dc:language[^>]*>cs(?:-CZ)?<\/dc:language>|<language[^>]*>cs<\/language>)/i, source.id);
    assert.match(opf, /<spine[\s>]/, source.id);
    assert.match(opf, /<itemref[\s>]/, source.id);
    const html = Object.entries(archive).filter(([key]) => /\.x?html?$/i.test(key)).map(([, bytes]) => strFromU8(bytes)).join('\n');
    assert.ok(html.length > 1000, source.id);
  }
});

test('personal uploads accept documented formats and reject executable/HTML files', () => {
  assert.equal(fileFormat('Kniha.EPUB', 'ebook'), 'EPUB');
  assert.equal(fileFormat('01 - začátek.mp3', 'audiobook'), 'MP3');
  assert.equal(fileFormat('kapitola.m4b', 'audiobook'), 'M4B');
  assert.throws(() => fileFormat('setup.exe', 'ebook'));
  assert.throws(() => fileFormat('page.html', 'ebook'));
  assert.throws(() => fileFormat('text.pdf', 'audiobook'));
});

test('synthetic speech chunks preserve complete text and bound utterance length', () => {
  const text = 'První věta. Další část knihy pokračuje beze změny.\n'.repeat(250);
  const chunks = speechChunks(text);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every(chunk => chunk.length <= 1401));
  assert.equal(chunks.join(' ').replace(/\s+/g, ' ').trim(), text.replace(/\s+/g, ' ').trim());
  assert.deepEqual(speechChunks(''), []);
  assert.equal(speechChunks('slovo'.repeat(1000)).join(''), 'slovo'.repeat(1000));
});
