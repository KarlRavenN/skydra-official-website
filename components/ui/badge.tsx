import React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "outline" | "live";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase transition-colors";

  const variantStyles = {
    default: "bg-secondary text-foreground border border-border",
    success: "bg-emerald-950 text-emerald-400 border border-emerald-800",
    warning: "bg-amber-950 text-amber-400 border border-amber-800",
    danger: "bg-rose-950 text-rose-400 border border-rose-800",
    outline: "border border-border text-muted-foreground",
    live: "bg-red-600 text-white animate-pulse shadow-sm",
  };

  return (
    <span className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      {children}
    </span>
  );
}
