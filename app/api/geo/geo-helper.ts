import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export type FeatureProperty = Record<string, unknown>;

export interface GeoItem {
  code: string;
  name: string;
  extra?: Record<string, string>;
}

export async function loadGeoJsonItems<T extends GeoItem>(
  fileName: string,
  mapProperties: (properties: FeatureProperty) => T | null
): Promise<T[]> {
  const filePath = path.join(process.cwd(), "public", "data", fileName);
  const raw = await readFile(filePath, "utf-8");
  const geojson = JSON.parse(raw) as { features?: Array<{ properties?: FeatureProperty }> };
  const features = geojson.features ?? [];

  const seen = new Set<string>();
  const list: T[] = [];

  for (const feature of features) {
    const item = mapProperties(feature.properties ?? {});
    if (!item?.code || !item.name || seen.has(item.code)) continue;
    seen.add(item.code);
    list.push(item);
  }

  list.sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));
  return list;
}

export function errorResponse(errorLabel: string, e: unknown) {
  console.error(errorLabel, e);
  return NextResponse.json(
    {
      error: errorLabel,
      details: e instanceof Error ? e.message : String(e),
    },
    { status: 500 }
  );
}
