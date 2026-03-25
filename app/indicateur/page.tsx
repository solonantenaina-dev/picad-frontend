"use client";

import { ArrowDownRight, ArrowUpRight, ThumbsUp, CheckCircle, Folder } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";
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
        <TranslatedText text="Indicateurs & Performances" className="text-3xl font-bold text-gray-900 mt-2 h1" />
      <TranslatedText text="Évolution des besoins et impact des actions gouvernementales" className="text-gray-600" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="flex flex-col">
          <TranslatedText text="Zone géographique" className="text-sm font-medium text-gray-700 mb-1" />
          <select className="w-full mt-1 border border-gray-300 rounded-lg p-2 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
<option>— Sélection d'une zone —</option>
            <option>Fianarantsoa</option>
            <option>Antananarivo</option>
            <option>Antsirabe</option>
          </select>
        </div>

        <div className="flex flex-col">
          <TranslatedText text="Thématique" className="text-sm font-medium text-gray-700 mb-1" />
          <select className="w-full mt-1 border border-gray-300 rounded-lg p-2 bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500">
<option>Éducation</option>
          </select>
        </div>

        <div className="flex justify-start md:justify-end">
          <button className="bg-green-600 hover:bg-green-700 text-white h-11 px-6 rounded-lg font-medium transition-colors flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <TranslatedText text="Appliquer la synthèse" />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
        <TranslatedText text="Réduction Totale" className="text-sm text-gray-600" />
        <h2 className="text-3xl font-bold flex items-center gap-2">15.8% <ArrowDownRight className="text-red-600" size={24} /></h2>
        <TranslatedText text="Jan - Août 2024" className="text-sm text-gray-500" />
      </div>


        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <TranslatedText text="Impact Eau (Projet Avril)" className="text-sm text-gray-600" />
          <h2 className="text-3xl font-bold flex items-center gap-2">51.7% <ArrowUpRight className="text-green-600" size={24} /></h2>
          <TranslatedText text="Après infrastructure hydraulique" className="text-sm text-gray-500" />
        </div>


        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <TranslatedText text="Doléances Août" className="text-sm text-gray-600" />
          <h2 className="text-3xl font-bold flex items-center gap-2">684 <Folder className="text-green-600" size={24} /></h2>
          <TranslatedText text="vs 812 en janvier" className="text-sm text-gray-500" />
          </div>
        </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <TranslatedText text="Graphique — Éducation" className="text-sm text-gray-600 mb-2" />
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