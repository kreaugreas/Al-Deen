import React, { useMemo, useState } from "react";
import { useAudio } from "@/Middle/Context/Audio";
import { PageLines } from "./Main";
import type { PageViewProps, ResolvedWord } from "./Types";
import type { AssembledVerse } from "@/Bottom/API/Quran";
import { getPageSegments } from "@/Bottom/API/Quran";
import { Container } from "@/Top/Component/UI/Container";

export function PageView({
  surah,
  assembledSurah,
  showArabicText,
  hoverTranslation,
  fontClass,
  arabicFontSize,
  translationFontSize,
  transliterationFontSize,
  showTransliteration,
  verseRefs,
  wordSpacing = "1.8px",
}: PageViewProps) {
  const { verses, lines } = assembledSurah;
  const { activeVerse, activeWord, playAyah } = useAudio();
  const [hoveredVerse, setHoveredVerse] = useState<number | null>(null);

  // Helper to check if hover translation is enabled
  const isHoverTranslationEnabled = useMemo(() => {
    return hoverTranslation !== "None" && hoverTranslation !== false;
  }, [hoverTranslation]);

  // Get actual page segments from the page map
  const pages = useMemo(() => {
    const startPage = surah.pages[0];
    const endPage = surah.pages[1];
    const result: { pageNumber: number; verses: AssembledVerse[] }[] = [];
    
    // Create a map for quick verse lookup
    const verseMap = new Map<number, AssembledVerse>();
    for (const verse of verses) {
      verseMap.set(verse.verseNumber, verse);
    }
    
    for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
      const segments = getPageSegments(pageNum);
      if (!segments) continue;
      
      // Find the segment that belongs to this surah
      const surahSegment = segments.find(seg => seg.surah === surah.id);
      if (!surahSegment) continue;
      
      // Collect all verses from startVerse to endVerse
      const pageVerses: AssembledVerse[] = [];
      for (let verseNum = surahSegment.startVerse; verseNum <= surahSegment.endVerse; verseNum++) {
        const verse = verseMap.get(verseNum);
        if (verse) {
          pageVerses.push(verse);
        }
      }
      
      if (pageVerses.length > 0) {
        result.push({ pageNumber: pageNum, verses: pageVerses });
      }
    }
    
    return result;
  }, [surah, verses]);

  const verseMap = useMemo(() => {
    const map = new Map<number, AssembledVerse>();
    for (const verse of verses) map.set(verse.verseNumber, verse);
    return map;
  }, [verses]);

  const resolvedLines = useMemo<ResolvedWord[][]>(() => {
    if (!lines) return [];

    return lines.map((lineRefs) =>
      lineRefs.map((ref) => {
        const [ayahStr, wordStr] = ref.split(":");
        const ayah = parseInt(ayahStr, 10);
        const wordPos = parseInt(wordStr, 10);
        const verse = verseMap.get(ayah) ?? null;
        const wordIndex = wordPos - 1;
        const glyph = verse?.words[wordIndex] ?? ref;
        const isVerseEnd = !!verse && wordIndex === verse.words.length - 1;
        const isVerseNumber = verse === null;
        
        let verseNumber: number | undefined;
        if (isVerseNumber && glyph.includes(':')) {
          const parts = glyph.split(':');
          verseNumber = parseInt(parts[0], 10);
        }

        // Get word-level transliteration if available
        const transliteration = (!isVerseEnd && verse?.wbwTransliteration?.[wordIndex]) || undefined;

        return { 
          glyph, 
          verse, 
          wordIndex, 
          isVerseEnd, 
          isVerseNumber, 
          verseNumber,
          transliteration  // ✅ ADDED
        };
      })
    );
  }, [lines, verseMap]);

  const resolvedLinesByPage = useMemo(() => {
    return pages.map((page) => {
      const pageVerseNumbers = new Set(page.verses.map((v) => v.verseNumber));
      return resolvedLines.filter((line) =>
        line.some((word) => {
          if (word.verse !== null) {
            return pageVerseNumbers.has(word.verse.verseNumber);
          }
          if (word.isVerseNumber && word.verseNumber) {
            return pageVerseNumbers.has(word.verseNumber);
          }
          return false;
        })
      );
    });
  }, [pages, resolvedLines]);

  // Helper to get transliteration for a verse
  const getVerseTransliteration = (verse: AssembledVerse): string | null => {
    if (!showTransliteration) return null;
    // If verse has word-by-word transliteration, join it
    if (verse.wbwTransliteration && verse.wbwTransliteration.length > 0) {
      return verse.wbwTransliteration.join(" ");
    }
    // Fallback to verse-level transliteration
    return verse.transliteration || null;
  };

  return (
    <div className="space-y-6">
      {pages.map((page, pageIdx) => (
        <Container key={page.pageNumber}>
          <div className="pt-4 px-6 sm:px-6 pb-0">
            {showArabicText && (
              lines ? (
                <PageLines
                  resolvedLines={resolvedLinesByPage[pageIdx]}
                  fontClass={fontClass}
                  arabicFontSize={arabicFontSize}
                  wordSpacing={wordSpacing}
                  surahId={surah.id}
                  verseRefs={verseRefs}
                  hoveredVerse={hoveredVerse}
                  setHoveredVerse={setHoveredVerse}
                  showTransliteration={showTransliteration}
                  transliterationFontSize={transliterationFontSize}
                  hoverTranslation={hoverTranslation}  // ✅ PASSED
                />
              ) : (
                <div>
                  {/* Arabic text */}
                  <div
                    className={`${fontClass} leading-[2.8] text-justify`}
                    dir="rtl"
                    style={{ fontSize: arabicFontSize, textAlignLast: "right", wordSpacing }}
                  >
                    {page.verses.map((verse) => (
                      <span
                        key={verse.verseNumber}
                        ref={(el) => {
                          if (el) verseRefs.current.set(
                            verse.verseNumber,
                            el as unknown as HTMLDivElement,
                          );
                        }}
                        className="inline"
                      >
                        {verse.words.map((word, wIdx) => {
                          const isLastWord = wIdx === verse.words.length - 1;
                          return (
                            <span
                              key={wIdx}
                              className={`select-text transition-colors duration-200
                                ${verse.verseNumber === activeVerse && wIdx === activeWord
                                  ? "text-emerald-500 animate-pulse"
                                  : hoveredVerse === verse.verseNumber
                                    ? "bg-primary/20 rounded px-0.5"
                                    : "text-foreground"}
                              `}
                              onClick={() => {
                                if (isLastWord) {
                                  playAyah(surah.id, verse.verseNumber);
                                }
                              }}
                              onMouseEnter={() => {
                                if (isLastWord) setHoveredVerse(verse.verseNumber);
                              }}
                              onMouseLeave={() => {
                                if (isLastWord) setHoveredVerse(null);
                              }}
                            >
                              {word}{" "}
                            </span>
                          );
                        })}
                      </span>
                    ))}
                  </div>

                  {/* Transliteration (below Arabic) */}
                  {showTransliteration && (
                    <div className="mt-4 space-y-2">
                      {page.verses.map((verse) => {
                        const translit = getVerseTransliteration(verse);
                        if (!translit) return null;
                        return (
                          <div
                            key={`translit-${verse.verseNumber}`}
                            className="text-muted-foreground leading-relaxed text-justify"
                            style={{ fontSize: transliterationFontSize }}
                          >
                            {translit}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Translation */}
                  {isHoverTranslationEnabled && (
                    <div className="mt-2 space-y-1">
                      {page.verses.map((verse) => (
                        <p
                          key={`trans-${verse.verseNumber}`}
                          className={`text-foreground leading-relaxed transition-colors duration-200
                            ${hoveredVerse === verse.verseNumber ? "bg-primary/10 rounded px-1" : ""}
                          `}
                          style={{ fontSize: translationFontSize }}
                          onMouseEnter={() => setHoveredVerse(verse.verseNumber)}
                          onMouseLeave={() => setHoveredVerse(null)}
                        >
                          {verse.translation ?? null}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}

            {!showArabicText && (
              <div className="space-y-4">
                {/* When Arabic is hidden, show transliteration first (if enabled) */}
                {showTransliteration && (
                  <div className="space-y-1">
                    {page.verses.map((verse) => {
                      const translit = getVerseTransliteration(verse);
                      if (!translit) return null;
                      return (
                        <p
                          key={`translit-${verse.verseNumber}`}
                          className={`text-muted-foreground leading-relaxed transition-colors duration-200
                            ${hoveredVerse === verse.verseNumber ? "bg-primary/10 rounded px-1" : ""}
                          `}
                          style={{ fontSize: transliterationFontSize }}
                          onMouseEnter={() => setHoveredVerse(verse.verseNumber)}
                          onMouseLeave={() => setHoveredVerse(null)}
                        >
                          {translit}
                        </p>
                      );
                    })}
                  </div>
                )}
                
                {/* Translation */}
                <div className="space-y-1">
                  {page.verses.map((verse) => (
                    <p
                      key={verse.verseNumber}
                      className={`text-foreground leading-relaxed transition-colors duration-200
                        ${hoveredVerse === verse.verseNumber ? "bg-primary/10 rounded px-1" : ""}
                      `}
                      style={{ fontSize: translationFontSize }}
                      onMouseEnter={() => setHoveredVerse(verse.verseNumber)}
                      onMouseLeave={() => setHoveredVerse(null)}
                    >
                      {verse.translation ?? null}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Page number at bottom of container */}
          <div className="flex items-center justify-center pt-4 pb-2 mt-2">
            <span className="text-sm text-muted-foreground font-medium">
              {page.pageNumber}
            </span>
          </div>
        </Container>
      ))}
    </div>
  );
}