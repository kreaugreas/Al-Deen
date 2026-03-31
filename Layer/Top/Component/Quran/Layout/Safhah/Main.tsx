import React, { memo, useMemo } from "react";
import { useMediaQuery } from "@/Middle/Hook/Use-Media-Query";
import { useApp } from "@/Middle/Context/App";
import { useAudio } from "@/Middle/Context/Audio";
import { WordTooltip, useAudioPlayback, extractVerseNumberFromMarker } from "./Utility";
import type { PageLinesProps } from "./Types";

export const PageLines = memo(function PageLines({
  resolvedLines,
  fontClass,
  arabicFontSize,
  wordSpacing,
  surahId,
  verseRefs,
  hoveredVerse,
  setHoveredVerse,
}: PageLinesProps) {
  const { hoverTranslation, hoverRecitation } = useApp();
  const { activeVerse, activeWord, playAyah } = useAudio();
  const { playingKey, playWordAudio, isPlaying } = useAudioPlayback(surahId);

  // Detect mobile screens (breakpoint 640px)
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Flatten all words for plain layout
  const allWords = useMemo(() => {
    return resolvedLines.flatMap((line) => line);
  }, [resolvedLines]);

  const renderWord = (word: any, idx: number, isInLine = false) => {
    const { glyph, verse, wordIndex, isVerseEnd, isVerseNumber, verseNumber: markerVerseNumber } = word;
    const belongsToVerse = verse?.verseNumber || markerVerseNumber;
    const isVerseHighlighted = hoveredVerse !== null && belongsToVerse === hoveredVerse;

    const translation = (!isVerseEnd && !isVerseNumber && verse)
      ? verse.wbwTranslation?.[wordIndex]
      : undefined;

    const wordKey = verse ? `word-${verse.verseNumber}-${wordIndex}` : null;
    const ayahKey = verse ? `ayah-${verse.verseNumber}` : null;
    const isPlayingAudio = (wordKey !== null && isPlaying(wordKey))
                        || (ayahKey !== null && isPlaying(ayahKey));
    const isActive = !isVerseEnd && !isVerseNumber
                  && verse?.verseNumber === activeVerse
                  && wordIndex === activeWord;

    let handleClick: (() => void) | undefined;
    if (verse) {
      handleClick = isVerseEnd
        ? () => playAyah(surahId, verse.verseNumber)
        : () => playWordAudio(verse.verseNumber, wordIndex);
    } else if (isVerseNumber) {
      const verseNumber = extractVerseNumberFromMarker(glyph);
      if (verseNumber !== null) {
        handleClick = () => playAyah(surahId, verseNumber);
      }
    }

    const handleMouseEnter = () => {
      if (isVerseNumber || isVerseEnd) {
        if (isVerseNumber) {
          const verseNumber = extractVerseNumberFromMarker(glyph);
          if (verseNumber !== null) setHoveredVerse(verseNumber);
        } else if (isVerseEnd && verse) {
          setHoveredVerse(verse.verseNumber);
        }
      }
    };

    const handleMouseLeave = () => {
      if (isVerseNumber || isVerseEnd) {
        setHoveredVerse(null);
      }
    };

    const refCallback = (el: HTMLSpanElement | null) => {
      if (el && isInLine && verse && idx === 0) {
        verseRefs.current.set(verse.verseNumber, el as unknown as HTMLDivElement);
      }
    };

    let className = "select-text transition-colors duration-200 inline ";
    if (isVerseHighlighted && !isVerseNumber) {
      className += "text-primary";
    } else if (isActive) {
      className += "text-emerald-500 animate-pulse";
    } else if (isPlayingAudio) {
      className += "text-primary animate-pulse";
    } else if (isVerseEnd || isVerseNumber) {
      className += "text-muted-foreground hover:text-primary cursor-pointer";
    } else {
      className += "text-foreground hover:text-primary";
    }

    let cursorStyle = "text";
    if (isVerseEnd || isVerseNumber) {
      cursorStyle = "pointer";
    } else if (verse && !isVerseEnd && hoverRecitation) {
      cursorStyle = "pointer";
    }

    return (
      <WordTooltip
        key={idx}
        translation={translation}
        enabled={hoverTranslation}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span
          ref={refCallback}
          className={className}
          style={{ cursor: cursorStyle }}
          onClick={handleClick}
        >
          {glyph}
          {' '}
        </span>
      </WordTooltip>
    );
  };

  return (
    <div
      className={`${fontClass}`}
      style={{ fontSize: arabicFontSize, lineHeight: 1.8, wordSpacing }}
      dir="rtl"
    >
      {isMobile ? (
        <div className="text-justify">
          {allWords.map((word, idx) => renderWord(word, idx, false))}
        </div>
      ) : (
        resolvedLines.map((line, lineIdx) => (
          <div key={lineIdx} className="flex justify-center items-baseline gap-x-1 flex-wrap" dir="rtl">
            {line.map((word, wordIdx) => renderWord(word, wordIdx, true))}
          </div>
        ))
      )}
    </div>
  );
});