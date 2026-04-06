// Layer/Top/Component/Quran/Layout/Safhah/Main.tsx
import React, { memo, useMemo } from "react";
import { useMediaQuery } from "@/Middle/Hook/Use-Media-Query";
import { useApp } from "@/Middle/Context/App";
import { useAudio } from "@/Middle/Context/Audio";
import { WordTooltip, useAudioPlayback, extractVerseNumberFromMarker } from "./Utility";
import type { PageLinesProps } from "./Types";

/** Inline text is always rendered in the system sans-serif stack,
 *  fully isolated from whatever Arabic font is active on the parent. */
const LATIN_FONT_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-sans, ui-sans-serif, system-ui, sans-serif)",
  fontFeatureSettings: "normal",
  fontVariant: "normal",
  fontWeight: 400,
};

export const PageLines = memo(function PageLines({
  resolvedLines,
  fontClass,
  arabicFontSize,
  wordSpacing,
  surahId,
  verseRefs,
  hoveredVerse,
  setHoveredVerse,
  showTransliteration,
  transliterationFontSize,
  hoverTranslation,
  inlineTranslation,
  inlineTransliteration,
}: PageLinesProps) {
  const { hoverRecitation } = useApp();
  const { activeVerse, activeWord, playAyah } = useAudio();
  const { playWordAudio, isPlaying } = useAudioPlayback(surahId);

  const isMobile = useMediaQuery("(max-width: 640px)");

  // Derive inline sizes from the Arabic font size so they always
  // feel proportional regardless of what the user sets.
  // Clamped to a minimum so they never become unreadably tiny.
  const arabicSize = parseFloat(arabicFontSize);
  const inlineTranslationSize     = Math.max(12);
  const inlineTransliterationSize = Math.max(12);

  const isHoverTranslationEnabled = useMemo(
    () => hoverTranslation !== "None" && hoverTranslation !== false,
    [hoverTranslation],
  );

  const showInlineTranslation     = inlineTranslation !== "None";
  const showInlineTransliteration = inlineTransliteration !== "None";

  const allWords = useMemo(
    () => resolvedLines.flatMap((line) => line),
    [resolvedLines],
  );

  const buildWordClassName = (
    isVerseHighlighted: boolean,
    isVerseNumber: boolean,
    isVerseEnd: boolean,
    isActive: boolean,
    isPlayingAudio: boolean,
  ): string => {
    let cls = "select-text transition-colors duration-200 inline ";
    if (isVerseHighlighted && !isVerseNumber) cls += "text-primary";
    else if (isActive)                        cls += "text-emerald-500 animate-pulse";
    else if (isPlayingAudio)                  cls += "text-primary animate-pulse";
    else if (isVerseEnd || isVerseNumber)     cls += "text-muted-foreground hover:text-primary cursor-pointer";
    else                                      cls += "text-foreground hover:text-primary";
    return cls;
  };

  const buildHandlers = (word: any) => {
    const { glyph, verse, wordIndex, isVerseEnd, isVerseNumber } = word;

    let handleClick: (() => void) | undefined;
    if (verse) {
      handleClick = isVerseEnd
        ? () => playAyah(surahId, verse.verseNumber)
        : () => playWordAudio(verse.verseNumber, wordIndex);
    } else if (isVerseNumber) {
      const vn = extractVerseNumberFromMarker(glyph);
      if (vn !== null) handleClick = () => playAyah(surahId, vn);
    }

    const handleMouseEnter = () => {
      if (isVerseNumber) {
        const vn = extractVerseNumberFromMarker(glyph);
        if (vn !== null) setHoveredVerse(vn);
      } else if (isVerseEnd && verse) {
        setHoveredVerse(verse.verseNumber);
      }
    };

    const handleMouseLeave = () => {
      if (isVerseNumber || isVerseEnd) setHoveredVerse(null);
    };

    return { handleClick, handleMouseEnter, handleMouseLeave };
  };

  const renderWordColumn = (word: any, idx: number, isFirstInLine = false) => {
    const {
      glyph,
      verse,
      wordIndex,
      isVerseEnd,
      isVerseNumber,
      verseNumber: markerVerseNumber,
      transliteration: wordTransliteration,
    } = word;

    const belongsToVerse     = verse?.verseNumber ?? markerVerseNumber;
    const isVerseHighlighted = hoveredVerse !== null && belongsToVerse === hoveredVerse;

    const translation =
      !isVerseEnd && !isVerseNumber && verse
        ? verse.wbwTranslation?.[wordIndex]
        : undefined;

    const transliteration =
      !isVerseEnd && !isVerseNumber && verse && wordTransliteration
        ? wordTransliteration
        : undefined;

    const wordKey        = verse ? `word-${verse.verseNumber}-${wordIndex}` : null;
    const ayahKey        = verse ? `ayah-${verse.verseNumber}` : null;
    const isPlayingAudio =
      (wordKey !== null && isPlaying(wordKey)) ||
      (ayahKey !== null && isPlaying(ayahKey));

    const isActive =
      !isVerseEnd &&
      !isVerseNumber &&
      verse?.verseNumber === activeVerse &&
      wordIndex === activeWord;

    const { handleClick, handleMouseEnter, handleMouseLeave } = buildHandlers(word);

    const spanClass = buildWordClassName(
      isVerseHighlighted,
      isVerseNumber,
      isVerseEnd,
      isActive,
      isPlayingAudio,
    );

    const cursorStyle =
      isVerseEnd || isVerseNumber               ? "pointer"
      : verse && !isVerseEnd && hoverRecitation ? "pointer"
      : "text";

    const refCallback = (el: HTMLSpanElement | null) => {
      if (el && isFirstInLine && verse && idx === 0) {
        verseRefs.current.set(verse.verseNumber, el as unknown as HTMLDivElement);
      }
    };

    const showTranslationCol     = showInlineTranslation && translation;
    const showTransliterationCol = showInlineTransliteration && transliteration;
    const hasInline              = showTranslationCol || showTransliterationCol;

    return (
      <div
        key={idx}
        className="flex flex-col items-center"
        style={{ minWidth: "2rem" }}
      >
        {/* ── Arabic glyph (inherits Arabic font from parent) ── */}
        <WordTooltip
          translation={translation}
          transliteration={transliteration}
          enabled={isHoverTranslationEnabled}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span
            ref={refCallback}
            className={spanClass}
            style={{ cursor: cursorStyle }}
            onClick={handleClick}
          >
            {glyph}{' '}
          </span>
        </WordTooltip>

        {/* ── Inline translation / transliteration ──
            Font is fully reset so Arabic ligature/substitution
            features cannot corrupt Latin characters.
            Sizes are derived from arabicFontSize automatically. */}
        {hasInline && (
          <div
            className="flex flex-col items-center gap-y-0.5 mt-1 w-full"
            dir="ltr"
            style={LATIN_FONT_STYLE}
          >
            {showTranslationCol && (
              <span
                className="text-black dark:text-white text-center leading-tight block w-full"
                style={{ ...LATIN_FONT_STYLE, fontSize: `${inlineTranslationSize}px` }}
              >
                {translation}
              </span>
            )}
            {showTransliterationCol && (
              <span
                className="text-gray-500 dark:text-gray-400 text-center leading-tight block w-full"
                style={{ ...LATIN_FONT_STYLE, fontSize: `${inlineTransliterationSize}px` }}
              >
                {transliteration}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div
        className={fontClass}
        style={{ fontSize: arabicFontSize, lineHeight: 1.8, wordSpacing }}
        dir="rtl"
      >
        {isMobile ? (
          /* ── Mobile ─────────────────────────────────────────────
             Each word-column wraps as an atomic unit. justify-end
             keeps the flow RTL-natural. gap-y-4 gives breathing
             room between wrapped rows when inline text is present. */
          <div className="flex flex-wrap justify-end items-start gap-x-2 gap-y-4">
            {allWords.map((word, idx) => renderWordColumn(word, idx, false))}
          </div>
        ) : (
          /* ── Desktop ─────────────────────────────────────────────
             One RTL flex row per Mushaf line. items-start keeps
             columns top-aligned regardless of whether inline text
             is present on a given word.                           */
          resolvedLines.map((line, lineIdx) => (
            <div
              key={lineIdx}
              className="flex justify-center items-start gap-x-3 flex-wrap mb-6"
              dir="rtl"
            >
              {line.map((word, wordIdx) =>
                renderWordColumn(word, wordIdx, true)
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
});