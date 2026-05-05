"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, ArrowLeft, Loader2 } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";

interface UserProfile {
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
  const [error, setError] = useState<string | null>(null);

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
        } else if (data.error) {
          console.log("API error, falling back to cookie:", data.error);
          // Fall back to cookie data if API fails
          const userCookie = cookies.find((row) => row.startsWith("auth-user="));
          if (userCookie) {
            const cookieValue = userCookie.split("=")[1];
            const userData = JSON.parse(decodeURIComponent(cookieValue));
            setProfile(userData);
          } else {
            setError("Aucune donnée utilisateur trouvée. Veuillez vous reconnecter.");
          }
        }
      } catch (err) {
        console.error("Error in fetchProfile:", err);
        
        // Fall back to cookie data on network error
        const cookies = document.cookie.split("; ");
        const userCookie = cookies.find((row) => row.startsWith("auth-user="));
        if (userCookie) {
          const cookieValue = userCookie.split("=")[1];
          try {
            const userData = JSON.parse(decodeURIComponent(cookieValue));
            setProfile(userData);
          } catch (e) {
            setError("Données utilisateur corrompues");
          }
        } else {
          setError("Erreur lors du chargement du profil");
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
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
    },
    {
      label: "Prénom",
      value: profile?.prenom,
      icon: User,
    },
    {
      label: "Email",
      value: profile?.email,
      icon: Mail,
    },
    {
      label: "Téléphone",
      value: profile?.phone,
      icon: Phone,
    },
  ];

  const profileTitle = profile?.prenom || profile?.nom
    ? `${profile?.prenom || ""} ${profile?.nom || ""}`.trim()
    : "Mon Profil";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center text-gray-600 hover:text-green-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <TranslatedText text="Retour" />
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 px-6 py-8">
            <div className="flex items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center">
                <User className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h1 className="text-center text-2xl font-bold text-white mt-4">
              {profileTitle}
            </h1>
          </div>

          {/* Profile Table */}
          <div className="px-6 py-6">
            <table className="w-full">
              <tbody>
                {profileFields.map((field, index) => (
                  <tr
                    key={field.label}
                    className={index !== profileFields.length - 1 ? "border-b border-gray-200" : ""}
                  >
                    <td className="py-4 pr-4 w-1/3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <field.icon className="h-4 w-4" />
                        <span className="font-medium">{field.label}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-gray-900">
                        {field.value || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
