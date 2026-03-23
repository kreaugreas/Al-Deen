import revelationData from "@/Bottom/Data/Hadith/Sahih/al-Bukhari/Revelation.json";
import beliefData from "@/Bottom/Data/Hadith/Sahih/al-Bukhari/Belief.json";

export interface Hadith {
  id: number;
  arabic: string;
  transliteration?: string;
  translation: string;
  narrator: string;
  reference: string;
  grade: string;
}

export interface HadithChapter {
  id: string;
  name: string;
  arabicName: string;
  hadithRange: string;
  hadithCount: number;
  hadiths: Hadith[];
}

// Lightweight metadata for listings — no hadiths array
export interface HadithChapterMeta {
  id: string;
  name: string;
  arabicName: string;
  hadithRange: string;
  hadithCount: number;
}

export interface HadithCollection {
  id: string;
  name: string;
  arabicName: string;
  author: string;
  hadithCount: number;
  description: string;
}

// Only Bukhari is supported for now
export const hadithCollections: HadithCollection[] = [
  {
    id: "bukhari",
    name: "Sahih al-Bukhari",
    arabicName: "صحيح البخاري",
    author: "Imam Bukhari",
    hadithCount: 7563,
    description: "The most authentic collection of Hadith compiled by Imam Bukhari",
  },
];

// Chapter map — add new imports and entries here as chapters are added
const BUKHARI_CHAPTERS: Record<string, HadithChapter> = {
  revelation: revelationData as HadithChapter,
  belief: beliefData as HadithChapter,
};

export function getCollection(collectionId: string): HadithCollection | null {
  return hadithCollections.find((c) => c.id === collectionId) ?? null;
}

export function getChaptersByCollection(collectionId: string): HadithChapterMeta[] {
  if (collectionId !== "bukhari") return [];
  return Object.values(BUKHARI_CHAPTERS).map(({ id, name, arabicName, hadithRange, hadithCount }) => ({
    id,
    name,
    arabicName,
    hadithRange,
    hadithCount,
  }));
}

export function getChapter(collectionId: string, chapterId: string): HadithChapter | null {
  if (collectionId !== "bukhari") return null;
  return BUKHARI_CHAPTERS[chapterId.toLowerCase()] ?? null;
}

export function getHadithsByChapter(collectionId: string, chapterId: string): Hadith[] {
  return getChapter(collectionId, chapterId)?.hadiths ?? [];
}