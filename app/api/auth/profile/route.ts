import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get token from query parameter
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token requis pour acceder au profil" },
        { status: 401 }
      );
    }

    // Use n8n webhook to get user profile
    // This follows the n8n workflow: Login -> If -> Get profil utilisateur1 -> Return profile
    const n8nWebhookUrl = process.env.N8N_PROFILE_WEBHOOK_URL || "https://n8n.itdcmada.com/webhook/auth/login";

    const response = await fetch(n8nWebhookUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // Fallback: call Supabase directly if n8n fails
      return await getProfileFromSupabase(token);
    }

    const data = await response.json();
    
    if (data.user) {
      return NextResponse.json({ user: data.user });
    }

    // If n8n doesn't return user, try Supabase directly
    return await getProfileFromSupabase(token);
  } catch (error) {
    console.error("Error in profile API:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement du profil" },
      { status: 500 }
    );
  }
}

// Fallback function to get profile directly from Supabase
async function getProfileFromSupabase(token: string) {
  const supabaseUrl = process.env.SUPABASE_URL || "https://dsmzqcsdcuaqjfwtsxvi.supabase.co";
  const supabaseApiKey = process.env.SUPABASE_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbXpxY3NkY3VhcWpmd3RzeHZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkyNTI4OSwiZXhwIjoyMDgzNTAxMjg5fQ.cOsruUrH42fkEY3b1d-_Rn7QpBfSVS64Piv9jNCOQ_U";

  try {
    // Get user info from Supabase Auth
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: "GET",
      headers: {
        "apikey": supabaseApiKey,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!authResponse.ok) {
      return NextResponse.json(
        { error: "Token invalide ou expire" },
        { status: 401 }
      );
    }

    const authData = await authResponse.json();

    if (!authData.email) {
      return NextResponse.json(
        { error: "Impossible de recuperer les informations utilisateur" },
        { status: 400 }
      );
    }

    // Get user profile from utilisateur table
    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/utilisateur?email=eq.${encodeURIComponent(authData.email)}`,
      {
        method: "GET",
        headers: {
          "apikey": supabaseApiKey,
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
      }
    );

    let userProfile = null;
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      userProfile = Array.isArray(profileData) && profileData.length > 0 ? profileData[0] : null;
    }

return NextResponse.json({
      user: {
        id: authData.id,
        email: authData.email,
        nom: userProfile?.nom || null,
        prenom: userProfile?.prenom || userProfile?.Prenom || null,
        phone: userProfile?.Phone || userProfile?.phone || null,
      },
    });
  } catch (error) {
    console.error("Error in Supabase fallback:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement du profil" },
      { status: 500 }
    );
  }
}
