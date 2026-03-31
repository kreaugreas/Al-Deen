// Layer/Top/Component/Quran/Layout/Safhah/Utility.tsx
import React, { useRef } from "react";
import { getWordAudioUrl, getAyahAudioUrl } from "@/Bottom/API/Quran";
import { useApp } from "@/Middle/Context/App";
import { Tooltip } from "@/Top/Component/UI/Tooltip";
import type { WordTooltipProps } from "./Types";

export function WordTooltip({ 
  translation, 
  enabled, 
  onClick, 
  onMouseEnter, 
  onMouseLeave, 
  children 
}: WordTooltipProps) {
  return (
    <Tooltip content={translation} enabled={enabled} side="top" offset={20}>
      <span
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ display: "inline" }}
      >
        {children}
      </span>
    </Tooltip>
  );
}

export function useAudioPlayback(surahId: number) {
  const { hoverRecitation, selectedReciter } = useApp();
  const [playingKey, setPlayingKey] = React.useState<string | null>(null);
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
    const key = `word-${verseNumber}-${wordIndex}`;
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

  const playVerseAudio = async (verseNumber: number) => {
    const key = `ayah-${verseNumber}`;
    if (playingKey === key) return;
    setPlayingKey(key);

    const ayahUrl = await getAyahAudioUrl(surahId, verseNumber, selectedReciter);
    if (ayahUrl) playAudio(ayahUrl, key);
    else setPlayingKey(null);
  };

  const isPlaying = (key: string) => playingKey === key;

  return { playingKey, playWordAudio, playVerseAudio, isPlaying };
}

export const extractVerseNumberFromMarker = (glyph: string): number | null => {
  if (!glyph) return null;
  if (glyph.includes(':')) {
    const parts = glyph.split(':');
    const maybeVerse = parts[0];
    const num = parseInt(maybeVerse, 10);
    return isNaN(num) ? null : num;
  }
  const num = parseInt(glyph, 10);
  return isNaN(num) ? null : num;
}