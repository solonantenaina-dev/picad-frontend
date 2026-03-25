"use client";

import { useEffect } from 'react';

export function GoogleTranslateWidget() {
  useEffect(() => {
    // Load Google Translate script
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);

    // Global callback for widget - declare as any to avoid TS error
    (window as any).googleTranslateElementInit = () => {
      if ((window as any).google && (window as any).google.translate) {
        new (window as any).google.translate.TranslateElement({
          pageLanguage: 'fr',
          includedLanguages: 'fr,en,es',
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');
      }
    };

    // Cleanup
    return () => {
      const existing = document.getElementById('google_translate_element');
      if (existing) existing.remove();
      delete (window as any).googleTranslateElementInit;
      const scripts = document.querySelectorAll('script[src*=\"translate.google.com\"]');
      scripts.forEach(s => s.remove());
    };
  }, []);

  return (
    <div id="google_translate_element" className="scale-75 origin-center inline-block" />
  );
}

