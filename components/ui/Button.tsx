import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "prestige" | "ghost";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "prestige", isLoading, children, ...props }, ref) => {
    const baseStyles =
      "relative inline-flex items-center justify-center px-8 py-4 text-sm font-medium uppercase tracking-[0.08em] transition-all duration-300 ease-luxury disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      prestige:
        "bg-crimson text-white hover:bg-crimson-hover hover:shadow-[0_8px_24px_rgba(204,0,0,0.25)]",
      ghost:
        "bg-transparent text-white border border-glass hover:border-white",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 text-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        ) : null}
        <span className={cn(isLoading && "opacity-0")}>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";