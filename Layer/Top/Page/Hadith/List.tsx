import { Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Layout";
import { hadithCollections } from "@/Bottom/API/Hadith";
import { useTranslation } from "@/Middle/Hook/Use-Translation";

const Hadiths = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <section className="py-6">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hadithCollections.map((collection) => (
              <Link
                key={collection.id}
                to={`/Hadiths/${collection.id}`}
                className="glass-card p-5 transition-all hover:scale-[1.02] !block"
              >
                <h3 className="font-semibold">{collection.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 font-arabic">{collection.arabicName}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {collection.hadithCount.toLocaleString()} {t.hadiths.hadith}s
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Hadiths;