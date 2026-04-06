import { Container } from "@/Top/Component/UI/Container";
import { cn } from "@/Middle/Library/utils";
import { PreviewWord, getFontClass, getPreviewFontSize } from "../Utility";
import { PREVIEW_WORDS } from "../Constant";

interface PreviewProps {
  layout: "ayah" | "page";
  quranFont: string;
  fontSize: number;
  hoverTranslation: boolean;
  hoverRecitation: boolean;
  inlineTranslation: boolean;
  verseTranslation: boolean;
}

export function Preview({
  layout,
  quranFont,
  fontSize,
  hoverTranslation,
  hoverRecitation,
  inlineTranslation,
  verseTranslation,
}: PreviewProps) {
  const previewMode = layout === "page" ? "reading" : "translation";
  const fontClass = getFontClass(quranFont);
  const previewFontSize = getPreviewFontSize(fontSize);

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="relative rounded-[40px] bg-white dark:bg-black border-2 border-black dark:border-white transition-all duration-200 py-1 px-3 inline-flex">
        <h3 className="font-semibold text-sm text-foreground">Preview</h3>
      </div>

      <Container className="!p-5">
        {previewMode === "reading" ? (
          <div
            className={cn(fontClass, "text-center leading-[2.5]")}
            dir="rtl"
            style={{ fontSize: previewFontSize }}
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
                fontClass={fontClass}
                fontSize={previewFontSize}
              />
            ))}
          </div>
        )}
        {previewMode === "translation" && verseTranslation && (
          <p className="text-foreground border-t border-border pt-3 mt-3" style={{ fontSize: `${fontSize / 3}rem` }}>
            In the name of Allah, the Most Gracious, the Most Merciful
          </p>
        )}
      </Container>
    </div>
  );
}