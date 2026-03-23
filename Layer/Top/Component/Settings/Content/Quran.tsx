import { useState, memo } from "react";
import { Minus, Plus, Check, Languages, Headphones, Type, ChevronDown, AlignJustify, BookOpen } from "lucide-react";
import { Switch } from "@/Top/Component/UI/switch";
import { Label } from "@/Top/Component/UI/label";
import { Separator } from "@/Top/Component/UI/separator";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/Top/Component/UI/tooltip";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/Top/Component/UI/dropdown-menu";
import { useApp } from "@/Middle/Context/App-Context";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { cn } from "@/Middle/Library/utils";
import { PREVIEW_WORDS, RECITERS, TRANSLATORS } from "../Constants";

// ============= Preview Word =============

const PreviewWord = memo(function PreviewWord({
  arabic, translation,
  showTranslation, showTooltip, showInline,
  recitationEnabled, fontClass, fontSize,
}: {
  arabic: string; translation: string;
  showTranslation: boolean;
  showTooltip: boolean; showInline: boolean;
  recitationEnabled: boolean; fontClass: string; fontSize: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = () => {
    if (!recitationEnabled) return;
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 600);
  };

  return (
    <div className="flex flex-col items-center">
      <TooltipProvider>
        <Tooltip open={isHovered && showTooltip && showTranslation}>
          <TooltipTrigger asChild>
            <button
              className={cn(
                "transition-all duration-200 cursor-pointer relative",
                fontClass,
                isHovered && !isPlaying ? "text-primary scale-105" : "",
                isPlaying ? "text-primary" : "text-foreground"
              )}
              style={{ fontSize }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={handleClick}
            >
              <span>{arabic}</span>
              {isPlaying && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary word-playing" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs glass-tooltip">
            {showTranslation && <p className="text-sm font-medium text-center">{translation}</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {showInline && showTranslation && (
        <p className="text-[10px] text-muted-foreground mt-1">{translation}</p>
      )}
    </div>
  );
});

// ============= Selector Bar (reusable) =============

function SelectorBar<T extends string>({
  label, value, options, onSelect,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onSelect: (id: T) => void;
}) {
  const currentLabel = options.find(o => o.id === value)?.label || options[0].label;
  return (
    <div className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border bg-muted/50 border-transparent">
      <span className="font-medium text-sm text-foreground">{label}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
            {currentLabel}
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {options.map((opt) => (
            <DropdownMenuItem
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{opt.label}</span>
              {value === opt.id && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ============= Quran Section =============

export function QuranSection() {
  const { t } = useTranslation();
const {
  quranFont, setQuranFont,
  fontSize, setFontSize,
  translationFontSize, setTranslationFontSize,
  hoverTranslation, setHoverTranslation,
  hoverRecitation, setHoverRecitation,
  inlineTranslation, setInlineTranslation,
  verseTranslation, setVerseTranslation,
  autoScrollDuringPlayback, setAutoScrollDuringPlayback,
  showArabicText, setShowArabicText,
  selectedReciter, setSelectedReciter,
  selectedTranslator, setSelectedTranslator,
  layout, setLayout,
} = useApp();

const previewMode = layout === "page" ? "reading" : "translation";    

  const kfgqpcVariants = [
    { id: "uthmani" as const,    label: "Uthmani Hafs" },
    { id: "uthmani_v1" as const, label: "V1" },
    { id: "uthmani_v2" as const, label: "V2" },
    { id: "uthmani_v4" as const, label: "V4" },
  ];

  const isKfgqpc = quranFont !== "indopak";
  const currentKfgqpcLabel = kfgqpcVariants.find(o => o.id === quranFont)?.label || "Uthmani Hafs";

  const getFontClass = () => {
    switch (quranFont) {
      case "indopak":    return "font-indopak";
      case "uthmani_v1": return "font-uthmani_v1";
      case "uthmani_v2": return "font-uthmani_v2";
      case "uthmani_v4": return "font-uthmani_v4";
      default:           return "font-uthmani";
    }
  };

  const getPreviewFontSize = () => `${(1.5 * fontSize) / 5}rem`;

  return (
    <div className="space-y-8">

      {/* ── 1. Layout ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlignJustify className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm text-foreground">Layout</h3>
        </div>
        <div className="glass-card !p-0.5 inline-flex gap-0.5">
          {[
            { id: "ayah", label: "Ayah", icon: <AlignJustify className="h-3.5 w-3.5" /> },
            { id: "page", label: "Page", icon: <BookOpen className="h-3.5 w-3.5" /> },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setLayout(opt.id as "ayah" | "page")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                layout === opt.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* ── 2. Arabic Text ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm text-foreground">Arabic Text</h3>
        </div>

        <div className="flex items-center justify-between px-3 py-2.5 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
          <Label htmlFor="show-arabic" className="text-sm text-foreground cursor-pointer">Show Arabic</Label>
          <Switch id="show-arabic" checked={showArabicText} onCheckedChange={setShowArabicText} />
        </div>

        <div className="space-y-2">
          {/* KFGQPC Bar */}
          <button
            onClick={() => { if (!isKfgqpc) setQuranFont("uthmani"); }}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all",
              isKfgqpc ? "bg-primary/10 border-primary/30" : "bg-muted/50 border-transparent hover:bg-muted"
            )}
          >
            <span className="font-medium text-sm text-foreground">KFGQPC</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div
                  onClick={(e) => { e.stopPropagation(); if (!isKfgqpc) setQuranFont("uthmani"); }}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                    isKfgqpc
                      ? "bg-primary/15 text-primary hover:bg-primary/25"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {currentKfgqpcLabel}
                  <ChevronDown className="h-3 w-3" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                {kfgqpcVariants.map((opt) => (
                  <DropdownMenuItem
                    key={opt.id}
                    onClick={(e) => { e.stopPropagation(); setQuranFont(opt.id); }}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span>{opt.label}</span>
                    {quranFont === opt.id && <Check className="h-3.5 w-3.5 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </button>

          {/* IndoPak Bar */}
          <button
            onClick={() => setQuranFont("indopak")}
            className={cn(
              "w-full flex items-center px-3 py-2.5 rounded-lg border transition-all text-left",
              quranFont === "indopak"
                ? "bg-primary/10 border-primary/30"
                : "bg-muted/50 border-transparent hover:bg-muted"
            )}
          >
            <span className="font-medium text-sm text-foreground">IndoPak</span>
          </button>
        </div>

        <div className="flex items-center justify-between px-3 py-2.5 bg-muted/50 rounded-lg">
          <span className="text-sm text-foreground">Size</span>
          <div className="flex items-center gap-3">
            <button className="glass-icon-btn h-8 w-8" onClick={() => setFontSize(Math.max(1, fontSize - 1))} disabled={fontSize <= 1}><Minus className="h-3.5 w-3.5" /></button>
            <span className="w-8 text-center font-semibold text-sm text-foreground">{fontSize}</span>
            <button className="glass-icon-btn h-8 w-8" onClick={() => setFontSize(Math.min(10, fontSize + 1))} disabled={fontSize >= 10}><Plus className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

      <Separator />

      {/* ── 3. Translation ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm text-foreground">Translation</h3>
        </div>

        <SelectorBar
          label="Translator"
          value={selectedTranslator}
          options={TRANSLATORS}
          onSelect={setSelectedTranslator}
        />

        <div className="flex items-center justify-between px-3 py-2.5 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
          <Label htmlFor="verse-translation" className="text-sm text-foreground cursor-pointer">Show Translation</Label>
          <Switch id="verse-translation" checked={verseTranslation} onCheckedChange={setVerseTranslation} />
        </div>

        <div className="flex items-center justify-between px-3 py-2.5 bg-muted/50 rounded-lg">
          <span className="text-sm text-foreground">Size</span>
          <div className="flex items-center gap-3">
            <button className="glass-icon-btn h-8 w-8" onClick={() => setTranslationFontSize(Math.max(1, translationFontSize - 1))}><Minus className="h-3.5 w-3.5" /></button>
            <span className="w-8 text-center font-semibold text-sm text-foreground">{translationFontSize}</span>
            <button className="glass-icon-btn h-8 w-8" onClick={() => setTranslationFontSize(Math.min(10, translationFontSize + 1))}><Plus className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

      <Separator />

      {/* ── 4. Per-Word ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm text-foreground">Per-Word</h3>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground px-1">On Hover</p>
          {[
            { id: "hover-translation", label: "Show Translation", checked: hoverTranslation, onChange: setHoverTranslation },
            { id: "hover-recitation",  label: "Play Recitation",  checked: hoverRecitation,  onChange: setHoverRecitation },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between px-3 py-2.5 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <Label htmlFor={item.id} className="text-sm text-foreground cursor-pointer">{item.label}</Label>
              <Switch id={item.id} checked={item.checked} onCheckedChange={item.onChange} />
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground px-1">Inline</p>
          <div className="flex items-center justify-between px-3 py-2.5 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
            <Label htmlFor="inline-translation" className="text-sm text-foreground cursor-pointer">Show Translation</Label>
            <Switch id="inline-translation" checked={inlineTranslation} onCheckedChange={setInlineTranslation} />
          </div>
        </div>
      </div>

      <Separator />

      {/* ── 5. Audio ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Headphones className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm text-foreground">Audio</h3>
        </div>

        <SelectorBar
          label="Reciter"
          value={selectedReciter}
          options={RECITERS}
          onSelect={setSelectedReciter}
        />

        <div className="flex items-center justify-between px-3 py-2.5 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
          <Label htmlFor="auto-scroll" className="text-sm text-foreground cursor-pointer">Auto-scroll</Label>
          <Switch id="auto-scroll" checked={autoScrollDuringPlayback} onCheckedChange={setAutoScrollDuringPlayback} />
        </div>
      </div>

      <Separator />

      {/* ── 6. Preview ── */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-foreground">Preview</h3>

        <div className="p-5 bg-card rounded-xl border border-border shadow-sm space-y-4">
          {previewMode === "reading" ? (
            <div
              className={cn(getFontClass(), "text-center leading-[2.5]")}
              dir="rtl"
              style={{ fontSize: getPreviewFontSize() }}
            >
              {PREVIEW_WORDS.map((word, i) => (
                <span key={i}>
                  <span className="text-foreground">{word.arabic}</span>
                  {i < PREVIEW_WORDS.length - 1 && " "}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-end gap-x-3 gap-y-2" dir="rtl">
              {PREVIEW_WORDS.map((word, i) => (
                <PreviewWord
                  key={i}
                  arabic={word.arabic}
                  translation={word.translation}
                  showTranslation={hoverTranslation || inlineTranslation}
                  showTooltip={hoverTranslation}
                  showInline={inlineTranslation}
                  recitationEnabled={hoverRecitation}
                  fontClass={getFontClass()}
                  fontSize={getPreviewFontSize()}
                />
              ))}
            </div>
          )}
          {previewMode === "translation" && verseTranslation && (
            <p className="text-foreground border-t border-border pt-3" style={{ fontSize: `${translationFontSize / 3}rem` }}>
              In the name of Allah, the Most Gracious, the Most Merciful
            </p>
          )}
        </div>
      </div>

    </div>
  );
}