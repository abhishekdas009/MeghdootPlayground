code = """
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex min-w-0 items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest leading-none text-slate-500 dark:text-slate-400 transition-colors",
  {
    variants: {
      variant: {
        default: "",
        secondary: "",
        outline: "",
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
  // Strip out any pill-style background/border classes passed via className
  let cleanClassName = className || "";
  if (typeof cleanClassName === "string") {
    cleanClassName = cleanClassName.replace(/bg-[a-zA-Z0-9-]+\/[0-9]+/g, "");
    cleanClassName = cleanClassName.replace(/border-[a-zA-Z0-9-]+\/[0-9]+/g, "");
    cleanClassName = cleanClassName.replace(/border-[a-zA-Z0-9-]+/g, "");
    cleanClassName = cleanClassName.replace(/rounded-[a-zA-Z0-9-]+/g, "");
    cleanClassName = cleanClassName.replace(/px-[a-zA-Z0-9-]+/g, "");
    cleanClassName = cleanClassName.replace(/py-[a-zA-Z0-9-]+/g, "");
    cleanClassName = cleanClassName.replace(/border/g, "");
    cleanClassName = cleanClassName.replace(/shadow-[a-zA-Z0-9-]+/g, "");
  }
  return <div className={cn(badgeVariants({ variant }), cleanClassName)} {...props} />;
}

export { Badge, badgeVariants };
"""
with open('frontend/components/ui/badge.tsx', 'w', encoding='utf-8') as f:
    f.write(code.strip())
print("Success")
