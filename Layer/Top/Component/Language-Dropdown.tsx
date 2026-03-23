import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Top/Component/UI/dropdown-menu";
import { Button } from "@/Top/Component/UI/button";
import { Globe, Check } from "lucide-react";
import { useApp } from "@/Middle/Context/App-Context";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/Top/Component/UI/tooltip";

const languages = [
  { code: "en", name: "English", nativeName: "English", available: true },
  { code: "fr", name: "French", nativeName: "Français", available: true },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", available: true },
];

export function LanguageDropdown() {
  const { currentLanguage, setCurrentLanguage } = useApp();

  const currentLang = languages.find((l) => l.code === currentLanguage);

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Globe className="h-5 w-5" />
              <span className="sr-only">Change language</span>
              {currentLang && (
                <span className="absolute -bottom-0.5 -right-0.5 text-[10px] font-medium bg-primary text-primary-foreground rounded px-1">
                  {currentLang.code.toUpperCase()}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Language: {currentLang?.name || "English"}</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-52 bg-background z-50 max-h-80 overflow-y-auto">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setCurrentLanguage(lang.code)}
            className="flex items-center justify-between cursor-pointer"
            disabled={!lang.available}
          >
            <div className="flex flex-col">
              <span className="text-sm">{lang.name}</span>
              <span className="text-xs text-muted-foreground">{lang.nativeName}</span>
            </div>
            {currentLanguage === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}