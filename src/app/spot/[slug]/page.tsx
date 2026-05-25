import { Suspense, cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Windrose } from "@/components/Windrose";
import { SeaStateInfoTooltip } from "@/components/SeaStateInfoTooltip";
import { SeaStateDouglasStrip } from "@/components/SeaStateDouglasStrip";
import { SectionSkeleton } from "@/components/SectionSkeleton";
import { SpotGuide } from "@/components/SpotGuide";
import { classifySeaState } from "@/lib/sea-state";
import { DataSourceBadge } from "@/components/data-sources/DataSourceBadge";
import { SpotDataSourcesPanel } from "@/components/data-sources/SpotDataSourcesPanel";
import { LanguageToggle } from "@/components/data-sources/LanguageToggle";
import { findSpotBySlug, SEED_SPOTS } from "@/data/spots";
import { fetchSpotForecast } from "@/lib/forecast/open-meteo";
import { buildMockForecast } from "@/lib/forecast/mock-forecast";
import { getMapMode } from "@/lib/map-mode-server";
import type { MapMode } from "@/lib/map-mode-shared";
import { matchHour, degToCardinal, windRelativeToBeach } from "@/lib/kite/reco";
import {
  loadObservation,
  loadSpotEnrichment,
  loadSst,
  loadTides,
  loadWiki,
  type SpotBundle,
} from "@/lib/providers/enrichment";
import { openMeteoForecast } from "@/lib/providers/open-meteo";
import { withResilience } from "@/lib/providers/resilience";
import { getLang } from "@/lib/i18n/get-t";
import type { OnStatus, Spot, SpotForecast } from "@/lib/types";
import type { Lang, ProviderStatus } from "@/lib/providers/types";

// memoizzato per-request con chiave (spot, mode): i Suspense boundary lo condividono,
// la fetch parte una volta. In demo niente roundtrip; in live passa per withResilience.
const getForecast = cache(
  async (
    spot: Spot,
    mode: MapMode,
  ): Promise<{
    forecast: SpotForecast | null;
    source: ProviderStatus;
    fetchedAt: string;
  }> => {
    if (mode === "demo") {
      const forecast = buildMockForecast(spot, 72);
      return { forecast, source: "demo", fetchedAt: forecast.fetchedAt };
    }
    const result = await withResilience<SpotForecast>(
      (signal) => fetchSpotForecast(spot.id, spot.lat, spot.lng, 72, signal),
      {
        provider: { id: openMeteoForecast.id, available: openMeteoForecast.available },
        timeoutMs: 8000,
      },
    );
    return {
      forecast: result.data,
      source: result.source,
      fetchedAt: result.fetchedAt,
    };
  },
);

export const revalidate = 900;

export function generateStaticParams() {
  return SEED_SPOTS.map((s) => ({ slug: s.slug }));
}

const STATUS_BG: Record<OnStatus, string> = {
  on: "bg-accent text-paper",
  marginal: "bg-note text-ink",
  off: "bg-ink/10 text-ink/70",
};

