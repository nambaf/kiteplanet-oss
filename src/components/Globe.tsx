"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/addons/renderers/CSS2DRenderer.js";
import { feature, mesh } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type {
  FeatureCollection,
  MultiLineString,
  MultiPolygon,
  Polygon,
  Position,
} from "geojson";
import earcut from "earcut";
import type { Spot } from "@/lib/types";
import {
  type SnapshotMap,
  type SpotSnapshot,
} from "@/lib/forecast/snapshot";
import { spotMatchesFilter, type FilterKey } from "@/lib/filter";
import { COUNTRY_LABELS, type WindStreak } from "@/data/atmosphere";
import { NDBC_STATIONS } from "@/data/ndbc-stations";
import type { CycloneMarker } from "@/lib/cyclone-marker";
import { degToCardinal } from "@/lib/kite/reco";
import { seaStateMiniSvgString } from "@/lib/sea-state-svg";

// icone SVG inline nella card del pin (CARD_ICON_WAVE è dinamico, vedi sea-state-svg.ts)
const CARD_ICON_WIND = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="rgb(var(--wind))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M12.8 19.6A2 2 0 1 0 14 16H2"/></svg>`;
const CARD_ICON_BOLT = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="rgb(var(--storm))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.326A7 7 0 1 1 15.71 19"/><path d="m13 12-3 5h4l-3 5"/></svg>`;

const RADIUS = 1;
const DIVE_DURATION_MS = 700;
const MIN_DIST = 1.4;
const MAX_DIST = 6;
const INITIAL_DIST = 3.2;
const DEFAULT_CENTER: [number, number] = [40, 15];
const LABEL_FRONT_THRESHOLD = 0.25; // dot prodotto: 1 = al centro del globo, 0 = sul profilo

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function readPaletteColor(varName: string, fallback = "#888"): THREE.Color {
  if (typeof window === "undefined") return new THREE.Color(fallback);
  const raw = getComputedStyle(document.body).getPropertyValue(varName).trim();
  if (!raw) return new THREE.Color(fallback);
  const parts = raw.split(/\s+/).map(Number);
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    return new THREE.Color(parts[0] / 255, parts[1] / 255, parts[2] / 255);
  }
  return new THREE.Color(raw);
}

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// path SVG di una spirale Archimedea (cicloni)
function spiralPath(
  cx: number,
  cy: number,
  startR: number,
  endR: number,
  turns: number,
  steps = 80,
): string {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = startR + (endR - startR) * t;
    const a = t * turns * Math.PI * 2;
    const x = (cx + r * Math.cos(a)).toFixed(2);
    const y = (cy + r * Math.sin(a)).toFixed(2);
    pts.push(`${i === 0 ? "M" : "L"} ${x} ${y}`);
  }
  return pts.join(" ");
}

interface SpotEntry {
  wrapper: HTMLDivElement;
  card: HTMLDivElement;
  dot: HTMLSpanElement;
  position: THREE.Vector3;
  spot: Spot;
}

function dotColorForStatus(status: SpotSnapshot["match"]["status"] | undefined): string {
  if (status === "on") return "rgb(var(--warm))";
  if (status === "marginal") return "rgb(var(--warm) / 0.55)";
  if (status === "off") return "rgb(var(--muted) / 0.7)";
  return "rgb(var(--warm))";
}

function pinCardHTML(spot: Spot, snap: SpotSnapshot | undefined, dotColor: string): string {
  if (snap) {
    const cardinal = degToCardinal(snap.windDirDeg);
    const waveRow =
      snap.waveHeightM !== undefined && snap.waveHeightM > 0.3
        ? `<div class="kp-pin-card-row">${seaStateMiniSvgString(snap.waveHeightM, undefined)}<span class="num">${snap.waveHeightM.toFixed(1)}</span><span class="unit">m</span></div>`
        : "";
    const stormRow = snap.events.includes("storm")
      ? `<div class="kp-pin-card-event">${CARD_ICON_BOLT}<span>temporale</span></div>`
      : "";
    return `
      <div class="kp-pin-card-head">
        <span class="kp-pin-card-dot" style="background: ${dotColor}"></span>
        <span class="kp-pin-card-name">${spot.name}</span>
      </div>
      <div class="kp-pin-card-row">
        ${CARD_ICON_WIND}<span class="num">${Math.round(snap.windKn)}</span><span class="unit">kn</span><span>${cardinal}</span>
      </div>
      ${waveRow}
      ${stormRow}
    `;
  }
  return `
    <div class="kp-pin-card-head">
      <span class="kp-pin-card-dot" style="background: ${dotColor}"></span>
      <span class="kp-pin-card-name">${spot.name}</span>
    </div>
    <div class="kp-pin-card-row">
      ${CARD_ICON_WIND}<span class="num">—</span><span class="unit">kn</span><span>${spot.countryCode}</span>
    </div>
  `;
}

