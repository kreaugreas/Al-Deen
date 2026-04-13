import { ScrollArea } from "@/Top/Component/UI/Scroll-Area";
import { Button } from "@/Top/Component/UI/Button";
import { Container } from "@/Top/Component/UI/Container";
import { cn } from "@/Middle/Library/utils";
import { SETTINGS_CATEGORIES, getSubcategories } from "../Constants";
import type { SettingsCategory, AccountSubcategory, AidSubcategory } from "../Types";

type SubcategoryId = AccountSubcategory | AidSubcategory;

interface DesktopProps {
  activeCategory: SettingsCategory;
  activeSubcategory: SubcategoryId | null;
  onCategoryChange: (category: SettingsCategory) => void;
  onSubcategoryChange: (subcategory: SubcategoryId) => void;
  children: React.ReactNode;
}

export function Desktop({ 
  activeCategory, 
  activeSubcategory, 
  onCategoryChange, 
  onSubcategoryChange, 
  children 
}: DesktopProps) {
  const subcategories = getSubcategories(activeCategory);

  return (
    <div className="fixed inset-0 z-40 bg-background">
      <div className="h-full flex">
        {/* Sidebar */}
        <div className="shrink-0 w-64 h-full flex flex-col pt-10 pl-6 pb-6">
          <div className="flex-1 p-2 flex flex-col">
            <div className="space-y-2 flex-1 py-4">
              {SETTINGS_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                const hasSubs = cat.hasSubcategories;
                
                return (
                  <div key={cat.id}>
                    <Container
                      className={cn(
                        "!p-0 overflow-hidden transition-all group",
                        isActive && "border-primary/50 bg-primary/5"
                      )}
                    >
                      <Button
                        onClick={() => {
                          onCategoryChange(cat.id);
                          if (hasSubs) {
                            const firstSub = getSubcategories(cat.id)[0];
                            if (firstSub) onSubcategoryChange(firstSub.id as any);
                          }
                        }}
                        className={cn(
                          "w-full flex items-center gap-2.5 h-auto px-3 py-2.5",
                          isActive && "bg-black dark:bg-white text-white dark:text-black"
                        )}
                        fullWidth
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="text-sm font-medium">{cat.label}</span>
                      </Button>
                    </Container>
                    
                    {hasSubs && isActive && subcategories.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {subcategories.map((sub) => {
                          const isActiveSub = activeSubcategory === sub.id;
                          return (
                            <Container
                              key={sub.id}
                              className={cn(
                                "!p-0 overflow-hidden transition-all group ml-6",
                                isActiveSub && "border-primary/50 bg-primary/5"
                              )}
                            >
                              <Button
                                onClick={() => onSubcategoryChange(sub.id as any)}
                                className={cn(
                                  "w-full flex items-center gap-2.5 h-auto py-2 px-3",
                                  isActiveSub && "bg-black dark:bg-white text-white dark:text-black"
                                )}
                                fullWidth
                              >
                                {sub.icon}
                                <span className="text-sm font-medium">{sub.label}</span>
                              </Button>
                            </Container>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content area */}
        <ScrollArea className="flex-1 h-full">
          <div className="pt-10">
            <div className="p-6 max-w-2xl text-left">
              {children}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}