"use client";

import { Button } from "@/components/ui/button";
import { TranslatedText } from "@/components/TranslatedText";

export type ThematicLayers = {
  pointsEau: boolean;
  educations: boolean;
  sante: boolean;
  infrastructure: boolean;
  agriculture: boolean;
};

export default function LayersPanel({
  layers,
  onChange,
}: {
  layers: ThematicLayers;
  onChange: (next: ThematicLayers) => void;
}) {
  const toggleLayer = (layer: keyof ThematicLayers) => {
    onChange({ ...layers, [layer]: !layers[layer] });
  };

  return (
    <div className="w-64 shrink-0">
      <TranslatedText text="Couches" className="text-xl font-semibold text-green-600 mb-4 h2" />

      <Button className="w-full bg-green-600 hover:bg-green-700 text-white mb-6">
        <TranslatedText text="Import données" />
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
          <TranslatedText text="Thématiques" className="text-sm text-foreground" />
        </div>

        <div className="ml-4 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              checked={layers.pointsEau}
              onChange={() => toggleLayer("pointsEau")}
            />
            <TranslatedText text="Points lié à l'eau" className="text-sm text-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              checked={layers.educations}
              onChange={() => toggleLayer("educations")}
            />
            <TranslatedText text="Educations" className="text-sm text-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              checked={layers.sante}
              onChange={() => toggleLayer("sante")}
            />
            <TranslatedText text="Santé" className="text-sm text-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              checked={layers.infrastructure}
              onChange={() => toggleLayer("infrastructure")}
            />
            <TranslatedText text="Infrastructure" className="text-sm text-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              checked={layers.agriculture}
              onChange={() => toggleLayer("agriculture")}
            />
            <TranslatedText text="Agriculture" className="text-sm text-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
