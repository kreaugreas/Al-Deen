import { useParams, Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Index";
import { getTajweedCategory, getTajweedSubcategory } from "@/Bottom/API/Aid";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TajweedRule() {
  const { categoryId, subcategoryId } = useParams<{ categoryId: string; subcategoryId: string }>();
  const category = getTajweedCategory(categoryId || "");
  const subcategory = getTajweedSubcategory(categoryId || "", subcategoryId || "");

  if (!category || !subcategory) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">Rule not found</p>
          <Link to="/Aid/Alphabet" className="glass-btn px-4 py-2 mt-4 inline-flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" /> Back to Alphabet
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-4xl mx-auto px-4">
        <nav className="flex items-center gap-1.5 text-sm mb-6 flex-wrap">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <Link to="/Aid" className="text-muted-foreground hover:text-foreground transition-colors">Aid</Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <Link to="/Aid/Alphabet" className="text-muted-foreground hover:text-foreground transition-colors">Alphabet</Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <Link to={`/Aid/Alphabet/Tajweed/${category.id}`} className="text-muted-foreground hover:text-foreground transition-colors">{category.name}</Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-foreground font-medium">{subcategory.name}</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">{subcategory.name}</h1>
          <p className="font-arabic text-lg text-muted-foreground" dir="rtl">{subcategory.arabicName}</p>
          <p className="text-muted-foreground mt-2">{subcategory.description}</p>
        </div>

        <div className="space-y-4">
          {subcategory.rules.map((rule, index) => (
            <div key={index} className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{rule.transliteration}</span>
                <span
                  className="font-arabic text-2xl px-3 py-1 rounded-lg"
                  style={{ backgroundColor: `${category.color}15`, color: category.color }}
                  dir="rtl"
                >
                  {rule.letter}
                </span>
              </div>
              <p className="text-sm text-foreground">{rule.description}</p>
              {rule.example && (
                <div className="p-3 bg-muted/50 rounded-xl space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Example</p>
                  <p className="font-arabic text-xl text-foreground" dir="rtl">{rule.example}</p>
                  {rule.exampleTranslation && (
                    <p className="text-sm text-muted-foreground italic">{rule.exampleTranslation}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <Link
            to={`/Aid/Tajweed/${category.id}`}
            className="glass-btn px-4 py-2 inline-flex items-center gap-2 text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to {category.name}
          </Link>
        </div>
      </div>
    </Layout>
  );
}