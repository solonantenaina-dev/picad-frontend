"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

type HeatmapItem = {
  lat: number;
  lng: number;
  score: number;
};

export default function HeatmapLayer({ data }: { data: HeatmapItem[] }) {
  const map = useMap();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const heatData = data
      .filter((item) => typeof item.lat === "number" && typeof item.lng === "number")
      .map((item) => [item.lat, item.lng, Math.max(0, Math.min(1, item.score / 100))]);

    const heat = (L as any).heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
    });

    heat.addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, data]);

  return null;
}
