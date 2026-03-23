import { useState, memo } from "react";
import { createPortal } from "react-dom";
import { Slider } from "@/Top/Component/UI/slider";
import {
  Play, Pause, Volume2, VolumeX, X, Repeat, Loader2,
  Settings2, ChevronLeft, Gauge, Check,
} from "lucide-react";
import { cn } from "@/Middle/Library/utils";
import { useAudio } from "@/Middle/Context/Audio-Context";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/Top/Component/UI/popover";
import { surahList } from "@/Bottom/API/Quran";

interface AudioPlayerProps {
  isVisible: boolean;
  onClose: () => void;
  // FIX: Added missing props that SurahIndex passes to this component
  surahId?: number;
  surahName?: string;
}

type SettingsMenu = "main" | "repeat" | "speed";

export const AudioPlayer = memo(function AudioPlayer({ isVisible, onClose, surahId, surahName }: AudioPlayerProps) {
  const {
    isPlaying, isLoading, currentSurah, currentPage,
    currentTime, duration, progress,
    togglePlayPause, stop,
    seekTo, setVolume,
    repeatMode, setRepeatMode,
    playbackSpeed, setPlaybackSpeed,
    playbackMode,
  } = useAudio();

  const [volume, setLocalVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsMenu, setSettingsMenu] = useState<SettingsMenu>("main");

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setLocalVolume(newVolume);
    setVolume(isMuted ? 0 : newVolume);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setVolume(isMuted ? volume : 0);
  };

  const handleSeek = (value: number[]) => {
    seekTo(value[0]);
  };

  const handleClose = () => {
    stop();
    onClose();
  };

  const getRepeatLabel = () => {
    switch (repeatMode) {
      case 'surah': return 'Repeat Surah';
      case 'page':  return 'Repeat Page';
      default:      return 'No Repeat';
    }
  };

  // FIX: Prefer the surahId/surahName passed as props (from SurahIndex) over
  // whatever the audio context reports — this ensures the header always reflects
  // the surah the user is currently viewing, even before playback starts.
  const resolvedSurahId = currentSurah ?? surahId;
  const currentSurahData = resolvedSurahId
    ? surahList.find(s => s.id === resolvedSurahId)
    : null;

  const trackTitle = currentSurahData
    ? currentSurahData.englishName
    : surahName                    // FIX: fall back to the prop-supplied name
      ?? (currentPage ? `Page ${currentPage}` : null);

  const trackSubtitle = currentSurahData
    ? currentSurahData.name
    : null;

  // FIX: Guard moved here so hooks are always called before any early return
  if (!isVisible) return null;

  const playerContent = (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] px-4"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-2xl mx-auto glass-card rounded-2xl p-3 sm:p-4 shadow-xl">
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-muted-foreground font-mono w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            onValueChange={handleSeek}
            className="flex-1 h-1 cursor-pointer"
          />
          <span className="text-xs text-muted-foreground font-mono w-10">
            {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Track info */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {trackTitle && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-semibold truncate">
                  {trackTitle}
                </span>
                {trackSubtitle && (
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {trackSubtitle}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Center: Play / Pause */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              className="glass-icon-btn w-11 h-11 sm:w-12 sm:h-12 bg-primary/20"
              onClick={togglePlayPause}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </button>
          </div>

          {/* Right: Volume + Settings + Close */}
          <div className="flex items-center gap-1 flex-1 justify-end">
            {/* Volume */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="glass-icon-btn w-8 h-8 sm:w-9 sm:h-9"
                  onClick={toggleMute}
                >
                  {isMuted || volume === 0
                    ? <VolumeX className="h-3.5 w-3.5" />
                    : <Volume2 className="h-3.5 w-3.5" />}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-28 p-3 glass-dropdown" align="center">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="cursor-pointer"
                />
              </PopoverContent>
            </Popover>

            {/* Settings */}
            <Popover
              open={settingsOpen}
              onOpenChange={(open) => {
                setSettingsOpen(open);
                if (!open) setSettingsMenu("main");
              }}
            >
              <PopoverTrigger asChild>
                <button className="glass-icon-btn w-8 h-8 sm:w-9 sm:h-9">
                  <Settings2 className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-0 overflow-hidden glass-dropdown">
                <div className="glass-content">
                  {settingsMenu === "main" && (
                    <div className="py-2">
                      <button
                        className="w-full flex items-center justify-between px-4 py-3 glass-hover"
                        onClick={() => setSettingsMenu("repeat")}
                      >
                        <div className="flex items-center gap-3">
                          <Repeat className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Repeat</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{getRepeatLabel()}</span>
                      </button>
                      <button
                        className="w-full flex items-center justify-between px-4 py-3 glass-hover"
                        onClick={() => setSettingsMenu("speed")}
                      >
                        <div className="flex items-center gap-3">
                          <Gauge className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Speed</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{playbackSpeed}x</span>
                      </button>
                    </div>
                  )}

                  {settingsMenu === "repeat" && (
                    <div>
                      <button
                        className="w-full flex items-center gap-2 px-4 py-3 border-b border-white/10 glass-hover"
                        onClick={() => setSettingsMenu("main")}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="text-sm font-semibold">Repeat</span>
                      </button>
                      <div className="py-2">
                        {(
                          playbackMode === 'surah'
                            ? [
                                { value: 'none' as const,  label: 'No Repeat' },
                                { value: 'surah' as const, label: 'Repeat Surah' },
                              ]
                            : [
                                { value: 'none' as const, label: 'No Repeat' },
                                { value: 'page' as const, label: 'Repeat Page' },
                              ]
                        ).map(({ value, label }) => (
                          <button
                            key={value}
                            className={cn(
                              "w-full flex items-center justify-between px-4 py-3 glass-hover",
                              repeatMode === value && "bg-primary/10"
                            )}
                            onClick={() => { setRepeatMode(value); setSettingsMenu("main"); }}
                          >
                            <span className="text-sm">{label}</span>
                            {repeatMode === value && <Check className="h-4 w-4 text-primary" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {settingsMenu === "speed" && (
                    <div>
                      <button
                        className="w-full flex items-center gap-2 px-4 py-3 border-b border-white/10 glass-hover"
                        onClick={() => setSettingsMenu("main")}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="text-sm font-semibold">Playback Speed</span>
                      </button>
                      <div className="py-2">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                          <button
                            key={speed}
                            className={cn(
                              "w-full flex items-center justify-between px-4 py-3 glass-hover",
                              playbackSpeed === speed && "bg-primary/10"
                            )}
                            onClick={() => { setPlaybackSpeed(speed); setSettingsMenu("main"); }}
                          >
                            <span className="text-sm">{speed}x</span>
                            {playbackSpeed === speed && <Check className="h-4 w-4 text-primary" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Close */}
            <button className="glass-icon-btn w-8 h-8 sm:w-9 sm:h-9" onClick={handleClose}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(playerContent, document.body);
});