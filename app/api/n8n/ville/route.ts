import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const ville = (await request.text()).trim();

  if (!ville) {
    return NextResponse.json({ error: "ville est requis" }, { status: 400 });
  }

  const url =
    process.env.N8N_WEBHOOK_URL ||
    "https://n8n.itdcmada.com/webhook-test/ville";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        level: "ville",
        name: ville,
      }),
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") ?? "";
    const rawText = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: `n8n HTTP ${res.status}`, details: rawText.slice(0, 1000) },
        { status: 502 }
      );
    }

    if (contentType.includes("application/json")) {
      try {
        return NextResponse.json(JSON.parse(rawText));
      } catch {
        return NextResponse.json({ message: rawText });
      }
    }

    return NextResponse.json({ message: rawText });

  } catch (e) {
    return NextResponse.json(
      {
        error: "Erreur appel n8n",
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}