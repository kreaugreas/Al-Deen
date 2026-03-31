import { Flame, Trophy, Clock, Calendar, Target, Trash2, MapPin } from "lucide-react";
import { cn } from "@/Middle/Library/utils";
import { Progress_Ring } from "./Progress";
import type { Goal_Progress } from "./Types";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Active_Props {
  activeGoal: any;
  weekProgress: any[];
  totalMinutesRead: number;
  todayMinutes: number;
  todayPercentage: number;
  dayProgress: Goal_Progress | null;
  overallProgress: number;
  versesRead: number;
  totalVerses: number;
  currentSurah: any;
  currentAyah: number;
  currentJuz: number;
  currentPage: number;
  onDeleteGoal: () => void;
  onCreateNewGoal: () => void;
}

export function Active({
  activeGoal,
  weekProgress,
  totalMinutesRead,
  todayMinutes,
  todayPercentage,
  dayProgress,
  overallProgress,
  versesRead,
  totalVerses,
  currentSurah,
  currentAyah,
  currentJuz,
  currentPage,
  onDeleteGoal,
  onCreateNewGoal,
}: Active_Props) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const endDate = activeGoal.end_date ? new Date(activeGoal.end_date) : null;
  const daysRemaining = endDate ? Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / 86400000)) : null;
  const dailyTarget = activeGoal.daily_target;
  const completedDays = weekProgress.filter(p => p.completed).length;

  return (
    <div className="container py-6 sm:py-8 max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Your Progress</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {activeGoal.goal_type === "time_based" 
              ? `${dailyTarget} min/day` 
              : activeGoal.goal_type === "khatm" 
                ? `Khatm${daysRemaining !== null ? ` · ${daysRemaining}d left` : ""}`
                : "Custom goal"}
          </p>
        </div>
        <button onClick={onDeleteGoal} className="ui button w-9 h-9 text-destructive/70 hover:text-destructive" title="Delete Goal">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Hero ring + stats */}
      <div className="ui card p-6 sm:p-8 mb-4 !block">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <div className="relative flex-shrink-0">
            <Progress_Ring
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
        <div className="ui card p-4 sm:p-5 mb-4 !block">
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
        <div className="ui card p-4 sm:p-5 mb-4 !block">
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
      <div className="ui card p-4 sm:p-5 mb-4 !block">
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
            <p className="text-[10px] text-muted-foreground mt-1">{versesRead}/{totalVerses} verses</p>
          </div>
        )}
      </div>

      {/* Week dots */}
      <div className="ui card p-4 sm:p-5 mb-4 !block">
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
        onClick={onCreateNewGoal}
        className="w-full ui card p-4 !block text-center border-dashed border-2 border-border hover:border-primary/30 transition-colors"
      >
        <p className="text-sm text-muted-foreground">Want to change your goal?</p>
        <span className="text-primary text-sm font-medium mt-1 inline-flex items-center gap-1">
          <Target className="h-3.5 w-3.5" /> Create New Goal
        </span>
      </button>
    </div>
  );
}