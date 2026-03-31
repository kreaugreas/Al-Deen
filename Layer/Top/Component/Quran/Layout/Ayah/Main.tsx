// Layer/Top/Component/Quran/Layout/Safhah/Ayah/Main.tsx
import { Copy, MoreHorizontal, Bookmark, FileText, Share2, BookMarked } from "lucide-react";
import { cn } from "@/Middle/Library/utils";
import { useBookmarks } from "@/Middle/Hook/Use-Bookmarks";
import { useAuth } from "@/Middle/Context/Auth";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { toast } from "@/Middle/Hook/Use-Toast";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/Top/Component/UI/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Top/Component/UI/tooltip";
import { useAudio } from "@/Middle/Context/Audio";
import { useApp } from "@/Middle/Context/App";
import { WordTooltip, useAudioPlayback } from "../Safhah/Utility";
import { useState, useMemo } from "react";
import { Container } from "@/Top/Component/UI/Container";
import { Button } from "@/Top/Component/UI/Button";
import type { VerseCardProps } from "./Types";

export function VerseCard({
  verse,
  surah,
  showArabicText,
  verseTranslation,
  translationFontSize,
  isHighlighted,
  verseRef,
  onNotesClick,
  onShareClick,
}: VerseCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { addBookmark, removeBookmark, isBookmarked, getBookmarkId } = useBookmarks();
  const { playAyah, activeVerse, activeWord } = useAudio();
  const { hoverTranslation, hoverRecitation, fontSize, quranFont } = useApp();
  const { playingKey, playWordAudio, isPlaying } = useAudioPlayback(surah.id);

  const [hoveredVerse, setHoveredVerse] = useState<number | null>(null);

  const computedFontClass = useMemo(() => {
    switch (quranFont) {
      case "indopak":    return "font-indopak";
      case "uthmani_v1": return "font-uthmani_v1";
      case "uthmani_v2": return "font-uthmani_v2";
      case "uthmani_v4": return "font-uthmani_v4";
      default:           return "font-uthmani";
    }
  }, [quranFont]);

  const arabicFontSize = useMemo(() => `${(1.5 * fontSize) / 5}rem`, [fontSize]);

  const handleBookmark = async () => {
    const bookmarked = isBookmarked(surah.id, verse.verseNumber);
    if (bookmarked) {
      const bookmarkId = getBookmarkId(surah.id, verse.verseNumber);
      if (bookmarkId) await removeBookmark(bookmarkId);
    } else {
      await addBookmark(surah.id, verse.verseNumber);
    }
  };

  const copyVerse = async () => {
    const text = `${verse.arabic}\n\n${verse.translation}\n\n- ${surah.englishName} ${surah.id}:${verse.verseNumber}`;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  return (
    <Container 
      ref={verseRef} 
      className={cn(
        "mb-6", // Add margin bottom for gap between cards
        isHighlighted && "ring-2 ring-primary"
      )}
    >
      <div className="pt-4 px-6 sm:px-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => playAyah(surah.id, verse.verseNumber)}
            onMouseEnter={() => setHoveredVerse(verse.verseNumber)}
            onMouseLeave={() => setHoveredVerse(null)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {surah.id}:{verse.verseNumber}
          </button>

          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" className="p-1.5 rounded-lg" onClick={copyVerse}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{t.quran.copy}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm"
                    className="p-1.5 rounded-lg"
                    onClick={() => {
                      if (!user) {
                        toast({ title: "Sign in required", description: "Please sign in to bookmark verses" });
                        return;
                      }
                      handleBookmark();
                    }}
                  >
                    {isBookmarked(surah.id, verse.verseNumber)
                      ? <BookMarked className="h-4 w-4 fill-current" />
                      : <Bookmark className="h-4 w-4" />
                    }
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{t.quran.bookmark}</TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="p-1.5 rounded-lg">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 z-[100]">
                  <DropdownMenuItem className="gap-2 cursor-pointer" onClick={onNotesClick}>
                    <FileText className="h-4 w-4" />
                    {t.quran.myNotes}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 cursor-pointer" onClick={onShareClick}>
                    <Share2 className="h-4 w-4" />
                    {t.quran.share}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          </div>
        </div>

        {showArabicText && (
          <div className="flex justify-end mb-6">
            <div
              className={computedFontClass}
              style={{ fontSize: arabicFontSize, lineHeight: 1.8 }}
              dir="rtl"
            >
              {verse.words.map((glyph, idx) => {
                const isVerseEnd = idx === verse.words.length - 1;
                const belongsToVerse = verse.verseNumber;
                const isVerseHighlighted = hoveredVerse !== null && belongsToVerse === hoveredVerse;

                const translation = (!isVerseEnd && verse.wbwTranslation?.[idx]) || undefined;
                const wordKey = `word-${verse.verseNumber}-${idx}`;
                const ayahKey = `ayah-${verse.verseNumber}`;
                const isPlayingAudio = isPlaying(wordKey) || isPlaying(ayahKey);
                const isActive = !isVerseEnd && verse.verseNumber === activeVerse && idx === activeWord;

                let handleClick: (() => void) | undefined;
                if (isVerseEnd) {
                  handleClick = () => playAyah(surah.id, verse.verseNumber);
                } else {
                  handleClick = () => playWordAudio(verse.verseNumber, idx);
                }

                const handleMouseEnter = () => {
                  if (isVerseEnd) {
                    setHoveredVerse(verse.verseNumber);
                  }
                };

                const handleMouseLeave = () => {
                  if (isVerseEnd) {
                    setHoveredVerse(null);
                  }
                };

                let className = "inline select-text transition-colors duration-200 ";
                if (isVerseHighlighted && !isVerseEnd) {
                  className += "text-primary";
                } else if (isActive) {
                  className += "text-emerald-500 animate-pulse";
                } else if (isPlayingAudio) {
                  className += "text-primary animate-pulse";
                } else if (isVerseEnd) {
                  className += "text-muted-foreground hover:text-primary cursor-pointer";
                } else {
                  className += "text-foreground hover:text-primary";
                }

                let cursorStyle = "text";
                if (isVerseEnd) {
                  cursorStyle = "pointer";
                } else if (hoverRecitation) {
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
                      className={className}
                      style={{ cursor: cursorStyle }}
                      onClick={handleClick}
                    >
                      {glyph}{' '}
                    </span>
                  </WordTooltip>
                );
              })}
            </div>
          </div>
        )}

        {verseTranslation && verse.translation && (
          <div>
            <p 
              className="text-foreground leading-relaxed"
              style={{ fontSize: translationFontSize }}
            >
              {verse.translation}
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}