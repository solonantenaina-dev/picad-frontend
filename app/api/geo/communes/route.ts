import { NextResponse } from "next/server";
import { loadGeoJsonItems, errorResponse } from "@/app/api/geo/geo-helper";

export interface CommuneItem {
  code: string;
  name: string;
  districtName: string;
  regionName: string;
}

let cachedCommunes: CommuneItem[] | null = null;

export async function GET() {
  if (cachedCommunes) {
    return NextResponse.json(cachedCommunes, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  }

  try {
    const list = await loadGeoJsonItems<CommuneItem>("communes.geojson", (properties) => {
      const code = String(properties.ADM3_PCODE ?? "").trim();
      const name = String(properties.ADM3_EN ?? "").trim();
      const districtName = String(properties.ADM2_EN ?? "").trim();
      const regionName = String(properties.ADM1_EN ?? "").trim();
      if (!code || !name) return null;
      return { code, name, districtName, regionName };
    });

    cachedCommunes = list;
    return NextResponse.json(list, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  } catch (e) {
    return errorResponse("Erreur lors du chargement des communes", e);
  }
}
