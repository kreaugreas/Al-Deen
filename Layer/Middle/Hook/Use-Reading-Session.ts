import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/Bottom/Integration/Supabase/client";
import { useAuth } from "@/Middle/Context/Auth-Context";

/**
 * Tracks reading time on Quran pages using time-on-page + scroll activity.
 * Pauses when tab is hidden or user is idle for >60s.
 */
export function useReadingSession() {
  const { user } = useAuth();
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const accumulatedRef = useRef(0);
  const IDLE_TIMEOUT = 60_000; // 60 seconds

  const markActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (!isActive) setIsActive(true);
  }, [isActive]);

  // Start tracking
  const startSession = useCallback(() => {
    startTimeRef.current = Date.now();
    accumulatedRef.current = 0;
    setIsActive(true);
    setSessionMinutes(0);
  }, []);

  // Stop and save
  const stopSession = useCallback(async () => {
    if (!startTimeRef.current) return 0;

    const elapsed = accumulatedRef.current + (isActive ? Date.now() - (startTimeRef.current || Date.now()) : 0);
    const minutes = Math.round(elapsed / 60_000);
    startTimeRef.current = null;
    setIsActive(false);
    setSessionMinutes(0);
    accumulatedRef.current = 0;

    return minutes;
  }, [isActive]);

  // Save reading minutes to goal progress
  const saveMinutesToGoal = useCallback(async (goalId: string, minutes: number) => {
    if (!user || minutes <= 0) return;

    const today = new Date().toISOString().split("T")[0];

    try {
      const { data: existing } = await supabase
        .from("goal_progress")
        .select("*")
        .eq("goal_id", goalId)
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        const currentMinutes = (existing as any).minutes_read || 0;
        await supabase
          .from("goal_progress")
          .update({
            minutes_read: currentMinutes + minutes,
            completed: true,
          })
          .eq("id", (existing as any).id);
      } else {
        await supabase
          .from("goal_progress")
          .insert({
            goal_id: goalId,
            user_id: user.id,
            date: today,
            completed: true,
            minutes_read: minutes,
          });
      }
    } catch (error) {
      console.error("Error saving reading minutes:", error);
    }
  }, [user]);

  // Tick every 10 seconds to update session minutes
  useEffect(() => {
    if (!startTimeRef.current) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const idleTime = now - lastActivityRef.current;

      if (idleTime > IDLE_TIMEOUT) {
        // User went idle — pause
        if (isActive) {
          accumulatedRef.current += now - (startTimeRef.current || now);
          startTimeRef.current = now;
          setIsActive(false);
        }
        return;
      }

      if (!isActive) {
        // Resume from idle
        startTimeRef.current = now;
        setIsActive(true);
      }

      const totalMs = accumulatedRef.current + (now - (startTimeRef.current || now));
      setSessionMinutes(Math.round(totalMs / 60_000));
    }, 10_000);

    return () => clearInterval(interval);
  }, [isActive]);

  // Track scroll and visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isActive && startTimeRef.current) {
          accumulatedRef.current += Date.now() - startTimeRef.current;
          startTimeRef.current = Date.now();
          setIsActive(false);
        }
      } else {
        markActivity();
        if (startTimeRef.current) {
          startTimeRef.current = Date.now();
          setIsActive(true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("scroll", markActivity);
    window.addEventListener("mousemove", markActivity);
    window.addEventListener("keydown", markActivity);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("scroll", markActivity);
      window.removeEventListener("mousemove", markActivity);
      window.removeEventListener("keydown", markActivity);
    };
  }, [isActive, markActivity]);

  return {
    sessionMinutes,
    isActive,
    startSession,
    stopSession,
    saveMinutesToGoal,
    markActivity,
  };
}
