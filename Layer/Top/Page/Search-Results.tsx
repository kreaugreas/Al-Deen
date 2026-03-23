import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Layout";
import { Search, Loader2, BookOpen, BookText, MessageSquare, Home, Clock } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { surahList, getSurah } from "@/Bottom/API/Quran";
import { hadithCollections } from "@/Bottom/API/Hadith";
import { duaCategories } from "@/Bottom/API/Dua";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { cn } from "@/Middle/Library/utils";

type SearchCategory = "pages" | "quran" | "hadiths" | "duas";

const CATEGORY_LABELS: Record<SearchCategory, string> = {
  pages: "Pages",
  quran: "Quran",
  hadiths: "Hadiths",
  duas: "Duas",
};

const CATEGORY_ICONS: Record<SearchCategory, React.ElementType> = {
  pages: Home,
  quran: BookOpen,
  hadiths: BookText,
  duas: MessageSquare,
};

interface VerseResult {
  surahId: number;
  surahName: string;
  verseNumber: number;
  arabic: string;
  translation: string;
  verseKey: string;
}

const AVAILABLE_SURAHS = [1, 112, 113, 114];

const ALL_PAGES = [
  { name: "Home", path: "/", icon: Home },
  { name: "Quran", path: "/Quran", icon: BookOpen },
  { name: "Hadiths", path: "/Hadiths", icon: BookText },
  { name: "Duas", path: "/Aid/Dua", icon: MessageSquare },
  { name: "Prayers", path: "/Prayers", icon: Clock },
  { name: "Tajweed", path: "/Tajweed", icon: BookOpen },
  { name: "Goals", path: "/Quran/Goals", icon: Home },
  { name: "Feedback", path: "/Feedback", icon: MessageSquare },
  { name: "Privacy", path: "/Privacy", icon: Home },
  { name: "Terms", path: "/Terms", icon: Home },
  { name: "Profile", path: "/Profile", icon: Home },
];

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const categoryParam = (searchParams.get("category") || "quran") as SearchCategory;
  const [searchQuery, setSearchQuery] = useState(query);
  const [category, setCategory] = useState<SearchCategory>(categoryParam);
  const [verseResults, setVerseResults] = useState<VerseResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  // Sync category from URL
  useEffect(() => {
    const cat = searchParams.get("category") as SearchCategory;
    if (cat && Object.keys(CATEGORY_LABELS).includes(cat)) {
      setCategory(cat);
    }
  }, [searchParams]);

  const updateSearch = (newQuery?: string, newCategory?: SearchCategory) => {
    const q = newQuery ?? searchQuery;
    const c = newCategory ?? category;
    if (newCategory) setCategory(c);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("category", c);
    setSearchParams(params, { replace: true });
  };

  // Page results
  const pageResults = useMemo(() => {
    if (!query || query.length < 1) return [];
    const lower = query.toLowerCase();
    return ALL_PAGES.filter((p) => p.name.toLowerCase().includes(lower));
  }, [query]);

  // Surah metadata search
  const surahResults = useMemo(() => {
    if (query.length < 1) return [];
    const lower = query.toLowerCase();
    return surahList.filter(
      (s) =>
        s.englishName.toLowerCase().includes(lower) ||
        s.name.includes(query) ||
        s.englishNameTranslation.toLowerCase().includes(lower) ||
        s.id.toString() === query
    );
  }, [query]);

  // Hadith collection search
  const hadithResults = useMemo(() => {
    if (query.length < 1) return [];
    const lower = query.toLowerCase();
    return hadithCollections.filter(
      (c) => c.name.toLowerCase().includes(lower) || c.arabicName.includes(query)
    );
  }, [query]);

  // Dua search
  const duaResults = useMemo(() => {
    if (query.length < 1) return [];
    const lower = query.toLowerCase();
    return duaCategories.filter(
      (c) => c.name.toLowerCase().includes(lower) || c.arabicName.includes(query)
    );
  }, [query]);

  // Verse search
  useEffect(() => {
    if (!query || query.length < 2 || category !== "quran") {
      setVerseResults([]);
      return;
    }

    let cancelled = false;
    const searchVerses = async () => {
      setIsLoading(true);
      try {
        const lower = query.toLowerCase();
        const found: VerseResult[] = [];
        for (const surahId of AVAILABLE_SURAHS) {
          try {
            const surah = await getSurah(surahId, { translation: "Direct" });
            const meta = surahList.find((s) => s.id === surahId);
            if (!meta) continue;
            for (const verse of surah.verses) {
              if (verse.translation?.toLowerCase().includes(lower) || verse.arabic.includes(query)) {
                found.push({
                  surahId: meta.id, surahName: meta.englishName, verseNumber: verse.verseNumber,
                  arabic: verse.arabic, translation: verse.translation ?? "", verseKey: `${meta.id}:${verse.verseNumber}`,
                });
              }
            }
          } catch {}
        }
        if (!cancelled) setVerseResults(found.slice(0, 30));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    searchVerses();
    return () => { cancelled = true; };
  }, [query, category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) updateSearch(searchQuery.trim());
  };

  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword) return text;
    try {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escaped})`, "gi");
      return text.split(regex).map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="text-primary font-medium bg-primary/10 px-0.5 rounded">{part}</span>
        ) : part
      );
    } catch { return text; }
  };

  const getResultsForCategory = () => {
    switch (category) {
      case "pages": return pageResults.length;
      case "quran": return surahResults.length + verseResults.length;
      case "hadiths": return hadithResults.length;
      case "duas": return duaResults.length;
    }
  };

  const resultCount = getResultsForCategory();

  return (
    <Layout>
      <div className="container py-6 max-w-3xl mx-auto px-4">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="glass-card flex items-center gap-3 px-4 py-3">
            <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${CATEGORY_LABELS[category]}...`}
              className="flex-1 bg-transparent border-none outline-none text-base text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
            {searchQuery && (
              <button type="button" onClick={() => { setSearchQuery(""); updateSearch(""); }} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
            )}
          </div>
        </form>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          {(Object.keys(CATEGORY_LABELS) as SearchCategory[]).map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            const isActive = category === cat;
            return (
              <button
                key={cat}
                onClick={() => updateSearch(undefined, cat)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "glass-btn"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>

        {/* Results */}
        {!query ? (
          <div className="text-center py-16 glass-card">
            <Search className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Search {CATEGORY_LABELS[category]}</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Type to search across {CATEGORY_LABELS[category].toLowerCase()}.
            </p>
            {category === "quran" && (
              <div className="flex flex-wrap justify-center gap-2">
                {["Al-Fatihah", "Mercy", "Prayer", "2:255"].map((term) => (
                  <button key={term} onClick={() => { setSearchQuery(term); updateSearch(term); }} className="glass-btn px-4 py-2 text-sm">{term}</button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Summary */}
            {!isLoading && (
              <p className="text-xs text-muted-foreground mb-4">
                {resultCount} result{resultCount !== 1 ? "s" : ""} in {CATEGORY_LABELS[category]}
              </p>
            )}

            {/* Pages */}
            {category === "pages" && pageResults.length > 0 && (
              <div className="space-y-2">
                {pageResults.map((page) => (
                  <Link key={page.path} to={page.path} className="glass-card flex items-center gap-3 p-4 hover:scale-[1.01] transition-transform">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      <page.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{highlightKeyword(page.name, query)}</p>
                      <p className="text-xs text-muted-foreground">{page.path}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Quran */}
            {category === "quran" && (
              <div className="space-y-3">
                {surahResults.length > 0 && (
                  <div className="space-y-2">
                    {surahResults.map((surah) => (
                      <Link key={surah.id} to={`/Quran/Surah/${surah.id}`} className="glass-card flex items-center gap-4 p-4 hover:scale-[1.01] transition-transform">
                        <span className="w-10 h-10 flex items-center justify-center glass-btn text-sm font-medium flex-shrink-0">{surah.id}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{highlightKeyword(surah.englishName, query)}</p>
                          <p className="text-xs text-muted-foreground">{surah.englishNameTranslation} • {surah.numberOfAyahs} verses</p>
                        </div>
                        <span className="font-arabic text-lg flex-shrink-0" dir="rtl">{surah.name}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Searching verses...</span>
                  </div>
                ) : verseResults.length > 0 ? (
                  <div className="space-y-2">
                    {surahResults.length > 0 && <div className="h-px bg-border/30 my-2" />}
                    {verseResults.map((result) => (
                      <Link key={result.verseKey} to={`/Quran/Surah/${result.surahId}?verse=${result.verseNumber}`} className="glass-card block p-4 hover:scale-[1.005] transition-transform">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground">{result.surahName}</span>
                          <span className="glass-btn px-2 py-0.5 text-xs">{result.verseKey}</span>
                        </div>
                        <p className="font-arabic text-base text-right leading-loose mb-2" dir="rtl">{result.arabic}</p>
                        {result.translation && <p className="text-sm text-foreground leading-relaxed">{highlightKeyword(result.translation, query)}</p>}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {/* Hadiths */}
            {category === "hadiths" && hadithResults.length > 0 && (
              <div className="space-y-2">
                {hadithResults.map((collection) => (
                  <Link key={collection.id} to={`/Hadiths/${collection.id}`} className="glass-card flex items-center gap-4 p-4 hover:scale-[1.01] transition-transform">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{highlightKeyword(collection.name, query)}</p>
                      <p className="text-xs text-muted-foreground">{collection.hadithCount.toLocaleString()} hadiths</p>
                    </div>
                    <span className="font-arabic text-lg flex-shrink-0" dir="rtl">{collection.arabicName}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* No results */}
            {!isLoading && resultCount === 0 && (
              <div className="text-center py-12 glass-card">
                <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-medium mb-1">No results in {CATEGORY_LABELS[category]}</p>
                <p className="text-sm text-muted-foreground">Try a different keyword or category.</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
