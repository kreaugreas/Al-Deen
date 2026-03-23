import { memo } from "react";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface NavCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
}

export const NavCard = memo(function NavCard({ title, description, icon: Icon, to }: NavCardProps) {
  return (
    <Link to={to} className="block">
      <div className="glass-card group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
        <div className="glass-content flex flex-col items-center text-center p-4 md:p-6">
          <div className="glass-icon-btn w-14 h-14 md:w-16 md:h-16 mb-4 group-hover:scale-110 transition-transform">
            <Icon className="h-6 w-6 md:h-7 md:w-7 text-primary" strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold text-base md:text-lg mb-1 text-foreground">
            {title}
          </h3>
          <p className="text-muted-foreground text-xs md:text-sm leading-relaxed hidden sm:block">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
});
