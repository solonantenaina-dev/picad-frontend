"use client";

import dynamic from "next/dynamic";

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

export default function MadagascarMap() {
  return <LeafletMap />;
}
