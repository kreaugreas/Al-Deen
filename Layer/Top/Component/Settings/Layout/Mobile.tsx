// Component/Settings/Layout/Mobile.tsx
import { useState } from "react";
import { ScrollArea } from "@/Top/Component/UI/Scroll-Area";
import { Button } from "@/Top/Component/UI/Button";
import { Container } from "@/Top/Component/UI/Container";
import { ChevronRight, ArrowLeft, X } from "lucide-react";
import { SETTINGS_CATEGORIES, ACCOUNT_SUBCATEGORIES } from "../Constants";
import type { SettingsCategory, AccountSubcategory } from "../Types";

interface MobileProps {
  activeCategory: SettingsCategory;
  activeSubcategory: AccountSubcategory | null;
  onCategoryChange: (category: SettingsCategory) => void;
  onSubcategoryChange: (subcategory: AccountSubcategory) => void;
  onClose: () => void;
  children: React.ReactNode;
}

export function Mobile({ 
  activeCategory, 
  activeSubcategory, 
  onCategoryChange, 
  onSubcategoryChange, 
  onClose, 
  children 
}: MobileProps) {
  const [showCategories, setShowCategories] = useState(true);
  const [showSubcategories, setShowSubcategories] = useState(false);

  // If showing categories menu
  if (showCategories) {
    return (
      <div className="fixed inset-0 z-40 bg-background pt-[60px]">
        <ScrollArea className="h-full">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <Container className="!w-auto !py-1 !px-3">
                <h2 className="text-sm font-semibold text-foreground">Settings</h2>
              </Container>
              <Button onClick={onClose} size="sm" className="w-8 h-8 p-0 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {SETTINGS_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isAccount = cat.id === "account";
                return (
                  <Container key={cat.id} className="!p-0 overflow-hidden group">
                    <Button
                      onClick={() => {
                        if (isAccount) {
                          setShowCategories(false);
                          setShowSubcategories(true);
                        } else {
                          onCategoryChange(cat.id);
                          setShowCategories(false);
                        }
                      }}
                      className="w-full flex items-center justify-between gap-3 h-auto py-4 px-4"
                      fullWidth
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{cat.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Container>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // If showing account subcategories
  if (showSubcategories) {
    return (
      <div className="fixed inset-0 z-40 bg-background pt-[60px]">
        <ScrollArea className="h-full">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => {
                    setShowCategories(true);
                    setShowSubcategories(false);
                  }}
                  size="sm"
                  className="w-8 h-8 p-0 rounded-full"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Container className="!w-auto !py-1 !px-3">
                  <h2 className="text-sm font-semibold text-foreground">Account</h2>
                </Container>
              </div>
              <Button onClick={onClose} size="sm" className="w-8 h-8 p-0 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {ACCOUNT_SUBCATEGORIES.map((sub) => (
                <Container key={sub.id} className="!p-0 overflow-hidden group">
                  <Button
                    onClick={() => {
                      onCategoryChange("account");
                      onSubcategoryChange(sub.id);
                      setShowCategories(false);
                      setShowSubcategories(false);
                    }}
                    className="w-full flex items-center justify-between gap-3 h-auto py-4 px-4"
                    fullWidth
                  >
                    <div className="flex items-center gap-3">
                      {sub.icon}
                      <span className="text-sm font-medium">{sub.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Container>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Showing content
  return (
    <div className="fixed inset-0 z-40 bg-background pt-[60px]">
      <ScrollArea className="h-full">
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setShowCategories(true);
                  setShowSubcategories(false);
                }}
                size="sm"
                className="w-8 h-8 p-0 rounded-full"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Container className="!w-auto !py-1 !px-3">
                <h2 className="text-sm font-semibold text-foreground">
                  {activeCategory === "account" 
                    ? ACCOUNT_SUBCATEGORIES.find(s => s.id === activeSubcategory)?.label 
                    : SETTINGS_CATEGORIES.find(c => c.id === activeCategory)?.label}
                </h2>
              </Container>
            </div>
            <Button onClick={onClose} size="sm" className="w-8 h-8 p-0 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}