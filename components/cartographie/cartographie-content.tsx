"use client";

import { useMemo, useState, useCallback } from "react";
import LayersPanel, { type ThematicLayers } from "./layers-panel";
import MadagascarMap from "./madagascar-map";
import AIChatAssistant from "./ai-chat-assistant";
import { SearchFilter, type SearchFilterData } from "@/components/search-filter.component";

/** Webhook n8n pour envoyer le nom de la ville/commune sélectionnée */
const N8N_VILLE_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_VILLE_WEBHOOK_URL ||
  "https://n8n.itdcmada.com/webhook-test/ville";

/** Webhook n8n pour envoyer le nom de la région sélectionnée */
const N8N_REGION_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_REGION_WEBHOOK_URL ||
  "https://n8n.itdcmada.com/webhook-test/region";

/** Webhook n8n pour envoyer le nom du district sélectionné */
const N8N_DISTRICT_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_DISTRICT_WEBHOOK_URL ||
  "https://n8n.itdcmada.com/webhook-test/district";

type N8nVilleReport = {
  commune?: string;
  date?: string;
  statutGlobal?: string;
  resume?: string;
  analyse?: string;
  rag?: {
    sante?: { total?: number; critiques?: number; infrastructures?: number };
    education?: { total?: number; critiques?: number; infrastructures?: number };
    autres?: { total?: number; critiques?: number; infrastructures?: number };
  };
  statistiques?: {
    totalDoleances?: number;
    tauxCritique?: number;
    tauxResolution?: number;
    tendance?: string;
  };
  [key: string]: unknown;
};

