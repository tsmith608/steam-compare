import React from 'react';

export default function KofiButton() {
  return (
    <a
      href="https://ko-fi.com/F1F11N6SO4"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-black text-white px-3 py-2 rounded-full shadow-lg font-medium hover:scale-105 transition-transform border border-white/10"
      style={{ fontFamily: "'Nunito', sans-serif" }} // Ko-fi uses Nunito usually, but system font is fine
    >
      <img
        src="https://storage.ko-fi.com/cdn/cup-border.png"
        alt="Ko-fi"
        className="h-4 w-auto animate-[wiggle_2s_linear_infinite]"
      />
      <span className="text-sm">Support me on Ko-fi</span>
    </a>
  );
}
