"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterData {
  query: string;
  filter: FilterOption;
}

const mainFilterOptions = [
  { value: "commune", label: "Commune" },
  { value: "region", label: "Région" },
  { value: "zone", label: "Zone" },
  { value: "district", label: "District" },
];

interface SearchFilterProps {
  onSearch?: (data: SearchFilterData) => void;
}

export function SearchFilter({ onSearch }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMainFilter, setSelectedMainFilter] = useState(
    mainFilterOptions[0]
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.({ query: value, filter: selectedMainFilter });
  };

  const handleMainFilterChange = (option: (typeof mainFilterOptions)[0]) => {
    setSelectedMainFilter(option);
    onSearch?.({ query: searchQuery, filter: option });
  };

  return (
    <div className="flex items-center rounded-lg border border-border bg-background shadow-sm">
      <div className="flex flex-1 items-center px-4">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Zone intervention"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 border-l border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors">
          {selectedMainFilter.label}
          <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {mainFilterOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleMainFilterChange(option)}
              className={cn(
                selectedMainFilter.value === option.value && "bg-green-100"
              )}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
