/** Google Website Translator widget loaded from translate.google.com */
export {};

declare global {
  interface Window {
    google?: {
      translate: {
        TranslateElement: {
          new (
            options: Record<string, unknown>,
            elementId: string,
          ): unknown;
          InlineLayout: { SIMPLE: number };
        };
      };
    };
    googleTranslateElementInit?: () => void;
  }
}
