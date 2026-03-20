export interface FeatureProperties {
  name: string;
  region?: string;
  value?: number;
}

export interface GeoFeature {
  type: "Feature";
  properties: FeatureProperties;
  geometry: any;
}

export interface GeoJSONData {
  type: "FeatureCollection";
  features: GeoFeature[];
}
