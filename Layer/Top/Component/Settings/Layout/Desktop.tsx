// Component/Settings/Layout/Desktop.tsx
import { ScrollArea } from "@/Top/Component/UI/Scroll-Area";
import { Button } from "@/Top/Component/UI/Button";
import { Container } from "@/Top/Component/UI/Container";
import { cn } from "@/Middle/Library/utils";
import { SETTINGS_CATEGORIES, ACCOUNT_SUBCATEGORIES } from "../Constants";
import type { SettingsCategory, AccountSubcategory } from "../Types";

interface DesktopProps {
  activeCategory: SettingsCategory;
  activeSubcategory: AccountSubcategory | null;
  onCategoryChange: (category: SettingsCategory) => void;
  onSubcategoryChange: (subcategory: AccountSubcategory) => void;
  children: React.ReactNode;
}

export function Desktop({ 
  activeCategory, 
  activeSubcategory, 
  onCategoryChange, 
  onSubcategoryChange, 
  children 
}: DesktopProps) {
  return (
    <div className="fixed inset-0 z-40 bg-background pt-[72px] pb-6">
      <div className="h-full flex">
        {/* Sidebar */}
        <div className="shrink-0 w-64 h-full flex flex-col pt-6 pl-6 pb-6">
          <div className="glass-sidebar flex-1 p-2 flex flex-col">
            <div className="space-y-2 flex-1 py-4">
              {SETTINGS_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                const isAccount = cat.id === "account";
                
                return (
                  <div key={cat.id}>
                    {/* Main Category Button with Container */}
                    <Container
                      className={cn(
                        "!p-0 overflow-hidden transition-all group",
                        isActive && "border-primary/50 bg-primary/5"
                      )}
                    >
                      <Button
                        onClick={() => {
                          onCategoryChange(cat.id);
                          if (cat.id === "account") {
                            onSubcategoryChange("profile");
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
                    
                    {/* Subcategories - only show when Account is active */}
                    {isAccount && isActive && (
                      <div className="mt-2 space-y-2">
                        {ACCOUNT_SUBCATEGORIES.map((sub) => {
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
                                onClick={() => onSubcategoryChange(sub.id)}
                                className={cn(
                                  "w-full flex items-center gap-2.5 h-auto py-2 px-3",
                                  isActiveSub && "bg-black dark:bg-white text-white dark:text-black"
                                )}
                                fullWidth
                              >
                                {sub.icon}
                                <span className="text-sm font-medium">
                                  {sub.label}
                                </span>
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

        {/* Content */}
        <ScrollArea className="flex-1 h-full">
          <div className="p-6 max-w-2xl text-left">
            {children}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}