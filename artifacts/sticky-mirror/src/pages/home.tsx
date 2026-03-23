import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

// ─── Phrase banks ───────────────────────────────────────────────────────────
const WHAT = [
  "interdisciplinary design", "innovative design", "gathering creative communities",
  "art and science collaborations", "creative strategies", "cultural and public engagement",
  "research-oriented collaboration", "creative producing",
  "building new possibilities across art, design, culture, and technology",
];
const WHY = [
  "realising the potential of art and science collaborations", "unlocking creative potential",
  "organising and activating creative energy", "empowering action through creative strategies",
  "building equitable processes", "bringing ideas to life",
  "generating empathy and goodwill within communities",
  "embedding responsible design frameworks", "creating meaningful public intersections",
];
const WHO = [
  "partners and stakeholders", "audiences and communities", "cultural institutions",
  "artists and creatives", "academic institutions and incubators",
  "public-facing organisations", "innovative institutions", "learners and students",
  "communities working at the intersection of creativity and impact",
];
const HOW = [
  "a creative-producing framework", "interdisciplinary thinking",
  "art-thinking and design-thinking", "facilitation and co-design",
  "hands-on, interactive processes", "dialogue with stakeholders",
  "empathy and care", "process-oriented collaboration",
  "a distributed studio model blending consultancy, collective practice, and research",
];

function buildParagraph(w: string, y: string, o: string, h: string) {
  return `We at Alchemy Unlimited are a collection of creative alchemists interested in ${w}. We are committed to ${y} for ${o}. We approach our work through ${h}, providing insight within and beyond the immediate brief.`;
}

// ─── Grid — 48 cols × 20 rows ───────────────────────────────────────────────
const COLS = 48;
const ROWS = 20;
const NOTE = 20;
const GAP  = 4;
const CELL = NOTE + GAP;  // 24 px per cell
const CW   = COLS * CELL; // 1152
const CH   = ROWS * CELL; // 480

// ─── Physics ────────────────────────────────────────────────────────────────
const FLIP_SPRING    = 0.080;
const FLIP_DAMP      = 0.68;
const RETURN_SPRING  = 0.016;
const RETURN_DAMP    = 0.87;
const BRIGHTNESS_THR = 118;
const FLIP_TRIGGER   = 20;
const CHANGE_COOLDOWN = 1800;
const MAX_DELAY_MS   = 820;
const MIN_DELAY_MS   = 55;

// ─── Session colour — one palette chosen at page load ──────────────────────
const PALETTES = [
  { front: new THREE.Color(0x111111), back: new THREE.Color(0xfafafa) },
  { front: new THREE.Color(0x1B2A4A), back: new THREE.Color(0xF0EBE3) },
  { front: new THREE.Color(0x2D4A3E), back: new THREE.Color(0xF5F0E8) },
  { front: new THREE.Color(0x4A1B2A), back: new THREE.Color(0xF5EEE6) },
  { front: new THREE.Color(0x2A1B4A), back: new THREE.Color(0xEEF0F5) },
  { front: new THREE.Color(0x4A3B1B), back: new THREE.Color(0xF5F0E8) },
  { front: new THREE.Color(0x1B3D4A), back: new THREE.Color(0xE8F2F5) },
  { front: new THREE.Color(0x3D1B1B), back: new THREE.Color(0xF5EBE8) },
];
const SESSION = PALETTES[Math.floor(Math.random() * PALETTES.length)];

// ─── Helpers ────────────────────────────────────────────────────────────────
function computeReturnDelay(col: number, row: number, cx: number, cy: number): number {
  const dist    = Math.hypot(col - cx, row - cy);
  const maxDist = Math.hypot(COLS, ROWS) / 2;
  const t       = 1 - Math.min(1, dist / maxDist);
  return MIN_DELAY_MS + t * MAX_DELAY_MS;
}

