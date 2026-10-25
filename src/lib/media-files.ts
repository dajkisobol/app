export type MediaKind = 'ebook' | 'audiobook';
export type DocumentFormat = 'EPUB' | 'PDF' | 'TXT' | 'HTML';
export interface PersonalMedia {
  id: string;
  owner: string;
  bookId: string;
  kind: MediaKind;
  name: string;
  format: string;
  addedAt: number;
  blob: Blob;
}

const databaseName = 'maturyta-personal-library';
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('files', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Prohlížeč nepovolil otevřít úložiště souborů.'));
    request.onblocked = () => reject(new Error('Zavři další karty této aplikace a zkus soubor znovu.'));
  });
}

export function fileFormat(name: string, kind: MediaKind): string {
  const extension = name.split('.').pop()?.toLowerCase() || '';
  const allowed = kind === 'ebook' ? ['epub', 'pdf', 'txt'] : ['mp3', 'm4a', 'ogg', 'opus', 'wav', 'aac', 'm4b'];
  if (!allowed.includes(extension)) throw new Error(kind === 'ebook' ? 'Vyber soubor EPUB, PDF nebo TXT.' : 'Vyber zvukový soubor MP3, M4A, OGG, OPUS, WAV, AAC nebo M4B.');
  return extension.toUpperCase();
}

export async function listPersonalMedia(owner: string, bookId?: string): Promise<PersonalMedia[]> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction('files').objectStore('files').getAll();
      request.onsuccess = () => resolve((request.result as PersonalMedia[]).filter(f => f.owner === owner && (!bookId || f.bookId === bookId)).sort((a, b) => a.name.localeCompare(b.name, 'cs', { numeric: true })));
      request.onerror = () => reject(new Error('Uložené soubory se nepodařilo načíst.'));
    });
  } finally { db.close(); }
}

export async function addPersonalFiles(owner: string, bookId: string, kind: MediaKind, files: File[]): Promise<void> {
  const entries: PersonalMedia[] = files.map(file => {
    const format = fileFormat(file.name, kind);
    if (!file.size || file.size > (kind === 'ebook' ? 50 : 250) * 1024 * 1024) throw new Error(`Soubor ${file.name} je prázdný nebo překračuje limit ${kind === 'ebook' ? 50 : 250} MB.`);
    return { id: crypto.randomUUID(), owner, bookId, kind, name: file.name, format, addedAt: Date.now(), blob: file };
  });
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('files', 'readwrite');
      for (const entry of entries) transaction.objectStore('files').put(entry);
      transaction.oncomplete = () => resolve();
      transaction.onerror = transaction.onabort = () => reject(new Error('Soubor se nepodařilo uložit. Úložiště může být plné nebo blokované prohlížečem.'));
    });
  } finally { db.close(); }
}

export async function removePersonalMedia(id: string, owner: string) {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      const request = store.get(id);
      request.onsuccess = () => { if (request.result?.owner === owner) store.delete(id); };
      tx.oncomplete = () => resolve();
      tx.onerror = tx.onabort = () => reject(new Error('Soubor se nepodařilo odebrat.'));
    });
  } finally { db.close(); }
}
