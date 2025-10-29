"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ToastVariant = "default" | "success" | "destructive" | "warning";

export type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastContextValue = {
  showToast: (t: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const next: Toast = { id, variant: "default", durationMs: 3500, ...toast };
    setToasts((prev) => [...prev, next]);
    if (next.durationMs && next.durationMs > 0) {
      setTimeout(() => remove(id), next.durationMs);
    }
  }, [remove]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* viewport */}
      <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              "rounded-md border p-3 shadow bg-card text-foreground " +
              (t.variant === "success" ? " border-emerald-300" : "") +
              (t.variant === "destructive" ? " border-red-300" : "") +
              (t.variant === "warning" ? " border-amber-300" : "")
            }
          >
            {t.title && <div className="font-medium mb-0.5 heading-font">{t.title}</div>}
            {t.description && <div className="text-sm text-muted-foreground">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}


