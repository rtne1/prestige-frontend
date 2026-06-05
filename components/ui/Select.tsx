import React, { useState } from "react";
import { cn } from "./Button";

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, required, value, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="relative w-full mb-6">
        <select
          ref={ref}
          value={value}
          className={cn(
            "w-full h-14 bg-transparent border-b outline-none transition-colors duration-300 ease-luxury text-white text-base px-0 pt-4 pb-2 appearance-none cursor-pointer peer",
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
          required={required}
          {...props}
        >
          <option value="" disabled className="bg-carbon text-ash">
            Select an option
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-carbon text-white py-2">
              {opt.label}
            </option>
          ))}
        </select>
        
        {/* Custom Dropdown Arrow */}
        <div className="absolute right-0 top-6 pointer-events-none text-ash">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>

        <label
          className={cn(
            "absolute left-0 transition-all duration-300 ease-luxury pointer-events-none uppercase tracking-widest",
            isFocused || value
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

Select.displayName = "Select";