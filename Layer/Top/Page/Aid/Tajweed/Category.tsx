import { useParams, Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Index";
import { getTajweedCategory } from "@/Bottom/API/Aid";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/Top/Component/UI/Button";
import { Container } from "@/Top/Component/UI/Container";

export default function TajweedCategory() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = getTajweedCategory(categoryId || "");

  if (!category) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <p className="text-muted-foreground mb-4">Category not found</p>
          <Link to="/Aid/Alphabet">
            <Button className="gap-2">
              <ChevronLeft className="h-4 w-4" /> Back to Alphabet
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-4xl mx-auto px-4">
        {/* Category Header */}
        <Container className="!p-5 mb-6">
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <p className="text-muted-foreground mt-2">{category.description}</p>
        </Container>

        {/* Subcategories with individual bottom margins */}
        <div>
          {category.subcategories.map((sub) => (
            <Link key={sub.id} to={`/Aid/Tajweed/${category.id}/${sub.id}`}>
              <Container className="!p-5 mb-3 transition-all hover:scale-[1.01] group">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{sub.name}</h3>
                      <span className="font-arabic text-sm text-muted-foreground" dir="rtl">{sub.arabicName}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{sub.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {sub.rules.length} {sub.rules.length === 1 ? "rule" : "rules"}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-3 group-hover:text-primary transition-colors" />
                </div>
              </Container>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}