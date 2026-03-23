import { useState } from "react";
import { Layout } from "@/Top/Component/Layout/Layout";
import { SurahCard } from "@/Top/Component/Surah/Card";
import { surahList, juzData, getSurahsByRevelationOrder } from "@/Bottom/API/Quran";
import { ArrowUpDown, TrendingUp, ChevronUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/Middle/Context/Auth-Context";
import { useReadingProgress } from "@/Middle/Hook/Use-Reading-Progress";

const revelationOrderedSurahs = getSurahsByRevelationOrder();

const tabs = [
  { id: "surah" as const,      label: "Surah" },
  { id: "juz" as const,        label: "Juz" },
  { id: "revelation" as const, label: "Revelation" },
];

const Quran = () => {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"surah" | "juz" | "revelation">("surah");
  const { user } = useAuth();
  const { progress } = useReadingProgress();
  const navigate = useNavigate();

  const continueReadingSurah = progress ? surahList.find((s) => s.id === progress.last_surah_id) : null;

  const filteredSurahs = surahList
    .filter((surah) =>
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.name.includes(searchQuery)
    )
    .sort((a, b) => (sortOrder === "asc" ? a.id - b.id : b.id - a.id));

  return (
    <Layout>
      {/* Continue Reading Section */}
      <section className="py-6 sm:py-8">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Last Read Card */}
            <div className="glass-card flex-col items-start p-4 sm:p-6">
              <div className="flex items-center justify-between w-full mb-3">
                <h2 className="text-sm font-medium text-muted-foreground">Continue Reading</h2>
                <Link
                  to={continueReadingSurah
                    ? `/Quran/Surah/${continueReadingSurah.id}?verse=${progress?.last_ayah_id || 1}`
                    : "/Quran/Surah/1"
                  }
                  className="glass-btn px-3 py-1.5 text-xs text-primary"
                >
                  Verse {progress?.last_ayah_id || 1} →
                </Link>
              </div>
              <div className="mb-3 w-full">
                <p className="font-surah text-2xl sm:text-3xl mb-2" dir="rtl">
                  {continueReadingSurah?.surahFontName || "001"}
                </p>
              </div>
              <div className="w-full">
                <p className="font-semibold text-sm sm:text-base">
                  {continueReadingSurah
                    ? `${continueReadingSurah.id}. ${continueReadingSurah.englishName}`
                    : "1. Al-Fatihah"}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  ({continueReadingSurah?.englishNameTranslation || "The Opener"})
                </p>
              </div>
            </div>

            {/* Goals Card */}
            <button
              onClick={() => {
                if (!user) { navigate("/Sign-Up"); return; }
                navigate("/Quran/Goals");
              }}
              className="glass-card w-full p-3 sm:p-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="glass-icon-btn w-9 h-9 sm:w-10 sm:h-10 text-primary">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base">Achieve Your Quran Goals</p>
                  <p className="text-[10px] sm:text-sm text-muted-foreground">Track Streaks, Create Custom Goals</p>
                </div>
              </div>
              <span className="text-muted-foreground">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Surah List with Tabs */}
      <section className="py-6 sm:py-8">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="glass-card !p-1 inline-flex gap-1">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="glass-btn px-3 py-1.5 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2"
            >
              <ArrowUpDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {sortOrder === "asc" ? "Ascending" : "Descending"}
              <ChevronUp className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Surah Tab */}
          {activeTab === "surah" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredSurahs.map((surah) => (
                <SurahCard key={surah.id} surah={surah} />
              ))}
            </div>
          )}

          {/* Juz Tab */}
          {activeTab === "juz" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {juzData.map((juz) => (
                <div key={juz.juzNumber} className="space-y-2">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="font-semibold text-sm sm:text-base">Juz {juz.juzNumber}</h3>
                    <Link to={`/Quran/Surah/${juz.surahs[0].id}`} className="glass-btn px-2 py-1 text-xs sm:text-sm text-primary">
                      Read Juz
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {juz.surahs.slice(0, 3).map((surahRef) => {
                      const surah = surahList.find((s) => s.id === surahRef.id);
                      if (!surah) return null;
                      return (
                        <Link
                          key={`${juz.juzNumber}-${surah.id}`}
                          to={`/Quran/Surah/${surah.id}`}
                          className="glass-card flex items-center justify-between p-2.5 sm:p-3"
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 glass-btn text-xs sm:text-sm">
                              {String(surah.id).padStart(3, '0')}
                            </span>
                            <div>
                              <p className="font-medium text-xs sm:text-sm">{surah.englishName}</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground">{surah.englishNameTranslation}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-surah text-xs sm:text-sm" dir="rtl">{surah.surahFontName}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">{surah.numberOfAyahs} Ayahs</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Revelation Order Tab */}
          {activeTab === "revelation" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {revelationOrderedSurahs.map((surah, index) => (
                <Link
                  key={surah.id}
                  to={`/Quran/Surah/${surah.id}`}
                  className="glass-card flex items-center justify-between p-3 sm:p-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 glass-btn text-primary font-semibold text-xs sm:text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm sm:text-base">{surah.englishName}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{surah.englishNameTranslation}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Surah {String(surah.id).padStart(3, '0')} • {surah.revelationType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-surah text-base sm:text-lg" dir="rtl">{surah.surahFontName}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{surah.numberOfAyahs} Ayahs</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Quran;