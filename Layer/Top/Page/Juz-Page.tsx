import { useParams, Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Layout";
import { juzData, surahList } from "@/Bottom/API/Quran";
import { Button } from "@/Top/Component/UI/button";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

const JuzPage = () => {
  const { id } = useParams<{ id: string }>();
  const juzNumber = parseInt(id || "1");
  const juzInfo = juzData.find(j => j.juzNumber === juzNumber);

  const previousJuz = juzNumber > 1 ? juzNumber - 1 : null;
  const nextJuz = juzNumber < 30 ? juzNumber + 1 : null;

  if (!juzInfo) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Juz not found</h1>
          <Link to="/Quran" className="text-primary hover:underline">
            Back to Quran
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-4">
            <BookOpen className="h-4 w-4" />
            <span className="font-medium">Juz {juzNumber}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Juz {juzNumber}</h1>
          <p className="text-muted-foreground">
            Contains portions from {juzInfo.surahs.length} surah{juzInfo.surahs.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Surahs in this Juz */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold mb-4">Surahs in this Juz</h2>
          <div className="grid gap-3">
            {juzInfo.surahs.map((surahRef, index) => {
              const surah = surahList.find(s => s.id === surahRef.id);
              if (!surah) return null;

              return (
                <Link
                  key={index}
                  to={`/Quran/Surah/${surah.id}${surahRef.startVerse ? `?verse=${surahRef.startVerse}` : ''}`}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-lg font-semibold">
                      {surah.id}
                    </span>
                    <div>
                      <h3 className="font-semibold">{surah.englishName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {surah.englishNameTranslation}
                        {surahRef.startVerse && surahRef.endVerse && (
                          <span className="ml-2">
                            • Verses {surahRef.startVerse} - {surahRef.endVerse}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="font-arabic text-xl">{surah.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          {previousJuz ? (
            <Button variant="outline" asChild>
              <Link to={`/Quran/Juz/${previousJuz}`} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Juz {previousJuz}
              </Link>
            </Button>
          ) : (
            <div />
          )}

          <Button variant="outline" asChild>
            <Link to="/Quran">All Surahs</Link>
          </Button>

          {nextJuz ? (
            <Button variant="outline" asChild>
              <Link to={`/Quran/Juz/${nextJuz}`} className="gap-2">
                Juz {nextJuz}
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

export default JuzPage;