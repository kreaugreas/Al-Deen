// Component/Settings/Content/Quran/Index.tsx
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { useApp } from "@/Middle/Context/App";
import { Separator } from "@/Top/Component/UI/Separator";
import { Layout } from "./Section/Layout";
import { ArabicText } from "./Section/ArabicText";
import { Translation } from "./Section/Translation";
import { PerWord } from "./Section/PerWord";
import { Audio } from "./Section/Audio";
import { Transliteration } from "./Section/Transliteration";
import { Preview } from "./Section/Preview";
import { TRANSLATORS, RECITERS } from "./Constant";

export function QuranSection() {
  const { t } = useTranslation();
  const {
    quranFont, setQuranFont,
    fontSize, setFontSize,
    translationFontSize, setTranslationFontSize,
    hoverTranslation, setHoverTranslation,
    hoverTranslationSize, setHoverTranslationSize,  // ✅ ADD THIS
    hoverRecitation, setHoverRecitation,
    hoverTransliteration, setHoverTransliteration,  // ✅ ADD THIS
    hoverTransliterationSize, setHoverTransliterationSize,  // ✅ ADD THIS
    inlineTranslation, setInlineTranslation,
    inlineTranslationSize, setInlineTranslationSize,  // ✅ ADD THIS
    inlineTransliteration, setInlineTransliteration,  // ✅ ADD THIS
    inlineTransliterationSize, setInlineTransliterationSize,  // ✅ ADD THIS
    verseTranslation, setVerseTranslation,
    autoScrollDuringPlayback, setAutoScrollDuringPlayback,
    showArabicText, setShowArabicText,
    selectedReciter, setSelectedReciter,
    selectedTranslator, setSelectedTranslator,
    layout, setLayout,
    // Transliteration settings
    showTransliteration, setShowTransliteration,
    transliterationSize, setTransliterationSize,
    selectedAyahTransliterator, setSelectedAyahTransliterator,
    selectedKalimaTransliterator, setSelectedKalimaTransliterator,
  } = useApp();

  return (
    <div className="space-y-8">
      <Layout layout={layout} onLayoutChange={setLayout} />
      <Separator />

      <ArabicText
        showArabicText={showArabicText}
        onShowArabicTextChange={setShowArabicText}
        quranFont={quranFont}
        onQuranFontChange={setQuranFont}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
      />
      <Separator />

      <Translation
        selectedTranslator={selectedTranslator}
        onSelectedTranslatorChange={setSelectedTranslator}
        verseTranslation={verseTranslation}
        onVerseTranslationChange={setVerseTranslation}
        translationFontSize={translationFontSize}
        onTranslationFontSizeChange={setTranslationFontSize}
      />
      <Separator />
      
      <Transliteration
        showTransliteration={showTransliteration}
        onShowTransliterationChange={setShowTransliteration}
        transliterationSize={transliterationSize}
        onTransliterationSizeChange={setTransliterationSize}
        selectedAyahTransliterator={selectedAyahTransliterator}
        onSelectedAyahTransliteratorChange={setSelectedAyahTransliterator}
        selectedKalimaTransliterator={selectedKalimaTransliterator}
        onSelectedKalimaTransliteratorChange={setSelectedKalimaTransliterator}
      />
      <Separator />
      
      <PerWord
        // Hover Translation props
        hoverTranslation={hoverTranslation}
        onHoverTranslationChange={setHoverTranslation}
        hoverTranslationSize={hoverTranslationSize}
        onHoverTranslationSizeChange={setHoverTranslationSize}
        
        // Hover Transliteration props
        hoverTransliteration={hoverTransliteration}
        onHoverTransliterationChange={setHoverTransliteration}
        hoverTransliterationSize={hoverTransliterationSize}
        onHoverTransliterationSizeChange={setHoverTransliterationSize}
        
        // Hover Recitation prop
        hoverRecitation={hoverRecitation}
        onHoverRecitationChange={setHoverRecitation}
        
        // Inline Translation props
        inlineTranslation={inlineTranslation}
        onInlineTranslationChange={setInlineTranslation}
        inlineTranslationSize={inlineTranslationSize}
        onInlineTranslationSizeChange={setInlineTranslationSize}
        
        // Inline Transliteration props
        inlineTransliteration={inlineTransliteration}
        onInlineTransliterationChange={setInlineTransliteration}
        inlineTransliterationSize={inlineTransliterationSize}
        onInlineTransliterationSizeChange={setInlineTransliterationSize}
      />
      <Separator />

      <Audio
        selectedReciter={selectedReciter}
        onSelectedReciterChange={setSelectedReciter}
        autoScrollDuringPlayback={autoScrollDuringPlayback}
        onAutoScrollChange={setAutoScrollDuringPlayback}
      />
      <Separator />

      <Preview
        layout={layout}
        quranFont={quranFont}
        fontSize={fontSize}
        hoverTranslation={hoverTranslation}
        hoverRecitation={hoverRecitation}
        inlineTranslation={inlineTranslation}
        verseTranslation={verseTranslation}
      />
    </div>
  );
}