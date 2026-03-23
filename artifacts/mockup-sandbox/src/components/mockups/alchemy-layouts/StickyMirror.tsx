import { useEffect, useRef, useState, useCallback, useMemo } from "react";

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
const NOTE = 28;   // note size px
const GAP  = 5;    // gap between notes
const CELL = NOTE + GAP;  // 33 px
const CW   = COLS * CELL; // 429 px
const CH   = ROWS * CELL; // 528 px

// ─── Physics ───────────────────────────────────────────────────────────────────
const SPRING   = 0.058;
const DAMP     = 0.78;
const SCATTER  = 0.42;
const MOT_THR  = 8;
const CHANGE_COOLDOWN = 1600; // ms between phrase updates
const LIFT_THRESHOLD  = 0.40; // opacity above this → note lifts

// ─── Colour palette — mixed randomly per note ─────────────────────────────────
const PALETTE: [number, number, number][] = [
  [255, 251, 140],  // yellow
  [255, 203, 216],  // pink
  [172, 213, 255],  // blue
  [178, 242, 196],  // green
  [255, 226, 154],  // warm yellow
  [248, 202, 255],  // lavender
  [196, 244, 226],  // mint
  [255, 218, 172],  // peach
];

// ─── Static particle shape (computed once) ────────────────────────────────────
interface StaticNote {
  col: number; row: number;
  tx: number; ty: number;
  color: string;
  restAngle: number; // radians
}

