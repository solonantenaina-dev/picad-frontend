"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function InscriptionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    role: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    nom: "",
    prenom: "",
    role: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const validateNom = (nom: string) => {
    if (!nom.trim()) return "Le nom est requis";
    if (nom.trim().length < 2) return "Le nom doit contenir au moins 2 caractères";
    return "";
  };

  const validatePrenom = (prenom: string) => {
    if (!prenom.trim()) return "Le prénom est requis";
    if (prenom.trim().length < 2) return "Le prénom doit contenir au moins 2 caractères";
    return "";
  };

  const validateRole = (role: string) => {
    if (!role.trim()) return "Le rôle est requis";
    return "";
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "L'adresse email est requise";
    if (!emailRegex.test(email)) return "Format d'email invalide";
    return "";
  };

  const validateTelephone = (telephone: string) => {
    const phoneRegex = /^[0-9+\s\-()]+$/;
    if (!telephone.trim()) return "Le numéro de téléphone est requis";
    if (!phoneRegex.test(telephone)) return "Format de téléphone invalide";
    if (telephone.replace(/\D/g, "").length < 8) return "Le numéro doit contenir au moins 8 chiffres";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Le mot de passe est requis";
    if (password.length < 6) return "Le mot de passe doit contenir au moins 6 caractères";
    return "";
  };

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) return "La confirmation du mot de passe est requise";
    if (confirmPassword !== password) return "Les mots de passe ne correspondent pas";
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validation en temps réel
    if (name === "nom") {
      setErrors((prev) => ({
        ...prev,
        nom: validateNom(value),
      }));
    } else if (name === "prenom") {
      setErrors((prev) => ({
        ...prev,
        prenom: validatePrenom(value),
      }));
    } else if (name === "role") {
      setErrors((prev) => ({
        ...prev,
        role: validateRole(value),
      }));
    } else if (name === "email") {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(value),
      }));
    } else if (name === "telephone") {
      setErrors((prev) => ({
        ...prev,
        telephone: validateTelephone(value),
      }));
    } else if (name === "password") {
      const passwordError = validatePassword(value);
      setErrors((prev) => ({
        ...prev,
        password: passwordError,
        confirmPassword: formData.confirmPassword
          ? validateConfirmPassword(formData.confirmPassword, value)
          : prev.confirmPassword,
      }));
    } else if (name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value, formData.password),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    // Validation finale
    const nomError = validateNom(formData.nom);
    const prenomError = validatePrenom(formData.prenom);
    const roleError = validateRole(formData.role);
    const emailError = validateEmail(formData.email);
    const telephoneError = validateTelephone(formData.telephone);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.confirmPassword,
      formData.password
    );

    if (
      nomError ||
      prenomError ||
      roleError ||
      emailError ||
      telephoneError ||
      passwordError ||
      confirmPasswordError
    ) {
      setErrors({
        nom: nomError,
        prenom: prenomError,
        role: roleError,
        email: emailError,
        telephone: telephoneError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        "https://n8n.itdcmada.com/webhook-test/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nom: formData.nom.trim(),
            prenom: formData.prenom.trim(),
            role: formData.role.trim(),
            email: formData.email.trim(),
            telephone: formData.telephone.trim(),
            password: formData.password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de l'inscription");
      }

      const data = await response.json();

      setSubmitResult({
        success: true,
        message: "Inscription réussie ! Vous allez être redirigé...",
      });

      // Redirection après 2 secondes
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      setSubmitResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Échec de l'inscription. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    !errors.nom &&
    !errors.prenom &&
    !errors.role &&
    !errors.email &&
    !errors.telephone &&
    !errors.password &&
    !errors.confirmPassword &&
    formData.nom &&
    formData.prenom &&
    formData.role &&
    formData.email &&
    formData.telephone &&
    formData.password &&
    formData.confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-green-200">
        {/* En-tête */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-green-800">Inscription</h2>
          <p className="mt-2 text-sm text-black">
            Créez votre compte pour accéder à la plateforme
          </p>
        </div>

        {/* Formulaire */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Champ Prénom */}
            <div>
              <label
                htmlFor="prenom"
                className="block text-sm font-medium text-black mb-1"
              >
                Prénom
              </label>
              <input
                id="prenom"
                name="prenom"
                type="text"
                value={formData.prenom}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                  errors.prenom
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-green-300 focus:ring-green-500 focus:border-green-500"
                }`}
                placeholder="Votre prénom"
              />
              {errors.prenom && (
                <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>
              )}
            </div>

            {/* Champ Nom */}
            <div>
              <label
                htmlFor="nom"
                className="block text-sm font-medium text-black mb-1"
              >
                Nom
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                value={formData.nom}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                  errors.nom
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-green-300 focus:ring-green-500 focus:border-green-500"
                }`}
                placeholder="Votre nom"
              />
              {errors.nom && (
                <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
              )}
            </div>
          </div>

          {/* Champ Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-black mb-1"
            >
              Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                errors.email
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-green-300 focus:ring-green-500 focus:border-green-500"
              }`}
              placeholder="votre@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Champ Téléphone */}
          <div>
            <label
              htmlFor="telephone"
              className="block text-sm font-medium text-black mb-1"
            >
              Numéro de téléphone
            </label>
            <input
              id="telephone"
              name="telephone"
              type="tel"
              value={formData.telephone}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                errors.telephone
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-green-300 focus:ring-green-500 focus:border-green-500"
              }`}
              placeholder="+261 34 12 345 67"
            />
            {errors.telephone && (
              <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>
            )}
          </div>

          {/* Champ Rôle */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-black mb-1"
            >
              Rôle
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                errors.role
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-green-300 focus:ring-green-500 focus:border-green-500"
              }`}
            >
              <option value="">Sélectionnez un rôle</option>
              <option value="administrateur_centrale">Administrateur centrale</option>
              <option value="administrateur_regionale">Administrateur regionale</option>
              <option value="agent_terrain">Agent de terrain</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role}</p>
            )}
          </div>

          {/* Champ Mot de passe */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-black mb-1"
            >
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors pr-12 ${
                  errors.password
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-green-300 focus:ring-green-500 focus:border-green-500"
                }`}
                placeholder="Votre mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Champ Confirmation mot de passe */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-black mb-1"
            >
              Confirmation du mot de passe
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors pr-12 ${
                  errors.confirmPassword
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-green-300 focus:ring-green-500 focus:border-green-500"
                }`}
                placeholder="Confirmez votre mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                aria-label={
                  showConfirmPassword
                    ? "Masquer la confirmation"
                    : "Afficher la confirmation"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Message de résultat */}
          {submitResult && (
            <div
              className={`p-4 rounded-lg ${
                submitResult.success
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}
            >
              {submitResult.message}
            </div>
          )}

          {/* Bouton de soumission */}
          <div>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors ${
                isFormValid && !isSubmitting
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-green-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Inscription en cours...
                </div>
              ) : (
                "S'inscrire"
              )}
            </button>
          </div>
        </form>

        {/* Lien vers la connexion */}
        <div className="text-center text-sm mt-6">
          <span className="text-gray-600">Déjà un compte ? </span>
          <Link
            href="/login"
            className="font-medium text-green-600 hover:text-green-500 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}

