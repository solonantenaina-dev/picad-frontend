"use client";

import { useEffect } from "react";

export default function GoogleTranslate() {
  useEffect(() => {
    const addScript = () => {
      const script = document.createElement("script");
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    };

    window.googleTranslateElementInit = () => {
      const g = window.google;
      const TranslateElement = g?.translate?.TranslateElement;
      if (!TranslateElement) return;
      new TranslateElement(
        {
          pageLanguage: "fr",
          autoDisplay: false,
          includedLanguages: "fr,en,es",
          layout: TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element",
      );
    };

    addScript();
  }, []);

  return <div id="google_translate_element" className="scale-75" />;
}

