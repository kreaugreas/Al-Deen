import { useParams, Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Layout";
import { surahList } from "@/Bottom/API/Quran";
import { Button } from "@/Top/Component/UI/button";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";

// Mapping of pages to surahs (simplified - in production this would be complete data)
const pageToSurahMapping: Record<number, { surahId: number; startVerse: number; endVerse: number }[]> = {
  1: [{ surahId: 1, startVerse: 1, endVerse: 7 }],
  2: [{ surahId: 2, startVerse: 1, endVerse: 5 }],
  3: [{ surahId: 2, startVerse: 6, endVerse: 16 }],
  // ... more pages would be defined here
};

const QuranPage = () => {
  const { id } = useParams<{ id: string }>();
  const pageNumber = parseInt(id || "1");
  
  const previousPage = pageNumber > 1 ? pageNumber - 1 : null;
  const nextPage = pageNumber < 604 ? pageNumber + 1 : null;

  // Get surahs for this page
  const pageContent = pageToSurahMapping[pageNumber] || [];

  return (
    <Layout>
      <div className="container py-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-4">
            <FileText className="h-4 w-4" />
            <span className="font-medium">Page {pageNumber}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Page {pageNumber}</h1>
          <p className="text-muted-foreground">
            Quran Page {pageNumber} of 604
          </p>
        </div>

        {/* Page Content */}
        <div className="bg-card border border-border rounded-xl p-8 mb-8 min-h-[400px]">
          {pageContent.length > 0 ? (
            <div className="space-y-6">
              {pageContent.map((content, index) => {
                const surah = surahList.find(s => s.id === content.surahId);
                if (!surah) return null;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                      <div>
                        <h2 className="font-semibold">{surah.englishName}</h2>
                        <p className="text-sm text-muted-foreground">
                          Verses {content.startVerse} - {content.endVerse}
                        </p>
                      </div>
                      <Link 
                        to={`/Quran/Surah/${surah.id}?verse=${content.startVerse}`}
                        className="text-primary hover:underline text-sm"
                      >
                        View Surah
                      </Link>
                    </div>
                    <p className="font-arabic text-2xl text-right leading-loose" dir="rtl">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-4">
                Page content is being loaded...
              </p>
              <p className="text-sm text-muted-foreground">
                This page will display Quran verses from page {pageNumber}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          {previousPage ? (
            <Button variant="outline" asChild>
              <Link to={`/Quran/Page/${previousPage}`} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Page {previousPage}
              </Link>
            </Button>
          ) : (
            <div />
          )}

          <Button variant="outline" asChild>
            <Link to="/Quran">All Surahs</Link>
          </Button>

          {nextPage ? (
            <Button variant="outline" asChild>
              <Link to={`/Quran/Page/${nextPage}`} className="gap-2">
                Page {nextPage}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default QuranPage;
