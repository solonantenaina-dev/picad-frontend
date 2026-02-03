import { NextResponse } from "next/server";
import path from "path";
import { readFile } from "fs/promises";

interface RegionItem {
  code: string;
  name: string;
}

let cachedRegions: RegionItem[] | null = null;

/**
 * Retourne la liste des régions (Madagascar) depuis regions.geojson.
 * Utilisé pour afficher la liste Région / Commune dans la zone intervention.
 */
export async function GET() {
  if (cachedRegions) {
    return NextResponse.json(cachedRegions, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    "regions.geojson"
  );

  try {
    const raw = await readFile(filePath, "utf-8");
    const geojson = JSON.parse(raw) as {
      features?: Array<{ properties?: { ADM1_PCODE?: string; ADM1_EN?: string } }>;
    };
    const features = geojson.features ?? [];
    const seen = new Set<string>();
    const list: RegionItem[] = [];
    for (const f of features) {
      const code = f.properties?.ADM1_PCODE ?? "";
      const name = f.properties?.ADM1_EN ?? "";
      if (code && name && !seen.has(code)) {
        seen.add(code);
        list.push({ code, name });
      }
    }
    list.sort((a, b) => a.name.localeCompare(b.name));
    cachedRegions = list;
    console.log(`Chargé ${list.length} régions depuis regions.geojson`);
    return NextResponse.json(list, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  } catch (e) {
    console.error("Erreur lecture regions.geojson:", e);
    console.error("Chemin du fichier:", filePath);
    return NextResponse.json(
      { error: "Erreur lors du chargement des régions", details: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
