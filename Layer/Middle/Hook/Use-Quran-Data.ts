// Use-Quran-Data.ts
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
  } = useApp();

  const fontType = mapFontToDataType(quranFont);
  const needsTranslation = verseTranslation;
  const needsWbw = hoverTranslation || inlineTranslation;
  const translationSource = needsTranslation && selectedTranslator 
    ? selectedTranslator 
    : undefined;

  console.log('🔍 useQuranData called with:', {
    surahNumber,
    fontType,
    needsTranslation,
    needsWbw,
    translationSource,
    quranFont
  });

  return useQuery<AssembledSurah, Error>({
    queryKey: ['surah', surahNumber, needsTranslation, needsWbw, fontType, translationSource],
    queryFn: async () => {
      console.log(`📥 Fetching surah ${surahNumber}...`);
      try {
        const result = await getSurah(surahNumber, {
          translation: translationSource,
          wbw: needsWbw,
          fontType,
        });
        
        console.log(`✅ Surah ${surahNumber} loaded:`, {
          hasVerses: !!result?.verses,
          versesLength: result?.verses?.length,
          hasLines: !!result?.lines,
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