export default async function SpotPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const spot = findSpotBySlug(slug);
  if (!spot) notFound();
  const [lang, mode] = await Promise.all([getLang(), getMapMode()]);

  return (
    <main className="mx-auto max-w-5xl pb-16">
      <Header />

      <div className="px-4 md:px-8 mt-2 flex items-center justify-between gap-3">
        <Link href="/" className="text-sm text-ink/60 hover:text-ink">
          {lang === "it" ? "← globo" : "← globe"}
        </Link>
        <LanguageToggle current={lang} />
      </div>

      <header className="px-4 md:px-8 mt-4">
        <h1 className="font-scribble text-5xl md:text-6xl">{spot.name}</h1>
        <div className="text-ink/70 mt-1">
          {spot.country} ·{" "}
          <span className="font-mono">
            {spot.lat.toFixed(2)}, {spot.lng.toFixed(2)}
          </span>
        </div>
      </header>

      <Suspense fallback={<ConditionsSkeleton spot={spot} />}>
        <ConditionsSection spot={spot} mode={mode} lang={lang} />
      </Suspense>

      <Suspense
        fallback={
          <SectionSkeleton
            title={lang === "it" ? "stato del mare" : "sea state"}
            lang={lang}
          />
        }
      >
        <SeaStateSlot spot={spot} mode={mode} lang={lang} />
      </Suspense>

      <section className="px-4 md:px-8 mt-6">
        <div className="paper-card p-5">
          <p className="text-lg leading-relaxed">{spot.description}</p>
          {spot.hazards && (
            <p className="mt-3 text-warm text-sm">⚠ {spot.hazards}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-ink/70">
            <span>
              acqua: <span className="font-mono">{spot.waterType}</span>
            </span>
            <span>
              range:{" "}
              <span className="font-mono">
                {spot.windMinKn}–{spot.windMaxKn} kn
              </span>
            </span>
          </div>
        </div>
      </section>

      <SpotGuide spot={spot} lang={lang} />

      {/* una Suspense per sezione: ogni sorgente streama appena pronta (Stormglass lento non blocca SST) */}
      <Suspense
        fallback={
          <SectionSkeleton
            title={lang === "it" ? "temperatura mare" : "sea temperature"}
            lang={lang}
          />
        }
      >
        <SstSlot spot={spot} lang={lang} />
      </Suspense>
      <Suspense
        fallback={
          <SectionSkeleton
            title={lang === "it" ? "boa più vicina" : "nearest buoy"}
            lang={lang}
          />
        }
      >
        <BuoySlot spot={spot} lang={lang} />
      </Suspense>
      {spot.refs?.stormglassEnabled && (
        <Suspense
          fallback={
            <SectionSkeleton
              title={lang === "it" ? "maree" : "tides"}
              lang={lang}
            />
          }
        >
          <TidesSlot spot={spot} lang={lang} />
        </Suspense>
      )}
      <Suspense
        fallback={
          <SectionSkeleton
            title={lang === "it" ? "scheda enciclopedica" : "encyclopedia"}
            lang={lang}
          />
        }
      >
        <WikiSlot spot={spot} lang={lang} />
      </Suspense>

      <Suspense fallback={<ForecastSkeleton />}>
        <ForecastSection spot={spot} mode={mode} lang={lang} />
      </Suspense>

      <Suspense fallback={null}>
        <SourcesPanelSlot spot={spot} mode={mode} lang={lang} />
      </Suspense>
    </main>
  );
}

async function ConditionsSection({
  spot,
  mode,
  lang,
}: {
  spot: Spot;
  mode: MapMode;
  lang: Lang;
}) {
  const { forecast, source, fetchedAt } = await getForecast(spot, mode);
  const nowHour = forecast?.hourly[0];
  const nowMatch = nowHour ? matchHour({ spot, hour: nowHour }) : undefined;

  return (
    <section className="px-4 md:px-8 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="paper-card p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-scribble text-2xl">
            {lang === "it" ? "condizioni ora" : "current conditions"}
          </h2>
          {nowMatch && (
            <span
              className={`rounded-full px-3 py-1 font-mono font-bold text-sm ${STATUS_BG[nowMatch.status]}`}
            >
              {nowMatch.status.toUpperCase()}
            </span>
          )}
        </div>

        {nowHour ? (
          <>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="num text-6xl">{Math.round(nowHour.windKn)}</span>
              <span className="text-ink/70">kn</span>
              <span className="num text-2xl text-ink/60 ml-3">
                ~{Math.round(nowHour.gustKn)}
              </span>
              <span className="text-xs text-ink/60">raffica</span>
            </div>

            <div className="mt-2">
              <DataSourceBadge
                provider="open-meteo"
                status={source}
                ts={fetchedAt}
                lang={lang}
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-ink/60">direzione</div>
                <div className="num text-lg">
                  {degToCardinal(nowHour.windDirDeg)}{" "}
                  <span className="text-xs text-ink/50">
                    {Math.round(nowHour.windDirDeg)}°
                  </span>
                </div>
              </div>
              <div>
                <div className="text-ink/60">rispetto spiaggia</div>
                <div className="text-lg">
                  {windRelativeToBeach(nowHour.windDirDeg, spot.beachAzimuth)}
                </div>
              </div>
              <div>
                <div className="text-ink/60">temp aria</div>
                <div className="num text-lg">{Math.round(nowHour.tempC)}°C</div>
              </div>
              {nowHour.waveHeightM !== undefined && (
                <div>
                  <div className="text-ink/60">onda</div>
                  <div className="num text-lg">
                    {nowHour.waveHeightM.toFixed(1)} m
                    {nowHour.wavePeriodS && (
                      <span className="text-xs text-ink/50 ml-1">
                        @ {Math.round(nowHour.wavePeriodS)}s
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {nowMatch && (
              <ul className="mt-4 text-sm text-ink/70 list-disc list-inside space-y-0.5">
                {nowMatch.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}

            {nowMatch?.recommendedKiteSize && (
              <div className="mt-4 rounded-md bg-note/60 p-3 text-sm">
                taglia kite indicativa per un kiter da 75 kg:{" "}
                <span className="num text-lg">
                  {nowMatch.recommendedKiteSize}m²
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="mt-4 text-ink/60">
            Previsioni non disponibili in questo momento.
          </div>
        )}
      </div>

      <div className="paper-card p-5 flex flex-col">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h2 className="font-scribble text-2xl">
            {lang === "it" ? "rosa dei venti" : "wind rose"}
          </h2>
          {nowHour && (
            <span className="font-mono text-xs text-ink/60">
              {lang === "it" ? "ora" : "now"}{" "}
              <span className="num text-ink">
                {Math.round(nowHour.windDirDeg)}°
              </span>{" "}
              {degToCardinal(nowHour.windDirDeg)}
            </span>
          )}
        </div>

        <div className="mt-3 flex justify-center">
          <Windrose
            highlight={spot.optimalDirections}
            currentDeg={nowHour?.windDirDeg}
          />
        </div>
        <div className="mt-2 text-xs text-ink/60 text-center">
          {lang === "it"
            ? "blu = direzioni ON per lo spot · arancio = vento attuale"
            : "blue = ON directions for this spot · orange = current wind"}
        </div>

        <div className="mt-4 border-t border-ink/10 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
              {lang === "it" ? "direzioni ON" : "ON directions"}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {spot.optimalDirections.map((d) => (
                <span
                  key={d}
                  className="rounded-full bg-ocean/15 px-2 py-0.5 font-mono text-xs text-ink"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
              {lang === "it" ? "spiaggia guarda" : "beach faces"}
            </div>
            <div className="mt-1.5 font-mono text-sm text-ink">
              {degToCardinal(spot.beachAzimuth)}{" "}
              <span className="text-ink/50">
                {Math.round(spot.beachAzimuth)}°
              </span>
            </div>
            {nowHour && (
              <div className="text-xs text-ink/60 mt-0.5">
                {lang === "it" ? "vento ora: " : "wind now: "}
                {windRelativeToBeach(nowHour.windDirDeg, spot.beachAzimuth)}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// slot async per-provider: ognuno await SOLO il suo fetcher dentro la propria <Suspense>.
// Si rendono solo se hanno dati reali (eccezione: tides, sempre visibile per spot stormglassEnabled).
async function SeaStateSlot({
  spot,
  mode,
  lang,
}: {
  spot: Spot;
  mode: MapMode;
  lang: Lang;
}) {
  // riusa la cache di ConditionsSection, niente roundtrip extra
  const { forecast, source, fetchedAt } = await getForecast(spot, mode);
  const nowHour = forecast?.hourly[0];
  // niente onda (laguna chiusa, entroterra) → niente sezione
  if (!nowHour || nowHour.waveHeightM === undefined) return null;
  return (
    <SeaStateSection
      hs={nowHour.waveHeightM}
      periodS={nowHour.wavePeriodS}
      dirDeg={nowHour.waveDirDeg}
      source={source}
      fetchedAt={fetchedAt}
      lang={lang}
    />
  );
}

function SeaStateSection({
  hs,
  periodS,
  dirDeg,
  source,
  fetchedAt,
  lang,
}: {
  hs: number;
  periodS?: number;
  dirDeg?: number;
  source: ProviderStatus;
  fetchedAt: string;
  lang: Lang;
}) {
  const info = classifySeaState(hs);
  return (
    <section className="px-4 md:px-8 mt-6">
      <div className="flex items-baseline gap-3 flex-wrap">
        <h2 className="font-scribble text-3xl">
          {lang === "it" ? "stato del mare" : "sea state"}
        </h2>
        <DataSourceBadge
          provider="open-meteo"
          status={source}
          ts={fetchedAt}
          lang={lang}
        />
      </div>
      <div className="mt-3 paper-card p-5">
        <div className="flex items-center gap-5 flex-wrap">
          <SeaStateInfoTooltip
            waveHeightM={hs}
            wavePeriodS={periodS}
            waveDirDeg={dirDeg}
            size={96}
            showLabel
            lang={lang}
          />
          <div className="flex-1 min-w-[200px]">
            <div className="font-scribble text-3xl leading-tight">
              {lang === "it" ? info.labelIt : info.labelEn}
            </div>
            <div className="font-mono text-xs uppercase tracking-widest text-ink/50 mt-0.5">
              {lang === "it" ? "scala Douglas" : "Douglas scale"} · {info.level}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-ink/60 text-xs">
                  {lang === "it" ? "altezza Hs" : "height Hs"}
                </div>
                <div className="num text-lg">{hs.toFixed(1)} m</div>
              </div>
              {periodS !== undefined && (
                <div>
                  <div className="text-ink/60 text-xs">
                    {lang === "it" ? "periodo" : "period"}
                  </div>
                  <div className="num text-lg">{Math.round(periodS)} s</div>
                </div>
              )}
              {dirDeg !== undefined && (
                <div>
                  <div className="text-ink/60 text-xs">
                    {lang === "it" ? "direzione" : "direction"}
                  </div>
                  <div className="num text-lg">{Math.round(dirDeg)}°</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <SeaStateDouglasStrip currentLevel={info.level} lang={lang} />
      </div>
      <div className="mt-3 text-xs text-ink/50">
        {lang === "it"
          ? "altezza onda significativa via Open-Meteo Marine API · classificazione Douglas (WMO 3700)"
          : "significant wave height via Open-Meteo Marine API · Douglas classification (WMO 3700)"}
      </div>
    </section>
  );
}

async function SstSlot({ spot, lang }: { spot: Spot; lang: Lang }) {
  const result = await loadSst(spot);
  return <SstSection result={result} lang={lang} />;
}

async function BuoySlot({ spot, lang }: { spot: Spot; lang: Lang }) {
  const result = await loadObservation(spot);
  return <BuoySection result={result} lang={lang} />;
}

async function TidesSlot({ spot, lang }: { spot: Spot; lang: Lang }) {
  const result = await loadTides(spot);
  return <TidesSection result={result} lang={lang} />;
}

async function WikiSlot({ spot, lang }: { spot: Spot; lang: Lang }) {
  const result = await loadWiki(spot, lang);
  return <WikiSection result={result} lang={lang} />;
}

function SstSection({
  result,
  lang,
}: {
  result: SpotBundle["sst"];
  lang: Lang;
}) {
  const sst = result.data;
  if (!sst) return null;
  return (
    <section className="px-4 md:px-8 mt-6">
      <div className="flex items-baseline gap-3 flex-wrap">
        <h2 className="font-scribble text-3xl">
          {lang === "it" ? "temperatura mare" : "sea temperature"}
        </h2>
        <DataSourceBadge
          provider="open-meteo"
          status={result.source}
          ts={result.fetchedAt}
          lang={lang}
        />
      </div>
      <div className="mt-3 paper-card p-4">
        <div className="flex items-baseline gap-2">
          <span className="num text-5xl">{sst.sstC.toFixed(1)}°C</span>
        </div>
      </div>
      <div className="mt-3 text-xs text-ink/50">
        {lang === "it"
          ? "SST via Open-Meteo Marine API · aggiornata ogni 15 min"
          : "SST via Open-Meteo Marine API · refreshed every 15 min"}
      </div>
    </section>
  );
}

function BuoySection({
  result,
  lang,
}: {
  result: SpotBundle["observation"];
  lang: Lang;
}) {
  const obs = result.data;
  if (!obs) return null;
  return (
    <section className="px-4 md:px-8 mt-6">
      <div className="flex items-baseline gap-3 flex-wrap">
        <h2 className="font-scribble text-3xl">
          {lang === "it" ? "boa più vicina" : "nearest buoy"}
        </h2>
        <DataSourceBadge
          provider="noaa-ndbc"
          status={result.source}
          ts={result.fetchedAt}
          lang={lang}
        />
      </div>
      <div className="mt-3 paper-card p-4">
        <div className="text-sm text-ink/80 space-y-1">
          <div className="font-mono">station {obs.stationId}</div>
          {obs.windKn !== undefined && (
            <div>
              {lang === "it" ? "vento" : "wind"}:{" "}
              <span className="num">{Math.round(obs.windKn)}</span> kn
              {obs.gustKn !== undefined && (
                <>
                  {" "}
                  · {lang === "it" ? "raffica" : "gust"}{" "}
                  <span className="num">{Math.round(obs.gustKn)}</span>
                </>
              )}
            </div>
          )}
          {obs.waveHeightM !== undefined && (
            <div>
              {lang === "it" ? "onda" : "wave"}:{" "}
              <span className="num">{obs.waveHeightM.toFixed(1)}</span> m
              {obs.wavePeriodS !== undefined && (
                <>
                  {" "}
                  @ <span className="num">{Math.round(obs.wavePeriodS)}</span>s
                </>
              )}
            </div>
          )}
          {obs.waterTempC !== undefined && (
            <div>
              {lang === "it" ? "acqua" : "water"}:{" "}
              <span className="num">{obs.waterTempC.toFixed(1)}</span>°C
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 text-xs text-ink/50">
        {lang === "it"
          ? "osservazioni real-time NDBC NOAA · public domain · ~10 min"
          : "real-time NDBC NOAA observations · public domain · ~10 min"}
      </div>
    </section>
  );
}

function TidesSection({
  result,
  lang,
}: {
  result: SpotBundle["tides"];
  lang: Lang;
}) {
  const tides = result.data ?? [];
  const has = tides.length > 0;
  const emptyCopy =
    result.source === "requires-key"
      ? lang === "it"
        ? "Stormglass non configurato — manca STORMGLASS_API_KEY in .env"
        : "Stormglass not configured — STORMGLASS_API_KEY missing in .env"
      : result.source === "disabled"
        ? lang === "it"
          ? "Stormglass disabilitato per questo spot"
          : "Stormglass disabled for this spot"
        : lang === "it"
          ? "Nessuna marea disponibile per questo spot."
          : "No tide data available for this spot.";

  return (
    <section className="px-4 md:px-8 mt-6">
      <div className="flex items-baseline gap-3 flex-wrap">
        <h2 className="font-scribble text-3xl">
          {lang === "it" ? "maree" : "tides"}
        </h2>
        <DataSourceBadge
          provider="stormglass"
          status={result.source}
          ts={result.fetchedAt}
          lang={lang}
        />
      </div>

      {has ? (
        <div className="mt-3 paper-card p-4">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {tides.slice(0, 8).map((t) => (
              <li
                key={t.timeIso}
                className="flex items-center justify-between"
              >
                <span className="font-mono text-xs text-ink/60">
                  {new Date(t.timeIso).toLocaleString(lang, {
                    weekday: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span
                  className={`font-mono text-xs uppercase ${t.type === "high" ? "text-accent" : "text-warm"}`}
                >
                  {t.type}
                </span>
                <span className="num">{t.heightM.toFixed(2)} m</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-3 paper-card p-4 text-ink/60 text-sm">
          {emptyCopy}
        </div>
      )}

      <div className="mt-3 text-xs text-ink/50">
        {lang === "it"
          ? "estremi marea astronomica via Stormglass · aggiornati ogni 24h"
          : "astronomical tide extremes via Stormglass · refreshed every 24h"}
      </div>
    </section>
  );
}

function WikiSection({
  result,
  lang,
}: {
  result: SpotBundle["wiki"];
  lang: Lang;
}) {
  const wiki = result.data;
  if (!wiki) return null;
  return (
    <section className="px-4 md:px-8 mt-6">
      <div className="flex items-baseline gap-3 flex-wrap">
        <h2 className="font-scribble text-3xl">
          {lang === "it" ? "scheda enciclopedica" : "encyclopedia"}
        </h2>
        <DataSourceBadge
          provider="wikipedia"
          status={result.source}
          ts={result.fetchedAt}
          lang={lang}
        />
      </div>
      <div className="mt-3 paper-card p-4">
        <p className="text-sm text-ink/80 leading-relaxed">{wiki.summary}</p>
        <a
          href={wiki.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs text-accent hover:underline"
        >
          {lang === "it" ? "voce completa ↗" : "full article ↗"}
        </a>
      </div>
      <div className="mt-3 text-xs text-ink/50">
        {lang === "it"
          ? "summary via Wikipedia REST API · CC BY-SA · cache 24h"
          : "summary via Wikipedia REST API · CC BY-SA · 24h cache"}
      </div>
    </section>
  );
}

async function ForecastSection({
  spot,
  mode,
  lang,
}: {
  spot: Spot;
  mode: MapMode;
  lang: Lang;
}) {
  const { forecast, source, fetchedAt } = await getForecast(spot, mode);
  const next72 = forecast?.hourly ?? [];

  const byDay = new Map<string, typeof next72>();
  for (const h of next72) {
    const day = h.timeIso.slice(0, 10);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(h);
  }
  const days = Array.from(byDay.entries()).slice(0, 7);

  return (
    <section className="px-4 md:px-8 mt-6">
      <div className="flex items-baseline gap-3 flex-wrap">
        <h2 className="font-scribble text-3xl">
          {lang === "it" ? "previsioni" : "forecast"}
        </h2>
        <DataSourceBadge
          provider="open-meteo"
          status={source}
          ts={fetchedAt}
          lang={lang}
        />
      </div>
      {days.length === 0 ? (
        <div className="mt-3 paper-card p-4 text-ink/60 text-sm">
          Previsioni non disponibili in questo momento.
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {days.map(([day, hours]) => {
            const peak = hours.reduce((max, h) =>
              h.windKn > max.windKn ? h : max,
            );
            const peakMatch = matchHour({ spot, hour: peak });
            return (
              <div
                key={day}
                className="paper-card p-3 flex items-center justify-between gap-3"
              >
                <div className="font-mono text-sm">{day}</div>
                <div className="flex items-baseline gap-2">
                  <span className="num text-2xl">{Math.round(peak.windKn)}</span>
                  <span className="text-xs text-ink/60">
                    kn · {degToCardinal(peak.windDirDeg)}
                  </span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-xs font-bold ${STATUS_BG[peakMatch.status]}`}
                >
                  {peakMatch.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-3 text-xs text-ink/50">
        dati GFS via Open-Meteo · aggiornati ogni 15 min
      </div>
    </section>
  );
}

async function SourcesPanelSlot({
  spot,
  mode,
  lang,
}: {
  spot: Spot;
  mode: MapMode;
  lang: Lang;
}) {
  if (process.env.NEXT_PUBLIC_SHOW_SPOT_SOURCES_PANEL === "0") return null;
  const [bundle, fc] = await Promise.all([
    loadSpotEnrichment(spot, lang),
    getForecast(spot, mode),
  ]);
  return (
    <SpotDataSourcesPanel
      bundle={bundle}
      forecastSource={fc.source}
      forecastTs={fc.fetchedAt}
      lang={lang}
    />
  );
}

function ConditionsSkeleton({ spot }: { spot: Spot }) {
  return (
    <section className="px-4 md:px-8 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="paper-card p-5">
        <h2 className="font-scribble text-2xl">condizioni ora</h2>
        <div className="mt-4 text-ink/50 text-sm animate-pulse">
          carico previsioni…
        </div>
      </div>
      <div className="paper-card p-5 flex flex-col items-center">
        <h2 className="font-scribble text-2xl self-start">rosa dei venti</h2>
        <div className="mt-3 opacity-40">
          <Windrose highlight={spot.optimalDirections} />
        </div>
      </div>
    </section>
  );
}

function ForecastSkeleton() {
  return (
    <section className="px-4 md:px-8 mt-6">
      <h2 className="font-scribble text-3xl">previsioni</h2>
      <div className="mt-3 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="paper-card p-3 h-12 animate-pulse opacity-50"
          />
        ))}
      </div>
    </section>
  );
}
