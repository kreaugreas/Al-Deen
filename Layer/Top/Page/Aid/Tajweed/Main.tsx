import { Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Index";
import { getTajweedCategories } from "@/Bottom/API/Aid";
import { ChevronRight } from "lucide-react";
import { Container } from "@/Top/Component/UI/Container";
import { Button } from "@/Top/Component/UI/Button";

const TajweedIndex = () => {
  const tajweedCategories = getTajweedCategories();

  return (
    <Layout>
      <section className="py-6">
        <div className="container max-w-4xl mx-auto">
          {/* Tajweed Categories Grid */}
          {tajweedCategories.length === 0 ? (
            <Container className="p-12 text-center">
              <p className="text-muted-foreground">
                No tajweed categories available.
              </p>
            </Container>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tajweedCategories.map((cat) => (
                <Link key={cat.id} to={`/Aid/Tajweed/${cat.id}`}>
                  <Container className="!p-5 transition-all hover:scale-[1.02] flex items-center justify-between group">
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                      <p className="font-arabic text-sm text-muted-foreground" dir="rtl">
                        {cat.arabicName}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="p-0 w-8 h-8 rounded-full bg-transparent hover:bg-muted"
                      aria-label={`View ${cat.name}`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Container>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default TajweedIndex;