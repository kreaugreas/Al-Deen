import { ReactNode } from "react";

export type SettingsCategory = "account" | "quran" | "hadith" | "language";
export type AccountSubcategory = "profile" | "bookmarks" | "notes" | "history";

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