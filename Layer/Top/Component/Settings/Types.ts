import { ReactNode } from "react";

export type SettingsCategory = "account" | "quran" | "hadith" | "aid" | "language";
export type AccountSubcategory = "profile" | "bookmarks" | "notes" | "history";
export type AidSubcategory = "prayer-times" | "dua";

export interface SettingsCategoryConfig {
  id: SettingsCategory;
  label: string;
  icon: React.ElementType;
  hasSubcategories?: boolean;
}

export interface AccountSubcategoryConfig {
  id: AccountSubcategory;
  label: string;
  icon: ReactNode;
}

export interface AidSubcategoryConfig {
  id: AidSubcategory;
  label: string;
  icon: ReactNode;
}