// Component/Settings/Content/Hadith.tsx
import { Eye, EyeOff } from "lucide-react";
import { Toggle } from "@/Top/Component/UI/Toggle";
import { Card } from "@/Top/Component/UI/Card";
import { useApp } from "@/Middle/Context/App";

export function HadithSection() {
  const {
    showHadithTranslation,
    setShowHadithTranslation,
    showHadithTransliteration,
    setShowHadithTransliteration,
  } = useApp();

  return (
    <div className="space-y-3">
      {/* Show Translation Toggle */}
      <div 
        onClick={() => setShowHadithTranslation(!showHadithTranslation)} 
        className="cursor-pointer"
      >
        <Card className="py-2.5 px-4 flex items-center justify-between transition-all hover:scale-[1.01] group">
          <span className="font-semibold text-sm group-hover:text-white dark:group-hover:text-black">
            Translation
          </span>
          <Toggle
            pressed={showHadithTranslation}
            onPressedChange={setShowHadithTranslation}
            size="sm"
          >
            {showHadithTranslation ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </Toggle>
        </Card>
      </div>

      {/* Show Transliteration Toggle */}
      <div 
        onClick={() => setShowHadithTransliteration(!showHadithTransliteration)} 
        className="cursor-pointer"
      >
        <Card className="py-2.5 px-4 flex items-center justify-between transition-all hover:scale-[1.01] group">
          <span className="font-semibold text-sm group-hover:text-white dark:group-hover:text-black">
            Transliteration
          </span>
          <Toggle
            pressed={showHadithTransliteration}
            onPressedChange={setShowHadithTransliteration}
            size="sm"
          >
            {showHadithTransliteration ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </Toggle>
        </Card>
      </div>
    </div>
  );
}