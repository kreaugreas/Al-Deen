import { cn } from "@/Middle/Library/utils";
import { formatTime } from "./Utility";
import { PRAYER_ICONS, PRAYER_ARABIC, PRAYER_GRADIENTS } from "./Constant";
import type { PrayerTimesData, MainPrayer, PrayerSettings } from "./Types";

interface PrayerCardProps {
  prayer: MainPrayer;
  timings: PrayerTimesData;
  settings: PrayerSettings;
  isNext: boolean;
}

export function PrayerCard({ prayer, timings, settings, isNext }: PrayerCardProps) {
  const Icon = PRAYER_ICONS[prayer];

  return (
    <div
      className={cn(
        "glass-card p-4 !block transition-all relative overflow-hidden",
        isNext && "ring-1 ring-primary/30"
      )}
    >
      <div className={`absolute inset-0 rounded-[inherit] bg-gradient-to-r ${PRAYER_GRADIENTS[prayer]} pointer-events-none`} />
      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center",
            isNext ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className={cn("font-medium", isNext && "text-primary")}>{prayer}</p>
            <p className="text-xs text-muted-foreground font-arabic">{PRAYER_ARABIC[prayer]}</p>
          </div>
        </div>
        <p className={cn("text-lg font-semibold tabular-nums", isNext && "text-primary")}>
          {formatTime(timings[prayer], settings.timeFormat)}
        </p>
      </div>
    </div>
  );
}