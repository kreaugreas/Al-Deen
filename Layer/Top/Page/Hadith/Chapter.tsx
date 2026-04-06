import { useParams, Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Index";
import { Copy, Share2, BookmarkPlus, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { getCollection, getChapter, getChaptersByCollection, type HadithChapter, type HadithCollection } from "@/Bottom/API/Hadith";
import { toast } from "@/Middle/Hook/Use-Toast";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { useBookmarks } from "@/Middle/Hook/Use-Bookmarks";
import { useAuth } from "@/Middle/Context/Auth";
import { useApp } from "@/Middle/Context/App";
import { Container } from "@/Top/Component/UI/Container";
import { Button } from "@/Top/Component/UI/Button";
import { Tooltip } from "@/Top/Component/UI/Tooltip";
import { useState } from "react";

const Hadith_Chapter = () => {
  const { Collection, Chapter } = useParams<{ Collection: string; Chapter: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { bookmarks, addBookmark, removeBookmark } = useBookmarks();
  const { showHadithTranslation, showHadithTransliteration } = useApp();
  const [activeTooltip, setActiveTooltip] = useState<{ hadithId: number; wordIndex: number } | null>(null);
  
  const collection = Collection ? getCollection(Collection) : null;
  const chapter = Collection && Chapter ? getChapter(Collection, Chapter) : null;
  const allChapters = Collection ? getChaptersByCollection(Collection) : [];

  const currentIndex = allChapters.findIndex((c) => c.id === Chapter?.toLowerCase());
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  const isHadithBookmarked = (hadithId: number) => {
    return bookmarks.some((b) => b.surah_id === 0 && b.ayah_id === hadithId);
  };

  const getHadithBookmarkId = (hadithId: number) => {
    return bookmarks.find((b) => b.surah_id === 0 && b.ayah_id === hadithId)?.id;
  };

  const handleBookmark = async (hadithId: number, hadithNumber: number) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to bookmark hadiths" });
      return;
    }

    if (isHadithBookmarked(hadithId)) {
      const id = getHadithBookmarkId(hadithId);
      if (id) await removeBookmark(id);
    } else {
      await addBookmark(0, hadithId, `Hadith ${hadithNumber} - ${chapter?.name}`);
    }
  };

  if (!collection || !chapter) {
    return (
      <Layout>
        <div className="py-16 text-center">
          <Container className="max-w-md mx-auto p-8">
            <h1 className="text-2xl font-semibold mb-4">Not Found</h1>
            <Link to="/Hadith">
              <Button>Back to Hadith</Button>
            </Link>
          </Container>
        </div>
      </Layout>
    );
  }

  const handleCopy = (hadith: { arabic: string; translation: string; hadithNumber: number }) => {
    navigator.clipboard.writeText(`${hadith.arabic}\n\n${hadith.translation}\n\n— ${collection?.name} ${hadith.hadithNumber}`);
    toast({ title: t.quran.copy, description: "Hadith copied to clipboard" });
  };

  const handleShare = async (hadith: { arabic: string; translation: string; hadithNumber: number }) => {
    const text = `${hadith.arabic}\n\n${hadith.translation}\n\n— ${collection?.name} ${hadith.hadithNumber}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${collection?.name} - ${chapter.name}`, text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard" });
    }
  };

  const renderArabicWithWbw = (hadith: any, hadithId: number) => {
    const words = hadith.arabic.split(" ");
    const hasWbw = hadith.wbw && Array.isArray(hadith.wbw) && hadith.wbw.length > 0;
    
    if (!hasWbw) {
      return (
        <p className="font-arabic text-2xl text-right mb-4 leading-loose" dir="rtl">
          {hadith.arabic}
        </p>
      );
    }
    
    return (
      <div className="font-arabic text-2xl text-right mb-4 leading-loose" dir="rtl">
        {words.map((word: string, idx: number) => {
          const isActive = activeTooltip?.hadithId === hadithId && activeTooltip?.wordIndex === idx;
          const translation = hadith.wbw[idx];
          
          if (!translation) {
            return (
              <span key={idx} className="inline-block mx-1">
                {word}
              </span>
            );
          }
          
          return (
            <Tooltip
              key={idx}
              content={translation}
              enabled={true}
              side="top"
              offset={32}
            >
              <span
                className={`inline-block mx-1 cursor-pointer transition-colors duration-150
                  ${isActive ? "text-green-600 dark:text-green-400" : "hover:text-green-600 dark:hover:text-green-400"}
                `}
                onMouseEnter={() => setActiveTooltip({ hadithId, wordIndex: idx })}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                {word}
              </span>
            </Tooltip>
          );
        })}
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Container className="p-6 mb-6">
          <h1 className="text-2xl font-bold">{chapter.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {chapter.hadithCount} hadiths • Hadith {chapter.hadithRange}
          </p>
        </Container>

        {chapter.hadiths.length === 0 ? (
          <Container className="p-8 text-center">
            <p className="text-muted-foreground">No hadiths found in this chapter.</p>
          </Container>
        ) : (
          <div className="space-y-6">
            {chapter.hadiths.map((hadith) => {
              const bookmarked = isHadithBookmarked(hadith.id);
              return (
                <Container key={hadith.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        className="w-8 h-8 rounded-full p-0 flex items-center justify-center"
                      >
                        {hadith.id}
                      </Button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => handleCopy({ arabic: hadith.arabic, translation: hadith.translation, hadithNumber: hadith.id })}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => handleShare({ arabic: hadith.arabic, translation: hadith.translation, hadithNumber: hadith.id })}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className={`w-8 h-8 p-0 ${bookmarked ? "text-primary" : ""}`}
                        onClick={() => handleBookmark(hadith.id, hadith.id)}
                      >
                        {bookmarked ? <Bookmark className="h-4 w-4 fill-current" /> : <BookmarkPlus className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {renderArabicWithWbw(hadith, hadith.id)}
                  
                  {/* Transliteration - shown only if toggle is on */}
                  {showHadithTransliteration && hadith.transliteration && (
                    <p className="text-md italic text-muted-foreground mb-3">
                      {hadith.transliteration}
                    </p>
                  )}
                  
                  {/* Translation - shown only if toggle is on */}
                  {showHadithTranslation && (
                    <p className="text-lg mb-3">
                      {hadith.translation}
                    </p>
                  )}

                  {hadith.narrator && (
                    <p className="text-sm text-muted-foreground mt-3">
                      Narrated by: <span className="font-medium">{hadith.narrator}</span>
                    </p>
                  )}
                </Container>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-8 border-t border-border">
          {prevChapter ? (
            <Link to={`/Hadith/${collection.slug}/${prevChapter.id}`}>
              <Button className="px-4 py-2 inline-flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                {prevChapter.name}
              </Button>
            </Link>
          ) : <div />}

          {nextChapter && (
            <Link to={`/Hadith/${collection.slug}/${nextChapter.id}`}>
              <Button className="px-4 py-2 inline-flex items-center gap-2">
                {nextChapter.name}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Hadith_Chapter;