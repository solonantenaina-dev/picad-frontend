"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LayersPanel from "./layers-panel";
import MadagascarMap from "./madagascar-map";
import AIChatAssistant from "./ai-chat-assistant";

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

function ChevronDownIcon({ className }: { className?: string }) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function CartographieContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<
    "region" | "district" | "commune"
  >("commune");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground">
          Cartographie des doléances
        </h1>
        <div className="w-24 h-1 bg-green-600 mt-2 mb-4" />
        <p className="text-muted-foreground text-sm">
          dummy text of the printing and typesetting industry. Lorem Ipsum has
          been the industry&apos;s st
        </p>

        {/* Search Bar */}
        <div className="flex items-center gap-4 mt-6 bg-muted rounded-lg px-4 py-2">
          <SearchIcon className="h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Zone intervention"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <div className="relative">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-background"
            >
              {selectedLevel === "region"
                ? "Région"
                : selectedLevel === "district"
                ? "District"
                : "Commune"}
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-8">
        <div className="flex gap-6">
          {/* Left Sidebar - Layers Panel */}
          <LayersPanel />

          {/* Map Area */}
          <div className="flex-1">
            <MadagascarMap />
          </div>
        </div>
      </div>

      {/* AI Chat Assistant */}
      <AIChatAssistant />
    </div>
  );
}
