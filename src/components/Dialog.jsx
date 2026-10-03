"use client";
import { useEffect, useRef } from "react";
import { Icon } from "@/components/Icon";

/**
 * Modal built on the native <dialog> element: focus is trapped, Escape closes
 * and the page behind is inert, with no extra libraries.
 */
export default function Dialog({ title, description, onClose, children, footer, size = "md", labelledBy }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!el.open) el.showModal();
    const prev = document.activeElement;
    const onCancel = (e) => {
      e.preventDefault();
      onClose?.();
    };
    el.addEventListener("cancel", onCancel);
    return () => {
      el.removeEventListener("cancel", onCancel);
      if (el.open) el.close();
      prev?.focus?.();
    };
  }, [onClose]);

  const width = size === "lg" ? "max-w-2xl" : size === "sm" ? "max-w-sm" : "max-w-lg";

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy || "dialog-title"}
      onMouseDown={(e) => e.target === ref.current && onClose?.()}
      className={`m-auto w-[calc(100%-2rem)] ${width} rounded-xl border border-line-strong bg-surface-1 p-0 text-ink-1 shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm`}
    >
      <div className="flex max-h-[85vh] flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id={labelledBy || "dialog-title"} className="display text-xl">{title}</h2>
            {description && <p className="mt-1 text-sm text-ink-3">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="btn btn-quiet btn-sm -mr-2 !px-2" aria-label="Close">
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </dialog>
  );
}
