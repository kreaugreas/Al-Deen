// Layer/Top/Component/Quran/Layout/Safhah/Types.ts
import type { AssembledSurah, AssembledVerse, SurahMeta } from "@/Bottom/API/Quran";

export interface WordTooltipProps {
  translation?: string;
  transliteration?: string;  // ✅ ADDED
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
  transliteration?: string;  // ✅ ADDED
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
  hoverTranslation: string | boolean;  // ✅ ADDED
}

export interface PageViewProps {
  surah: SurahMeta;
  assembledSurah: AssembledSurah;
  showArabicText: boolean;
  hoverTranslation: string | boolean;  // ✅ FIXED type
  fontClass: string;
  arabicFontSize: string;
  translationFontSize: string;
  verseRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
  wordSpacing?: string;
  showTransliteration?: boolean;
  transliterationFontSize?: string;
}