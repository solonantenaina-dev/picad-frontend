"use client";

import { useState, useCallback } from "react";
import { TextEditor } from "@/components/text-editor.component";
import { SearchFilter, type SearchFilterData } from "@/components/search-filter.component";
import { FileUpload } from "@/components/file-upload.component";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const handleEditorChange = useCallback(
    (html: string, plainText: string) => {
      setEditorHtml(html);
      setEditorPlainText(plainText);
    },
    []
  );

  const handleSearchFilterChange = useCallback((data: SearchFilterData) => {
    setSearchFilterData(data);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    if (!editorPlainText.trim()) {
      setSubmitResult({
        success: false,
        message: "Le contenu de la note est obligatoire",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();

      formData.append("content_html", editorHtml);
      formData.append("content_text", editorPlainText);

      if (searchFilterData) {
        formData.append("search_query", searchFilterData.query);
        formData.append("filter_value", searchFilterData.filter.value);
        formData.append("filter_label", searchFilterData.filter.label);
        if (searchFilterData.location) {
          formData.append("location_nom", searchFilterData.location.nom);
          formData.append("location_ville", searchFilterData.location.ville);
          formData.append("location_region", searchFilterData.location.region);
          formData.append("location_commune", searchFilterData.location.commune);
          formData.append("location_lat", searchFilterData.location.lat);
          formData.append("location_lon", searchFilterData.location.lon);
          formData.append("location_display_name", searchFilterData.location.display_name);
        }
      }

      if (file) {
        formData.append("file", file);
      }

      const response = await fetch(
        "https://n8n.itdcmada.com/webhook-test/documents",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Erreur d’envoi");
      }

      setSubmitResult({
        success: true,
        message: "Note envoyée avec succès",
      });

      setFile(null);
      setEditorHtml("");
      setEditorPlainText("");
      setSearchFilterData(null);
    } catch (error) {
      setSubmitResult({
        success: false,
        message: "Échec de l’envoi vers le serveur",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Prise de note de la réunion
          </h1>
          <div className="w-24 h-1 bg-green-600 mb-3" />
        </div>

        <SearchFilter onSearch={handleSearchFilterChange} />

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-xl border bg-background shadow-sm"
        >
          <div className="bg-green-600 px-6 py-4 text-white font-semibold">
            Formulaire de saisie
          </div>

          <div className="p-6 space-y-6">
            <FileUpload onFileChange={setFile} />
            <TextEditor onChange={handleEditorChange} />

            {submitResult && (
              <div
                className={cn(
                  "p-4 rounded",
                  submitResult.success
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                )}
              >
                {submitResult.message}
              </div>
            )}

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setEditorHtml("");
                  setEditorPlainText("");
                  setSearchFilterData(null);
                  setSubmitResult(null);
                }}
                className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 text-white hover:bg-green-700"
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
        </form>
      </div>
    </div>
  );
}

