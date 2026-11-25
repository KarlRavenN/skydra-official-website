import React, { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none";

    const variantStyles = {
      primary: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover border border-border",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-border bg-transparent hover:bg-secondary text-foreground",
      ghost: "hover:bg-secondary text-foreground",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs tracking-wider uppercase",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-6 text-base uppercase tracking-wider font-bold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
