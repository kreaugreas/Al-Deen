import { useState } from "react";
import { Languages, ChevronDown, Check } from "lucide-react";
import { Card } from "@/Top/Component/UI/Card";
import { Button } from "@/Top/Component/UI/Button";
import { Slider } from "@/Top/Component/UI/Slider";
import { useIsMobile } from "@/Middle/Hook/Use-Mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Top/Component/UI/Dropdown-Menu";
import { MobileNavigator } from "../Utility";
import { TRANSLATORS } from "../Constant";

interface TranslationProps {
  selectedTranslator: string;
  onSelectedTranslatorChange: (translator: string) => void;
  translationFontSize: number;
  onTranslationFontSizeChange: (size: number) => void;
}

export function Translation({
  selectedTranslator,
  onSelectedTranslatorChange,
  translationFontSize,
  onTranslationFontSizeChange,
}: TranslationProps) {
  const isMobile = useIsMobile();
  const [showTranslatorList, setShowTranslatorList] = useState(false);
  
  const currentTranslatorLabel = TRANSLATORS.find(t => t.id === selectedTranslator)?.label || TRANSLATORS[0].label;

  // Mobile full-screen navigation using reusable component
  if (isMobile && showTranslatorList) {
    return (
      <MobileNavigator
        isOpen={showTranslatorList}
        onClose={() => setShowTranslatorList(false)}
        title="Select Translator"
        options={TRANSLATORS}
        selectedId={selectedTranslator}
        onSelect={onSelectedTranslatorChange}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="relative rounded-[40px] bg-white dark:bg-black border-2 border-black dark:border-white transition-all duration-200 py-1 px-3 inline-flex">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm text-foreground">Translation</h3>
        </div>
      </div>

      {/* Translator Selection */}
      {isMobile ? (
        <Button
          onClick={() => setShowTranslatorList(true)}
          variant="secondary"
          className="w-full flex items-center justify-between px-4 py-2 h-auto group"
          fullWidth
        >
          <span className="text-sm font-medium group-hover:text-white dark:group-hover:text-black">Translator</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground group-hover:text-white dark:group-hover:text-black">
              {currentTranslatorLabel}
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
              <span className="text-sm font-medium group-hover:text-white dark:group-hover:text-black">Translator</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground group-hover:text-white dark:group-hover:text-black">
                  {currentTranslatorLabel}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-white dark:group-hover:text-black" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {TRANSLATORS.map((translator) => (
              <DropdownMenuItem
                key={translator.id}
                onClick={() => onSelectedTranslatorChange(translator.id)}
                className="flex items-center justify-between cursor-pointer"
              >
                <span>{translator.label}</span>
                {selectedTranslator === translator.id && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Font Size Slider */}
      <div className="cursor-pointer">
        <Card className="py-2.5 px-4 transition-all group">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-sm group-hover:text-white dark:group-hover:text-black whitespace-nowrap">
              Font Size: {translationFontSize}
            </span>
            <Slider
              value={[translationFontSize]}
              onValueChange={(value) => onTranslationFontSizeChange(value[0])}
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