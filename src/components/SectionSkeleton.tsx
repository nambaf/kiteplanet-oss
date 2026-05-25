import type { Lang } from "@/lib/providers/types";

interface Props {
  title: string;
  lang: Lang;
  height?: string; // classe Tailwind, default h-28
}

// placeholder per Suspense slot: paper-card con bordo dashed e onda animata, senza layout shift
export function SectionSkeleton({ title, lang, height = "h-28" }: Props) {
  return (
    <section className="px-4 md:px-8 mt-6">
      <div className="flex items-baseline gap-3 flex-wrap">
        <h2 className="font-scribble text-3xl text-ink/45">{title}</h2>
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40 animate-pulse">
          {lang === "it" ? "carico…" : "loading…"}
        </span>
      </div>
      <div
        className={`mt-3 paper-card paper-card-loading ${height} relative overflow-hidden flex items-center justify-center`}
      >
        <LoadingWave />
      </div>
    </section>
  );
}

function LoadingWave() {
  return (
    <svg
      viewBox="0 0 200 40"
      width="160"
      height="30"
      className="opacity-50"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g className="kp-loading-wave">
        <path
          d="M-50 22 Q-37.5 10 -25 22 T0 22 T25 22 T50 22 T75 22 T100 22 T125 22 T150 22 T175 22 T200 22 T225 22 T250 22"
          fill="none"
          stroke="rgb(var(--wind))"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
