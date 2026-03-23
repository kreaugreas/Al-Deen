import { Link } from "react-router-dom";
import type { SurahMeta } from "@/Bottom/API/Quran";

interface SurahCardProps {
  surah: SurahMeta;
}

export function SurahCard({ surah }: SurahCardProps) {
  return (
    <Link
      to={`/Quran/Surah/${surah.id}`}
      className="glass-card flex items-center gap-3 sm:gap-4 p-3 sm:p-4 group hover:scale-[1.02] transition-transform duration-200"
    >
      <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full glass-btn flex items-center justify-center text-xs sm:text-sm font-medium group-hover:bg-primary/20 group-hover:text-primary transition-colors">
        {String(surah.id).padStart(3, '0')}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">{surah.englishName}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground truncate">{surah.englishNameTranslation}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-surah text-base sm:text-lg text-foreground" dir="rtl">{surah.surahFontName}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground">{surah.numberOfAyahs} Ayahs</p>
      </div>
    </Link>
  );
}
