import { useState, useCallback, memo, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useApp } from "@/Middle/Context/App-Context";
import { getWordAudioUrl, getAyahAudioUrl } from "@/Bottom/API/Quran";

const VERSE_INDICATOR_RE = /^[\u0660-\u0669\u06F0-\u06F9\u06DD۝\s]+$/;

export interface VerseUnit {
  verseNumber: number;
  words: string[];
  wbwTranslation?: string[];
}

interface WordByWordProps {
  verses: VerseUnit[];
  surahId: number;
  align?: "center" | "right";
  wordSpacing?: string;
  fontClass?: string;
  fontSizeOverride?: string;
}

interface WordTooltipProps {
  translation?: string;
  enabled: boolean;
  children: React.ReactNode;
}

function WordTooltip({ translation, enabled, children }: WordTooltipProps) {
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

export const WordByWord = memo(function WordByWord({
  verses,
  surahId,
  align = "right",
  wordSpacing = "1.8px",
  fontClass: fontClassProp,
  fontSizeOverride,
}: WordByWordProps) {
  const {
    hoverTranslation,
    hoverRecitation,
    inlineTranslation,
    fontSize,
    quranFont,
    selectedReciter,
  } = useApp();

  const computedFontSize = useMemo(() => `${(1.5 * fontSize) / 5}rem`, [fontSize]);
  const fontSizeValue = fontSizeOverride ?? computedFontSize;

  const computedFontClass = useMemo(() => {
    switch (quranFont) {
      case "indopak":    return "font-indopak";
      case "uthmani_v1": return "font-uthmani_v1";
      case "uthmani_v2": return "font-uthmani_v2";
      case "uthmani_v4": return "font-uthmani_v4";
      default:           return "font-uthmani";
    }
  }, [quranFont]);
  const resolvedFontClass = fontClassProp ?? computedFontClass;

  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = (url: string) => {
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

  const playWordAudio = useCallback(
    async (verseNumber: number, wordIndex: number) => {
      if (!hoverRecitation) return;
      const key = `${verseNumber}-${wordIndex}`;
      if (playingKey === key) return;
      setPlayingKey(key);

      const wordUrl = await getWordAudioUrl(surahId, verseNumber, wordIndex + 1);
      if (wordUrl) {
        playAudio(wordUrl);
      } else {
        const ayahUrl = await getAyahAudioUrl(surahId, verseNumber, selectedReciter);
        if (ayahUrl) playAudio(ayahUrl);
        else setPlayingKey(null);
      }
    },
    [playingKey, surahId, selectedReciter, hoverRecitation],
  );

  if (inlineTranslation) {
    return (
      <div className="space-y-2">
        {verses.map((verse) => {
          const cleanWords   = verse.words.filter(w => !VERSE_INDICATOR_RE.test(w.trim()));
          const translations = verse.wbwTranslation ?? [];

          return (
            <div
              key={verse.verseNumber}
              className={`flex flex-wrap gap-x-4 gap-y-4 ${
                align === "center" ? "justify-center" : "justify-end"
              }`}
              dir="rtl"
              style={{ wordSpacing }}
            >
              {cleanWords.map((arabic, index) => {
                const key       = `${verse.verseNumber}-${index}`;
                const transl    = translations[index];
                const isPlaying = playingKey === key;

                return (
                  <div key={key} className="flex flex-col items-center">
                    <WordTooltip translation={transl} enabled={hoverTranslation}>
                      <span
                        className={`
                          transition-colors duration-200 relative select-text
                          ${resolvedFontClass}
                          ${isPlaying ? "text-primary" : "text-foreground hover:text-primary"}
                        `}
                        style={{
                          fontSize: fontSizeValue,
                          cursor: hoverTranslation || hoverRecitation ? "pointer" : "text",
                        }}
                        onClick={() => playWordAudio(verse.verseNumber, index)}
                      >
                        {arabic}
                        {isPlaying && (
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </span>
                    </WordTooltip>
                    {transl && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                        {transl}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`${resolvedFontClass} leading-[2.8] ${
        align === "center" ? "text-center" : "text-right"
      }`}
      dir="rtl"
      style={{ fontSize: fontSizeValue, wordSpacing }}
    >
      {verses.map((verse) => {
        const cleanWords   = verse.words.filter(w => !VERSE_INDICATOR_RE.test(w.trim()));
        const translations = verse.wbwTranslation ?? [];

        return cleanWords.map((arabic, index) => {
          const key       = `${verse.verseNumber}-${index}`;
          const transl    = translations[index];
          const isPlaying = playingKey === key;

          return (
            <WordTooltip key={key} translation={transl} enabled={hoverTranslation}>
              <span
                className={`
                  inline select-text transition-colors duration-200
                  ${isPlaying ? "text-primary" : "text-foreground hover:text-primary"}
                `}
                style={{
                  cursor: hoverTranslation || hoverRecitation ? "pointer" : "text",
                }}
                onClick={() => playWordAudio(verse.verseNumber, index)}
              >
                {arabic}{' '}
                {isPlaying && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </span>
            </WordTooltip>
          );
        });
      })}
    </div>
  );
});