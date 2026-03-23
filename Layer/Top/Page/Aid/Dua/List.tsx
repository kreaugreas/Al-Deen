import { Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Layout";
import { duaCategories } from "@/Bottom/API/Aid";
import { ChevronRight } from "lucide-react";

const Duas = () => {
  return (
    <Layout>
      <section className="py-6">
        <div className="container">
          <nav className="flex items-center gap-1.5 text-sm mb-6 flex-wrap">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Root
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <Link to="/Aid" className="text-muted-foreground hover:text-foreground transition-colors">
              Aid
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground font-medium">Dua</span>
          </nav>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {duaCategories.map((category) => (
              <Link
                key={category.id}
                to={`/Aid/Dua/${category.id}`}
                className="glass-card p-4 transition-all hover:scale-[1.02] !block text-center"
              >
                <h3 className="font-semibold text-sm">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Duas;