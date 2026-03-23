import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { surahList } from "@/Bottom/API/Quran";

interface SurahNavigationProps {
  currentSurahId: number;
}

export function SurahNavigation({ currentSurahId }: SurahNavigationProps) {
  const prevSurah = surahList.find((s) => s.id === currentSurahId - 1);
  const nextSurah = surahList.find((s) => s.id === currentSurahId + 1);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex items-center justify-center gap-3 py-8 border-t border-border mt-8 flex-wrap">
      {prevSurah && (
        <Link to={`/Quran/Surah/${prevSurah.id}`} className="glass-btn px-4 py-2.5 gap-2 text-sm">
          <ChevronLeft className="h-4 w-4" />
          Previous Surah
        </Link>
      )}

      <button onClick={scrollToTop} className="glass-btn px-4 py-2.5 text-sm">
        Beginning of Surah
      </button>

      {nextSurah && (
        <Link to={`/Quran/Surah/${nextSurah.id}`} className="glass-btn px-4 py-2.5 gap-2 text-sm">
          Next Surah
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
