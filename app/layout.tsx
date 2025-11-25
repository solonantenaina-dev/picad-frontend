import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/nabvar.component";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Module de Saisie et de Gestion des Données",
  description: "Application de gestion des données et prise de notes",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {/* La navbar sera masquée sur la page login grâce au composant Navbar lui-même */}
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
