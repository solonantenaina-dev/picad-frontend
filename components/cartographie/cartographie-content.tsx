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

  const response = await fetch("/api/n8n/ville", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ name: nomVille.trim() }),
  });

  if (!response.ok) {
    const error = await response.text();
    let errorMessage = `n8n HTTP ${response.status} ${response.statusText} — ${error.slice(0, 500)}`;

    if (response.status === 404) {
      try {
        const errorData = JSON.parse(error);
        if (errorData.message && errorData.hint) {
          errorMessage = `Webhook n8n non enregistré : ${errorData.message}. Conseil : ${errorData.hint}`;
        }
      } catch {
        // If parsing fails, keep original message
      }
    }

    throw new Error(errorMessage);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const rawText = await response.text();

  if (contentType.includes("application/json")) {
    return JSON.parse(rawText) as N8nVilleReport;
  }

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

function predictRisk(commune: {
  score?: number;
  eau?: number;
  infrastructure?: string;
  sante?: string;
  agriculture?: string;
}) {
  let risk = commune.score ?? 40;
  if ((commune.eau ?? 100) < 50) risk += 10;
  if (commune.infrastructure === "Piste rurale") risk += 10;
  if (commune.sante === "CSB I") risk += 5;
  if ((commune.agriculture ?? "").includes("Manioc")) risk += 5;

  let niveau = "Stable";
  if (risk > 70) niveau = "Risque élevé";
  else if (risk > 50) niveau = "Risque modéré";

  return { riskScore: Math.min(100, Math.max(0, risk)), prediction: niveau };
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
  const [showHeatmap, setShowHeatmap] = useState(false);

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

  const riskPrediction = useMemo(() => {
    if (!selectedVille) return null;
    const commune = {
      score: villeReport?.statistiques?.tauxCritique ? Number(villeReport.statistiques.tauxCritique * 100) : 45,
      eau: villeReport?.statistiques?.tauxResolution ? 100 - Number(villeReport.statistiques.tauxResolution * 100) : 45,
      infrastructure: villeReport?.statutGlobal === "Risque élevé" ? "Piste rurale" : "Route principale",
      sante: villeReport?.rag?.sante?.total ? "CSB I" : "CSB II",
      agriculture: "Manioc",
    };
    return predictRisk(commune);
  }, [selectedVille, villeReport]);

  const handleMapAreaSelect = useCallback(async (area: { id: string; name: string; level: string }) => {
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
    }, []);

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
            <MadagascarMap onAreaSelect={handleMapAreaSelect} layers={layers} showHeatmap={showHeatmap} />
          </div>

          <div className="w-80 shrink-0">
            <div className="mb-3 flex items-center gap-2">
              <button
                className={`text-xs px-2 py-1 rounded ${showHeatmap ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setShowHeatmap((v) => !v)}
              >
                {showHeatmap ? 'Masquer heatmap' : 'Afficher heatmap'}
              </button>
              <span className="text-xs text-muted-foreground">Visualisation de densité</span>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
              <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h2 className="text-green-700 text-lg font-bold">
                      {selectedLevel === 'commune' ? `Commune de ${selectedVille || '...'}` : selectedLevel === 'district' ? `District de ${selectedVille || '...'}` : selectedLevel === 'region' ? `Région de ${selectedVille || '...'}` : 'Sélection de zone'}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Dern. maj : {villeReport?.date ?? 'en attente...'}
                    </p>
                  </div>
                  <div className={`text-xs font-semibold px-2 py-1 rounded-full ${statutGlobal === 'Critique' ? 'bg-red-600 text-white' : statutGlobal === 'Modérée' ? 'bg-orange-500 text-white' : statutGlobal === 'Stable' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    {statutGlobal || 'Aucun statut'}
                  </div>
                </div>

                {villeReport ? (
                  <div className="mt-3 text-xs text-muted-foreground space-y-2">
                    <p>Résumé doléances : {villeReport.resume || "Aucun résumé disponible"}</p>
                    <p>Statut global : {villeReport.statutGlobal || "—"}</p>

                    <h4 className="font-semibold">Synthèse RAG :</h4>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 10, height: 10, background: "red" }} /> Critique
                      <div style={{ width: 10, height: 10, background: "orange" }} /> Modérée
                      <div style={{ width: 10, height: 10, background: "green" }} /> Stable
                    </div>
                    <ul className="list-disc pl-5">
                      <li>Santé : {formatInt(villeReport.rag?.sante?.total)}</li>
                      <li>Éducation : {formatInt(villeReport.rag?.education?.total)}</li>
                      <li>Autres : {formatInt(villeReport.rag?.autres?.total)}</li>
                    </ul>

                    <h4 className="font-semibold">Statistiques :</h4>
                    <ul className="list-disc pl-5">
                      <li>Total : {formatInt(villeReport.statistiques?.totalDoleances)}</li>
                      <li>Taux critique : {formatPercent(villeReport.statistiques?.tauxCritique)}%</li>
                      <li>Taux résolution : {formatPercent(villeReport.statistiques?.tauxResolution)}%</li>
                      <li>Tendance : {villeReport.statistiques?.tendance ?? "—"}</li>
                    </ul>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-muted-foreground">Cliquez sur une zone pour afficher les données.</div>
                )}

                {reportError && (
                  <div className="mt-2 text-xs text-destructive break-words">
                    Erreur : {reportError}
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
