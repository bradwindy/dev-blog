import { cn } from "@/lib/utils";
import { AlertCircle, Info, Lightbulb, AlertTriangle } from "lucide-react";

interface CalloutProps {
  type?: "info" | "warning" | "tip" | "danger";
  children: React.ReactNode;
}

const icons = {
  info: Info,
  warning: AlertTriangle,
  tip: Lightbulb,
  danger: AlertCircle,
};

const styles = {
  info: "border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100",
  warning:
    "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50 text-yellow-900 dark:text-yellow-100",
  tip: "border-green-500 bg-green-50 dark:bg-green-950/50 text-green-900 dark:text-green-100",
  danger:
    "border-red-500 bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-100",
};

export function Callout({ type = "info", children }: CalloutProps) {
  const Icon = icons[type];

  return (
    <div
      className={cn(
        "my-6 flex gap-3 rounded-lg border-l-4 p-4",
        styles[type]
      )}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="prose-p:my-0">{children}</div>
    </div>
  );
}
