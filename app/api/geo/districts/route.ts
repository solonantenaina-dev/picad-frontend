import { NextResponse } from "next/server";
import path from "path";
import { readFile } from "fs/promises";

export interface DistrictItem {
  code: string;
  name: string;
  regionName: string;
}

let cachedDistricts: DistrictItem[] | null = null;

/**
 * Liste des districts (Madagascar) depuis districts.geojson.
 */
export async function GET() {
  if (cachedDistricts) {
    return NextResponse.json(cachedDistricts, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    "districts.geojson"
  );

  try {
    const raw = await readFile(filePath, "utf-8");
    const geojson = JSON.parse(raw) as {
      features?: Array<{
        properties?: {
          ADM2_PCODE?: string;
          ADM2_EN?: string;
          ADM1_EN?: string;
        };
      }>;
    };
    const features = geojson.features ?? [];
    const seen = new Set<string>();
    const list: DistrictItem[] = [];
    for (const f of features) {
      const code = f.properties?.ADM2_PCODE ?? "";
      const name = f.properties?.ADM2_EN ?? "";
      const regionName = f.properties?.ADM1_EN ?? "";
      if (code && name && !seen.has(code)) {
        seen.add(code);
        list.push({ code, name, regionName });
      }
    }
    list.sort((a, b) => a.name.localeCompare(b.name));
    cachedDistricts = list;
    return NextResponse.json(list, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  } catch (e) {
    console.error("Erreur lecture districts.geojson:", e);
    console.error("Chemin du fichier:", filePath);
    return NextResponse.json(
      { error: "Erreur lors du chargement des districts", details: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
