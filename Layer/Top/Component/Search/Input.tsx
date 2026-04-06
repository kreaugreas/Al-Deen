import { useState } from "react";
import { Search, X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/Middle/Library/utils";
import { Button } from "@/Top/Component/UI/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Top/Component/UI/Dropdown-Menu";
import { Container } from "@/Top/Component/UI/Container";
import { CATEGORIES } from "./Utility";
import type { SearchInputProps, SearchCategory } from "./Types";

export function SearchInput({
  query,
  setQuery,
  category,
  setCategory,
  onSearch,
  onClose,
  isFocused,
  inputRef,
}: SearchInputProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const currentCategory = CATEGORIES.find(c => c.id === category)!;

  const handleClear = () => {
    setQuery("");
    inputRef?.current?.focus();
  };

  return (
    <Container className="!py-0 !px-0 overflow-hidden">
      <div className="flex items-center w-full px-3 py-1.5 gap-2">
        <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder={currentCategory.placeholder}
          className="flex-1 bg-transparent border-none outline-none text-xs placeholder:text-muted-foreground text-foreground"
          aria-label="Search"
        />
        
        {/* Category Dropdown - Only show when input is empty */}
        {!query && (
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors whitespace-nowrap z-50"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {currentCategory.label}
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", dropdownOpen && "rotate-180")} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px] z-[100]">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <DropdownMenuItem
                    key={cat.id}
                    onClick={() => {
                      setCategory(cat.id);
                      setDropdownOpen(false);
                      inputRef?.current?.focus();
                    }}
                    className={cn(
                      "cursor-pointer flex items-center gap-2",
                      category === cat.id && "bg-primary/10 text-primary"
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="flex-1">{cat.label}</span>
                    {category === cat.id && <Check className="h-3.5 w-3.5" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Clear button when typing */}
        {query && (
          <Button 
            size="sm"
            className="w-7 h-7 p-0 rounded-full flex-shrink-0"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </Container>
  );
}