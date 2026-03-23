import { Search, X, ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { surahList } from "@/Bottom/API/Quran";
import { useTranslation } from "@/Middle/Hook/Use-Translation";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

const suggestions = [
  { label: "Juz 1", type: "juz", path: "/Quran/Juz/1" },
  { label: "Page 1", type: "page", path: "/Quran/Page/1" },
  { label: "Surah Yasin", type: "surah", path: "/Quran/Surah/36" },
  { label: "Ayatul Kursi", type: "verse", path: "/Quran/Surah/2?verse=255" },
];

export function SearchBar({ placeholder, className = "" }: SearchBarProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof surahList>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = surahList.filter(
        (surah) =>
          surah.englishName.toLowerCase().includes(query.toLowerCase()) ||
          surah.name.includes(query) ||
          surah.id.toString() === query
      );
      setSearchResults(filtered.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  }, [query]);

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/Search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSurahClick = (surahId: number) => {
    navigate(`/Quran/Surah/${surahId}`);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-2xl mx-auto ${className}`}>
      {/* Glass Input */}
      <div className="glass-input">
        <Search className="h-5 w-5 text-muted-foreground ml-5 flex-shrink-0 relative z-10" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t.search.placeholder}
          className="text-base md:text-lg flex-1"
        />
        {query ? (
          <button 
            className="glass-icon-btn w-9 h-9 mr-2 relative z-10"
            onClick={() => setQuery("")}
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button 
            className="glass-icon-btn w-9 h-9 mr-2 relative z-10"
            onClick={handleSearch}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Glass Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 glass-dropdown z-50">
          <div className="glass-content p-2">
            {query.length > 0 && searchResults.length > 0 ? (
              <>
                <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 mb-2">
                  <span className="text-sm text-muted-foreground">Search Results</span>
                  <button 
                    className="text-sm text-primary hover:underline font-medium"
                    onClick={handleSearch}
                  >
                    More results →
                  </button>
                </div>
                {searchResults.map((surah) => (
                  <button
                    key={surah.id}
                    onClick={() => handleSurahClick(surah.id)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 transition-colors text-left group"
                  >
                    <div className="glass-icon-btn w-9 h-9">
                      <span className="text-sm font-medium">{surah.id}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{surah.englishName}</p>
                      <p className="text-sm text-muted-foreground">{surah.numberOfAyahs} verses</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </>
            ) : query.length > 0 ? (
              <div className="p-5 text-center">
                <p className="text-muted-foreground">No surahs found for "{query}"</p>
                <button 
                  className="text-primary hover:underline mt-2 font-medium"
                  onClick={handleSearch}
                >
                  Search in verses →
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground px-3 py-2">Try navigating to</p>
                {suggestions.map((suggestion, index) => (
                  <Link
                    key={index}
                    to={suggestion.path}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 transition-colors group"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="glass-icon-btn w-9 h-9">
                      <Search className="h-4 w-4" />
                    </div>
                    <span className="text-foreground">{suggestion.label}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
