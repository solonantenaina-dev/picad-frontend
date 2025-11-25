import type {
  FormSubmissionData,
  FormSubmissionResponse,
  LocationData,
  FilterOption,
} from "@/types/form.type";

// Données statiques pour les filtres de localisation
const staticLocationData: LocationData = {
  communes: [
    { value: "commune-1", label: "Commune Antananarivo" },
    { value: "commune-2", label: "Commune Antsirabe" },
    { value: "commune-3", label: "Commune Fianarantsoa" },
    { value: "commune-4", label: "Commune Toamasina" },
    { value: "commune-5", label: "Commune Mahajanga" },
  ],
  regions: [
    { value: "region-1", label: "Analamanga" },
    { value: "region-2", label: "Vakinankaratra" },
    { value: "region-3", label: "Haute Matsiatra" },
    { value: "region-4", label: "Atsinanana" },
    { value: "region-5", label: "Boeny" },
  ],
  zones: [
    { value: "zone-1", label: "Zone Nord" },
    { value: "zone-2", label: "Zone Sud" },
    { value: "zone-3", label: "Zone Est" },
    { value: "zone-4", label: "Zone Ouest" },
    { value: "zone-5", label: "Zone Centre" },
  ],
  districts: [
    { value: "district-1", label: "District Antananarivo-Renivohitra" },
    { value: "district-2", label: "District Antsirabe I" },
    { value: "district-3", label: "District Fianarantsoa I" },
    { value: "district-4", label: "District Toamasina I" },
    { value: "district-5", label: "District Mahajanga I" },
  ],
};

// Service pour la gestion du formulaire
export const formService = {
  async getLocationData(): Promise<LocationData> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return staticLocationData;
  },

  async getFilterOptions(filterType: string): Promise<FilterOption[]> {
    const locationData = await this.getLocationData();

    switch (filterType) {
      case "commune":
        return locationData.communes;
      case "region":
        return locationData.regions;
      case "zone":
        return locationData.zones;
      case "district":
        return locationData.districts;
      default:
        return [];
    }
  },

  async submitForm(data: FormSubmissionData): Promise<FormSubmissionResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (!data.editorContent.plainText.trim()) {
      return {
        success: false,
        message: "Le contenu de l'éditeur ne peut pas être vide",
        error: "EMPTY_CONTENT",
      };
    }

    return {
      success: true,
      message: "Formulaire soumis avec succès",
      data: {
        id: `submission-${Date.now()}`,
        pdfUrl: data.attachment.file
          ? `/generated/${data.attachment.fileName}`
          : undefined,
        createdAt: new Date(),
      },
    };
  },

  async generatePdf(htmlContent: string): Promise<Blob | null> {
    console.log("PDF generation would include:", htmlContent);
    return null;
  },
};
