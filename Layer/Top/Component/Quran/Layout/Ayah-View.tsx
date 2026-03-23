import { VerseCard } from "./Verse-Card";
import type { AssembledVerse, SurahMeta } from "@/Bottom/API/Quran";

interface AyahViewProps {
  surah: SurahMeta;
  verses: AssembledVerse[];
  showArabicText: boolean;
  verseTranslation: boolean;
  translationFontSize: string;
  targetVerse?: string | null;
  verseRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
  onNotesClick: (ayahId: number, verseText: string) => void;
  onShareClick: (ayahId: number, verseText: string, translation?: string) => void;
}

export function AyahView({
  surah,
  verses,
  showArabicText,
  verseTranslation,
  translationFontSize,
  targetVerse,
  verseRefs,
  onNotesClick,
  onShareClick,
}: AyahViewProps) {
  return (
    <div className="space-y-0">
      {verses.map((verse) => (
        <VerseCard
          key={verse.verseNumber}
          verse={verse}
          surah={surah}
          showArabicText={showArabicText}
          verseTranslation={verseTranslation}
          translationFontSize={translationFontSize}
          isHighlighted={!!targetVerse && parseInt(targetVerse) === verse.verseNumber}
          verseRef={(el) => { if (el) verseRefs.current.set(verse.verseNumber, el); }}
          onNotesClick={() => onNotesClick(verse.verseNumber, verse.arabic)}
          onShareClick={() => onShareClick(verse.verseNumber, verse.arabic, verse.translation)}
        />
      ))}
    </div>
  );
}