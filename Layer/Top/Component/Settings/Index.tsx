// Component/Settings/Index.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/Middle/Context/App";
import { useAuth } from "@/Middle/Context/Auth";
import { useIsMobile } from "@/Middle/Hook/Use-Mobile";
import { toast } from "sonner";
import { Button } from "@/Top/Component/UI/Button";
import { Desktop } from "./Layout/Desktop";
import { Mobile } from "./Layout/Mobile";
import { AccountSection } from "./Content/Account/Index";
import { QuranSection } from "./Content/Quran/Index";
import { HadithSection } from "./Content/Hadith";  // ✅ Add this import
import { LanguageSection } from "./Content/Language";
import type { SettingsCategory, AccountSubcategory } from "./Types";

export function SettingsSidebar({ compact = false }: { compact?: boolean }) {
  const { isSettingsSidebarOpen, setSettingsSidebarOpen } = useApp();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [activeCategory, setActiveCategory] = useState<SettingsCategory>("account");
  const [activeSubcategory, setActiveSubcategory] = useState<AccountSubcategory>("profile");

  const handleClose = () => {
    setSettingsSidebarOpen(false);
    setActiveCategory("account");
    setActiveSubcategory("profile");
  };

  const handleCategoryChange = (category: SettingsCategory) => {
    setActiveCategory(category);
    if (category !== "account") {
      setActiveSubcategory(null as any);
    }
  };

  const renderContent = () => {
    switch (activeCategory) {
      case "account": {
        if (!user) {
          return (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Please sign in to view account settings.</p>
              <Button onClick={() => navigate("/Sign-In")} className="mt-4">
                Sign In
              </Button>
            </div>
          );
        }
        
        const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";
        const initials = displayName.slice(0, 2).toUpperCase();
        const handleSignOut = async () => {
          await signOut();
          toast.success("Signed out successfully");
          setSettingsSidebarOpen(false);
        };
        
        return (
          <AccountSection
            user={user}
            displayName={displayName}
            initials={initials}
            handleSignOut={handleSignOut}
            navigate={navigate}
            setSettingsSidebarOpen={setSettingsSidebarOpen}
            activeSubcategory={activeSubcategory}
          />
        );
      }
      case "quran":
        return <QuranSection />;
      case "hadith":  // ✅ Add this case
        return <HadithSection />;
      case "language":
        return <LanguageSection onSelect={() => {}} />;
      default:
        return null;
    }
  };

  if (!isSettingsSidebarOpen) return null;

  if (isMobile) {
    return (
      <Mobile
        activeCategory={activeCategory}
        activeSubcategory={activeSubcategory}
        onCategoryChange={handleCategoryChange}
        onSubcategoryChange={setActiveSubcategory}
        onClose={handleClose}
      >
        {renderContent()}
      </Mobile>
    );
  }

  return (
    <Desktop
      activeCategory={activeCategory}
      activeSubcategory={activeSubcategory}
      onCategoryChange={handleCategoryChange}
      onSubcategoryChange={setActiveSubcategory}
    >
      {renderContent()}
    </Desktop>
  );
}