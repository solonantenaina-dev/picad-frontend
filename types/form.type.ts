// Types pour le formulaire de saisie

export interface FilterOption {
  value: string;
  label: string;
}

export interface SearchFilterData {
  query: string;
  filter: FilterOption;
}

export interface EditorFormatting {
  fontSize: number;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  alignment: "left" | "center" | "right" | "justify";
}

export interface FormSubmissionData {
  searchFilter: SearchFilterData;
  attachment: {
    file: File | null;
    fileName: string | null;
    fileSize: number | null;
    fileType: string | null;
  };
  editorContent: {
    html: string;
    plainText: string;
  };
  metadata: {
    submittedAt: Date;
    submittedBy?: string;
  };
}

export interface FormSubmissionResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    pdfUrl?: string;
    createdAt: Date;
  };
  error?: string;
}

export interface LocationData {
  communes: FilterOption[];
  regions: FilterOption[];
  zones: FilterOption[];
  districts: FilterOption[];
}
