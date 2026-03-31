import { useParams, Link } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Index";
import { getLetter } from "@/Bottom/API/Aid";
import { ChevronRight } from "lucide-react";

const LetterPage = () => {
  const { letterId } = useParams<{ letterId: string }>();
  const letter = letterId ? getLetter(letterId) : null;

  if (!letter) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <div className="glass-card max-w-md mx-auto p-8">
            <h1 className="text-2xl font-semibold mb-4">Letter Not Found</h1>
            <Link to="/Aid/Alphabet" className="text-primary hover:underline">Back to Alphabet</Link>
          </div>
        </div>
      </Layout>
    );
  }

  const forms = [
    { label: "Isolated", value: letter.forms.isolated },
    { label: "Initial", value: letter.forms.initial },
    { label: "Medial", value: letter.forms.medial },
    { label: "Final", value: letter.forms.final },
  ];

  return (
    <Layout>
      <section className="py-6">
        <div className="container max-w-2xl">
          <nav className="flex items-center gap-1.5 text-sm mb-6 flex-wrap">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <Link to="/Aid" className="text-muted-foreground hover:text-foreground transition-colors">Aid</Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <Link to="/Aid/Alphabet" className="text-muted-foreground hover:text-foreground transition-colors">Alphabet</Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground font-medium">{letter.name}</span>
          </nav>

          <div className="glass-card p-6 text-center mb-6">
            <p className="font-arabic text-7xl mb-2" dir="rtl">{letter.forms.isolated}</p>
            <h1 className="text-2xl font-semibold">{letter.name}</h1>
            <p className="font-arabic text-muted-foreground" dir="rtl">{letter.arabicName}</p>
            <p className="text-sm text-muted-foreground mt-1">Pronunciation: {letter.pronunciation}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {forms.map((form) => (
              <div key={form.label} className="glass-card p-4 text-center">
                <p className="text-xs text-muted-foreground mb-2">{form.label}</p>
                <p className="font-arabic text-3xl" dir="rtl">{form.value}</p>
              </div>
            ))}
          </div>

          <div className="glass-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Example</p>
            <p className="font-arabic text-2xl" dir="rtl">{letter.example}</p>
            <p className="text-sm text-muted-foreground italic mt-1">{letter.exampleTranslation}</p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LetterPage;