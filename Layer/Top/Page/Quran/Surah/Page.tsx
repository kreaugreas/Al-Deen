import { useParams, useSearchParams, Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Layout";
import { SurahNavbar } from "@/Top/Component/Surah/Navbar";
import { SurahNavigation } from "@/Top/Component/Surah/Navigation";
import { AudioPlayer } from "@/Top/Component/Audio-Player";
import { WordByWord } from "@/Top/Component/Word-By-Word";
import { NotesDialog } from "@/Top/Component/Dialog/Notes-Dialog";
import { ShareDialog } from "@/Top/Component/Dialog/Share-Dialog";
import { SurahInfoDialog } from "@/Top/Component/Dialog/Surah-Info-Dialog";
import { surahList, juzData } from "@/Bottom/API/Quran";
import { useApp } from "@/Middle/Context/App-Context";
import { useAudio } from "@/Middle/Context/Audio-Context";
import { useAuth } from "@/Middle/Context/Auth-Context";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { useQuranData } from "@/Middle/Hook/Use-Quran-Data";
import { useBookmarks } from "@/Middle/Hook/Use-Bookmarks";
import { useReadingProgress } from "@/Middle/Hook/Use-Reading-Progress";
import { useReadingSession } from "@/Middle/Hook/Use-Reading-Session";
import { useQuranGoals } from "@/Middle/Hook/Use-Quran-Goals";
import { Button } from "@/Top/Component/UI/button";
import { Skeleton } from "@/Top/Component/UI/skeleton";
import {
  Info, Play, Pause, Copy, MoreHorizontal, Bookmark,
  FileText, Share2, AlertCircle, Loader2, BookMarked
} from "lucide-react";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { cn } from "@/Middle/Library/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/Top/Component/UI/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Top/Component/UI/tooltip";
import { Alert, AlertDescription } from "@/Top/Component/UI/alert";
import { toast } from "@/Middle/Hook/Use-Toast";

const SurahPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const surahId = parseInt(id || "1");
  const surah = surahList.find((s) => s.id === surahId) || surahList[0];

const {
  layout, fontSize, translationFontSize, quranFont,
  showArabicText, verseTranslation, hoverTranslation, hoverRecitation,
} = useApp();
  const { t } = useTranslation();
  const { user } = useAuth();

  const {
    isPlaying: isAudioPlaying,
    isLoading: isAudioLoading,
    currentSurah: audioCurrentSurah,
    playFullSurah,
    togglePlayPause,
    stop: stopAudio,
  } = useAudio();

  const { data: surahData, isLoading, error } = useQuranData(surahId);
  const verses = surahData?.verses;

  const { addBookmark, removeBookmark, isBookmarked, getBookmarkId } = useBookmarks();
  const { updateProgress } = useReadingProgress();
  const { startSession, stopSession, saveMinutesToGoal } = useReadingSession();
  const { activeGoal } = useQuranGoals();

  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const verseRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  const [notesDialog, setNotesDialog]   = useState<{ open: boolean; ayahId?: number; verseText?: string }>({ open: false });
  const [shareDialog, setShareDialog]   = useState<{ open: boolean; ayahId?: number; verseText?: string; translation?: string }>({ open: false });
  const [surahInfoDialog, setSurahInfoDialog] = useState(false);

  const isThisSurahPlaying = audioCurrentSurah === surahId && isAudioPlaying;
  const targetVerse = searchParams.get('verse');
  const isPageLayout = layout === "page";

  const { currentJuz, currentHizb, currentPage } = useMemo(() => {
    const juzInfo = juzData.find(juz => juz.surahs.some(s => s.id === surahId));
    const juzNumber = juzInfo?.juzNumber || 1;
    const hizbNumber = (juzNumber - 1) * 2 + 1;
    const totalVersesBefore = surahList.filter(s => s.id < surahId).reduce((sum, s) => sum + s.numberOfAyahs, 0);
    const pageNumber = Math.ceil((totalVersesBefore / 6236) * 604) || 1;
    return { currentJuz: juzNumber, currentHizb: hizbNumber, currentPage: pageNumber };
  }, [surahId]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || !verses?.length) return;
    const container = containerRef.current;
    const scrollPosition = window.scrollY - container.offsetTop + window.innerHeight;
    const progress = Math.min(100, Math.max(0, (scrollPosition / container.scrollHeight) * 100));
    setReadingProgress(progress);

    let visibleVerse = 1;
    verseRefs.current.forEach((element, verseId) => {
      if (element.getBoundingClientRect().top <= window.innerHeight / 2) visibleVerse = verseId;
    });
    if (visibleVerse > 1) updateProgress(surahId, visibleVerse);
  }, [verses, surahId, updateProgress]);

  useEffect(() => {
    startSession();
    return () => {
      stopSession().then((minutes) => {
        if (activeGoal && minutes > 0) saveMinutesToGoal(activeGoal.id, minutes);
      });
    };
  }, [surahId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (targetVerse && verses) {
      const verseElement = verseRefs.current.get(parseInt(targetVerse));
      if (verseElement) setTimeout(() => verseElement.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [surahId, targetVerse, verses]);

  const getArabicFontSize    = () => `${(1.5 * fontSize) / 5}rem`;
  const getTranslationFontSize = () => `${(1 * translationFontSize) / 3}rem`;

  const getFontClass = () => {
    switch (quranFont) {
      case "indopak":    return "font-indopak";
      case "uthmani_v1": return "font-uthmani_v1";
      case "uthmani_v2": return "font-uthmani_v2";
      case "uthmani_v4": return "font-uthmani_v4";
      default:           return "font-uthmani";
    }
  };

  const copyVerse = async (verse: any) => {
    const text = `${verse.arabic}\n\n${verse.translation}\n\n- ${surah.englishName} ${surah.id}:${verse.verseNumber}`;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleBookmark = async (ayahId: number) => {
    const bookmarked = isBookmarked(surahId, ayahId);
    if (bookmarked) {
      const bookmarkId = getBookmarkId(surahId, ayahId);
      if (bookmarkId) await removeBookmark(bookmarkId);
    } else {
      await addBookmark(surahId, ayahId);
    }
  };

  const showBismillah = surahId !== 1 && surahId !== 9;

  if (isLoading) {
    return (
      <Layout hideFooter>
        <SurahNavbar surahName={surah.englishName} surahId={surah.id} juz={currentJuz} hizb={currentHizb} page={currentPage} />
        <div className="container py-8 max-w-4xl mx-auto pb-24">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-6 border border-border rounded-xl">
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout hideFooter>
        <SurahNavbar surahName={surah.englishName} surahId={surah.id} juz={currentJuz} hizb={currentHizb} page={currentPage} />
        <div className="container py-8 max-w-4xl mx-auto pb-24">
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load Surah data. Please try again later.</AlertDescription>
          </Alert>
          <div className="text-center">
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
      <SurahNavbar
        surahName={surah.englishName}
        surahId={surah.id}
        juz={currentJuz}
        hizb={currentHizb}
        page={currentPage}
        progress={readingProgress}
      />

      <div ref={containerRef} className="container pt-28 max-w-4xl mx-auto pb-24">
        {/* Bismillah */}
        {showBismillah && showArabicText && (
          <div className="text-center mb-6">
            <p className={`${getFontClass()} text-2xl text-foreground leading-loose`} dir="rtl">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        )}

        {/* Surah-level actions */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <TooltipProvider>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSurahInfoDialog(true)}
                className="glass-hover flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
              >
                <Info className="h-4 w-4" />
                {t.quran.surahInfo}
              </button>

              <button
                className="glass-btn px-4 py-2.5 gap-2 text-sm text-primary disabled:opacity-50"
                disabled={isAudioLoading}
                onClick={() => {
                  if (isThisSurahPlaying) {
                    togglePlayPause();
                  } else if (audioCurrentSurah === surahId && !isAudioPlaying) {
                    togglePlayPause();
                    setShowAudioPlayer(true);
                  } else {
                    playFullSurah(surahId);
                    setShowAudioPlayer(true);
                  }
                }}
              >
                {isAudioLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Loading...</>
                ) : isThisSurahPlaying ? (
                  <><Pause className="h-4 w-4 fill-current" />{t.quran.pauseAudio}</>
                ) : (
                  <><Play className="h-4 w-4 fill-current" />{t.quran.playAudio}</>
                )}
              </button>
            </div>
          </TooltipProvider>
        </div>

        {/* Verses */}
        {verses && verses.length > 0 && (
          isPageLayout ? (
            /* ── Page Layout ── */
            <div className="space-y-8">
              {(() => {
                const startPage = surah.pages[0];
                const endPage   = surah.pages[1];
                const totalPages = endPage - startPage + 1;
                const versesPerPage = Math.ceil(verses.length / totalPages);
                const pages: { pageNumber: number; verses: typeof verses }[] = [];

                for (let i = 0; i < totalPages; i++) {
                  const pageVerses = verses.slice(i * versesPerPage, (i + 1) * versesPerPage);
                  if (pageVerses.length > 0) pages.push({ pageNumber: startPage + i, verses: pageVerses });
                }

                return pages.map((page) => (
                  <div key={page.pageNumber} className="relative glass-container !rounded-xl overflow-hidden !block">
                    <div className="p-6 sm:p-8 relative z-10">
                      {showArabicText && (
                        <div
                          className={`${getFontClass()} leading-[2.8] text-justify`}
                          dir="rtl"
                          style={{ fontSize: getArabicFontSize(), textAlignLast: 'center' }}
                        >
                          {page.verses.map((verse) => (
                            <span
                              key={verse.verseNumber}
                              ref={(el) => { if (el) verseRefs.current.set(verse.verseNumber, el as unknown as HTMLDivElement); }}
                              className="inline"
                            >
                              <span className="inline hover:text-primary transition-colors duration-200 cursor-default">
                                {verse.arabic}{' '}
                              </span>
                            </span>
                          ))}
                        </div>
                      )}

                      {showArabicText && hoverTranslation && (
                        <div className="mt-6 border-t border-border pt-4">
                          {page.verses.map((verse) => {
                            if (!verse.words?.length) return null;
                            return (
                              <div key={`wbw-${verse.verseNumber}`} className="mb-4">
                                <span className="text-xs text-muted-foreground mb-1 block">{surah.id}:{verse.verseNumber}</span>
                                <WordByWord
                                  words={verse.words}
                                  wbwTranslation={verse.wbwTranslation}
                                  verseNumber={verse.verseNumber}
                                  surahId={surahId}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {!showArabicText && (
                        <div className="space-y-4">
                          {page.verses.map((verse) => (
                            <div key={verse.verseNumber} className="flex gap-3">
                              <span className="text-sm font-medium text-muted-foreground shrink-0 pt-1">{verse.verseNumber}.</span>
                              <p className="text-foreground leading-relaxed" style={{ fontSize: getTranslationFontSize() }}>
                                {verse.translation}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center px-6 py-2 relative z-10">
                      <span className="text-xs text-muted-foreground">{page.pageNumber}</span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          ) : (
            /* ── Ayah Layout ── */
            <div className="space-y-0">
              {verses.map((verse) => (
                <div
                  key={verse.verseNumber}
                  ref={(el) => { if (el) verseRefs.current.set(verse.verseNumber, el); }}
                  className={cn(
                    "relative p-6 first:rounded-t-xl last:rounded-b-xl border border-border border-b-0 last:border-b transition-all duration-300",
                    targetVerse && parseInt(targetVerse) === verse.verseNumber && "ring-2 ring-primary",
                  )}
                >
                  <div className="flex gap-4">
                    <TooltipProvider>
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <span className="text-sm font-medium">{surah.id}:{verse.verseNumber}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="glass-hover p-1.5 rounded-lg transition-all" onClick={() => copyVerse(verse)}>
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
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer"
                              onClick={() => setNotesDialog({ open: true, ayahId: verse.verseNumber, verseText: verse.arabic })}
                            >
                              <FileText className="h-4 w-4" />
                              {t.quran.myNotes}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer"
                              onClick={() => setShareDialog({ open: true, ayahId: verse.verseNumber, verseText: verse.arabic, translation: verse.translation })}
                            >
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
                          <p className="text-foreground leading-relaxed" style={{ fontSize: getTranslationFontSize() }}>
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
                            surahId={surahId}
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
                            isBookmarked(surahId, verse.verseNumber) ? "text-primary" : "text-muted-foreground hover:text-primary"
                          )}
                          onClick={() => {
                            if (!user) {
                              toast({ title: "Sign in required", description: "Please sign in to bookmark verses" });
                              return;
                            }
                            handleBookmark(verse.verseNumber);
                          }}
                        >
                          {isBookmarked(surahId, verse.verseNumber)
                            ? <BookMarked className="h-4 w-4 fill-current" />
                            : <Bookmark className="h-4 w-4" />
                          }
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left">{t.quran.bookmark}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ))}
            </div>
          )
        )}

        <SurahNavigation currentSurahId={surahId} />
      </div>

      <AudioPlayer
        isVisible={showAudioPlayer}
        onClose={() => { stopAudio(); setShowAudioPlayer(false); }}
      />

      <NotesDialog open={notesDialog.open} onOpenChange={(open) => setNotesDialog({ ...notesDialog, open })} surahId={surahId} ayahId={notesDialog.ayahId} verseText={notesDialog.verseText} />
      <ShareDialog open={shareDialog.open} onOpenChange={(open) => setShareDialog({ ...shareDialog, open })} surahId={surahId} ayahId={shareDialog.ayahId} verseText={shareDialog.verseText} translation={shareDialog.translation} />
      <SurahInfoDialog open={surahInfoDialog} onOpenChange={setSurahInfoDialog} surahId={surahId} />
    </Layout>
  );
};

export default SurahPage;