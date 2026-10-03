"use client";
import { useState } from "react";
import { Icon } from "@/components/Icon";

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export default function CopyButton({ text, label = "Copy", done = "Copied", className = "btn btn-ghost btn-sm", onCopied, icon = "copy" }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        if (await copyText(typeof text === "function" ? text() : text)) {
          setCopied(true);
          onCopied?.();
          setTimeout(() => setCopied(false), 1800);
        }
      }}
    >
      <Icon name={copied ? "check" : icon} className="h-4 w-4" />
      <span aria-live="polite">{copied ? done : label}</span>
    </button>
  );
}
