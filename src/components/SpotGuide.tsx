import type { Lang } from "@/lib/providers/types";
import type { Spot } from "@/lib/types";
import { degToCardinal } from "@/lib/kite/reco";

interface Props {
  spot: Spot;
  lang: Lang;
}

// sezione formativa sulle convenzioni dei numeri (vento, Douglas, gust...) in card <details> zero-JS.
// La card "vento rispetto alla spiaggia" è contestuale all'azimuth dello spot.
export function SpotGuide({ spot, lang }: Props) {
  const onshoreFromDeg = (spot.beachAzimuth + 180) % 360;
  const offshoreFromDeg = spot.beachAzimuth;
  const onshoreCard = degToCardinal(onshoreFromDeg);
  const offshoreCard = degToCardinal(offshoreFromDeg);
  const beachCard = degToCardinal(spot.beachAzimuth);

  return (
    <section className="px-4 md:px-8 mt-8">
      <div className="flex items-baseline gap-3 flex-wrap">
        <h2 className="font-scribble text-3xl">
          {lang === "it"
            ? "guida — leggere le condizioni"
            : "guide — read the conditions"}
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
          {lang === "it" ? "formativa" : "primer"}
        </span>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-ink/70">
        {lang === "it"
          ? "I numeri qui sopra seguono convenzioni precise. Apri ogni card per capire cosa significano prima di entrare in acqua."
          : "The numbers above follow precise conventions. Open each card to learn what they mean before heading out."}
      </p>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <GuideCard
          title={lang === "it" ? "direzione del vento" : "wind direction"}
          subtitle={lang === "it" ? "convenzione meteo" : "meteo convention"}
        >
          {lang === "it" ? (
            <>
              <p>
                In meteorologia il vento è indicato dalla direzione{" "}
                <strong>DA cui proviene</strong>, non verso cui va.{" "}
                <span className="font-mono">«NE 45°»</span> significa che arriva
                da nord-est e soffia verso sud-ovest.
              </p>
              <p className="mt-2">
                Sulla rosa dei venti la{" "}
                <span className="text-warm font-bold">freccia arancione</span>{" "}
                parte dal centro e punta verso dove il vento spira (cioè
                opposto all’origine).
              </p>
            </>
          ) : (
            <>
              <p>
                In meteorology wind is given by the direction it{" "}
                <strong>comes FROM</strong>, not where it goes.{" "}
                <span className="font-mono">«NE 45°»</span> means it arrives
                from the northeast and blows toward the southwest.
              </p>
              <p className="mt-2">
                On the wind rose the{" "}
                <span className="text-warm font-bold">orange arrow</span>{" "}
                starts at the center and points where the wind blows toward
                (opposite of its origin).
              </p>
            </>
          )}
          <WindConventionDiagram lang={lang} />
        </GuideCard>

        <GuideCard
          title={
            lang === "it"
              ? "vento rispetto alla spiaggia"
              : "wind relative to the beach"
          }
          subtitle={
            lang === "it"
              ? `qui la spiaggia guarda ${beachCard} (${Math.round(spot.beachAzimuth)}°)`
              : `this beach faces ${beachCard} (${Math.round(spot.beachAzimuth)}°)`
          }
        >
          <BeachWindDiagram lang={lang} />
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-ocean/30 px-2 py-0.5">
                onshore
              </span>{" "}
              {lang === "it"
                ? `— viene dal mare (qui da ${onshoreCard}). Ti riporta sempre a riva: sicuro per imparare, ma genera schiuma scomposta vicino a costa.`
                : `— comes from the sea (here from ${onshoreCard}). Always pushes you back to shore: safe for learning, but creates messy whitewater near the coast.`}
            </li>
            <li>
              <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-accent/20 px-2 py-0.5 text-accent">
                side-on · side
              </span>{" "}
              {lang === "it"
                ? "— parallelo o quasi alla riva. È la condizione preferita dai kiter: vento pulito senza turbolenze da terra, sicurezza alta."
                : "— roughly parallel to shore. The condition kiters prefer: clean wind without land turbulence, high safety."}
            </li>
            <li>
              <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-warm/20 px-2 py-0.5 text-warm">
                offshore
              </span>{" "}
              {lang === "it"
                ? `— viene da terra (qui da ${offshoreCard}). Acqua specchio, ma molto pericoloso: ti porta al largo senza modo di tornare. Sconsigliato senza barca di sicurezza.`
                : `— comes from land (here from ${offshoreCard}). Glassy water, but dangerous: it pushes you out with no way back. Avoid without a safety boat.`}
            </li>
          </ul>
        </GuideCard>

        <GuideCard
          title={
            lang === "it"
              ? "intensità (nodi) e taglia kite"
              : "intensity (knots) and kite size"
          }
          subtitle="1 kn ≈ 1.852 km/h ≈ 0.5 m/s"
        >
          <p className="text-sm">
            {lang === "it"
              ? "Il nodo (kn) è la velocità di un miglio nautico l'ora. Range indicativi per un kiter da 75 kg:"
              : "A knot (kn) equals one nautical mile per hour. Rough ranges for a 75 kg kiter:"}
          </p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
            <dt className="font-mono text-xs text-ink/60">&lt; 12 kn</dt>
            <dd>
              {lang === "it"
                ? "debole — foil o kite > 14m²"
                : "light — foil or > 14m² kite"}
            </dd>
            <dt className="font-mono text-xs text-ink/60">12–18 kn</dt>
            <dd>
              {lang === "it"
                ? "minimo planante twintip 11–13m²"
                : "min planing twintip 11–13m²"}
            </dd>
            <dt className="font-mono text-xs text-accent">18–25 kn</dt>
            <dd className="text-accent">
              {lang === "it"
                ? "sweet spot twintip 8–10m²"
                : "sweet spot twintip 8–10m²"}
            </dd>
            <dt className="font-mono text-xs text-ink/60">25–35 kn</dt>
            <dd>
              {lang === "it"
                ? "forte — kite 6–8m², ottimo per wave"
                : "strong — 6–8m² kite, ideal for waves"}
            </dd>
            <dt className="font-mono text-xs text-warm">&gt; 35 kn</dt>
            <dd className="text-warm">
              {lang === "it"
                ? "solo esperti — 4–5m²"
                : "experts only — 4–5m²"}
            </dd>
          </dl>
          <p className="mt-3 text-xs text-ink/60">
            {lang === "it"
              ? "Formula empirica: taglia ≈ (peso_kg / vento_kn) × 2.2 per il twintip."
              : "Rule of thumb: size ≈ (weight_kg / wind_kn) × 2.2 for twintip."}
          </p>
        </GuideCard>

        <GuideCard
          title={lang === "it" ? "scala Douglas (mare)" : "Douglas scale (sea)"}
          subtitle={
            lang === "it"
              ? "10 livelli, parametrati su Hs"
              : "10 levels, indexed by Hs"
          }
        >
          <p className="text-sm">
            {lang === "it" ? (
              <>
                Standard internazionale WMO 3700. Si basa sull’
                <strong>altezza d’onda significativa Hs</strong> = media del
                terzo superiore delle onde. Aspetta picchi singoli fino al{" "}
                <span className="font-mono">+50%</span> rispetto a Hs.
              </>
            ) : (
              <>
                International WMO 3700 standard. Based on{" "}
                <strong>significant wave height Hs</strong> = mean of the top
                third of waves. Expect individual peaks up to{" "}
                <span className="font-mono">+50%</span> over Hs.
              </>
            )}
          </p>
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
            <li>
              <span className="text-ink/40">0</span> · 0 m ·{" "}
              {lang === "it" ? "calmo" : "calm"}
            </li>
            <li>
              <span className="text-ink/40">1</span> · &lt; 0.1 m ·{" "}
              {lang === "it" ? "quasi calmo" : "rippled"}
            </li>
            <li>
              <span className="text-ink/40">2</span> · 0.1–0.5 m ·{" "}
              {lang === "it" ? "poco mosso" : "smooth"}
            </li>
            <li>
              <span className="text-ink/40">3</span> · 0.5–1.25 m ·{" "}
              {lang === "it" ? "mosso" : "slight"}
            </li>
            <li>
              <span className="text-ink/40">4</span> · 1.25–2.5 m ·{" "}
              {lang === "it" ? "molto mosso" : "moderate"}
            </li>
            <li>
              <span className="text-ink/40">5</span> · 2.5–4 m ·{" "}
              {lang === "it" ? "agitato" : "rough"}
            </li>
            <li>
              <span className="text-ink/40">6</span> · 4–6 m ·{" "}
              {lang === "it" ? "molto agitato" : "very rough"}
            </li>
            <li>
              <span className="text-ink/40">7</span> · 6–9 m ·{" "}
              {lang === "it" ? "grosso" : "high"}
            </li>
            <li>
              <span className="text-ink/40">8</span> · 9–14 m ·{" "}
              {lang === "it" ? "molto grosso" : "very high"}
            </li>
            <li>
              <span className="text-ink/40">9</span> · &gt; 14 m ·{" "}
              {lang === "it" ? "tempestoso" : "phenomenal"}
            </li>
          </ul>
        </GuideCard>

        <GuideCard
          title={lang === "it" ? "periodo onda (T)" : "wave period (T)"}
          subtitle={
            lang === "it" ? "secondi tra due creste" : "seconds between crests"
          }
        >
          <p className="text-sm">
            {lang === "it"
              ? "Il periodo dice di che tipo di mare si tratta, a parità di altezza. Onde più lunghe trasportano molta più energia."
              : "Period tells what kind of sea you're getting, for the same height. Longer waves carry much more energy."}
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <span className="font-mono text-xs text-ink/60">T &lt; 6s</span>{" "}
              —{" "}
              {lang === "it"
                ? "onde di vento, corte e scomposte (chop)"
                : "wind waves, short and choppy"}
            </li>
            <li>
              <span className="font-mono text-xs text-ink/60">T 6–9s</span> —{" "}
              {lang === "it"
                ? "swell misto, più ordinato"
                : "mixed swell, more orderly"}
            </li>
            <li>
              <span className="font-mono text-xs text-ink/60">T &gt; 10s</span>{" "}
              —{" "}
              {lang === "it"
                ? "groundswell lungo, onde lisce e potenti tipo surf"
                : "long groundswell, smooth and powerful surf-style"}
            </li>
          </ul>
          <p className="mt-3 text-xs text-ink/60">
            {lang === "it"
              ? "A parità di Hs, raddoppiare T quasi quadruplica l'energia trasportata dall'onda."
              : "For the same Hs, doubling T nearly quadruples the energy carried by the wave."}
          </p>
        </GuideCard>

        <GuideCard
          title={
            lang === "it"
              ? "raffica vs vento medio"
              : "gust vs mean wind"
          }
          subtitle={
            lang === "it"
              ? "gust factor = raffica / medio"
              : "gust factor = gust / mean"
          }
        >
          <p className="text-sm">
            {lang === "it"
              ? "La pagina mostra sia il vento medio che la raffica. Il rapporto è cruciale per scegliere la taglia kite — vai sulla raffica, non sul medio."
              : "The page shows both mean wind and gusts. Their ratio is critical for picking your kite size — size for gusts, not for the mean."}
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <span className="font-mono text-xs text-accent">&lt; 1.2</span> —{" "}
              {lang === "it"
                ? "vento stabile, ideale (es. termiche di Tarifa)"
                : "steady wind, ideal (e.g. Tarifa thermals)"}
            </li>
            <li>
              <span className="font-mono text-xs text-ink/60">1.2–1.4</span> —{" "}
              {lang === "it"
                ? "vento mosso, normale per Mediterraneo"
                : "puffy wind, typical for the Med"}
            </li>
            <li>
              <span className="font-mono text-xs text-warm">&gt; 1.5</span> —{" "}
              {lang === "it"
                ? "rafficato — scegli una taglia più piccola, occhio ai depower"
                : "gusty — size down, watch your depower"}
            </li>
          </ul>
          <p className="mt-3 text-xs text-ink/60">
            {lang === "it"
              ? "I venti termici sono in genere i più stabili; le perturbazioni e i venti da terra i più rafficati."
              : "Thermal winds are usually the steadiest; storm fronts and offshore winds the gustiest."}
          </p>
        </GuideCard>
      </div>
    </section>
  );
}

function GuideCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <details className="paper-card group p-4 open:pb-5 transition-shadow">
      <summary className="flex cursor-pointer list-none items-baseline justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <div className="font-scribble text-xl leading-tight">{title}</div>
          {subtitle && (
            <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-ink/50">
              {subtitle}
            </div>
          )}
        </div>
        <span
          aria-hidden
          className="shrink-0 font-mono text-2xl leading-none text-ink/40 transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="mt-3 text-sm leading-relaxed text-ink/80">
        {children}
      </div>
    </details>
  );
}

function WindConventionDiagram({ lang }: { lang: Lang }) {
  return (
    <div className="mt-3 flex items-center gap-4">
      <svg
        width="84"
        height="84"
        viewBox="0 0 84 84"
        aria-hidden
        className="shrink-0"
      >
        <circle
          cx="42"
          cy="42"
          r="34"
          fill="rgb(var(--paper))"
          stroke="rgb(var(--ink) / 0.6)"
          strokeWidth="1.2"
        />
        {(["N", "E", "S", "W"] as const).map((label, i) => {
          const angle = (i * 90 - 90) * (Math.PI / 180);
          const x = 42 + 36 * Math.cos(angle);
          const y = 42 + 36 * Math.sin(angle) + 3;
          return (
            <text
              key={label}
              x={x}
              y={y}
              textAnchor="middle"
              fontSize="9"
              fontFamily="var(--font-mono)"
              fill="rgb(var(--ink) / 0.7)"
            >
              {label}
            </text>
          );
        })}
        {/* freccia vento "da NE" (45°): la coda parte dal centro e punta verso SW (opposto all’origine) */}
        <g transform="translate(42 42) rotate(225)">
          <line
            x1="0"
            y1="-26"
            x2="0"
            y2="26"
            stroke="rgb(var(--warm))"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <polygon points="0,-26 -5,-18 5,-18" fill="rgb(var(--warm))" />
        </g>
        {/* puntino "DA" sulla circonferenza NE */}
        <circle
          cx={42 + 24 * Math.cos((Math.PI / 180) * (45 - 90))}
          cy={42 + 24 * Math.sin((Math.PI / 180) * (45 - 90))}
          r="3"
          fill="rgb(var(--warm))"
        />
      </svg>
      <div className="font-mono text-[11px] leading-snug text-ink/70">
        {lang === "it" ? (
          <>
            es: vento{" "}
            <span className="font-bold text-warm">da NE</span>
            <br />
            <span className="text-ink/50">→ freccia punta verso SW</span>
          </>
        ) : (
          <>
            e.g. wind <span className="font-bold text-warm">from NE</span>
            <br />
            <span className="text-ink/50">→ arrow points toward SW</span>
          </>
        )}
      </div>
    </div>
  );
}

