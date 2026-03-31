import { useParams, Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Index";
import { getTajweedCategory } from "@/Bottom/API/Aid";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TajweedCategory() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = getTajweedCategory(categoryId || "");

  if (!category) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">Category not found</p>
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
          <span className="text-foreground font-medium">{category.name}</span>
        </nav>

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <span className="font-arabic text-lg" style={{ color: category.color }}>
                {category.arabicName.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{category.name}</h1>
              <p className="font-arabic text-sm text-muted-foreground" dir="rtl">{category.arabicName}</p>
            </div>
          </div>
          <p className="text-muted-foreground mt-2">{category.description}</p>
        </div>

        <div className="space-y-4">
          {category.subcategories.map((sub) => (
            <Link
              key={sub.id}
              to={`/Aid/Tajweed/${category.id}/${sub.id}`}
              className="glass-card p-5 flex items-center justify-between group transition-all hover:scale-[1.01]"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold group-hover:text-primary transition-colors">{sub.name}</h3>
                <p className="font-arabic text-sm text-muted-foreground" dir="rtl">{sub.arabicName}</p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{sub.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {sub.rules.length} {sub.rules.length === 1 ? "rule" : "rules"}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-3" />
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}