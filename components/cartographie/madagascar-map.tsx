"use client";

import dynamic from "next/dynamic";
import type { ThematicLayers } from "./layers-panel";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div
      className="relative bg-muted rounded-lg overflow-hidden flex items-center justify-center"
      style={{ height: "600px" }}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">
          Chargement de la carte...
        </p>
      </div>
    </div>
  ),
});

interface MadagascarMapProps {
  onAreaSelect?: (area: { id: string; name: string; level: string }) => void;
  layers?: ThematicLayers;
  showHeatmap?: boolean;
  selectedArea?: { name: string; level: "region" | "district" | "commune" };
}

export default function MadagascarMap({ onAreaSelect, layers, showHeatmap, selectedArea }: MadagascarMapProps) {
  return <LeafletMap onAreaSelect={onAreaSelect} layers={layers} showHeatmap={showHeatmap} selectedArea={selectedArea} />;
}
