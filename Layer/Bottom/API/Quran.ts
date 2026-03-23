export type QuranFontType = "Standard" | "V1" | "V2";

export interface SurahData {
  ID: number;
  Ayah: string[];
}

export interface TranslationData {
  ID: number;
  Ayah: { Kalima: string[] }[];
}

export interface SurahLayout {
  Standard?: string[][];
  V1?: string[][];
  V2?: string[][];
}

export interface AssembledVerse {
  verseNumber: number;
  arabic: string;
  words: string[];
  translation?: string;
  wbwTranslation?: string[];
}

export interface AssembledSurah {
  id: number;
  verses: AssembledVerse[];
  lines?: string[][];
}

export interface SurahMeta {
  id: number;
  name: string;
  surahFontName: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
  revelationOrder: number;
  pages: [number, number];
}

export interface JuzInfo {
  juzNumber: number;
  surahs: { id: number; startVerse?: number; endVerse?: number }[];
}

export type TranslationSource = string;

// ============= Static Metadata =============

export const surahList: SurahMeta[] = [
  { id: 1,   name: "الفاتحة",   surahFontName: "001", englishName: "Al-Fatihah",   englishNameTranslation: "The Opener",     numberOfAyahs: 7,  revelationType: "Meccan",  revelationOrder: 5,   pages: [1, 1] },
  { id: 112, name: "الإخلاص",   surahFontName: "112", englishName: "Al-Ikhlas",    englishNameTranslation: "The Sincerity",  numberOfAyahs: 4,  revelationType: "Meccan",  revelationOrder: 22,  pages: [604, 604] },
  { id: 113, name: "الفلق",     surahFontName: "113", englishName: "Al-Falaq",     englishNameTranslation: "The Daybreak",   numberOfAyahs: 5,  revelationType: "Meccan",  revelationOrder: 20,  pages: [604, 604] },
  { id: 114, name: "الناس",     surahFontName: "114", englishName: "An-Nas",       englishNameTranslation: "Mankind",        numberOfAyahs: 6,  revelationType: "Meccan",  revelationOrder: 21,  pages: [604, 604] },
];

export const juzData: JuzInfo[] = [
  { juzNumber: 1,  surahs: [{ id: 1 }, { id: 2, startVerse: 1, endVerse: 141 }] },
  { juzNumber: 30, surahs: [{ id: 110 }, { id: 111 }, { id: 112 }, { id: 113 }, { id: 114 }] },
];

export const revelationOrder: number[] = [
  96, 68, 73, 74, 1, 111, 81, 87, 92, 89, 93, 94, 103, 100, 108, 102, 107, 109, 105, 113,
  114, 112, 53, 80, 97, 91, 85, 95, 106, 101, 75, 104, 77, 50, 90, 86, 54, 38, 7, 72,
  36, 25, 35, 19, 20, 56, 26, 27, 28, 17, 10, 11, 12, 15, 6, 37, 31, 34, 39, 40,
  41, 42, 43, 44, 45, 46, 51, 88, 18, 16, 71, 14, 21, 23, 32, 52, 67, 69, 70, 78,
  79, 82, 84, 30, 29, 83, 2, 8, 3, 33, 60, 4, 99, 57, 47, 13, 55, 76, 65, 98,
  59, 24, 22, 63, 58, 49, 66, 64, 61, 62, 48, 5, 9, 110,
];

// ============= Cache =============

const cache = {
  surah:       new Map<string, SurahData>(),
  translation: new Map<string, TranslationData>(),
  layout:      new Map<number, SurahLayout | null>(),
};

// ============= Glob Audio Modules =============
// @ resolves to ./Layer per vite.config.ts, so glob patterns use @ alias.
// The runtime lookup keys must match the resolved pattern exactly —
// Vite expands @ to the absolute path when building the glob map, so we
// reconstruct the same key using import.meta.glob on the same alias.

const surahAudioModules = import.meta.glob(
  '@/Bottom/Data/Quran/Qiraat/*/Surah/*/Audio.mp3',
  { query: '?url', import: 'default', eager: false }
);

const pageAudioModules = import.meta.glob(
  '@/Bottom/Data/Quran/Qiraat/*/Page/*/Audio.mp3',
  { query: '?url', import: 'default', eager: false }
);

const ayahAudioModules = import.meta.glob(
  '@/Bottom/Data/Quran/Qiraat/*/Surah/*/Ayah/*/Audio.mp3',
  { query: '?url', import: 'default', eager: false }
);

const wordAudioModules = import.meta.glob(
  '@/Bottom/Data/Quran/Qiraat/Tafsir_Center/Surah/*/Ayah/*/Kalima/*/Audio.mp3',
  { query: '?url', import: 'default', eager: false }
);

// ============= Audio key helper =============
// Vite resolves the @ alias to an absolute path when it builds the glob map.
// We need to match that exact key format at runtime.
// import.meta.glob keys always use the resolved absolute path, e.g.:
//   /absolute/path/to/Layer/Bottom/Data/Quran/Qiraat/...
// We derive the base by stripping the known suffix from any existing key,
// then use that base to construct lookup keys dynamically.

function resolveGlobBase(
  modules: Record<string, unknown>,
  marker: string,
): string {
  const anyKey = Object.keys(modules)[0];
  if (!anyKey) return "";
  const idx = anyKey.indexOf(marker);
  return idx !== -1 ? anyKey.slice(0, idx) : "";
}

