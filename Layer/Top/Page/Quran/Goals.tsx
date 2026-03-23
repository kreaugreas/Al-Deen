import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Layout";
import { useAuth } from "@/Middle/Context/Auth-Context";
import { useQuranGoals, GOAL_PRESETS, GoalPreset } from "@/Middle/Hook/Use-Quran-Goals";
import { useReadingProgress } from "@/Middle/Hook/Use-Reading-Progress";
import { surahList, juzData } from "@/Bottom/API/Quran";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { 
  Clock, Book, Calendar, Settings, ChevronRight, ChevronLeft, 
  Loader2, Target, Repeat, Flame, Trophy, Trash2, MapPin, BookOpen
} from "lucide-react";
import { cn } from "@/Middle/Library/utils";
import { supabase } from "@/Bottom/Integration/Supabase/client";
import { Input } from "@/Top/Component/UI/input";
import { Label } from "@/Top/Component/UI/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Top/Component/UI/select";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const iconMap: Record<string, any> = {
  clock: Clock,
  book: Book,
  calendar: Calendar,
  settings: Settings,
};

function versesBeforeSurah(surahId: number): number {
  return surahList.filter(s => s.id < surahId).reduce((sum, s) => sum + s.numberOfAyahs, 0);
}

const TOTAL_VERSES = 6236;

