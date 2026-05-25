import { Suspense } from "react";
import { Legend } from "@/components/Legend";
import { LiveHeader } from "@/components/LiveHeader";
import { LiveMapPanel } from "@/components/LiveMapPanel";
import { LiveSidePanel } from "@/components/LiveSidePanel";
import { DataSourcesStrip } from "@/components/data-sources/DataSourcesStrip";
import { StormBanner } from "@/components/data-sources/StormBanner";
import { SEED_SPOTS } from "@/data/spots";
import { loadHomeBundle } from "@/lib/providers/home-bundle";
import { getLang } from "@/lib/i18n/get-t";
import { MapModeProvider } from "@/lib/map-mode";
import { getMapMode } from "@/lib/map-mode-server";

export const revalidate = 900;

const SHOW_STRIP = process.env.NEXT_PUBLIC_SHOW_DATA_SOURCES_STRIP !== "0";

export default async function HomePage() {
  const [bundle, initialMode] = await Promise.all([loadHomeBundle(), getMapMode()]);
  const liveStorms = bundle.storms.data ?? [];

  return (
    <MapModeProvider value={initialMode}>
      <main className="mx-auto max-w-[1400px] pb-12">
        <LiveHeader />

        <section className="px-4 md:px-8 mt-3 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-5 items-start">
          <div className="flex flex-col gap-3">
            <LiveMapPanel spots={SEED_SPOTS} initialStorms={liveStorms} />
            <Legend />
            <Suspense fallback={null}>
              <StormBannerSlot />
            </Suspense>
            {SHOW_STRIP && (
              <Suspense fallback={null}>
                <DataSourcesStripSlot />
              </Suspense>
            )}
          </div>
          <LiveSidePanel spots={SEED_SPOTS} />
        </section>
      </main>
    </MapModeProvider>
  );
}

async function DataSourcesStripSlot() {
  const [bundle, lang] = await Promise.all([loadHomeBundle(), getLang()]);
  return <DataSourcesStrip snapshot={bundle.providerStatus} lang={lang} />;
}

async function StormBannerSlot() {
  const [bundle, lang] = await Promise.all([loadHomeBundle(), getLang()]);
  const storms = bundle.storms.data ?? [];
  if (storms.length === 0) return null;
  return <StormBanner storms={storms} spots={SEED_SPOTS} lang={lang} />;
}
