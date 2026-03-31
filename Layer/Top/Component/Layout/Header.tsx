import { memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Settings, ArrowLeft, Search } from "lucide-react";
import { useScrollDirection } from "@/Middle/Hook/Use-Scroll-Direction";
import { useApp } from "@/Middle/Context/App";
import { useAuth } from "@/Middle/Context/Auth";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { cn } from "@/Middle/Library/utils";
import { Link } from "react-router-dom";
import { Button } from "@/Top/Component/UI/Button";

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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex justify-between items-center pt-2 sm:pt-4 px-2 sm:px-4 isolate",
        shouldHide && !isSettingsSidebarOpen ? "-translate-y-24 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="flex items-center">
        {showBack && (
          <Button
            onClick={handleBack}
            className="w-9 h-9 sm:w-10 sm:h-10 p-0"
            aria-label={t.common.back}
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          onClick={() => setSearchSidebarOpen(true)}
          className="w-9 h-9 sm:w-10 sm:h-10 p-0"
          aria-label="Search"
        >
          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        <Button
          onClick={() => setSettingsSidebarOpen(true)}
          className="w-9 h-9 sm:w-10 sm:h-10 p-0"
          aria-label={t.nav.settings}
        >
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        {!user && (
          <Link
            to="/Sign-In"
            className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-[40px] bg-white dark:bg-black border-2 border-black dark:border-white text-primary hover:scale-102 hover:bg-black dark:hover:bg-white hover:border-white dark:hover:border-black hover:text-white dark:hover:text-black transition-all duration-200"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
});