import type { HTMLAttributes, ReactNode } from "react";

type TextVariant = "h1" | "h2" | "h3" | "body" | "body-sm" | "caption" | "label";

interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "label";
  variant?: TextVariant;
  muted?: boolean;
  children: ReactNode;
}

const variantStyles: Record<TextVariant, string> = {
  h1: "text-4xl md:text-5xl font-bold tracking-tight",
  h2: "text-2xl md:text-3xl font-bold",
  h3: "text-xl md:text-2xl font-semibold",
  body: "text-base",
  "body-sm": "text-sm",
  caption: "text-xs",
  label: "text-sm font-medium",
};

const variantElements: Record<TextVariant, TextProps["as"]> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  body: "p",
  "body-sm": "p",
  caption: "span",
  label: "label",
};

export function Text({
  as,
  variant = "body",
  muted = false,
  className = "",
  children,
  ...props
}: TextProps) {
  const Component = as || variantElements[variant] || "p";

  return (
    <Component
      className={`
        text-white
        ${variantStyles[variant]}
        ${muted ? "opacity-70" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
}
