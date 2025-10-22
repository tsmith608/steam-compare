'use client';
import { useEffect } from 'react';

export default function KoFiButton() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://storage.ko-fi.com/cdn/widget/Widget_2.js';
    script.async = true;
    script.onload = () => {
      if (window.kofiwidget2) {
        window.kofiwidget2.init('Buy me a Coffee', '#5480cc', 'F1F11N6SO4');
        window.kofiwidget2.draw();
      }
    };
    document.body.appendChild(script);
    return () => script.remove();
  }, []);

  return (
    <div
      id="kofi-container"
      className="fixed top-4 right-4 z-50 scale-90 sm:scale-100"
    />
  );
}
