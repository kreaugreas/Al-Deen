import { useRef, useState, memo, useEffect } from "react";
import DOMPurify from "dompurify";
import { Skeleton } from "@/Top/Component/UI/Skeleton";
import { ScrollArea } from "@/Top/Component/UI/Scroll-Area";
import { Container } from "@/Top/Component/UI/Container";
import { Button } from "@/Top/Component/UI/Button";
import { 
  X, BookOpen, ChevronLeft, ChevronRight, 
  Loader2, AlertCircle, BookMarked 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/Middle/Hook/Use-Mobile";

const BASE_URL = "https://api.quran.com/api/v4";

// ============== TYPES ==============
interface TafsirWork {
  id: number;
  name: string;
  author_name: string;
  language: string;
}

interface TafsirEntry {
  id: number;
  ayah_key: string;
  text: string;               // HTML content
  resource_name: string;
  language: string;
}

interface TafsirDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surahId: number;            // required
  verseNumber?: number;       // default 1
}

// ============== API HELPERS ==============
async function fetchTafsirList(): Promise<TafsirWork[]> {
  const response = await fetch(`${BASE_URL}/resources/tafsirs`);
  if (!response.ok) throw new Error("Failed to fetch Tafsir list");
  const data = await response.json();
  return data.tafsirs;
}

async function fetchTafsirForAyah(
  tafsirId: number,
  surahId: number,
  verseNumber: number
): Promise<TafsirEntry | null> {
  const ayahKey = `${surahId}:${verseNumber}`;
  const response = await fetch(`${BASE_URL}/tafsirs/${tafsirId}/by_ayah/${ayahKey}`);
  if (response.status === 404) return null; // no tafsir for this verse
  if (!response.ok) throw new Error(`Failed to fetch Tafsir for ${ayahKey}`);
  const data = await response.json();
  return data.tafsir;
}

// ============== MAIN COMPONENT ==============
export const TafsirDialog = memo(function TafsirDialog({
  open,
  onOpenChange,
  surahId,
  verseNumber = 1,
}: TafsirDialogProps) {
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Local state for the current verse (allows navigation)
  const [currentVerse, setCurrentVerse] = useState(verseNumber);
  // Selected Tafsir ID (persist in localStorage if you like)
  const [selectedTafsirId, setSelectedTafsirId] = useState<number | null>(null);

  // Reset current verse when surahId changes or dialog opens with new verseNumber
  useEffect(() => {
    if (open) {
      setCurrentVerse(verseNumber);
    }
  }, [open, verseNumber, surahId]);

  // Fetch list of available Tafsirs
  const {
    data: tafsirWorks,
    isLoading: isLoadingWorks,
    error: worksError,
  } = useQuery({
    queryKey: ["tafsir-works"],
    queryFn: fetchTafsirList,
    enabled: open,
  });

  // Once works are loaded, select the first one if none selected
  useEffect(() => {
    if (tafsirWorks && tafsirWorks.length > 0 && selectedTafsirId === null) {
      setSelectedTafsirId(tafsirWorks[0].id);
    }
  }, [tafsirWorks, selectedTafsirId]);

  // Fetch Tafsir content for current verse and selected Tafsir
  const {
    data: tafsir,
    isLoading: isLoadingTafsir,
    error: tafsirError,
    refetch,
  } = useQuery({
    queryKey: ["tafsir", selectedTafsirId, surahId, currentVerse],
    queryFn: () =>
      selectedTafsirId
        ? fetchTafsirForAyah(selectedTafsirId, surahId, currentVerse)
        : Promise.resolve(null),
    enabled: open && !!selectedTafsirId,
  });

  // Navigation handlers
  const goToPreviousVerse = () => {
    if (currentVerse > 1) {
      setCurrentVerse((prev) => prev - 1);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToNextVerse = () => {
    // Note: we don't know max verses in this component.
    // You can pass `totalVerses` as prop or fetch surah info.
    // For simplicity, we allow any positive number; parent can cap it.
    setCurrentVerse((prev) => prev + 1);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!open) return null;

  // Helper to render the main content area
  const renderContent = () => (
    <div className="space-y-6">
      {/* Tafsir Selector */}
      <Container className="!py-4 !px-6">
        <div className="flex items-center gap-3 flex-wrap">
          <BookMarked className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Tafsir:</span>
          {isLoadingWorks ? (
            <Skeleton className="h-8 w-48" />
          ) : worksError ? (
            <span className="text-sm text-destructive">Failed to load Tafsir list</span>
          ) : (
            <select
              className="flex-1 min-w-[180px] px-3 py-1.5 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedTafsirId ?? ""}
              onChange={(e) => setSelectedTafsirId(Number(e.target.value))}
            >
              {tafsirWorks?.map((work) => (
                <option key={work.id} value={work.id}>
                  {work.name} – {work.author_name} ({work.language})
                </option>
              ))}
            </select>
          )}
        </div>
      </Container>

      {/* Verse Navigation */}
      <Container className="!py-3 !px-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousVerse}
            disabled={currentVerse <= 1}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            Verse {currentVerse}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextVerse}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Container>

      {/* Tafsir Content */}
      <Container className="!py-5 !px-6">
        {isLoadingTafsir ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : tafsirError ? (
          <div className="text-center py-8 text-destructive flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8" />
            <p>Failed to load Tafsir. Please try again.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : tafsir ? (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Commentary by {tafsir.resource_name}
            </h3>
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tafsir.text) }}
            />
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No Tafsir available for this verse in the selected work.</p>
            <p className="text-sm mt-2">Try another Tafsir or verse.</p>
          </div>
        )}
      </Container>
    </div>
  );

  // Mobile full‑screen layout
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-40 bg-background pt-[72px]">
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Tafsir – Sūrah {surahId}, Verse {currentVerse}
              </h2>
              <Button
                size="sm"
                className="w-8 h-8 p-0 rounded-full"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout (centered, with max-width)
  return (
    <div className="fixed inset-0 z-40 bg-background pt-[72px]">
      <ScrollArea className="h-full" ref={scrollRef}>
        <div className="p-6 mx-auto max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Tafsir – Sūrah {surahId}, Verse {currentVerse}
            </h2>
            <Button
              size="sm"
              className="w-8 h-8 p-0 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {renderContent()}
        </div>
      </ScrollArea>
    </div>
  );
});