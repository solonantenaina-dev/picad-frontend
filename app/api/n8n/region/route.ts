import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const region = (await request.text()).trim();

  if (!region) {
    return NextResponse.json({ error: "region est requis" }, { status: 400 });
  }

  const url =
    process.env.N8N_WEBHOOK_URL ||
    "https://n8n.itdcmada.com/webhook-test/ville";

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (process.env.N8N_AUTH_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.N8N_AUTH_TOKEN}`;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        level: "region",
        name: region,
      }),
      cache: "no-store",
    });

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: `n8n HTTP ${res.status}`, details: text.slice(0, 500) },
        { status: 502 }
      );
    }

    return NextResponse.json(JSON.parse(text));
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