// Component/Settings/Content/Quran/Section/Audio.tsx
import { useState } from "react";
import { Headphones, ChevronDown, Check } from "lucide-react";
import { Switch } from "@/Top/Component/UI/Switch";
import { Card } from "@/Top/Component/UI/Card";
import { Button } from "@/Top/Component/UI/Button";
import { useIsMobile } from "@/Middle/Hook/Use-Mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Top/Component/UI/Dropdown-Menu";
import { MobileNavigator } from "../Utility";
import { RECITERS } from "../Constant";

interface AudioProps {
  selectedReciter: string;
  onSelectedReciterChange: (reciter: string) => void;
  autoScrollDuringPlayback: boolean;
  onAutoScrollChange: (value: boolean) => void;
}

export function Audio({
  selectedReciter,
  onSelectedReciterChange,
  autoScrollDuringPlayback,
  onAutoScrollChange,
}: AudioProps) {
  const isMobile = useIsMobile();
  const [showReciterList, setShowReciterList] = useState(false);
  
  const currentReciterLabel = RECITERS.find(r => r.id === selectedReciter)?.label || RECITERS[0].label;

  // Mobile full-screen navigation using reusable component
  if (isMobile && showReciterList) {
    return (
      <MobileNavigator
        isOpen={showReciterList}
        onClose={() => setShowReciterList(false)}
        title="Select Reciter"
        options={RECITERS}
        selectedId={selectedReciter}
        onSelect={onSelectedReciterChange}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Audio Title */}
      <div className="relative rounded-[40px] bg-white dark:bg-black border-2 border-black dark:border-white transition-all duration-200 py-1 px-3 inline-flex">
        <div className="flex items-center gap-2">
          <Headphones className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm text-foreground">Audio</h3>
        </div>
      </div>

      {/* Reciter Selection */}
      {isMobile ? (
        <Button
          onClick={() => setShowReciterList(true)}
          variant="secondary"
          className="w-full flex items-center justify-between px-4 py-2 h-auto group"
          fullWidth
        >
          <span className="text-sm font-medium group-hover:text-white dark:group-hover:text-black">Reciter</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground group-hover:text-white dark:group-hover:text-black">{currentReciterLabel}</span>
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
              <span className="text-sm font-medium group-hover:text-white dark:group-hover:text-black">Reciter</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground group-hover:text-white dark:group-hover:text-black">{currentReciterLabel}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-white dark:group-hover:text-black" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {RECITERS.map((reciter) => (
              <DropdownMenuItem
                key={reciter.id}
                onClick={() => onSelectedReciterChange(reciter.id)}
                className="flex items-center justify-between cursor-pointer"
              >
                <span>{reciter.label}</span>
                {selectedReciter === reciter.id && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Auto-scroll Toggle */}
      <div className="cursor-pointer">
        <Card 
          onClick={() => onAutoScrollChange(!autoScrollDuringPlayback)}
          className="py-2.5 px-4 flex items-center justify-between transition-all group"
        >
          <span className="font-semibold text-sm group-hover:text-white dark:group-hover:text-black">
            Auto-scroll
          </span>
          <Switch 
            id="auto-scroll" 
            checked={autoScrollDuringPlayback} 
            onCheckedChange={onAutoScrollChange} 
            size="md"
          />
        </Card>
      </div>
    </div>
  );
}