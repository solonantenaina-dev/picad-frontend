"use client";

import { useMemo, useState, useCallback } from "react";
import LayersPanel, { type ThematicLayers } from "./layers-panel";
import MadagascarMap from "./madagascar-map";
import AIChatAssistant from "./ai-chat-assistant";
import { SearchFilter, type SearchFilterData } from "@/components/search-filter.component";
import { TranslatedText } from "@/components/TranslatedText";

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
    infrastructure?: { total?: number; critiques?: number; infrastructures?: number };
    agriculture?: { total?: number; critiques?: number; infrastructures?: number };
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

  try {
    return JSON.parse(rawText);
  } catch {
    return {
      commune: "",
      statutGlobal: "Erreur",
      resume: "Réponse invalide",
      analyse: rawText,
      rag: {},
      statistiques: {},
    };
  }
}

async function sendRegionReport(nomRegion: string): Promise<N8nVilleReport> {
  if (!nomRegion?.trim()) {
    return {
      commune: nomRegion,
      statutGlobal: "Erreur",
      resume: "Nom vide",
      rag: {},
      statistiques: {},
    };
  }

  const response = await fetch("/api/n8n/region-report", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ name: nomRegion.trim() }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`n8n region-report HTTP ${response.status} — ${error.slice(0, 500)}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const rawText = await response.text();

  if (contentType.includes("application/json")) {
    return JSON.parse(rawText) as N8nVilleReport;
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return {
      commune: nomRegion,
      statutGlobal: "Erreur",
      resume: "Réponse invalide",
      analyse: rawText,
      rag: {},
      statistiques: {},
    };
  }
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

async function sendDistrictReport(nomDistrict: string): Promise<N8nVilleReport> {
  if (!nomDistrict?.trim()) {
    return {
      commune: nomDistrict,
      statutGlobal: "Erreur",
      resume: "Nom vide",
      rag: {},
      statistiques: {},
    };
  }

  const response = await fetch("/api/n8n/district-report", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ name: nomDistrict.trim() }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`n8n district-report HTTP ${response.status} — ${error.slice(0, 500)}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const rawText = await response.text();

  if (contentType.includes("application/json")) {
    return JSON.parse(rawText) as N8nVilleReport;
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return {
      commune: nomDistrict,
      statutGlobal: "Erreur",
      resume: "Réponse invalide",
      analyse: rawText,
      rag: {},
      statistiques: {},
    };
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
    sante: false,
    infrastructure: false,
    agriculture: false,
  });

  const [selectedVille, setSelectedVille] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<"region" | "district" | "commune" | "" >("");
  const [villeReport, setVilleReport] = useState<N8nVilleReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const selectedArea = useMemo(() => {
    if (!searchFilterData) return undefined;
    const filterLevel = searchFilterData.filter.value;
    if (filterLevel === "region" || filterLevel === "district" || filterLevel === "commune") {
      const name = searchFilterData.location?.nom || searchFilterData.query.trim();
      if (name) {
        return { name, level: filterLevel as "region" | "district" | "commune" };
      }
    }
    return undefined;
  }, [searchFilterData]);

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

      // 1) Clic région -> fetch region-report + display
      if (area.level === "region") {
        const regionName = selectedName;
        setSelectedVille(regionName);
        setSelectedLevel("region");
        setVilleReport(null);
        setReportError(null);
        setReportLoading(true);
        try {
          const report = await sendRegionReport(regionName);
          setVilleReport(report);
        } catch (e) {
          setReportError(e instanceof Error ? e.message : String(e));
          setVilleReport(null);
        } finally {
          setReportLoading(false);
        }
        return;
      }

      // 2) Clic district -> fetch district-report + display  
      if (area.level === "district") {
        const districtName = selectedName;
        setSelectedVille(districtName);
        setSelectedLevel("district");
        setVilleReport(null);
        setReportError(null);
        setReportLoading(true);
        sendDistrictToN8n(districtName); // Keep for map zoom/other logic
        try {
          const report = await sendDistrictReport(districtName);
          setVilleReport(report);
        } catch (e) {
          setReportError(e instanceof Error ? e.message : String(e));
          setVilleReport(null);
        } finally {
          setReportLoading(false);
        }
        return;
      }

      // 3) Clic commune -> envoyer commune au workflow /ville et afficher le rapport
      if (area.level === "commune") {
        const ville = selectedName;
        setSelectedVille(ville);
        setSelectedLevel("commune");
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
        <TranslatedText text="Cartographie des doléances" className="text-2xl font-bold text-foreground h1" />
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
            <MadagascarMap 
              onAreaSelect={handleMapAreaSelect} 
              layers={layers} 
              showHeatmap={showHeatmap}
              selectedArea={selectedArea} 
            />

          </div>

          <div className="w-80 shrink-0">
            <div className="mb-3 flex items-center gap-2">
              <button
                className={`text-xs px-2 py-1 rounded ${showHeatmap ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setShowHeatmap((v) => !v)}
              >
                <TranslatedText text={showHeatmap ? 'Masquer heatmap' : 'Afficher heatmap'} />
              </button>
              <TranslatedText text="Visualisation de densité" className="text-xs text-muted-foreground" />
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 text-sm space-y-4">
              {/* HEADER */}
              <div>
                <h2 className="text-green-700 font-bold text-lg">
                  {selectedLevel ? `${selectedLevel === "commune" ? "Commune" : selectedLevel === "district" ? "District" : "Région"} de ` : "Zone "} {selectedVille || "..."}
                </h2>
                <p className="text-xs text-gray-500">
                  Dern. maj : {villeReport?.date ?? "04/11/2025"}
                </p>
              </div>

              {/* LOADING INDICATOR */}
              {reportLoading && (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-3 h-3 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-3 h-3 rounded-full bg-green-500 animate-bounce" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Traitement en cours...</p>
                </div>
              )}

              {/* REPORT CONTENT - only show when not loading */}
              {!reportLoading && (
                <>
                  {/* STATUT GLOBAL */}
                  <div>
                    <p className="text-xs font-semibold mb-1">Statut général (RAG)</p>
                    <div className="flex gap-4 text-xs items-center">
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span> Critique
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-orange-500"></span> Modérée
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span> Stable
                      </div>
                    </div>
                  </div>

                  {/* RESUME */}
                  <div>
                    <h3 className="font-semibold text-sm">Résumé doléances</h3>
                    <p className="text-xs text-gray-600">
                      {villeReport?.resume || "Aucune donnée"}
                    </p>
                  </div>

                  {/* SYNTHÈSE */}
                  <div>
                    <h3 className="font-semibold text-sm">Synthèse RAG</h3>
                    <ul className="text-xs space-y-1">
                      <li className="flex justify-between">
                        <span>Santé</span>
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                          {formatInt(villeReport?.rag?.sante?.total)}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Éducation</span>
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                          {formatInt(villeReport?.rag?.education?.total)}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Autres</span>
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                          {formatInt(villeReport?.rag?.autres?.total)}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Infrastructure</span>
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                          {formatInt(villeReport?.rag?.infrastructure?.total)}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Agriculture</span>
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-lime-600 rounded-full"></span>
                          {formatInt(villeReport?.rag?.agriculture?.total)}
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* STATISTIQUES */}
                  <div>
                    <h3 className="font-semibold text-sm">Statistiques</h3>
                    <ul className="text-xs space-y-1">
                      <li>Total doléances : {formatInt(villeReport?.statistiques?.totalDoleances)}</li>
                      <li>Taux critique : {formatPercent(villeReport?.statistiques?.tauxCritique)}</li>
                      <li>Taux résolution : {formatPercent(villeReport?.statistiques?.tauxResolution)}</li>
                      <li>Tendance : {villeReport?.statistiques?.tendance ?? "—"}</li>
                    </ul>
                  </div>

                  {/* ANALYSE IA */}
                  <div>
                    <h3 className="font-semibold text-sm">Analyse IA</h3>
                    <p className="text-xs text-gray-600">
                      {villeReport?.analyse || "Analyse non disponible"}
                    </p>
                  </div>
                </>
              )}

              {reportError && (
                <div className="mt-2 text-xs text-destructive break-words">
                  Erreur : {reportError}
                </div>
              )}
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