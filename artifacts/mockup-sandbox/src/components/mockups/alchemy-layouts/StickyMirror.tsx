import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

// ─── Phrase banks ──────────────────────────────────────────────────────────────
const WHAT = [
  "interdisciplinary design",
  "innovative design",
  "gathering creative communities",
  "art and science collaborations",
  "creative strategies",
  "cultural and public engagement",
  "research-oriented collaboration",
  "creative producing",
  "building new possibilities across art, design, culture, and technology",
];
const WHY = [
  "realising the potential of art and science collaborations",
  "unlocking creative potential",
  "organising and activating creative energy",
  "empowering action through creative strategies",
  "building equitable processes",
  "bringing ideas to life",
  "generating empathy and goodwill within communities",
  "embedding responsible design frameworks",
  "creating meaningful public intersections",
];
const WHO = [
  "partners and stakeholders",
  "audiences and communities",
  "cultural institutions",
  "artists and creatives",
  "academic institutions and incubators",
  "public-facing organisations",
  "innovative institutions",
  "learners and students",
  "communities working at the intersection of creativity and impact",
];
const HOW = [
  "a creative-producing framework",
  "interdisciplinary thinking",
  "art-thinking and design-thinking",
  "facilitation and co-design",
  "hands-on, interactive processes",
  "dialogue with stakeholders",
  "empathy and care",
  "process-oriented collaboration",
  "a distributed studio model blending consultancy, collective practice, and research",
];

function buildParagraph(w: string, y: string, o: string, h: string) {
  return `We at Alchemy Unlimited are a collection of creative alchemists interested in ${w}. We are committed to ${y} for ${o}. We approach our work through ${h}, providing insight within and beyond the immediate brief.`;
}

// ─── Grid ──────────────────────────────────────────────────────────────────────
const COLS = 13;
const ROWS = 16;
const NOTE = 26;        // note face size in world units (= px)
const GAP  = 6;
const CELL = NOTE + GAP; // 32
const CW   = COLS * CELL; // 416
const CH   = ROWS * CELL; // 512

// ─── Physics (per card) ────────────────────────────────────────────────────────
const BASE_SPRING = 0.055;
const DAMP        = 0.72;
const BRIGHTNESS_THRESHOLD = 118; // below = person → flip to white
const MOT_THR     = 8;
const CHANGE_COOLDOWN = 1600;

interface Card {
  mesh: THREE.Mesh;
  rotVel: number;     // angular velocity (Y axis)
  currentRot: number; // current rotation.y
  targetRot: number;  // 0 = black, ±π = white
  flipDir: number;    // +1 or -1 for natural variety
  springK: number;    // slightly randomised spring constant
  restZ: number;      // small rest z-tilt (radians)
}

