import * as React from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Card                                    */
/* -------------------------------------------------------------------------- */

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  interactive?: boolean;
}

const Card = React.forwardRef<HTMLElement, CardProps>(
  ({ className, as: Component = "div", interactive = false, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        "app-card min-w-0 rounded-[18px] border border-border/70 bg-card/65 text-foreground shadow-none backdrop-blur-xl",
        "transition-[transform,box-shadow,border-color] duration-250 ease-in-out",
        interactive && [
          "cursor-pointer hover:-translate-y-0.5 hover:border-primary/30",
          "focus-within:ring-2 focus-within:ring-primary/50 focus-within:outline-none"
        ],
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

/* -------------------------------------------------------------------------- */
/* CardHeader                                 */
/* -------------------------------------------------------------------------- */

export interface CardHeaderProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

const CardHeader = React.forwardRef<HTMLElement, CardHeaderProps>(
  ({ className, as: Component = "div", ...props }, ref) => (
    <Component 
      ref={ref} 
      className={cn("flex min-w-0 flex-col space-y-1.5 p-4 sm:p-5 lg:p-6", className)} 
      {...props} 
    />
  )
);
CardHeader.displayName = "CardHeader";

/* -------------------------------------------------------------------------- */
/* CardTitle                                 */
/* -------------------------------------------------------------------------- */

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: React.ElementType;
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = "h3", ...props }, ref) => (
    <Component 
      ref={ref} 
      className={cn("text-[clamp(1rem,1.2vw,1.125rem)] font-semibold leading-tight tracking-tight text-foreground", className)} 
      {...props} 
    />
  )
);
CardTitle.displayName = "CardTitle";

/* -------------------------------------------------------------------------- */
/* CardDescription                              */
/* -------------------------------------------------------------------------- */

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  as?: React.ElementType;
}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, as: Component = "p", ...props }, ref) => (
    <Component 
      ref={ref} 
      className={cn("text-sm leading-relaxed text-muted-foreground", className)} 
      {...props} 
    />
  )
);
CardDescription.displayName = "CardDescription";

/* -------------------------------------------------------------------------- */
/* CardContent                                */
/* -------------------------------------------------------------------------- */

export interface CardContentProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

const CardContent = React.forwardRef<HTMLElement, CardContentProps>(
  ({ className, as: Component = "div", ...props }, ref) => (
    <Component 
      ref={ref} 
      className={cn("min-w-0 p-4 pt-0 sm:p-5 sm:pt-0 lg:p-6 lg:pt-0", className)} 
      {...props} 
    />
  )
);
CardContent.displayName = "CardContent";

/* -------------------------------------------------------------------------- */
/* CardFooter                                 */
/* -------------------------------------------------------------------------- */

export interface CardFooterProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

const CardFooter = React.forwardRef<HTMLElement, CardFooterProps>(
  ({ className, as: Component = "div", ...props }, ref) => (
    <Component 
      ref={ref} 
      className={cn("flex min-w-0 items-center p-4 pt-0 sm:p-5 sm:pt-0 lg:p-6 lg:pt-0", className)} 
      {...props} 
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
