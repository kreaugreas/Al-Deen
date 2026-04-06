import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";

export type QuranFontFamily = "uthmani" | "uthmani_v1" | "uthmani_v2" | "uthmani_v4" | "indopak";
export type QuranLayout = "ayah" | "page";

// Transliterator types (includes "None" option) - for TRANSLITERATION only
export type TransliteratorType = "None" | "Standard" | "Academic" | "Phonetic" | "KingFahd";

interface AppContextType {
  isSettingsSidebarOpen: boolean;
  setSettingsSidebarOpen: (open: boolean) => void;
  isSearchSidebarOpen: boolean;
  setSearchSidebarOpen: (open: boolean) => void;
  isQuranNavSidebarOpen: boolean;
  setQuranNavSidebarOpen: (open: boolean) => void;
  layout: QuranLayout;
  setLayout: (layout: QuranLayout) => void;
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  theme: "auto" | "light" | "dark";
  setTheme: (theme: "auto" | "light" | "dark") => void;
  quranFont: QuranFontFamily;
  setQuranFont: (font: QuranFontFamily) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  translationFontSize: number;
  setTranslationFontSize: (size: number) => void;
  
  // Per-Word settings
  // Translation settings (use translator IDs like "Direct", "Sahih", etc.)
  hoverTranslation: string;                    // Changed from TransliteratorType
  setHoverTranslation: (value: string) => void;
  hoverTranslationSize: number;
  setHoverTranslationSize: (size: number) => void;
  // Transliteration settings (use transliterator IDs like "Standard", "Academic", etc.)
  hoverTransliteration: TransliteratorType;
  setHoverTransliteration: (value: TransliteratorType) => void;
  hoverTransliterationSize: number;
  setHoverTransliterationSize: (size: number) => void;
  hoverRecitation: boolean;
  setHoverRecitation: (enabled: boolean) => void;
  // Inline Translation settings (use translator IDs)
  inlineTranslation: string;                   // Changed from TransliteratorType
  setInlineTranslation: (value: string) => void;
  inlineTranslationSize: number;
  setInlineTranslationSize: (size: number) => void;
  // Inline Transliteration settings (use transliterator IDs)
  inlineTransliteration: TransliteratorType;
  setInlineTransliteration: (value: TransliteratorType) => void;
  inlineTransliterationSize: number;
  setInlineTransliterationSize: (size: number) => void;
  
  // Verse-level settings
  verseTranslation: boolean;
  setVerseTranslation: (enabled: boolean) => void;
  autoScrollDuringPlayback: boolean;
  setAutoScrollDuringPlayback: (enabled: boolean) => void;
  selectedTranslations: string[];
  setSelectedTranslations: (translations: string[]) => void;
  showArabicText: boolean;
  setShowArabicText: (show: boolean) => void;
  selectedReciter: string;
  setSelectedReciter: (reciter: string) => void;
  selectedTranslator: string;
  setSelectedTranslator: (translator: string) => void;
  
  // Hadith settings
  showHadithTranslation: boolean;
  setShowHadithTranslation: (enabled: boolean) => void;
  showHadithTransliteration: boolean;
  setShowHadithTransliteration: (enabled: boolean) => void;
  
