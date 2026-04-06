import { Clock } from "lucide-react";
import { ProgressBar } from "@/Top/Component/Progress-Bar";
import { formatTime, formatTimeRemaining } from "./Utility";
import { PRAYER_ARABIC } from "./Constant";
import type { PrayerTimesData, MainPrayer, PrayerSettings } from "./Types";

interface NextPrayerProps {
  nextPrayer: MainPrayer;
  timings: PrayerTimesData;
  settings: PrayerSettings;
  progress: number;
}

export function NextPrayer({ nextPrayer, timings, settings, progress }: NextPrayerProps) {
  return (
    <div className="glass-card p-5 !block border-primary/20 bg-primary/5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Next Prayer</p>
          <p className="text-xl font-bold text-primary">{nextPrayer}</p>
          <p className="text-sm text-muted-foreground font-arabic">{PRAYER_ARABIC[nextPrayer]}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">{formatTime(timings[nextPrayer], settings.timeFormat)}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
            <Clock className="h-3 w-3" />
            in {formatTimeRemaining(timings[nextPrayer])}
          </p>
        </div>
      </div>
      <ProgressBar progress={progress} />
    </div>
  );
}