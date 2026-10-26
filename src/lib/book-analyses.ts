import type { BookAnalysis } from './data';

/**
 * Vlastní maturitní poznámky. Vybraná fakta byla porovnána s články
 * rozbor-dila.cz; nejde o kopie jejich autorských rozborů.
 * Ke každému rozboru uvádíme adresu použitého zdroje.
 */
export interface ExtendedBookAnalysis {
  literaryType: string;
  composition: string;
  narrator: string;
  mainIdea: string;
  historicalContext: string;
  characterAnalysis: string;
  detailedPlot: string;
  sourceUrl: string;
}

export const EXTENDED_BOOK_ANALYSES: Record<string, ExtendedBookAnalysis> = {
  'shakespeare-romeo-a-julie': {
    literaryType: 'Drama – milostná tragédie. Hra kombinuje veršované a prozaické promluvy.',
    composition: 'Chronologický děj s prologem a pěti dějstvími. Události postupně gradují od setkání milenců až k tragickému nedorozumění v hrobce.',
    narrator: 'Jako drama nemá klasického vypravěče. Příběh poznáváme z dialogů, monologů a scénických poznámek; prolog uvádí chór.',
    mainIdea: 'Nenávist mezi rodinami ničí životy jejich dětí. Tragédie zdůrazňuje osobní volbu, sílu lásky a cenu předsudků.',
    historicalContext: 'Anglická renesance a alžbětinské divadlo. Shakespeare rozvíjí starší evropský příběh o milencích ze znepřátelených rodů.',
    characterAnalysis: 'Romeo je citlivý, prudký a idealistický; Julie postupně prokazuje vlastní odvahu a rozhodnost. Merkucio přináší slovní vtip, Tybalt představuje rodovou nenávist, bratr Vavřinec usiluje o smír.',
    detailedPlot: 'Romeo z rodu Monteků a Julie z rodu Kapuletů se zamilují na plese a tajně se vezmou. Po smrti Merkucia Romeo zabije Tybalta a musí odejít z Verony. Julie má být provdána za Parida, proto s pomocí bratra Vavřince předstírá smrt. Zpráva o plánu se k Romeovi nedostane: v hrobce vypije jed a Julie se po probuzení probodne. Smrt obou přiměje rodiny k usmíření.',
    sourceUrl: 'https://rozbor-dila.cz/romeo-a-julie-rozbor-dila-k-maturite/'
  },
  'moliere-lakomec': {
    literaryType: 'Drama – satirická charakterová komedie, jejímž ústředním terčem je lakomství.',
    composition: 'Pět dějství, převážně chronologické vyprávění, jednotné prostředí a soustředěná zápletka. Komiku vytvářejí záměny, nedorozumění a střet rodičovské moci s láskou.',
    narrator: 'Dramatický text bez vypravěče. Charakter postav poznáváme především z dialogů, monologů a jednání na scéně.',
    mainIdea: 'Posedlost majetkem rozkládá důvěru a rodinné vztahy; peníze pro Harpagona převáží i nad štěstím vlastních dětí.',
    historicalContext: 'Francouzský klasicismus 17. století, divadlo Ludvíka XIV. Molière navazuje také na tradici antické komedie.',
    characterAnalysis: 'Harpagon je podezíravý a chorobně šetrný otec. Kleant miluje Marianu, Eliška Valéra. Děti usilují o právo rozhodovat o sňatku navzdory otcovým majetkovým plánům.',
    detailedPlot: 'Harpagon chce výhodně provdat dceru Elišku a sám se oženit s Marianou, kterou miluje jeho syn Kleant. Jeho domácnost ovládá strach z výdajů a ze ztráty ukrytých peněz. Po zmizení pokladničky Harpagon všechny podezírá. Nakonec se vyjasní rodinné vztahy mladých postav a připraví jejich sňatky; Harpagon se uklidní především tehdy, když získá zpět své peníze.',
    sourceUrl: 'https://rozbor-dila.cz/lakomec-rozbor-dila-k-maturite-10/'
  },
  'erben-kytice': {
    literaryType: 'Poezie – lyrickoepická sbírka třinácti básní s převahou baladických příběhů.',
    composition: 'Samostatné balady spojují motivy viny, osudu, mateřství a nadpřirozena. Kompozice sbírky využívá tematické protějšky a rámcové básně.',
    narrator: 'V jednotlivých baladách promlouvá básnický vypravěč a mnoho prostoru dostávají přímé řeči postav. Nejde o jednotného vypravěče celé sbírky.',
    mainIdea: 'Porušení základních lidských a mravních vazeb mívá tragické následky; důležité jsou odpovědnost, mateřská láska, pokání a odpuštění.',
    historicalContext: 'Česká literatura 19. století, romantismus a doznívající národní obrození. Erben vychází z lidových pověstí, mýtů a folkloru.',
    characterAnalysis: 'Postavy se v básních mění: často jde o matky, děti, milence nebo bytosti z lidových představ (Vodník, Polednice). Jejich rozhodnutí vedou k morálním konfliktům.',
    detailedPlot: 'Sbírka nevypráví jediný souvislý příběh. V Polednici přivolá rozhněvaná matka hrozivou bytost a v panice dítě udusí. Ve Vodníkovi porušení slibu vyústí ve smrt dítěte. Poklad varuje před zaslepeností bohatstvím. Svatební košile líčí nebezpečnou cestu dívky s mrtvým milým. Jednotlivé balady ukazují střet člověka s vinou, osudem a nadpřirozenými silami.',
    sourceUrl: 'https://rozbor-dila.cz/kytice-rozbor-dila-k-maturite-2/'
  }
};

/** Vrátí rozšíření pouze tehdy, pokud existuje konkrétní ověřený záznam. */
export function getExtendedAnalysis(book: Pick<BookAnalysis, 'id'>): ExtendedBookAnalysis | undefined {
  return EXTENDED_BOOK_ANALYSES[book.id];
}
