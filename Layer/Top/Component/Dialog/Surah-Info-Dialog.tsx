import { useRef, memo } from "react";
import DOMPurify from "dompurify";
import { Skeleton } from "@/Top/Component/UI/skeleton";
import { BookOpen, MapPin, FileText, Calendar, Hash } from "lucide-react";
import { surahList } from "@/Bottom/API/Quran";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/Middle/Hook/Use-Mobile";
import { ScrollArea } from "@/Top/Component/UI/scroll-area";

const BASE_URL = 'https://api.quran.com/api/v4';

interface ChapterInfo {
  chapter_id: number;
  text: string;
  short_text: string;
  language_name: string;
  source: string;
}

async function fetchChapterInfo(chapterId: number): Promise<ChapterInfo | null> {
  try {
    const response = await fetch(`${BASE_URL}/chapters/${chapterId}/info?language=en`);
    if (!response.ok) throw new Error('Failed to fetch chapter info');
    const data = await response.json();
    return data.chapter_info;
  } catch (error) {
    console.error('Error fetching chapter info:', error);
    return null;
  }
}

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

interface SurahInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surahId: number;
}

export const SurahInfoDialog = memo(function SurahInfoDialog({ open, onOpenChange, surahId }: SurahInfoDialogProps) {
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const surah = surahList.find((s) => s.id === surahId);

  const { data: chapterInfo, isLoading } = useQuery({
    queryKey: ['chapter-info', surahId],
    queryFn: () => fetchChapterInfo(surahId),
    enabled: open && !!surahId,
  });

  const scrollToTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

  if (!open || !surah) return null;

  const renderContent = () => (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Overview Card */}
      <div className="glass-card p-6 text-center">
        <p className="font-surah text-4xl mb-4 text-primary">{surah.surahFontName}</p>
        <p className="text-xl font-semibold">{surah.englishName}</p>
        <p className="text-sm text-muted-foreground mt-1">{surah.englishNameTranslation}</p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="glass-card p-3">
            <Hash className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Surah</p>
            <p className="font-semibold">{String(surahId).padStart(3, '0')}</p>
          </div>
          <div className="glass-card p-3">
            <FileText className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Verses</p>
            <p className="font-semibold">{surah.numberOfAyahs}</p>
          </div>
          <div className="glass-card p-3">
            <MapPin className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Revealed</p>
            <p className="font-semibold">{surah.revelationType === "Meccan" ? "Makkah" : "Madinah"}</p>
          </div>
          <div className="glass-card p-3">
            <Calendar className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Order</p>
            <p className="font-semibold">{surahId}{getOrdinalSuffix(surahId)}</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div>
        <p className="text-muted-foreground leading-relaxed">
          Surah {surah.englishName} ({surah.name}) is the {surahId}{getOrdinalSuffix(surahId)} chapter of the Holy Quran with {surah.numberOfAyahs} verses, revealed in {surah.revelationType === "Meccan" ? "Makkah" : "Madinah"}.
        </p>
      </div>

      {/* Detailed Info */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : chapterInfo ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />About this Surah
          </h2>
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(chapterInfo.text) }} />
          {chapterInfo.source && <p className="text-xs text-muted-foreground mt-6 pt-4 border-t border-border/50">Source: {chapterInfo.source}</p>}
        </div>
      ) : null}

    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-40 bg-background pt-[72px]">
        <div ref={scrollRef} className="h-full overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-semibold text-foreground text-center">
              Surah Info – {surah.englishName}
            </h2>
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-background pt-[72px]">
      <ScrollArea className="h-full" ref={scrollRef}>
        <div className="p-6 mx-auto max-w-2xl">
          <h2 className="text-lg font-semibold text-foreground mb-6 text-center">
            Surah Info – {surah.englishName}
          </h2>
          {renderContent()}
        </div>
      </ScrollArea>
    </div>
  );
});
