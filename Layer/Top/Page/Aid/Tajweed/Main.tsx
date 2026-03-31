import { Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Index";
import { getTajweedCategories } from "@/Bottom/API/Aid";
import { ChevronRight } from "lucide-react";
import { Card } from "@/Top/Component/UI/Card";
import { Button } from "@/Top/Component/UI/Button";

const TajweedIndex = () => {
  const tajweedCategories = getTajweedCategories();

  return (
    <Layout>
      <section className="py-6">
        <div className="container max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm mb-6 flex-wrap">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <Link to="/Aid" className="text-muted-foreground hover:text-foreground transition-colors">Aid</Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground font-medium">Tajweed</span>
          </nav>

          {/* Tajweed Categories Grid */}
          {tajweedCategories.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              No tajweed categories available.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tajweedCategories.map((cat) => (
                <Link key={cat.id} to={`/Aid/Tajweed/${cat.id}`}>
                  <Card className="p-5 transition-all hover:scale-[1.02] flex items-center justify-between group">
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
                  </Card>
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