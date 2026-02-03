import { NextRequest, NextResponse } from "next/server";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

/**
 * Proxy vers Nominatim pour éviter CORS et respecter le User-Agent.
 * La liste de suggestions (région, commune, etc.) s'affiche côté client
 * en appelant cette route au lieu de Nominatim directement.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim() ?? "";
  const countryCodes = searchParams.get("countryCodes") ?? "mg";
  const limit = searchParams.get("limit") ?? "10";

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const params = new URLSearchParams({
    q,
    format: "json",
    addressdetails: "1",
    limit,
    countrycodes: countryCodes,
  });

  try {
    const res = await fetch(`${NOMINATIM_BASE}/search?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        "Accept-Language": "fr",
        "User-Agent": "PicadFrontend/1.0 (https://itdcmada.com; contact@example.com)",
      },
    });

    if (!res.ok) {
      console.error(`Nominatim API error: ${res.status} ${res.statusText}`);
      return NextResponse.json([]);
    }
    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Erreur lors de l'appel à Nominatim:", error);
    return NextResponse.json([]);
  }
}
