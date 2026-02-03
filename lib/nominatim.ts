/**
 * Service OpenStreetMap Nominatim pour la recherche de lieux
 * (nom, ville, région, commune)
 * @see https://nominatim.org/release-docs/latest/api/Search/
 */

export interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  state_district?: string;
  county?: string;
  country?: string;
  country_code?: string;
  postcode?: string;
  [key: string]: string | undefined;
}

export interface NominatimPlace {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
  type?: string;
  class?: string;
}

export interface LocationDisplay {
  nom: string;
  ville: string;
  region: string;
  commune: string;
  lat: string;
  lon: string;
  display_name: string;
}

const SEARCH_DELAY_MS = 400;
const MIN_QUERY_LENGTH = 2;

/**
 * Extrait nom, ville, région, commune depuis une réponse Nominatim
 */
export function toLocationDisplay(place: NominatimPlace): LocationDisplay {
  const addr = place.address || {};
  const ville =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    "";
  const region = addr.state || addr.state_district || "";
  const commune =
    addr.county || addr.municipality || addr.village || "";
  return {
    nom: place.display_name,
    ville,
    region,
    commune,
    lat: place.lat,
    lon: place.lon,
    display_name: place.display_name,
  };
}

/**
 * Recherche de lieux via le proxy API (évite CORS avec Nominatim).
 * Utilise /api/nominatim/search côté client.
 */
export async function searchPlaces(
  query: string,
  options?: { countryCodes?: string; limit?: number }
): Promise<NominatimPlace[]> {
  const q = query.trim();
  if (q.length < MIN_QUERY_LENGTH) return [];

  const params = new URLSearchParams({
    q,
    limit: String(options?.limit ?? 10),
  });
  if (options?.countryCodes) {
    params.set("countryCodes", options.countryCodes);
  }

  const url = `/api/nominatim/search?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) return [];
  const data = (await res.json()) as NominatimPlace[];
  return Array.isArray(data) ? data : [];
}

export { SEARCH_DELAY_MS, MIN_QUERY_LENGTH };