function applySnapToEntry(entry: SpotEntry, snap: SpotSnapshot | undefined): void {
  const status = snap?.match.status;
  const color = dotColorForStatus(status);
  entry.dot.style.background = color;
  entry.dot.classList.toggle("kp-pin-pulse", status === "on");
  entry.card.classList.toggle("kp-pin-card-stale", !snap);
  entry.card.innerHTML = pinCardHTML(entry.spot, snap, color);
}

interface MarkerEntry {
  el: HTMLDivElement;
  obj: CSS2DObject;
  position: THREE.Vector3;
}

const SPIRAL_PATH = spiralPath(30, 30, 2, 22, 2.5, 100);

function createStreakEntry(s: WindStreak): MarkerEntry {
  const pos = latLngToVec3(s.lat, s.lng, RADIUS * 1.003);
  const el = document.createElement("div");
  el.className = "kp-streak-dash";
  el.innerHTML = `
    <svg width="22" height="6" viewBox="0 0 22 6" fill="none"
         style="transform: rotate(${Math.round(s.dirDeg)}deg); display:block;">
      <line x1="1" y1="3" x2="20" y2="3" stroke="currentColor"
            stroke-width="1.5" stroke-linecap="round"
            stroke-dasharray="5 2" />
      <path d="M 18 1 L 21 3 L 18 5" stroke="currentColor"
            stroke-width="1.4" stroke-linecap="round"
            stroke-linejoin="round" fill="none" />
    </svg>`;
  const obj = new CSS2DObject(el);
  obj.position.copy(pos);
  return { el, obj, position: pos };
}

function createCycloneEntry(cy: CycloneMarker): MarkerEntry {
  const pos = latLngToVec3(cy.lat, cy.lng, RADIUS * 1.0);
  const el = document.createElement("div");
  el.className = "kp-cyclone";
  el.innerHTML = `
    <svg class="kp-cyclone-svg" width="60" height="60" viewBox="0 0 60 60"
         fill="none" stroke="currentColor" stroke-width="1.6"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="${SPIRAL_PATH}" />
      <circle cx="30" cy="30" r="2.2" fill="currentColor" />
    </svg>
    <div class="kp-cyclone-label">${cy.label}</div>`;
  const obj = new CSS2DObject(el);
  obj.position.copy(pos);
  return { el, obj, position: pos };
}

// soglie zoom-distance per i layer atmosferici
const COUNTRY_VISIBLE_DISTANCE = 3.5;
const STREAK_VISIBLE_DISTANCE = 2.6;
const CYCLONE_FRONT_THRESHOLD = 0.1;
const CARD_VISIBLE_DISTANCE = 3.0;
const BUOY_VISIBLE_DISTANCE = 2.4;
const BUOY_FRONT_THRESHOLD = 0.2;

interface Props {
  spots: Spot[];
  snapshots?: SnapshotMap;
  filter?: FilterKey;
  // fonte decisa dal parent: mock in demo mode, NHC live in live mode
  cyclones?: CycloneMarker[];
  windStreaks?: WindStreak[];
  center?: [number, number];
  height?: string;
}

interface GlobeActions {
  zoom: (factor: number) => void;
  rotate: (dTheta: number, dPhi: number) => void;
  reset: () => void;
  setDistance: (distance: number) => void;
}

