"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";

interface User {
  id?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  phone?: string;
  role?: string;
  json?: any;
  [key: string]: unknown;
}

export default function ParametresPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  const safeParseJson = async (response: Response): Promise<any> => {
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

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      id: user.id,
      nom: user.nom || "",
      prenom: user.prenom || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "",
    });
  };

  const handleSave = async () => {
    if (!editingUser?.id) {
      setError("Impossible de modifier un utilisateur sans identifiant.");
      return;
    }

    try {
      const response = await fetch("https://n8n.itdcmada.com/webhook/modifier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la modification de l'utilisateur");
      }

      const result = await safeParseJson(response);
      console.log("Modification réussie:", result);

      // Mettre à jour l'utilisateur dans la liste locale
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser.id ? { ...user, ...editForm } : user
        )
      );

      // Réinitialiser l'état d'édition
      setEditingUser(null);
      setEditForm({});
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la modification:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de la modification");
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setEditForm({});
    setError(null);
  };

  const handleDelete = async (user: User) => {
    if (!user.id) {
      setError("Impossible de supprimer un utilisateur sans identifiant.");
      return;
    }

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer l'utilisateur ${user.prenom || ""} ${user.nom || ""} ?`,
    );
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch("https://n8n.itdcmada.com/webhook/supprimer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: user.id }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'utilisateur.");
      }

      const data = await safeParseJson(response);
      console.log("Suppression response:", data);

      if (!data || data.success !== true) {
        throw new Error(data?.message || "La suppression a échoué.");
      }

      setUsers((currentUsers) => currentUsers.filter((current) => current.id !== user.id));
    } catch (err) {
      console.error("Erreur de suppression:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de la suppression.");
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://n8n.itdcmada.com/webhook/administration", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        if (!response.ok) {
          throw new Error("Erreur lors du chargement de la liste des utilisateurs");
        }

        const data = await safeParseJson(response);
        console.log("RAW DATA:", data);

        const normalizeUser = (item: any): User | null => {
          if (!item || typeof item !== "object") return null;
          if (item.user && typeof item.user === "object") return item.user as User;
          if (item.json && typeof item.json === "object") return item.json as User;
          return item as User;
        };

        let processedUsers: User[] = [];

        if (Array.isArray(data)) {
          processedUsers = data
            .map(normalizeUser)
            .filter((user): user is User => user !== null);
        } else if (data && typeof data === "object") {
          if (Array.isArray(data.user)) {
            processedUsers = data.user
              .map(normalizeUser)
              .filter((user): user is User => user !== null);
          } else if (Array.isArray(data.json)) {
            processedUsers = data.json
              .map(normalizeUser)
              .filter((user): user is User => user !== null);
          } else if (Array.isArray(data.data)) {
            processedUsers = data.data
              .map(normalizeUser)
              .filter((user): user is User => user !== null);
          } else if (Array.isArray(data.items)) {
            processedUsers = data.items
              .map(normalizeUser)
              .filter((user): user is User => user !== null);
          } else if (data.user && typeof data.user === "object") {
            processedUsers = [normalizeUser(data.user)].filter(
              (user): user is User => user !== null,
            );
          } else if (data.json && typeof data.json === "object") {
            processedUsers = [normalizeUser(data.json)].filter(
              (user): user is User => user !== null,
            );
          } else {
            const maybeUser = normalizeUser(data);
            if (maybeUser) {
              processedUsers = [maybeUser];
            }
          }
        }

        console.log("PROCESSED USERS:", processedUsers);
        setUsers(processedUsers);
      } catch (err) {
        console.error("Erreur:", err);
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center text-gray-600 hover:text-green-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <TranslatedText text="Retour" />
        </button>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <TranslatedText text="Paramètres" />
          </h1>
          <div className="w-24 h-1 bg-green-600 rounded-t-sm" />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-gray-500">
                <TranslatedText text="Chargement de la liste des utilisateurs..." />
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Users Table */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-green-600 text-white">
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      <TranslatedText text="ID" />
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      <TranslatedText text="Prénom" />
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      <TranslatedText text="Nom" />
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      <TranslatedText text="Email" />
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      <TranslatedText text="Téléphone" />
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      <TranslatedText text="Role" />
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      <TranslatedText text="Actions" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        <TranslatedText text="Aucun utilisateur trouvé" />
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <tr
                        key={user.id || index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">{user.id || "-"}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {editingUser?.id === user.id ? (
                            <input
                              type="text"
                              value={editForm.prenom || ""}
                              onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          ) : (
                            user.prenom || "-"
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {editingUser?.id === user.id ? (
                            <input
                              type="text"
                              value={editForm.nom || ""}
                              onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          ) : (
                            user.nom || "-"
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {editingUser?.id === user.id ? (
                            <input
                              type="email"
                              value={editForm.email || ""}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          ) : (
                            user.email || "-"
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {editingUser?.id === user.id ? (
                            <input
                              type="tel"
                              value={editForm.phone || ""}
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          ) : (
                            user.phone || "-"
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {editingUser?.id === user.id ? (
                            <input
                              type="text"
                              value={editForm.role || ""}
                              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          ) : (
                            user.role || "-"
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 flex space-x-2">
                          {editingUser?.id === user.id ? (
                            <>
                              <button
                                type="button"
                                onClick={handleSave}
                                className="inline-flex items-center rounded-md border border-green-600 bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                              >
                                <TranslatedText text="Sauvegarder" />
                              </button>
                              <button
                                type="button"
                                onClick={handleCancel}
                                className="inline-flex items-center rounded-md border border-gray-600 bg-gray-600 px-3 py-1 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                              >
                                <TranslatedText text="Annuler" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleEdit(user)}
                                className="inline-flex items-center rounded-md border border-green-600 bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                              >
                                <TranslatedText text="Modifier" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(user)}
                                className="inline-flex items-center rounded-md border border-red-600 bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                              >
                                <TranslatedText text="Supprimer" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State when no users */}
        {!loading && !error && users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              <TranslatedText text="Aucun utilisateur disponible" />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
