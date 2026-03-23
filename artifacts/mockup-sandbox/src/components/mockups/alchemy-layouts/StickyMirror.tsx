import { useEffect, useRef, useState } from "react";

// ─── Grid configuration ───────────────────────────────────────────────────────
// The sticky note portrait is a COLS × ROWS grid of particles.
// Each particle maps to one sampled webcam pixel.
const COLS = 24;
const ROWS = 28;
const NOTE_W = 18;   // each note's width in px
const NOTE_H = 18;   // each note's height in px
const GAP = 3;       // gap between notes
const CELL = NOTE_W + GAP;           // 21px per cell
const CANVAS_W = COLS * CELL;        // 504px
const CANVAS_H = ROWS * CELL;        // 588px

// ─── Physics constants ────────────────────────────────────────────────────────
const SPRING_K = 0.055;    // spring stiffness (toward target)
const DAMPING = 0.80;      // velocity damping per frame
const MOTION_THRESHOLD = 9; // average pixel diff that triggers scatter
const SCATTER_STRENGTH = 0.4; // impulse multiplier from motion magnitude

// ─── Sticky note colour palette ───────────────────────────────────────────────
// Quadrant-based: TL=yellow, TR=pink, BL=blue, BR=green
const COLORS: [number, number, number][] = [
  [255, 251, 168],  // pale yellow  (top-left)
  [255, 207, 222],  // pale pink    (top-right)
  [178, 218, 255],  // pale blue    (bottom-left)
  [183, 243, 202],  // pale green   (bottom-right)
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Particle {
  col: number;
  row: number;
  tx: number;        // target x
  ty: number;        // target y
  x: number;         // current x
  y: number;         // current y
  vx: number;        // velocity x
  vy: number;        // velocity y
  angle: number;     // current rotation (radians)
  restAngle: number; // resting tilt
  va: number;        // angular velocity
  r: number;
  g: number;
  b: number;         // note colour
  opacity: number;   // driven by webcam brightness (inverted)
}

// ─── Component ────────────────────────────────────────────────────────────────
export function StickyMirror() {
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  // Hidden 24×28 canvas for webcam sampling
  const sampleCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const prevGrayRef = useRef<Uint8ClampedArray | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camState, setCamState] = useState<"requesting" | "active" | "denied">("requesting");

  // ── Initialise particles ─────────────────────────────────────────────────
  useEffect(() => {
    const ps: Particle[] = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const tx = col * CELL;
        const ty = row * CELL;
        const qx = col >= COLS / 2 ? 1 : 0;
        const qy = row >= ROWS / 2 ? 1 : 0;
        const [r, g, b] = COLORS[qy * 2 + qx];
        const restAngle = ((Math.random() - 0.5) * 10 * Math.PI) / 180;
        ps.push({
          col, row, tx, ty,
          x: tx, y: ty,
          vx: 0, vy: 0,
          angle: restAngle, restAngle, va: 0,
          r, g, b,
          opacity: 0.15,
        });
      }
    }
    particlesRef.current = ps;
  }, []);

  // ── Request webcam ───────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        });
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play();
            setCamState("active");
          };
        }
      } catch {
        setCamState("denied");
      }
    })();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── Animation loop ───────────────────────────────────────────────────────
  useEffect(() => {
    if (camState !== "active") return;

    const display = displayCanvasRef.current;
    const sample = sampleCanvasRef.current;
    const video = videoRef.current;
    if (!display || !sample || !video) return;

    const ctx = display.getContext("2d")!;
    const sCtx = sample.getContext("2d", { willReadFrequently: true })!;

    const loop = () => {
      // ── 1. Sample webcam at low resolution, mirrored ─────────────────
      sCtx.save();
      sCtx.translate(COLS, 0);
      sCtx.scale(-1, 1);
      sCtx.drawImage(video, 0, 0, COLS, ROWS);
      sCtx.restore();
      const { data: imgData } = sCtx.getImageData(0, 0, COLS, ROWS);

      // Convert to grayscale
      const gray = new Uint8ClampedArray(COLS * ROWS);
      for (let i = 0; i < COLS * ROWS; i++) {
        gray[i] =
          imgData[i * 4] * 0.299 +
          imgData[i * 4 + 1] * 0.587 +
          imgData[i * 4 + 2] * 0.114;
      }

      // ── 2. Motion detection ──────────────────────────────────────────
      let motionMag = 0;
      if (prevGrayRef.current) {
        let diffSum = 0;
        for (let i = 0; i < gray.length; i++) {
          diffSum += Math.abs(gray[i] - prevGrayRef.current[i]);
        }
        motionMag = diffSum / gray.length;
      }
      prevGrayRef.current = gray.slice();

      const isMoving = motionMag > MOTION_THRESHOLD;

      // ── 3. Update particle opacities from webcam brightness ──────────
      const particles = particlesRef.current;
      for (const p of particles) {
        const gv = gray[p.row * COLS + p.col];
        // Dark pixels (hair, eyes, shadows) → high opacity note
        // Bright pixels (background) → low opacity / invisible
        const targetOp = Math.max(0.04, (230 - gv) / 230);
        p.opacity += (targetOp - p.opacity) * 0.10;
      }

      // ── 4. Physics ───────────────────────────────────────────────────
      for (const p of particles) {
        if (isMoving) {
          // Scatter impulse — each note gets a random kick proportional to motion
          const kick = Math.min(motionMag * SCATTER_STRENGTH, 18);
          p.vx += (Math.random() - 0.5) * kick;
          p.vy += (Math.random() - 0.5) * kick;
          p.va += (Math.random() - 0.5) * 0.35;
        }

        // Spring force toward target position
        p.vx += -SPRING_K * (p.x - p.tx);
        p.vy += -SPRING_K * (p.y - p.ty);
        p.va += -SPRING_K * (p.angle - p.restAngle);

        // Damping
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.va *= DAMPING;

        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.va;
      }

      // ── 5. Render ────────────────────────────────────────────────────
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // Layer 1: desaturated B&W webcam feed (the "reflection underneath")
      ctx.save();
      ctx.filter = "grayscale(1) contrast(1.3) brightness(0.45)";
      ctx.globalAlpha = 0.55;
      // Mirror the video draw
      ctx.translate(CANVAS_W, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, CANVAS_W, CANVAS_H);
      ctx.restore();

      // Layer 2: sticky note particles on top
      for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x + NOTE_W / 2, p.y + NOTE_H / 2);
        ctx.rotate(p.angle);

        // Subtle shadow for depth
        ctx.shadowColor = "rgba(0,0,0,0.20)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 2;

        ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
        ctx.fillRect(-NOTE_W / 2, -NOTE_H / 2, NOTE_W, NOTE_H);

        // Tiny "tape" strip at top of each note
        ctx.globalAlpha = p.opacity * 0.25;
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillRect(-NOTE_W / 2, -NOTE_H / 2, NOTE_W, 3);

        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [camState]);

  return (
    <main
      style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
      className="min-h-screen bg-[#f7f6f3] text-[#111] flex flex-col items-center"
    >
      {/* Studio name */}
      <header className="w-full text-center pt-10 pb-6">
        <span className="text-xs tracking-[0.3em] uppercase text-[#888] font-medium">
          Alchemy Unlimited
        </span>
      </header>

      <div className="flex flex-col items-center gap-4 px-8 w-full">
        <p className="text-[0.62rem] tracking-[0.22em] uppercase text-[#aaa] font-medium">
          your reflection, in notes
        </p>

        {/* Camera permission states */}
        {camState === "denied" && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center max-w-xs">
            <div className="grid grid-cols-2 gap-1.5 opacity-40" aria-hidden>
              {COLORS.map(([r, g, b], i) => (
                <div
                  key={i}
                  style={{
                    width: 80, height: 80,
                    background: `rgb(${r},${g},${b})`,
                    borderRadius: 2,
                    transform: `rotate(${(i % 2 === 0 ? 1 : -1) * 2.5}deg)`,
                  }}
                />
              ))}
            </div>
            <p className="text-sm text-[#888] mt-4">Camera access is needed to see your reflection.</p>
            <p className="text-xs text-[#aaa]">Allow camera access and reload the page.</p>
          </div>
        )}

        {camState === "requesting" && (
          <div className="py-16 text-sm text-[#aaa]">
            Requesting camera access…
          </div>
        )}

        {/* The portrait canvas */}
        <div className={camState === "active" ? "block" : "hidden"}>
          <canvas
            ref={displayCanvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="rounded-sm"
            style={{ imageRendering: "pixelated" }}
          />
        </div>

        <p className="text-[0.58rem] tracking-[0.25em] uppercase text-[#bbb] font-medium mt-1">
          move to scatter &nbsp;·&nbsp; still to reform
        </p>
      </div>

      {/* Hidden elements */}
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={sampleCanvasRef} width={COLS} height={ROWS} className="hidden" />
    </main>
  );
}
