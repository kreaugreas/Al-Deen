import { Copy, MoreHorizontal, Bookmark, FileText, Share2, BookMarked } from "lucide-react";
import { cn } from "@/Middle/Library/utils";
import { WordByWord } from "@/Top/Component/Word-By-Word";
import { useBookmarks } from "@/Middle/Hook/Use-Bookmarks";
import { useAuth } from "@/Middle/Context/Auth-Context";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { toast } from "@/Middle/Hook/Use-Toast";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/Top/Component/UI/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Top/Component/UI/tooltip";
import type { AssembledVerse, SurahMeta } from "@/Bottom/API/Quran";

interface VerseCardProps {
  verse: AssembledVerse;
  surah: SurahMeta;
  showArabicText: boolean;
  verseTranslation: boolean;
  translationFontSize: string;
  isHighlighted: boolean;
  verseRef?: (el: HTMLDivElement | null) => void;
  onNotesClick: () => void;
  onShareClick: () => void;
}

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
    <div
      ref={verseRef}
      className={cn(
        "relative p-6 first:rounded-t-xl last:rounded-b-xl border border-border border-b-0 last:border-b transition-all duration-300",
        isHighlighted && "ring-2 ring-primary"
      )}
    >
      <div className="flex gap-4">
        <TooltipProvider>
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-sm font-medium">{surah.id}:{verse.verseNumber}</span>

            <Tooltip>
              <TooltipTrigger asChild>
                <button className="glass-hover p-1.5 rounded-lg transition-all" onClick={copyVerse}>
                  <Copy className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{t.quran.copy}</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="glass-hover p-1.5 rounded-lg transition-all">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
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
          </div>
        </TooltipProvider>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col justify-center order-2 md:order-1">
            {verseTranslation && verse.translation && (
              <p className="text-foreground leading-relaxed" style={{ fontSize: translationFontSize }}>
                {verse.translation}
              </p>
            )}
          </div>
          {showArabicText && (
            <div className="flex items-center justify-end order-1 md:order-2">
              <WordByWord
                words={verse.words}
                wbwTranslation={verse.wbwTranslation}
                verseNumber={verse.verseNumber}
                surahId={surah.id}
              />
            </div>
          )}
        </div>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={cn(
                "absolute bottom-3 right-3 glass-hover p-1.5 rounded-lg transition-all",
                isBookmarked(surah.id, verse.verseNumber)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
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
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">{t.quran.bookmark}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}