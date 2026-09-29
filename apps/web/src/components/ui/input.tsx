import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, hasError, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm",
        "placeholder:text-muted-foreground",
        "focus-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        hasError
          ? "border-destructive focus:ring-destructive"
          : "border-input",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };