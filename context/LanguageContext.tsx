"use client";




import { createContext, useState, useCallback, useEffect, ReactNode } from "react";

interface LanguageContextType {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string) => string;
  translateText: (text: string) => Promise<string>;
}

export const LanguageContext = createContext<LanguageContextType>({
  lang: "fr",
  setLang: () => {},
  t: (key: string) => key,
  translateText: async (text) => text,
});

interface Props {
  children: ReactNode;
}

// Static translations - instant lookup
import { translations } from "@/lib/translations";

const staticTranslations = translations;

// Cache for dynamic translations
const cache: Record<string, string> = {};

export function LanguageProvider({ children }: Props) {
  const [lang, setLang] = useState("fr");

  const t = useCallback((key: string) => {
    return staticTranslations[lang]?.[key] || key;
  }, [lang]);

  // Persistent cache with localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`translation-cache-${lang}`);
    if (saved) {
      Object.assign(cache, JSON.parse(saved));
    }
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(`translation-cache-${lang}`, JSON.stringify(cache));
  }, [Object.values(cache), lang]);

  const translateText = useCallback(async (text: string) => {
    if (lang === "fr") return text;

    // Check static first
    const staticTrans = staticTranslations[lang]?.[text];
    if (staticTrans) return staticTrans;

    const key = `${text}-${lang}`;
    if (cache[key]) return cache[key];

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, target: lang }),
      });

      const data = await res.json();
      const translated = data.translatedText || text;
      cache[key] = translated;

      return translated;
    } catch (err) {
      console.error("Erreur traduction :", err);
      return text;
    }
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, translateText }}>
      {children}
    </LanguageContext.Provider>
  );
}
