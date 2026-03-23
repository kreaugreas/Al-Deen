import { ArrowLeft } from "lucide-react";
import { cn } from "@/Middle/Library/utils";

interface PanelHeaderProps {
  title: string;
  icon?: React.ReactNode;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onClose: () => void;
  className?: string;
}

export function PanelHeader({ title, icon, onClose, className }: PanelHeaderProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/50 flex-shrink-0",
      className
    )}>
      <button onClick={onClose} className="glass-icon-btn w-7 h-7" title="Back">
        <ArrowLeft className="h-3.5 w-3.5" />
      </button>
      {icon}
      <span className="text-sm font-semibold text-foreground">{title}</span>
    </div>
  );
}
