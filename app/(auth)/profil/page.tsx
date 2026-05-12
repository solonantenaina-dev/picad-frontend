"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Loader2, CalendarDays, PencilLine } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";

interface UserProfile {
  id?: string;
  nom?: string;
  prenom?:string;
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  const safeParseJson = async (response: Response): Promise<unknown> => {
    const text = await response.text();
    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch (err) {
      console.error("JSON parse error:", text, err);
      throw new Error("Réponse JSON invalide du serveur");
    }
  };

  const handleEdit = () => {
    if (!profile) return;

    setEditForm({
      id: profile.id,
      nom: profile.nom || "",
      prenom: profile.prenom || "",
      email: profile.email || "",
      phone: profile.phone || "",
    });
    setIsEditing(true);
    setEditError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({});
    setEditError(null);
  };

  const handleSave = async () => {
    if (!profile?.id) {
      setEditError("Impossible de modifier le profil sans identifiant.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("https://n8n.itdcmada.com/webhook/modifier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la modification du profil");
      }

      const result = await safeParseJson(response);
      console.log("Modification profil réussie:", result);

      const updatedProfile = { ...profile, ...editForm };
      setProfile(updatedProfile);

      const userString = encodeURIComponent(JSON.stringify(updatedProfile));
      document.cookie = `auth-user=${userString}; path=/; max-age=86400`;
      window.dispatchEvent(new Event("auth-user-changed"));

      setIsEditing(false);
      setEditForm({});
      setEditError(null);
    } catch (err) {
      console.error("Erreur lors de la modification du profil:", err);
      setEditError(err instanceof Error ? err.message : "Une erreur est survenue lors de la modification");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      console.log("=== PROFILE PAGE LOADED ===");
      
      try {
        // Check for auth token in cookies
        const cookies = document.cookie.split("; ");
        const tokenCookie = cookies.find((row) => row.startsWith("auth-token="));

        console.log("Token found:", !!tokenCookie);

        if (!tokenCookie) {
          console.log("No token, redirecting to login");
          router.push("/login");
          return;
        }

        // Extract token value
        const token = tokenCookie.split("=")[1];

        // Try to fetch fresh user data from the API
        const response = await fetch("/api/auth/profile?token=" + encodeURIComponent(token), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
          cache: "no-store",
        });

        const data = await response.json();

        if (response.ok && data.user) {
          console.log("Profile fetched from API:", data.user);
          setProfile(data.user);
          
          // Update the cookie with fresh data
          const userString = encodeURIComponent(JSON.stringify(data.user));
          document.cookie = `auth-user=${userString}; path=/; max-age=86400`;
          window.dispatchEvent(new Event("auth-user-changed"));
        } else if (data.error) {
          console.log("API error, falling back to cookie:", data.error);
          // Fall back to cookie data if API fails
          const userCookie = cookies.find((row) => row.startsWith("auth-user="));
          if (userCookie) {
            const cookieValue = userCookie.split("=")[1];
            if (cookieValue) {
              try {
                const decodedValue = decodeURIComponent(cookieValue);
                if (decodedValue && decodedValue.trim()) {
                  const userData = JSON.parse(decodedValue);
                  setProfile(userData);
                } else {
                  setLoadError("Données utilisateur vides");
                }
              } catch (parseError) {
                console.error("Erreur de parsing des données cookie:", parseError);
                setLoadError("Données utilisateur corrompues");
              }
            } else {
              setLoadError("Cookie utilisateur vide");
            }
          } else {
            setLoadError("Aucune donnée utilisateur trouvée. Veuillez vous reconnecter.");
          }
        }
      } catch (err) {
        console.error("Error in fetchProfile:", err);
        
        // Fall back to cookie data on network error
        const cookies = document.cookie.split("; ");
        const userCookie = cookies.find((row) => row.startsWith("auth-user="));
        if (userCookie) {
          const cookieValue = userCookie.split("=")[1];
          if (cookieValue) {
            try {
              const decodedValue = decodeURIComponent(cookieValue);
              if (decodedValue && decodedValue.trim()) {
                const userData = JSON.parse(decodedValue);
                setProfile(userData);
              } else {
                setLoadError("Données utilisateur vides");
              }
            } catch (parseError) {
              console.error("Erreur de parsing des données cookie:", parseError);
              setLoadError("Données utilisateur corrompues. Veuillez vous reconnecter.");
            }
          } else {
            setLoadError("Cookie utilisateur vide");
          }
        } else {
          setLoadError("Erreur lors du chargement du profil. Veuillez vous reconnecter.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-500">
            <TranslatedText text="Chargement du profil..." />
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{loadError}</p>
          <button
            onClick={() => router.push("/login")}
            className="text-green-600 hover:underline"
          >
            <TranslatedText text="Retour à la connexion" />
          </button>
        </div>
      </div>
    );
  }

  const profileFields = [
    {
      label: "Nom",
      value: profile?.nom,
      icon: User,
      key: "nom",
    },
    {
      label: "Prénom",
      value: profile?.prenom,
      icon: User,
      key: "prenom",
    },
    {
      label: "Email",
      value: profile?.email,
      icon: Mail,
      key: "email",
    },
    {
      label: "Téléphone",
      value: profile?.phone,
      icon: Phone,
      key: "phone",
    },
  ] as const;

  const profileTitle = profile?.prenom || profile?.nom
    ? `${profile?.prenom || ""} ${profile?.nom || ""}`.trim()
    : "Mon Profil";

  return (
    <div className="min-h-screen bg-[#f5f6f8] py-8 px-4 sm:px-6">
      <div className="max-w-[860px] mx-auto">
        <div className="rounded-xl border border-[#eceff3] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06)] overflow-hidden">
          <div className="relative bg-[#04a847] px-7 md:px-10 pt-9 pb-16">
            <div className="absolute inset-0 opacity-[0.14]">
              <div className="absolute right-20 bottom-0 h-28 w-56 rounded-t-full border border-white/70 border-b-0" />
              <div className="absolute right-5 top-12 h-16 w-16 rounded-full border border-white/70" />
            </div>

            <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-5">
                <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <User className="h-11 w-11 text-[#0c9c46]" />
                </div>
                <div>
                  <h1 className="text-[37px] leading-none font-semibold text-white">{profileTitle}</h1>
                  <p className="mt-3 inline-flex items-center gap-2 text-white/85 text-sm">
                    <CalendarDays className="h-[15px] w-[15px]" />
                    <TranslatedText text="Membre depuis mai 2024" />
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={isEditing ? handleSave : handleEdit}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-[#078b3c] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#067c36] disabled:cursor-not-allowed disabled:opacity-80"
              >
                <PencilLine className="h-4 w-4" />
                <TranslatedText text={isSaving ? "Sauvegarde..." : isEditing ? "Sauvegarder" : "Modifier le profil"} />
              </button>
            </div>
          </div>

          <div className="-mt-8 px-5 pb-9 md:px-6">
            {editError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {editError}
              </div>
            )}

            <table className="w-full overflow-hidden rounded-xl border border-[#e9edf2] bg-white shadow-[0_3px_10px_rgba(15,23,42,0.08)]">
              <tbody>
                {profileFields.map((field, index) => (
                  <tr
                    key={field.label}
                    className={index !== profileFields.length - 1 ? "border-b border-[#edf0f4]" : ""}
                  >
                    <td className="py-4 px-4 md:px-6 w-[42%]">
                      <div className="flex items-center gap-3 text-gray-700">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#eff8f3]">
                          <field.icon className="h-5 w-5 text-[#1f7d4f]" />
                        </span>
                        <span className="font-medium text-[#2d3748]">{field.label}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 md:px-6">
                      {isEditing ? (
                        <input
                          type={field.label === "Email" ? "email" : field.label === "Téléphone" ? "tel" : "text"}
                          value={(editForm[field.key] as string) || ""}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              [field.key]: e.target.value,
                            }))
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-[#1f2937] outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        />
                      ) : (
                        <span className="text-[#1f2937] font-medium">
                          {field.value || "-"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {isEditing && (
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center rounded-md border border-gray-600 bg-gray-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                >
                  <TranslatedText text="Annuler" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
