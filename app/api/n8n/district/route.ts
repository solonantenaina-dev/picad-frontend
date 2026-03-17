import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const district = (await request.text()).trim();

  if (!district) {
    return NextResponse.json({ error: "district est requis" }, { status: 400 });
  }

  const url =
    process.env.N8N_WEBHOOK_URL ||
    "https://n8n.itdcmada.com/webhook-test/ville";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: "district",
        name: district,
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