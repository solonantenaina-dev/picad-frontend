"use client";

import { useTranslate } from "@/hooks/useTranslate";
import { useContext } from "react";
import { LanguageContext } from "@/context/LanguageContext";

interface Props {
  text: string;
  className?: string;
}

export function TranslatedText({ text, className = "" }: Props) {
  const { lang } = useContext(LanguageContext);
  const { translated, loading } = useTranslate(text);

  if (lang === "fr") {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {loading ? "..." : translated}
    </span>
  );
}
