// Layer/Top/Component/Quran/Layout/Safhah/Types.ts
import type { AssembledSurah, AssembledVerse, SurahMeta } from "@/Bottom/API/Quran";

export interface WordTooltipProps {
  translation?: string;
  transliteration?: string;
  enabled: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  children: React.ReactNode;
}

export interface ResolvedWord {
  glyph: string;
  verse: AssembledVerse | null;
  wordIndex: number;
  isVerseEnd: boolean;
  isVerseNumber: boolean;
  verseNumber?: number;
  transliteration?: string;
}

export interface PageLinesProps {
  resolvedLines: ResolvedWord[][];
  fontClass: string;
  arabicFontSize: string;
  wordSpacing: string;
  surahId: number;
  verseRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
  hoveredVerse: number | null;
  setHoveredVerse: (verse: number | null) => void;
  showTransliteration?: boolean;
  transliterationFontSize?: string;
  hoverTranslation: string | boolean;
  // ✅ ADD inline settings
  inlineTranslation: string;
  inlineTransliteration: string;
  inlineTranslationSize: number;
  inlineTransliterationSize: number;
}

export interface PageViewProps {
  surah: SurahMeta;
  assembledSurah: AssembledSurah;
  showArabicText: boolean;
  hoverTranslation: string | boolean;
  fontClass: string;
  arabicFontSize: string;
  translationFontSize: string;
  verseRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
  wordSpacing?: string;
  showTransliteration?: boolean;
  transliterationFontSize?: string;
  // ✅ ADD inline settings
  inlineTranslation: string;
  inlineTransliteration: string;
  inlineTranslationSize: number;
  inlineTransliterationSize: number;
}