interface Card {
  col: number; row: number;
  pivotX: number; pivotY: number;
  flipDir: number;
  springK: number;
  rotVel: number;
  currentRot: number;
  isActive: boolean;
  deactivatedAt: number;
  returnDelay: number;
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function Home() {
  const mountRef   = useRef<HTMLDivElement>(null);
  const sampleRef  = useRef<HTMLCanvasElement>(null);
  const videoRef   = useRef<HTMLVideoElement>(null);
  const streamRef  = useRef<MediaStream | null>(null);
  const prevGray   = useRef<Uint8ClampedArray | null>(null);
  const rafId      = useRef<number | null>(null);
  const lastChange = useRef<number>(0);

  const [camState,    setCamState]    = useState<"requesting" | "active" | "denied">("requesting");
  const [paragraph,   setParagraph]   = useState(buildParagraph(WHAT[0], WHY[0], WHO[1], HOW[0]));
  const [paraVisible, setParaVisible] = useState(true);

  // ── Phrase update ──────────────────────────────────────────────────────────
  const updatePhrases = useCallback((cx: number, cy: number) => {
    const now = Date.now();
    if (now - lastChange.current < CHANGE_COOLDOWN) return;
    lastChange.current = now;
    const nx = Math.max(0, Math.min(1, cx / CW));
    const ny = Math.max(0, Math.min(1, cy / CH));
    const wi = Math.floor(nx * WHAT.length) % WHAT.length;
    const yi = Math.floor(ny * WHY.length)  % WHY.length;
    const oi = Math.floor(((nx + ny) / 2)   * WHO.length)  % WHO.length;
    const hi = Math.floor((nx * 0.6 + (1 - ny) * 0.4) * HOW.length) % HOW.length;
    const text = buildParagraph(WHAT[wi], WHY[yi], WHO[oi], HOW[hi]);
    setParaVisible(false);
    setTimeout(() => { setParagraph(text); setParaVisible(true); }, 220);
  }, []);

  // ── Webcam ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        });
        streamRef.current = stream;
        const v = videoRef.current!;
        v.srcObject = stream;
        v.onloadedmetadata = () => { v.play(); setCamState("active"); };
      } catch {
        setCamState("denied");
      }
    })();
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  // ── Three.js scene ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (camState !== "active" || !mountRef.current) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(CW, CH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf7f6f3, 1);
    mountRef.current.appendChild(renderer.domElement);

    // Orthographic camera — pixel units
    const camera = new THREE.OrthographicCamera(
      -CW / 2,  CW / 2,
       CH / 2, -CH / 2,
       0.1, 500
    );
    camera.position.set(0, 0, 200);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();

    // Two InstancedMeshes — no custom shader.
    // Front plane: normal +z — visible when card is flat (rotation.x = 0)
    // Back  plane: normal -z (rotateY π) — visible when fully flipped (rotation.x = ±π)
    const noteW = NOTE * 0.90;
    const noteH = NOTE * 0.90;

    const geoFront = new THREE.PlaneGeometry(noteW, noteH);
    geoFront.translate(0, noteH / 2, 0); // pivot at bottom edge

    const geoBack = new THREE.PlaneGeometry(noteW, noteH);
    geoBack.rotateY(Math.PI);            // flip normal to face -z
    geoBack.translate(0, noteH / 2, 0);

    const matFront = new THREE.MeshBasicMaterial({ color: SESSION.front, side: THREE.FrontSide });
    const matBack  = new THREE.MeshBasicMaterial({ color: SESSION.back,  side: THREE.FrontSide });

    const total = COLS * ROWS;
    const iMeshFront = new THREE.InstancedMesh(geoFront, matFront, total);
    const iMeshBack  = new THREE.InstancedMesh(geoBack,  matBack,  total);

    // Disable frustum culling — Three.js derives bounding sphere from base
    // geometry only (not from per-instance positions) which can incorrectly cull everything.
    iMeshFront.frustumCulled = false;
    iMeshBack.frustumCulled  = false;

    iMeshFront.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    iMeshBack.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    scene.add(iMeshFront);
    scene.add(iMeshBack);

    // ── Card physics state
    const cards: Card[] = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const wx = -CW / 2 + col * CELL + CELL / 2;
        const wy =  CH / 2 - row * CELL - CELL / 2;
        cards.push({
          col, row,
          pivotX: wx,
          pivotY: wy - NOTE / 2,  // bottom-edge pivot
          flipDir: Math.random() > 0.5 ? 1 : -1,
          springK: 0.78 + Math.random() * 0.44,
          rotVel: 0,
          currentRot: 0,
          isActive: false,
          deactivatedAt: 0,
          returnDelay: MIN_DELAY_MS,
        });
      }
    }

    // Scratch objects — reused every frame to avoid GC pressure
    const _mat4  = new THREE.Matrix4();
    const _pos   = new THREE.Vector3();
    const _quat  = new THREE.Quaternion();
    const _scale = new THREE.Vector3(1, 1, 1);
    const _euler = new THREE.Euler();

    // Pre-initialise all instance matrices to their correct resting positions
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      _pos.set(c.pivotX, c.pivotY, 0);
      _quat.identity();
      _mat4.compose(_pos, _quat, _scale);
      iMeshFront.setMatrixAt(i, _mat4);
      iMeshBack.setMatrixAt(i, _mat4);
    }
    iMeshFront.instanceMatrix.needsUpdate = true;
    iMeshBack.instanceMatrix.needsUpdate  = true;
    renderer.render(scene, camera);

    // ── Webcam sampling canvas
    const sample = sampleRef.current!;
    const video  = videoRef.current!;
    const sCtx   = sample.getContext("2d", { willReadFrequently: true })!;

    const loop = () => {
      // Sample webcam into COLS×ROWS (mirrored horizontally so it's a mirror)
      sCtx.save();
      sCtx.translate(COLS, 0);
      sCtx.scale(-1, 1);
      sCtx.drawImage(video, 0, 0, COLS, ROWS);
      sCtx.restore();
      const { data } = sCtx.getImageData(0, 0, COLS, ROWS);
      const gray = new Uint8ClampedArray(COLS * ROWS);
      for (let i = 0; i < COLS * ROWS; i++) {
        gray[i] = data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114;
      }

      // Activation centroid — weighted average of dark pixels
      let centCol = COLS / 2, centRow = ROWS / 2, centN = 0;
      for (let i = 0; i < gray.length; i++) {
        if (gray[i] < BRIGHTNESS_THR) {
          centCol += i % COLS;
          centRow += Math.floor(i / COLS);
          centN++;
        }
      }
      if (centN > 0) { centCol /= centN; centRow /= centN; }

      const now = Date.now();
      let newFlips = 0;
      let flipCx = 0, flipCy = 0;

      for (let i = 0; i < total; i++) {
        const c = cards[i];
        const gv = gray[c.row * COLS + c.col];
        const shouldActive = gv < BRIGHTNESS_THR;

        if (shouldActive && !c.isActive) {
          c.isActive = true;
          newFlips++;
          flipCx += c.col * CELL + CELL / 2;
          flipCy += c.row * CELL + CELL / 2;
        } else if (!shouldActive && c.isActive) {
          c.isActive      = false;
          c.deactivatedAt = now;
          c.returnDelay   = computeReturnDelay(c.col, c.row, centCol, centRow);
        }

        const waiting  = !c.isActive && (now - c.deactivatedAt) < c.returnDelay;
        const showBack = c.isActive || waiting;

        const targetRot = showBack ? c.flipDir * -Math.PI : 0;
        const k         = showBack ? FLIP_SPRING * c.springK  : RETURN_SPRING * c.springK;
        const damp      = showBack ? FLIP_DAMP                : RETURN_DAMP;

        c.rotVel += k * (targetRot - c.currentRot);
        c.rotVel *= damp;
        c.currentRot += c.rotVel;

        _pos.set(c.pivotX, c.pivotY, 0);
        _euler.set(c.currentRot, 0, 0, "XYZ");
        _quat.setFromEuler(_euler);
        _mat4.compose(_pos, _quat, _scale);
        iMeshFront.setMatrixAt(i, _mat4);
        iMeshBack.setMatrixAt(i, _mat4);
      }

      iMeshFront.instanceMatrix.needsUpdate = true;
      iMeshBack.instanceMatrix.needsUpdate  = true;

      // Trigger manifesto update when a burst of notes flips
      if (newFlips >= FLIP_TRIGGER) {
        updatePhrases(
          newFlips > 0 ? flipCx / newFlips : CW / 2,
          newFlips > 0 ? flipCy / newFlips : CH / 2
        );
      }

      prevGray.current = gray;
      renderer.render(scene, camera);
      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      renderer.dispose();
      geoFront.dispose(); geoBack.dispose();
      matFront.dispose(); matBack.dispose();
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [camState, updatePhrases]);

  return (
    <main
      style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
      className="min-h-screen bg-[#f7f6f3] text-[#111] flex flex-col"
    >
      <header className="w-full text-left pt-8 pb-4 px-10">
        <span className="text-[0.65rem] tracking-[0.32em] uppercase text-[#999] font-medium">
          Alchemy Unlimited
        </span>
      </header>

      <div className="w-full flex flex-col overflow-x-auto">
        {camState === "denied" && (
          <div className="py-14 px-10 text-sm text-[#999]">
            Camera access is required to see your reflection. Please allow access and reload.
          </div>
        )}
        {camState === "requesting" && (
          <p className="py-12 px-10 text-sm text-[#bbb]">Waiting for camera…</p>
        )}

        <div
          ref={mountRef}
          className={camState === "active" ? "block" : "hidden"}
          style={{ width: CW, height: CH }}
        />

        <div className="mx-10 mt-8 mb-6 w-10 h-px bg-[#ddd]" />

        <p
          className="px-10 text-[0.88rem] leading-[1.9] text-[#444] font-light text-left transition-opacity duration-200"
          style={{ opacity: paraVisible ? 1 : 0, maxWidth: "52%" }}
        >
          "{paragraph}"
        </p>

        <p className="px-10 text-[0.58rem] tracking-[0.25em] uppercase text-[#c0c0c0] font-medium mt-6 mb-10">
          move to turn · still to return
        </p>
      </div>

      {/* Hidden webcam plumbing */}
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={sampleRef} width={COLS} height={ROWS} className="hidden" />
    </main>
  );
}