export function Globe({
  spots,
  snapshots,
  filter = "tutti",
  cyclones = [],
  windStreaks = [],
  center = DEFAULT_CENTER,
  height = "min(70vh, 560px)",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<GlobeActions | null>(null);
  // filter/snapshots/cicloni/streaks passano per ref: il render loop e le useEffect dedicate
  // le applicano via DOM senza ri-eseguire la useEffect principale (= niente scene rebuild)
  const filterRef = useRef<FilterKey>(filter);
  const snapshotsRef = useRef<SnapshotMap | undefined>(snapshots);
  const spotEntriesRef = useRef<SpotEntry[]>([]);
  const cycloneEntriesRef = useRef<MarkerEntry[]>([]);
  const streakEntriesRef = useRef<MarkerEntry[]>([]);
  const updateMarkersRef = useRef<
    | ((nextCyclones: CycloneMarker[], nextStreaks: WindStreak[]) => void)
    | null
  >(null);
  const [cameraDistance, setCameraDistance] = useState(INITIAL_DIST);
  const router = useRouter();

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  useEffect(() => {
    snapshotsRef.current = snapshots;
    for (const entry of spotEntriesRef.current) {
      applySnapToEntry(entry, snapshots?.[entry.spot.id]);
    }
  }, [snapshots]);

  // updateMarkersRef è impostato dal main effect dopo il load di landTopo: qui prima è no-op
  useEffect(() => {
    updateMarkersRef.current?.(cyclones, windStreaks);
  }, [cyclones, windStreaks]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let teardown: (() => void) | null = null;

    (async () => {
      // lazy import: ~7.9MB di topology JSON in chunk separato, fuori dal bundle iniziale
      const landTopoMod = await import("world-atlas/land-110m.json");
      const landTopo = landTopoMod.default ?? landTopoMod;
      if (cancelled || !containerRef.current) return;

    const w0 = container.clientWidth;
    const h0 = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, w0 / h0, 0.01, 100);
    camera.position.copy(latLngToVec3(center[0], center[1], INITIAL_DIST));
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w0, h0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(w0, h0);
    const labelEl = labelRenderer.domElement;
    labelEl.style.position = "absolute";
    labelEl.style.inset = "0";
    labelEl.style.pointerEvents = "none";
    container.appendChild(labelEl);

    const colors = {
      ocean: readPaletteColor("--ocean", "#b8d6df"),
      land: readPaletteColor("--land", "#e6d5a8"),
      ink: readPaletteColor("--ink", "#1f1c18"),
      warm: readPaletteColor("--warm", "#e26a3e"),
      accent: readPaletteColor("--accent", "#2b8caa"),
    };

    const oceanMat = new THREE.MeshBasicMaterial({ color: colors.ocean });
    const ocean = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS, 64, 48),
      oceanMat,
    );
    scene.add(ocean);

    const topology = landTopo as unknown as Topology<{
      land: GeometryCollection;
    }>;
    const landFC = feature(
      topology,
      topology.objects.land,
    ) as FeatureCollection<MultiPolygon | Polygon>;

    const landPositions: number[] = [];
    const landIndices: number[] = [];
    let vOffset = 0;

    // "srotola" le longitudini (delta ≤180° dal punto precedente) così earcut triangola
    // anche i poligoni che attraversano l'antimeridiano senza triangoli stiracchiati
    const unwrapRing = (ring: Position[]): Position[] => {
      if (ring.length === 0) return ring;
      // droppo il punto di chiusura GeoJSON: earcut auto-chiude, evita falle dopo l'unwrap
      const first = ring[0];
      const last = ring[ring.length - 1];
      const isClosed =
        ring.length > 1 && last[0] === first[0] && last[1] === first[1];
      const src = isClosed ? ring.slice(0, -1) : ring;

      const out: Position[] = [src[0]];
      for (let i = 1; i < src.length; i++) {
        const [lng, lat] = src[i];
        const prevLng = out[i - 1][0];
        let adj = lng;
        while (adj - prevLng > 180) adj -= 360;
        while (adj - prevLng < -180) adj += 360;
        out.push([adj, lat]);
      }
      return out;
    };

    for (const f of landFC.features) {
      const polys: Position[][][] =
        f.geometry.type === "Polygon"
          ? [f.geometry.coordinates]
          : f.geometry.coordinates;

      for (const polygon of polys) {
        const unwrapped = polygon.map(unwrapRing);

        const flat: number[] = [];
        const holes: number[] = [];
        for (let ringIdx = 0; ringIdx < unwrapped.length; ringIdx++) {
          const ring = unwrapped[ringIdx];
          if (ringIdx > 0) holes.push(flat.length / 2);
          for (const [lng, lat] of ring) flat.push(lng, lat);
        }

        const triangles = earcut(flat, holes, 2);

        for (let i = 0; i < flat.length; i += 2) {
          const v = latLngToVec3(flat[i + 1], flat[i], RADIUS * 1.0005);
          landPositions.push(v.x, v.y, v.z);
        }
        for (const idx of triangles) landIndices.push(idx + vOffset);
        vOffset += flat.length / 2;
      }
    }

    const landGeom = new THREE.BufferGeometry();
    landGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(landPositions, 3),
    );
    landGeom.setIndex(landIndices);
    const landMat = new THREE.MeshBasicMaterial({
      color: colors.land,
      side: THREE.DoubleSide,
    });
    const landMesh = new THREE.Mesh(landGeom, landMat);
    scene.add(landMesh);

    const coast = mesh(topology, topology.objects.land) as MultiLineString;
    const coastPos: number[] = [];
    for (const line of coast.coordinates) {
      for (let i = 0; i < line.length - 1; i++) {
        const [lng1, lat1] = line[i];
        const [lng2, lat2] = line[i + 1];
        const v1 = latLngToVec3(lat1, lng1, RADIUS * 1.002);
        const v2 = latLngToVec3(lat2, lng2, RADIUS * 1.002);
        coastPos.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
      }
    }
    const coastGeom = new THREE.BufferGeometry();
    coastGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(coastPos, 3),
    );
    const coastMat = new THREE.LineBasicMaterial({
      color: colors.ink,
      transparent: true,
      opacity: 0.7,
    });
    const coastlines = new THREE.LineSegments(coastGeom, coastMat);
    scene.add(coastlines);

    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vNormal;
        uniform vec3 uColor;
        void main() {
          float intensity = pow(0.55 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          gl_FragColor = vec4(uColor, 1.0) * intensity;
        }
      `,
      uniforms: { uColor: { value: colors.accent.clone() } },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.12, 64, 32),
      atmosphereMat,
    );
    scene.add(atmosphere);

    const starsGeom = new THREE.BufferGeometry();
    const starPositions: number[] = [];
    for (let i = 0; i < 1200; i++) {
      const r = 30 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      );
    }
    starsGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starPositions, 3),
    );
    const starsMat = new THREE.PointsMaterial({
      color: colors.ink,
      size: 0.06,
      transparent: true,
      opacity: 0.35,
    });
    const stars = new THREE.Points(starsGeom, starsMat);
    scene.add(stars);

    // il pin È la sticky card: dot sempre visibile, card (nome/vento/onda/eventi) solo da vicino
    const labelGroup = new THREE.Group();
    const spotEntries: SpotEntry[] = [];

    for (const spot of spots) {
      const pos = latLngToVec3(spot.lat, spot.lng, RADIUS * 1.0);

      const wrapper = document.createElement("div");
      wrapper.className = "kp-pin-wrapper";
      wrapper.setAttribute("role", "button");
      wrapper.setAttribute("aria-label", spot.name);

      const dot = document.createElement("span");
      dot.className = "kp-pin-dot-only";

      const card = document.createElement("div");
      card.className = "kp-pin-card";

      wrapper.appendChild(card);
      wrapper.appendChild(dot);

      wrapper.addEventListener("click", (e) => {
        e.stopPropagation();
        stopAutoRotate();
        dive(spot.lat, spot.lng, () => {
          router.push(`/spot/${spot.slug}`);
        });
      });

      const obj = new CSS2DObject(wrapper);
      obj.position.copy(pos);
      labelGroup.add(obj);

      const entry: SpotEntry = { wrapper, card, dot, position: pos, spot };
      applySnapToEntry(entry, snapshotsRef.current?.[spot.id]);
      spotEntries.push(entry);
    }
    spotEntriesRef.current = spotEntries;
    scene.add(labelGroup);

    const countryEntries: Array<{ el: HTMLDivElement; position: THREE.Vector3 }> = [];
    for (const c of COUNTRY_LABELS) {
      const pos = latLngToVec3(c.lat, c.lng, RADIUS * 1.005);
      const el = document.createElement("div");
      el.className = "kp-country";
      el.textContent = c.name;
      const obj = new CSS2DObject(el);
      obj.position.copy(pos);
      labelGroup.add(obj);
      countryEntries.push({ el, position: pos });
    }

    // update in-place dei marker (init + ogni toggle) senza ricostruire la scena WebGL
    const updateMarkers = (
      nextCyclones: CycloneMarker[],
      nextStreaks: WindStreak[],
    ) => {
      for (const e of cycloneEntriesRef.current) {
        labelGroup.remove(e.obj);
        e.el.parentNode?.removeChild(e.el);
      }
      for (const e of streakEntriesRef.current) {
        labelGroup.remove(e.obj);
        e.el.parentNode?.removeChild(e.el);
      }
      const newCyc = nextCyclones.map(createCycloneEntry);
      for (const e of newCyc) labelGroup.add(e.obj);
      const newStreak = nextStreaks.map(createStreakEntry);
      for (const e of newStreak) labelGroup.add(e.obj);
      cycloneEntriesRef.current = newCyc;
      streakEntriesRef.current = newStreak;
    };
    updateMarkersRef.current = updateMarkers;
    updateMarkers(cyclones, windStreaks); // build iniziale dai prop al mount

    const buoyEntries: Array<{ el: HTMLDivElement; position: THREE.Vector3 }> = [];
    for (const b of NDBC_STATIONS) {
      const pos = latLngToVec3(b.lat, b.lng, RADIUS * 1.0);
      const el = document.createElement("div");
      el.className = "kp-buoy";
      el.title = `NDBC ${b.id} · ${b.name}`;
      el.innerHTML = `
        <svg class="kp-buoy-svg" width="22" height="22" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="1.4"
             stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="3" x2="12" y2="9" />
          <circle cx="12" cy="3" r="0.9" fill="currentColor" />
          <path d="M8 9 L16 9 L14.5 15 L9.5 15 Z" />
          <path d="M4 18 Q7 16 10 18 T16 18 T22 18" />
        </svg>
        <div class="kp-buoy-label">${b.id}</div>`;
      const obj = new CSS2DObject(el);
      obj.position.copy(pos);
      labelGroup.add(obj);
      buoyEntries.push({ el, position: pos });
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = MIN_DIST;
    controls.maxDistance = MAX_DIST;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.7;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;

    const stopAutoRotate = () => {
      controls.autoRotate = false;
    };

    let isDiving = false;

    const dive = (lat: number, lng: number, onDone: () => void) => {
      if (isDiving) return;
      isDiving = true;
      controls.enabled = false;
      controls.autoRotate = false;

      const startPos = camera.position.clone();
      const target = latLngToVec3(lat, lng, 1.55);
      const startTime = performance.now();

      const tick = () => {
        const elapsed = performance.now() - startTime;
        const t = Math.min(1, elapsed / DIVE_DURATION_MS);
        const k = easeInOutCubic(t);
        camera.position.lerpVectors(startPos, target, k);
        camera.lookAt(0, 0, 0);
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          onDone();
        }
      };
      requestAnimationFrame(tick);
    };

    let actionAnimating = false;

    const runAnim = (
      durationMs: number,
      onFrame: (k: number) => void,
      onDone?: () => void,
    ) => {
      if (actionAnimating || isDiving) return;
      actionAnimating = true;
      stopAutoRotate();
      controls.enabled = false;
      const startTime = performance.now();
      const tick = () => {
        const t = Math.min(1, (performance.now() - startTime) / durationMs);
        onFrame(easeInOutCubic(t));
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          actionAnimating = false;
          controls.enabled = true;
          onDone?.();
        }
      };
      requestAnimationFrame(tick);
    };

    const initialCamPos = camera.position.clone();

    const onControlsChange = () => {
      setCameraDistance(camera.position.length());
    };
    controls.addEventListener("change", onControlsChange);

    actionsRef.current = {
      zoom: (factor) => {
        const startDist = camera.position.length();
        const targetDist = THREE.MathUtils.clamp(
          startDist * factor,
          controls.minDistance,
          controls.maxDistance,
        );
        const dir = camera.position.clone().normalize();
        runAnim(280, (k) => {
          const d = startDist + (targetDist - startDist) * k;
          camera.position.copy(dir).multiplyScalar(d);
          camera.lookAt(0, 0, 0);
        });
      },
      rotate: (dTheta, dPhi) => {
        const startSph = new THREE.Spherical().setFromVector3(
          camera.position,
        );
        const endSph = new THREE.Spherical(
          startSph.radius,
          THREE.MathUtils.clamp(startSph.phi + dPhi, 0.15, Math.PI - 0.15),
          startSph.theta + dTheta,
        );
        runAnim(320, (k) => {
          const s = new THREE.Spherical(
            startSph.radius,
            THREE.MathUtils.lerp(startSph.phi, endSph.phi, k),
            THREE.MathUtils.lerp(startSph.theta, endSph.theta, k),
          );
          camera.position.setFromSpherical(s);
          camera.lookAt(0, 0, 0);
        });
      },
      reset: () => {
        const startPos = camera.position.clone();
        runAnim(550, (k) => {
          camera.position.lerpVectors(startPos, initialCamPos, k);
          camera.lookAt(0, 0, 0);
        });
      },
      setDistance: (distance: number) => {
        // set istantaneo: lo slider deve seguire il dito senza animazione
        const clamped = THREE.MathUtils.clamp(distance, MIN_DIST, MAX_DIST);
        const dir = camera.position.clone().normalize();
        camera.position.copy(dir).multiplyScalar(clamped);
        camera.lookAt(0, 0, 0);
        controls.update();
        stopAutoRotate();
      },
    };

    const onPointerDownCanvas = () => stopAutoRotate();
    const onWheel = () => stopAutoRotate();
    renderer.domElement.addEventListener("pointerdown", onPointerDownCanvas);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: true });

    // rotation speed scala con la distanza camera: vicino = lento, lontano = veloce
    const ROTATE_NEAR = 0.12;
    const ROTATE_FAR = 0.6;
    const updateRotateSpeed = () => {
      const t = THREE.MathUtils.clamp(
        (camera.position.length() - controls.minDistance) /
          (controls.maxDistance - controls.minDistance),
        0,
        1,
      );
      controls.rotateSpeed = ROTATE_NEAR + (ROTATE_FAR - ROTATE_NEAR) * t;
    };

    const camDir = new THREE.Vector3();
    const labelDir = new THREE.Vector3();
    const updatePinsAndLabels = () => {
      const showCard = camera.position.length() < CARD_VISIBLE_DISTANCE;
      camDir.copy(camera.position).normalize();
      const currentFilter = filterRef.current;

      const currentSnaps = snapshotsRef.current;
      for (const e of spotEntries) {
        labelDir.copy(e.position).normalize();
        const onFront = labelDir.dot(camDir) > LABEL_FRONT_THRESHOLD;
        const snap: SpotSnapshot | undefined = currentSnaps?.[e.spot.id];
        const matchesFilter = spotMatchesFilter(e.spot, snap, currentFilter);

        const wrapperVisible = onFront && matchesFilter;
        const wrapperOp = wrapperVisible ? "1" : "0";
        if (e.wrapper.style.opacity !== wrapperOp) {
          e.wrapper.style.opacity = wrapperOp;
          e.wrapper.style.pointerEvents = wrapperVisible ? "auto" : "none";
        }

        const cardOp = wrapperVisible && showCard ? "1" : "0";
        if (e.card.style.opacity !== cardOp) e.card.style.opacity = cardOp;
      }
    };

    const updateAtmosphereLayers = () => {
      const dist = camera.position.length();
      const showCountries = dist < COUNTRY_VISIBLE_DISTANCE;
      const showStreaks = dist < STREAK_VISIBLE_DISTANCE;
      camDir.copy(camera.position).normalize();

      for (const c of countryEntries) {
        labelDir.copy(c.position).normalize();
        const onFront = labelDir.dot(camDir) > 0.2;
        const op = onFront && showCountries ? "1" : "0";
        if (c.el.style.opacity !== op) c.el.style.opacity = op;
      }

      for (const s of streakEntriesRef.current) {
        labelDir.copy(s.position).normalize();
        const onFront = labelDir.dot(camDir) > 0.15;
        const op = onFront && showStreaks ? "1" : "0";
        if (s.el.style.opacity !== op) s.el.style.opacity = op;
      }

      for (const c of cycloneEntriesRef.current) {
        labelDir.copy(c.position).normalize();
        const onFront = labelDir.dot(camDir) > CYCLONE_FRONT_THRESHOLD;
        const op = onFront ? "1" : "0";
        if (c.el.style.opacity !== op) c.el.style.opacity = op;
      }

      const showBuoys = dist < BUOY_VISIBLE_DISTANCE;
      for (const b of buoyEntries) {
        labelDir.copy(b.position).normalize();
        const onFront = labelDir.dot(camDir) > BUOY_FRONT_THRESHOLD;
        const op = onFront && showBuoys ? "1" : "0";
        if (b.el.style.opacity !== op) b.el.style.opacity = op;
      }
    };

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      controls.update();
      updateRotateSpeed();
      updatePinsAndLabels();
      updateAtmosphereLayers();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    loop();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      labelRenderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    teardown = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener(
        "pointerdown",
        onPointerDownCanvas,
      );
      renderer.domElement.removeEventListener("wheel", onWheel);
      controls.removeEventListener("change", onControlsChange);
      controls.dispose();

      // rimuovi i div HTML dei CSS2DObject dal DOM
      labelGroup.traverse((obj) => {
        if (obj instanceof CSS2DObject && obj.element.parentNode) {
          obj.element.parentNode.removeChild(obj.element);
        }
      });

      coastGeom.dispose();
      coastMat.dispose();
      landGeom.dispose();
      landMat.dispose();
      starsGeom.dispose();
      starsMat.dispose();
      ocean.geometry.dispose();
      oceanMat.dispose();
      atmosphere.geometry.dispose();
      atmosphereMat.dispose();

      renderer.dispose();
      actionsRef.current = null;
      spotEntriesRef.current = [];
      cycloneEntriesRef.current = [];
      streakEntriesRef.current = [];
      updateMarkersRef.current = null;
      try {
        container.removeChild(renderer.domElement);
        container.removeChild(labelEl);
      } catch {
        // già pulito
      }
    };
    })();

    return () => {
      cancelled = true;
      teardown?.();
    };
    // cyclones/windStreaks/snapshots fuori dalle deps per design: update in-place via useEffect dedicate
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spots, center, router]);

  const btnCls =
    "h-8 w-8 flex items-center justify-center rounded-md border border-ink/30 bg-paper text-ink/80 text-sm font-mono transition-all hover:bg-warm/15 hover:border-ink/70 active:scale-95";

  // slider 0..100: 100 = max zoom-in (distance = MIN_DIST)
  const sliderVal = Math.round(
    ((MAX_DIST - cameraDistance) / (MAX_DIST - MIN_DIST)) * 100,
  );
  const onSlider = (v: number) => {
    const dist = MAX_DIST - (v / 100) * (MAX_DIST - MIN_DIST);
    actionsRef.current?.setDistance(dist);
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className="paper-card relative w-full overflow-hidden"
        style={{ height }}
        aria-label="globo interattivo"
      >
        <div ref={containerRef} className="absolute inset-0" />
      </div>

      <div className="paper-card p-2.5 flex items-center flex-wrap gap-2">
        <span className="text-[11px] text-ink/55 font-mono uppercase tracking-wide pr-1">
          ruota
        </span>
        <button
          type="button"
          className={btnCls}
          onClick={() => actionsRef.current?.rotate(0, -0.35)}
          aria-label="ruota su"
        >
          ↑
        </button>
        <button
          type="button"
          className={btnCls}
          onClick={() => actionsRef.current?.rotate(-0.35, 0)}
          aria-label="ruota a sinistra"
        >
          ←
        </button>
        <button
          type="button"
          className={btnCls}
          onClick={() => actionsRef.current?.reset()}
          aria-label="vista iniziale"
          title="vista iniziale"
        >
          ⊙
        </button>
        <button
          type="button"
          className={btnCls}
          onClick={() => actionsRef.current?.rotate(0.35, 0)}
          aria-label="ruota a destra"
        >
          →
        </button>
        <button
          type="button"
          className={btnCls}
          onClick={() => actionsRef.current?.rotate(0, 0.35)}
          aria-label="ruota giù"
        >
          ↓
        </button>

        <div className="w-px h-6 bg-ink/15 mx-1.5" />

        <span className="text-[11px] text-ink/55 font-mono uppercase tracking-wide">
          zoom
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={sliderVal}
          onChange={(e) => onSlider(Number(e.target.value))}
          className="kp-slider flex-1 min-w-[120px]"
          aria-label="zoom"
        />
      </div>
    </div>
  );
}
