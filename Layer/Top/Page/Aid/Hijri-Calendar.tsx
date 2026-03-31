import { useState, useEffect } from "react";
import { Layout } from "@/Top/Component/Layout/Index";
import { Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface HijriDate {
  day: string;
  weekday: { en: string; ar: string };
  month: { number: number; en: string; ar: string };
  year: string;
  designation: { abbreviated: string };
}

interface GregorianDate {
  date: string;
  day: string;
  weekday: { en: string };
  month: { number: number; en: string };
  year: string;
}

interface CalendarDay {
  hijri: HijriDate;
  gregorian: GregorianDate;
}

const HijriCalendarPage = () => {
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`https://api.aladhan.com/v1/gToHCalendar/${month}/${year}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.code === 200) setDays(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [month, year]);

  const goNext = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const goPrev = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const today = new Date();
  const todayStr = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;

  const hijriMonthName = days.length > 0 ? `${days[0].hijri.month.en} ${days[0].hijri.year} AH` : "";

  const GREGORIAN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <Layout>
      <section className="py-6">
        <div className="container max-w-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">Hijri Calendar</h1>
          </div>

          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button className="glass-icon-btn w-9 h-9" onClick={goPrev}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-center">
              <p className="font-semibold">{GREGORIAN_MONTHS[month - 1]} {year}</p>
              {hijriMonthName && <p className="text-sm text-muted-foreground">{hijriMonthName}</p>}
            </div>
            <button className="glass-icon-btn w-9 h-9" onClick={goNext}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="glass-card p-12 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-xs text-muted-foreground py-2 font-medium">{d}</div>
              ))}

              {/* Offset for first day */}
              {days.length > 0 && (() => {
                const firstDayName = days[0].gregorian.weekday.en;
                const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const offset = dayNames.indexOf(firstDayName);
                return Array.from({ length: offset }).map((_, i) => <div key={`empty-${i}`} />);
              })()}

              {days.map((day) => {
                const isToday = day.gregorian.date === todayStr;
                return (
                  <div
                    key={day.gregorian.date}
                    className={`glass-card !p-2 text-center ${isToday ? "ring-1 ring-primary/40 bg-primary/5" : ""}`}
                  >
                    <p className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>{day.gregorian.day}</p>
                    <p className="text-xs text-muted-foreground font-arabic">{day.hijri.day}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default HijriCalendarPage;
