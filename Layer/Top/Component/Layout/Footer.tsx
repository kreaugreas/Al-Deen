import { Link } from "react-router-dom";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { Sun, Moon, Globe } from "lucide-react";
import { useApp } from "@/Middle/Context/App-Context";
import { languages } from "@/Middle/I18n";

export function Footer() {
  const { t, isRtl } = useTranslation();
  const { theme, setTheme, currentLanguage, setCurrentLanguage } = useApp();

  const navigateLinks = [
    { name: t.nav.home, path: "/" },
    { name: t.nav.quran, path: "/Quran" },
    { name: t.nav.hadiths, path: "/Hadiths" },
    { name: "Aid", path: "/Aid" },
    { name: t.nav.feedback, path: "/Feedback" },
  ];

  const popularLinks = [
    { name: "Ayatul Kursi", path: "/Quran/Surah/2?verse=255" },
    { name: "Yaseen", path: "/Quran/Surah/36" },
    { name: "Al Mulk", path: "/Quran/Surah/67" },
    { name: "Ar-Rahman", path: "/Quran/Surah/55" },
    { name: "Al Waqi'ah", path: "/Quran/Surah/56" },
    { name: "Al Kahf", path: "/Quran/Surah/18" },
  ];

  const currentLangName = languages.find(l => l.code === currentLanguage)?.name || "English";

  return (
    <footer className="mt-8 px-4" dir={isRtl ? "rtl" : "ltr"}>
      <div className="glass-card max-w-7xl mx-auto" style={{ borderRadius: '2rem 2rem 0 0' }}>
        <div className="glass-content p-6 md:p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* About Section */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-brand text-xl mb-3 text-foreground">Al-Deen.org</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t.footer.tagline || "Read, Listen, Search, and Reflect on the Quran"}
              </p>
            </div>

            {/* Navigate */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground text-sm">{t.footer.navigate || "Navigate"}</h4>
              <ul className="space-y-2 text-sm">
                {navigateLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-muted-foreground hover:text-foreground transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Links */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground text-sm">{t.footer.popularLinks || "Popular"}</h4>
              <ul className="space-y-2 text-sm">
                {popularLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-muted-foreground hover:text-foreground transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground text-sm">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/Privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link to="/Terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link to="/Sitemap" className="text-muted-foreground hover:text-foreground transition-colors">
                    {t.footer.sitemap}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pt-6 border-t border-border/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              © 2025 Al-Deen.org. {t.footer.copyright}
            </p>

            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="glass-btn px-3 py-2 text-sm flex items-center gap-2"
              >
                {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span className="hidden sm:inline">{theme === "dark" ? t.settings.dark : t.settings.light}</span>
              </button>

              {/* Language Selector */}
              <div className="relative group">
                <button className="glass-btn px-3 py-2 text-sm flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">{currentLangName}</span>
                </button>
                <div className="absolute bottom-full right-0 mb-2 glass-dropdown w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="glass-content p-2 max-h-60 overflow-y-auto">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setCurrentLanguage(lang.code)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          currentLanguage === lang.code 
                            ? "bg-primary/20 text-primary" 
                            : "hover:bg-white/10 text-foreground"
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
