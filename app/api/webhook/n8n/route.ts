import { NextRequest, NextResponse } from "next/server";
import { chatStore } from "@/lib/chat-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Format attendu de N8N :
    // {
    //   "sessionId": "unique-session-id",
    //   "response": "Réponse du bot",
    //   "status": "completed" | "error"
    // }

    const { sessionId, response, status = "completed" } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId est requis" },
        { status: 400 }
      );
    }

    if (!response && status !== "error") {
      return NextResponse.json(
        { error: "response est requis" },
        { status: 400 }
      );
    }

    // Stocker la réponse
    chatStore.set(sessionId, {
      sessionId,
      response: response || "Erreur lors du traitement",
      timestamp: new Date(),
      status: status as "pending" | "completed" | "error",
    });

    console.log(`Réponse reçue pour sessionId: ${sessionId}`);

    return NextResponse.json({
      success: true,
      message: "Réponse reçue avec succès",
      sessionId,
    });
  } catch (error) {
    console.error("Erreur lors de la réception du webhook N8N:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement du webhook" },
      { status: 500 }
    );
  }
}

// Route GET pour vérifier le statut (optionnel)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId est requis" },
      { status: 400 }
    );
  }

  const response = chatStore.get(sessionId);

  if (!response) {
    return NextResponse.json(
      { error: "Aucune réponse trouvée pour ce sessionId" },
      { status: 404 }
    );
  }

  return NextResponse.json(response);
}

