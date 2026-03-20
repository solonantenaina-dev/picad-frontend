import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let regionName = "";
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    if (typeof body === "object" && body !== null && "name" in body) {
      regionName = String((body as { name?: unknown }).name ?? "").trim();
    }
  } else {
    regionName = (await request.text()).trim();
  }

  if (!regionName) {
    return NextResponse.json({ error: "name de région est requis" }, { status: 400 });
  }

  const url =
    process.env.N8N_WEBHOOK_URL ||
    "https://n8n.itdcmada.com/webhook-test/region";

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (process.env.N8N_AUTH_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.N8N_AUTH_TOKEN}`;
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        level: "region",
        name: regionName,
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
        try {
          return NextResponse.json(JSON.parse(rawText));
        } catch {
          return NextResponse.json({
            commune: regionName,
            statutGlobal: "Erreur",
            resume: "Réponse invalide",
            analyse: rawText,
            rag: {},
            statistiques: {},
          });
        }
      }
    }

    try {
      return NextResponse.json(JSON.parse(rawText));
    } catch {
      return NextResponse.json({
        commune: regionName,
        statutGlobal: "Erreur",
        resume: "Réponse invalide", 
        analyse: rawText,
        rag: {},
        statistiques: {},
      });
    }
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
