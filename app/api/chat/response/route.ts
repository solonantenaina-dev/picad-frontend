import { NextRequest, NextResponse } from "next/server";
import { chatStore } from "@/lib/chat-store";

// Cette route permet de récupérer une réponse par sessionId
export async function GET(request: NextRequest) {
  try {
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
        { error: "Réponse non trouvée", status: "pending" },
        { status: 404 }
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération de la réponse:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la réponse" },
      { status: 500 }
    );
  }
}

