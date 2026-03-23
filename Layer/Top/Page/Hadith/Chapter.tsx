import { useParams, Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Layout";
import { Copy, Share2, BookmarkPlus, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { getCollection, getChapter, getChaptersByCollection } from "@/Bottom/API/Hadith";
import { toast } from "@/Middle/Hook/Use-Toast";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { useBookmarks } from "@/Middle/Hook/Use-Bookmarks";
import { useAuth } from "@/Middle/Context/Auth-Context";

const HadithChapter = () => {
  const { collectionId, chapterId } = useParams<{ collectionId: string; chapterId: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { bookmarks, addBookmark, removeBookmark } = useBookmarks();

  const collection = collectionId ? getCollection(collectionId) : null;
  const chapter = collectionId && chapterId ? getChapter(collectionId, chapterId) : null;
  const allChapters = collectionId ? getChaptersByCollection(collectionId) : [];
  const currentIndex = allChapters.findIndex((c) => c.id === chapterId);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  const isHadithBookmarked = (hadithId: number) => {
    return bookmarks.some((b) => b.surah_id === 0 && b.ayah_id === hadithId);
  };

  const getHadithBookmarkId = (hadithId: number) => {
    return bookmarks.find((b) => b.surah_id === 0 && b.ayah_id === hadithId)?.id;
  };

  const handleBookmark = async (hadithId: number, reference: string) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to bookmark hadiths" });
      return;
    }

    if (isHadithBookmarked(hadithId)) {
      const id = getHadithBookmarkId(hadithId);
      if (id) await removeBookmark(id);
    } else {
      await addBookmark(0, hadithId, `Hadith: ${reference}`);
    }
  };

  if (!collection || !chapter) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <div className="glass-card max-w-md mx-auto p-8">
            <h1 className="text-2xl font-semibold mb-4">Chapter Not Found</h1>
            <Link to="/Hadiths" className="text-primary hover:underline">
              {t.common.back} to {t.hadiths.title}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t.quran.copy, description: "Hadith copied to clipboard" });
  };

  const handleShare = async (hadith: { arabic: string; translation: string; reference: string }) => {
    const text = `${hadith.arabic}\n\n${hadith.translation}\n\n— ${hadith.reference}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${collection.name} - ${chapter.name}`, text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard" });
    }
  };

  const getGradeColor = (grade: string) => {
    const g = grade.toLowerCase();
    if (g.includes("sahih") || g === "authentic") return "bg-green-500/10 text-green-600 dark:text-green-400";
    if (g.includes("hasan") || g === "good") return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    if (g.includes("daif") || g === "weak") return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Layout>
      <section className="py-6">
        <div className="container max-w-4xl">
          <nav className="flex items-center gap-1.5 text-sm mb-6 flex-wrap">
            <Link to="/Hadiths" className="text-muted-foreground hover:text-foreground transition-colors">
              {t.hadiths.title}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <Link to={`/Hadiths/${collectionId}`} className="text-muted-foreground hover:text-foreground transition-colors">
              {collection.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground font-medium">{chapter.name}</span>
          </nav>

          {chapter.hadiths.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-muted-foreground">No hadiths found in this chapter.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {chapter.hadiths.map((hadith) => {
                const bookmarked = isHadithBookmarked(hadith.id);
                return (
                  <div key={hadith.id} className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 glass-btn text-primary text-sm font-semibold">
                          {hadith.id}
                        </span>
                        <span className="text-sm text-muted-foreground">{hadith.reference}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getGradeColor(hadith.grade)}`}>
                          {hadith.grade}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          className="glass-icon-btn w-8 h-8"
                          onClick={() => handleCopy(`${hadith.arabic}\n\n${hadith.translation}`)}
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button className="glass-icon-btn w-8 h-8" onClick={() => handleShare(hadith)}>
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button
                          className={`glass-icon-btn w-8 h-8 ${bookmarked ? "text-primary" : ""}`}
                          onClick={() => handleBookmark(hadith.id, hadith.reference)}
                        >
                          {bookmarked ? <Bookmark className="h-4 w-4 fill-current" /> : <BookmarkPlus className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <p className="font-arabic text-2xl text-right mb-4 leading-loose" dir="rtl">
                      {hadith.arabic}
                    </p>
                    <p className="text-lg mb-3">{hadith.translation}</p>
                    {hadith.narrator && (
                      <p className="text-sm text-muted-foreground">
                        Narrated by: <span className="font-medium">{hadith.narrator}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-8 border-t border-border">
            {prevChapter ? (
              <Link
                to={`/Hadiths/${collectionId}/${prevChapter.id}`}
                className="glass-btn px-4 py-2 inline-flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {t.common.previous} Chapter
              </Link>
            ) : <div />}

            {nextChapter && (
              <Link
                to={`/Hadiths/${collectionId}/${nextChapter.id}`}
                className="glass-btn px-4 py-2 inline-flex items-center gap-2"
              >
                {t.common.next} Chapter
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HadithChapter;