import { useState, useEffect } from "react";
import { ScrollArea } from "@/Top/Component/UI/Scroll-Area";
import { Button } from "@/Top/Component/UI/Button";
import { Container } from "@/Top/Component/UI/Container";
import { ChevronRight } from "lucide-react";
import { SETTINGS_CATEGORIES, getSubcategories } from "../Constants";
import type { SettingsCategory, AccountSubcategory, AidSubcategory } from "../Types";

type SubcategoryId = AccountSubcategory | AidSubcategory;

interface MobileProps {
  activeCategory: SettingsCategory;
  activeSubcategory: SubcategoryId | null;
  onCategoryChange: (category: SettingsCategory) => void;
  onSubcategoryChange: (subcategory: SubcategoryId) => void;
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
  const [view, setView] = useState<"categories" | "subcategories" | "content">("categories");
  const [selectedCategory, setSelectedCategory] = useState<SettingsCategory | null>(null);

  // Notify parent of header changes (handled by parent)
  useEffect(() => {
    // This effect can be used to sync with parent if needed
  }, [view, selectedCategory, activeCategory, activeSubcategory]);

  const handleCategorySelect = (category: SettingsCategory) => {
    const catConfig = SETTINGS_CATEGORIES.find(c => c.id === category);
    if (catConfig?.hasSubcategories) {
      setSelectedCategory(category);
      setView("subcategories");
    } else {
      onCategoryChange(category);
      onSubcategoryChange(null as any);
      setView("content");
    }
  };

  const handleSubcategorySelect = (subcategory: SubcategoryId) => {
    if (selectedCategory) {
      onCategoryChange(selectedCategory);
      onSubcategoryChange(subcategory);
      setView("content");
    }
  };

  const handleBack = () => {
    if (view === "content") {
      const catConfig = SETTINGS_CATEGORIES.find(c => c.id === activeCategory);
      if (catConfig?.hasSubcategories) {
        setView("subcategories");
      } else {
        setView("categories");
        setSelectedCategory(null);
      }
    } else if (view === "subcategories") {
      setView("categories");
      setSelectedCategory(null);
    } else if (view === "categories") {
      onClose();
    }
  };

  // Categories view
  if (view === "categories") {
    return (
      <div className="fixed inset-0 z-40 bg-background">
        <ScrollArea className="h-full">
          <div className="pt-[60px]">
            <div className="p-4">
              <div className="space-y-2">
                {SETTINGS_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Container key={cat.id} className="!p-0 overflow-hidden group">
                      <Button
                        onClick={() => handleCategorySelect(cat.id)}
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
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Subcategories view
  if (view === "subcategories" && selectedCategory) {
    const subcategories = getSubcategories(selectedCategory);
    return (
      <div className="fixed inset-0 z-40 bg-background">
        <ScrollArea className="h-full">
          <div className="pt-[60px]">
            <div className="p-4">
              <div className="space-y-2">
                {subcategories.map((sub) => (
                  <Container key={sub.id} className="!p-0 overflow-hidden group">
                    <Button
                      onClick={() => handleSubcategorySelect(sub.id as any)}
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
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Content view
  return (
    <div className="fixed inset-0 z-40 bg-background">
      <ScrollArea className="h-full">
        <div className="pt-[60px]">
          <div className="p-4">
            {children}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}