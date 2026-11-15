code = """
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex min-w-0 items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest leading-none transition-colors " +
  "!bg-transparent !border-transparent !p-0 !rounded-none !shadow-none !backdrop-blur-none",
  {
    variants: {
      variant: {
        default: "text-slate-600 dark:text-slate-400",
        secondary: "text-slate-600 dark:text-slate-400",
        outline: "text-slate-600 dark:text-slate-400",
        success: "text-emerald-600 dark:text-emerald-400",
        warning: "text-amber-600 dark:text-amber-400",
        danger: "text-rose-600 dark:text-rose-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
"""
with open('frontend/components/ui/badge.tsx', 'w', encoding='utf-8') as f:
    f.write(code.strip())
print("Success")
