import { useState } from "react";
import { Type, ChevronDown, Check } from "lucide-react";
import { Switch } from "@/Top/Component/UI/Switch";
import { Card } from "@/Top/Component/UI/Card";
import { Button } from "@/Top/Component/UI/Button";
import { Slider } from "@/Top/Component/UI/Slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Top/Component/UI/Dropdown-Menu";
import { useIsMobile } from "@/Middle/Hook/Use-Mobile";
import { MobileNavigator } from "../Utility";
import { KFGQPC_VARIANTS } from "../Constant";

interface ArabicTextProps {
  showArabicText: boolean;
  onShowArabicTextChange: (value: boolean) => void;
  quranFont: string;
  onQuranFontChange: (font: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

export function ArabicText({
  showArabicText,
  onShowArabicTextChange,
  quranFont,
  onQuranFontChange,
  fontSize,
  onFontSizeChange,
}: ArabicTextProps) {
  const isMobile = useIsMobile();
  const [showFontList, setShowFontList] = useState(false);
  
  const currentFontLabel = (() => {
    if (quranFont === "indopak") return "IndoPak";
    return KFGQPC_VARIANTS.find(o => o.id === quranFont)?.label || "Uthmani Hafs";
  })();

  // Font options for mobile navigator
  const fontOptions = [
    { id: "uthmani", label: "Uthmani Hafs" },
    { id: "uthmani_v1", label: "V1" },
    { id: "uthmani_v2", label: "V2" },
    { id: "uthmani_v4", label: "V4" },
    { id: "indopak", label: "IndoPak" },
  ];

  // Mobile full-screen navigation for font selection
  if (isMobile && showFontList) {
    return (
      <MobileNavigator
        isOpen={showFontList}
        onClose={() => setShowFontList(false)}
        title="Select Font"
        options={fontOptions}
        selectedId={quranFont}
        onSelect={onQuranFontChange}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="relative rounded-[40px] bg-white dark:bg-black border-2 border-black dark:border-white transition-all duration-200 py-1 px-3 inline-flex">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm text-foreground">Arabic Text</h3>
        </div>
      </div>

      {/* Show Arabic Toggle */}
      <div className="cursor-pointer">
        <Card 
          onClick={() => onShowArabicTextChange(!showArabicText)}
          className="py-2.5 px-4 flex items-center justify-between transition-all group"
        >
          <span className="font-semibold text-sm group-hover:text-white dark:group-hover:text-black">
            Show Arabic
          </span>
          <Switch 
            id="show-arabic" 
            checked={showArabicText} 
            onCheckedChange={onShowArabicTextChange} 
            size="md"
          />
        </Card>
      </div>

      {/* Font Selection */}
      {isMobile ? (
        <Button
          onClick={() => setShowFontList(true)}
          variant="secondary"
          className="w-full flex items-center justify-between px-4 py-2 h-auto group"
          fullWidth
        >
          <span className="text-sm font-medium group-hover:text-white dark:group-hover:text-black">Font</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground group-hover:text-white dark:group-hover:text-black">
              {currentFontLabel}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-white dark:group-hover:text-black" />
          </div>
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              className="w-full flex items-center justify-between px-4 py-2 h-auto group"
              fullWidth
            >
              <span className="text-sm font-medium group-hover:text-white dark:group-hover:text-black">Font</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground group-hover:text-white dark:group-hover:text-black">
                  {currentFontLabel}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-white dark:group-hover:text-black" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {fontOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.id}
                onClick={() => onQuranFontChange(opt.id)}
                className="flex items-center justify-between cursor-pointer"
              >
                <span>{opt.label}</span>
                {quranFont === opt.id && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Font Size Slider - Next to label */}
      <div className="cursor-pointer">
        <Card className="py-2.5 px-4 transition-all group">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-sm group-hover:text-white dark:group-hover:text-black whitespace-nowrap">
              Font Size: {fontSize}
            </span>
            <Slider
              value={[fontSize]}
              onValueChange={(value) => onFontSizeChange(value[0])}
              min={1}
              max={10}
              step={1}
              className="flex-1"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}