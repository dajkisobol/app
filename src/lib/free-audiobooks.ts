/** Konkrétní ověřené katalogové stránky s bezplatným poslechem a stažením.
 * Soubory zůstávají u vydavatele; jazyk vydání je výslovně uveden.
 * Ověřte místní autorská práva před redistribucí.
 */
export const FREE_AUDIOBOOK_LINKS: Record<string, {title:string;url:string;language:string;provider:string}[]> = {
  'shakespeare-romeo-a-julie': [{
    title: 'Romeo and Juliet — úplná audiokniha (anglicky)',
    url: 'https://librivox.org/romeo-and-juliet-by-william-shakespeare/',
    language: 'angličtina',
    provider: 'LibriVox'
  }],
  'wilde-obraz-doriana-graye': [{
    title: 'The Picture of Dorian Gray — úplná audiokniha (anglicky)',
    url: 'https://librivox.org/the-picture-of-dorian-gray-by-oscar-wilde/',
    language: 'angličtina',
    provider: 'LibriVox'
  }]
};
