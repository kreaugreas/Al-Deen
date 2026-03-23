// ============= Vite / Next.js (Turbopack) =============
const duaModules = import.meta.glob<{ default: DuaCategory }>(
  "@/Bottom/Data/Aid/Dua/*.json",
  { eager: true }
);

const tajweedModules = import.meta.glob<{ default: TajweedCategory }>(
  "@/Bottom/Data/Aid/Alphabet/Tajweed/**/*.json",
  { eager: true }
);

import alphabetData from "@/Bottom/Data/Aid/Alphabet/Letter.json";

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
  id: number;
  arabic: string;
  translation: string;
  reference: string;
  audioUrl?: string;
}

export interface DuaCategory {
  id: string;
  name: string;
  arabicName: string;
  icon: string;
  description: string;
  duas: DuaItem[];
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
// No manual import needed when you add a new file.

const duaCategories: DuaCategory[] = Object.values(duaModules).map(
  (mod) => mod.default as DuaCategory
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

export function getDuaCategory(categoryId: string): DuaCategory | null {
  return duaCategories.find((c) => c.id === categoryId) ?? null;
}

export function getAllDuaCategories(): DuaCategory[] {
  return duaCategories;
}

export function searchDuas(query: string): (DuaItem & { categoryId: string })[] {
  const lower = query.toLowerCase();
  const results: (DuaItem & { categoryId: string })[] = [];
  for (const cat of duaCategories) {
    for (const item of cat.duas) {
      if (
        item.translation.toLowerCase().includes(lower) ||
        item.arabic.includes(query) ||
        item.reference.toLowerCase().includes(lower)
      ) {
        results.push({ ...item, categoryId: cat.id });
      }
    }
  }
  return results;
}