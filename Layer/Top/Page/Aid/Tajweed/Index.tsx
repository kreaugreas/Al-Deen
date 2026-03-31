import { Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Index";
import { getTajweedCategories } from "@/Bottom/API/Tajweed";

export default function TajweedIndex() {
  const categories = getTajweedCategories();

  return (
    <Layout>
      <div className="container py-8 max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/tajweed/${cat.id}`}
              className="glass-card p-5 transition-all hover:scale-[1.02] group"
            >
              <h2 className="font-semibold text-base group-hover:text-primary transition-colors">
                {cat.name}
              </h2>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
