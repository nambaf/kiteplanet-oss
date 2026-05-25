import type { Metadata, Viewport } from "next";
import { fontPatrick, fontCaveat, fontMono } from "@/lib/fonts";
import { cn } from "@/lib/cn";
import { SketchyFilter } from "@/components/globe/SketchyFilter";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Kiteplanet",
  description:
    "Trova lo spot di kitesurf giusto. Vento, onda e marea in tempo reale per il Mediterraneo.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#ece6d6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={cn(fontPatrick.variable, fontCaveat.variable, fontMono.variable)}>
      <body className="palette-carta">
        <SketchyFilter />
        {children}
      </body>
    </html>
  );
}