async function sendVilleToN8n(nomVille: string): Promise<N8nVilleReport> {
  if (!nomVille?.trim()) return {};
  // Passer par un proxy API Next pour éviter CORS et remonter les erreurs
  const response = await fetch("/api/n8n/ville", {
    method: "POST",
    headers: { "Content-Type": "text/plain; charset=utf-8", Accept: "application/json" },
    body: nomVille.trim(),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(
      `n8n HTTP ${response.status} ${response.statusText} — ${rawText.slice(0, 500)}`
    );
  }

  if (contentType.includes("application/json")) {
    return JSON.parse(rawText) as N8nVilleReport;
  }

  // Le workflow est censé répondre en JSON; si jamais c'est du texte, on l'encapsule.
  return { message: rawText } as unknown as N8nVilleReport;
}

async function sendRegionToN8n(nomRegion: string): Promise<void> {
  if (!nomRegion?.trim()) return;
  try {
    const res = await fetch("/api/n8n/region", {
      method: "POST",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: nomRegion.trim(),
    });
    if (!res.ok) {
      console.warn("Envoi région vers n8n:", res.status, await res.text());
    }
  } catch (e) {
    console.warn("Erreur envoi région vers n8n:", e);
  }
}

async function sendDistrictToN8n(nomDistrict: string): Promise<void> {
  if (!nomDistrict?.trim()) return;
  try {
    const res = await fetch("/api/n8n/district", {
      method: "POST",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: nomDistrict.trim(),
    });
    if (!res.ok) {
      console.warn("Envoi district vers n8n:", res.status, await res.text());
    }
  } catch (e) {
    console.warn("Erreur envoi district vers n8n:", e);
  }
}

type RagLevel = "Critique" | "Modérée" | "Stable" | "—";

function normalizeRagLevel(value: unknown): RagLevel {
  const v = (value ?? "").toString().trim().toLowerCase();
  if (v.includes("crit")) return "Critique";
  if (v.includes("mod")) return "Modérée";
  if (v.includes("stab")) return "Stable";
  return "—";
}

function ragDotClass(level: RagLevel): string {
  switch (level) {
    case "Critique":
      return "bg-red-500";
    case "Modérée":
      return "bg-orange-500";
    case "Stable":
      return "bg-green-500";
    default:
      return "bg-gray-300";
  }
}

function computeSectorLevel(total?: number, critiques?: number): RagLevel {
  const t = typeof total === "number" ? total : 0;
  const c = typeof critiques === "number" ? critiques : 0;
  if (t <= 0) return "—";
  const ratio = c / t;
  if (ratio >= 0.5) return "Critique";
  if (ratio >= 0.2) return "Modérée";
  return "Stable";
}

function formatPercent(value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  // support 0..1 or 0..100
  const v = value <= 1 ? value * 100 : value;
  return `${Math.round(v)}%`;
}

function formatInt(value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return String(Math.round(value));
}

function splitBullets(text?: string): string[] {
  const t = (text ?? "").toString().trim();
  if (!t) return [];
  // accepte "- xxx" ou des lignes simples
  const lines = t.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const cleaned = lines.map((l) => l.replace(/^[•\-–]\s+/, "").trim()).filter(Boolean);
  return cleaned.length ? cleaned : [t];
}

export default function CartographieContent() {
  const [searchFilterData, setSearchFilterData] =
    useState<SearchFilterData | null>(null);

  const [layers, setLayers] = useState<ThematicLayers>({
    pointsEau: false,
    educations: false,
  });

  const [selectedVille, setSelectedVille] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<"region" | "district" | "commune" | "" >("");
  const [villeReport, setVilleReport] = useState<N8nVilleReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const handleSearchFilterChange = useCallback((data: SearchFilterData) => {
    setSearchFilterData(data);
  }, []);

  const statutGlobal = useMemo(() => {
    return (villeReport?.statutGlobal ?? "").toString().trim();
  }, [villeReport]);

  const globalRagLevel = useMemo(() => normalizeRagLevel(statutGlobal), [statutGlobal]);

  const rag = villeReport?.rag;
  const stats = villeReport?.statistiques;
  const resumeLines = useMemo(() => splitBullets(villeReport?.resume), [villeReport?.resume]);
  const analyseLines = useMemo(() => splitBullets(villeReport?.analyse), [villeReport?.analyse]);

  const handleMapAreaSelect = useCallback(
    async (area: { id: string; name: string; level: string }) => {
      if (!area.name) return;

      const selectedName = area.name.trim();
      setSelectedVille(selectedName);
      setSelectedLevel(area.level as "region" | "district" | "commune");

      // 1) Clic région (zoom vers districts) -> envoyer région
      if (area.level === "region") {
        sendRegionToN8n(selectedName);
        setVilleReport(null);
        setReportError(null);
        return;
      }

      // 2) Clic district (zoom vers communes) -> envoyer district
      if (area.level === "district") {
        sendDistrictToN8n(selectedName);
        setVilleReport(null);
        setReportError(null);
        return;
      }

      // 3) Clic commune -> envoyer commune au workflow /ville et afficher le rapport
      if (area.level === "commune") {
        const ville = selectedName;
        setVilleReport(null);
        setReportError(null);
        setReportLoading(true);
        try {
          const report = await sendVilleToN8n(ville);
          setVilleReport(report);
        } catch (e) {
          setReportError(e instanceof Error ? e.message : String(e));
          setVilleReport(null);
        } finally {
          setReportLoading(false);
        }
      }
    },
    []
  );

  const dynamicText =
    "Bienvenue sur la cartographie des doléances. Ici, vous pouvez visualiser et filtrer les doléances selon vos critères.";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground">
          Cartographie des doléances
        </h1>
        <div className="w-24 h-1 bg-green-600 mt-2 mb-4" />
        <p className="text-muted-foreground text-sm">{dynamicText}</p>

        {/* Search Filter */}
        <div className="mb-8 mt-6">
          <SearchFilter onSearch={handleSearchFilterChange} />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-8">
        <div className="flex gap-6">
          <LayersPanel layers={layers} onChange={setLayers} />

          <div className="flex-1">
            <MadagascarMap onAreaSelect={handleMapAreaSelect} layers={layers} />
          </div>

          <div className="w-80 shrink-0">
            <div className="rounded-lg border border-green-100 bg-green-50/60 p-3 space-y-3">
              <div className="text-center">
                <div className="text-green-700 font-semibold text-base">
                  {selectedLevel === "region" && selectedVille
                    ? `Région de ${selectedVille}`
                    : selectedLevel === "district" && selectedVille
                      ? `District de ${selectedVille}`
                      : selectedLevel === "commune" && selectedVille
                        ? `Commune de ${selectedVille}`
                        : "Aucune sélection"}
                </div>
                <div className="mt-1 inline-flex items-center rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-medium text-white">
                  {villeReport?.date ? `dern. maj. ${villeReport.date}` : "en attente…"}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-xs font-semibold text-foreground mb-2">
                    Statut général (RAG)
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    {(["Critique", "Modérée", "Stable"] as const).map((lvl) => (
                      <div key={lvl} className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${ragDotClass(lvl)}`} />
                        <span className={globalRagLevel === lvl ? "font-semibold text-foreground" : "text-muted-foreground"}>
                          {lvl}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {reportError && (
                  <div className="text-xs text-destructive break-words">
                    {reportError}
                  </div>
                )}

                {/* Résumé doléances */}
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-foreground">
                      Résumé doléances
                    </div>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    {reportLoading && selectedVille && <div>Génération en cours…</div>}
                    {!reportLoading && resumeLines.length === 0 && (
                      <div>Aucune donnée pour le moment.</div>
                    )}
                    {resumeLines.length > 0 && (
                      <ul className="list-disc pl-4 space-y-1">
                        {resumeLines.map((line, idx) => (
                          <li key={idx}>{line}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Synthèse RAG */}
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-foreground">
                      Synthèse RAG
                    </div>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>

                  <div className="mt-2 space-y-2 text-xs">
                    {(
                      [
                        { key: "sante", label: "Santé" },
                        { key: "education", label: "Educations" },
                        { key: "autres", label: "Autres" },
                      ] as const
                    ).map(({ key, label }) => {
                      const sector = rag?.[key];
                      const total = sector?.total;
                      const critiques = sector?.critiques;
                      const infrastructures = sector?.infrastructures;
                      const level = computeSectorLevel(total, critiques);

                      return (
                        <div key={key} className="flex items-start justify-between gap-3">
                          <div className="w-24 text-muted-foreground">{label}</div>
                          <div className="flex-1 flex items-start gap-2">
                            <span className={`mt-1 h-2.5 w-2.5 rounded-full ${ragDotClass(level)}`} />
                            <div className="text-muted-foreground">
                              {typeof total === "number" ? (
                                <>
                                  <span className="font-semibold text-foreground">{formatInt(total)}</span>{" "}
                                  doléances actives,{" "}
                                  <span className="font-semibold text-foreground">{formatInt(critiques)}</span>{" "}
                                  critiques,{" "}
                                  <span className="font-semibold text-foreground">{formatInt(infrastructures)}</span>{" "}
                                  infrastructures.
                                </>
                              ) : (
                                <>—</>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Statistiques */}
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-foreground">
                      Statistiques
                    </div>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    <div>Nombre total de doléances: <span className="text-foreground font-semibold">{formatInt(stats?.totalDoleances)}</span></div>
                    <div>Taux doléances urgentes: <span className="text-foreground font-semibold">{formatPercent(stats?.tauxCritique)}</span></div>
                    <div>Taux de résolution: <span className="text-foreground font-semibold">{formatPercent(stats?.tauxResolution)}</span></div>
                    <div>Tendance générale: <span className="text-foreground font-semibold">{stats?.tendance ? String(stats.tendance) : "—"}</span></div>
                  </div>
                </div>

                {/* Analyse */}
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-foreground">
                      Analyse
                    </div>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    {analyseLines.length === 0 ? (
                      <div>—</div>
                    ) : (
                      <ul className="list-disc pl-4 space-y-1">
                        {analyseLines.map((line, idx) => (
                          <li key={idx}>{line}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Indication simple en bas de l'analyse */}
                {villeReport && (
                  <div className="pt-1 text-[10px] text-muted-foreground">
                    Résultats générés automatiquement par n8n à partir des doléances de la commune.
                  </div>
                )}

                {!villeReport && selectedVille && !reportLoading && !reportError && (
                  <div className="text-xs text-muted-foreground">
                    Clique sur une commune pour générer le rapport via n8n…
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Div */}
        <div className="mt-6 p-4 border-t border-gray-200 text-sm text-muted-foreground">
          Total des doléances affichées: 150 (données simulées)
        </div>
      </div>

      <AIChatAssistant />
    </div>
  );
}
