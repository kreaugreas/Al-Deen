import { ProgressBar } from "../Progress-Bar";
import { useScrollDirection } from "@/Middle/Hook/Use-Scroll-Direction";

interface SurahNavbarProps {
  surahName: string;
  surahId: number;
  juz?: number;
  hizb?: number;
  page?: number;
  progress?: number;
}

export function SurahNavbar({ surahName, juz, hizb, page, progress = 0 }: SurahNavbarProps) {
  const { scrollDirection, isAtTop } = useScrollDirection();
  const headerVisible = isAtTop || scrollDirection === "up";

  return (
    <div
      className="fixed left-0 right-0 z-40 w-full transition-all duration-300 backdrop-blur-xl bg-background/70"
      style={{ top: headerVisible ? "80px" : "8px" }}
    >
      <div className="container relative flex flex-col gap-1 py-1">
        <div className="flex items-center justify-between px-2 sm:px-3 py-1.5">
          <span className="text-xs sm:text-sm font-medium text-foreground truncate">
            {surahName}
          </span>

          {juz !== undefined && (
            <span className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">
                Juz <span className="font-semibold text-foreground/80">{juz}</span> / Hizb <span className="font-semibold text-foreground/80">{hizb}</span> / Page <span className="font-semibold text-foreground/80">{page}</span>
              </span>
              <span className="sm:hidden">
                J<span className="font-semibold text-foreground/80">{juz}</span> / H<span className="font-semibold text-foreground/80">{hizb}</span> / P<span className="font-semibold text-foreground/80">{page}</span>
              </span>
            </span>
          )}
        </div>

        <div className="w-full">
          <ProgressBar progress={progress} className="relative h-1.5 rounded-full overflow-hidden !justify-start" />
        </div>
      </div>
    </div>
  );
}