"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageContext } from "@/context/LanguageContext";
import {
  Loader2,
  Users,
  Shield,
  Mail,
  Calendar,
  Search,
  Filter,
  Pencil,
  Trash2,
  MoreVertical,
  Check,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

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

const PRIMARY = "#00A651";
const BG_PAGE = "#F8F9FA";
const BORDER = "#E9ECEF";

function initials(user: User): string {
  const p = (user.prenom || "").trim().charAt(0);
  const n = (user.nom || "").trim().charAt(0);
  const combined = `${p}${n}`.toUpperCase();
  if (combined) return combined.slice(0, 2);
  return (user.email || "?").charAt(0).toUpperCase();
}

const avatarStyles = [
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

export default function AdministrateurPage() {
  const router = useRouter();
  const { t } = useContext(LanguageContext);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("__all__");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser.id ? { ...user, ...editForm } : user
        )
      );

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
            .filter((user: User | null): user is User => user !== null);
        } else if (data && typeof data === "object") {
          if (Array.isArray(data.user)) {
            processedUsers = data.user
              .map(normalizeUser)
              .filter((user: User | null): user is User => user !== null);
          } else if (Array.isArray(data.json)) {
            processedUsers = data.json
              .map(normalizeUser)
              .filter((user: User | null): user is User => user !== null);
          } else if (Array.isArray(data.data)) {
            processedUsers = data.data
              .map(normalizeUser)
              .filter((user: User | null): user is User => user !== null);
          } else if (Array.isArray(data.items)) {
            processedUsers = data.items
              .map(normalizeUser)
              .filter((user: User | null): user is User => user !== null);
          } else if (data.user && typeof data.user === "object") {
            processedUsers = [normalizeUser(data.user)].filter(
              (user: User | null): user is User => user !== null,
            );
          } else if (data.json && typeof data.json === "object") {
            processedUsers = [normalizeUser(data.json)].filter(
              (user: User | null): user is User => user !== null,
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

  const roleOptions = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.role) set.add(String(u.role));
    });
    return Array.from(set).sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    let list = users;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((u) => {
        const hay = [
          u.id,
          u.prenom,
          u.nom,
          u.email,
          u.phone,
          u.role,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    if (roleFilter !== "__all__") {
      list = list.filter((u) => String(u.role || "") === roleFilter);
    }
    return list;
  }, [users, searchQuery, roleFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, pageSize]);

  const totalFiltered = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize) || 1);

  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const page = Math.min(currentPage, totalPages);
  const startIdx = (page - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIdx, startIdx + pageSize);
  const rangeStart = totalFiltered === 0 ? 0 : startIdx + 1;
  const rangeEnd = Math.min(startIdx + pageSize, totalFiltered);

  const stats = useMemo(() => {
    const total = users.length;
    const adminLike = users.filter((u) =>
      String(u.role || "")
        .toLowerCase()
        .includes("admin"),
    ).length;
    const withEmail = users.filter((u) => u.email && String(u.email).trim()).length;
    const periodLabel = new Date().toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
    return { total, adminLike, withEmail, periodLabel };
  }, [users]);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: BG_PAGE }}>
      <div className="max-w-7xl mx-auto">
        {/* En-tête page */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex flex-wrap items-baseline gap-x-1.5">
              <span className="border-b-[3px] pb-0.5" style={{ borderColor: PRIMARY }}>
                <TranslatedText text="Page" />
              </span>
              <TranslatedText text="d'administration" />
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              <TranslatedText text="Gérez les utilisateurs et leurs informations." />
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/inscription")}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ backgroundColor: PRIMARY }}
          >
            <Plus className="h-4 w-4" />
            <TranslatedText text="Ajouter un utilisateur" />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: PRIMARY }} />
              <p className="text-gray-500">
                <TranslatedText text="Chargement de la liste des utilisateurs..." />
              </p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Cartes statistiques */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div
                className="rounded-xl bg-white p-5 shadow-sm"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "rgba(0, 166, 81, 0.12)" }}
                  >
                    <Users className="h-5 w-5" style={{ color: PRIMARY }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-600">
                      <TranslatedText text="Utilisateurs totaux" />
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      <TranslatedText text="Tous les comptes enregistrés" />
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="rounded-xl bg-white p-5 shadow-sm"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "rgba(0, 166, 81, 0.12)" }}
                  >
                    <Shield className="h-5 w-5" style={{ color: PRIMARY }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-600">
                      <TranslatedText text="Profils administration" />
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{stats.adminLike}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      <TranslatedText text="Comptes avec rôle administrateur" />
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="rounded-xl bg-white p-5 shadow-sm"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "rgba(0, 166, 81, 0.12)" }}
                  >
                    <Mail className="h-5 w-5" style={{ color: PRIMARY }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-600">
                      <TranslatedText text="Adresses email" />
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{stats.withEmail}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      <TranslatedText text="Utilisateurs avec email renseigné" />
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="rounded-xl bg-white p-5 shadow-sm"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "rgba(0, 166, 81, 0.12)" }}
                  >
                    <Calendar className="h-5 w-5" style={{ color: PRIMARY }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-600">
                      <TranslatedText text="Période" />
                    </p>
                    <p className="mt-1 text-xl font-bold capitalize text-gray-900">
                      {stats.periodLabel}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      <TranslatedText text="Vue mise à jour en temps réel" />
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tableau */}
            <div
              className="overflow-hidden rounded-xl bg-white shadow-sm"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: `1px solid ${BORDER}` }}
            >
              <div className="border-b p-4 sm:p-5" style={{ borderColor: BORDER }}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative min-w-0 flex-1 max-w-xl">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t("Rechercher un utilisateur...")}
                      className="w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#00A651]"
                      style={{ borderColor: BORDER }}
                      aria-label={t("Rechercher un utilisateur...")}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#00A651]"
                      style={{ borderColor: BORDER }}
                    >
                      <option value="__all__">{t("Tous les rôles")}</option>
                      {roleOptions.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <select
                      disabled
                      className="cursor-not-allowed rounded-lg border bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
                      style={{ borderColor: BORDER }}
                      aria-disabled
                    >
                      <option>{t("Statut : Tous")}</option>
                    </select>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm"
                      style={{ borderColor: BORDER }}
                    >
                      <Filter className="h-4 w-4 text-gray-500" />
                      <TranslatedText text="Filtrer" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px]">
                  <thead>
                    <tr className="text-left text-white" style={{ backgroundColor: PRIMARY }}>
                      <th className="px-4 py-3.5 text-sm font-semibold whitespace-nowrap">
                        <TranslatedText text="ID" />
                      </th>
                      <th className="px-4 py-3.5 text-sm font-semibold whitespace-nowrap">
                        <TranslatedText text="Prénom" />
                      </th>
                      <th className="px-4 py-3.5 text-sm font-semibold whitespace-nowrap">
                        <TranslatedText text="Nom" />
                      </th>
                      <th className="px-4 py-3.5 text-sm font-semibold whitespace-nowrap">
                        <TranslatedText text="Email" />
                      </th>
                      <th className="px-4 py-3.5 text-sm font-semibold whitespace-nowrap">
                        <TranslatedText text="Téléphone" />
                      </th>
                      <th className="px-4 py-3.5 text-sm font-semibold whitespace-nowrap">
                        <TranslatedText text="Rôle" />
                      </th>
                      <th className="px-4 py-3.5 text-sm font-semibold whitespace-nowrap">
                        <TranslatedText text="Statut" />
                      </th>
                      <th className="px-4 py-3.5 text-sm font-semibold whitespace-nowrap text-right">
                        <TranslatedText text="Actions" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                          <TranslatedText text="Aucun utilisateur trouvé" />
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((user, index) => (
                        <tr
                          key={user.id || index}
                          className={cn(
                            "border-t transition-colors",
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/80",
                          )}
                          style={{ borderColor: BORDER }}
                        >
                          <td className="px-4 py-4 align-middle">
                            <span
                              className="inline-block max-w-[140px] truncate rounded-md px-2 py-1 font-mono text-xs text-gray-600"
                              style={{ backgroundColor: "#F1F3F5" }}
                              title={user.id || undefined}
                            >
                              {startIdx + index + 1}
                            </span>
                          </td>
                          <td className="px-4 py-4 align-middle">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                                  avatarStyles[
                                    Math.abs((user.id || "").length + index) % avatarStyles.length
                                  ],
                                )}
                              >
                                {initials(user)}
                              </span>
                              {editingUser?.id === user.id ? (
                                <input
                                  type="text"
                                  value={editForm.prenom || ""}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, prenom: e.target.value })
                                  }
                                  className="min-w-0 flex-1 rounded-md border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A651]"
                                />
                              ) : (
                                <span className="text-sm text-gray-900">{user.prenom || "-"}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 align-middle text-sm text-gray-900">
                            {editingUser?.id === user.id ? (
                              <input
                                type="text"
                                value={editForm.nom || ""}
                                onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                                className="w-full min-w-[100px] rounded-md border px-2 py-1.5 text-sm focus:outline-none focus:ring-2"
                              />
                            ) : (
                              user.nom || "-"
                            )}
                          </td>
                          <td className="px-4 py-4 align-middle text-sm text-gray-900">
                            {editingUser?.id === user.id ? (
                              <input
                                type="email"
                                value={editForm.email || ""}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, email: e.target.value })
                                }
                                className="w-full min-w-[140px] rounded-md border px-2 py-1.5 text-sm focus:outline-none focus:ring-2"
                              />
                            ) : (
                              user.email || "-"
                            )}
                          </td>
                          <td className="px-4 py-4 align-middle text-sm text-gray-900">
                            {editingUser?.id === user.id ? (
                              <input
                                type="tel"
                                value={editForm.phone || ""}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, phone: e.target.value })
                                }
                                className="w-full min-w-[100px] rounded-md border px-2 py-1.5 text-sm focus:outline-none focus:ring-2"
                              />
                            ) : (
                              user.phone || "-"
                            )}
                          </td>
                          <td className="px-4 py-4 align-middle text-sm text-gray-900">
                            {editingUser?.id === user.id ? (
                              <input
                                type="text"
                                value={editForm.role || ""}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, role: e.target.value })
                                }
                                className="w-full min-w-[100px] rounded-md border px-2 py-1.5 text-sm focus:outline-none focus:ring-2"
                              />
                            ) : (
                              user.role || "-"
                            )}
                          </td>
                          <td className="px-4 py-4 align-middle">
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                              style={{ backgroundColor: PRIMARY }}
                            >
                              <Check className="h-3.5 w-3.5" />
                              <TranslatedText text="Actif" />
                            </span>
                          </td>
                          <td className="px-4 py-4 align-middle">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              {editingUser?.id === user.id ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={handleSave}
                                    className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
                                    style={{ backgroundColor: PRIMARY, borderColor: PRIMARY }}
                                  >
                                    <TranslatedText text="Sauvegarder" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="inline-flex items-center rounded-md border border-gray-400 bg-gray-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-gray-700"
                                  >
                                    <TranslatedText text="Annuler" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(user)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-sm font-medium transition hover:bg-gray-50"
                                    style={{ borderColor: PRIMARY, color: PRIMARY }}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    <TranslatedText text="Modifier" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(user)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                    style={{ borderColor: "#DC3545" }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <TranslatedText text="Supprimer" />
                                  </button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        type="button"
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-white text-gray-600 transition hover:bg-gray-50"
                                        style={{ borderColor: BORDER }}
                                        aria-label="Plus d'actions"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="min-w-[160px]">
                                      <DropdownMenuItem onClick={() => handleEdit(user)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        <TranslatedText text="Modifier" />
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600"
                                        onClick={() => handleDelete(user)}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <TranslatedText text="Supprimer" />
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div
                className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                style={{ borderColor: BORDER }}
              >
                <p className="text-sm text-gray-500">
                  <TranslatedText text="Affichage de" /> {rangeStart}{" "}
                  <TranslatedText text="à" /> {rangeEnd}{" "}
                  <TranslatedText text="sur" /> {totalFiltered}{" "}
                  <TranslatedText text="utilisateurs" />
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-white text-gray-600 disabled:opacity-40"
                      style={{ borderColor: BORDER }}
                      aria-label="Page précédente"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span
                      className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg text-sm font-semibold text-white"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      {page}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-white text-gray-600 disabled:opacity-40"
                      style={{ borderColor: BORDER }}
                      aria-label="Page suivante"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="rounded-lg border bg-white px-3 py-2 text-sm text-gray-700"
                    style={{ borderColor: BORDER }}
                  >
                    {[10, 25, 50].map((n) => (
                      <option key={n} value={n}>
                        {n} / page
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {!loading && users.length === 0 && (
              <p className="mt-8 text-center text-gray-500">
                <TranslatedText text="Aucun utilisateur disponible" />
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
