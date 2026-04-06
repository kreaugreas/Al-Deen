import { useState, useEffect, useCallback, useMemo } from "react";
import { loadSettings, saveSettings } from "@/Top/Component/Aid/Prayer/Utility";
import { DEFAULT_SETTINGS, CALCULATION_METHODS } from "@/Top/Component/Aid/Prayer/Constant";
import type { PrayerTimesData, HijriDate, LocationData, PrayerSettings } from "@/Top/Component/Aid/Prayer/Types";

export function usePrayerTimes() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [timings, setTimings] = useState<PrayerTimesData | null>(null);
  const [hijri, setHijri] = useState<HijriDate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateStr, setDateStr] = useState("");
  const [settings, setSettings] = useState<PrayerSettings>(loadSettings);

  const updateSetting = useCallback(<K extends keyof PrayerSettings>(key: K, value: PrayerSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  const fetchPrayerTimes = useCallback(async (lat: number, lng: number, s: PrayerSettings) => {
    try {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      setDateStr(`${dd}-${mm}-${yyyy}`);

      const params = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lng),
        method: String(s.method),
        school: String(s.school),
        latitudeAdjustmentMethod: String(s.latitudeAdjustmentMethod),
      });

      const res = await fetch(`https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?${params}`);
      const data = await res.json();

      if (data.code === 200) {
        const strip = (v: string) => v.replace(/\s*\(.*\)/, "");
        const ti = data.data.timings;
        setTimings({
          Fajr: strip(ti.Fajr),
          Sunrise: strip(ti.Sunrise),
          Dhuhr: strip(ti.Dhuhr),
          Asr: strip(ti.Asr),
          Maghrib: strip(ti.Maghrib),
          Isha: strip(ti.Isha),
          Imsak: strip(ti.Imsak),
          Midnight: strip(ti.Midnight),
        });

        if (data.data.date?.hijri) {
          setHijri(data.data.date.hijri);
        }

        if (data.data.meta?.timezone) {
          const city = data.data.meta.timezone.split("/").pop()?.replace(/_/g, " ") || "";
          setLocation((prev) => (prev ? { ...prev, city } : null));
        }
      } else {
        setError("Failed to fetch prayer times");
      }
    } catch {
      setError("Failed to fetch prayer times. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  const requestLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        setLocation(loc);
        fetchPrayerTimes(loc.latitude, loc.longitude, settings);
      },
      () => {
        fetch("https://ipapi.co/json/")
          .then((r) => r.json())
          .then((data) => {
            const loc = { latitude: data.latitude, longitude: data.longitude, city: data.city, country: data.country_name };
            setLocation(loc);
            fetchPrayerTimes(loc.latitude, loc.longitude, settings);
          })
          .catch(() => {
            setError("Unable to determine your location. Please allow location access.");
            setLoading(false);
          });
      },
      { timeout: 5000 }
    );
  }, [fetchPrayerTimes, settings]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const settingsKey = `${settings.method}-${settings.school}-${settings.latitudeAdjustmentMethod}`;
  useEffect(() => {
    if (location) {
      fetchPrayerTimes(location.latitude, location.longitude, settings);
    }
  }, [settingsKey, location, fetchPrayerTimes]);

  const methodLabel = useMemo(
    () => CALCULATION_METHODS.find((m) => m.value === settings.method)?.label || "Unknown",
    [settings.method]
  );

  return {
    location,
    timings,
    hijri,
    loading,
    error,
    dateStr,
    settings,
    updateSetting,
    requestLocation,
    methodLabel,
  };
}