  // Transliteration settings (Verse/Ayah level)
  transliterationSize: number;
  setTransliterationSize: (size: number) => void;
  selectedAyahTransliterator: TransliteratorType;
  setSelectedAyahTransliterator: (transliterator: TransliteratorType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = "app-settings";

interface PersistedSettings {
  currentLanguage: string;
  theme: "auto" | "light" | "dark";
  layout: QuranLayout;
  quranFont: QuranFontFamily;
  fontSize: number;
  translationFontSize: number;
  // Per-Word settings
  hoverTranslation: string;                    // Changed from TransliteratorType
  hoverTranslationSize: number;
  hoverTransliteration: TransliteratorType;
  hoverTransliterationSize: number;
  hoverRecitation: boolean;
  inlineTranslation: string;                   // Changed from TransliteratorType
  inlineTranslationSize: number;
  inlineTransliteration: TransliteratorType;
  inlineTransliterationSize: number;
  // Verse-level settings
  verseTranslation: boolean;
  autoScrollDuringPlayback: boolean;
  showArabicText: boolean;
  selectedReciter: string;
  selectedTranslator: string;
  // Hadith settings
  showHadithTranslation: boolean;
  showHadithTransliteration: boolean;
  // Transliteration settings (Verse/Ayah level)
  transliterationSize: number;
  selectedAyahTransliterator: TransliteratorType;
}

const DEFAULTS: PersistedSettings = {
  currentLanguage: "en",
  theme: "auto",
  layout: "ayah",
  quranFont: "uthmani",
  fontSize: 5,
  translationFontSize: 3,
  // Per-Word defaults
  hoverTranslation: "Direct",                  // Changed from "Standard"
  hoverTranslationSize: 3,
  hoverTransliteration: "None",
  hoverTransliterationSize: 3,
  hoverRecitation: true,
  inlineTranslation: "None",                   // Changed from "None" (still string)
  inlineTranslationSize: 3,
  inlineTransliteration: "None",
  inlineTransliterationSize: 3,
  // Verse-level defaults
  verseTranslation: true,
  autoScrollDuringPlayback: true,
  showArabicText: true,
  selectedReciter: "Mishary_Rashid_Alafasy",
  selectedTranslator: "Direct",
  // Hadith defaults
  showHadithTranslation: true,
  showHadithTransliteration: false,
  // Transliteration defaults (Verse/Ayah level)
  transliterationSize: 3,
  selectedAyahTransliterator: "None",
};

function loadSettings(): PersistedSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...DEFAULTS, ...JSON.parse(saved) };
  } catch {}
  return DEFAULTS;
}

