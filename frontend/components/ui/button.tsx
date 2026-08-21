import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-10 min-w-0 max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl text-center text-sm font-semibold leading-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-50 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "border border-blue-300/25 bg-gradient-to-br from-[#3d88ff] to-[#5a5df4] text-primary-foreground shadow-[0_10px_22px_-12px_rgba(69,132,255,0.9)] hover:brightness-110 hover:shadow-[0_12px_26px_-12px_rgba(69,132,255,1)]",
        secondary: "border border-indigo-300/20 bg-secondary/80 text-secondary-foreground hover:bg-secondary",
        outline: "border border-border/70 bg-card/45 text-foreground hover:border-primary/40 hover:bg-hover/70",
        ghost: "text-foreground hover:bg-hover/70",
        danger: "bg-danger text-white hover:bg-danger/90",
        success: "bg-success text-white hover:bg-success/90",
      },
      size: {
        sm: "min-h-9 px-3 text-xs",
        md: "min-h-10 px-4",
        lg: "min-h-11 px-5 text-base sm:px-6",
        icon: "h-11 w-11 p-0",
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
