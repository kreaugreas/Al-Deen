import { useState } from "react";
import { Layout } from "@/Top/Component/Layout/Index";
import { surahList, getSurahsByRevelationOrder, getSurah, getJuzCount, getHizbCount, getPageCount } from "@/Bottom/API/Quran";
import { Filter } from "@/Top/Component/Quran/Filter";
import { TrendingUp, Filter as FilterIcon, ChevronDown, Flame, ChevronRight, Clock, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/Middle/Context/Auth";
import { useReadingProgress } from "@/Middle/Hook/Use-Reading-Progress";
import { useQuranGoals } from "@/Middle/Hook/Use-Quran-Goals";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/Top/Component/UI/Card";
import { Button } from "@/Top/Component/UI/Button";
import { Progress_Ring } from "@/Top/Component/Quran/Goal/Progress";  // ✅ Fix: This is the correct path

const revelationOrderedSurahs = getSurahsByRevelationOrder();
const TOTAL_VERSES = 6236;

function versesBeforeSurah(surahId: number): number {
  return surahList.filter(s => s.id < surahId).reduce((sum, s) => sum + s.numberOfAyahs, 0);
}

const Quran = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState<"surah" | "juz" | "hizb" | "page" | "revelation" | null>(null);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null);
  const [revelationOrder, setRevelationOrder] = useState<"asc" | "desc">("asc");
  const { user } = useAuth();
  const { progress } = useReadingProgress();
  const { activeGoal, weekProgress } = useQuranGoals();
  const navigate = useNavigate();

  const continueReadingSurah = progress ? surahList.find((s) => s.id === progress.last_surah_id) : null;
  const continueReadingUrl = continueReadingSurah
    ? `/Quran/Surah/${continueReadingSurah.id}?verse=${progress?.last_ayah_id || 1}`
    : "/Quran/Surah/1";

  // Updated: Fetch with wbw: true when selectedAyah exists (for Kalimah view)
  const { data: surahData } = useQuery({
    queryKey: ['surah', selectedSurah, selectedAyah ? 'wbw' : 'standard'],
    queryFn: () => selectedSurah ? getSurah(selectedSurah, { 
      wbw: selectedAyah !== null,  // Only fetch KBK when viewing Kalimah
      wbwSource: "Saheeh"
    }) : null,
    enabled: !!selectedSurah,
  });

  const selectedSurahMeta = selectedSurah ? surahList.find(s => s.id === selectedSurah) : null;
  const ayahs = selectedSurahMeta ? Array.from({ length: selectedSurahMeta.numberOfAyahs }, (_, i) => i + 1) : [];

  // Calculate goal progress for display
  const getGoalDisplay = () => {
    if (!activeGoal) return null;

    const versesRead = progress 
      ? versesBeforeSurah(progress.last_surah_id) + (progress.last_ayah_id || 0) 
      : 0;

    if (activeGoal.goal_type === "time_based") {
      const dailyTarget = activeGoal.daily_target || 30;
      const todayProgress = weekProgress?.find(p => {
        const today = new Date().toISOString().split('T')[0];
        return p.date === today;
      });
      const todayMinutes = todayProgress?.minutes_read || 0;
      const percentage = Math.min(100, Math.round((todayMinutes / dailyTarget) * 100));
      const remaining = Math.max(0, dailyTarget - todayMinutes);
      
      return {
        type: "time",
        streak: activeGoal.current_streak || 0,
        percentage,
        progressValue: `${todayMinutes}/${dailyTarget}`,
        progressLabel: "min",
        remainingValue: `${remaining}`,
        remainingLabel: "left",
        sublabel: "today"
      };
    }
    
    if (activeGoal.goal_type === "khatm") {
      const percentage = Math.min(100, Math.round((versesRead / TOTAL_VERSES) * 100));
      const remainingVerses = TOTAL_VERSES - versesRead;
      
      return {
        type: "khatm",
        streak: activeGoal.current_streak || 0,
        percentage,
        progressValue: `${versesRead}`,
        progressLabel: "verses",
        remainingValue: remainingVerses.toLocaleString(),
        remainingLabel: "left",
        sublabel: `${Math.ceil(remainingVerses / 15)} pages`
      };
    }
    
    return null;
  };

  const goalDisplay = getGoalDisplay();
  const completedDays = weekProgress?.filter(p => p.completed).length || 0;

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

  return (
    <Layout>
      {/* Continue Reading Cards */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link to={continueReadingUrl} className="flex-1 min-w-[200px]">
          <Card className="p-4 sm:p-5 w-full hover:scale-[1.02] group h-full">
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
{/* Goals Card */}
<div className="flex-1 min-w-[280px]">
  <Card
    onClick={() => {
      if (!user) { navigate("/Sign-Up"); return; }
      navigate("/Quran/Goal");
    }}
    className="p-4 sm:p-5 w-full h-full hover:scale-[1.02] group cursor-pointer"
  >
    <div className="flex items-center gap-3 h-full">

      {/* Progress ring with % inside */}
      <div className="flex-shrink-0">
        {goalDisplay && goalDisplay.percentage > 0 ? (
          <Progress_Ring
            value={goalDisplay.percentage}
            size={44}
            strokeWidth={3}
            label={`${goalDisplay.percentage}%`}
          />
        ) : (
          <div className="w-11 h-11 rounded-full border border-dashed border-muted-foreground/25 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-muted-foreground/50 group-hover:text-white dark:group-hover:text-black" />
          </div>
        )}
      </div>

      {/* Title + subtitle */}
      <div className="flex-1 min-w-0">
        {goalDisplay ? (
          <>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold group-hover:text-white dark:group-hover:text-black truncate">
                {goalDisplay.type === "time" ? "Daily Progress" : "Khatm Progress"}
              </p>
              {goalDisplay.streak > 0 && (
                <div className="flex items-center gap-0.5">
                  <Flame className="h-3 w-3 text-muted-foreground group-hover:text-white dark:group-hover:text-black" />
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-white dark:group-hover:text-black">
                    {goalDisplay.streak}
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground group-hover:text-white dark:group-hover:text-black truncate mt-0.5">
              Remaining:{" "}
              <span className="font-medium group-hover:text-white dark:group-hover:text-black">
                ({goalDisplay.remainingValue} {goalDisplay.remainingLabel})
              </span>
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold group-hover:text-white dark:group-hover:text-black">
              Set a Goal
            </p>
            <p className="text-xs text-muted-foreground group-hover:text-white dark:group-hover:text-black">
              Track your progress
            </p>
          </>
        )}
      </div>

      {/* Chevron */}
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-white dark:group-hover:text-black" />

    </div>
  </Card>
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