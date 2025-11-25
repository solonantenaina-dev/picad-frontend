"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { MapContainer, GeoJSON, useMap, ZoomControl } from "react-leaflet";
import type {
  LatLngBoundsExpression,
  Layer,
  LeafletMouseEvent,
  PathOptions,
  GeoJSON as GeoJSONType,
} from "leaflet";
import L from "leaflet";
import type {
  Feature,
  FeatureCollection,
  Geometry,
  Polygon,
  MultiPolygon,
} from "geojson";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

// Icons
function PlusIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function MinusIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
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
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

// Types
type ViewLevel = "regions" | "districts" | "communes";

interface GeoJSONFeatureProperties {
  ADM0_PCODE?: string;
  ADM0_EN?: string;
  ADM1_PCODE?: string;
  ADM1_EN?: string;
  ADM1_TYPE?: string;
  ADM2_PCODE?: string;
  ADM2_EN?: string;
  ADM2_TYPE?: string;
  ADM3_PCODE?: string;
  ADM3_EN?: string;
  ADM3_TYPE?: string;
  [key: string]: unknown;
}

// Composant pour afficher les labels permanents
function LabelsLayer({
  data,
  viewLevel,
  showLabels,
}: {
  data: FeatureCollection | null;
  viewLevel: ViewLevel;
  showLabels: boolean;
}) {
  const map = useMap();
  const labelsRef = useRef<L.LayerGroup>(new L.LayerGroup());

  useEffect(() => {
    // Ajouter le groupe de labels à la carte
    labelsRef.current.addTo(map);

    return () => {
      // Nettoyer à la destruction
      map.removeLayer(labelsRef.current);
    };
  }, [map]);

  useEffect(() => {
    // Vider les labels existants
    labelsRef.current.clearLayers();

    if (!showLabels || !data || !data.features) return;

    // Ajouter les nouveaux labels
    data.features.forEach((feature) => {
      const geometry = feature.geometry as Polygon | MultiPolygon;
      const properties = feature.properties as GeoJSONFeatureProperties;

      let name = "";
      if (viewLevel === "regions") {
        name = properties.ADM1_EN || "";
      } else if (viewLevel === "districts") {
        name = properties.ADM2_EN || "";
      } else if (viewLevel === "communes") {
        name = properties.ADM3_EN || "";
      }

      if (!name) return;

      try {
        // Calculer le centre de la géométrie
        const layer = L.geoJSON(feature);
        const bounds = layer.getBounds();

        // Vérifier si les bounds sont valides
        if (!bounds.isValid()) return;

        const center = bounds.getCenter();

        // Créer le label
        const label = L.marker(center, {
          icon: L.divIcon({
            html: `
              <div class="bg-white bg-opacity-90 px-2 py-1 rounded border border-gray-300 shadow-sm text-xs font-medium text-gray-800 whitespace-nowrap pointer-events-none">
                ${name}
              </div>
            `,
            className: "label-marker",
            iconSize: [100, 20],
          }),
          interactive: false,
        } as any);

        label.addTo(labelsRef.current);
      } catch (error) {
        console.warn("Erreur lors de la création du label:", error);
      }
    });
  }, [data, viewLevel, showLabels]);

  return null;
}

