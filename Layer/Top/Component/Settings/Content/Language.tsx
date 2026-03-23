import { useState } from "react";
import { Check, Search } from "lucide-react";
import { Input } from "@/Top/Component/UI/input";
import { useApp } from "@/Middle/Context/App-Context";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { cn } from "@/Middle/Library/utils";
import { languages } from "../Constants";

interface LanguageSectionProps {
  onSelect: () => void;
}

export function LanguageSection({ onSelect }: LanguageSectionProps) {
  const { t } = useTranslation();
  const { currentLanguage, setCurrentLanguage } = useApp();
  const [search, setSearch] = useState("");

  const filtered = languages.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.nativeName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (code: string) => {
    setCurrentLanguage(code);
    onSelect();
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t.settings.searchLanguages}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-muted/50 border-0"
        />
      </div>
      <div className="space-y-1">
        {filtered.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all",
              currentLanguage === lang.code ? "bg-primary/10" : "hover:bg-muted/50"
            )}
          >
            <div className="text-left">
              <p className="font-medium text-sm text-foreground">{lang.name}</p>
              <p className="text-xs text-muted-foreground">{lang.nativeName}</p>
            </div>
            {currentLanguage === lang.code && <Check className="h-4 w-4 text-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
}