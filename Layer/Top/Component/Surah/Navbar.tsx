import { Container } from "@/Top/Component/UI/Container";
import { useScrollDirection } from "@/Middle/Hook/Use-Scroll-Direction";

interface SurahNavbarProps {
  surahName: string;
  surahId: number;
  juz?: number;
  hizb?: number;
  page?: number;
}

export function SurahNavbar({ surahName, juz, hizb, page }: SurahNavbarProps) {
  const { scrollDirection, isAtTop } = useScrollDirection();
  const headerVisible = isAtTop || scrollDirection === "up";

  return (
    <div
      className="fixed left-0 right-0 z-40 w-full transition-all duration-300 flex justify-end"
      style={{ top: headerVisible ? "80px" : "8px" }}
    >
      <Container className="!py-2 !px-4 !w-auto mr-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground truncate">
            {surahName}
          </span>

          {juz !== undefined && hizb !== undefined && page !== undefined && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">
                Juz <span className="font-semibold text-foreground/80">{juz}</span>
              </span>
              <span className="sm:hidden">
                J<span className="font-semibold text-foreground/80">{juz}</span>
              </span>
              
              <span className="text-muted-foreground/30">•</span>
              
              <span className="hidden sm:inline">
                Hizb <span className="font-semibold text-foreground/80">{hizb}</span>
              </span>
              <span className="sm:hidden">
                H<span className="font-semibold text-foreground/80">{hizb}</span>
              </span>
              
              <span className="text-muted-foreground/30">•</span>
              
              <span className="hidden sm:inline">
                Page <span className="font-semibold text-foreground/80">{page}</span>
              </span>
              <span className="sm:hidden">
                P<span className="font-semibold text-foreground/80">{page}</span>
              </span>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}