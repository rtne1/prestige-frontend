import React, { useState } from "react";
import { cn } from "./Button";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, required, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="relative w-full mb-6">
        <input
          ref={ref}
          className={cn(
            "w-full h-14 bg-transparent border-b outline-none transition-colors duration-300 ease-luxury text-white text-base px-0 pt-4 pb-2 peer",
            error
              ? "border-crimson"
              : isFocused
              ? "border-crimson"
              : "border-[#333333]",
            className
          )}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          placeholder=" "
          required={required}
          {...props}
        />
        <label
          className={cn(
            "absolute left-0 transition-all duration-300 ease-luxury pointer-events-none uppercase tracking-widest",
            isFocused || props.value || props.defaultValue
              ? "-top-3 text-xs text-ash"
              : "top-4 text-sm text-ash",
            error && "text-crimson"
          )}
        >
          {label} {required && "*"}
        </label>
        {error && (
          <span className="absolute -bottom-5 left-0 text-xs text-crimson">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";