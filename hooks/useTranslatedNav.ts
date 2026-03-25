"use client";

import { useContext } from "react";
import { LanguageContext } from "@/context/LanguageContext";

export function useTranslatedNav() {
  const { t } = useContext(LanguageContext);
  // Instant sync translations for nav
  const home = t("Accueil");
  const carto = t("Cartographie");
  const doleance = t("Doléances");
  const indicateur = t("Indicateurs");

  return [
    { label: home, href: "/" },
    { label: carto, href: "/cartographie" },
    { label: indicateur, href: "/indicateur" },
  ];

}
