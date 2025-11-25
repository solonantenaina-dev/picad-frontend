"use client";

import { useState, useCallback } from "react";
import { TextEditor } from "@/components/text-editor.component";
import { SearchFilter } from "@/components/search-filter.component";
import { FileUpload } from "@/components/file-upload.component";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterData {
  query: string;
  filter: FilterOption;
}

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [editorHtml, setEditorHtml] = useState("");
  const [editorPlainText, setEditorPlainText] = useState("");
  const [searchFilterData, setSearchFilterData] =
    useState<SearchFilterData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleEditorChange = useCallback((html: string, plainText: string) => {
    setEditorHtml(html);
    setEditorPlainText(plainText);
  }, []);

  const handleSearchFilterChange = useCallback((data: SearchFilterData) => {
    setSearchFilterData(data);
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);

    // Simulation d'envoi
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (!editorPlainText.trim()) {
      setSubmitResult({
        success: false,
        message: "Le contenu de l'éditeur ne peut pas être vide",
      });
    } else {
      setSubmitResult({
        success: true,
        message: "Formulaire soumis avec succès",
      });
    }

    setIsSubmitting(false);
  };

  const handleCancel = () => {
    setFile(null);
    setEditorHtml("");
    setEditorPlainText("");
    setSearchFilterData(null);
    setSubmitResult(null);
  };

  const dynamicText =
    "Bienvenue dans la prise de note de réunion. Vous pouvez saisir vos commentaires, ajouter des fichiers et filtrer par commune.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            Prise de note de la réunion
          </h1>
          <div className="mt-2 h-1 w-[150px] rounded bg-green-600" />
          <p className="mt-4 text-muted-foreground">{dynamicText}</p>
        </div>

        {/* Search Filter */}
        <div className="mb-8">
          <SearchFilter onSearch={handleSearchFilterChange} />
        </div>

        {/* Form Card */}
        <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
          <div className="bg-green-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">
              Formulaire de saisie
            </h2>
          </div>

          <div className="p-6 space-y-6">
            <FileUpload onFileChange={setFile} />
            <TextEditor onChange={handleEditorChange} />

            {submitResult && (
              <div
                className={cn(
                  "p-4 rounded-lg",
                  submitResult.success
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                )}
              >
                {submitResult.message}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-4">
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="text-muted-foreground hover:text-foreground"
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Soumettre
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Div */}
        <div className="mt-6 p-4 border-t border-gray-200 text-sm text-muted-foreground">
          Nombre total de notes enregistrées: 45 (données simulées)
        </div>
      </div>
    </div>
  );
}
