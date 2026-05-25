import { NextResponse } from "next/server";
import { fetchSpotForecast } from "@/lib/forecast/open-meteo";
import { findSpotBySlug } from "@/data/spots";

export const runtime = "edge";
export const revalidate = 900;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const spot = findSpotBySlug(slug);
  if (!spot) {
    return NextResponse.json({ error: "spot not found" }, { status: 404 });
  }

  try {
    const forecast = await fetchSpotForecast(spot.id, spot.lat, spot.lng);
    return NextResponse.json(forecast, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
