import { AlignJustify, BookOpen } from "lucide-react";
import { Button } from "@/Top/Component/UI/Button";
import { Container } from "@/Top/Component/UI/Container";
import { cn } from "@/Middle/Library/utils";

interface LayoutProps {
  layout: "ayah" | "page";
  onLayoutChange: (layout: "ayah" | "page") => void;
}

export function Layout({ layout, onLayoutChange }: LayoutProps) {
  const options = [
    { id: "ayah" as const, label: "Ayah", icon: <AlignJustify className="h-3.5 w-3.5" /> },
    { id: "page" as const, label: "Page", icon: <BookOpen className="h-3.5 w-3.5" /> },
  ];

  return (
    <Container className="!py-2.5 !px-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlignJustify className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm text-foreground group-hover:text-white dark:group-hover:text-black">Layout</h3>
      </div>
      <div className="flex items-center gap-1">
        {options.map((opt) => (
          <Button
            key={opt.id}
            onClick={() => onLayoutChange(opt.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 h-auto text-xs font-medium",
              layout === opt.id
                ? "bg-primary text-primary-foreground"
                : ""
            )}
          >
            {opt.icon}
            {opt.label}
          </Button>
        ))}
      </div>
    </Container>
  );
}