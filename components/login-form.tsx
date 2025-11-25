"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth-token="));
      if (token) {
        router.push("/");
      }
    };
    checkAuth();
  }, [router]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "L'email est requis";
    if (!emailRegex.test(email)) return "Format d'email invalide";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Le mot de passe est requis";
    if (password.length < 6)
      return "Le mot de passe doit contenir au moins 6 caractères";
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "email") {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(value),
      }));
    } else if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(value),
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Tentative de connexion avec:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      document.cookie = "auth-token=simulated-token; path=/; max-age=86400";
      router.push("/");
    } catch (error) {
      console.error("Erreur de connexion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    !errors.email && !errors.password && formData.email && formData.password;

  return (
    <div className="w-full max-w-sm">
      {/* Card Container with Glassmorphism */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Bienvenue
          </h2>
          <p className="text-sm text-white/60">
            Connectez-vous à votre compte pour continuer
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white/90"
            >
              Adresse email
            </label>
            <div className="relative group">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg backdrop-blur-sm transition-all duration-300 text-white placeholder-white/40 focus:outline-none ${
                  errors.email
                    ? "border-red-400/50 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                    : "border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                }`}
                placeholder="votre@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-300 animate-pulse">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/90"
            >
              Mot de passe
            </label>
            <div className="relative group">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg backdrop-blur-sm transition-all duration-300 text-white placeholder-white/40 focus:outline-none pr-12 ${
                  errors.password
                    ? "border-red-400/50 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                    : "border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                }`}
                placeholder="Votre mot de passe"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors focus:outline-none"
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
              <p className="text-xs text-red-300 animate-pulse">
                {errors.password}
              </p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end pt-2">
            <a
              href="#"
              className="text-xs text-white/60 hover:text-blue-300 transition-colors"
            >
              Mot de passe oublié ?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              isFormValid && !isSubmitting
                ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl"
                : "bg-white/10 text-white/50 cursor-not-allowed border border-white/10"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Connexion en cours...</span>
              </>
            ) : (
              <>
                <span>Se connecter</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-xs text-white/40">ou</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        {/* Sign Up Link */}
        <div className="text-center text-sm">
          <span className="text-white/60">Pas encore de compte ? </span>
          <a
            href="#"
            className="text-blue-300 hover:text-blue-200 font-medium transition-colors"
          >
            S\'inscrire
          </a>
        </div>
      </div>
    </div>
  );
}
