import React from "react";
import { cn } from "@/lib/utils/cn";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "full";
}

export function Container({ className, size = "lg", children, ...props }: ContainerProps) {
  const sizeStyles = {
    sm: "max-w-4xl",
    md: "max-w-5xl",
    lg: "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizeStyles[size], className)} {...props}>
      {children}
    </div>
  );
}
