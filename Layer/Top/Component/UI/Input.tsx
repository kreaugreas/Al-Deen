import * as React from "react";
import { cn } from "@/Middle/Library/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "relative rounded-[40px] bg-white dark:bg-black border-2 border-black dark:border-white transition-all duration-200",
          "flex w-full px-4 py-2 text-base",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "hover:border-primary focus:border-primary",
          "hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black",
          "group-hover:text-white dark:group-hover:text-black",
          "md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };