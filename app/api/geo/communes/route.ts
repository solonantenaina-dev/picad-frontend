import { NextResponse } from "next/server";
import path from "path";
import { readFile } from "fs/promises";

export interface CommuneItem {
  code: string;
  name: string;
  districtName: string;
  regionName: string;
}

let cachedCommunes: CommuneItem[] | null = null;

/**
 * Liste des communes (Madagascar) depuis communes.geojson.
 * Fichier volumineux : premier chargement peut prendre quelques secondes, puis mis en cache.
 */
export async function GET() {
  if (cachedCommunes) {
    return NextResponse.json(cachedCommunes, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    "communes.geojson"
  );

  try {
    const raw = await readFile(filePath, "utf-8");
    const geojson = JSON.parse(raw) as {
      features?: Array<{
        properties?: {
          ADM3_PCODE?: string;
          ADM3_EN?: string;
          ADM2_EN?: string;
          ADM1_EN?: string;
        };
      }>;
    };
    const features = geojson.features ?? [];
    const seen = new Set<string>();
    const list: CommuneItem[] = [];
    for (const f of features) {
      const code = f.properties?.ADM3_PCODE ?? "";
      const name = f.properties?.ADM3_EN ?? "";
      const districtName = f.properties?.ADM2_EN ?? "";
      const regionName = f.properties?.ADM1_EN ?? "";
      if (code && name && !seen.has(code)) {
        seen.add(code);
        list.push({ code, name, districtName, regionName });
      }
    }
    list.sort((a, b) => a.name.localeCompare(b.name));
    cachedCommunes = list;
    return NextResponse.json(list, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  } catch (e) {
    console.error("Erreur lecture communes.geojson:", e);
    console.error("Chemin du fichier:", filePath);
    return NextResponse.json(
      { error: "Erreur lors du chargement des communes", details: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
