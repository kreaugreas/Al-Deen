import { useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { Layout } from "@/Top/Component/Layout/Layout";
import { Skeleton } from "@/Top/Component/UI/skeleton";
import { ArrowLeft, BookOpen, MapPin, FileText, Play, Calendar, Hash } from "lucide-react";
import { surahList } from "@/Bottom/API/Quran";
import { useQuery } from "@tanstack/react-query";

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

const SurahInfo = () => {
  const { id } = useParams<{ id: string }>();
  const surahId = parseInt(id || "1");
  const surah = surahList.find((s) => s.id === surahId);

  const { data: chapterInfo, isLoading } = useQuery({
    queryKey: ['chapter-info', surahId],
    queryFn: () => fetchChapterInfo(surahId),
    enabled: !!surahId,
  });

  if (!surah) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <div className="glass-card max-w-md mx-auto p-8">
            <h1 className="text-2xl font-semibold mb-4">Surah Not Found</h1>
            <Link to="/Quran" className="text-primary hover:underline">Back to Quran</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-6">
        <div className="container">
          <Link to={`/Quran/Surah/${surahId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 glass-btn px-3 py-1.5 text-sm">
            <ArrowLeft className="h-4 w-4" />Go to Surah
          </Link>
        </div>
      </section>

      <section className="pb-12">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="glass-card p-6 text-center">
                  <div className="glass-icon-btn w-16 h-16 mx-auto mb-4 pointer-events-none">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-arabic text-4xl mb-4 text-primary">{surah.name}</p>
                  <p className="text-xl font-semibold">{surah.englishName}</p>
                  <p className="text-sm text-muted-foreground mt-1">{surah.englishNameTranslation}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="glass-card p-3">
                      <Hash className="h-4 w-4 text-primary mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Surah</p>
                      <p className="font-semibold">{surahId}</p>
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

                <Link to={`/Quran/Surah/${surahId}`} className="glass-btn w-full py-3 bg-primary text-primary-foreground justify-center">
                  <Play className="h-4 w-4 mr-2" />Read Surah
                </Link>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="glass-card p-6 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">About {surah.englishName}</h1>
                <p className="text-muted-foreground">Chapter {surahId} of the Holy Quran</p>
              </div>

              {isLoading ? (
                <div className="glass-card p-6 space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : chapterInfo ? (
                <div className="glass-card p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />About this Surah
                  </h2>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(chapterInfo.text) }} />
                  {chapterInfo.source && <p className="text-xs text-muted-foreground mt-6 pt-4 border-t border-border/50">Source: {chapterInfo.source}</p>}
                </div>
              ) : (
                <div className="glass-card p-6">
                  <h2 className="text-lg font-semibold mb-3">Overview</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Surah {surah.englishName} ({surah.name}) is the {surahId}{getOrdinalSuffix(surahId)} chapter of the Holy Quran with {surah.numberOfAyahs} verses, revealed in {surah.revelationType === "Meccan" ? "Makkah" : "Madinah"}.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between mt-6 gap-4">
                {surahId > 1 && (
                  <Link to={`/Quran/Surah/${surahId - 1}/Info`} className="glass-btn px-4 py-2 text-sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />{surahList[surahId - 2]?.englishName}
                  </Link>
                )}
                <div className="flex-1" />
                {surahId < 114 && (
                  <Link to={`/Quran/Surah/${surahId + 1}/Info`} className="glass-btn px-4 py-2 text-sm">
                    {surahList[surahId]?.englishName}<ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export default SurahInfo;