import { useParams } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Layout";
import { SurahNavbar } from "@/Top/Component/Surah/Navbar";
import { SurahNavigation } from "@/Top/Component/Surah/Navigation";
import { AudioPlayer } from "@/Top/Component/Audio-Player";
import { Action } from "@/Top/Component/Quran/Action";
import { Bismillah } from "@/Top/Component/Quran/Bismillah";
import { NotesDialog } from "@/Top/Component/Dialog/Notes-Dialog";
import { ShareDialog } from "@/Top/Component/Dialog/Share-Dialog";
import { SurahInfoDialog } from "@/Top/Component/Dialog/Surah-Info-Dialog";
import { surahList, juzData } from "@/Bottom/API/Quran";
import { useApp } from "@/Middle/Context/App-Context";
import { useAudio } from "@/Middle/Context/Audio-Context";
import { useQuranData } from "@/Middle/Hook/Use-Quran-Data";
import { useReadingSession } from "@/Middle/Hook/Use-Reading-Session";
import { useQuranGoals } from "@/Middle/Hook/Use-Quran-Goals";
import { Button } from "@/Top/Component/UI/button";
import { Skeleton } from "@/Top/Component/UI/skeleton";
import { AlertCircle } from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { Alert, AlertDescription } from "@/Top/Component/UI/alert";
import { cn } from "@/Middle/Library/utils";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/Top/Component/UI/tooltip";
import { getWordAudioPath } from "@/Bottom/API/Quran";

