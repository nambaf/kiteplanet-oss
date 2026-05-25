import Link from "next/link";
import { Header } from "@/components/Header";
import { getLang } from "@/lib/i18n/get-t";

export default async function NotFound() {
  const lang = await getLang();
  const t = lang === "it"
    ? {
        kicker: "spot fuori range",
        title: "niente vento da queste parti",
        body:
          "La pagina che cerchi è offshore. Forse il link è cambiato, oppure lo spot non è nel nostro catalogo.",
        backHome: "← torna al globo",
        sources: "sorgenti dati",
        hint: "errore 404 · pagina non trovata",
      }
    : {
        kicker: "spot out of range",
        title: "no wind round here",
        body:
          "The page you're after is offshore. The link may have moved, or the spot isn't in our catalog.",
        backHome: "← back to globe",
        sources: "data sources",
        hint: "error 404 · page not found",
      };

  return (
    <main className="mx-auto max-w-5xl pb-16">
      <Header />

      <section className="px-4 md:px-8 mt-10 md:mt-16">
        <div className="paper-card flex flex-col items-center gap-4 p-8 text-center md:p-12">
          <KiteAwaySvg />

          <div className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
            {t.kicker}
          </div>

          <h1 className="font-scribble text-8xl leading-none text-ink md:text-9xl">
            404
          </h1>

          <p className="font-scribble text-3xl leading-tight text-ink md:text-4xl">
            {t.title}
          </p>

          <p className="max-w-md text-ink/70 leading-relaxed">{t.body}</p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-full bg-accent px-5 py-2 font-mono text-sm text-paper transition-opacity hover:opacity-90"
            >
              {t.backHome}
            </Link>
            <Link
              href="/data-sources"
              className="rounded-full border border-ink/20 px-5 py-2 font-mono text-sm text-ink transition-colors hover:border-ink/40"
            >
              {t.sources}
            </Link>
          </div>

          <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-ink/40">
            {t.hint}
          </div>
        </div>
      </section>
    </main>
  );
}

function KiteAwaySvg() {
  return (
    <svg
      width="200"
      height="130"
      viewBox="0 0 200 130"
      role="img"
      aria-label="kite flying away"
      className="overflow-visible"
    >
      {/* Linee di vento di sfondo */}
      <g
        fill="none"
        stroke="rgb(var(--ink) / 0.25)"
        strokeWidth="1"
        strokeLinecap="round"
      >
        <path d="M 8 45 Q 38 38 70 45" />
        <path d="M 4 70 Q 36 62 72 70" />
        <path d="M 12 95 Q 42 88 68 96" />
      </g>

      {/* Bar + bridle: kiter al suolo che tiene la barra */}
      <g
        stroke="rgb(var(--ink) / 0.85)"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      >
        <line x1="40" y1="118" x2="55" y2="118" />
        {/* Bridle lines che salgono al kite */}
        <line x1="48" y1="118" x2="140" y2="55" />
        <line x1="48" y1="118" x2="155" y2="40" />
      </g>

      {/* Kite tipo C/Bow stilizzato in alto a destra, leggermente ruotato */}
      <g transform="translate(125 20) rotate(18)">
        {/* Profilo kite */}
        <path
          d="M 0 18 Q 18 -8 50 -2 Q 60 18 50 38 Q 25 32 0 18 Z"
          fill="rgb(var(--warm))"
          stroke="rgb(var(--ink))"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {/* Center strut */}
        <path
          d="M 25 4 Q 27 18 25 32"
          fill="none"
          stroke="rgb(var(--ink) / 0.55)"
          strokeWidth="0.8"
        />
        {/* Ribs */}
        <path
          d="M 12 8 Q 14 18 12 28 M 38 1 Q 40 18 38 35"
          fill="none"
          stroke="rgb(var(--ink) / 0.4)"
          strokeWidth="0.7"
        />
      </g>

      {/* Piccola scia "wind" attorno al kite, suggerendo movimento */}
      <g
        fill="none"
        stroke="rgb(var(--ink) / 0.3)"
        strokeWidth="0.9"
        strokeLinecap="round"
      >
        <path d="M 110 30 Q 120 25 132 27" />
        <path d="M 115 50 Q 124 47 134 50" />
      </g>
    </svg>
  );
}
