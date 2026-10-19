import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-10 min-w-0 max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl text-center text-sm font-semibold leading-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "border border-white/20 bg-gradient-to-r from-sky-400 via-blue-600 to-blue-700 text-white shadow-[0_4px_16px_rgba(2,132,199,0.35)] hover:from-sky-300 hover:via-blue-500 hover:to-blue-600 hover:shadow-[0_6px_22px_rgba(2,132,199,0.5)] active:scale-[0.98]",
        secondary:
          "border border-border/80 bg-muted/60 text-foreground hover:bg-muted hover:border-border shadow-xs dark:bg-card/80 dark:border-white/10 dark:hover:bg-muted",
        outline:
          "border border-border/80 bg-card/60 text-foreground hover:border-primary/50 hover:bg-hover hover:text-foreground shadow-xs dark:bg-card/40 dark:border-white/10 dark:hover:border-primary/50",
        ghost:
          "text-muted-foreground hover:bg-hover hover:text-foreground",
        danger:
          "border border-rose-400/30 bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-[0_4px_14px_rgba(244,63,94,0.35)] hover:brightness-110",
        success:
          "border border-emerald-400/30 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)] hover:brightness-110",
      },
      size: {
        sm: "min-h-9 px-3 text-xs rounded-lg",
        md: "min-h-10 px-4",
        lg: "min-h-11 px-5 text-base sm:px-6 rounded-2xl",
        icon: "h-10 w-10 p-0 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
