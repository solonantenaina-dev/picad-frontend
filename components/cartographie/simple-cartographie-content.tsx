"use client"

import SimpleLeafletMap from './simple-leaflet-map'
import data from '../../../public/data/regions.geojson'
import { useState } from 'react'
import type { GeoJSONData } from '@/types/geo'

export default function SimpleCartographieContent() {
  const [searchArea, setSearchArea] = useState('')

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-lg p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Couches</h2>
        <div className="space-y-2 mb-8">
          {/* Layers checkboxes */}
        </div>
        <h2 className="text-xl font-bold mb-4">Rechercher</h2>
        <input
          type="text"
          placeholder="Rechercher une région..."
          value={searchArea}
          onChange={(e) => setSearchArea(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex-1 relative">
        <SimpleLeafletMap data={data} searchArea={searchArea} />
        {/* Floating panel */}
        <div className="absolute top-4 right-4 bg-white p-4 shadow-lg rounded-lg max-w-sm w-full max-h-96 overflow-auto">
          <h3 className="font-bold mb-2">Info sélection</h3>
          <p>Cliquez sur une région pour voir les détails</p>
        </div>
      </div>
    </div>
  )
}
