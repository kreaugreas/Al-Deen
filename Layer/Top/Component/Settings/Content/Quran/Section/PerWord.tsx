import { Languages, ChevronDown, Check } from "lucide-react";
import { Switch } from "@/Top/Component/UI/Switch";
import { Card } from "@/Top/Component/UI/Card";
import { Button } from "@/Top/Component/UI/Button";
import { Slider } from "@/Top/Component/UI/Slider";
import { useIsMobile } from "@/Middle/Hook/Use-Mobile";
import { useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Top/Component/UI/Dropdown-Menu";
import { MobileNavigator } from "../Utility";
import { TRANSLATORS, TRANSLITERATORS } from "../Constant";

interface PerWordProps {
  // Hover settings
  hoverTranslation: string;
  onHoverTranslationChange: (value: string) => void;
  hoverTransliteration: string;
  onHoverTransliterationChange: (value: string) => void;
  hoverRecitation: boolean;
  onHoverRecitationChange: (value: boolean) => void;

  // Inline settings
  inlineTranslation: string;
  onInlineTranslationChange: (value: string) => void;
  inlineTranslationSize: number;
  onInlineTranslationSizeChange: (size: number) => void;
  inlineTransliteration: string;
  onInlineTransliterationChange: (value: string) => void;
  inlineTransliterationSize: number;
  onInlineTransliterationSizeChange: (size: number) => void;
}

export function PerWord({
  hoverTranslation,
  onHoverTranslationChange,
  hoverTransliteration,
  onHoverTransliterationChange,
  hoverRecitation,
  onHoverRecitationChange,
  inlineTranslation,
  onInlineTranslationChange,
  inlineTranslationSize,
  onInlineTranslationSizeChange,
  inlineTransliteration,
  onInlineTransliterationChange,
  inlineTransliterationSize,
  onInlineTransliterationSizeChange,
}: PerWordProps) {
  const isMobile = useIsMobile();

  const [showHoverTranslationList, setShowHoverTranslationList] = useState(false);
  const [showHoverTransliterationList, setShowHoverTransliterationList] = useState(false);
  const [showInlineTranslationList, setShowInlineTranslationList] = useState(false);
  const [showInlineTransliterationList, setShowInlineTransliterationList] = useState(false);

  const currentHoverTranslationLabel = useMemo(() =>
    TRANSLATORS.find(t => t.id === hoverTranslation)?.label || "None",
    [hoverTranslation]
  );

  const currentInlineTranslationLabel = useMemo(() =>
    TRANSLATORS.find(t => t.id === inlineTranslation)?.label || "None",
    [inlineTranslation]
  );

  const currentHoverTransliterationLabel = useMemo(() =>
    TRANSLITERATORS.find(t => t.id === hoverTransliteration)?.label || "None",
    [hoverTransliteration]
  );

  const currentInlineTransliterationLabel = useMemo(() =>
    TRANSLITERATORS.find(t => t.id === inlineTransliteration)?.label || "None",
    [inlineTransliteration]
  );

  // Shared render functions
  const renderDropdown = (
    items: { id: string; label: string }[],
    currentValue: string,
    currentLabel: string,
    onChange: (value: string) => void,
    label: string
  ) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className="w-full flex items-center justify-between px-4 py-2 h-auto group"
          fullWidth
        >
          <span className="text-sm font-medium group-hover:text-white dark:group-hover:text-black">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground group-hover:text-white dark:group-hover:text-black">
              {currentLabel}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-white dark:group-hover:text-black" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={() => {
              console.log(`Selected: ${item.id}`);
              onChange(item.id);
            }}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{item.label}</span>
            {currentValue === item.id && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderMobileButton = (
    onClick: () => void,
    currentLabel: string,
    label: string
  ) => (
    <Button
      onClick={onClick}
      variant="secondary"
      className="w-full flex items-center justify-between px-4 py-2 h-auto group"
      fullWidth
    >
      <span className="text-sm font-medium group-hover:text-white dark:group-hover:text-black">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground group-hover:text-white dark:group-hover:text-black">
          {currentLabel}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-white dark:group-hover:text-black" />
      </div>
    </Button>
  );

  const renderSlider = (value: number, onChange: (size: number) => void, label: string) => {
    // Ensure value is a valid number between 1 and 10
    const safeValue = typeof value === 'number' && !isNaN(value) && value >= 1 && value <= 10 ? value : 5;
    
    return (
      <div className="cursor-pointer">
        <Card className="py-2.5 px-4 transition-all group">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-sm group-hover:text-white dark:group-hover:text-black whitespace-nowrap">
              {label}: {safeValue}
            </span>
            <Slider
              value={[safeValue]}
              onValueChange={(val) => onChange(val[0])}
              min={1}
              max={10}
              step={1}
              className="flex-1"
            />
          </div>
        </Card>
      </div>
    );
  };

  // Mobile full-screen navigators
  if (isMobile && showHoverTranslationList) {
    return (
      <MobileNavigator
        isOpen={showHoverTranslationList}
        onClose={() => setShowHoverTranslationList(false)}
        title="Select Hover Translation"
        options={TRANSLATORS}
        selectedId={hoverTranslation}
        onSelect={(id) => {
          console.log("Selected translation:", id);
          onHoverTranslationChange(id);
        }}
      />
    );
  }

  if (isMobile && showHoverTransliterationList) {
    return (
      <MobileNavigator
        isOpen={showHoverTransliterationList}
        onClose={() => setShowHoverTransliterationList(false)}
        title="Select Hover Transliteration"
        options={TRANSLITERATORS}
        selectedId={hoverTransliteration}
        onSelect={(id) => {
          console.log("Selected transliteration:", id);
          onHoverTransliterationChange(id);
        }}
      />
    );
  }

  if (isMobile && showInlineTranslationList) {
    return (
      <MobileNavigator
        isOpen={showInlineTranslationList}
        onClose={() => setShowInlineTranslationList(false)}
        title="Select Inline Translation"
        options={TRANSLATORS}
        selectedId={inlineTranslation}
        onSelect={(id) => {
          console.log("Selected inline translation:", id);
          onInlineTranslationChange(id);
        }}
      />
    );
  }

  if (isMobile && showInlineTransliterationList) {
    return (
      <MobileNavigator
        isOpen={showInlineTransliterationList}
        onClose={() => setShowInlineTransliterationList(false)}
        title="Select Inline Transliteration"
        options={TRANSLITERATORS}
        selectedId={inlineTransliteration}
        onSelect={(id) => {
          console.log("Selected inline transliteration:", id);
          onInlineTransliterationChange(id);
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="relative rounded-[40px] bg-white dark:bg-black border-2 border-black dark:border-white transition-all duration-200 py-1 px-3 inline-flex">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm text-foreground">Per-Word</h3>
        </div>
      </div>

      {/* On Hover Section */}
      <div className="space-y-1.5">
        <div className="relative rounded-[40px] bg-white dark:bg-black border-2 border-black dark:border-white transition-all duration-200 py-1 px-3 inline-flex">
          <p className="text-xs font-medium text-foreground">On Hover</p>
        </div>

        {/* Hover Translation - No Font Size Slider */}
        {isMobile
          ? renderMobileButton(() => setShowHoverTranslationList(true), currentHoverTranslationLabel, "Show Translation")
          : renderDropdown(TRANSLATORS, hoverTranslation, currentHoverTranslationLabel, onHoverTranslationChange, "Show Translation")
        }

        {/* Hover Transliteration - No Font Size Slider */}
        {isMobile
          ? renderMobileButton(() => setShowHoverTransliterationList(true), currentHoverTransliterationLabel, "Show Transliteration")
          : renderDropdown(TRANSLITERATORS, hoverTransliteration, currentHoverTransliterationLabel, onHoverTransliterationChange, "Show Transliteration")
        }

        {/* Hover Recitation */}
        <div className="cursor-pointer">
          <Card
            onClick={() => onHoverRecitationChange(!hoverRecitation)}
            className="py-2.5 px-4 flex items-center justify-between transition-all group"
          >
            <span className="font-semibold text-sm group-hover:text-white dark:group-hover:text-black">
              Play Recitation
            </span>
            <Switch
              id="hover-recitation"
              checked={hoverRecitation}
              onCheckedChange={onHoverRecitationChange}
              size="md"
            />
          </Card>
        </div>
      </div>

      {/* Inline Section */}
      <div className="space-y-1.5">
        <div className="relative rounded-[40px] bg-white dark:bg-black border-2 border-black dark:border-white transition-all duration-200 py-1 px-3 inline-flex">
          <p className="text-xs font-medium text-foreground">Inline</p>
        </div>

        {/* Inline Translation - With Font Size Slider */}
        {isMobile
          ? renderMobileButton(() => setShowInlineTranslationList(true), currentInlineTranslationLabel, "Show Translation")
          : renderDropdown(TRANSLATORS, inlineTranslation, currentInlineTranslationLabel, onInlineTranslationChange, "Show Translation")
        }
        {/* Font Size slider only for Inline Translation when NOT "None" */}
        {inlineTranslation !== "None" && renderSlider(inlineTranslationSize, onInlineTranslationSizeChange, "Font Size")}

        {/* Inline Transliteration - With Font Size Slider */}
        {isMobile
          ? renderMobileButton(() => setShowInlineTransliterationList(true), currentInlineTransliterationLabel, "Show Transliteration")
          : renderDropdown(TRANSLITERATORS, inlineTransliteration, currentInlineTransliterationLabel, onInlineTransliterationChange, "Show Transliteration")
        }
        {/* Font Size slider only for Inline Transliteration when NOT "None" */}
        {inlineTransliteration !== "None" && renderSlider(inlineTransliterationSize, onInlineTransliterationSizeChange, "Font Size")}
      </div>
    </div>
  );
}