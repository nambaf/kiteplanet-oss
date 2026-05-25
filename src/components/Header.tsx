import Link from "next/link";

interface Props {
  onCount?: number;
}

function KiteIcon() {
  return (
    <svg
      width="32"
      height="36"
      viewBox="0 0 32 36"
      aria-hidden
      className="flex-shrink-0 [filter:url(#kp-sketchy)]"
    >
      {/* corpo del kite: diamante */}
      <path
        d="M 16 2 L 28 16 L 16 28 L 4 16 Z"
        fill="rgb(var(--warm))"
        stroke="rgb(var(--ink))"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* spine interne */}
      <path
        d="M 16 2 L 16 28 M 4 16 L 28 16"
        stroke="rgb(var(--ink) / 0.45)"
        strokeWidth="0.8"
        fill="none"
      />
      {/* coda */}
      <path
        d="M 16 28 Q 14 31, 16 33 Q 18 35, 16 36"
        stroke="rgb(var(--ink))"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Header({ onCount }: Props = {}) {
  return (
    <header className="flex items-center justify-between px-4 py-3 md:px-8">
      <Link
        href="/"
        className="flex items-center gap-2.5 leading-none text-ink"
      >
        <KiteIcon />
        <span className="font-scribble text-4xl">kiteplanet</span>
      </Link>
      {onCount !== undefined && onCount > 0 ? (
        <span className="text-sm flex items-baseline gap-1.5">
          <span className="num text-warm text-xl">{onCount}</span>
          <span className="text-ink/60">ON ora nel Mediterraneo</span>
        </span>
      ) : (
        <span className="text-xs text-ink/50 font-mono">
          vento &middot; onda &middot; spot
        </span>
      )}
    </header>
  );
}