// Circular progress ring component
function ProgressRing({ value, size = 120, strokeWidth = 8, label, sublabel, color = "hsl(var(--primary))" }: {
  value: number; size?: number; strokeWidth?: number; label: string; sublabel?: string; color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-bold">{label}</span>
        {sublabel && <span className="text-[10px] text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  );
}

export default function QuranGoals() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { activeGoal, weekProgress, isLoading: goalsLoading, createGoal, deleteGoal } = useQuranGoals();
  const { progress } = useReadingProgress();
  const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState<GoalPreset | null>(null);
  const [frequency, setFrequency] = useState<"daily" | "duration">("daily");
  const [isCreating, setIsCreating] = useState(false);
  const [totalMinutesRead, setTotalMinutesRead] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);

  const [customGoalType, setCustomGoalType] = useState<"time_based" | "khatm" | "verses">("time_based");
  const [customDailyTarget, setCustomDailyTarget] = useState(15);
  const [customDuration, setCustomDuration] = useState(30);
  const [customVersesPerDay, setCustomVersesPerDay] = useState(20);

  useEffect(() => {
    if (!authLoading && !user) navigate("/Sign-Up");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user || !activeGoal) return;
    const fetchStats = async () => {
      try {
        const { data: allProgress } = await supabase
          .from("goal_progress")
          .select("minutes_read, date")
          .eq("goal_id", activeGoal.id);
        if (allProgress) {
          const total = allProgress.reduce((sum, p) => sum + ((p as any).minutes_read || 0), 0);
          setTotalMinutesRead(total);
          const today = new Date().toISOString().split("T")[0];
          const todayEntry = allProgress.find((p) => (p as any).date === today);
          setTodayMinutes(todayEntry ? ((todayEntry as any).minutes_read || 0) : 0);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, [user, activeGoal, weekProgress]);

  const handleDeleteGoal = async () => {
    if (activeGoal && window.confirm("Are you sure you want to delete this goal?")) {
      await deleteGoal(activeGoal.id);
    }
  };

  if (authLoading || goalsLoading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const currentSurah = progress ? surahList.find((s) => s.id === progress.last_surah_id) : null;
  const currentJuz = progress?.last_juz_id || (progress ? juzData.find(j => j.surahs.some(s => s.id === progress.last_surah_id))?.juzNumber : null) || 1;
  const currentPage = progress?.last_page_id || 1;
  const currentAyah = progress?.last_ayah_id || 1;

  const versesRead = progress ? versesBeforeSurah(progress.last_surah_id) + (progress.last_ayah_id || 0) : 0;
  const overallProgress = Math.round((versesRead / TOTAL_VERSES) * 100);

  const getDayProgress = () => {
    if (!activeGoal || activeGoal.goal_type !== "khatm" || !activeGoal.target_duration) return null;

    const startDate = new Date(activeGoal.start_date);
    const today = new Date();
    const dayNumber = Math.max(1, Math.ceil((today.getTime() - startDate.getTime()) / 86400000));
    const versesPerDay = Math.ceil(TOTAL_VERSES / activeGoal.target_duration);
    const dayStartVerse = (dayNumber - 1) * versesPerDay;
    const dayEndVerse = Math.min(dayNumber * versesPerDay, TOTAL_VERSES);

    const findPosition = (verseCount: number) => {
      let remaining = verseCount;
      for (const s of surahList) {
        if (remaining <= s.numberOfAyahs) {
          return { surahId: s.id, surahName: s.englishName, ayah: Math.max(1, remaining) };
        }
        remaining -= s.numberOfAyahs;
      }
      return { surahId: 114, surahName: "An-Nas", ayah: 6 };
    };

    const startPos = findPosition(dayStartVerse + 1);
    const endPos = findPosition(dayEndVerse);
    const todayVersesTarget = dayEndVerse - dayStartVerse;
    const completedToday = Math.max(0, versesRead - dayStartVerse);
    const todayPercent = Math.min(100, Math.round((completedToday / todayVersesTarget) * 100));

    return { dayNumber, totalDays: activeGoal.target_duration, startPos, endPos, todayVersesTarget, completedToday: Math.min(completedToday, todayVersesTarget), todayPercent };
  };

  if (activeGoal) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const endDate = activeGoal.end_date ? new Date(activeGoal.end_date) : null;
    const daysRemaining = endDate ? Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / 86400000)) : null;
    const dailyTarget = activeGoal.daily_target;
    const todayPercentage = dailyTarget ? Math.min(100, Math.round((todayMinutes / dailyTarget) * 100)) : 0;
    const dayProgress = getDayProgress();
    const completedDays = weekProgress.filter(p => p.completed).length;
    
    return (
      <Layout>
        <div className="container py-6 sm:py-8 max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{t.goals?.title || "Your Progress"}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {activeGoal.goal_type === "time_based" 
                  ? `${dailyTarget} min/day` 
                  : activeGoal.goal_type === "khatm" 
                    ? `Khatm${daysRemaining !== null ? ` · ${daysRemaining}d left` : ""}`
                    : "Custom goal"}
              </p>
            </div>
            <button onClick={handleDeleteGoal} className="glass-icon-btn w-9 h-9 text-destructive/70 hover:text-destructive" title="Delete Goal">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Hero ring + stats */}
          <div className="glass-card p-6 sm:p-8 mb-4 !block">
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              {/* Progress ring */}
              <div className="relative flex-shrink-0">
                <ProgressRing
                  value={activeGoal.goal_type === "time_based" ? todayPercentage : (dayProgress?.todayPercent || overallProgress)}
                  size={140}
                  strokeWidth={10}
                  label={activeGoal.goal_type === "time_based" ? `${todayPercentage}%` : `${dayProgress?.todayPercent || overallProgress}%`}
                  sublabel={activeGoal.goal_type === "time_based" ? "today" : (dayProgress ? `day ${dayProgress.dayNumber}` : "overall")}
                />
              </div>

              {/* Quick stats grid */}
              <div className="grid grid-cols-2 gap-3 flex-1 w-full">
                <div className="p-3 bg-muted/30 rounded-xl text-center">
                  <Flame className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <p className="text-xl font-bold">{activeGoal.current_streak}</p>
                  <p className="text-[10px] text-muted-foreground">Streak</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl text-center">
                  <Trophy className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <p className="text-xl font-bold">{activeGoal.longest_streak}</p>
                  <p className="text-[10px] text-muted-foreground">Best</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl text-center">
                  <Clock className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <p className="text-xl font-bold">{totalMinutesRead}</p>
                  <p className="text-[10px] text-muted-foreground">Total Min</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl text-center">
                  <Calendar className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <p className="text-xl font-bold">{completedDays}/7</p>
                  <p className="text-[10px] text-muted-foreground">This Week</p>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Progress Bar */}
          {activeGoal.goal_type === "time_based" && dailyTarget && (
            <div className="glass-card p-4 sm:p-5 mb-4 !block">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Today</span>
                <span className="text-xs text-muted-foreground">{todayMinutes}/{dailyTarget} min</span>
              </div>
              <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700" style={{ width: `${todayPercentage}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                {todayPercentage >= 100 ? "✅ Goal achieved!" : `${dailyTarget - todayMinutes}m remaining`}
              </p>
            </div>
          )}

          {/* Khatm day progress */}
          {dayProgress && (
            <div className="glass-card p-4 sm:p-5 mb-4 !block">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Day {dayProgress.dayNumber}/{dayProgress.totalDays}</span>
                </div>
                <span className="text-xs font-medium text-primary">{dayProgress.todayPercent}%</span>
              </div>
              <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700" style={{ width: `${dayProgress.todayPercent}%` }} />
              </div>
              <div className="flex gap-2">
                <div className="flex-1 p-2.5 bg-muted/30 rounded-lg">
                  <p className="text-[10px] text-muted-foreground">From</p>
                  <p className="text-xs font-medium truncate">{dayProgress.startPos.surahName}</p>
                </div>
                <div className="flex items-center text-muted-foreground">→</div>
                <div className="flex-1 p-2.5 bg-muted/30 rounded-lg">
                  <p className="text-[10px] text-muted-foreground">To</p>
                  <p className="text-xs font-medium truncate">{dayProgress.endPos.surahName} ({dayProgress.endPos.ayah})</p>
                </div>
              </div>
            </div>
          )}

          {/* Current Position */}
          <div className="glass-card p-4 sm:p-5 mb-4 !block">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Current Position</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2 bg-muted/30 rounded-lg text-center">
                <p className="text-[10px] text-muted-foreground">Surah</p>
                <p className="font-semibold text-xs truncate">{currentSurah?.englishName || "Al-Fatihah"}</p>
              </div>
              <div className="p-2 bg-muted/30 rounded-lg text-center">
                <p className="text-[10px] text-muted-foreground">Ayah</p>
                <p className="font-semibold text-sm">{currentAyah}</p>
              </div>
              <div className="p-2 bg-muted/30 rounded-lg text-center">
                <p className="text-[10px] text-muted-foreground">Juz</p>
                <p className="font-semibold text-sm">{currentJuz}</p>
              </div>
              <div className="p-2 bg-muted/30 rounded-lg text-center">
                <p className="text-[10px] text-muted-foreground">Page</p>
                <p className="font-semibold text-sm">{currentPage}</p>
              </div>
            </div>

            {activeGoal.goal_type === "khatm" && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Khatm Progress</span>
                  <span className="text-xs font-medium">{overallProgress}%</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700" style={{ width: `${overallProgress}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{versesRead}/{TOTAL_VERSES} verses</p>
              </div>
            )}
          </div>

          {/* Week dots */}
          <div className="glass-card p-4 sm:p-5 mb-4 !block">
            <span className="text-sm font-medium mb-3 block">This Week</span>
            <div className="flex items-center justify-between">
              {DAYS_OF_WEEK.map((day, index) => {
                const progressForDay = weekProgress.find((p) => new Date(p.date).getDay() === index);
                const isToday = index === dayOfWeek;
                const isCompleted = progressForDay?.completed;
                return (
                  <div key={day} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">{day}</span>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all text-xs font-medium",
                      isCompleted
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                        : isToday
                          ? "border-2 border-primary border-dashed text-primary"
                          : "bg-muted/50 text-muted-foreground"
                    )}>
                      {isCompleted ? "✓" : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* New goal CTA */}
          <button
            onClick={() => setStep(2)}
            className="w-full glass-card p-4 !block text-center border-dashed border-2 border-border hover:border-primary/30 transition-colors"
          >
            <p className="text-sm text-muted-foreground">Want to change your goal?</p>
            <span className="text-primary text-sm font-medium mt-1 inline-flex items-center gap-1">
              <Target className="h-3.5 w-3.5" /> Create New Goal
            </span>
          </button>
        </div>
      </Layout>
    );
  }

  // ===== No active goal — creation wizard =====
  const wizardStep = step === 1 ? 2 : step;

  const handleCreateGoal = async () => {
    if (!selectedPreset) return;
    setIsCreating(true);
    try {
      if (selectedPreset.id === "custom") {
        await createGoal(
          "custom",
          customGoalType,
          frequency,
          customGoalType === "time_based" ? customDailyTarget : customGoalType === "verses" ? customVersesPerDay : undefined,
          customGoalType === "khatm" ? customDuration : customGoalType === "verses" ? customDuration : undefined,
        );
      } else {
        const preset = GOAL_PRESETS.find((p) => p.id === selectedPreset.id);
        if (preset) {
          await createGoal(preset.id, preset.goal_type, frequency, preset.daily_target, preset.duration);
        }
      }
      setStep(1);
      setSelectedPreset(null);
    } catch (error) {
      console.error("Error creating goal:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const generateSchedule = () => {
    if (!selectedPreset) return [];
    const schedule = [];
    const today = new Date();

    let days: number;
    let versesPerDay: number;
    let dailyMinutes: number | undefined;

    if (selectedPreset.id === "custom") {
      days = customGoalType === "time_based" ? 7 : customDuration;
      versesPerDay = customGoalType === "khatm" ? Math.ceil(TOTAL_VERSES / customDuration) : customGoalType === "verses" ? customVersesPerDay : 0;
      dailyMinutes = customGoalType === "time_based" ? customDailyTarget : undefined;
    } else {
      days = selectedPreset.duration || 7;
      versesPerDay = selectedPreset.goal_type === "khatm" ? Math.ceil(TOTAL_VERSES / days) : 0;
      dailyMinutes = selectedPreset.daily_target;
    }

    let currentVerse = 1;
    for (let i = 0; i < Math.min(days, 7); i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dayName = DAYS_OF_WEEK[date.getDay()];

      if (dailyMinutes) {
        schedule.push({ day: dayName, task: `Read ${dailyMinutes} minutes` });
      } else if (versesPerDay > 0) {
        const findSurah = (v: number) => {
          let remaining = v;
          for (const s of surahList) {
            if (remaining <= s.numberOfAyahs) return s;
            remaining -= s.numberOfAyahs;
          }
          return surahList[surahList.length - 1];
        };
        const startSurah = findSurah(currentVerse);
        const endVerse = Math.min(currentVerse + versesPerDay, TOTAL_VERSES);
        const endSurah = findSurah(endVerse);
        schedule.push({ day: dayName, task: `${startSurah?.englishName} → ${endSurah?.englishName}` });
        currentVerse = endVerse;
      }
    }
    if (days > 7) schedule.push({ day: `+${days - 7} more`, task: "" });
    return schedule;
  };

  return (
    <Layout>
      {/* Progress bar */}
      <div className="w-full bg-muted h-1.5">
        <div className="bg-primary h-full transition-all duration-500 rounded-r-full" style={{ width: `${(step / (selectedPreset?.id === "custom" ? 3 : 4)) * 100}%` }} />
      </div>

      <div className="container py-8 sm:py-12 max-w-4xl mx-auto px-4">
        {wizardStep === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-2">Pick a preset or create your own</h1>
              <p className="text-sm text-muted-foreground">Reading time is tracked automatically.</p>
            </div>
            <div className="space-y-3">
              {GOAL_PRESETS.map((preset) => {
                const Icon = iconMap[preset.icon] || Clock;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset)}
                    className={cn(
                      "w-full glass-card flex items-center gap-4 p-4 transition-all text-left",
                      selectedPreset?.id === preset.id && "ring-2 ring-primary"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      selectedPreset?.id === preset.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{preset.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{preset.description}</p>
                    </div>
                    {preset.recommended && (
                      <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] rounded-full flex-shrink-0">Rec</span>
                    )}
                  </button>
                );
              })}
              <div className="flex justify-end pt-3">
                <button
                  onClick={() => setStep(selectedPreset?.id === "custom" ? 3 : 3)}
                  disabled={!selectedPreset}
                  className="glass-btn px-5 py-2.5 gap-2 text-sm disabled:opacity-50"
                >
                  {t.common.next} <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom goal configuration */}
        {wizardStep === 3 && selectedPreset?.id === "custom" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-2">Configure Your Goal</h1>
              <p className="text-sm text-muted-foreground">Set up a goal that works for your schedule.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Goal Type</Label>
                <Select value={customGoalType} onValueChange={(v) => setCustomGoalType(v as any)}>
                  <SelectTrigger className="glass-input border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-dropdown">
                    <SelectItem value="time_based">Time-Based (min/day)</SelectItem>
                    <SelectItem value="khatm">Complete Quran (Khatm)</SelectItem>
                    <SelectItem value="verses">Verses Per Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {customGoalType === "time_based" && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Daily Minutes</Label>
                  <Input type="number" value={customDailyTarget} onChange={(e) => setCustomDailyTarget(Math.max(1, parseInt(e.target.value) || 1))} className="glass-input border-0" min={1} max={120} />
                </div>
              )}

              {customGoalType === "khatm" && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Duration (days)</Label>
                  <Input type="number" value={customDuration} onChange={(e) => setCustomDuration(Math.max(1, parseInt(e.target.value) || 1))} className="glass-input border-0" min={1} max={730} />
                  <p className="text-[10px] text-muted-foreground">≈ {Math.ceil(TOTAL_VERSES / customDuration)} verses/day</p>
                </div>
              )}

              {customGoalType === "verses" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Verses Per Day</Label>
                    <Input type="number" value={customVersesPerDay} onChange={(e) => setCustomVersesPerDay(Math.max(1, parseInt(e.target.value) || 1))} className="glass-input border-0" min={1} max={300} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Duration (days)</Label>
                    <Input type="number" value={customDuration} onChange={(e) => setCustomDuration(Math.max(1, parseInt(e.target.value) || 1))} className="glass-input border-0" min={1} />
                  </div>
                </>
              )}

              <div className="glass-card p-3 !block">
                <h3 className="text-xs font-semibold mb-2">Preview</h3>
                <div className="space-y-1.5">
                  {generateSchedule().slice(0, 4).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="font-medium">{item.day}</span>
                      <span className="text-muted-foreground">{item.task}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-3">
                <button onClick={() => setStep(2)} className="glass-btn px-5 py-2.5 gap-2 text-sm">
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button onClick={handleCreateGoal} disabled={isCreating} className="glass-btn px-5 py-2.5 bg-primary text-primary-foreground text-sm disabled:opacity-50">
                  {isCreating ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />Creating...</> : "Start!"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Non-custom frequency step */}
        {wizardStep === 3 && selectedPreset?.id !== "custom" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-2">Choose frequency</h1>
              <p className="text-sm text-muted-foreground">Progress tracked automatically as you read.</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setFrequency("daily")}
                className={cn("w-full glass-card flex items-center gap-4 p-4 transition-all text-left", frequency === "daily" && "ring-2 ring-primary")}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", frequency === "daily" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                  <Repeat className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Daily</p>
                  <p className="text-xs text-muted-foreground">Resets every day</p>
                </div>
              </button>
              <button
                onClick={() => setFrequency("duration")}
                className={cn("w-full glass-card flex items-center gap-4 p-4 transition-all text-left", frequency === "duration" && "ring-2 ring-primary")}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", frequency === "duration" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Duration</p>
                  <p className="text-xs text-muted-foreground">Track over set days</p>
                </div>
              </button>
              <div className="flex justify-between pt-3">
                <button onClick={() => setStep(2)} className="glass-btn px-5 py-2.5 gap-2 text-sm">
                  <ChevronLeft className="h-4 w-4" /> {t.common.previous}
                </button>
                <button onClick={() => setStep(4)} className="glass-btn px-5 py-2.5 gap-2 text-sm">
                  {t.common.next} <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule preview */}
        {wizardStep === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-2">Your schedule preview</h1>
              <p className="text-sm text-muted-foreground">Just read — we handle the rest.</p>
            </div>
            <div className="space-y-4">
              <div className="relative pl-6">
                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-primary/20" />
                {generateSchedule().map((item, index) => (
                  <div key={index} className="relative pb-4 last:pb-0">
                    <div className="absolute -left-4 top-3 w-3 h-3 rounded-full border-2 border-primary bg-background" />
                    <div className="glass-card flex items-center justify-between p-3 !block">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{item.day}</span>
                        <span className="text-xs text-muted-foreground">{item.task}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-3">
                <button onClick={() => setStep(3)} className="glass-btn px-5 py-2.5 gap-2 text-sm">
                  <ChevronLeft className="h-4 w-4" /> {t.common.previous}
                </button>
                <button onClick={handleCreateGoal} disabled={isCreating} className="glass-btn px-5 py-2.5 bg-primary text-primary-foreground text-sm disabled:opacity-50">
                  {isCreating ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />Creating...</> : "Start!"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
