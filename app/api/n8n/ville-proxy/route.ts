import { NextRequest, NextResponse } from "next/server";

const N8N_WEBHOOK =
  process.env.N8N_WEBHOOK_URL ||
  "https://n8n.itdcmada.com/webhook/ville";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(N8N_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type") ?? "";
    const rawText = await response.text();

    // Robust JSON handling with fallback error structure
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = {
        commune: "",
        statutGlobal: "Erreur",
        resume: "Réponse invalide",
        analyse: rawText,
        rag: {},
        statistiques: {},
      };
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Erreur proxy n8n", 
        details: String(error),
        commune: "",
        statutGlobal: "Erreur",
        resume: "Erreur proxy",
        analyse: String(error),
        rag: {},
        statistiques: {},
      },
      { status: 500 }
    );
  }
}
