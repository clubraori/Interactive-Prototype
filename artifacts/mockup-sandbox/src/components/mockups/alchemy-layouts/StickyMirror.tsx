import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

// ─── Phrase banks ──────────────────────────────────────────────────────────────
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

// ─── Grid ──────────────────────────────────────────────────────────────────────
const COLS = 19;
const ROWS = 23;
const NOTE = 19;
const GAP  = 4;
const CELL = NOTE + GAP; // 23 px
const CW   = COLS * CELL; // 437
const CH   = ROWS * CELL; // 529

// ─── Physics ───────────────────────────────────────────────────────────────────
const FLIP_SPRING    = 0.072;  // snap to white — fast
const FLIP_DAMP      = 0.68;
const RETURN_SPRING  = 0.018;  // drift back to front — slow
const RETURN_DAMP    = 0.86;
const BRIGHTNESS_THR = 118;    // grey value below = person present
const MOT_THR        = 8;
const CHANGE_COOLDOWN = 1600;
const MAX_DELAY_MS   = 780;    // max return-delay at centroid centre
const MIN_DELAY_MS   = 60;

// ─── Session colour — picked ONCE at module load, changes on every page reload ─
const PALETTES = [
  { front: 0x111111, back: 0xfafafa, side: 0x1a1a1a }, // black / white
  { front: 0x1B2A4A, back: 0xF0EBE3, side: 0x14203a }, // navy / cream
  { front: 0x2D4A3E, back: 0xF5F0E8, side: 0x223a30 }, // forest / warm white
  { front: 0x4A1B2A, back: 0xF5EEE6, side: 0x3a1420 }, // burgundy / blush
  { front: 0x2A1B4A, back: 0xEEF0F5, side: 0x20143a }, // purple / ice
  { front: 0x4A3B1B, back: 0xF5F0E8, side: 0x3a2e14 }, // olive / cream
  { front: 0x1B3D4A, back: 0xE8F2F5, side: 0x142e3a }, // teal / sky
  { front: 0x3D1B1B, back: 0xF5EBE8, side: 0x2e1414 }, // red-black / blush
];
const SESSION_PALETTE = PALETTES[Math.floor(Math.random() * PALETTES.length)];

// ─── Audio — synthesise a short paper-flutter burst ───────────────────────────
function playFlutter(ctx: AudioContext, intensity: number) {
  const dur    = 0.05 + intensity * 0.09;
  const frames = Math.ceil(ctx.sampleRate * dur);
  const buf    = ctx.createBuffer(1, frames, ctx.sampleRate);
  const ch     = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    const t   = i / ctx.sampleRate;
    const env = Math.exp(-t * 35) * Math.max(0, 1 - t / dur);
    ch[i] = (Math.random() * 2 - 1) * env;
  }
  const src  = ctx.createBufferSource();
  src.buffer = buf;
  const bpf  = ctx.createBiquadFilter();
  bpf.type   = "bandpass";
  bpf.frequency.value = 850 + Math.random() * 550;
  bpf.Q.value = 0.65;
  const gain = ctx.createGain();
  gain.gain.value = 0.028 + intensity * 0.038;
  src.connect(bpf);
  bpf.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

// ─── Proximity-based return delay ─────────────────────────────────────────────
// Notes CLOSE to the activation centroid hold white LONGER.
function computeReturnDelay(col: number, row: number, cx: number, cy: number): number {
  const dist    = Math.hypot(col - cx, row - cy);
  const maxDist = Math.hypot(COLS, ROWS) / 2;
  const t       = 1 - Math.min(1, dist / maxDist); // 1 near centre, 0 at edge
  return MIN_DELAY_MS + t * MAX_DELAY_MS;
}

