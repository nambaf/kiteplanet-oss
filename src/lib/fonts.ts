import { Caveat, Patrick_Hand, Space_Mono } from "next/font/google";

export const fontPatrick = Patrick_Hand({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-patrick",
  display: "swap",
});

export const fontCaveat = Caveat({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

export const fontMono = Space_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});