const KalimaIndex = () => {
  const { id, verseId, kalimaId } = useParams<{ id: string; verseId: string; kalimaId: string }>();
  const surahId   = parseInt(id || "1");
  const verseNum  = parseInt(verseId || "1");
  const kalimaNum = parseInt(kalimaId || "1"); // 1-based

  const surah = surahList.find((s) => s.id === surahId) || surahList[0];

  const {
    layout, fontSize, translationFontSize, quranFont,
    showArabicText, verseTranslation, hoverTranslation, hoverRecitation,
  } = useApp();

  const { stop: stopAudio } = useAudio();
  const { data: surahData, isLoading, error } = useQuranData(surahId);
  const verses = surahData?.verses;
  const verse  = verses?.find((v) => v.verseNumber === verseNum);
  const word   = verse?.words?.[kalimaNum - 1];
  const wbwTranslation = verse?.wbwTranslation?.[kalimaNum - 1];

  const { startSession, stopSession, saveMinutesToGoal } = useReadingSession();
  const { activeGoal } = useQuranGoals();

  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [surahInfoDialog, setSurahInfoDialog]  = useState(false);
  const [isPlaying, setIsPlaying]              = useState(false);
  const [notesDialog, setNotesDialog] = useState<{ open: boolean; ayahId?: number; verseText?: string }>({ open: false });
  const [shareDialog, setShareDialog] = useState<{ open: boolean; ayahId?: number; verseText?: string; translation?: string }>({ open: false });

  const verseRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const isPageLayout = layout === "page";

  const { currentJuz, currentHizb, currentPage } = useMemo(() => {
    const juzInfo    = juzData.find(juz => juz.surahs.some(s => s.id === surahId));
    const juzNumber  = juzInfo?.juzNumber || 1;
    const totalVersesBefore = surahList.filter(s => s.id < surahId).reduce((sum, s) => sum + s.numberOfAyahs, 0);
    const pageNumber = Math.ceil((totalVersesBefore / 6236) * 604) || 1;
    return { currentJuz: juzNumber, currentHizb: (juzNumber - 1) * 2 + 1, currentPage: pageNumber };
  }, [surahId]);

  const getFontClass = () => {
    switch (quranFont) {
      case "indopak":    return "font-indopak";
      case "uthmani_v1": return "font-uthmani_v1";
      case "uthmani_v2": return "font-uthmani_v2";
      case "uthmani_v4": return "font-uthmani_v4";
      default:           return "font-uthmani";
    }
  };

  const arabicFontSize           = `${(1.5 * fontSize) / 5}rem`;
  const translationFontSizeValue = `${(1 * translationFontSize) / 3}rem`;

  useEffect(() => {
    startSession();
    return () => {
      stopSession().then((minutes) => {
        if (activeGoal && minutes > 0) saveMinutesToGoal(activeGoal.id, minutes);
      });
    };
  }, [surahId]); // eslint-disable-line react-hooks/exhaustive-deps

  const playWordAudio = async () => {
    if (!hoverRecitation) return;
    try {
      setIsPlaying(true);
      const audio = new Audio(getWordAudioPath(surahId, verseNum - 1, kalimaNum - 1));
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      await audio.play();
    } catch {
      setIsPlaying(false);
    }
  };

  // Page layout — find which page contains this verse
  const targetPage = useMemo(() => {
    if (!verses || !isPageLayout) return null;
    const startPage     = surah.pages[0];
    const endPage       = surah.pages[1];
    const totalPages    = endPage - startPage + 1;
    const versesPerPage = Math.ceil(verses.length / totalPages);

    for (let i = 0; i < totalPages; i++) {
      const pageVerses = verses.slice(i * versesPerPage, (i + 1) * versesPerPage);
      if (pageVerses.some((v) => v.verseNumber === verseNum)) {
        return { pageNumber: startPage + i, verses: pageVerses };
      }
    }
    return null;
  }, [verses, surah, verseNum, isPageLayout]);

  if (isLoading) {
    return (
      <Layout hideFooter>
        <SurahNavbar surahName={surah.englishName} surahId={surah.id} juz={currentJuz} hizb={currentHizb} page={currentPage} />
        <div className="container py-8 max-w-4xl mx-auto pb-24">
          <div className="p-6 border border-border rounded-xl">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !verse || !word) {
    return (
      <Layout hideFooter>
        <SurahNavbar surahName={surah.englishName} surahId={surah.id} juz={currentJuz} hizb={currentHizb} page={currentPage} />
        <div className="container py-8 max-w-4xl mx-auto pb-24">
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load word data. Please try again later.</AlertDescription>
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
      />

      <div className="container pt-28 max-w-4xl mx-auto pb-24">
        {surahId !== 1 && surahId !== 9 && showArabicText && (
          <Bismillah fontClass={getFontClass()} />
        )}

        <Action
          surahId={surahId}
          onInfoClick={() => setSurahInfoDialog(true)}
        />

        {/* ── Page Layout ── */}
        {isPageLayout && targetPage && (
          <div className="relative glass-container !rounded-xl overflow-hidden !block">
            <div className="p-6 sm:p-8 relative z-10">
              {showArabicText && (
                <div
                  className={`${getFontClass()} leading-[2.8] text-justify`}
                  dir="rtl"
                  style={{ fontSize: arabicFontSize, textAlignLast: "center" }}
                >
                  {targetPage.verses.map((v) => (
                    <span key={v.verseNumber} className="inline">
                      {v.words.map((w, wi) => {
                        const isTargetVerse = v.verseNumber === verseNum;
                        const isTargetWord  = isTargetVerse && wi === kalimaNum - 1;
                        return (
                          <span
                            key={wi}
                            className={cn(
                              "inline transition-all duration-300",
                              isTargetWord
                                ? "text-primary scale-110 inline-block"
                                : isTargetVerse
                                  ? "text-foreground"
                                  : "text-foreground/30"
                            )}
                          >
                            {w}{" "}
                          </span>
                        );
                      })}
                    </span>
                  ))}
                </div>
              )}

              {/* Translation for target verse only */}
              {verseTranslation && verse.translation && (
                <p
                  className="mt-4 text-muted-foreground leading-relaxed border-t border-border pt-3"
                  style={{ fontSize: translationFontSizeValue }}
                >
                  {verse.translation}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center px-6 py-2 relative z-10">
              <span className="text-xs text-muted-foreground">{targetPage.pageNumber}</span>
            </div>
          </div>
        )}

        {/* ── Ayah Layout ── */}
        {!isPageLayout && (
          <div className="glass-card p-6 space-y-6">
            {/* Verse with highlighted word */}
            {showArabicText && (
              <div
                className={`${getFontClass()} leading-[2.8] text-right flex flex-wrap justify-end gap-1`}
                dir="rtl"
              >
                {verse.words.map((w, wi) => {
                  const isTarget = wi === kalimaNum - 1;
                  return (
                    <TooltipProvider key={wi}>
                      <Tooltip open={isTarget && !!wbwTranslation}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={isTarget ? playWordAudio : undefined}
                            className={cn(
                              "inline transition-all duration-300 relative",
                              isTarget
                                ? "text-primary scale-125 cursor-pointer"
                                : "text-foreground/40 cursor-default"
                            )}
                            style={{ fontSize: arabicFontSize }}
                          >
                            {w}
                            {isTarget && isPlaying && (
                              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            )}
                          </button>
                        </TooltipTrigger>
                        {wbwTranslation && (
                          <TooltipContent side="top" className="glass-tooltip">
                            <p className="text-sm font-medium text-center">{wbwTranslation}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            )}

            {/* Word detail card */}
            <div className="glass-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {surah.id}:{verseNum} — Word {kalimaNum}
                </span>
                {hoverRecitation && (
                  <button
                    onClick={playWordAudio}
                    className={cn(
                      "glass-btn px-3 py-1.5 text-xs gap-1.5",
                      isPlaying ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {isPlaying ? "Playing..." : "Play Word"}
                  </button>
                )}
              </div>
              <p
                className={`${getFontClass()} text-primary`}
                dir="rtl"
                style={{ fontSize: `calc(${arabicFontSize} * 1.5)` }}
              >
                {word}
              </p>
              {wbwTranslation && (
                <p className="text-sm text-foreground">{wbwTranslation}</p>
              )}
            </div>

            {/* Full verse translation */}
            {verseTranslation && verse.translation && (
              <p
                className="text-muted-foreground leading-relaxed border-t border-border pt-4"
                style={{ fontSize: translationFontSizeValue }}
              >
                {verse.translation}
              </p>
            )}
          </div>
        )}

        <SurahNavigation currentSurahId={surahId} />
      </div>

      <AudioPlayer
        isVisible={showAudioPlayer}
        onClose={() => { stopAudio(); setShowAudioPlayer(false); }}
      />

      <NotesDialog
        open={notesDialog.open}
        onOpenChange={(open) => setNotesDialog({ ...notesDialog, open })}
        surahId={surahId}
        ayahId={notesDialog.ayahId}
        verseText={notesDialog.verseText}
      />
      <ShareDialog
        open={shareDialog.open}
        onOpenChange={(open) => setShareDialog({ ...shareDialog, open })}
        surahId={surahId}
        ayahId={shareDialog.ayahId}
        verseText={shareDialog.verseText}
        translation={shareDialog.translation}
      />
      <SurahInfoDialog
        open={surahInfoDialog}
        onOpenChange={setSurahInfoDialog}
        surahId={surahId}
      />
    </Layout>
  );
};

export default KalimaIndex;