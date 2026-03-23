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
const COLS = 48;
const ROWS = 20;
const NOTE = 20;
const GAP  = 4;
const CELL = NOTE + GAP;  // 24
const CW   = COLS * CELL; // 1152
const CH   = ROWS * CELL; // 480

// ─── Physics ───────────────────────────────────────────────────────────────────
const FLIP_SPRING    = 0.080;  // fast flip upward
const FLIP_DAMP      = 0.68;
const RETURN_SPRING  = 0.016;  // slow settle back
const RETURN_DAMP    = 0.87;
const BRIGHTNESS_THR = 118;
const FLIP_TRIGGER   = 20;     // word change fires when ≥ 20 notes flip
const CHANGE_COOLDOWN = 1800;
const MAX_DELAY_MS   = 820;
const MIN_DELAY_MS   = 55;

// ─── Session colour ────────────────────────────────────────────────────────────
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

// ─── Two-sided shader: front face = session colour, back = white ───────────────
const vertShader = `
  varying vec3 vNormalView;
  void main() {
    vNormalView = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const fragShader = `
  uniform vec3 uFront;
  uniform vec3 uBack;
  varying vec3 vNormalView;
  void main() {
    gl_FragColor = vec4(vNormalView.z >= 0.0 ? uFront : uBack, 1.0);
  }
`;

// ─── Return delay: notes near activation centroid hold white longest ───────────
function computeReturnDelay(col: number, row: number, cx: number, cy: number): number {
  const dist    = Math.hypot(col - cx, row - cy);
  const maxDist = Math.hypot(COLS, ROWS) / 2;
  const t       = 1 - Math.min(1, dist / maxDist);
  return MIN_DELAY_MS + t * MAX_DELAY_MS;
}

// ─── Card physics state ────────────────────────────────────────────────────────
interface Card {
  col: number; row: number;
  pivotX: number; pivotY: number;  // world position of bottom-edge pivot
  flipDir: number;    // +1 or -1 (varied X flip direction for organic feel)
  springK: number;
  rotVel: number;
  currentRot: number;
  isActive: boolean;
  deactivatedAt: number;
  returnDelay: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function StickyMirrorUp() {
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

  // ── Phrase update (triggered by flip count) ─────────────────────────────────
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
    setTimeout(() => { setParagraph(text); setParaVisible(true); }, 220);
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

    // ── Geometry: PlaneGeometry with bottom edge at y=0 (pivot point)
    const geo = new THREE.PlaneGeometry(NOTE * 0.92, NOTE * 0.92);
    geo.translate(0, NOTE / 2, 0); // shift up so pivot is at y=0

    // ── Two-sided shader material
    const mat = new THREE.ShaderMaterial({
      vertexShader:   vertShader,
      fragmentShader: fragShader,
      uniforms: {
        uFront: { value: SESSION.front.clone() },
        uBack:  { value: SESSION.back.clone()  },
      },
      side: THREE.DoubleSide,
    });

    // ── InstancedMesh: one draw call for all notes
    const total = COLS * ROWS;
    const iMesh = new THREE.InstancedMesh(geo, mat, total);
    iMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(iMesh);

    // ── Card physics state
    const cards: Card[] = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const wx_center = -CW / 2 + col * CELL + CELL / 2;
        const wy_center =  CH / 2 - row * CELL - CELL / 2;
        const wy_pivot  = wy_center - NOTE / 2; // bottom edge of note

        cards.push({
          col, row,
          pivotX: wx_center,
          pivotY: wy_pivot,
          flipDir: Math.random() > 0.5 ? 1 : -1, // some flip clockwise, some counter
          springK: 0.78 + Math.random() * 0.44,
          rotVel: 0,
          currentRot: 0,
          isActive: false,
          deactivatedAt: 0,
          returnDelay: MIN_DELAY_MS,
        });
      }
    }

    // ── Scratch objects for matrix composition
    const _mat4   = new THREE.Matrix4();
    const _pos    = new THREE.Vector3();
    const _quat   = new THREE.Quaternion();
    const _scale  = new THREE.Vector3(1, 1, 1);
    const _euler  = new THREE.Euler();

    // ── Webcam sampling
    const sample = sampleRef.current!;
    const video  = videoRef.current!;
    const sCtx   = sample.getContext("2d", { willReadFrequently: true })!;

    const loop = () => {
      // 1. Sample webcam into COLS×ROWS grid (mirrored)
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

      // 2. Activation centroid (where person is)
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

      // 3. Per-card physics
      for (let i = 0; i < total; i++) {
        const c = cards[i];
        const gv = gray[c.row * COLS + c.col];
        const shouldActive = gv < BRIGHTNESS_THR;

        // State transitions
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

        const waiting   = !c.isActive && (now - c.deactivatedAt) < c.returnDelay;
        const showBack  = c.isActive || waiting;

        // Target: flip UP (around X axis, top swings toward camera then backward)
        // rotation.x = 0 → front face; rotation.x = -π → back face visible
        const targetRot = showBack ? c.flipDir * -Math.PI : 0;

        const k    = showBack ? FLIP_SPRING * c.springK : RETURN_SPRING * c.springK;
        const damp = showBack ? FLIP_DAMP               : RETURN_DAMP;

        c.rotVel += k * (targetRot - c.currentRot);
        c.rotVel *= damp;
        c.currentRot += c.rotVel;

        // Compose instance matrix: translate to pivot, rotate around X
        _pos.set(c.pivotX, c.pivotY, 0);
        _euler.set(c.currentRot, 0, 0, "XYZ");
        _quat.setFromEuler(_euler);
        _mat4.compose(_pos, _quat, _scale);
        iMesh.setMatrixAt(i, _mat4);
      }

      iMesh.instanceMatrix.needsUpdate = true;

      // 4. Word change: fires when 20+ notes flip in this frame
      if (newFlips >= FLIP_TRIGGER) {
        const cx = newFlips > 0 ? flipCx / newFlips : CW / 2;
        const cy = newFlips > 0 ? flipCy / newFlips : CH / 2;
        updatePhrases(cx, cy);
      }

      prevGray.current = gray;

      renderer.render(scene, camera);
      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
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
      {/* Header */}
      <header className="w-full text-left pt-8 pb-4 px-10">
        <span className="text-[0.65rem] tracking-[0.32em] uppercase text-[#999] font-medium">
          Alchemy Unlimited
        </span>
      </header>

      {/* Notes canvas — full width */}
      <div className="w-full flex flex-col">
        {camState === "denied" && (
          <div className="py-14 text-sm text-[#999] px-10">
            Allow camera access to see your reflection.
          </div>
        )}
        {camState === "requesting" && (
          <p className="py-12 text-sm text-[#bbb] px-10">Waiting for camera…</p>
        )}

        <div
          ref={mountRef}
          className={camState === "active" ? "block" : "hidden"}
          style={{ width: CW, height: CH }}
        />

        {/* Divider */}
        <div className="mx-10 mt-8 mb-6 w-10 h-px bg-[#ddd]" />

        {/* Paragraph — max half-page width, left aligned */}
        <p
          className="px-10 text-[0.88rem] leading-[1.9] text-[#444] font-light text-left transition-opacity duration-200"
          style={{ opacity: paraVisible ? 1 : 0, maxWidth: "50%" }}
        >
          "{paragraph}"
        </p>

        <p className="px-10 text-[0.58rem] tracking-[0.25em] uppercase text-[#c0c0c0] font-medium mt-6 mb-10">
          move to turn · still to return
        </p>
      </div>

      {/* Hidden webcam elements */}
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={sampleRef} width={COLS} height={ROWS} className="hidden" />
    </main>
  );
}
