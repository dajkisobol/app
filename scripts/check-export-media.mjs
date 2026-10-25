import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Check what will be deployed, not just the files in public/. */
export function verifyExport({
  outputDir = 'out',
  configFile = '.next/required-server-files.json',
  manifestFile = 'src/lib/book-media.json',
  expectedBasePath = process.env.NEXT_PUBLIC_BASE_PATH,
} = {}) {
  const { config } = JSON.parse(readFileSync(configFile, 'utf8'));
  if (typeof config?.basePath !== 'string') throw new Error('The compiled Next.js basePath is missing.');
  if (config.env?.NEXT_PUBLIC_BASE_PATH !== config.basePath) {
    throw new Error('Media base path differs from Next.js basePath. Check for an overriding generated next.config.js; the Pages action must not overwrite next.config.ts.');
  }
  if (expectedBasePath !== undefined && config.basePath !== expectedBasePath) {
    throw new Error(`Compiled basePath ${JSON.stringify(config.basePath)} does not match the Pages path ${JSON.stringify(expectedBasePath)}.`);
  }
  const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
  const files = new Map();
  for (const asset of manifest) {
    files.set(asset.path, { sha256: asset.sha256, bytes: asset.bytes });
    if (asset.licensePath) files.set(asset.licensePath, {});
    for (const track of asset.tracks || []) files.set(track.url, { sha256: track.sha256, bytes: track.bytes });
  }
  const root = resolve(outputDir);
  for (const [url, metadata] of files) {
    if (!url.startsWith('/') || url.startsWith('//')) throw new Error(`Expected a local media path: ${url}`);
    const file = resolve(root, url.slice(1));
    const pathFromRoot = relative(root, file);
    if (pathFromRoot === '..' || pathFromRoot.startsWith(`..${sep}`)) throw new Error(`Media path escapes the export: ${url}`);
    let bytes;
    try {
      if (!statSync(file).isFile()) throw new Error('not a file');
      bytes = readFileSync(file);
    } catch { throw new Error(`Missing exported media file: ${url}`); }
    if (metadata.bytes !== undefined && bytes.length !== metadata.bytes) throw new Error(`Exported file has the wrong size: ${url}`);
    if (metadata.sha256 && createHash('sha256').update(bytes).digest('hex') !== metadata.sha256) throw new Error(`Exported file checksum mismatch: ${url}`);
  }
  return { basePath: config.basePath, checkedFiles: files.size };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = verifyExport();
    console.log(`Export verified: ${result.checkedFiles} media/license files, public prefix ${JSON.stringify(result.basePath)}.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
