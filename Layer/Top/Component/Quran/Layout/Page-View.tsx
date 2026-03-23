import { useMemo, memo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import type { AssembledSurah, AssembledVerse, SurahMeta } from "@/Bottom/API/Quran";
import { getWordAudioUrl, getAyahAudioUrl } from "@/Bottom/API/Quran";
import { WordByWord } from "@/Top/Component/Word-By-Word";
import { useApp } from "@/Middle/Context/App-Context";

const VERSE_INDICATOR_RE = /^[\u0660-\u0669\u06F0-\u06F9\u06DD۝\s]+$/;

interface WordTooltipProps {
  translation?: string;
  enabled: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

function WordTooltip({ translation, enabled, onClick, children }: WordTooltipProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  if (!enabled || !translation) return <>{children}</>;

  const tooltip = pos
    ? createPortal(
        <span
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y - 8,
            transform: "translate(-50%, -100%)",
            zIndex: 9999,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
          className="glass-tooltip rounded px-2 py-1 text-sm font-medium shadow-lg"
          dir="ltr"
        >
          {translation}
        </span>,
        document.body,
      )
    : null;

  return (
    <span
      style={{ position: "relative", display: "inline" }}
      onClick={onClick}
      onMouseEnter={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setPos({ x: r.left + r.width / 2, y: r.top });
      }}
      onMouseLeave={() => setPos(null)}
    >
      {children}
      {tooltip}
    </span>
  );
}

type WordInfo = { verse: AssembledVerse; wordIndex: number } | null;

interface PageLinesProps {
  lines: string[][];
  wordInfoGrid: WordInfo[][];
  fontClass: string;
  arabicFontSize: string;
  wordSpacing: string;
  surahId: number;
  verseRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
}

const PageLines = memo(function PageLines({
  lines,
  wordInfoGrid,
  fontClass,
  arabicFontSize,
  wordSpacing,
  surahId,
  verseRefs,
}: PageLinesProps) {
  const { hoverTranslation, hoverRecitation, selectedReciter } = useApp();

  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = (url: string, key: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => { audioRef.current = null; setPlayingKey(null); };
    audio.onerror = () => { audioRef.current = null; setPlayingKey(null); };
    audio.play().catch(() => { audioRef.current = null; setPlayingKey(null); });
  };

  const playWordAudio = async (verseNumber: number, wordIndex: number) => {
    if (!hoverRecitation) return;
    const key = `${verseNumber}-${wordIndex}`;
    if (playingKey === key) return;
    setPlayingKey(key);

    const wordUrl = await getWordAudioUrl(surahId, verseNumber, wordIndex + 1);
    if (wordUrl) {
      playAudio(wordUrl, key);
    } else {
      const ayahUrl = await getAyahAudioUrl(surahId, verseNumber, selectedReciter);
      if (ayahUrl) playAudio(ayahUrl, key);
      else setPlayingKey(null);
    }
  };

  return (
    <div
      className={`${fontClass} text-center`}
      dir="rtl"
      style={{ fontSize: arabicFontSize, lineHeight: 1.8, wordSpacing }}
    >
      {lines.map((lineWords, lineIdx) => (
        <div key={lineIdx}>
          {lineWords.map((word, wordIdx) => {
            const info        = wordInfoGrid[lineIdx]?.[wordIdx] ?? null;
            const verse       = info?.verse;
            const wordIndex   = info?.wordIndex ?? -1;
            const translation = verse?.wbwTranslation?.[wordIndex];
            const isVerseIndicator = info === null;

            const trailing  = wordIdx < lineWords.length - 1 ? " " : "";
            const key       = verse ? `${verse.verseNumber}-${wordIndex}` : null;
            const isPlaying = key !== null && playingKey === key;

            const handleClick = (verse && !isVerseIndicator)
              ? () => playWordAudio(verse.verseNumber, wordIndex)
              : undefined;

            const refCallback = (el: HTMLSpanElement | null) => {
              if (el && wordIdx === 0 && verse) {
                verseRefs.current.set(
                  verse.verseNumber,
                  el as unknown as HTMLDivElement,
                );
              }
            };

            return (
              <WordTooltip
                key={wordIdx}
                translation={translation}
                enabled={hoverTranslation && !isVerseIndicator}
                onClick={handleClick}
              >
                <span
                  ref={refCallback}
                  className={`select-text transition-colors duration-200 relative
                    ${isPlaying ? "text-primary" : "text-foreground hover:text-primary"}
                  `}
                  style={{
                    cursor: !isVerseIndicator && hoverRecitation ? "pointer" : "text",
                  }}
                  onClick={handleClick}
                >
                  {word}{trailing}
                  {isPlaying && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </span>
              </WordTooltip>
            );
          })}
        </div>
      ))}
    </div>
  );
});

interface PageViewProps {
  surah: SurahMeta;
  assembledSurah: AssembledSurah;
  showArabicText: boolean;
  hoverTranslation: boolean;
  fontClass: string;
  arabicFontSize: string;
  translationFontSize: string;
  verseRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
  wordSpacing?: string;
}

export function PageView({
  surah,
  assembledSurah,
  showArabicText,
  hoverTranslation,
  fontClass,
  arabicFontSize,
  translationFontSize,
  verseRefs,
  wordSpacing = "1.8px",
}: PageViewProps) {
  const { verses, lines } = assembledSurah;

  const pages = useMemo(() => {
    const startPage     = surah.pages[0];
    const endPage       = surah.pages[1];
    const totalPages    = endPage - startPage + 1;
    const versesPerPage = Math.ceil(verses.length / totalPages);
    const result: { pageNumber: number; verses: AssembledVerse[] }[] = [];

    for (let i = 0; i < totalPages; i++) {
      const pageVerses = verses.slice(i * versesPerPage, (i + 1) * versesPerPage);
      if (pageVerses.length > 0) result.push({ pageNumber: startPage + i, verses: pageVerses });
    }

    return result;
  }, [surah, verses]);

  // FIX: pre-map every (lineIdx, wordIdx) → WordInfo once, with no mutable
  // cursor inside render. Verse indicators map to null so PageLines can detect
  // them without re-running the regex on every render.
  const wordInfoGrid = useMemo<WordInfo[][]>(() => {
    if (!lines) return [];

    const flat: { verse: AssembledVerse; wordIndex: number }[] = [];
    for (const verse of verses) {
      verse.words.forEach((_, i) => flat.push({ verse, wordIndex: i }));
    }

    let cursor = 0;
    return lines.map((lineWords) =>
      lineWords.map((word) => {
        if (VERSE_INDICATOR_RE.test(word.trim())) return null;
        return flat[cursor++] ?? null;
      })
    );
  }, [lines, verses]);

  return (
    <div className="space-y-12">
      {pages.map((page) => (
        <div key={page.pageNumber} className="glass-container !rounded-xl overflow-hidden !block">
          <div className="pt-4 px-6 sm:px-8 pb-0">

            {showArabicText && (
              lines ? (
                <PageLines
                  lines={lines}
                  wordInfoGrid={wordInfoGrid}
                  fontClass={fontClass}
                  arabicFontSize={arabicFontSize}
                  wordSpacing={wordSpacing}
                  surahId={surah.id}
                  verseRefs={verseRefs}
                />
              ) : hoverTranslation ? (
                <WordByWord
                  verses={page.verses.map((v) => ({
                    verseNumber: v.verseNumber,
                    words: v.words,
                    wbwTranslation: v.wbwTranslation,
                  }))}
                  surahId={surah.id}
                  align="right"
                  wordSpacing={wordSpacing}
                  fontClass={fontClass}
                  fontSizeOverride={arabicFontSize}
                />
              ) : (
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
                      className="inline select-text"
                    >
                      {verse.arabic}{" "}
                    </span>
                  ))}
                </div>
              )
            )}

            {!showArabicText && (
              <div className="space-y-1">
                {page.verses.map((verse) => (
                  <p
                    key={verse.verseNumber}
                    className="text-foreground leading-relaxed"
                    style={{ fontSize: translationFontSize }}
                  >
                    {verse.translation ?? null}
                  </p>
                ))}
              </div>
            )}

          </div>

          <div className="flex items-center justify-center pt-1 pb-2">
            <span className="text-xs text-muted-foreground">{page.pageNumber}</span>
          </div>
        </div>
      ))}
    </div>
  );
}