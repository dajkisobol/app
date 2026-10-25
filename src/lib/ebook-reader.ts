import { unzipSync, strFromU8 } from 'fflate';

export interface BookChapter { title: string; text: string }

function plainText(html: string) {
  const document = new DOMParser().parseFromString(html, 'text/html');
  document.querySelectorAll('script,style,iframe,object,embed,svg,form,nav').forEach(node => node.remove());
  document.querySelectorAll('br').forEach(node => node.replaceWith('\n'));
  document.querySelectorAll('p,div,section,h1,h2,h3,h4,h5,h6,li,blockquote,tr').forEach(node => node.append('\n\n'));
  return { title: document.body.querySelector('h1,h2,h3')?.textContent?.trim() || document.title, text: (document.body.textContent || '').replace(/\n[ \t]+/g, '\n').replace(/\n{4,}/g, '\n\n\n').trim() };
}

export function readHtml(html: string): BookChapter[] {
  const chapter = plainText(html);
  return [{ ...chapter, title: chapter.title || 'Celá kniha' }];
}

export function readEpub(data: Uint8Array): BookChapter[] {
  if (data.length > 50 * 1024 * 1024) throw new Error('EPUB překračuje limit 50 MB.');
  let total = 0;
  let count = 0;
  const entries = unzipSync(data, { filter(file) {
    if (++count > 3000) throw new Error('EPUB obsahuje příliš mnoho souborů.');
    if (!/\.(opf|xml|xhtml|html|htm)$/i.test(file.name)) return false;
    total += file.originalSize;
    if (file.originalSize > 5 * 1024 * 1024 || total > 30 * 1024 * 1024) throw new Error('Textová část EPUB překračuje bezpečný limit velikosti.');
    return true;
  } });
  const container = entries['META-INF/container.xml'];
  if (!container) throw new Error('Soubor neobsahuje platný EPUB kontejner.');
  const parser = new DOMParser();
  const root = parser.parseFromString(strFromU8(container), 'application/xml').querySelector('rootfile')?.getAttribute('full-path');
  if (!root || !entries[root]) throw new Error('V EPUB chybí popis knihy.');
  const opf = parser.parseFromString(strFromU8(entries[root]), 'application/xml');
  const encryption = entries['META-INF/encryption.xml'];
  if (encryption) {
    const encrypted = parser.parseFromString(strFromU8(encryption), 'application/xml');
    if ([...encrypted.querySelectorAll('CipherReference')].some(node => /\.(xhtml|html|htm|opf)$/i.test(node.getAttribute('URI') || ''))) {
      throw new Error('Tento EPUB chrání text pomocí DRM. Otevři jej v autorizované čtečce poskytovatele.');
    }
  }
  const manifest = new Map([...opf.querySelectorAll('manifest > item')].map(item => [item.getAttribute('id'), item.getAttribute('href')]));
  const directory = root.includes('/') ? root.slice(0, root.lastIndexOf('/') + 1) : '';
  const chapters: BookChapter[] = [];
  for (const reference of opf.querySelectorAll('spine > itemref')) {
    const href = manifest.get(reference.getAttribute('idref'));
    if (!href) continue;
    const path = new URL(href.split('#')[0], `https://epub.invalid/${directory}`).pathname.slice(1);
    const content = entries[decodeURIComponent(path)];
    if (!content) throw new Error('V EPUB chybí jedna z kapitol. Kniha může být poškozená nebo chráněná DRM.');
    const chapter = plainText(strFromU8(content));
    if (chapter.text) chapters.push({ ...chapter, title: chapter.title || `Část ${chapters.length + 1}` });
  }
  if (!chapters.length) throw new Error('V EPUB není čitelný text. Soubor může používat DRM nebo obsahovat jen obrázky.');
  return chapters;
}

/** Chunk on sentence/word boundaries: browsers often stop very long utterances. */
export function speechChunks(text: string): string[] {
  const chunks: string[] = [];
  let rest = text.trim();
  while (rest) {
    let end = Math.min(1400, rest.length);
    if (end < rest.length) {
      const punctuation = Math.max(rest.lastIndexOf('. ', end), rest.lastIndexOf('\n', end), rest.lastIndexOf('! ', end), rest.lastIndexOf('? ', end));
      const space = rest.lastIndexOf(' ', end);
      if (punctuation > 700) end = punctuation + 1;
      else if (space > 0) end = space;
    }
    chunks.push(rest.slice(0, end)); rest = rest.slice(end).trimStart();
  }
  return chunks;
}
