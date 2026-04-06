// Bottom/API/Hadith/index.ts

export interface Hadith {
  id: number;
  arabic: string;
  transliteration: string;
  translation: string;
  wbw?: string[];
  narrator: string;
}

export interface HadithChapter {
  id: string;
  name: string;
  arabicName?: string;
  hadithRange: string;
  hadithCount: number;
  hadiths: Hadith[];
}

export interface HadithChapterMeta {
  id: string;
  name: string;
  arabicName?: string;
  hadithRange: string;
  hadithCount: number;
}

export interface HadithCollection {
  id: string;
  slug: string;
  name: string;
  arabicName: string;
  author: string;
  hadithCount: number;
  description: string;
}

// Helper to format name from filename
function formatNameFromId(id: string): string {
  return id
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper to format slug from collection name
function formatSlug(name: string): string {
  return name.replace(/\s+/g, '-');
}

// Helper to extract range from hadith numbers
function getHadithRange(hadiths: Hadith[]): string {
  const numbers = hadiths.map(h => h.id);
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  return `${min}-${max}`;
}

// Helper to parse array data into Hadith objects
// New format: [arabic, transliteration, translation, wbw?, narrator, id]
function parseHadithData(data: any[]): Hadith[] {
  return data.map((item: any[], index: number) => {
    // Check if the third element is an array (wbw) or string (translation)
    // New format with transliteration at index 1
    const hasWbw = Array.isArray(item[3]);
    
    if (hasWbw) {
      // Format: [arabic, transliteration, translation, wbw[], narrator, id]
      return {
        id: item[5],
        arabic: item[0],
        transliteration: item[1],
        translation: item[2],
        wbw: item[3],
        narrator: item[4],
      };
    } else {
      // Format without WBW: [arabic, transliteration, translation, narrator, id]
      return {
        id: item[4],
        arabic: item[0],
        transliteration: item[1],
        translation: item[2],
        narrator: item[3],
      };
    }
  });
}

// Dynamically import all JSON files in the al-Bukhari folder
const chapterModules = import.meta.glob('@/Bottom/Data/Hadith/Sahih/al-Bukhari/*.json', { eager: true });

// Build chapters dynamically from file imports
const BUKHARI_CHAPTERS: Record<string, HadithChapter> = {};

for (const [path, module] of Object.entries(chapterModules)) {
  const fileName = path.split('/').pop()?.replace('.json', '') || '';
  const data = (module as { default: any[] }).default;
  const hadiths = parseHadithData(data);
  
  BUKHARI_CHAPTERS[fileName] = {
    id: fileName,
    name: formatNameFromId(fileName),
    hadithRange: getHadithRange(hadiths),
    hadithCount: hadiths.length,
    hadiths,
  };
}

// Collections with slug support
export const hadithCollections: HadithCollection[] = [
  {
    id: "bukhari",
    slug: "Sahih-al-Bukhari",
    name: "Sahih al-Bukhari",
    arabicName: "صحيح البخاري",
    author: "Imam Bukhari",
    hadithCount: 7563,
    description: "The most authentic collection of Hadith compiled by Imam Bukhari",
  },
];

// Get collection by id OR slug
export function getCollection(identifier: string): HadithCollection | null {
  return hadithCollections.find(
    (c) => c.id === identifier || c.slug === identifier
  ) ?? null;
}

// Get chapters by collection (by id or slug)
export function getChaptersByCollection(identifier: string): HadithChapterMeta[] {
  const collection = getCollection(identifier);
  if (!collection || collection.id !== "bukhari") return [];
  
  return Object.values(BUKHARI_CHAPTERS).map(({ id, name, hadithRange, hadithCount }) => ({
    id,
    name,
    hadithRange,
    hadithCount,
  }));
}

// Get single chapter
export function getChapter(collectionIdentifier: string, chapterId: string): HadithChapter | null {
  const collection = getCollection(collectionIdentifier);
  if (!collection || collection.id !== "bukhari") return null;
  
  return BUKHARI_CHAPTERS[chapterId] ?? null;
}

// Get hadiths by chapter
export function getHadithsByChapter(collectionIdentifier: string, chapterId: string): Hadith[] {
  return getChapter(collectionIdentifier, chapterId)?.hadiths ?? [];
}