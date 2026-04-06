// ============= Vite / Next.js (Turbopack) =============
const duaModules = import.meta.glob<{ default: string[][] }>(
  "@/Bottom/Data/Aid/Dua/*.json",
  { eager: true }
);

const tajweedModules = import.meta.glob<{ default: TajweedCategory }>(
  "@/Bottom/Data/Aid/Tajweed/**/*.json",
  { eager: true }
);

import alphabetData from "@/Bottom/Data/Aid/Alphabet/Letter.json";
import { nanoid } from 'nanoid';

// ============= Tajweed Types =============

export interface TajweedRule {
  letter: string;
  transliteration: string;
  description: string;
  example: string;
  exampleTranslation: string;
}

export interface TajweedSubcategory {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  rules: TajweedRule[];
}

export interface TajweedCategoryIntro {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  icon: string;
  color: string;
  subcategories: string[];
}

export interface TajweedCategory {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  icon: string;
  color: string;
  subcategories: TajweedSubcategory[];
}

// ============= Alphabet Types =============

export interface LetterForms {
  isolated: string;
  initial: string;
  medial: string;
  final: string;
}

export interface Letter {
  id: string;
  name: string;
  arabicName: string;
  forms: LetterForms;
  pronunciation: string;
  example: string;
  exampleTranslation: string;
}

// ============= Dua Types =============

export interface DuaItem {
  arabic: string;
  translation: string;
  reference: string;
  audioUrl?: string;
}

export interface DuaCategory {
  name: string;
  duas: DuaItem[];
}

// ============= Helper Functions =============

function formatNameFromId(filename: string): string {
  return filename
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ============= Tajweed Data =============
// Loads all JSON files across all Tajweed subfolders.
// Introduction.json files (subcategories: string[]) are used as category
// metadata; rule files (subcategories absent, rules present) are subcategories.

const tajweedIntros: TajweedCategoryIntro[] = [];
const tajweedSubcategories: TajweedSubcategory[] = [];

for (const mod of Object.values(tajweedModules)) {
  const data = mod.default as any;
  if (Array.isArray(data.subcategories) && typeof data.subcategories[0] === "string") {
    tajweedIntros.push(data as TajweedCategoryIntro);
  } else if (Array.isArray(data.rules)) {
    tajweedSubcategories.push(data as TajweedSubcategory);
  }
}

const tajweedCategories: TajweedCategory[] = tajweedIntros.map((intro) => ({
  ...intro,
  subcategories: intro.subcategories
    .map((subId) => tajweedSubcategories.find((s) => s.id === subId))
    .filter((s): s is TajweedSubcategory => s !== undefined),
}));

// ============= Dua Data =============
// Automatically loads every *.json file inside the Dua folder.
// Each file should contain an array of arrays: [[arabic, translation, reference], ...]

const duaCategories: DuaCategory[] = Object.entries(duaModules).map(
  ([path, mod]) => {
    const filename = path.split("/").pop()?.replace(".json", "") || "";
    const duasArray = mod.default;
    
    // Validate format
    if (!Array.isArray(duasArray) || (duasArray.length > 0 && !Array.isArray(duasArray[0]))) {
      console.error(`Invalid format in ${filename}. Expected array of arrays.`);
      return {
        name: formatNameFromId(filename),
        duas: [],
      };
    }
    
    return {
  name: formatNameFromId(filename),
  duas: duasArray.map((dua: string[]) => ({
    id: nanoid(),
    arabic: dua[0],
    translation: dua[1],
    reference: dua[2],
  })),
};
  }
);

// ============= Tajweed API =============

export function getTajweedCategories(): TajweedCategory[] {
  return tajweedCategories;
}

export function getTajweedCategory(id: string): TajweedCategory | undefined {
  return tajweedCategories.find((c) => c.id === id);
}

export function getTajweedSubcategory(
  categoryId: string,
  subcategoryId: string
): TajweedSubcategory | undefined {
  const category = getTajweedCategory(categoryId);
  return category?.subcategories.find((s) => s.id === subcategoryId);
}

// ============= Alphabet API =============

const letters = alphabetData as Letter[];

export function getLetters(): Letter[] {
  return letters;
}

export function getLetter(id: string): Letter | null {
  return letters.find((l) => l.id === id) ?? null;
}

// ============= Dua API =============

export { duaCategories };

export function getDuaCategory(categoryName: string): DuaCategory | null {
  return duaCategories.find((c) => c.name === categoryName) ?? null;
}

export function getAllDuaCategories(): DuaCategory[] {
  return duaCategories;
}

export function searchDuas(query: string): (DuaItem & { categoryName: string; duaIndex: number })[] {
  const lower = query.toLowerCase();
  const results: (DuaItem & { categoryName: string; duaIndex: number })[] = [];
  for (const cat of duaCategories) {
    for (let i = 0; i < cat.duas.length; i++) {
      const item = cat.duas[i];
      if (
        item.translation.toLowerCase().includes(lower) ||
        item.arabic.includes(query) ||
        item.reference.toLowerCase().includes(lower)
      ) {
        results.push({ ...item, categoryName: cat.name, duaIndex: i });
      }
    }
  }
  return results;
}