"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LayersPanel from "./layers-panel";
import MadagascarMap from "./madagascar-map";
import AIChatAssistant from "./ai-chat-assistant";
import { SearchFilter } from "@/components/search-filter.component";

export interface FilterOption {
  value: string;
  label: string;
}

export interface SearchFilterData {
  query: string;
  filter: FilterOption;
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export default function CartographieContent() {
  const [searchFilterData, setSearchFilterData] =
    useState<SearchFilterData | null>(null);

  const handleSearchFilterChange = useCallback((data: SearchFilterData) => {
    setSearchFilterData(data);
  }, []);

  const dynamicText =
    "Bienvenue sur la cartographie des doléances. Ici, vous pouvez visualiser et filtrer les doléances selon vos critères.";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground">
          Cartographie des doléances
        </h1>
        <div className="w-24 h-1 bg-green-600 mt-2 mb-4" />
        <p className="text-muted-foreground text-sm">{dynamicText}</p>

        {/* Search Filter */}
        <div className="mb-8 mt-6">
          <SearchFilter onSearch={handleSearchFilterChange} />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-8">
        <div className="flex gap-6">
          <LayersPanel />

          <div className="flex-1">
            <MadagascarMap />
          </div>
        </div>

        {/* Footer Div */}
        <div className="mt-6 p-4 border-t border-gray-200 text-sm text-muted-foreground">
          Total des doléances affichées: 150 (données simulées)
        </div>
      </div>

      <AIChatAssistant />
    </div>
  );
}
