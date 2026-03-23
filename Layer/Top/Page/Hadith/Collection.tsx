import { useParams, Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Layout";
import { getCollection, getChaptersByCollection } from "@/Bottom/API/Hadith";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { ChevronRight } from "lucide-react";

const HadithCollection = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const { t } = useTranslation();

  const collection = collectionId ? getCollection(collectionId) : null;
  const chapters = collectionId ? getChaptersByCollection(collectionId) : [];

  if (!collection) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <div className="glass-card max-w-md mx-auto p-8">
            <h1 className="text-2xl font-semibold mb-4">Collection Not Found</h1>
            <Link to="/Hadiths" className="text-primary hover:underline">
              {t.common.back} to {t.hadiths.title}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-6">
        <div className="container">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-sm mb-6 flex-wrap">
            <Link to="/Hadiths" className="text-muted-foreground hover:text-foreground transition-colors">
              {t.hadiths.title}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground font-medium">{collection.name}</span>
          </nav>

          {chapters.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-muted-foreground">No chapters available yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chapters.map((chapter, index) => (
                <Link
                  key={chapter.id}
                  to={`/Hadiths/${collectionId}/${chapter.id}`}
                  className="block glass-card p-4 transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center justify-center w-10 h-10 glass-btn text-primary font-bold text-sm">
                        {index + 1}
                      </span>
                      <p className="font-semibold text-foreground">{chapter.name}</p>
                    </div>
                    {chapter.hadithRange && (
                      <span className="glass-btn px-3 py-1.5 text-xs text-muted-foreground flex-shrink-0">
                        {chapter.hadithRange}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default HadithCollection;
