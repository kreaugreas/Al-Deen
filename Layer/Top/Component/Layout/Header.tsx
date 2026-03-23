import { memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Settings, ArrowLeft, Search } from "lucide-react";
import { useScrollDirection } from "@/Middle/Hook/Use-Scroll-Direction";
import { useApp } from "@/Middle/Context/App-Context";
import { useAuth } from "@/Middle/Context/Auth-Context";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { cn } from "@/Middle/Library/utils";
import { Link } from "react-router-dom";

export const Header = memo(function Header() {
  const { scrollDirection } = useScrollDirection();
  const { isSettingsSidebarOpen, setSettingsSidebarOpen, setSearchSidebarOpen } = useApp();
  const { user } = useAuth();
  const { t, isRtl } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const shouldHide = scrollDirection === "down";
  const isHome = location.pathname === "/";
  const showBack = !isHome || isSettingsSidebarOpen;

  const handleBack = () => {
    if (isSettingsSidebarOpen) {
      setSettingsSidebarOpen(false);
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex justify-center pt-2 sm:pt-4 px-2 sm:px-4 isolate",
        shouldHide && !isSettingsSidebarOpen ? "-translate-y-24 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <nav className="glass-navbar px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 w-full max-w-none">
        <div className="glass-content flex items-center justify-between w-full gap-2 sm:gap-3 md:gap-4">
          <div className="flex items-center">
            {showBack && (
              <button
                onClick={handleBack}
                className="glass-icon-btn w-9 h-9 sm:w-10 sm:h-10"
                aria-label={t.common.back}
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setSearchSidebarOpen(true)}
              className="glass-icon-btn w-9 h-9 sm:w-10 sm:h-10"
              aria-label="Search"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <button
              onClick={() => setSettingsSidebarOpen(true)}
              className="glass-icon-btn w-9 h-9 sm:w-10 sm:h-10"
              aria-label={t.nav.settings}
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {!user && (
              <Link
                to="/Sign-In"
                className="glass-btn px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-primary whitespace-nowrap"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
});
