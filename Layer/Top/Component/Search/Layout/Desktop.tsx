import { X } from "lucide-react";
import { cn } from "@/Middle/Library/utils";
import { Button } from "@/Top/Component/UI/Button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dialog, DialogContent, DialogTitle } from "@/Top/Component/UI/Dialog";
import { SearchInput } from ".././Input";
import { SearchResults } from ".././Results";
import type { SearchCategory, SearchResult } from "../Types";

interface DesktopProps {
  open: boolean;
  onClose: () => void;
  query: string;
  setQuery: (query: string) => void;
  category: SearchCategory;
  setCategory: (category: SearchCategory) => void;
  results: SearchResult[];
  selectedIndex: number;
  onSearch: () => void;
  onResultClick: (path: string) => void;
  onSeeAll: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function Desktop({
  open,
  onClose,
  query,
  setQuery,
  category,
  setCategory,
  results,
  selectedIndex,
  onSearch,
  onResultClick,
  onSeeAll,
  inputRef,
}: DesktopProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] p-4 gap-0 bg-transparent border-0 shadow-none [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>Search</DialogTitle>
        </VisuallyHidden>
        
        {/* External Close Button */}
        <button 
          onClick={onClose}
          className="absolute -right-14 top-0 w-11 h-11 rounded-full bg-background/90 border border-border/50 shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
          aria-label="Close search"
        >
          <X className="h-5 w-5" />
        </button>

        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          "bg-white dark:bg-black border-2 border-black dark:border-white rounded-[40px] shadow-2xl",
          query.length > 0 ? "rounded-2xl" : "rounded-full"
        )}>
          <SearchInput
            query={query}
            setQuery={setQuery}
            category={category}
            setCategory={setCategory}
            onSearch={onSearch}
            inputRef={inputRef}
          />
          
          {query.length > 0 && (
            <SearchResults
              query={query}
              category={category}
              results={results}
              selectedIndex={selectedIndex}
              onResultClick={onResultClick}
              onSeeAll={onSeeAll}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}