function BeachWindDiagram({ lang }: { lang: Lang }) {
  return (
    <svg
      viewBox="0 0 280 140"
      aria-hidden
      className="mt-1 w-full max-w-[360px]"
    >
      {/* Banda mare */}
      <rect
        x="0"
        y="0"
        width="280"
        height="58"
        fill="rgb(var(--ocean) / 0.35)"
      />
      <text
        x="6"
        y="14"
        fontSize="9"
        fontFamily="var(--font-mono)"
        fill="rgb(var(--wave))"
      >
        {lang === "it" ? "mare" : "sea"}
      </text>
      {/* Linea di costa */}
      <line
        x1="0"
        y1="60"
        x2="280"
        y2="60"
        stroke="rgb(var(--ink))"
        strokeWidth="1.5"
      />
      {/* Banda terra */}
      <text
        x="6"
        y="76"
        fontSize="9"
        fontFamily="var(--font-mono)"
        fill="rgb(var(--ink) / 0.6)"
      >
        {lang === "it" ? "terra" : "land"}
      </text>

      {/* 1. ONSHORE — verticale dall'alto */}
      <ArrowSvg x1={42} y1={14} x2={42} y2={54} color="ocean" />
      <text
        x="42"
        y="128"
        textAnchor="middle"
        fontSize="9"
        fontFamily="var(--font-mono)"
        fill="rgb(var(--ocean))"
      >
        onshore
      </text>

      {/* 2. SIDE-ON — diagonale 45° dal mare */}
      <ArrowSvg x1={84} y1={18} x2={112} y2={54} color="accent" />
      <text
        x="98"
        y="128"
        textAnchor="middle"
        fontSize="9"
        fontFamily="var(--font-mono)"
        fill="rgb(var(--accent))"
      >
        side-on
      </text>

      {/* 3. SIDE — orizzontale sulla linea di costa */}
      <ArrowSvg x1={140} y1={60} x2={184} y2={60} color="accent" />
      <text
        x="162"
        y="128"
        textAnchor="middle"
        fontSize="9"
        fontFamily="var(--font-mono)"
        fill="rgb(var(--accent))"
      >
        side
      </text>

      {/* 4. SIDE-OFF — diagonale 45° verso il mare */}
      <ArrowSvg x1={196} y1={104} x2={224} y2={68} color="warm" />
      <text
        x="210"
        y="128"
        textAnchor="middle"
        fontSize="9"
        fontFamily="var(--font-mono)"
        fill="rgb(var(--warm))"
      >
        side-off
      </text>

      {/* 5. OFFSHORE — verticale dalla terra verso il mare */}
      <ArrowSvg x1={254} y1={108} x2={254} y2={68} color="warm" />
      <text
        x="254"
        y="128"
        textAnchor="middle"
        fontSize="9"
        fontFamily="var(--font-mono)"
        fill="rgb(var(--warm))"
      >
        offshore
      </text>
    </svg>
  );
}

/**
 * Mini-freccia SVG con punta orientata lungo la linea (x1,y1)→(x2,y2).
 * Il color va passato come token CSS senza var(): la funzione lo wrappa.
 */
function ArrowSvg({
  x1,
  y1,
  x2,
  y2,
  color,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: "ocean" | "accent" | "warm";
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  const stroke = `rgb(var(--${color}))`;
  const head = 5;
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <g transform={`translate(${x2} ${y2}) rotate(${angleDeg + 90})`}>
        <polygon
          points={`0,0 -${head},-${head * 1.6} ${head},-${head * 1.6}`}
          fill={stroke}
        />
      </g>
    </g>
  );
}
