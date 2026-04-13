import { memo, useCallback, useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Settings, ArrowLeft, Search, Home, X } from "lucide-react";
import { useScrollDirection } from "@/Middle/Hook/Use-Scroll-Direction";
import { useApp } from "@/Middle/Context/App";
import { useAuth } from "@/Middle/Context/Auth";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { useIsMobile } from "@/Middle/Hook/Use-Mobile";
import { cn } from "@/Middle/Library/utils";
import { Link } from "react-router-dom";
import { Button } from "@/Top/Component/UI/Button";
import { Container } from "@/Top/Component/UI/Container";
import { Input } from "@/Top/Component/UI/Input";
import { mobileSettingsStore } from "@/Top/Component/Settings/mobileSettingsStore";

export const Header = memo(function Header() {
  const { scrollDirection } = useScrollDirection();
  const { 
    isSettingsSidebarOpen, 
    setSettingsSidebarOpen, 
    isSearchSidebarOpen,
    setSearchSidebarOpen 
  } = useApp();
  const { user } = useAuth();
  const { t, isRtl } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const shouldHide = scrollDirection === "down";
  const isHome = location.pathname === "/";

  const isMobileSettingsOpen = isMobile && isSettingsSidebarOpen;

  const [mobileTitle, setMobileTitle] = useState("Settings");
  const [showMobileBack, setShowMobileBack] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isMobileSettingsOpen) return;
    const { title, showBack, isSearchMode: searchMode } = mobileSettingsStore.getState();
    setMobileTitle(title);
    setShowMobileBack(showBack);
    setIsSearchMode(searchMode);
    const unsubscribe = mobileSettingsStore.subscribe(() => {
      const { title, showBack, isSearchMode: searchMode } = mobileSettingsStore.getState();
      setMobileTitle(title);
      setShowMobileBack(showBack);
      setIsSearchMode(searchMode);
    });
    return unsubscribe;
  }, [isMobileSettingsOpen]);

  useEffect(() => {
    if (isSearchMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchMode]);

  const handleMobileBack = () => mobileSettingsStore.goBack();
  const handleMobileClose = () => mobileSettingsStore.close();

  const handleOpenSearch = () => {
    mobileSettingsStore.enterSearchMode(() => {
      setSearchQuery("");
    });
  };

  const handleExitSearch = () => {
    mobileSettingsStore.exitSearchMode();
    setSearchQuery("");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    console.log("Searching for:", value);
  };

  const showRegularBack = !isHome || isSettingsSidebarOpen || isSearchSidebarOpen;
  const showBackButton = isMobileSettingsOpen ? showMobileBack : showRegularBack;

  const handleBack = useCallback(() => {
    if (isMobileSettingsOpen) {
      handleMobileBack();
    } else if (isSettingsSidebarOpen) {
      setSettingsSidebarOpen(false);
    } else if (isSearchSidebarOpen) {
      setSearchSidebarOpen(false);
    } else if (!isHome) {
      navigate(-1);
    }
  }, [
    isMobileSettingsOpen,
    isSettingsSidebarOpen,
    isSearchSidebarOpen,
    isHome,
    navigate,
    setSettingsSidebarOpen,
    setSearchSidebarOpen,
  ]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex justify-between items-center pt-2 sm:pt-4 px-2 sm:px-4 isolate",
        shouldHide && !isSettingsSidebarOpen && !isSearchSidebarOpen && !isMobileSettingsOpen
          ? "-translate-y-24 opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {isMobileSettingsOpen && isSearchMode ? (
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search settings..."
              className="w-full h-9 sm:h-10 rounded-full px-4 pr-8 bg-background border-border"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            onClick={handleExitSearch}
            className="w-9 h-9 sm:w-10 sm:h-10 p-0"
            variant="ghost"
            aria-label="Close search"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Button
                onClick={handleBack}
                className="w-9 h-9 sm:w-10 sm:h-10 p-0 transition-transform hover:scale-105 active:scale-95"
                aria-label={t.common.back}
                variant="ghost"
              >
                {isRtl ? (
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 rotate-180" />
                ) : (
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
            )}
            {isMobileSettingsOpen && mobileTitle && (
              <Container className="!w-auto !py-1 !px-3">
                <h2 className="text-sm font-semibold text-foreground">{mobileTitle}</h2>
              </Container>
            )}
            {!isMobileSettingsOpen && !showRegularBack && !isHome && (
              <Button
                onClick={() => navigate('/')}
                className="w-9 h-9 sm:w-10 sm:h-10 p-0"
                aria-label="Home"
                variant="ghost"
              >
                <Home className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {isMobileSettingsOpen ? (
              <>
                <Button
                  onClick={handleOpenSearch}
                  className="w-9 h-9 sm:w-10 sm:h-10 p-0"
                  variant="ghost"
                  aria-label="Search settings"
                >
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  onClick={handleMobileClose}
                  className="w-9 h-9 sm:w-10 sm:h-10 p-0"
                  variant="ghost"
                  aria-label="Close settings"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setSearchSidebarOpen(true)}
                  className="w-9 h-9 sm:w-10 sm:h-10 p-0"
                  variant="ghost"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  onClick={() => setSettingsSidebarOpen(true)}
                  className="w-9 h-9 sm:w-10 sm:h-10 p-0"
                  variant="ghost"
                  aria-label={t.nav.settings}
                >
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                {!user ? (
                  <Link
                    to="/Sign-In"
                    className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-[40px] bg-white dark:bg-black border-2 border-black dark:border-white text-primary hover:scale-102 hover:bg-black dark:hover:bg-white hover:border-white dark:hover:border-black hover:text-white dark:hover:text-black transition-all duration-200"
                  >
                    Sign In
                  </Link>
                ) : (
                  <Button
                    onClick={() => navigate('/profile')}
                    className="w-9 h-9 sm:w-10 sm:h-10 p-0 rounded-full overflow-hidden"
                    variant="ghost"
                    aria-label="Profile"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">{user.name?.[0]?.toUpperCase()}</span>
                      </div>
                    )}
                  </Button>
                )}
              </>
            )}
          </div>
        </>
      )}
    </header>
  );
});