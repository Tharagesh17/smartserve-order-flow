import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Package,
  CreditCard,
  DollarSign
} from "lucide-react";

interface StatusBadgeProps {
  status: string;
  type: "order" | "payment" | "kitchen";
  size?: "sm" | "md";
  className?: string;
}

const statusConfig = {
  order: {
    received: {
      label: "Received",
      icon: Package,
      className: "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-[hsl(var(--success))]/30"
    },
    preparing: {
      label: "Preparing",
      icon: Clock,
      className: "bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/30"
    },
    ready: {
      label: "Ready",
      icon: CheckCircle,
      className: "bg-[hsl(var(--secondary))]/20 text-foreground border-[hsl(var(--secondary))]/40"
    },
    completed: {
      label: "Completed",
      icon: CheckCircle,
      className: "bg-muted text-foreground border-muted-foreground/20"
    },
    cancelled: {
      label: "Cancelled",
      icon: XCircle,
      className: "bg-destructive/15 text-destructive border-destructive/30"
    }
  },
  payment: {
    pending: {
      label: "Pending",
      icon: Clock,
      className: "bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/30"
    },
    paid: {
      label: "Paid",
      icon: CheckCircle,
      className: "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-[hsl(var(--success))]/30"
    },
    failed: {
      label: "Failed",
      icon: XCircle,
      className: "bg-destructive/15 text-destructive border-destructive/30"
    },
    refunded: {
      label: "Refunded",
      icon: AlertCircle,
      className: "bg-muted text-foreground border-muted-foreground/20"
    }
  },
  kitchen: {
    new: {
      label: "New Order",
      icon: Package,
      className: "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-[hsl(var(--success))]/30"
    },
    in_progress: {
      label: "In Progress",
      icon: Clock,
      className: "bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/30"
    },
    ready: {
      label: "Ready",
      icon: CheckCircle,
      className: "bg-[hsl(var(--secondary))]/20 text-foreground border-[hsl(var(--secondary))]/40"
    },
    completed: {
      label: "Completed",
      icon: CheckCircle,
      className: "bg-muted text-foreground border-muted-foreground/20"
    }
  }
};

export function StatusBadge({ status, type, size = "md", className }: StatusBadgeProps) {
  const config = statusConfig[type][status as keyof typeof statusConfig[typeof type]] || {
    label: status,
    icon: AlertCircle,
    className: "bg-muted text-foreground border-muted-foreground/20"
  };

  const Icon = config.icon;
  const sizeClasses = size === "sm" ? "text-xs px-2 py-1" : "text-sm px-3 py-1";

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "flex items-center gap-1.5 border font-medium",
        sizeClasses,
        config.className,
        className
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      {config.label}
    </Badge>
  );
}
