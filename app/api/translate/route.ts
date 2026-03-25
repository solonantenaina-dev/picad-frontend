import { NextResponse } from "next/server";
import { translate } from "@vitalets/google-translate-api";

// 🔥 IMPORTANT : forcer Node.js runtime
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { text, targetLang = "en" } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const result = await translate(text, { to: targetLang });

    return NextResponse.json({
      translatedText: result.text,
    });

  } catch (error: any) {
    console.error("Translation server error:", error);

    return NextResponse.json(
      {
        error: "Translation failed",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}