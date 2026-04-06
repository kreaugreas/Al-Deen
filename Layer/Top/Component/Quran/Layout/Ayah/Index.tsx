// Layer/Top/Component/Quran/Layout/Safhah/Ayah/Index.tsx
import { VerseCard } from "./Main";
import type { AyahViewProps } from "./Types";

export function AyahView({
  surah,
  verses,
  showArabicText,
  verseTranslation,
  translationFontSize,
  transliterationFontSize,
  selectedAyahTransliterator,
  targetVerse,
  verseRefs,
  onNotesClick,
  onShareClick,
  hoverTransliteration,  // ✅ ADD
  inlineTransliteration,  // ✅ ADD
}: AyahViewProps) {
  if (!verses || !Array.isArray(verses)) {
    console.warn('AyahView: verses is undefined or not an array', verses);
    return null;
  }

  // Determine if transliteration should show (not "None")
  const showTransliteration = selectedAyahTransliterator !== "None";

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
          transliterationFontSize={transliterationFontSize}
          showTransliteration={showTransliteration}
          isHighlighted={!!targetVerse && parseInt(targetVerse) === verse.verseNumber}
          verseRef={(el) => { if (el) verseRefs.current.set(verse.verseNumber, el); }}
          onNotesClick={() => onNotesClick(verse.verseNumber, verse.arabic)}
          onShareClick={() => onShareClick(verse.verseNumber, verse.arabic, verse.translation)}
          hoverTransliteration={hoverTransliteration}  // ✅ PASS
          inlineTransliteration={inlineTransliteration}  // ✅ PASS
        />
      ))}
    </div>
  );
}