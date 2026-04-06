import { useParams, Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Index";
import { getTajweedCategory, getTajweedSubcategory } from "@/Bottom/API/Aid";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/Top/Component/UI/Button";
import { Container } from "@/Top/Component/UI/Container";

export default function TajweedRule() {
  const { categoryId, subcategoryId } = useParams<{ categoryId: string; subcategoryId: string }>();
  const category = getTajweedCategory(categoryId || "");
  const subcategory = getTajweedSubcategory(categoryId || "", subcategoryId || "");

  if (!category || !subcategory) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <p className="text-muted-foreground mb-4">Rule not found</p>
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
        {/* Subcategory Header - transliteration and Arabic next to each other */}
        <Container className="!p-5 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{subcategory.name}</h1>
            <p className="font-arabic text-xl text-muted-foreground" dir="rtl">{subcategory.arabicName}</p>
          </div>
          <p className="text-muted-foreground mt-2">{subcategory.description}</p>
        </Container>

        {/* Rules List */}
        <div>
          {subcategory.rules.map((rule, index) => (
            <Container key={index} className="!p-5 mb-3 transition-all hover:scale-[1.01] group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{rule.transliteration}</span>
                  {/* Letter in its own separate Container */}
                  <Container className="!py-1 !px-3 !w-auto">
                    <span className="font-arabic text-2xl" dir="rtl">
                      {rule.letter}
                    </span>
                  </Container>
                </div>
                <p className="text-sm text-foreground">{rule.description}</p>
                {rule.example && (
                  <Container className="!p-3">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Example</p>
                      <p className="font-arabic text-2xl text-foreground" dir="rtl">{rule.example}</p>
                      {rule.exampleTranslation && (
                        <p className="text-sm text-muted-foreground italic">{rule.exampleTranslation}</p>
                      )}
                    </div>
                  </Container>
                )}
              </div>
            </Container>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-8 pt-4">
          <Link to={`/Aid/Tajweed/${category.id}`}>
            <Button className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to {category.name}
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}