// ─── Component ────────────────────────────────────────────────────────────────
export function StickyMirror() {
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

  // ── Phrase update on motion ─────────────────────────────────────────────────
  const updatePhrases = useCallback((cx: number, cy: number) => {
    const now = Date.now();
    if (now - lastChange.current < CHANGE_COOLDOWN) return;
    lastChange.current = now;
    const nx = Math.max(0, Math.min(1, cx / CW));
    const ny = Math.max(0, Math.min(1, cy / CH));
    const wi = Math.floor(nx * WHAT.length) % WHAT.length;
    const yi = Math.floor(ny * WHY.length)  % WHY.length;
    const oi = Math.floor(((nx + ny) / 2) * WHO.length) % WHO.length;
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
        v.onloadedmetadata = () => { v.play(); setCamState("active"); };
      } catch {
        setCamState("denied");
      }
    })();
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  // ── Three.js scene ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (camState !== "active" || !mountRef.current) return;

    // ── Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(CW, CH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf7f6f3, 1);
    mountRef.current.appendChild(renderer.domElement);

    // ── Camera (orthographic, pixel-perfect)
    const camera = new THREE.OrthographicCamera(
      -CW / 2, CW / 2,   // left, right
       CH / 2, -CH / 2,  // top, bottom
       0.1, 200
    );
    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);

    // ── Scene
    const scene = new THREE.Scene();

    // ── Shared geometry & materials
    // BoxGeometry: faces[4] = front (+z, black), faces[5] = back (-z, white)
    const geo = new THREE.BoxGeometry(NOTE, NOTE, 1.2);

    const blackMat  = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const whiteMat  = new THREE.MeshBasicMaterial({ color: 0xfafafa });
    const sideMat   = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
    // Material array order: +x, -x, +y, -y, +z (front→camera), -z (back)
    // When rotation.y = 0: +z faces camera → BLACK
    // When rotation.y = π: -z faces camera → WHITE
    const mats = [sideMat, sideMat, sideMat, sideMat, blackMat, whiteMat];

    // ── Build cards
    const cards: Card[] = [];

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const wx = -CW / 2 + col * CELL + CELL / 2;
        const wy =  CH / 2 - row * CELL - CELL / 2;

        const mesh = new THREE.Mesh(geo, mats);
        mesh.position.set(wx, wy, 0);

        // Tiny hand-placed tilt in Z (like a note stuck slightly askew)
        const restZ = ((Math.random() - 0.5) * 7 * Math.PI) / 180;
        mesh.rotation.z = restZ;

        scene.add(mesh);

        cards.push({
          mesh,
          rotVel: 0,
          currentRot: 0,
          targetRot: 0,
          flipDir: Math.random() > 0.5 ? 1 : -1,
          springK: BASE_SPRING * (0.8 + Math.random() * 0.4),
          restZ,
        });
      }
    }

    // ── Webcam sampling canvas
    const sample = sampleRef.current!;
    const video  = videoRef.current!;
    const sCtx   = sample.getContext("2d", { willReadFrequently: true })!;

    // ── Animation loop
    const loop = () => {
      // Sample webcam
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

      // Motion detection for phrase changes
      let motionSum = 0, motionCx = CW / 2, motionCy = CH / 2, motionCount = 0;
      if (prevGray.current) {
        for (let i = 0; i < gray.length; i++) {
          const diff = Math.abs(gray[i] - prevGray.current[i]);
          motionSum += diff;
          if (diff > 25) {
            motionCx += (i % COLS) * CELL + CELL / 2;
            motionCy += Math.floor(i / COLS) * CELL + CELL / 2;
            motionCount++;
          }
        }
        if (motionCount > 0) { motionCx /= motionCount; motionCy /= motionCount; }
      }
      prevGray.current = gray.slice();
      if (motionSum / gray.length > MOT_THR) updatePhrases(motionCx, motionCy);

      // Spring-animate each card toward its target rotation
      for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        const row = Math.floor(i / COLS);
        const col = i % COLS;
        const gv = gray[row * COLS + col];

        // Threshold: dark pixel = person present → flip to white
        c.targetRot = gv < BRIGHTNESS_THRESHOLD ? c.flipDir * Math.PI : 0;

        // Spring physics on Y rotation
        const err = c.targetRot - c.currentRot;
        c.rotVel += c.springK * err;
        c.rotVel *= DAMP;
        c.currentRot += c.rotVel;

        c.mesh.rotation.y = c.currentRot;
        // Preserve the resting Z tilt
        c.mesh.rotation.z = c.restZ;
      }

      renderer.render(scene, camera);
      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      renderer.dispose();
      geo.dispose();
      blackMat.dispose();
      whiteMat.dispose();
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
        {/* Camera permission states */}
        {camState === "denied" && (
          <div className="py-14 text-sm text-[#999]">
            Allow camera access to see your reflection.
          </div>
        )}
        {camState === "requesting" && (
          <p className="py-12 text-sm text-[#bbb]">Waiting for camera…</p>
        )}

        {/* Three.js mount point */}
        <div
          ref={mountRef}
          className={camState === "active" ? "block" : "hidden"}
          style={{ width: CW, height: CH }}
        />

        {/* Divider */}
        <div className="w-10 h-px bg-[#ddd] my-7" />

        {/* Live manifesto — left aligned */}
        <p
          className="text-[0.88rem] leading-[1.85] text-[#444] font-light italic text-left max-w-sm transition-opacity duration-200"
          style={{ opacity: paraVisible ? 1 : 0 }}
        >
          "{paragraph}"
        </p>

        <p className="text-[0.58rem] tracking-[0.25em] uppercase text-[#c0c0c0] font-medium mt-7 mb-10">
          move to scatter · still to reform
        </p>
      </div>

      {/* Hidden webcam elements */}
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={sampleRef} width={COLS} height={ROWS} className="hidden" />
    </main>
  );
}
