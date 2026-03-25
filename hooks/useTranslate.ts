import { useContext, useState, useEffect } from "react";
import { LanguageContext } from "@/context/LanguageContext";

// Hook corrigé pour traduire un texte de manière asynchrone
export function useTranslate(text: string) {
  const { t, translateText, lang } = useContext(LanguageContext);
  const [translated, setTranslated] = useState(t(text));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const staticTrans = t(text);
    if (staticTrans !== text) {
      setTranslated(staticTrans);
      return;
    }

    let mounted = true;
    setLoading(true);
    translateText(text).then((res) => {
      if (mounted) {
        setTranslated(res);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [text, t, translateText]);

  return { translated, loading };
}
