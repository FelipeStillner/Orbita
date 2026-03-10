import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "default" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  rounded?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: "glass-medium hover:glass-strong glow-subtle",
  ghost: "bg-transparent hover:glass-light active:glass-medium",
};

const standardSizeStyles: Record<ButtonSize, string> = {
  sm: "px-2 py-1 text-sm rounded-xl",
  md: "px-4 py-2 text-base rounded-2xl",
  lg: "px-6 py-3 text-lg rounded-3xl",
};

const circleSizeStyles: Record<ButtonSize, string> = {
  sm: "w-10 h-10 text-sm rounded-full justify-center p-0",
  md: "w-12 h-12 text-base rounded-full justify-center p-0",
  lg: "w-14 h-14 text-lg rounded-full justify-center p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = "default",
    size = "md",
    rounded = true,
    className = "",
    children,
    ...props
  }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center
          font-medium text-white/80 hover:text-white
          transition-all duration-300 transition-ease-out 
          cursor-pointer active:scale-95
          hover-lift
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${rounded ? circleSizeStyles[size] : standardSizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";