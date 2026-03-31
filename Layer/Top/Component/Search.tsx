import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, ArrowRight, Home, BookOpen, BookText, MessageSquare, HelpCircle, ChevronDown, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/Top/Component/UI/dialog";
import { Sheet, SheetContent } from "@/Top/Component/UI/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Top/Component/UI/dropdown-menu";
import { surahList, juzData } from "@/Bottom/API/Quran";
import { hadithCollections } from "@/Bottom/API/Hadith";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { useApp } from "@/Middle/Context/App";
import { cn } from "@/Middle/Library/utils";
import { useIsMobile } from "@/Middle/Hook/Use-Mobile";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ScrollArea } from "@/Top/Component/UI/scroll-area";

type SearchCategory = "pages" | "quran" | "hadiths";

const CATEGORY_LABELS: Record<SearchCategory, string> = {
  pages: "Pages",
  quran: "Quran",
  hadiths: "Hadiths",
  duas: "Duas",
};

const CATEGORY_PLACEHOLDERS: Record<SearchCategory, string> = {
  pages: "Search pages...",
  quran: "Search Surahs, Juz, Pages, Verses...",
  hadiths: "Search Hadith collections...",
  duas: "Search Duas...",
};

const CATEGORY_ICONS: Record<SearchCategory, React.ElementType> = {
  pages: Home,
  quran: BookOpen,
  hadiths: BookText,
  duas: MessageSquare,
};

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  arabicName?: string;
  path: string;
  type: string;
}

