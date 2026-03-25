"use client";

import { useContext } from 'react';
import { ArrowLeft, ArrowRight, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LanguageContext } from '@/context/LanguageContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function PageRestoreBar() {
  const router = useRouter();
  const { lang, setLang } = useContext(LanguageContext);
  const isTranslated = lang !== 'fr';

  if (!isTranslated) return null;

  const handleRestoreOriginal = () => {
    setLang('fr');
    // Optional: router.refresh() to reload content
  };

  const handleBack = () => {
    router.back();
  };

  const handleForward = () => {
    window.history.forward();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-xl border-t border-white/20 shadow-2xl">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Center: Google Logo + Restore */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
            <Globe className="h-5 w-5 text-white" />
            <span className="text-white font-medium text-sm hidden sm:block">Google</span>
          </div>
          <Button
            size="sm"
            onClick={handleRestoreOriginal}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30 font-medium"
          >
            Restore Original
          </Button>
        </div>

        {/* Forward Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleForward}
          className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full"
          aria-label="Forward"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

