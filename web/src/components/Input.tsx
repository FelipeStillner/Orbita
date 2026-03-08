import { forwardRef, type InputHTMLAttributes } from "react";

type InputSize = "sm" | "md" | "lg";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  size2?: InputSize;
}

const sizeStyles = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-base",
  lg: "px-5 py-3.5 text-lg",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size2 = "md", className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full min-w-0
          text-white placeholder-white/40 rounded-full
          transition-all duration-300 transition-ease-out
          focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
          glass-medium hover:glass-strong focus:glass-strong
          ${sizeStyles[size2]}
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
