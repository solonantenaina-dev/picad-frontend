// export default function HomePage() {
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold text-foreground">
//         Bienvenue sur l'indicateur
//       </h1>
//       <p className="mt-2 text-muted-foreground">
//         Sélectionnez une option dans la barre de navigation ci-dessus.
//       </p>
//     </div>
//   );
// }
"use client";

import { ArrowDownRight, ArrowUpRight, ThumbsUp, CheckCircle, Folder } from "lucide-react";
import {BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer} from "recharts";

const data = [
  { name: "Jan", value: 95 },
  { name: "Fév", value: 102 },
  { name: "Mar", value: 120 },
  { name: "Avr", value: 110 },
  { name: "Mai", value: 98 },
  { name: "Juin", value: 92 },
  { name: "Juil", value: 85 },
  { name: "Août", value: 78 },
];

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-green-50/40 to-white p-8 space-y-10">
    <div className="w-full p-6 space-y-6 bg-gradient-to-b from-green-50/40 to-white min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Indicateurs & Performances</h1>
      <p className="text-gray-600">Évolution des besoins et impact des actions gouvernementales</p>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
  {/* Zone géographique */}
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">Zone géographique</label>
    <select className="w-full mt-1 border border-gray-300 rounded-lg p-2 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
      <option>— Sélection d'une zone —</option>
      <option>Fianarantsoa</option>
      <option>Antananarivo</option>
      <option>Antsirabe</option>
    </select>
  </div>

  {/* Thématique */}
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">Thématique</label>
    <select className="w-full mt-1 border border-gray-300 rounded-lg p-2 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
      <option>Éducation</option>
    </select>
  </div>

  {/* Bouton Appliquer */}
  <div className="flex justify-start md:justify-end">
    <button className="bg-green-600 hover:bg-green-700 text-white h-11 px-6 rounded-lg font-medium transition-colors flex items-center gap-2">
      <CheckCircle className="w-5 h-5" />
      Appliquer la synthèse
    </button>
  </div>
</div>


      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
        <p className="text-sm text-gray-600">Réduction Totale</p>
        <h2 className="text-3xl font-bold flex items-center gap-2">15.8% <ArrowDownRight className="text-red-600" size={24} /></h2>
        <p className="text-sm text-gray-500">Jan - Août 2024</p>
      </div>


        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
        <p className="text-sm text-gray-600">Impact Eau (Projet Avril)</p>
        <h2 className="text-3xl font-bold flex items-center gap-2">51.7% <ArrowUpRight className="text-green-600" size={24} /></h2>
        <p className="text-sm text-gray-500">Après infrastructure hydraulique</p>
        </div>


        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
        <p className="text-sm text-gray-600">Doléances Août</p>
        <h2 className="text-3xl font-bold flex items-center gap-2">684 <Folder className="text-green-600" size={24} /></h2>
        <p className="text-sm text-gray-500">vs 812 en janvier</p>
        </div>
        </div>

      {/* Chart placeholder */}
      <div className="bg-white p-6 rounded-xl shadow">
        <p className="text-sm text-gray-600 mb-2">Graphique — Éducation</p>
        <div className="w-full h-64 rounded-lg">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="#666666ff" />
              <YAxis stroke="#666666ff" />
              <Tooltip />
              <Bar dataKey="value" fill="#1E40AF"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    </div>
  );
}