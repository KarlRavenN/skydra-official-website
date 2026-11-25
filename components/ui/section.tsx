import React from "react";
import { cn } from "@/lib/utils/cn";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "sm" | "md" | "lg";
}

export function Section({ className, spacing = "md", children, ...props }: SectionProps) {
  const spacingStyles = {
    sm: "py-8 md:py-12",
    md: "py-12 md:py-20",
    lg: "py-16 md:py-28",
  };

  return (
    <section className={cn(spacingStyles[spacing], className)} {...props}>
      {children}
    </section>
  );
}
