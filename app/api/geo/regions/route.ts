import { NextResponse } from "next/server";
import { loadGeoJsonItems, errorResponse } from "@/app/api/geo/geo-helper";

export interface RegionItem {
  code: string;
  name: string;
}

let cachedRegions: RegionItem[] | null = null;

export async function GET() {
  if (cachedRegions) {
    return NextResponse.json(cachedRegions, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  }

  try {
    const list = await loadGeoJsonItems<RegionItem>("regions.geojson", (properties) => {
      const code = String(properties.ADM1_PCODE ?? "").trim();
      const name = String(properties.ADM1_EN ?? "").trim();
      if (!code || !name) return null;
      return { code, name };
    });

    cachedRegions = list;
    return NextResponse.json(list, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  } catch (e) {
    return errorResponse("Erreur lors du chargement des régions", e);
  }
}
