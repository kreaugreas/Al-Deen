import { useState, useEffect } from "react";
import { Layout } from "@/Top/Component/Layout/Index";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/Top/Component/UI/Button";
import { Container } from "@/Top/Component/UI/Container";

interface HijriDate {
  day: string;
  weekday: { en: string; ar: string };
  month: { number: number; en: string; ar: string };
  year: string;
  designation: { abbreviated: string };
}

interface CalendarDay {
  hijri: HijriDate;
  gregorian: {
    date: string;
    day: string;
    weekday: { en: string };
    month: { number: number; en: string };
    year: string;
  };
}

const HijriCalendarPage = () => {
  const today = new Date();

  // We navigate by Hijri month/year
  const [hijriMonth, setHijriMonth] = useState<number | null>(null);
  const [hijriYear, setHijriYear] = useState<number | null>(null);
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const todayStr = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Step 1: On mount, get today's Hijri date to know which Hijri month we're in
  useEffect(() => {
    fetch(`https://api.aladhan.com/v1/gToH/${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200 && data.data) {
          setHijriMonth(data.data.hijri.month.number);
          setHijriYear(parseInt(data.data.hijri.year));
        }
      })
      .catch(console.error);
  }, []);

  // Step 2: Whenever hijriMonth/hijriYear are set, fetch the full Hijri month calendar
  useEffect(() => {
    if (hijriMonth === null || hijriYear === null) return;

    setLoading(true);
    setError(null);

    fetch(`https://api.aladhan.com/v1/hToGCalendar/${hijriMonth}/${hijriYear}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.code === 200 && data.data) {
          setDays(data.data);
        } else {
          setError("Failed to load calendar data");
        }
      })
      .catch((err) => {
        console.error("API Error:", err);
        setError("Unable to load calendar. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [hijriMonth, hijriYear]);

  const goNext = () => {
    if (hijriMonth === null || hijriYear === null) return;
    if (hijriMonth === 12) {
      setHijriMonth(1);
      setHijriYear(hijriYear + 1);
    } else {
      setHijriMonth(hijriMonth + 1);
    }
  };

  const goPrev = () => {
    if (hijriMonth === null || hijriYear === null) return;
    if (hijriMonth === 1) {
      setHijriMonth(12);
      setHijriYear(hijriYear - 1);
    } else {
      setHijriMonth(hijriMonth - 1);
    }
  };

  const getOffset = () => {
    if (days.length === 0) return 0;
    const firstDayName = days[0].gregorian.weekday.en;
    return weekDays.indexOf(firstDayName);
  };

  // Header labels
  const hijriMonthName = days.length > 0
    ? `${days[0].hijri.month.en} ${days[0].hijri.year} AH`
    : "";

  const gregorianRange = days.length > 0
    ? (() => {
        const first = days[0].gregorian;
        const last = days[days.length - 1].gregorian;
        return `${first.month.en} ${first.day} – ${last.month.en} ${last.day}, ${last.year}`;
      })()
    : "";

  return (
    <Layout>
      <section className="py-6">
        <div className="container max-w-2xl mx-auto">
          {/* Header */}
          <Container className="!py-3 !px-4 mb-4">
            <div className="flex items-center justify-between">
              <Button size="sm" className="w-9 h-9 p-0 rounded-full" onClick={goPrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <p className="text-lg font-semibold">{hijriMonthName}</p>
                <p className="text-xs text-muted-foreground">{gregorianRange}</p>
              </div>
              <Button size="sm" className="w-9 h-9 p-0 rounded-full" onClick={goNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Container>

          {loading ? (
            <Container className="p-12 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </Container>
          ) : error ? (
            <Container className="p-8 text-center">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </Container>
          ) : (
            <div>
              {/* Weekday labels — each in its own thin Container */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {weekDays.map((d) => (
                  <Container key={d} className="!py-1 !px-0 text-center">
                    <span className="text-xs text-muted-foreground font-medium">{d}</span>
                  </Container>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Offset empty cells */}
                {Array.from({ length: getOffset() }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Day cells: Hijri day large, Gregorian day small below */}
                {days.map((day) => {
                  const isToday = day.gregorian.date === todayStr;
                  return (
                    <Container
                      key={day.gregorian.date}
                      className={`!py-2 !px-1 text-center ${isToday ? "ring-1 ring-primary/40 bg-primary/5" : ""}`}
                    >
                      {/* Hijri day — primary */}
                      <p className={`text-sm font-semibold leading-tight ${isToday ? "text-primary" : ""}`}>
                        {day.hijri.day}
                      </p>
                      {/* Gregorian day — secondary */}
                      <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                        {day.gregorian.day}
                      </p>
                    </Container>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default HijriCalendarPage;