// Composant pour contrôler le comportement du scroll
function ScrollHandler() {
  const map = useMap();
  const isMouseOverMap = useRef(false);

  useEffect(() => {
    const container = map.getContainer();

    const handleMouseEnter = () => {
      isMouseOverMap.current = true;
      map.scrollWheelZoom.enable();
    };

    const handleMouseLeave = () => {
      isMouseOverMap.current = false;
      map.scrollWheelZoom.disable();
    };

    // Écouter les événements sur le conteneur de la carte
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    // Désactiver le scroll zoom par défaut au début
    map.scrollWheelZoom.disable();

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [map]);

  return null;
}

// Couleurs par région
const regionColors: Record<string, string> = {
  MG11: "#708090", // Analamanga
  MG12: "#2E8B57", // Vakinankaratra
  MG13: "#556B2F", // Itasy
  MG14: "#DAA520", // Bongolava
  MG21: "#4A7C59", // Diana
  MG22: "#6B8E23", // Sava
  MG31: "#3B5998", // Boeny
  MG32: "#4682B4", // Betsiboka
  MG33: "#708090", // Melaky
  MG34: "#8FBC8F", // Sofia
  MG41: "#5F9EA0", // Alaotra-Mangoro
  MG42: "#6B8E23", // Analanjirofo
  MG43: "#8B4513", // Atsinanana
  MG51: "#9ACD32", // Amoron'i Mania
  MG52: "#32CD32", // Haute Matsiatra
  MG53: "#228B22", // Vatovavy
  MG54: "#006400", // Atsimo-Atsinanana
  MG55: "#FF8C00", // Ihorombe
  MG61: "#BDB76B", // Menabe
  MG62: "#FF6347", // Atsimo-Andrefana
  MG71: "#DC143C", // Androy
  MG72: "#B22222", // Anosy
};

// Génère une couleur basée sur l'index
function getColorByIndex(index: number): string {
  const colors = [
    "#4A7C59",
    "#6B8E23",
    "#8FBC8F",
    "#3B5998",
    "#4682B4",
    "#708090",
    "#5F9EA0",
    "#8B4513",
    "#556B2F",
    "#DAA520",
    "#9ACD32",
    "#32CD32",
    "#228B22",
    "#006400",
    "#FF8C00",
    "#BDB76B",
    "#FF6347",
    "#DC143C",
    "#B22222",
    "#2E8B57",
    "#3CB371",
    "#48D1CC",
    "#6A5ACD",
    "#9370DB",
    "#8A2BE2",
    "#9400D3",
    "#9932CC",
    "#BA55D3",
    "#DA70D6",
    "#EE82EE",
  ];
  return colors[index % colors.length];
}

// Composant pour contrôler le zoom et les bounds
function MapController({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 12, animate: true });
    }
  }, [map, bounds]);

  return null;
}