export function SpotlightSearch() {
  const { t, isRtl } = useTranslation();
  const { isSearchSidebarOpen, setSearchSidebarOpen, quranFont } = useApp();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SearchCategory>("pages");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const navLinks = useMemo(() => [
    { name: t.nav.home, path: "/", icon: Home },
    { name: t.nav.quran, path: "/Quran", icon: BookOpen },
    { name: t.nav.hadiths, path: "/Hadiths", icon: BookText },
    { name: t.nav.duas, path: "/Aid/Dua", icon: MessageSquare },
    { name: "Prayers", path: "/Prayers", icon: Home },
    { name: "Tajweed", path: "/Tajweed", icon: BookOpen },
    { name: "Goals", path: "/Quran/Goals", icon: Home },
  ], [t.nav]);

  const supportLinks = useMemo(() => [
    { name: t.nav.feedback, path: "/Feedback", icon: MessageSquare },
  ], [t.nav]);

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchSidebarOpen(!isSearchSidebarOpen);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isSearchSidebarOpen, setSearchSidebarOpen]);

  useEffect(() => {
    if (isSearchSidebarOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        setIsFocused(true);
      }, 100);
    } else {
      setIsFocused(false);
    }
  }, [isSearchSidebarOpen]);

  // Category-specific search
  useEffect(() => {
    if (query.length === 0) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    let results: SearchResult[] = [];

    switch (category) {
      case "pages":
        // Search pages/routes
        const allPages = [...navLinks, ...supportLinks];
        results = allPages
          .filter(page => page.name.toLowerCase().includes(lowerQuery))
          .map(page => ({
            id: page.path,
            title: page.name,
            path: page.path,
            type: "Page"
          }));
        break;

      case "quran":
        // Search Surahs
        const surahResults = surahList
          .filter(surah =>
            surah.englishName.toLowerCase().includes(lowerQuery) ||
            surah.name.includes(query) ||
            surah.englishNameTranslation.toLowerCase().includes(lowerQuery) ||
            surah.id.toString() === query
          )
          .slice(0, 5)
          .map(surah => ({
            id: `surah-${surah.id}`,
            title: surah.englishName,
            subtitle: `${surah.numberOfAyahs} verses • ${surah.englishNameTranslation}`,
            arabicName: surah.name,
            path: `/quran/surah/${surah.id}`,
            type: "Surah"
          }));
        
        // Search Juz
        const juzResults = juzData
          .filter(juz =>
            `juz ${juz.juzNumber}`.includes(lowerQuery) ||
            juz.juzNumber.toString() === query
          )
          .slice(0, 3)
          .map(juz => ({
            id: `juz-${juz.juzNumber}`,
            title: `Juz ${juz.juzNumber}`,
            subtitle: `Starts from Surah ${juz.surahs[0]?.id || 1}`,
            path: `/quran/juz/${juz.juzNumber}`,
            type: "Juz"
          }));
        
        // Search Pages (1-604)
        const pageMatch = query.match(/^(?:page\s*)?(\d+)$/i);
        const pageResults: SearchResult[] = [];
        if (pageMatch) {
          const pageNum = parseInt(pageMatch[1]);
          if (pageNum >= 1 && pageNum <= 604) {
            pageResults.push({
              id: `page-${pageNum}`,
              title: `Page ${pageNum}`,
              subtitle: "Quran Page",
              path: `/quran/page/${pageNum}`,
              type: "Page"
            });
          }
        }
        
        // Search for verse references (e.g., "2:255" or "surah 2 verse 255")
        const verseMatch = query.match(/^(\d+):(\d+)$/);
        const verseResults: SearchResult[] = [];
        if (verseMatch) {
          const surahNum = parseInt(verseMatch[1]);
          const verseNum = parseInt(verseMatch[2]);
          const surah = surahList.find(s => s.id === surahNum);
          if (surah && verseNum <= surah.numberOfAyahs) {
            verseResults.push({
              id: `verse-${surahNum}-${verseNum}`,
              title: `${surah.englishName} ${surahNum}:${verseNum}`,
              subtitle: `Verse ${verseNum} of ${surah.englishName}`,
              arabicName: surah.name,
              path: `/quran/surah/${surahNum}?verse=${verseNum}`,
              type: "Verse"
            });
          }
        }
        
        results = [...verseResults, ...surahResults, ...juzResults, ...pageResults];
        break;

      case "hadiths":
        // Search Hadith collections
        results = hadithCollections
          .filter(collection =>
            collection.name.toLowerCase().includes(lowerQuery) ||
            collection.arabicName.includes(query)
          )
          .map(collection => ({
            id: collection.id,
            title: collection.name,
            subtitle: `${collection.hadithCount.toLocaleString()} hadiths`,
            arabicName: collection.arabicName,
            path: `/hadiths/${collection.id}`,
            type: "Collection"
          }));
        break;

      case "duas":
        // Search Duas
        results = duaCategories
          .filter(cat =>
            cat.name.toLowerCase().includes(lowerQuery) ||
            cat.arabicName.includes(query)
          )
          .map(cat => ({
            id: cat.id,
            title: cat.name,
            subtitle: `${cat.count} duas`,
            arabicName: cat.arabicName,
            path: `/duas/${cat.id}`,
            type: "Category"
          }));
        break;
    }

    const newResults = results.slice(0, 8);
    setSearchResults(newResults);
    // Auto-select first result
    setSelectedIndex(0);
  }, [query, category, navLinks, supportLinks]);

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}&category=${category}`);
      handleClose();
    }
  }, [query, category, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      if (searchResults.length > 0 && selectedIndex >= 0) {
        handleResultClick(searchResults[selectedIndex].path);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      handleClose();
    }
  };

  const handleResultClick = (path: string) => {
    navigate(path);
    handleClose();
  };

  const handleClose = () => {
    setSearchSidebarOpen(false);
    setQuery("");
    setCategory("pages");
    setIsFocused(false);
    setDropdownOpen(false);
  };

  const handleLinkClick = (path: string) => {
    navigate(path);
    handleClose();
  };

  // Get font class for Quran text preview
  const getFontClass = () => {
    return "font-tajweed tajweed-colors";
  };

  const getResultTypeLabel = () => {
    switch (category) {
      case "quran": return "Quran Results";
      case "hadiths": return "Hadith Collections";
      case "duas": return "Dua Categories";
      default: return "Pages";
    }
  };

  // Desktop Spotlight Content
  const SpotlightContent = (
    <div className="relative" dir={isRtl ? "rtl" : "ltr"}>
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          "glass-card shadow-2xl",
          query.length > 0 ? "rounded-2xl" : "rounded-full"
        )}
      >
        {/* Search Input Row */}
        <div className="flex items-center px-3 py-1.5 gap-2 relative z-10">
          <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            placeholder={CATEGORY_PLACEHOLDERS[category]}
            className="flex-1 bg-transparent border-none outline-none text-xs placeholder:text-muted-foreground text-foreground relative z-10"
            aria-label="Search"
          />
          
          {/* Category Dropdown - Only show when input is empty */}
          {!query && (
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors whitespace-nowrap z-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setDropdownOpen(!dropdownOpen);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  aria-label={`Filter by ${CATEGORY_LABELS[category]}`}
                >
                  {CATEGORY_LABELS[category]}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", dropdownOpen && "rotate-180")} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="glass-dropdown min-w-[140px] z-[100]"
                onPointerDownOutside={(e) => e.preventDefault()}
              >
                {(Object.keys(CATEGORY_LABELS) as SearchCategory[]).map((cat) => {
                  const IconComponent = CATEGORY_ICONS[cat];
                  return (
                    <DropdownMenuItem
                      key={cat}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategory(cat);
                        setDropdownOpen(false);
                        inputRef.current?.focus();
                      }}
                      className={cn(
                        "cursor-pointer flex items-center gap-2",
                        category === cat && "bg-primary/10 text-primary"
                      )}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="flex-1">{CATEGORY_LABELS[cat]}</span>
                      {category === cat && <Check className="h-3.5 w-3.5" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Clear button when typing */}
          {query && (
            <button 
              className="glass-icon-btn w-7 h-7 flex-shrink-0"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Results Area */}
        {query.length > 0 && (
          <>
            <div className="h-px bg-border/50 mx-4" />
            
            <ScrollArea className="max-h-[50vh] p-2">
              {searchResults.length > 0 ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{getResultTypeLabel()}</span>
                    <button 
                      className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                      onClick={handleSearch}
                    >
                      See all <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                  {searchResults.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result.path)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left group cursor-pointer",
                        selectedIndex === index ? "bg-secondary/70" : "hover:bg-secondary/50"
                      )}
                    >
                      <div className="glass-icon-btn w-10 h-10 flex-shrink-0">
                        <span className="text-xs font-medium">{result.type.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{result.title}</p>
                          {result.arabicName && (
                            <span className={cn("text-base", getFontClass())} dir="rtl">{result.arabicName}</span>
                          )}
                        </div>
                        {result.subtitle && (
                          <p className="text-xs text-muted-foreground">{result.subtitle}</p>
                        )}
                      </div>
                      <ArrowRight className={cn(
                        "h-4 w-4 text-muted-foreground transition-opacity flex-shrink-0",
                        selectedIndex === index ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No results for "{query}" in {CATEGORY_LABELS[category]}</p>
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );

  // Mobile: Full-screen sidebar
  const MobileSearchContent = (
    <div className="flex flex-col h-full bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <span className="font-semibold text-foreground text-lg">{t.nav.search}</span>
        <button onClick={handleClose} className="glass-icon-btn w-9 h-9">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-border space-y-3 bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-background rounded-full border border-border px-3 py-2 shadow-sm relative z-10">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={CATEGORY_PLACEHOLDERS[category]}
              className="text-sm flex-1 px-3 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground relative z-10"
            />
            {query && (
              <button 
                className="p-1.5 hover:bg-secondary rounded-full"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
        
        {/* Category Dropdown for Mobile - Only show when input is empty */}
        {!query && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-full bg-secondary/50 text-sm font-medium"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  {(() => {
                    const IconComponent = CATEGORY_ICONS[category];
                    return <IconComponent className="h-4 w-4" />;
                  })()}
                  <span>{CATEGORY_LABELS[category]}</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="glass-dropdown w-[calc(100vw-32px)] z-[100]"
              onPointerDownOutside={(e) => e.preventDefault()}
            >
              {(Object.keys(CATEGORY_LABELS) as SearchCategory[]).map((cat) => {
                const IconComponent = CATEGORY_ICONS[cat];
                return (
                  <DropdownMenuItem
                    key={cat}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCategory(cat);
                    }}
                    className={cn(
                      "cursor-pointer flex items-center gap-2 py-3",
                      category === cat && "bg-primary/10 text-primary"
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="flex-1">{CATEGORY_LABELS[cat]}</span>
                    {category === cat && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Results */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {query.length > 0 && searchResults.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 mb-3">
                <span className="text-sm font-medium text-foreground">{getResultTypeLabel()}</span>
                <button 
                  className="text-sm text-primary hover:underline font-medium flex items-center gap-1"
                  onClick={handleSearch}
                >
                  All results <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result.path)}
                  className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl bg-card border border-border/50 hover:bg-secondary transition-colors text-left group cursor-pointer shadow-sm"
                >
                  <div className="glass-icon-btn w-11 h-11 flex-shrink-0">
                    <span className="text-sm font-semibold">{result.type.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{result.title}</p>
                    </div>
                    {result.subtitle && (
                      <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                    )}
                  </div>
                  {result.arabicName && (
                    <span className={cn("text-lg", getFontClass())} dir="rtl">{result.arabicName}</span>
                  )}
                </button>
              ))}
            </div>
          ) : query.length > 0 ? (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No results for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Quick Navigation */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                  Quick Navigation
                </p>
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <button
                      key={link.path}
                      onClick={() => handleLinkClick(link.path)}
                      className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-secondary transition-colors group text-left cursor-pointer"
                    >
                      <div className="glass-icon-btn w-10 h-10 flex-shrink-0">
                        <link.icon className="h-4 w-4" />
                      </div>
                      <span className="flex-1 text-foreground font-medium">{link.name}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Support Links */}
              <div className="pt-4 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                  {t.nav.support}
                </p>
                <div className="space-y-1">
                  {supportLinks.map((link) => (
                    <button
                      key={link.path}
                      onClick={() => handleLinkClick(link.path)}
                      className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-secondary transition-colors group text-left cursor-pointer"
                    >
                      <div className="glass-icon-btn w-10 h-10 flex-shrink-0">
                        <link.icon className="h-4 w-4" />
                      </div>
                      <span className="flex-1 text-foreground font-medium">{link.name}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // Mobile: Full-screen sidebar
  if (isMobile) {
    return (
      <Sheet open={isSearchSidebarOpen} onOpenChange={setSearchSidebarOpen}>
        <SheetContent side={isRtl ? "right" : "left"} className="p-0 w-full border-0" hideCloseButton>
          {MobileSearchContent}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Spotlight-style centered dialog
  return (
    <Dialog open={isSearchSidebarOpen} onOpenChange={setSearchSidebarOpen}>
      <DialogContent className="sm:max-w-[520px] p-4 gap-0 bg-transparent border-0 shadow-none [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>{t.nav.search}</DialogTitle>
        </VisuallyHidden>
        
        {/* External Close Button */}
        <button 
          onClick={handleClose}
          className="absolute -right-14 top-0 glass-icon-btn w-11 h-11 shadow-lg hover:scale-105 transition-transform bg-background/90 border border-border/50"
          aria-label="Close search"
        >
          <X className="h-5 w-5" />
        </button>

        {SpotlightContent}
      </DialogContent>
    </Dialog>
  );
}
