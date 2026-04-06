import { Settings2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Top/Component/UI/Select";
import { CALCULATION_METHODS, SCHOOLS, LAT_METHODS } from "./Constant";
import type { PrayerSettings } from "./Types";

interface SettingsProps {
  settings: PrayerSettings;
  onUpdate: <K extends keyof PrayerSettings>(key: K, value: PrayerSettings[K]) => void;
}

export function Settings({ settings, onUpdate }: SettingsProps) {
  return (
    <div className="glass-card mb-4 overflow-hidden">
      <div className="glass-content p-4 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-primary" /> Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Calculation Method */}
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground mb-1.5 block">Calculation Method</label>
            <Select value={String(settings.method)} onValueChange={(v) => onUpdate("method", Number(v))}>
              <SelectTrigger className="glass-btn border-0 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CALCULATION_METHODS.map((m) => (
                  <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Juristic School */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Asr Juristic Method</label>
            <Select value={String(settings.school)} onValueChange={(v) => onUpdate("school", Number(v))}>
              <SelectTrigger className="glass-btn border-0 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCHOOLS.map((s) => (
                  <SelectItem key={s.value} value={String(s.value)}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Latitude Adjustment */}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">High Latitude Rule</label>
            <Select value={String(settings.latitudeAdjustmentMethod)} onValueChange={(v) => onUpdate("latitudeAdjustmentMethod", Number(v))}>
              <SelectTrigger className="glass-btn border-0 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LAT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Format */}
          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground mb-1.5 block">Time Format</label>
            <div className="flex gap-2">
              {(["12h", "24h"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => onUpdate("timeFormat", fmt)}
                  className={`glass-btn px-4 py-2 text-sm flex-1 ${settings.timeFormat === fmt ? "!bg-primary/20 text-primary ring-1 ring-primary/30" : ""}`}
                >
                  {fmt === "12h" ? "12-hour" : "24-hour"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}