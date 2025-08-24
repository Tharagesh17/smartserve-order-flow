import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "secondary" | "subtle";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12"
};

const variantClasses = {
  default: "text-primary",
  primary: "text-primary",
  secondary: "text-success",
  subtle: "text-secondary"
};

export function LoadingSpinner({ 
  size = "md", 
  variant = "default",
  className 
}: LoadingSpinnerProps) {
  return (
    <Loader2 
      className={cn(
        "animate-spin",
        sizeClasses[size],
        variantClasses[variant],
        className
      )} 
    />
  );
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-1", className)}>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
    </div>
  );
}

export function LoadingPulse({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-current rounded", className)} />
  );
}
