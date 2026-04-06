import { useParams, Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Index";
import { Copy, Share2 } from "lucide-react";
import { getDuaCategory, type DuaItem } from "@/Bottom/API/Aid";
import { toast } from "@/Middle/Hook/Use-Toast";
import { Button } from "@/Top/Component/UI/Button";
import { Container } from "@/Top/Component/UI/Container";

const COLLECTION_MAP: Record<string, { name: string; route: string }> = {
  bukhari: { name: "Sahih al-Bukhari", route: "/Hadiths/Bukhari" },
  muslim: { name: "Sahih Muslim", route: "/Hadiths/Muslim" },
  "abu dawud": { name: "Abu Dawud", route: "/Hadiths/abu-dawud" },
  tirmidhi: { name: "Tirmidhi", route: "/Hadiths/tirmidhi" },
  "ibn majah": { name: "Ibn Majah", route: "/Hadiths/ibn-majah" },
  ahmad: { name: "Musnad Ahmad", route: "/Hadiths/ahmad" },
  nasa_i: { name: "An-Nasa'i", route: "/Hadiths/nasai" },
};

function formatNameFromId(id: string): string {
  return id
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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
              <Link to={collection.route} className="inline-flex items-center text-primary hover:underline">
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

const Dua_Category = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  
  // Convert categoryId (e.g., "after-eating") to categoryName (e.g., "After Eating")
  const categoryName = categoryId ? formatNameFromId(categoryId) : "";
  const category = categoryName ? getDuaCategory(categoryName) : null;

  if (!category) {
    return (
        <Layout>
          <div className="container py-16 text-center">
            <Container className="max-w-md mx-auto">
              <div className="p-8 text-center">
                <h1 className="text-2xl font-semibold mb-4">Category Not Found</h1>
                <Link to="/Aid/Dua" className="inline-block">
                  <Button>Back to Duas</Button>
                </Link>
              </div>
            </Container>
          </div>
        </Layout>
    );
  }

  const handleCopy = (dua: DuaItem, index: number) => {
    navigator.clipboard.writeText(`${dua.arabic}\n\n${dua.translation}\n\n— ${dua.reference}`);
    toast({ title: "Copied", description: "Dua copied to clipboard" });
  };

  const handleShare = async (dua: DuaItem, index: number) => {
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
            <Container className="p-6 mb-6">
              <h1 className="text-2xl font-bold">{category.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {category.duas.length} Dua{category.duas.length !== 1 ? 's' : ''}
              </p>
            </Container>

            <div className="space-y-5">
              {category.duas.map((dua: DuaItem, index: number) => (
                <Container key={index} className="p-5 space-y-4 group">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-muted text-primary text-xs font-semibold group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      {index + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        className="w-7 h-7 p-0"
                        onClick={() => handleCopy(dua, index)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        className="w-7 h-7 p-0"
                        onClick={() => handleShare(dua, index)}
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="font-arabic text-xl text-right leading-loose" dir="rtl">
                    {dua.arabic}
                  </p>
                  <p className="text-foreground">
                    {dua.translation}
                  </p>
                  <div className="pt-2 border-t border-border/50">
                    <ReferenceLink reference={dua.reference} />
                  </div>
                </Container>
              ))}
            </div>
          </div>
        </section>
      </Layout>
  );
};

export default Dua_Category;