import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, error, label, helperText, id, options, children, ...props },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${selectId}-error` : undefined}
            className={cn(
              "flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-9 text-sm text-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
              error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive",
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        {helperText && !error && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
        {error && (
          <p id={`${selectId}-error`} className="text-xs font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
