import { MapPin, Settings2, RefreshCw } from "lucide-react";
import type { LocationData } from "./Types";

interface HeaderProps {
  location: LocationData | null;
  showSettings: boolean;
  onToggleSettings: () => void;
  onRefresh: () => void;
}

export function Header({ location, showSettings, onToggleSettings, onRefresh }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div>
        <h1 className="text-2xl font-bold">Prayer Times</h1>
        {location?.city && (
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{location.city}{location.country ? `, ${location.country}` : ""}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          className={`glass-icon-btn w-9 h-9 ${showSettings ? "text-primary" : ""}`}
          onClick={onToggleSettings}
          title="Settings"
        >
          <Settings2 className="h-4 w-4" />
        </button>
        <button className="glass-icon-btn w-9 h-9" onClick={onRefresh} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}