// ─── Card state ────────────────────────────────────────────────────────────────
interface Card {
  mesh: THREE.Mesh;
  col: number; row: number;
  flipDir: number;       // +1 or -1 — natural flip direction
  springK: number;       // slightly randomised spring constant
  rotVel: number;
  currentRot: number;
  // Tilt (z-axis) — present at rest, straight when white
  restZ: number;
  currentZ: number;
  zVel: number;
  // Activation / return state
  isActive: boolean;
  deactivatedAt: number;
  returnDelay: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function StickyMirror() {
  const mountRef    = useRef<HTMLDivElement>(null);
  const sampleRef   = useRef<HTMLCanvasElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const prevGray    = useRef<Uint8ClampedArray | null>(null);
  const rafId       = useRef<number | null>(null);
  const lastChange  = useRef<number>(0);
  const lastSound   = useRef<number>(0);
  const audioCtx    = useRef<AudioContext | null>(null);
  const cards       = useRef<Card[]>([]);

  const [camState,    setCamState]    = useState<"requesting" | "active" | "denied">("requesting");
  const [paragraph,   setParagraph]   = useState(buildParagraph(WHAT[0], WHY[0], WHO[1], HOW[0]));
  const [paraVisible, setParaVisible] = useState(true);

  // ── Phrase update ───────────────────────────────────────────────────────────
  const updatePhrases = useCallback((cx: number, cy: number) => {
    const now = Date.now();
    if (now - lastChange.current < CHANGE_COOLDOWN) return;
    lastChange.current = now;
    const nx = Math.max(0, Math.min(1, cx / CW));
    const ny = Math.max(0, Math.min(1, cy / CH));
    const wi = Math.floor(nx * WHAT.length) % WHAT.length;
    const yi = Math.floor(ny * WHY.length)  % WHY.length;
    const oi = Math.floor(((nx + ny) / 2)   * WHO.length) % WHO.length;
    const hi = Math.floor((nx * 0.6 + (1 - ny) * 0.4) * HOW.length) % HOW.length;
    const text = buildParagraph(WHAT[wi], WHY[yi], WHO[oi], HOW[hi]);
    setParaVisible(false);
    setTimeout(() => { setParagraph(text); setParaVisible(true); }, 200);
  }, []);

  // ── Webcam ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        });
        streamRef.current = stream;
        const v = videoRef.current!;
        v.srcObject = stream;
        v.onloadedmetadata = () => {
          v.play();
          // Create AudioContext after user gesture (camera grant)
          audioCtx.current = new AudioContext();
          setCamState("active");
        };
      } catch {
        setCamState("denied");
      }
    })();
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      audioCtx.current?.close();
    };
  }, []);

  // ── Three.js scene ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (camState !== "active" || !mountRef.current) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(CW, CH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf7f6f3, 1);
    mountRef.current.appendChild(renderer.domElement);

    // Camera — orthographic pixel-space
    const camera = new THREE.OrthographicCamera(
      -CW / 2,  CW / 2,
       CH / 2, -CH / 2,
       0.1, 200
    );
    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();

    // Shared geometry & materials (session colour applied globally)
    const geo      = new THREE.BoxGeometry(NOTE, NOTE, 1.0);
    const frontMat = new THREE.MeshBasicMaterial({ color: SESSION_PALETTE.front });
    const backMat  = new THREE.MeshBasicMaterial({ color: SESSION_PALETTE.back });
    const sideMat  = new THREE.MeshBasicMaterial({ color: SESSION_PALETTE.side });
    // Material order: +x, -x, +y, -y, front(+z→camera, col), back(−z→camera, white)
    const mats = [sideMat, sideMat, sideMat, sideMat, frontMat, backMat];

    const cs: Card[] = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const wx = -CW / 2 + col * CELL + CELL / 2;
        const wy =  CH / 2 - row * CELL - CELL / 2;
        const mesh = new THREE.Mesh(geo, mats);
        mesh.position.set(wx, wy, 0);
        const restZ = ((Math.random() - 0.5) * 8 * Math.PI) / 180;
        mesh.rotation.z = restZ;
        scene.add(mesh);
        cs.push({
          mesh, col, row,
          flipDir: Math.random() > 0.5 ? 1 : -1,
          springK: 0.8 + Math.random() * 0.4,
          rotVel: 0, currentRot: 0,
          restZ, currentZ: restZ, zVel: 0,
          isActive: false,
          deactivatedAt: 0,
          returnDelay: MIN_DELAY_MS,
        });
      }
    }
    cards.current = cs;

    // Webcam sampling
    const sample = sampleRef.current!;
    const video  = videoRef.current!;
    const sCtx   = sample.getContext("2d", { willReadFrequently: true })!;

    const loop = () => {
      // 1. Sample webcam
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

      // 2. Motion detection → phrase update
      let motSum = 0, mCx = CW / 2, mCy = CH / 2, mN = 0;
      if (prevGray.current) {
        for (let i = 0; i < gray.length; i++) {
          const d = Math.abs(gray[i] - prevGray.current[i]);
          motSum += d;
          if (d > 25) {
            mCx += (i % COLS) * CELL + CELL / 2;
            mCy += Math.floor(i / COLS) * CELL + CELL / 2;
            mN++;
          }
        }
        if (mN > 0) { mCx /= mN; mCy /= mN; }
      }
      prevGray.current = gray.slice();
      if (motSum / gray.length > MOT_THR) updatePhrases(mCx, mCy);

      // 3. Activation centroid (centre of currently-dark pixels = person's position)
      let centCol = COLS / 2, centRow = ROWS / 2, centN = 0;
      for (let i = 0; i < gray.length; i++) {
        if (gray[i] < BRIGHTNESS_THR) {
          centCol += i % COLS;
          centRow += Math.floor(i / COLS);
          centN++;
        }
      }
      if (centN > 0) { centCol /= centN; centRow /= centN; }

      // 4. Per-card update
      const now        = Date.now();
      let flipsCount   = 0;

      for (const c of cs) {
        const gv           = gray[c.row * COLS + c.col];
        const shouldActive = gv < BRIGHTNESS_THR;

        // State transitions
        if (shouldActive && !c.isActive) {
          c.isActive = true;
        } else if (!shouldActive && c.isActive) {
          c.isActive      = false;
          c.deactivatedAt = now;
          c.returnDelay   = computeReturnDelay(c.col, c.row, centCol, centRow);
        }

        const waiting    = !c.isActive && (now - c.deactivatedAt) < c.returnDelay;
        const showWhite  = c.isActive || waiting;
        const targetRot  = showWhite ? c.flipDir * Math.PI : 0;

        // Count new activations for sound
        const wasBlack = Math.abs(c.currentRot) < 0.15;
        if (showWhite && wasBlack) flipsCount++;

        // Y spring (flip / return)
        const k    = showWhite ? FLIP_SPRING * c.springK : RETURN_SPRING * c.springK;
        const damp = showWhite ? FLIP_DAMP              : RETURN_DAMP;
        c.rotVel += k * (targetRot - c.currentRot);
        c.rotVel *= damp;
        c.currentRot += c.rotVel;
        c.mesh.rotation.y = c.currentRot;

        // Z spring: straight when showing white, tilted at rest
        const targetZ = showWhite ? 0 : c.restZ;
        c.zVel += 0.06 * (targetZ - c.currentZ);
        c.zVel *= 0.75;
        c.currentZ += c.zVel;
        c.mesh.rotation.z = c.currentZ;
      }

      // 5. Sound
      if (flipsCount > 0) {
        const t = performance.now();
        if (t - lastSound.current > 90 && audioCtx.current) {
          if (audioCtx.current.state === "suspended") audioCtx.current.resume();
          playFlutter(audioCtx.current, Math.min(1, flipsCount / 6));
          lastSound.current = t;
        }
      }

      renderer.render(scene, camera);
      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      renderer.dispose();
      geo.dispose();
      frontMat.dispose();
      backMat.dispose();
      sideMat.dispose();
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
      {/* Studio name */}
      <header className="w-full text-left pt-9 pb-5 px-9">
        <span className="text-[0.65rem] tracking-[0.32em] uppercase text-[#999] font-medium">
          Alchemy Unlimited
        </span>
      </header>

      <div className="flex flex-col px-9 w-full">
        {camState === "denied" && (
          <div className="py-14 text-sm text-[#999]">
            Allow camera access to see your reflection.
          </div>
        )}
        {camState === "requesting" && (
          <p className="py-12 text-sm text-[#bbb]">Waiting for camera…</p>
        )}

        {/* Three.js canvas mount */}
        <div
          ref={mountRef}
          className={camState === "active" ? "block" : "hidden"}
          style={{ width: CW, height: CH }}
        />

        {/* Divider */}
        <div className="w-10 h-px bg-[#ddd] my-7" />

        {/* Manifesto — left-aligned, no italics */}
        <p
          className="text-[0.88rem] leading-[1.85] text-[#444] font-light text-left max-w-sm transition-opacity duration-200"
          style={{ opacity: paraVisible ? 1 : 0 }}
        >
          "{paragraph}"
        </p>

        <p className="text-[0.58rem] tracking-[0.25em] uppercase text-[#c0c0c0] font-medium mt-7 mb-10">
          move to change · still to reflect
        </p>
      </div>

      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={sampleRef} width={COLS} height={ROWS} className="hidden" />
    </main>
  );
}
