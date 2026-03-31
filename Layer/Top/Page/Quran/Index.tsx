import { useState } from "react";
import { Layout } from "@/Top/Component/Layout/Index";
import { surahList, getSurahsByRevelationOrder, getSurah, getJuzCount, getHizbCount, getPageCount } from "@/Bottom/API/Quran";
import { Filter } from "@/Top/Component/Quran/Filter";
import { TrendingUp, Filter as FilterIcon, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/Middle/Context/Auth";
import { useReadingProgress } from "@/Middle/Hook/Use-Reading-Progress";
import { useQuranGoals } from "@/Middle/Hook/Use-Quran-Goals";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/Top/Component/UI/Card";
import { Button } from "@/Top/Component/UI/Button";

const revelationOrderedSurahs = getSurahsByRevelationOrder();

const Quran = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState<"surah" | "juz" | "hizb" | "page" | "revelation" | null>(null);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null);
  const [revelationOrder, setRevelationOrder] = useState<"asc" | "desc">("asc");
  const { user } = useAuth();
  const { progress } = useReadingProgress();
  const { activeGoal } = useQuranGoals();
  const navigate = useNavigate();

  const continueReadingSurah = progress ? surahList.find((s) => s.id === progress.last_surah_id) : null;
  const continueReadingUrl = continueReadingSurah
    ? `/Quran/Surah/${continueReadingSurah.id}?verse=${progress?.last_ayah_id || 1}`
    : "/Quran/Surah/1";

  const { data: surahData } = useQuery({
    queryKey: ['surah', selectedSurah],
    queryFn: () => selectedSurah ? getSurah(selectedSurah) : null,
    enabled: !!selectedSurah,
  });

  const selectedSurahMeta = selectedSurah ? surahList.find(s => s.id === selectedSurah) : null;
  const ayahs = selectedSurahMeta ? Array.from({ length: selectedSurahMeta.numberOfAyahs }, (_, i) => i + 1) : [];

  const getView = () => {
    if (selectedSurah && selectedAyah && surahData) {
      const verse = surahData.verses[selectedAyah - 1];
      return {
        type: "kalimah",
        data: verse?.words.map((word: string, idx: number) => ({
          text: word,
          index: idx,
          translation: verse?.wbwTranslation?.[idx]
        })) || []
      };
    }
    
    if (selectedSurah && !selectedAyah) {
      return { type: "ayahs", data: ayahs, surah: selectedSurahMeta };
    }
    
    if (filterType === "juz") {
      const juzCount = getJuzCount();
      return { type: "juz", data: Array.from({ length: juzCount }, (_, i) => i + 1) };
    }
    
    if (filterType === "hizb") {
      const hizbCount = getHizbCount();
      return { type: "hizb", data: Array.from({ length: hizbCount }, (_, i) => i + 1) };
    }
    
    if (filterType === "page") {
      const pageCount = getPageCount();
      return { type: "page", data: Array.from({ length: pageCount }, (_, i) => i + 1) };
    }
    
    if (filterType === "revelation") {
      const sorted = revelationOrder === "asc" ? revelationOrderedSurahs : [...revelationOrderedSurahs].reverse();
      return { type: "revelation", data: sorted };
    }
    
    return { type: "surahs", data: surahList };
  };

  const view = getView();

  const handleApplyFilter = () => {
    setShowFilter(false);
  };

  const handleReset = () => {
    setFilterType(null);
    setSelectedSurah(null);
    setSelectedAyah(null);
    setRevelationOrder("asc");
  };

  const getFilterLabel = () => {
    if (selectedSurah && selectedAyah) return `Surah ${selectedSurah}, Ayah ${selectedAyah}`;
    if (selectedSurah) return `Surah ${selectedSurah}`;
    if (filterType === "juz") return "Juz";
    if (filterType === "hizb") return "Hizb";
    if (filterType === "page") return "Page";
    if (filterType === "revelation") return revelationOrder === "asc" ? "Revelation (1→114)" : "Revelation (114→1)";
    return "Filter";
  };

  const getGoalProgress = () => {
    if (!activeGoal) return null;
    
    if (activeGoal.goal_type === "time_based") {
      return { type: "streak", value: activeGoal.current_streak, label: `${activeGoal.current_streak} day streak` };
    } else if (activeGoal.goal_type === "khatm") {
      const totalVerses = 6236;
      const currentSurah = progress?.last_surah_id || 1;
      const currentAyah = progress?.last_ayah_id || 1;
      let versesRead = 0;
      for (let i = 1; i < currentSurah; i++) {
        const surah = surahList.find(s => s.id === i);
        if (surah) versesRead += surah.numberOfAyahs;
      }
      versesRead += currentAyah;
      const percentage = Math.round((versesRead / totalVerses) * 100);
      return { type: "progress", value: percentage, label: `${percentage}% completed` };
    } else {
      return { type: "streak", value: activeGoal.current_streak, label: `${activeGoal.current_streak} day streak` };
    }
  };

  const goalProgress = getGoalProgress();

  return (
    <Layout>
      {/* Continue Reading Cards */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link to={continueReadingUrl} className="flex-1 min-w-[200px]">
          <Card className="p-4 sm:p-5 w-full hover:scale-[1.02] group">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium group-hover:text-white dark:group-hover:text-black">Continue Reading</h2>
              <Button size="sm" className="text-xs">
                {progress?.last_ayah_id ? `Ayah ${progress.last_ayah_id}` : "Start"}
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="font-surah text-3xl sm:text-4xl group-hover:text-white dark:group-hover:text-black" dir="rtl">
                {continueReadingSurah?.surahFontName || "001"}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm sm:text-base group-hover:text-white dark:group-hover:text-black">
                  {continueReadingSurah
                    ? `${continueReadingSurah.id}. ${continueReadingSurah.englishNameTransliteration || continueReadingSurah.englishName}`
                    : "1. Al-Fatihah"}
                </p>
                <p className="text-xs group-hover:text-white dark:group-hover:text-black">
                  {continueReadingSurah?.englishNameTranslation || "The Opener"}
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <div className="flex-1 min-w-[200px]">
          <Button
            onClick={() => {
              if (!user) { navigate("/Sign-Up"); return; }
              navigate("/Quran/Goals");
            }}
            className="w-full p-4 sm:p-5 flex items-center justify-between group hover:scale-[1.02]"
            fullWidth
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 text-primary group-hover:scale-105 transition-transform">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm sm:text-base">Quran Goals</p>
                {goalProgress ? (
                  <div className="mt-1">
                    <div className="flex items-center gap-2">
                      {goalProgress.type === "progress" && (
                        <>
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-500" 
                              style={{ width: `${goalProgress.value}%` }} 
                            />
                          </div>
                          <p className="text-[10px] text-primary">{goalProgress.label}</p>
                        </>
                      )}
                      {goalProgress.type === "streak" && (
                        <p className="text-[10px] text-primary">🔥 {goalProgress.label}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs">Track your progress</p>
                )}
              </div>
            </div>
            <span className="group-hover:text-primary transition-colors">→</span>
          </Button>
        </div>
      </div>

      {/* Filter Button */}
      <div className="flex justify-end mb-6">
        <Button
          onClick={() => setShowFilter(!showFilter)}
          className={`flex items-center gap-2 ${filterType || selectedSurah ? "active" : ""}`}
        >
          <FilterIcon className="h-4 w-4" />
          {getFilterLabel()}
          <ChevronDown className={`h-3 w-3 transition-transform ${showFilter ? "rotate-180" : ""}`} />
        </Button>
        <Filter
          isOpen={showFilter}
          onClose={() => setShowFilter(false)}
          filterType={filterType}
          setFilterType={setFilterType}
          selectedSurah={selectedSurah}
          setSelectedSurah={setSelectedSurah}
          selectedAyah={selectedAyah}
          setSelectedAyah={setSelectedAyah}
          revelationOrder={revelationOrder}
          setRevelationOrder={setRevelationOrder}
          onApply={handleApplyFilter}
          onReset={handleReset}
        />
      </div>

      {/* Content Grid */}
      <div className="flex flex-wrap gap-3">
        {/* Kalimah View */}
        {view.type === "kalimah" && view.data.map((word, idx) => (
          <div key={idx} className="flex-1 min-w-[120px]">
            <Link to={`/Quran/Surah/${selectedSurah}/Ayah/${selectedAyah}/Kalima/${idx + 1}`} className="w-full block">
              <Card className="p-4 text-center transition-all hover:scale-[1.02] group">
                <p className="font-semibold text-lg group-hover:text-white dark:group-hover:text-black">{idx + 1}</p>
                <p className="font-surah text-sm truncate group-hover:text-white dark:group-hover:text-black" dir="rtl">{word.text}</p>
                {word.translation && <p className="text-xs mt-1 truncate group-hover:text-white dark:group-hover:text-black">{word.translation}</p>}
              </Card>
            </Link>
          </div>
        ))}

        {/* Ayahs View */}
        {view.type === "ayahs" && view.data.map((ayahNum) => (
          <div key={ayahNum} className="flex-1 min-w-[80px]">
            <Button
              onClick={() => setSelectedAyah(ayahNum)}
              className="w-full p-4 text-center transition-all hover:scale-[1.02] group"
              fullWidth
            >
              <p className="font-semibold text-lg group-hover:text-white dark:group-hover:text-black">{ayahNum}</p>
            </Button>
          </div>
        ))}

        {/* Juz View */}
        {view.type === "juz" && view.data.map((juzNum) => (
          <div key={juzNum} className="flex-1 min-w-[80px]">
            <Link to={`/Quran/Juz/${juzNum}`} className="w-full block">
              <Card className="p-4 text-center transition-all hover:scale-[1.02] group">
                <p className="font-semibold text-lg group-hover:text-white dark:group-hover:text-black">{juzNum}</p>
              </Card>
            </Link>
          </div>
        ))}

        {/* Hizb View */}
        {view.type === "hizb" && view.data.map((hizbNum) => (
          <div key={hizbNum} className="flex-1 min-w-[80px]">
            <Link to={`/Quran/Hizb/${hizbNum}`} className="w-full block">
              <Card className="p-4 text-center transition-all hover:scale-[1.02] group">
                <p className="font-semibold text-lg group-hover:text-white dark:group-hover:text-black">{hizbNum}</p>
              </Card>
            </Link>
          </div>
        ))}

        {/* Page View */}
        {view.type === "page" && view.data.map((pageNum) => (
          <div key={pageNum} className="flex-1 min-w-[80px]">
            <Link to={`/Quran/Page/${pageNum}`} className="w-full block">
              <Card className="p-4 text-center transition-all hover:scale-[1.02] group">
                <p className="font-semibold text-lg group-hover:text-white dark:group-hover:text-black">{pageNum}</p>
              </Card>
            </Link>
          </div>
        ))}

        {/* Revelation Order View */}
        {view.type === "revelation" && view.data.map((surah) => (
          <div
            key={surah.id}
            onClick={() => navigate(`/Quran/Surah/${surah.id}`)}
            className="flex-1 min-w-[200px] cursor-pointer"
          >
            <Card className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 transition-all duration-200 group hover:scale-[1.02]">
              <Button
                size="sm"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full p-0 flex items-center justify-center"
              >
                {String(surah.id).padStart(3, '0')}
              </Button>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base truncate group-hover:text-white dark:group-hover:text-black">
                  {surah.englishNameTransliteration || surah.englishName}
                </h3>
                <p className="text-xs sm:text-sm truncate group-hover:text-white dark:group-hover:text-black">
                  {surah.englishNameTranslation}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-surah text-base sm:text-lg group-hover:text-white dark:group-hover:text-black" dir="rtl">
                  {surah.surahFontName}
                </p>
                <p className="text-[10px] sm:text-xs group-hover:text-white dark:group-hover:text-black">
                  {surah.revelationType}
                </p>
              </div>
            </Card>
          </div>
        ))}

        {/* Surahs View (Default) */}
        {view.type === "surahs" && view.data.map((surah) => (
          <div
            key={surah.id}
            onClick={() => {
              if (filterType === "surah") {
                setSelectedSurah(surah.id);
              } else {
                navigate(`/Quran/Surah/${surah.id}`);
              }
            }}
            className="flex-1 min-w-[200px] cursor-pointer"
          >
            <Card className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 transition-all duration-200 group hover:scale-[1.02]">
              <Button
                size="sm"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full p-0 flex items-center justify-center"
              >
                {String(surah.id).padStart(3, '0')}
              </Button>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base truncate group-hover:text-white dark:group-hover:text-black">
                  {surah.englishNameTransliteration || surah.englishName}
                </h3>
                <p className="text-xs sm:text-sm truncate group-hover:text-white dark:group-hover:text-black">
                  {surah.englishNameTranslation}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-surah text-base sm:text-lg group-hover:text-white dark:group-hover:text-black" dir="rtl">
                  {surah.surahFontName}
                </p>
                <p className="text-[10px] sm:text-xs group-hover:text-white dark:group-hover:text-black">
                  {surah.numberOfAyahs} Ayahs
                </p>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Quran;