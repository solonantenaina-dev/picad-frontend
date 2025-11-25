"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function LayersPanel() {
  const [layers, setLayers] = useState({
    pointsEau: false,
    educations: false,
  });

  const toggleLayer = (layer: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className="w-64 shrink-0">
      <h2 className="text-xl font-semibold text-green-600 mb-4">Couches</h2>

      <Button className="w-full bg-green-600 hover:bg-green-700 text-white mb-6">
        Import données
      </Button>

      {/* Thématiques Section - Style simplifié comme dans l'image */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            checked
            readOnly
          />
          <span className="text-sm text-foreground">Thématiques</span>
        </div>

        <div className="ml-4 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              checked={layers.pointsEau}
              onChange={() => toggleLayer("pointsEau")}
            />
            <span className="text-sm text-foreground">
              Points lié à l&apos;eau
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              checked={layers.educations}
              onChange={() => toggleLayer("educations")}
            />
            <span className="text-sm text-foreground">Educations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
