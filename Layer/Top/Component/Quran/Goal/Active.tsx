import { Flame, Trophy, Clock, Calendar, Target, Trash2, MapPin } from "lucide-react";
import { cn } from "@/Middle/Library/utils";
import { Container } from "@/Top/Component/UI/Container";
import { Button } from "@/Top/Component/UI/Button";
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
          <Container className="!w-auto !py-1 !px-3 mb-2">
            <h1 className="text-sm font-semibold text-foreground">Your Progress</h1>
          </Container>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {activeGoal.goal_type === "time_based" 
              ? `${dailyTarget} min/day` 
              : activeGoal.goal_type === "khatm" 
                ? `Khatm${daysRemaining !== null ? ` · ${daysRemaining}d left` : ""}`
                : "Custom goal"}
          </p>
        </div>
        <Button onClick={onDeleteGoal} size="sm" className="w-9 h-9 p-0 rounded-full text-destructive/70 hover:text-destructive" title="Delete Goal">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Hero ring + stats */}
      <Container className="!p-6 sm:!p-8 mb-4 group">
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
            <Container className="!p-3 text-center group">
              <Flame className="h-4 w-4 mx-auto mb-1 text-primary group-hover:text-white dark:group-hover:text-black" />
              <p className="text-xl font-bold group-hover:text-white dark:group-hover:text-black">{activeGoal.current_streak}</p>
              <p className="text-[10px] text-muted-foreground group-hover:text-white/70 dark:group-hover:text-black/70">Streak</p>
            </Container>
            <Container className="!p-3 text-center group">
              <Trophy className="h-4 w-4 mx-auto mb-1 text-primary group-hover:text-white dark:group-hover:text-black" />
              <p className="text-xl font-bold group-hover:text-white dark:group-hover:text-black">{activeGoal.longest_streak}</p>
              <p className="text-[10px] text-muted-foreground group-hover:text-white/70 dark:group-hover:text-black/70">Best</p>
            </Container>
            <Container className="!p-3 text-center group">
              <Clock className="h-4 w-4 mx-auto mb-1 text-primary group-hover:text-white dark:group-hover:text-black" />
              <p className="text-xl font-bold group-hover:text-white dark:group-hover:text-black">{totalMinutesRead}</p>
              <p className="text-[10px] text-muted-foreground group-hover:text-white/70 dark:group-hover:text-black/70">Total Min</p>
            </Container>
            <Container className="!p-3 text-center group">
              <Calendar className="h-4 w-4 mx-auto mb-1 text-primary group-hover:text-white dark:group-hover:text-black" />
              <p className="text-xl font-bold group-hover:text-white dark:group-hover:text-black">{completedDays}/7</p>
              <p className="text-[10px] text-muted-foreground group-hover:text-white/70 dark:group-hover:text-black/70">This Week</p>
            </Container>
          </div>
        </div>
      </Container>

      {/* Today's Progress Bar */}
      {activeGoal.goal_type === "time_based" && dailyTarget && (
        <Container className="!p-4 sm:!p-5 mb-4 group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium group-hover:text-white dark:group-hover:text-black">Today</span>
            <span className="text-xs text-muted-foreground group-hover:text-white/70 dark:group-hover:text-black/70">{todayMinutes}/{dailyTarget} min</span>
          </div>
          <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700" style={{ width: `${todayPercentage}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 group-hover:text-white/70 dark:group-hover:text-black/70">
            {todayPercentage >= 100 ? "✅ Goal achieved!" : `${dailyTarget - todayMinutes}m remaining`}
          </p>
        </Container>
      )}

      {/* Khatm day progress */}
      {dayProgress && (
        <Container className="!p-4 sm:!p-5 mb-4 group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary group-hover:text-white dark:group-hover:text-black" />
              <span className="text-sm font-medium group-hover:text-white dark:group-hover:text-black">Day {dayProgress.dayNumber}/{dayProgress.totalDays}</span>
            </div>
            <span className="text-xs font-medium text-primary group-hover:text-white dark:group-hover:text-black">{dayProgress.todayPercent}%</span>
          </div>
          <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700" style={{ width: `${dayProgress.todayPercent}%` }} />
          </div>
          <div className="flex gap-2">
            <Container className="!p-2.5 flex-1 group">
              <p className="text-[10px] text-muted-foreground group-hover:text-white/70 dark:group-hover:text-black/70">From</p>
              <p className="text-xs font-medium truncate group-hover:text-white dark:group-hover:text-black">{dayProgress.startPos.surahName}</p>
            </Container>
            <div className="flex items-center text-muted-foreground group-hover:text-white/70 dark:group-hover:text-black/70">→</div>
            <Container className="!p-2.5 flex-1 group">
              <p className="text-[10px] text-muted-foreground group-hover:text-white/70 dark:group-hover:text-black/70">To</p>
              <p className="text-xs font-medium truncate group-hover:text-white dark:group-hover:text-black">{dayProgress.endPos.surahName} ({dayProgress.endPos.ayah})</p>
            </Container>
          </div>
        </Container>
      )}

      {/* Current Position */}
      <Container className="!p-4 sm:!p-5 mb-4 group">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4 text-primary group-hover:text-white dark:group-hover:text-black" />
          <span className="text-sm font-medium group-hover:text-white dark:group-hover:text-black">Current Position</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Container className="!p-2 text-center group">
            <p className="text-[10px] text-muted-foreground group-hover:text-white/70 dark:group-hover:text-black/70">Surah</p>
            <p className="font-semibold text-xs truncate group-hover:text-white dark:group-hover:text-black">{currentSurah?.englishName || "Al-Fatihah"}</p>
          </Container>
          <Container className="!p-2 text-center group">
            <p className="text-[10px] text-muted-foreground group-hover:text-white/70 dark:group-hover:text-black/70">Ayah</p>
            <p className="font-semibold text-sm group-hover:text-white dark:group-hover:text-black">{currentAyah}</p>
          </Container>
          <Container className="!p-2 text-center group">
            <p className="text-[10px] text-muted-foreground group-hover:text-white/70 dark:group-hover:text-black/70">Juz</p>
            <p className="font-semibold text-sm group-hover:text-white dark:group-hover:text-black">{currentJuz}</p>
          </Container>
          <Container className="!p-2 text-center group">
            <p className="text-[10px] text-muted-foreground group-hover:text-white/70 dark:group-hover:text-black/70">Page</p>
            <p className="font-semibold text-sm group-hover:text-white dark:group-hover:text-black">{currentPage}</p>
          </Container>
        </div>

        {activeGoal.goal_type === "khatm" && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground group-hover:text-white/70 dark:group-hover:text-black/70">Khatm Progress</span>
              <span className="text-xs font-medium group-hover:text-white dark:group-hover:text-black">{overallProgress}%</span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700" style={{ width: `${overallProgress}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 group-hover:text-white/70 dark:group-hover:text-black/70">{versesRead}/{totalVerses} verses</p>
          </div>
        )}
      </Container>

      {/* Week dots */}
      <Container className="!p-4 sm:!p-5 mb-4 group">
        <span className="text-sm font-medium mb-3 block group-hover:text-white dark:group-hover:text-black">This Week</span>
        <div className="flex items-center justify-between">
          {DAYS_OF_WEEK.map((day, index) => {
            const progressForDay = weekProgress.find((p) => new Date(p.date).getDay() === index);
            const isToday = index === dayOfWeek;
            const isCompleted = progressForDay?.completed;
            return (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground group-hover:text-white/70 dark:group-hover:text-black/70">{day}</span>
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
      </Container>

      {/* New goal CTA */}
      <Button
        onClick={onCreateNewGoal}
        className="w-full !p-4 text-center border-dashed border-2 border-border hover:border-primary/30 transition-colors group"
        variant="secondary"
        fullWidth
      >
        <div>
          <p className="text-sm text-muted-foreground group-hover:text-white/70 dark:group-hover:text-black/70">Want to change your goal?</p>
          <span className="text-primary text-sm font-medium mt-1 inline-flex items-center gap-1 group-hover:text-white dark:group-hover:text-black">
            <Target className="h-3.5 w-3.5" /> Create New Goal
          </span>
        </div>
      </Button>
    </div>
  );
}