const surahAudioBase  = resolveGlobBase(surahAudioModules,  "/Bottom/Data/Quran/Qiraat/");
const pageAudioBase   = resolveGlobBase(pageAudioModules,   "/Bottom/Data/Quran/Qiraat/");
const ayahAudioBase   = resolveGlobBase(ayahAudioModules,   "/Bottom/Data/Quran/Qiraat/");
const wordAudioBase   = resolveGlobBase(wordAudioModules,   "/Bottom/Data/Quran/Qiraat/");

// ============= Loaders =============

async function loadSurah(surahId: number, fontType: QuranFontType = "Standard"): Promise<SurahData> {
  const key = `${fontType}-${surahId}`;
  if (cache.surah.has(key)) return cache.surah.get(key)!;

  let data: SurahData;
  switch (fontType) {
    case "V1":
      data = await import(`@/Bottom/Data/Quran/Surah/Glyph-Encoded/Positional-Forms/${surahId}.json`);
      break;
    case "V2":
      data = await import(`@/Bottom/Data/Quran/Surah/Glyph-Encoded/Ligatures/${surahId}.json`);
      break;
    default:
      data = await import(`@/Bottom/Data/Quran/Surah/${surahId}.json`);
      break;
  }
  cache.surah.set(key, data);
  return data;
}

async function loadTranslation(surahId: number, source: TranslationSource): Promise<TranslationData | null> {
  const key = `${source}-${surahId}`;
  if (cache.translation.has(key)) return cache.translation.get(key)!;
  try {
    const module = await import(`@/Bottom/Data/Quran/Surah/Translation/${source}/${surahId}.json`);
    const data: TranslationData = module.default ?? module;
    cache.translation.set(key, data);
    return data;
  } catch {
    return null;
  }
}

async function loadLayout(surahId: number): Promise<SurahLayout | null> {
  if (cache.layout.has(surahId)) return cache.layout.get(surahId)!;
  try {
    const module = await import(`@/Bottom/Data/Quran/Surah/Layout/${surahId}.json`);
    const data: SurahLayout = module.default ?? module;
    cache.layout.set(surahId, data);
    return data;
  } catch {
    cache.layout.set(surahId, null);
    return null;
  }
}

// ============= Audio =============

export async function getSurahAudioUrl(surahId: number, reciter: string): Promise<string | null> {
  const key = `${surahAudioBase}/Bottom/Data/Quran/Qiraat/${reciter}/Surah/${surahId}/Audio.mp3`;
  const mod = surahAudioModules[key];
  if (!mod) return null;
  return (await (mod as () => Promise<string>)());
}

export async function getPageAudioUrl(pageNumber: number, reciter: string): Promise<string | null> {
  const key = `${pageAudioBase}/Bottom/Data/Quran/Qiraat/${reciter}/Page/${pageNumber}/Audio.mp3`;
  const mod = pageAudioModules[key];
  if (!mod) return null;
  return (await (mod as () => Promise<string>)());
}

export async function getAyahAudioUrl(surahId: number, ayahNumber: number, reciter: string): Promise<string | null> {
  const key = `${ayahAudioBase}/Bottom/Data/Quran/Qiraat/${reciter}/Surah/${surahId}/Ayah/${ayahNumber}/Audio.mp3`;
  const mod = ayahAudioModules[key];
  if (!mod) return null;
  return (await (mod as () => Promise<string>)());
}

export async function getWordAudioUrl(surahId: number, ayahNumber: number, kalimaNumber: number): Promise<string | null> {
  const key = `${wordAudioBase}/Bottom/Data/Quran/Qiraat/Tafsir_Center/Surah/${surahId}/Ayah/${ayahNumber}/Kalima/${kalimaNumber}/Audio.mp3`;
  const mod = wordAudioModules[key];
  if (!mod) return null;
  return (await (mod as () => Promise<string>)());
}

// ============= Main API =============

export async function getSurah(
  surahId: number,
  options: {
    translation?: TranslationSource;
    wbw?: boolean;
    fontType?: QuranFontType;
  } = {}
): Promise<AssembledSurah> {
  const fontType = options.fontType ?? "Standard";

  const [surahData, translationData, layoutData] = await Promise.all([
    loadSurah(surahId, fontType),
    options.translation || options.wbw
      ? loadTranslation(surahId, options.translation ?? "Direct")
      : Promise.resolve(null),
    loadLayout(surahId),
  ]);

  const verses: AssembledVerse[] = surahData.Ayah.map((arabic, index) => {
    const kalima = translationData?.Ayah[index]?.Kalima;
    return {
      verseNumber: index + 1,
      arabic,
      words: arabic.split(" "),
      ...(kalima && options.translation && { translation: kalima.join(" ") }),
      ...(kalima && options.wbw && { wbwTranslation: kalima }),
    };
  });

  const lines = layoutData?.[fontType] ?? undefined;

  return { id: surahId, verses, lines };
}

export async function getVerse(
  surahId: number,
  verseNumber: number,
  options: {
    translation?: TranslationSource;
    wbw?: boolean;
    fontType?: QuranFontType;
  } = {}
): Promise<AssembledVerse | null> {
  const surah = await getSurah(surahId, options);
  return surah.verses[verseNumber - 1] ?? null;
}

export function getSurahMeta(surahId: number): SurahMeta | null {
  return surahList.find((s) => s.id === surahId) ?? null;
}

export function getJuzInfo(juzNumber: number): JuzInfo | null {
  return juzData.find((j) => j.juzNumber === juzNumber) ?? null;
}

export function getSurahsByRevelationOrder(): SurahMeta[] {
  return [...surahList].sort((a, b) => a.revelationOrder - b.revelationOrder);
}