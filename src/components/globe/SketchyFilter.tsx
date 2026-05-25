// filtro SVG sketchy globale: definito UNA volta (turbulence è GPU-costly),
// referenziato dagli icon via filter="url(#kp-sketchy)"
export function SketchyFilter() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden
      style={{ position: "absolute", pointerEvents: "none" }}
    >
      <defs>
        <filter id="kp-sketchy" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.028"
            numOctaves="2"
            seed="3"
          />
          <feDisplacementMap in="SourceGraphic" scale="1.8" />
        </filter>
      </defs>
    </svg>
  );
}