function saveSettings(s: PersistedSettings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

export function AppProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(() => loadSettings(), []);

  const [isSettingsSidebarOpen, setSettingsSidebarOpen] = useState(false);
  const [isSearchSidebarOpen, setSearchSidebarOpen]     = useState(false);
  const [isQuranNavSidebarOpen, setQuranNavSidebarOpen] = useState(false);

  const [layout, setLayout]                         = useState<QuranLayout>(initial.layout);
  const [currentLanguage, setCurrentLanguage]       = useState(initial.currentLanguage);
  const [theme, setTheme]                           = useState<"auto" | "light" | "dark">(initial.theme);
  const [quranFont, setQuranFont]                   = useState<QuranFontFamily>(initial.quranFont);
  const [fontSize, setFontSize]                     = useState(initial.fontSize);
  const [translationFontSize, setTranslationFontSize] = useState(initial.translationFontSize);
  
  // Per-Word settings
  const [hoverTranslation, setHoverTranslation]                     = useState<string>(initial.hoverTranslation);
  const [hoverTranslationSize, setHoverTranslationSize]             = useState(initial.hoverTranslationSize);
  const [hoverTransliteration, setHoverTransliteration]             = useState<TransliteratorType>(initial.hoverTransliteration);
  const [hoverTransliterationSize, setHoverTransliterationSize]     = useState(initial.hoverTransliterationSize);
  const [hoverRecitation, setHoverRecitation]                       = useState(initial.hoverRecitation);
  const [inlineTranslation, setInlineTranslation]                   = useState<string>(initial.inlineTranslation);
  const [inlineTranslationSize, setInlineTranslationSize]           = useState(initial.inlineTranslationSize);
  const [inlineTransliteration, setInlineTransliteration]           = useState<TransliteratorType>(initial.inlineTransliteration);
  const [inlineTransliterationSize, setInlineTransliterationSize]   = useState(initial.inlineTransliterationSize);
  
  // Verse-level settings
  const [verseTranslation, setVerseTranslation]           = useState(initial.verseTranslation);
  const [autoScrollDuringPlayback, setAutoScrollDuringPlayback] = useState(initial.autoScrollDuringPlayback);
  const [selectedTranslations, setSelectedTranslations]   = useState<string[]>(["translation"]);
  const [showArabicText, setShowArabicText]               = useState(initial.showArabicText);
  const [selectedReciter, setSelectedReciter]             = useState(initial.selectedReciter);
  const [selectedTranslator, setSelectedTranslator]       = useState(initial.selectedTranslator);
  
  // Hadith settings
  const [showHadithTranslation, setShowHadithTranslation] = useState(initial.showHadithTranslation);
  const [showHadithTransliteration, setShowHadithTransliteration] = useState(initial.showHadithTransliteration);

  // Transliteration settings (Verse/Ayah level)
  const [transliterationSize, setTransliterationSize] = useState(initial.transliterationSize);
  const [selectedAyahTransliterator, setSelectedAyahTransliterator] = useState<TransliteratorType>(initial.selectedAyahTransliterator);

  useEffect(() => {
    saveSettings({
      currentLanguage, theme, layout, quranFont, fontSize, translationFontSize,
      hoverTranslation, hoverTranslationSize,
      hoverTransliteration, hoverTransliterationSize,
      hoverRecitation,
      inlineTranslation, inlineTranslationSize,
      inlineTransliteration, inlineTransliterationSize,
      verseTranslation, autoScrollDuringPlayback, showArabicText,
      selectedReciter, selectedTranslator,
      showHadithTranslation, showHadithTransliteration,
      transliterationSize, selectedAyahTransliterator,
    });
  }, [
    currentLanguage, theme, layout, quranFont, fontSize, translationFontSize,
    hoverTranslation, hoverTranslationSize,
    hoverTransliteration, hoverTransliterationSize,
    hoverRecitation,
    inlineTranslation, inlineTranslationSize,
    inlineTransliteration, inlineTransliterationSize,
    verseTranslation, autoScrollDuringPlayback, showArabicText,
    selectedReciter, selectedTranslator,
    showHadithTranslation, showHadithTransliteration,
    transliterationSize, selectedAyahTransliterator,
  ]);

  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      root.classList.remove("light", "dark");
      root.classList.add(theme === "auto" ? (mq.matches ? "dark" : "light") : theme);
    };
    applyTheme();
    if (theme === "auto") {
      mq.addEventListener("change", applyTheme);
      return () => mq.removeEventListener("change", applyTheme);
    }
  }, [theme]);

  const value = useMemo<AppContextType>(() => ({
    isSettingsSidebarOpen, setSettingsSidebarOpen,
    isSearchSidebarOpen, setSearchSidebarOpen,
    isQuranNavSidebarOpen, setQuranNavSidebarOpen,
    layout, setLayout,
    currentLanguage, setCurrentLanguage,
    theme, setTheme,
    quranFont, setQuranFont,
    fontSize, setFontSize,
    translationFontSize, setTranslationFontSize,
    hoverTranslation, setHoverTranslation,
    hoverTranslationSize, setHoverTranslationSize,
    hoverTransliteration, setHoverTransliteration,
    hoverTransliterationSize, setHoverTransliterationSize,
    hoverRecitation, setHoverRecitation,
    inlineTranslation, setInlineTranslation,
    inlineTranslationSize, setInlineTranslationSize,
    inlineTransliteration, setInlineTransliteration,
    inlineTransliterationSize, setInlineTransliterationSize,
    verseTranslation, setVerseTranslation,
    autoScrollDuringPlayback, setAutoScrollDuringPlayback,
    selectedTranslations, setSelectedTranslations,
    showArabicText, setShowArabicText,
    selectedReciter, setSelectedReciter,
    selectedTranslator, setSelectedTranslator,
    showHadithTranslation, setShowHadithTranslation,
    showHadithTransliteration, setShowHadithTransliteration,
    transliterationSize, setTransliterationSize,
    selectedAyahTransliterator, setSelectedAyahTransliterator,
  }), [
    isSettingsSidebarOpen, isSearchSidebarOpen, isQuranNavSidebarOpen,
    layout, currentLanguage, theme,
    quranFont, fontSize, translationFontSize,
    hoverTranslation, hoverTranslationSize,
    hoverTransliteration, hoverTransliterationSize,
    hoverRecitation,
    inlineTranslation, inlineTranslationSize,
    inlineTransliteration, inlineTransliterationSize,
    verseTranslation, autoScrollDuringPlayback, selectedTranslations, showArabicText,
    selectedReciter, selectedTranslator,
    showHadithTranslation, showHadithTransliteration,
    transliterationSize, selectedAyahTransliterator,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error("useApp must be used within an AppProvider");
  return context;
}