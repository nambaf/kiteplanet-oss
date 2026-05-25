import { CloudLightning, Waves, Wind } from "lucide-react";

const sketchy = "[filter:url(#kp-sketchy)]";

export function Legend() {
  return (
    <section className="paper-card p-3 kp-fade-up">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-scribble text-xl">legenda</h3>
        <span className="flex-1 border-b border-warm/40" />
      </div>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-sm">
        <Row icon={<OnDot />} label="spot ON" sub="ora" />
        <Row
          icon={<Wind className={`w-4 h-4 text-wind ${sketchy}`} strokeWidth={2} />}
          label="vento"
          sub="kn"
        />
        <Row
          icon={<Waves className={`w-4 h-4 text-wave ${sketchy}`} strokeWidth={2} />}
          label="onda"
          sub="m"
        />
        <Row
          icon={
            <CloudLightning
              className={`w-4 h-4 text-storm ${sketchy}`}
              strokeWidth={1.7}
            />
          }
          label="temporale"
          sub="storm"
        />
        <Row icon={<CycloneIcon />} label="ciclone" sub="spirale" />
        <Row icon={<StreakIcon />} label="vento prevalente" sub="streak" />
        <Row icon={<BuoyIcon />} label="boa" sub="NDBC" />
      </ul>
    </section>
  );
}

function Row({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <li className="flex items-baseline gap-2">
      <span className="flex-shrink-0 self-center">{icon}</span>
      <span>{label}</span>
      <span className="text-ink/40 text-xs ml-auto font-mono">{sub}</span>
    </li>
  );
}

// dot warm, stessa CSS var del .kp-pin-card-dot del Globe
function OnDot() {
  return (
    <span
      className="inline-block w-3 h-3 rounded-full"
      style={{ background: "rgb(var(--warm))" }}
      aria-hidden
    />
  );
}

// spirale ciclonica scalata per la legenda, riprende il pattern di .kp-cyclone
function CycloneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-4 h-4 text-storm ${sketchy}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M 12 4 a 8 8 0 1 1 -7.95 8.7 a 5 5 0 1 1 9.5 -1.7 a 2.4 2.4 0 1 1 -3.5 -2" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </svg>
  );
}

// wind streak: stesso SVG del Globe
function StreakIcon() {
  return (
    <svg
      viewBox="0 0 22 6"
      className={`w-5 h-2 text-ink/70 ${sketchy}`}
      fill="none"
      aria-hidden
    >
      <line
        x1="1"
        y1="3"
        x2="20"
        y2="3"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeDasharray="5 2"
      />
      <path
        d="M 18 1 L 21 3 L 18 5"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// boa NDBC: stessa SVG di .kp-buoy
function BuoyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-4 h-4 text-ink ${sketchy}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="12" y1="3" x2="12" y2="9" />
      <circle cx="12" cy="3" r="0.9" fill="currentColor" />
      <path d="M8 9 L16 9 L14.5 15 L9.5 15 Z" />
      <path d="M4 18 Q7 16 10 18 T16 18 T22 18" />
    </svg>
  );
}
