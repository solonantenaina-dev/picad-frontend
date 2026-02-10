"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, ChevronDown, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  searchPlaces,
  toLocationDisplay,
  SEARCH_DELAY_MS,
  type NominatimPlace,
  type LocationDisplay,
} from "@/lib/nominatim";

export interface FilterOption {
  value: string;
  label: string;
}

export interface SearchFilterData {
  query: string;
  filter: FilterOption;
  location?: LocationDisplay | null;
}

interface RegionItem {
  code: string;
  name: string;
}

interface DistrictItem {
  code: string;
  name: string;
  regionName: string;
}

interface CommuneItem {
  code: string;
  name: string;
  districtName: string;
  regionName: string;
}

const mainFilterOptions = [
  { value: "commune", label: "Commune" },
  { value: "region", label: "Région" },
  { value: "zone", label: "Zone" },
  { value: "district", label: "District" },
];

type ListMode = "nominatim" | "regions" | "districts" | "communes" | "mixed" | null;

interface SearchResult {
  type: "region" | "district" | "commune" | "lieu";
  label: string;
  subtitle?: string;
  data: RegionItem | DistrictItem | CommuneItem | NominatimPlace;
}

async function fetchJsonOrThrow<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const contentType = res.headers.get("content-type") ?? "";
  const rawText = await res.text();

  if (!res.ok) {
    // Souvent un 404 renvoie une page HTML (non JSON) -> éviter JSON.parse qui plante.
    const snippet = rawText.slice(0, 500);
    throw new Error(
      `HTTP ${res.status} ${res.statusText} — content-type: ${contentType || "n/a"} — body: ${snippet}`
    );
  }

  try {
    // Certains serveurs renvoient JSON avec un content-type non standard.
    // Trim les espaces et caractères de contrôle avant de parser
    let cleanedText = rawText.trim().replace(/[\x00-\x1F\x7F]/g, '');
    
    // Si le texte commence par [ ou {, essayer de trouver la fin valide du JSON
    if ((cleanedText.startsWith('[') || cleanedText.startsWith('{')) && cleanedText.length > 0) {
      let braceCount = 0;
      let bracketCount = 0;
      let inString = false;
      let escapeNext = false;
      
      for (let i = 0; i < cleanedText.length; i++) {
        const char = cleanedText[i];
        
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        
        if (char === '\\') {
          escapeNext = true;
          continue;
        }
        
        if (char === '"') {
          inString = !inString;
          continue;
        }
        
        if (!inString) {
          if (char === '{') braceCount++;
          else if (char === '}') braceCount--;
          else if (char === '[') bracketCount++;
          else if (char === ']') bracketCount--;
          
          // Si tous les braces/brackets sont fermés, on a la fin du JSON valide
          if (braceCount === 0 && bracketCount === 0 && (char === '}' || char === ']')) {
            cleanedText = cleanedText.slice(0, i + 1);
            break;
          }
        }
      }
    }
    
    return JSON.parse(cleanedText) as T;
  } catch (e) {
    const snippet = rawText.slice(0, 800);
    throw new Error(
      `Réponse non-JSON (content-type: ${contentType || "n/a"}). ` +
        `Impossible de parser. Extrait: ${snippet}`
    );
  }
}

interface SearchFilterProps {
  onSearch?: (data: SearchFilterData) => void;
  countryCodes?: string;
}