// Composant pour les contrôles de zoom personnalisés
function ZoomControls() {
  const map = useMap();

  return (
    <div className="absolute right-2 top-2 z-[1000] flex flex-col gap-1">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 bg-white shadow-md border-gray-300 hover:bg-gray-50"
        onClick={() => map.zoomIn()}
      >
        <PlusIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 bg-white shadow-md border-gray-300 hover:bg-gray-50"
        onClick={() => map.zoomOut()}
      >
        <MinusIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface LeafletMapProps {
  onAreaSelect?: (area: { id: string; name: string; level: string }) => void;
}

export default function LeafletMap({ onAreaSelect }: LeafletMapProps) {
  const [viewLevel, setViewLevel] = useState<ViewLevel>("regions");
  const [selectedRegion, setSelectedRegion] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  const [showLabels, setShowLabels] = useState(false);

  // GeoJSON data states
  const [regionsData, setRegionsData] = useState<FeatureCollection | null>(
    null
  );
  const [districtsData, setDistrictsData] = useState<FeatureCollection | null>(
    null
  );
  const [communesData, setCommunesData] = useState<FeatureCollection | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bounds de Madagascar
  const madagascarBounds: LatLngBoundsExpression = [
    [-25.6, 43.2],
    [-11.9, 50.5],
  ];

  // Charger les données GeoJSON réelles
  useEffect(() => {
    const loadGeoJSON = async () => {
      setLoading(true);
      setError(null);
      try {
        const [regionsRes, districtsRes, communesRes] = await Promise.all([
          fetch("/data/regions.geojson"),
          fetch("/data/districts.geojson"),
          fetch("/data/communes.geojson"),
        ]);

        if (!regionsRes.ok)
          throw new Error("Erreur lors du chargement des régions");
        if (!districtsRes.ok)
          throw new Error("Erreur lors du chargement des districts");
        if (!communesRes.ok)
          throw new Error("Erreur lors du chargement des communes");

        const [regions, districts, communes] = await Promise.all([
          regionsRes.json(),
          districtsRes.json(),
          communesRes.json(),
        ]);

        setRegionsData(regions);
        setDistrictsData(districts);
        setCommunesData(communes);

        // Calculer les bounds initiales basées sur les régions
        if (regions.features && regions.features.length > 0) {
          const geoJsonLayer = L.geoJSON(regions as FeatureCollection);
          const calculatedBounds = geoJsonLayer.getBounds();
          if (calculatedBounds.isValid()) {
            setBounds(calculatedBounds);
          }
        }
      } catch (err) {
        console.error("Erreur chargement GeoJSON:", err);
        setError("Impossible de charger les données cartographiques");
      } finally {
        setLoading(false);
      }
    };

    loadGeoJSON();
  }, []);

  // Filtrer les districts par région sélectionnée
  const filteredDistricts = useMemo(() => {
    if (!districtsData || !selectedRegion) return null;

    const filteredFeatures = districtsData.features.filter(
      (feature) => feature.properties?.ADM1_PCODE === selectedRegion.id
    );

    return {
      type: "FeatureCollection" as const,
      features: filteredFeatures,
    };
  }, [districtsData, selectedRegion]);

  // Filtrer les communes par district sélectionné
  const filteredCommunes = useMemo(() => {
    if (!communesData || !selectedDistrict) return null;

    const filteredFeatures = communesData.features.filter(
      (feature) => feature.properties?.ADM2_PCODE === selectedDistrict.id
    );

    return {
      type: "FeatureCollection" as const,
      features: filteredFeatures,
    };
  }, [communesData, selectedDistrict]);

  // Données actuelles à afficher
  const currentData = useMemo(() => {
    switch (viewLevel) {
      case "regions":
        return regionsData;
      case "districts":
        return filteredDistricts;
      case "communes":
        return filteredCommunes;
      default:
        return null;
    }
  }, [viewLevel, regionsData, filteredDistricts, filteredCommunes]);

  // Style pour les features GeoJSON
  const getFeatureStyle = useCallback(
    (
      feature: Feature<Geometry, GeoJSONFeatureProperties> | undefined,
      index: number
    ): PathOptions => {
      if (!feature)
        return {
          fillColor: "#808080",
          weight: 1,
          opacity: 1,
          color: "white",
          fillOpacity: 0.7,
        };

      const props = feature.properties;
      let fillColor = "#808080";

      if (viewLevel === "regions" && props?.ADM1_PCODE) {
        fillColor = regionColors[props.ADM1_PCODE] || getColorByIndex(index);
      } else if (viewLevel === "districts") {
        fillColor = getColorByIndex(index);
      } else if (viewLevel === "communes") {
        fillColor = getColorByIndex(index);
      }

      return {
        fillColor,
        weight: viewLevel === "regions" ? 2 : 1,
        opacity: 1,
        color: "white",
        fillOpacity: 0.7,
      };
    },
    [viewLevel]
  );

  // Gestionnaire d'événements pour chaque feature
  const onEachFeature = useCallback(
    (feature: Feature<Geometry, GeoJSONFeatureProperties>, layer: Layer) => {
      const props = feature.properties;
      let displayName = "";
      let featureId = "";
      let levelName = "";

      if (viewLevel === "regions") {
        displayName = props?.ADM1_EN || "Région inconnue";
        featureId = props?.ADM1_PCODE || "";
        levelName = "region";
      } else if (viewLevel === "districts") {
        displayName = props?.ADM2_EN || "District inconnu";
        featureId = props?.ADM2_PCODE || "";
        levelName = "district";
      } else if (viewLevel === "communes") {
        displayName = props?.ADM3_EN || "Commune inconnue";
        featureId = props?.ADM3_PCODE || "";
        levelName = "commune";
      }

      // Tooltip
      layer.bindTooltip(displayName, {
        permanent: false,
        direction: "center",
        className:
          "bg-white px-2 py-1 rounded shadow-lg text-sm font-medium border border-gray-200",
      });

      // Événements
      layer.on({
        mouseover: (e: LeafletMouseEvent) => {
          const target = e.target;
          target.setStyle({
            weight: viewLevel === "regions" ? 3 : 2,
            color: "#333",
            fillOpacity: 0.9,
          });
          target.bringToFront();
        },
        mouseout: (e: LeafletMouseEvent) => {
          const target = e.target;
          const index =
            currentData?.features.findIndex((f) => f === feature) || 0;
          target.setStyle(getFeatureStyle(feature, index));
        },
        click: (e: LeafletMouseEvent) => {
          const target = e.target;
          const featureBounds = target.getBounds();

          if (viewLevel === "regions") {
            setSelectedRegion({ id: featureId, name: displayName });
            setViewLevel("districts");
            setBounds(featureBounds);
          } else if (viewLevel === "districts") {
            setSelectedDistrict({ id: featureId, name: displayName });
            setViewLevel("communes");
            setBounds(featureBounds);
          }

          onAreaSelect?.({
            id: featureId,
            name: displayName,
            level: levelName,
          });
        },
      });
    },
    [viewLevel, currentData, getFeatureStyle, onAreaSelect]
  );

  // Navigation retour
  const goBack = useCallback(() => {
    if (viewLevel === "communes") {
      setSelectedDistrict(null);
      setViewLevel("districts");
      // Recalculer les bounds pour le district
      if (selectedRegion && filteredDistricts) {
        const geoJsonLayer = L.geoJSON(filteredDistricts as FeatureCollection);
        const calculatedBounds = geoJsonLayer.getBounds();
        if (calculatedBounds.isValid()) {
          setBounds(calculatedBounds);
        }
      }
    } else if (viewLevel === "districts") {
      setSelectedRegion(null);
      setSelectedDistrict(null);
      setViewLevel("regions");
      // Revenir aux bounds de toutes les régions
      if (regionsData) {
        const geoJsonLayer = L.geoJSON(regionsData as FeatureCollection);
        const calculatedBounds = geoJsonLayer.getBounds();
        if (calculatedBounds.isValid()) {
          setBounds(calculatedBounds);
        }
      }
    }
  }, [viewLevel, selectedRegion, filteredDistricts, regionsData]);

  // Breadcrumb
  const getBreadcrumb = () => {
    const parts = ["Madagascar"];
    if (selectedRegion) parts.push(selectedRegion.name);
    if (selectedDistrict) parts.push(selectedDistrict.name);
    return parts.join(" > ");
  };

  // Calculer les bounds quand les données changent
  useEffect(() => {
    if (
      currentData &&
      currentData.features &&
      currentData.features.length > 0
    ) {
      const geoJsonLayer = L.geoJSON(currentData as FeatureCollection);
      const calculatedBounds = geoJsonLayer.getBounds();
      if (calculatedBounds.isValid()) {
        setBounds(calculatedBounds);
      }
    } else if (viewLevel === "regions" && regionsData) {
      const geoJsonLayer = L.geoJSON(regionsData as FeatureCollection);
      const calculatedBounds = geoJsonLayer.getBounds();
      if (calculatedBounds.isValid()) {
        setBounds(calculatedBounds);
      }
    }
  }, [currentData, viewLevel, regionsData]);

  if (loading) {
    return (
      <div
        className="relative bg-muted rounded-lg overflow-hidden flex items-center justify-center"
        style={{ height: "600px" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-muted-foreground">
            Chargement des données cartographiques...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="relative bg-muted rounded-lg overflow-hidden flex items-center justify-center"
        style={{ height: "600px" }}
      >
        <div className="text-center text-destructive">
          <p className="mb-2">{error}</p>
          <Button
            variant="outline"
            className="bg-transparent"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden border border-gray-200">
      {/* Breadcrumb et bouton retour */}
      <div className="absolute top-2 left-2 z-[1000] flex items-center gap-2">
        {viewLevel !== "regions" && (
          <Button
            variant="outline"
            size="sm"
            className="bg-white shadow-md border-gray-300 hover:bg-gray-50"
            onClick={goBack}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour
          </Button>
        )}
        <div className="bg-white px-3 py-1.5 rounded shadow-md text-sm font-medium border border-gray-200">
          {getBreadcrumb()}
        </div>
      </div>

      {/* Bouton pour afficher/masquer les labels */}
      <div className="absolute top-2 right-16 z-[1000]">
        <Button
          variant="outline"
          size="sm"
          className="bg-white shadow-md border-gray-300 hover:bg-gray-50"
          onClick={() => setShowLabels(!showLabels)}
        >
          {showLabels ? "Masquer labels" : "Afficher labels"}
        </Button>
      </div>

      {/* Niveau actuel */}
      <div className="absolute bottom-2 right-2 z-[1000] bg-white px-3 py-1.5 rounded shadow-md text-xs border border-gray-200">
        Niveau: <span className="font-semibold capitalize">{viewLevel}</span>
        {currentData &&
          currentData.features &&
          ` (${currentData.features.length} éléments)`}
        <div className="mt-1 text-gray-500">
          Labels: {showLabels ? "ON" : "OFF"}
        </div>
      </div>

      <MapContainer
        center={[-18.5, 47.5]}
        zoom={6}
        style={{ height: "600px", width: "100%", backgroundColor: "#f8fafc" }}
        zoomControl={false}
        scrollWheelZoom={true} // Activé mais contrôlé par ScrollHandler
      >
        <ScrollHandler />
        <ZoomControls />
        {bounds && <MapController bounds={bounds} />}

        {currentData &&
          currentData.features &&
          currentData.features.length > 0 && (
            <>
              <GeoJSON
                key={`${viewLevel}-${selectedRegion?.id || ""}-${
                  selectedDistrict?.id || ""
                }`}
                data={currentData}
                style={(
                  feature?: Feature<Geometry, GeoJSONFeatureProperties>
                ) => {
                  const index = currentData.features.findIndex(
                    (f) => f === feature
                  );
                  return getFeatureStyle(feature, index);
                }}
                onEachFeature={onEachFeature}
              />

              {/* Couche de labels - toujours rendue mais contrôlée par showLabels */}
              <LabelsLayer
                data={currentData}
                viewLevel={viewLevel}
                showLabels={showLabels}
              />
            </>
          )}
      </MapContainer>
    </div>
  );
}
