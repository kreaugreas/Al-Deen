import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";

export type QuranFontFamily = "uthmani" | "uthmani_v1" | "uthmani_v2" | "uthmani_v4" | "indopak";
export type QuranLayout = "ayah" | "page";

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
  hoverTranslation: boolean;
  setHoverTranslation: (enabled: boolean) => void;
  hoverRecitation: boolean;
  setHoverRecitation: (enabled: boolean) => void;
  inlineTranslation: boolean;
  setInlineTranslation: (enabled: boolean) => void;
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
  hoverTranslation: boolean;
  hoverRecitation: boolean;
  inlineTranslation: boolean;
  verseTranslation: boolean;
  autoScrollDuringPlayback: boolean;
  showArabicText: boolean;
  selectedReciter: string;
  selectedTranslator: string;
}

const DEFAULTS: PersistedSettings = {
  currentLanguage: "en",
  theme: "auto",
  layout: "ayah",
  quranFont: "uthmani",
  fontSize: 5,
  translationFontSize: 3,
  hoverTranslation: true,
  hoverRecitation: true,
  inlineTranslation: false,
  verseTranslation: true,
  autoScrollDuringPlayback: true,
  showArabicText: true,
  selectedReciter: "Mishary_Rashid_Alafasy",
  selectedTranslator: "Direct",
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
  const [hoverTranslation, setHoverTranslation]     = useState(initial.hoverTranslation);
  const [hoverRecitation, setHoverRecitation]       = useState(initial.hoverRecitation);
  const [inlineTranslation, setInlineTranslation]   = useState(initial.inlineTranslation);
  const [verseTranslation, setVerseTranslation]     = useState(initial.verseTranslation);
  const [autoScrollDuringPlayback, setAutoScrollDuringPlayback] = useState(initial.autoScrollDuringPlayback);
  const [selectedTranslations, setSelectedTranslations] = useState<string[]>(["translation"]);
  const [showArabicText, setShowArabicText]         = useState(initial.showArabicText);
  const [selectedReciter, setSelectedReciter]       = useState(initial.selectedReciter);
  const [selectedTranslator, setSelectedTranslator] = useState(initial.selectedTranslator);

  useEffect(() => {
    saveSettings({
      currentLanguage, theme, layout, quranFont, fontSize, translationFontSize,
      hoverTranslation, hoverRecitation,
      inlineTranslation, verseTranslation,
      autoScrollDuringPlayback, showArabicText,
      selectedReciter, selectedTranslator,
    });
  }, [
    currentLanguage, theme, layout, quranFont, fontSize, translationFontSize,
    hoverTranslation, hoverRecitation,
    inlineTranslation, verseTranslation,
    autoScrollDuringPlayback, showArabicText,
    selectedReciter, selectedTranslator,
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
    isSearchSidebarOpen,  setSearchSidebarOpen,
    isQuranNavSidebarOpen, setQuranNavSidebarOpen,
    layout, setLayout,
    currentLanguage, setCurrentLanguage,
    theme, setTheme,
    quranFont, setQuranFont,
    fontSize, setFontSize,
    translationFontSize, setTranslationFontSize,
    hoverTranslation, setHoverTranslation,
    hoverRecitation, setHoverRecitation,
    inlineTranslation, setInlineTranslation,
    verseTranslation, setVerseTranslation,
    autoScrollDuringPlayback, setAutoScrollDuringPlayback,
    selectedTranslations, setSelectedTranslations,
    showArabicText, setShowArabicText,
    selectedReciter, setSelectedReciter,
    selectedTranslator, setSelectedTranslator,
  }), [
    isSettingsSidebarOpen, isSearchSidebarOpen, isQuranNavSidebarOpen,
    layout, currentLanguage, theme,
    quranFont, fontSize, translationFontSize,
    hoverTranslation, hoverRecitation,
    inlineTranslation, verseTranslation,
    autoScrollDuringPlayback, selectedTranslations, showArabicText,
    selectedReciter, selectedTranslator,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error("useApp must be used within an AppProvider");
  return context;
}