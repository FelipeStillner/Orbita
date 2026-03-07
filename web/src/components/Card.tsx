import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

type CardVariant = "default";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: "glass-medium",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-3xl p-6
          ${variantStyles[variant]}
          glow-subtle
          transition-all duration-300 transition-ease-out
          hover-lift
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
