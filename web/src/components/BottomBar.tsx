import type { ReactNode } from "react";

interface BottomBarProps {
  children: ReactNode;
}

export function BottomBar({ children }: BottomBarProps) {
  return (
    <nav
      className="fixed z-40 flex items-center justify-around h-[72px] px-4 rounded-2xl glass-dark border border-white/10 shadow-lg left-4 right-4"
      style={{
        bottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      {children}
    </nav>
  );
}
