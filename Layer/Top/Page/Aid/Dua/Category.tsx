import { useParams, Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Layout";
import { Copy, Share2, ChevronRight } from "lucide-react";
import { getDuaCategory, type DuaItem } from "@/Bottom/API/Aid";
import { toast } from "@/Middle/Hook/Use-Toast";

const COLLECTION_MAP: Record<string, { name: string; route: string }> = {
  bukhari: { name: "Sahih al-Bukhari", route: "/Hadiths/bukhari" },
  muslim: { name: "Sahih Muslim", route: "/Hadiths/muslim" },
  "abu dawud": { name: "Abu Dawud", route: "/Hadiths/abu-dawud" },
  tirmidhi: { name: "Tirmidhi", route: "/Hadiths/tirmidhi" },
  "ibn majah": { name: "Ibn Majah", route: "/Hadiths/ibn-majah" },
  ahmad: { name: "Musnad Ahmad", route: "/Hadiths/ahmad" },
  nasa_i: { name: "An-Nasa'i", route: "/Hadiths/nasai" },
};

function ReferenceLink({ reference }: { reference: string }) {
  if (reference.toLowerCase().startsWith("quran")) {
    return <span className="text-xs text-primary">{reference}</span>;
  }

  const parts = reference.split(",").map((p) => p.trim());

  return (
    <span className="text-xs">
      {parts.map((part, i) => {
        const key = part.toLowerCase().trim();
        const collection = COLLECTION_MAP[key];
        return (
          <span key={i}>
            {i > 0 && ", "}
            {collection ? (
              <Link to={collection.route} className="text-primary hover:underline">
                {collection.name}
              </Link>
            ) : (
              <span className="text-primary">{part}</span>
            )}
          </span>
        );
      })}
    </span>
  );
}

const DuaCategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = categoryId ? getDuaCategory(categoryId) : null;

  if (!category) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <div className="glass-card max-w-md mx-auto p-8">
            <h1 className="text-2xl font-semibold mb-4">Category Not Found</h1>
            <Link to="/Aid/Dua" className="text-primary hover:underline">Back to Duas</Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleCopy = (dua: DuaItem) => {
    navigator.clipboard.writeText(`${dua.arabic}\n\n${dua.translation}\n\n— ${dua.reference}`);
    toast({ title: "Copied", description: "Dua copied to clipboard" });
  };

  const handleShare = async (dua: DuaItem) => {
    const text = `${dua.arabic}\n\n${dua.translation}\n\n— ${dua.reference}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: category.name, text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard" });
    }
  };

  return (
    <Layout>
      <section className="py-6">
        <div className="container max-w-3xl">
          <nav className="flex items-center gap-1.5 text-sm mb-6 flex-wrap">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Root
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <Link to="/Aid" className="text-muted-foreground hover:text-foreground transition-colors">
              Aid
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <Link to="/Aid/Dua" className="text-muted-foreground hover:text-foreground transition-colors">
              Dua
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>

          <div className="space-y-5">
            {category.duas.map((dua: DuaItem) => (
              <div key={dua.id} className="glass-card p-5 !block space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center justify-center w-7 h-7 glass-btn text-primary text-xs font-semibold">
                    {dua.id}
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="glass-icon-btn w-7 h-7" onClick={() => handleCopy(dua)}>
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button className="glass-icon-btn w-7 h-7" onClick={() => handleShare(dua)}>
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="font-arabic text-xl text-right leading-loose" dir="rtl">{dua.arabic}</p>
                <p className="text-foreground">{dua.translation}</p>
                <ReferenceLink reference={dua.reference} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DuaCategoryPage;