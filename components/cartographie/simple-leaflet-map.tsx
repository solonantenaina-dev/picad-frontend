"use client"

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'
import { useState, useMemo } from 'react'
import data from '../../../public/data/regions.geojson'
import type { GeoJSONData } from '@/types/geo'

const center: LatLngExpression = [-19.0, 47.0]

const style = {
  fillColor: 'teal',
  weight: 2,
  opacity: 1,
  color: 'white',
  fillOpacity: 0.7,
}

interface LeafletMapProps {
  data: GeoJSONData
  searchArea: string
}

export default function SimpleLeafletMap({ data, searchArea }: LeafletMapProps) {
  const filteredData = useMemo(() => ({
    ...data,
    features: data.features.filter((feature) =>
      feature.properties.name?.toLowerCase().includes(searchArea.toLowerCase())
    ),
  }), [data, searchArea])

  return (
    <MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON data={filteredData} style={style} />
    </MapContainer>
  )
}
