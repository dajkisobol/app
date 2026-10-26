/** Verified publication metadata; a catalogue entry is NOT a free audio download. */
export const AUDIOBOOK_PUBLICATIONS: Record<string, { title: string; provider: string; url: string; availability: 'paid' | 'free' | 'sample'; note: string }[]> = {
  'rolland-petr-a-lucie': [{
    title: 'Petr a Lucie (česká audiokniha, 2024)',
    provider: 'VOXI / katalog Naposlech.cz',
    url: 'https://naposlech.cz/audiokniha/petr-a-lucie/',
    availability: 'paid',
    note: 'Interpret Šimon Krupa, délka 2 h 42 min. Naposlech nabízí informaci o vydání a možnost koupě, nikoli legální stažení celé nahrávky zdarma.'
  }]
};
