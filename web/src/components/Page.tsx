import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

type PageVariant = "default";

interface PageProps extends HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "main" | "article";
  variant?: PageVariant;
  children: ReactNode;
}

const variantStyles: Record<PageVariant, string> = {
  default: "min-h-dvh w-full bg-gradient-to-br from-dark-50 to-dark",
};

export const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ as: Component = "div", variant = "default", className = "", children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={`
          flex flex-col items-center
          justify-center relative overflow-hidden
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Page.displayName = "Page";
