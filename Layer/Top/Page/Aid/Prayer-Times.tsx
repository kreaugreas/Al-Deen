import { useState, useEffect, useCallback, useMemo } from "react";
import { Layout } from "@/Top/Component/Layout/Index";
import { MapPin, Clock, Loader2, RefreshCw, Sun, Sunrise, Sunset, Moon, Settings2, ChevronDown } from "lucide-react";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Top/Component/UI/select";
import { ProgressBar } from "@/Top/Component/Progress-Bar";


// --- Types ---
interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Imsak?: string;
  Midnight?: string;
}

interface HijriDate {
  day: string;
  weekday: { en: string; ar: string };
  month: { number: number; en: string; ar: string };
  year: string;
  designation: { abbreviated: string; expanded: string };
}

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

interface PrayerSettings {
  method: number;
  school: number;
  latitudeAdjustmentMethod: number;
  timeFormat: "12h" | "24h";
}

// --- Constants ---
const DEFAULT_SETTINGS: PrayerSettings = {
  method: 2,
  school: 0,
  latitudeAdjustmentMethod: 3,
  timeFormat: "12h",
};

const CALCULATION_METHODS: { value: number; label: string }[] = [
  { value: 0, label: "Shia Ithna-Ashari" },
  { value: 1, label: "University of Islamic Sciences, Karachi" },
  { value: 2, label: "Islamic Society of North America (ISNA)" },
  { value: 3, label: "Muslim World League (MWL)" },
  { value: 4, label: "Umm Al-Qura University, Makkah" },
  { value: 5, label: "Egyptian General Authority of Survey" },
  { value: 7, label: "Institute of Geophysics, University of Tehran" },
  { value: 8, label: "Gulf Region" },
  { value: 9, label: "Kuwait" },
  { value: 10, label: "Qatar" },
  { value: 11, label: "Majlis Ugama Islam Singapura" },
  { value: 12, label: "Union Organization Islamic de France" },
  { value: 13, label: "Diyanet İşleri Başkanlığı, Turkey" },
  { value: 14, label: "Spiritual Administration of Muslims of Russia" },
  { value: 15, label: "Moonsighting Committee Worldwide" },
  { value: 16, label: "Dubai" },
  { value: 17, label: "JAKIM, Malaysia" },
  { value: 18, label: "Tunisia" },
  { value: 19, label: "Algeria" },
  { value: 20, label: "KEMENAG, Indonesia" },
  { value: 21, label: "Morocco" },
  { value: 22, label: "Comunidade Islamica de Lisboa" },
  { value: 23, label: "Ministry of Awqaf and Islamic Affairs, Jordan" },
  { value: 99, label: "Custom" },
];

const SCHOOLS = [
  { value: 0, label: "Shafi'i / Standard" },
  { value: 1, label: "Hanafi" },
];

const LAT_METHODS = [
  { value: 1, label: "Middle of the Night" },
  { value: 2, label: "One Seventh" },
  { value: 3, label: "Angle Based" },
];

const PRAYER_ICONS: Record<string, typeof Sun> = {
  Fajr: Sunrise,
  Sunrise: Sun,
  Dhuhr: Sun,
  Asr: Sun,
  Maghrib: Sunset,
  Isha: Moon,
};

const PRAYER_ARABIC: Record<string, string> = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

const PRAYER_GRADIENTS: Record<string, string> = {
  Fajr: "from-blue-500/10 to-indigo-500/10",
  Sunrise: "from-amber-400/10 to-orange-400/10",
  Dhuhr: "from-yellow-400/10 to-amber-400/10",
  Asr: "from-orange-400/10 to-amber-500/10",
  Maghrib: "from-rose-500/10 to-orange-500/10",
  Isha: "from-indigo-600/10 to-purple-600/10",
};

const MAIN_PRAYERS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

