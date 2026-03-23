import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Layout";
import { getLetters, getTajweedCategories } from "@/Bottom/API/Aid";
import { ChevronRight } from "lucide-react";

const AlphabetIndex = () => {
  const [tab, setTab] = useState<"alphabet" | "tajweed">("alphabet");
  const letters = getLetters();
  const tajweedCategories = getTajweedCategories();

  const tabs = [
    { id: "alphabet" as const, label: "Alphabet" },
    { id: "tajweed" as const, label: "Tajweed" },
  ];

  return (
    <Layout>
      <section className="py-6">
        <div className="container">
          <nav className="flex items-center gap-1.5 text-sm mb-6 flex-wrap">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <Link to="/Aid" className="text-muted-foreground hover:text-foreground transition-colors">Aid</Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground font-medium">Alphabet</span>
          </nav>

          <div className="flex justify-center mb-6">
            <div className="glass-card !p-1 inline-flex gap-1">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    tab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {tab === "alphabet" ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3">
              {letters.map((letter) => (
                <Link
                  key={letter.id}
                  to={`/Aid/Alphabet/${letter.id}`}
                  className="glass-card p-4 transition-all hover:scale-[1.02] !block text-center"
                >
                  <p className="font-arabic text-3xl mb-1" dir="rtl">{letter.forms.isolated}</p>
                  <p className="text-xs text-muted-foreground">{letter.name}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tajweedCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/Aid/Alphabet/Tajweed/${cat.id}`}
                  className="glass-card p-5 transition-all hover:scale-[1.02] flex items-center justify-between group"
                >
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">{cat.name}</h3>
                    <p className="font-arabic text-sm text-muted-foreground" dir="rtl">{cat.arabicName}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default AlphabetIndex;