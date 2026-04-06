// Updated useQuranData.ts
import { useQuery } from '@tanstack/react-query';
import { getSurah, type AssembledSurah, type QuranFontType } from '@/Bottom/API/Quran';
import { useApp, type QuranFontFamily } from '@/Middle/Context/App';

function mapFontToDataType(font: QuranFontFamily): QuranFontType {
  switch (font) {
    case "uthmani_v1": return "V1";
    case "uthmani_v2":
    case "uthmani_v4": return "V2";
    default: return "Standard";
  }
}

export function useQuranData(surahNumber: number) {
  const {
    verseTranslation,
    hoverTranslation,
    inlineTranslation,
    quranFont,
    selectedTranslator,
    // Transliteration settings
    selectedAyahTransliterator,
    // ✅ FIX: Use the correct per-word transliteration settings
    hoverTransliteration,
    inlineTransliteration,
  } = useApp();

  const fontType = mapFontToDataType(quranFont);
  const needsTranslation = verseTranslation;
  
  // Check if hoverTranslation or inlineTranslation is NOT "None"
  const needsWbw = (hoverTranslation !== "None") || (inlineTranslation !== "None");
  
  // Show verse-level transliteration when selected value is not "None"
  const needsVerseTransliteration = selectedAyahTransliterator !== "None";
  
  // Show word-by-word transliteration for hover or inline
  const needsWbwTransliteration = (hoverTransliteration !== "None") || (inlineTransliteration !== "None");
  
  // For verse-level translation (full verse translation)
  const translationSource = needsTranslation && selectedTranslator 
    ? selectedTranslator 
    : undefined;
  
  // For word-by-word translation (WBW)
  let wbwTranslationSource: string | undefined;
  if (hoverTranslation !== "None") {
    wbwTranslationSource = hoverTranslation;
  } else if (inlineTranslation !== "None") {
    wbwTranslationSource = inlineTranslation;
  } else {
    wbwTranslationSource = undefined;
  }
  
  // For verse-level transliteration (full verse transliteration)
  const transliterationStyle = needsVerseTransliteration ? selectedAyahTransliterator : undefined;
  
  // For word-by-word transliteration - use hoverTransliteration first, then fallback to inlineTransliteration
  let wbwTransliterationStyle: string | undefined;
  if (hoverTransliteration !== "None") {
    wbwTransliterationStyle = hoverTransliteration;
  } else if (inlineTransliteration !== "None") {
    wbwTransliterationStyle = inlineTransliteration;
  } else {
    wbwTransliterationStyle = undefined;
  }

  console.log('🔍 useQuranData called with:', {
    surahNumber,
    fontType,
    needsTranslation,
    needsWbw,
    needsVerseTransliteration,
    needsWbwTransliteration,
    translationSource,
    wbwTranslationSource,
    transliterationStyle,
    wbwTransliterationStyle,
    quranFont,
    hoverTranslation,
    inlineTranslation,
    hoverTransliteration,
    inlineTransliteration,
  });

  return useQuery<AssembledSurah, Error>({
    queryKey: [
      'surah', 
      surahNumber, 
      needsTranslation, 
      needsWbw, 
      needsVerseTransliteration,
      needsWbwTransliteration,
      fontType, 
      translationSource,
      wbwTranslationSource,
      transliterationStyle,
      wbwTransliterationStyle
    ],
    queryFn: async () => {
      console.log(`📥 Fetching surah ${surahNumber}...`);
      try {
        const result = await getSurah(surahNumber, {
          translation: translationSource,
          wbw: needsWbw,
          fontType,
          // Verse-level transliteration
          transliteration: transliterationStyle,
          // Word-by-word transliteration
          wbwTransliteration: wbwTransliterationStyle,
          // Word-by-word translation
          wbwTranslation: wbwTranslationSource,
        });
        
        console.log(`✅ Surah ${surahNumber} loaded:`, {
          hasVerses: !!result?.verses,
          versesLength: result?.verses?.length,
          hasLines: !!result?.lines,
          hasTransliteration: result?.verses?.some(v => v.transliteration || v.wbwTransliteration),
          hasWbwTranslation: result?.verses?.some(v => v.wbwTranslation?.length),
          id: result?.id
        });
        
        return result;
      } catch (error) {
        console.error(`❌ Error loading surah ${surahNumber}:`, error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}