// ─── Mutable physics state (lives in a ref, never causes React re-renders) ───
interface PhysState {
  x: number; y: number;
  vx: number; vy: number;
  angle: number; va: number;
  opacity: number;
  lifted: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function StickyMirror() {
  // DOM refs — one pair per note, updated directly in the RAF loop
  const outerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const faceRefs  = useRef<(HTMLDivElement | null)[]>([]);

  // Webcam sampling
  const sampleRef = useRef<HTMLCanvasElement>(null);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Physics state array (mutable, not React state)
  const physRef = useRef<PhysState[]>([]);

  // Frame loop
  const rafId     = useRef<number | null>(null);
  const prevGray  = useRef<Uint8ClampedArray | null>(null);
  const lastChange = useRef<number>(0);

  const [camState,    setCamState]    = useState<"requesting" | "active" | "denied">("requesting");
  const [paragraph,   setParagraph]   = useState(buildParagraph(WHAT[0], WHY[0], WHO[1], HOW[0]));
  const [paraVisible, setParaVisible] = useState(true);

  // ── Generate static note data once ─────────────────────────────────────────
  const notes = useMemo<StaticNote[]>(() => {
    const result: StaticNote[] = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const [r, g, b] = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        result.push({
          col, row,
          tx: col * CELL,
          ty: row * CELL,
          color: `rgb(${r},${g},${b})`,
          restAngle: ((Math.random() - 0.5) * 9 * Math.PI) / 180,
        });
      }
    }
    return result;
  }, []);

  // ── Init physics state to match static data ─────────────────────────────────
  useEffect(() => {
    physRef.current = notes.map(n => ({
      x: n.tx, y: n.ty,
      vx: 0, vy: 0,
      angle: n.restAngle, va: 0,
      opacity: 0.1,
      lifted: false,
    }));
    outerRefs.current = new Array(notes.length).fill(null);
    faceRefs.current  = new Array(notes.length).fill(null);
  }, [notes]);

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

  // ── Animation loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (camState !== "active") return;
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

      // 2. Motion detection
      let motionSum = 0, motionCx = CW / 2, motionCy = CH / 2, motionCount = 0;
      if (prevGray.current) {
        for (let i = 0; i < gray.length; i++) {
          const diff = Math.abs(gray[i] - prevGray.current[i]);
          motionSum += diff;
          if (diff > 28) {
            motionCx += (i % COLS) * CELL + CELL / 2;
            motionCy += Math.floor(i / COLS) * CELL + CELL / 2;
            motionCount++;
          }
        }
        if (motionCount > 0) { motionCx /= motionCount; motionCy /= motionCount; }
      }
      prevGray.current = gray.slice();

      const motionMag = motionSum / gray.length;
      const moving = motionMag > MOT_THR;
      if (moving) updatePhrases(motionCx, motionCy);

      // 3. Update each note's physics + DOM
      const phys  = physRef.current;
      const ns    = notes;

      for (let i = 0; i < phys.length; i++) {
        const p = phys[i];
        const n = ns[i];

        // Opacity from inverted brightness (dark face = visible note)
        const gv = gray[n.row * COLS + n.col];
        const targetOp = Math.max(0.04, (220 - gv) / 220);
        p.opacity += (targetOp - p.opacity) * 0.10;

        // Scatter impulse on motion
        if (moving) {
          const kick = Math.min(motionMag * SCATTER, 18);
          p.vx += (Math.random() - 0.5) * kick;
          p.vy += (Math.random() - 0.5) * kick;
          p.va += (Math.random() - 0.5) * 0.38;
        }

        // Spring toward home position
        p.vx += -SPRING * (p.x - n.tx);
        p.vy += -SPRING * (p.y - n.ty);
        p.va += -SPRING * (p.angle - n.restAngle);

        // Damping
        p.vx *= DAMP; p.vy *= DAMP; p.va *= DAMP;
        p.x  += p.vx; p.y  += p.vy; p.angle += p.va;

        // ── Direct DOM update (no React re-render) ──────────────────────
        const outer = outerRefs.current[i];
        const face  = faceRefs.current[i];

        if (outer) {
          outer.style.transform = `translate(${p.x}px,${p.y}px) rotate(${p.angle}rad)`;
          outer.style.opacity   = String(Math.max(0, Math.min(1, p.opacity)));
        }

        // Toggle 'lifted' class when crossing the brightness threshold
        if (face) {
          const shouldLift = p.opacity > LIFT_THRESHOLD;
          if (shouldLift !== p.lifted) {
            p.lifted = shouldLift;
            face.classList.toggle("lifted", shouldLift);
          }
        }
      }

      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [camState, notes, updatePhrases]);

  return (
    <main
      style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
      className="min-h-screen bg-[#f7f6f3] flex flex-col items-center"
    >
      {/* ── Corner-fold CSS ── */}
      <style>{`
        .note-face {
          width: ${NOTE}px;
          height: ${NOTE}px;
          position: relative;
          border-radius: 1px;
          /* chamfer the bottom-right corner to make room for the fold */
          clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);
          box-shadow: 1px 2px 4px rgba(0,0,0,0.09), inset 0 1px 0 rgba(255,255,255,0.55);
          transition:
            transform     0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow    0.5s ease,
            clip-path     0.5s ease;
        }
        /* The folded corner triangle */
        .note-face::after {
          content: '';
          position: absolute;
          bottom: 0; right: 0;
          width: 8px; height: 8px;
          background: rgba(80,60,30,0.12);
          clip-path: polygon(100% 0, 100% 100%, 0 100%);
          transition: width 0.5s ease, height 0.5s ease, background 0.5s ease;
        }
        /* Lifted state — note flicks up, corner peels further */
        .note-face.lifted {
          transform: translateY(-6px) scale(1.04);
          clip-path: polygon(0 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%);
          box-shadow: 3px 8px 14px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.55);
        }
        .note-face.lifted::after {
          width: 13px; height: 13px;
          background: rgba(80,60,30,0.20);
        }
      `}</style>

      {/* Studio name */}
      <header className="w-full text-center pt-9 pb-5">
        <span className="text-[0.65rem] tracking-[0.32em] uppercase text-[#999] font-medium">
          Alchemy Unlimited
        </span>
      </header>

      <div className="flex flex-col items-center px-8 w-full">
        {/* Camera states */}
        {camState === "denied" && (
          <div className="py-14 text-sm text-[#999] text-center">
            Allow camera access to see your reflection.
          </div>
        )}
        {camState === "requesting" && (
          <p className="py-12 text-sm text-[#bbb]">Waiting for camera…</p>
        )}

        {/* Note grid — absolutely positioned notes inside a relative container */}
        <div
          className={camState === "active" ? "block" : "hidden"}
          style={{ position: "relative", width: CW, height: CH, flexShrink: 0 }}
        >
          {notes.map((n, i) => (
            <div
              key={i}
              ref={el => { outerRefs.current[i] = el; }}
              style={{
                position: "absolute",
                top: 0, left: 0,
                willChange: "transform, opacity",
              }}
            >
              <div
                ref={el => { faceRefs.current[i] = el; }}
                className="note-face"
                style={{ background: n.color }}
              />
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-10 h-px bg-[#ddd] my-7" />

        {/* Live manifesto paragraph */}
        <p
          className="text-[0.88rem] leading-[1.85] text-[#444] font-light italic text-center max-w-sm transition-opacity duration-200"
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
