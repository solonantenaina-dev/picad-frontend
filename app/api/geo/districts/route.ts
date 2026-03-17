import { NextResponse } from "next/server";
import { loadGeoJsonItems, errorResponse } from "@/app/api/geo/geo-helper";

export interface DistrictItem {
  code: string;
  name: string;
  regionName: string;
}

let cachedDistricts: DistrictItem[] | null = null;

export async function GET() {
  if (cachedDistricts) {
    return NextResponse.json(cachedDistricts, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  }

  try {
    const list = await loadGeoJsonItems<DistrictItem>("districts.geojson", (properties) => {
      const code = String(properties.ADM2_PCODE ?? "").trim();
      const name = String(properties.ADM2_EN ?? "").trim();
      const regionName = String(properties.ADM1_EN ?? "").trim();
      if (!code || !name) return null;
      return { code, name, regionName };
    });

    cachedDistricts = list;
    return NextResponse.json(list, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  } catch (e) {
    return errorResponse("Erreur lors du chargement des districts", e);
  }
}
