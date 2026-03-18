import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    const url = process.env.N8N_AUTH_LOGIN_URL || "https://n8n.itdcmada.com/webhook-test/auth/login";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (process.env.N8N_AUTH_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.N8N_AUTH_TOKEN}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const text = await response.text();
    const contentType = response.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? JSON.parse(text || "{}")
      : { message: text };

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Erreur d'authentification n8n",
          status: response.status,
          details: data,
        },
        { status: 502 }
      );
    }

    const token =
      data?.token ||
      data?.access_token ||
      data?.body?.access_token ||
      data?.data?.token ||
      data?.data?.access_token ||
      data?.session?.access_token ||
      data?.session?.token ||
      data?.json?.access_token ||
      data?.json?.token;

    const user =
      data?.user ||
      data?.data?.user ||
      data?.body?.user ||
      data?.json?.user ||
      data?.user_metadata ||
      null;

    if (!token) {
      return NextResponse.json(
        {
          error: "Email ou mot de passe incorrect, réessayez.",
          details: data,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({ token, user });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Impossible de contacter le service d'authentification",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
