import { useEffect, type ReactNode } from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  compact?: boolean;
}

export function Drawer({ open, onClose, children, title, compact }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2050] flex items-end sm:items-center sm:justify-center">
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Panel - bottom sheet on mobile, centered modal on larger screens; compact = one third height */}
      <div
        className={`relative z-10 w-full overflow-hidden rounded-t-3xl sm:rounded-3xl sm:max-w-md glass-dark animate-fade-slide-up flex flex-col ${compact ? "max-h-[33dvh]" : "max-h-[85vh]"}`}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Drawer"}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1 rounded-full bg-white/30" />
        </div>
        {title ? (
          <div className="px-6 pt-4 pb-4 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          </div>
        ) : null}
        <div className="flex-1 overflow-y-auto no-scrollbar">{children}</div>
      </div>
    </div>
  );
}
