declare module "*.geojson" {
  const value: import("./types/geo").GeoJSONData;
  export default value;
}
