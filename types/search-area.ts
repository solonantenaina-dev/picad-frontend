// Shared types for cartographie search-to-map zoom functionality

import type { NominatimPlace } from '@/lib/nominatim';

export interface FilterOption {
  value: string;
  label: string;
}

export interface SearchAreaSelection {
  query: string;
  filter: FilterOption;
  type: 'nominatim' | 'region' | 'district' | 'commune';
  code?: string;  // ADM1_PCODE / ADM2_PCODE / ADM3_PCODE or place_id
  name: string;   // display name
  place?: NominatimPlace;  // full place for lat/lon if nominatim
}