// --- Helpers ---
function loadSettings(): PrayerSettings {
  try {
    const saved = localStorage.getItem("prayer-settings");
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveSettings(s: PrayerSettings) {
  localStorage.setItem("prayer-settings", JSON.stringify(s));
}

function getNextPrayer(timings: PrayerTimesData): string | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  for (const prayer of MAIN_PRAYERS) {
    const [h, m] = timings[prayer].split(":").map(Number);
    if (h * 60 + m > currentMinutes) return prayer;
  }
  return "Fajr";
}

function getPreviousPrayer(timings: PrayerTimesData, nextPrayer: string): string {
  const idx = MAIN_PRAYERS.indexOf(nextPrayer as typeof MAIN_PRAYERS[number]);
  return idx <= 0 ? "Isha" : MAIN_PRAYERS[idx - 1];
}

function toMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function formatTimeRemaining(timeStr: string): string {
  const now = new Date();
  let diff = toMinutes(timeStr) - (now.getHours() * 60 + now.getMinutes());
  if (diff < 0) diff += 24 * 60;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function formatTime(time24: string, format: "12h" | "24h"): string {
  if (format === "24h") return time24;
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function getElapsedProgress(timings: PrayerTimesData, nextPrayer: string): number {
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const nextMin = toMinutes(timings[nextPrayer as keyof PrayerTimesData]);
  const prevPrayer = getPreviousPrayer(timings, nextPrayer);
  const prevMin = toMinutes(timings[prevPrayer as keyof PrayerTimesData]);

  let total = nextMin - prevMin;
  let elapsed = currentMin - prevMin;
  if (total <= 0) total += 24 * 60;
  if (elapsed < 0) elapsed += 24 * 60;

  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

// --- Component ---
const PrayerTimes = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [timings, setTimings] = useState<PrayerTimesData | null>(null);
  const [hijri, setHijri] = useState<HijriDate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateStr, setDateStr] = useState("");
  const [settings, setSettings] = useState<PrayerSettings>(loadSettings);
  const [showSettings, setShowSettings] = useState(false);

  const updateSetting = <K extends keyof PrayerSettings>(key: K, value: PrayerSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  };

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

  // Re-fetch when settings change (but not on mount — requestLocation handles that)
  const settingsKey = `${settings.method}-${settings.school}-${settings.latitudeAdjustmentMethod}`;
  useEffect(() => {
    if (location) {
      fetchPrayerTimes(location.latitude, location.longitude, settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsKey]);

  // Tick every minute
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const nextPrayer = timings ? getNextPrayer(timings) : null;
  const progress = timings && nextPrayer ? getElapsedProgress(timings, nextPrayer) : 0;

  const methodLabel = useMemo(
    () => CALCULATION_METHODS.find((m) => m.value === settings.method)?.label || "Unknown",
    [settings.method]
  );

  return (
    <Layout>
      <section className="py-6">
        <div className="container max-w-2xl">
          {/* Header */}
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
                onClick={() => setShowSettings(!showSettings)}
                title="Settings"
              >
                <Settings2 className="h-4 w-4" />
              </button>
              <button className="glass-icon-btn w-9 h-9" onClick={requestLocation} title="Refresh">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Hijri Date */}
          {hijri && (
            <p className="text-sm text-muted-foreground mb-4 font-arabic">
              {hijri.day} {hijri.month.ar} {hijri.year} {hijri.designation.abbreviated}
              <span className="mx-2 opacity-30">•</span>
              <span className="font-sans">{hijri.day} {hijri.month.en} {hijri.year} {hijri.designation.abbreviated}</span>
            </p>
          )}

          {/* Settings Panel */}
          {showSettings && (
            <div className="glass-card mb-4 overflow-hidden">
              <div className="glass-content p-4 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-primary" /> Settings
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Calculation Method */}
                  <div className="sm:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1.5 block">Calculation Method</label>
                    <Select value={String(settings.method)} onValueChange={(v) => updateSetting("method", Number(v))}>
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
                    <Select value={String(settings.school)} onValueChange={(v) => updateSetting("school", Number(v))}>
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
                    <Select value={String(settings.latitudeAdjustmentMethod)} onValueChange={(v) => updateSetting("latitudeAdjustmentMethod", Number(v))}>
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
                          onClick={() => updateSetting("timeFormat", fmt)}
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
          )}

          {loading ? (
            <div className="glass-card p-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">Fetching prayer times...</p>
            </div>
          ) : error ? (
            <div className="glass-card p-8 text-center">
              <p className="text-muted-foreground mb-4">{error}</p>
              <button className="glass-btn px-4 py-2" onClick={requestLocation}>Try Again</button>
            </div>
          ) : timings ? (
            <div className="space-y-3">
              {/* Next prayer highlight */}
              {nextPrayer && (
                <div className="glass-card p-5 !block border-primary/20 bg-primary/5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Next Prayer</p>
                      <p className="text-xl font-bold text-primary">{nextPrayer}</p>
                      <p className="text-sm text-muted-foreground font-arabic">{PRAYER_ARABIC[nextPrayer]}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold">{formatTime(timings[nextPrayer as keyof PrayerTimesData]!, settings.timeFormat)}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Clock className="h-3 w-3" />
                        in {formatTimeRemaining(timings[nextPrayer as keyof PrayerTimesData]!)}
                      </p>
                    </div>
                  </div>
                  <ProgressBar progress={progress} />
                </div>
              )}

              {/* All prayers */}
              {MAIN_PRAYERS.map((prayer) => {
                const Icon = PRAYER_ICONS[prayer];
                const isNext = prayer === nextPrayer;
                return (
                  <div
                    key={prayer}
                    className={`glass-card p-4 !block transition-all ${isNext ? "ring-1 ring-primary/30" : ""}`}
                  >
                    <div className={`absolute inset-0 rounded-[inherit] bg-gradient-to-r ${PRAYER_GRADIENTS[prayer]} pointer-events-none`} />
                    <div className="flex items-center justify-between relative">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isNext ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className={`font-medium ${isNext ? "text-primary" : ""}`}>{prayer}</p>
                          <p className="text-xs text-muted-foreground font-arabic">{PRAYER_ARABIC[prayer]}</p>
                        </div>
                      </div>
                      <p className={`text-lg font-semibold tabular-nums ${isNext ? "text-primary" : ""}`}>
                        {formatTime(timings[prayer], settings.timeFormat)}
                      </p>
                    </div>
                  </div>
                );
              })}




              {/* Imsak & Midnight */}
              {(timings.Imsak || timings.Midnight) && (
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
              )}

              <p className="text-xs text-muted-foreground text-center pt-2">
                {dateStr} • {methodLabel}
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </Layout>
  );
};

export default PrayerTimes;