export function SearchFilter({ onSearch, countryCodes = "mg" }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMainFilter, setSelectedMainFilter] = useState(
    mainFilterOptions[0]
  );
  const [suggestions, setSuggestions] = useState<NominatimPlace[]>([]);
  const [localRegions, setLocalRegions] = useState<RegionItem[]>([]);
  const [localDistricts, setLocalDistricts] = useState<DistrictItem[]>([]);
  const [localCommunes, setLocalCommunes] = useState<CommuneItem[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingCommunes, setIsLoadingCommunes] = useState(false);
  const [showList, setShowList] = useState(false);
  const [listMode, setListMode] = useState<ListMode>(null);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationDisplay | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ignoreClickOutsideRef = useRef(false);
  const listsLoadedRef = useRef(false);

  const notifySearch = useCallback(
    (query: string, filter: FilterOption, location: LocationDisplay | null) => {
      onSearch?.({
        query,
        filter,
        location: location ?? undefined,
      });
    },
    [onSearch]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ignoreClickOutsideRef.current) {
        ignoreClickOutsideRef.current = false;
        return;
      }
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowList(false);
        setListMode(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openListWithDelay = useCallback((mode: ListMode) => {
    ignoreClickOutsideRef.current = true;
    setTimeout(() => {
      setListMode(mode);
      setShowList(true);
    }, 150);
  }, []);

  const fetchRegionsList = useCallback(async () => {
    if (localRegions.length > 0) return;
    setIsLoadingRegions(true);
    try {
      const data = await fetchJsonOrThrow<RegionItem[]>("/api/geo/regions");
      setLocalRegions(data);
      console.log(`Chargé ${data.length} régions`);
    } catch (error) {
      console.error("Erreur lors du chargement des régions:", error);
      setLocalRegions([]);
    } finally {
      setIsLoadingRegions(false);
    }
  }, [localRegions.length]);

  const fetchDistrictsList = useCallback(async () => {
    if (localDistricts.length > 0) return;
    setIsLoadingDistricts(true);
    try {
      const data = await fetchJsonOrThrow<DistrictItem[]>("/api/geo/districts");
      setLocalDistricts(data);
      console.log(`Chargé ${data.length} districts`);
    } catch (error) {
      console.error("Erreur lors du chargement des districts:", error);
      setLocalDistricts([]);
    } finally {
      setIsLoadingDistricts(false);
    }
  }, [localDistricts.length]);

  const fetchCommunesList = useCallback(async () => {
    if (localCommunes.length > 0) return;
    setIsLoadingCommunes(true);
    try {
      const data = await fetchJsonOrThrow<CommuneItem[]>("/api/geo/communes");
      setLocalCommunes(data);
      console.log(`Chargé ${data.length} communes`);
    } catch (error) {
      console.error("Erreur lors du chargement des communes:", error);
      setLocalCommunes([]);
    } finally {
      setIsLoadingCommunes(false);
    }
  }, [localCommunes.length]);

  const filterLocalLists = useCallback((query: string): SearchResult[] => {
    const q = query.toLowerCase().trim();
    if (q.length < 2) return [];
    const results: SearchResult[] = [];
    for (const region of localRegions) {
      if (region.name.toLowerCase().includes(q)) {
        results.push({
          type: "region",
          label: region.name,
          subtitle: "Région",
          data: region,
        });
      }
    }
    for (const district of localDistricts) {
      if (
        district.name.toLowerCase().includes(q) ||
        district.regionName.toLowerCase().includes(q)
      ) {
        results.push({
          type: "district",
          label: district.name,
          subtitle: `District — ${district.regionName}`,
          data: district,
        });
      }
    }
    for (const commune of localCommunes) {
      if (
        commune.name.toLowerCase().includes(q) ||
        commune.districtName.toLowerCase().includes(q) ||
        commune.regionName.toLowerCase().includes(q)
      ) {
        results.push({
          type: "commune",
          label: commune.name,
          subtitle: `Commune — ${commune.districtName}, ${commune.regionName}`,
          data: commune,
        });
      }
    }
    return results.sort((a, b) => {
      const aStarts = a.label.toLowerCase().startsWith(q);
      const bStarts = b.label.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.label.localeCompare(b.label);
    });
  }, [localRegions, localDistricts, localCommunes]);

  const fetchSuggestions = useCallback(
    async (value: string) => {
      if (!value.trim()) {
        setSuggestions([]);
        setFilteredResults([]);
        return;
      }
      setIsLoadingSuggestions(true);
      setListMode("mixed");
      setShowList(true);
      const localResults = filterLocalLists(value);
      try {
        const nominatimResults = await searchPlaces(value.trim(), {
          countryCodes,
          limit: 8,
        });
        const nominatimSearchResults: SearchResult[] = nominatimResults.map(
          (place) => ({
            type: "lieu",
            label: place.display_name,
            subtitle: "Lieu (OpenStreetMap)",
            data: place,
          })
        );
        const allResults = [...localResults, ...nominatimSearchResults].slice(0, 15);
        setFilteredResults(allResults);
        setSuggestions(nominatimResults);
        console.log(
          `Recherche "${value}": ${localResults.length} résultats locaux + ${nominatimResults.length} Nominatim = ${allResults.length} total`
        );
      } catch (error) {
        console.error("Erreur lors de la recherche Nominatim:", error);
        setFilteredResults(localResults);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    },
    [countryCodes, filterLocalLists]
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSelectedLocation(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSuggestions([]);
      setFilteredResults([]);
      setShowList(false);
      setListMode(null);
      notifySearch(value, selectedMainFilter, null);
      return;
    }

    const localResults = filterLocalLists(value);
    if (localResults.length > 0) {
      setFilteredResults(localResults);
      setListMode("mixed");
      setShowList(true);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
      notifySearch(value, selectedMainFilter, null);
    }, SEARCH_DELAY_MS);
  };

  useEffect(() => {
    if (!listsLoadedRef.current && !isLoadingRegions && !isLoadingDistricts && !isLoadingCommunes) {
      listsLoadedRef.current = true;
      fetchRegionsList();
      fetchDistrictsList();
      fetchCommunesList();
    }
  }, [fetchRegionsList, fetchDistrictsList, fetchCommunesList, isLoadingRegions, isLoadingDistricts, isLoadingCommunes]);

  const handleFocus = () => {
    if (filteredResults.length > 0 || suggestions.length > 0) {
      setShowList(true);
      if (searchQuery.trim()) {
        setListMode("mixed");
      } else {
        if (selectedMainFilter.value === "region") {
          setListMode("regions");
        } else if (selectedMainFilter.value === "district") {
          setListMode("districts");
        } else if (selectedMainFilter.value === "commune") {
          setListMode("communes");
        }
      }
      return;
    }
    if (!searchQuery.trim()) {
      if (selectedMainFilter.value === "region") {
        if (localRegions.length > 0) {
          setShowList(true);
          setListMode("regions");
        } else if (!isLoadingRegions) fetchRegionsList();
      } else if (selectedMainFilter.value === "district") {
        if (localDistricts.length > 0) {
          setShowList(true);
          setListMode("districts");
        } else if (!isLoadingDistricts) fetchDistrictsList();
      } else if (selectedMainFilter.value === "commune") {
        if (localCommunes.length > 0) {
          setShowList(true);
          setListMode("communes");
        } else if (!isLoadingCommunes) fetchCommunesList();
      }
    }
  };

  const toLocationFromName = (name: string, region: string, commune: string): LocationDisplay => ({
    nom: name,
    ville: "",
    region,
    commune,
    lat: "",
    lon: "",
    display_name: [name, region].filter(Boolean).join(", "),
  });

  const handleSelectPlace = (place: NominatimPlace) => {
    const location = toLocationDisplay(place);
    setSelectedLocation(location);
    setSearchQuery(place.display_name);
    setSuggestions([]);
    setFilteredResults([]);
    setShowList(false);
    setListMode(null);
    notifySearch(place.display_name, selectedMainFilter, location);
  };

  const handleSelectResult = (result: SearchResult) => {
    let location: LocationDisplay;
    let displayName: string;
    if (result.type === "region") {
      const region = result.data as RegionItem;
      location = toLocationFromName(region.name, region.name, "");
      displayName = region.name;
    } else if (result.type === "district") {
      const district = result.data as DistrictItem;
      location = toLocationFromName(district.name, district.regionName, "");
      displayName = `${district.name} (${district.regionName})`;
    } else if (result.type === "commune") {
      const commune = result.data as CommuneItem;
      location = toLocationFromName(commune.name, commune.regionName, commune.name);
      displayName = `${commune.name} (${commune.districtName}, ${commune.regionName})`;
    } else {
      handleSelectPlace(result.data as NominatimPlace);
      return;
    }
    setSelectedLocation(location);
    setSearchQuery(displayName);
    setFilteredResults([]);
    setShowList(false);
    setListMode(null);
    notifySearch(displayName, selectedMainFilter, location);
  };

  const handleSelectRegion = (region: RegionItem) => {
    const location = toLocationFromName(region.name, region.name, "");
    setSelectedLocation(location);
    setSearchQuery(region.name);
    setShowList(false);
    setListMode(null);
    notifySearch(region.name, selectedMainFilter, location);
  };

  const handleSelectDistrict = (district: DistrictItem) => {
    const location = toLocationFromName(district.name, district.regionName, "");
    setSelectedLocation(location);
    setSearchQuery(`${district.name} (${district.regionName})`);
    setShowList(false);
    setListMode(null);
    notifySearch(district.name, selectedMainFilter, location);
  };

  const handleSelectCommune = (commune: CommuneItem) => {
    const location = toLocationFromName(commune.name, commune.regionName, commune.name);
    setSelectedLocation(location);
    setSearchQuery(`${commune.name} (${commune.districtName}, ${commune.regionName})`);
    setShowList(false);
    setListMode(null);
    notifySearch(commune.name, selectedMainFilter, location);
  };

  const handleMainFilterChange = (option: (typeof mainFilterOptions)[0]) => {
    setSelectedMainFilter(option);
    setShowList(false);
    setListMode(null);
    if (!searchQuery.trim() && (option.value === "region" || option.value === "district" || option.value === "commune")) {
      if (option.value === "region") {
        if (localRegions.length > 0) openListWithDelay("regions");
        else fetchRegionsList();
      } else if (option.value === "district") {
        if (localDistricts.length > 0) openListWithDelay("districts");
        else fetchDistrictsList();
      } else if (option.value === "commune") {
        if (localCommunes.length > 0) openListWithDelay("communes");
        else fetchCommunesList();
      }
    }
    notifySearch(searchQuery, option, selectedLocation);
  };

  const clearLocation = () => {
    setSearchQuery("");
    setSelectedLocation(null);
    setSuggestions([]);
    setFilteredResults([]);
    setShowList(false);
    setListMode(null);
    notifySearch("", selectedMainFilter, null);
  };

  const isLoading =
    isLoadingSuggestions || isLoadingRegions || isLoadingDistricts || isLoadingCommunes;
  const hasMixedResults = listMode === "mixed" && filteredResults.length > 0;
  const hasNominatimResults = listMode === "nominatim" && suggestions.length > 0;
  const hasRegionsResults = listMode === "regions" && localRegions.length > 0;
  const hasDistrictsResults = listMode === "districts" && localDistricts.length > 0;
  const hasCommunesResults = listMode === "communes" && localCommunes.length > 0;
  const hasAnyResults = hasMixedResults || hasNominatimResults || hasRegionsResults || hasDistrictsResults || hasCommunesResults;
  const showListPanel = showList && (listMode === "mixed" || listMode === "nominatim" || listMode === "regions" || listMode === "districts" || listMode === "communes");

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center rounded-lg border border-border bg-background shadow-sm">
        <div className="flex flex-1 items-center px-4 relative">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            type="text"
            placeholder="Zone intervention (nom, ville, région, commune)"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={handleFocus}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            autoComplete="off"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />
          )}
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

      {/* Panneau des résultats : au-dessus du menu déroulant (z-[100]) */}
      {showListPanel && (
        <div
          className="absolute z-[100] mt-1 w-full rounded-lg border border-border bg-background shadow-lg max-h-64 overflow-auto"
          role="listbox"
          aria-label="Résultats de recherche"
        >
          {isLoading && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Chargement...
            </div>
          )}
          {!isLoading && !hasAnyResults && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              {listMode === "nominatim" || listMode === "mixed"
                ? "Tapez au moins 2 caractères ou choisissez Région / District / Commune ci-dessus."
                : "Aucun résultat."}
            </div>
          )}
          {!isLoading && hasMixedResults && (
            <ul className="py-1">
              {filteredResults.map((result, idx) => {
                const getBadgeColor = () => {
                  switch (result.type) {
                    case "region":
                      return "bg-blue-100 text-blue-700";
                    case "district":
                      return "bg-purple-100 text-purple-700";
                    case "commune":
                      return "bg-orange-100 text-orange-700";
                    default:
                      return "bg-gray-100 text-gray-700";
                  }
                };
                const getBadgeLabel = () => {
                  switch (result.type) {
                    case "region":
                      return "Région";
                    case "district":
                      return "District";
                    case "commune":
                      return "Commune";
                    default:
                      return "Lieu";
                  }
                };
                const key =
                  result.type === "lieu"
                    ? `nominatim-${(result.data as NominatimPlace).place_id}`
                    : `${result.type}-${(result.data as RegionItem | DistrictItem | CommuneItem).code}-${idx}`;
                return (
                  <li
                    key={key}
                    role="option"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleSelectResult(result)}
                    onClick={() => handleSelectResult(result)}
                    className="flex items-start gap-2 px-4 py-3 cursor-pointer hover:bg-green-50 border-b border-border last:border-b-0 transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">
                          {result.label}
                        </span>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            getBadgeColor()
                          )}
                        >
                          {getBadgeLabel()}
                        </span>
                      </div>
                      {result.subtitle && (
                        <span className="text-xs text-muted-foreground block mt-1">
                          {result.subtitle}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {!isLoading && hasNominatimResults && listMode === "nominatim" && (
            <ul className="py-1">
              {suggestions.map((place) => (
                <li
                  key={place.place_id}
                  role="option"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleSelectPlace(place)}
                  onClick={() => handleSelectPlace(place)}
                  className="flex items-start gap-2 px-4 py-3 cursor-pointer hover:bg-green-50 border-b border-border last:border-b-0 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{place.display_name}</span>
                </li>
              ))}
            </ul>
          )}
          {!isLoading && hasRegionsResults && (
            <ul className="py-1">
              {localRegions.map((region) => (
                <li
                  key={region.code}
                  role="option"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleSelectRegion(region)}
                  onClick={() => handleSelectRegion(region)}
                  className="flex items-start gap-2 px-4 py-3 cursor-pointer hover:bg-green-50 border-b border-border last:border-b-0 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{region.name}</span>
                </li>
              ))}
            </ul>
          )}
          {!isLoading && hasDistrictsResults && (
            <ul className="py-1">
              {localDistricts.map((district) => (
                <li
                  key={district.code}
                  role="option"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleSelectDistrict(district)}
                  onClick={() => handleSelectDistrict(district)}
                  className="flex items-start gap-2 px-4 py-3 cursor-pointer hover:bg-green-50 border-b border-border last:border-b-0 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    {district.name}
                    {district.regionName && (
                      <span className="text-muted-foreground"> — {district.regionName}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {!isLoading && hasCommunesResults && (
            <ul className="py-1">
              {localCommunes.map((commune) => (
                <li
                  key={commune.code}
                  role="option"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleSelectCommune(commune)}
                  onClick={() => handleSelectCommune(commune)}
                  className="flex items-start gap-2 px-4 py-3 cursor-pointer hover:bg-green-50 border-b border-border last:border-b-0 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    {commune.name}
                    {(commune.districtName || commune.regionName) && (
                      <span className="text-muted-foreground">
                        {" "}
                        — {[commune.districtName, commune.regionName].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {selectedLocation && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-green-200 bg-green-50/50 px-3 py-2 text-sm">
          <span className="font-medium text-green-800">Lieu :</span>
          {selectedLocation.nom && (
            <span className="text-foreground">{selectedLocation.nom}</span>
          )}
          {(selectedLocation.ville ||
            selectedLocation.region ||
            selectedLocation.commune) && (
            <span className="text-muted-foreground">
              ({[selectedLocation.ville, selectedLocation.region, selectedLocation.commune]
                .filter(Boolean)
                .join(", ")})
            </span>
          )}
          <button
            type="button"
            onClick={clearLocation}
            className="ml-auto text-green-700 hover:text-green-900 underline"
          >
            Effacer
          </button>
        </div>
      )}
    </div>
  );
}
