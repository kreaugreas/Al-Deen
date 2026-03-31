import { cn } from "@/Middle/Library/utils";
import { ReactNode, ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
  active?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "secondary",
      size = "md",
      className,
      active,
      fullWidth,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "relative rounded-[40px] bg-white dark:bg-black border-2 border-black dark:border-white transition-all duration-200",
          "inline-flex items-center justify-center gap-2",
          sizeClasses[size],
          fullWidth && "w-full",
          variant === "primary" && "text-primary",
          "hover:scale-102 hover:bg-black dark:hover:bg-white hover:border-white dark:hover:border-black",
          "hover:text-white dark:hover:text-black",
          active && "bg-black dark:bg-white text-white dark:text-black border-white dark:border-black",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";