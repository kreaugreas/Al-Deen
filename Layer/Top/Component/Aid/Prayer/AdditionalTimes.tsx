import { formatTime } from "./Utility";
import type { PrayerTimesData, PrayerSettings } from "./Types";

interface AdditionalTimesProps {
  timings: PrayerTimesData;
  settings: PrayerSettings;
}

export function AdditionalTimes({ timings, settings }: AdditionalTimesProps) {
  if (!timings.Imsak && !timings.Midnight) return null;

  return (
    <div className="glass-card p-4 !block">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Additional Times</p>
      <div className="grid grid-cols-2 gap-4">
        {timings.Imsak && (
          <div>
            <p className="text-xs text-muted-foreground">Imsak</p>
            <p className="font-semibold tabular-nums">{formatTime(timings.Imsak, settings.timeFormat)}</p>
          </div>
        )}
        {timings.Midnight && (
          <div>
            <p className="text-xs text-muted-foreground">Midnight</p>
            <p className="font-semibold tabular-nums">{formatTime(timings.Midnight, settings.timeFormat)}</p>
          </div>
        )}
      </div>
    </div>
  );
}