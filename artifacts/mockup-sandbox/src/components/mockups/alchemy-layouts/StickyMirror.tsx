import { useEffect, useRef, useState, useCallback } from "react";

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
const COLS = 26;
const ROWS = 30;
const NOTE = 16;   // note side length px
const GAP  = 2;    // gap between notes
const CELL = NOTE + GAP;              // 18 px per cell
const CW   = COLS * CELL;            // 468 px canvas width
const CH   = ROWS * CELL;            // 540 px canvas height

// ─── Physics ───────────────────────────────────────────────────────────────────
const SPRING   = 0.06;
const DAMP     = 0.78;
const SCATTER  = 0.5;   // impulse scale from motion magnitude
const MOT_THR  = 8;     // avg-pixel-diff threshold to fire scatter + phrase change
const CHANGE_COOLDOWN = 1500; // ms between phrase updates

// ─── Colours (quadrant-based: TL yellow, TR pink, BL blue, BR green) ──────────
const COLORS: [number, number, number][] = [
  [255, 252, 155],
  [255, 204, 218],
  [175, 215, 255],
  [180, 243, 198],
];

interface Particle {
  col: number; row: number;
  tx: number;  ty: number;   // home position
  x:  number;  y:  number;   // current position
  vx: number;  vy: number;
  angle: number;  restAngle: number;  va: number;
  r: number; g: number; b: number;
  opacity: number;  // 0–1 driven by inverted webcam brightness
}

// ─── Component ────────────────────────────────────────────────────────────────
export function StickyMirror() {
  const displayRef  = useRef<HTMLCanvasElement>(null);
  const sampleRef   = useRef<HTMLCanvasElement>(null);  // COLS×ROWS hidden canvas
  const videoRef    = useRef<HTMLVideoElement>(null);
  const particles   = useRef<Particle[]>([]);
  const prevGray    = useRef<Uint8ClampedArray | null>(null);
  const rafId       = useRef<number | null>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const lastChange  = useRef<number>(0);

  const [camState,  setCamState]  = useState<"requesting" | "active" | "denied">("requesting");
  const [paragraph, setParagraph] = useState(buildParagraph(WHAT[0], WHY[0], WHO[1], HOW[0]));
  const [paraVisible, setParaVisible] = useState(true);

  // ── Init particles ──────────────────────────────────────────────────────────
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
          opacity: 0.12,
        });
      }
    }
    particles.current = ps;
  }, []);

  // ── Phrase update triggered by motion ──────────────────────────────────────
  const updatePhrases = useCallback((motionCx: number, motionCy: number) => {
    const now = Date.now();
    if (now - lastChange.current < CHANGE_COOLDOWN) return;
    lastChange.current = now;

    // Map motion centroid (in canvas-space 0..1) to phrase indices
    const nx = motionCx / CW;
    const ny = motionCy / CH;
    const wi = Math.floor(nx * WHAT.length) % WHAT.length;
    const yi = Math.floor(ny * WHY.length) % WHY.length;
    const oi = Math.floor(((nx + ny) / 2) * WHO.length) % WHO.length;
    const hi = Math.floor(((nx * 0.6 + (1 - ny) * 0.4)) * HOW.length) % HOW.length;

    const text = buildParagraph(WHAT[wi], WHY[yi], WHO[oi], HOW[hi]);

    setParaVisible(false);
    setTimeout(() => {
      setParagraph(text);
      setParaVisible(true);
    }, 200);
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

    const display = displayRef.current!;
    const sample  = sampleRef.current!;
    const video   = videoRef.current!;
    const ctx     = display.getContext("2d")!;
    const sCtx    = sample.getContext("2d", { willReadFrequently: true })!;

    const loop = () => {
      // 1. Sample webcam into COLS×ROWS grid (mirrored)
      sCtx.save();
      sCtx.translate(COLS, 0);
      sCtx.scale(-1, 1);
      sCtx.drawImage(video, 0, 0, COLS, ROWS);
      sCtx.restore();
      const { data } = sCtx.getImageData(0, 0, COLS, ROWS);

      // Convert to grayscale
      const gray = new Uint8ClampedArray(COLS * ROWS);
      for (let i = 0; i < COLS * ROWS; i++) {
        gray[i] = data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114;
      }

      // 2. Motion detection
      let motionSum = 0;
      let motionCx = CW / 2, motionCy = CH / 2, motionCount = 0;

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

      const motionMag = motionSum / gray.length;
      const moving    = motionMag > MOT_THR;

      // 3. Trigger phrase update on significant motion
      if (moving) updatePhrases(motionCx, motionCy);

      // 4. Update particle opacities from webcam brightness (inverted)
      const ps = particles.current;
      for (const p of ps) {
        const gv = gray[p.row * COLS + p.col];
        // Dark face/hair features → high opacity; bright background → transparent
        const target = Math.max(0.04, (210 - gv) / 210);
        p.opacity += (target - p.opacity) * 0.10;
      }

      // 5. Physics
      for (const p of ps) {
        if (moving) {
          const kick = Math.min(motionMag * SCATTER, 20);
          p.vx += (Math.random() - 0.5) * kick;
          p.vy += (Math.random() - 0.5) * kick;
          p.va += (Math.random() - 0.5) * 0.4;
        }
        // Spring toward home
        p.vx += -SPRING * (p.x - p.tx);
        p.vy += -SPRING * (p.y - p.ty);
        p.va += -SPRING * (p.angle - p.restAngle);
        // Damp
        p.vx *= DAMP; p.vy *= DAMP; p.va *= DAMP;
        p.x  += p.vx; p.y  += p.vy; p.angle += p.va;
      }

      // 6. Render — plain background, notes only (no webcam feed)
      ctx.clearRect(0, 0, CW, CH);

      for (const p of ps) {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x + NOTE / 2, p.y + NOTE / 2);
        ctx.rotate(p.angle);

        ctx.shadowColor    = "rgba(0,0,0,0.18)";
        ctx.shadowBlur     = 4;
        ctx.shadowOffsetX  = 1;
        ctx.shadowOffsetY  = 2;

        ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
        ctx.fillRect(-NOTE / 2, -NOTE / 2, NOTE, NOTE);

        // Tape strip
        ctx.shadowBlur = 0;
        ctx.globalAlpha = p.opacity * 0.3;
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillRect(-NOTE / 2, -NOTE / 2, NOTE, 3);

        ctx.restore();
      }

      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [camState, updatePhrases]);

  return (
    <main
      style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
      className="min-h-screen bg-[#f7f6f3] text-[#111] flex flex-col items-center"
    >
      {/* Studio name */}
      <header className="w-full text-center pt-9 pb-5">
        <span className="text-[0.65rem] tracking-[0.32em] uppercase text-[#999] font-medium">
          Alchemy Unlimited
        </span>
      </header>

      {/* Sticky note canvas */}
      <div className="px-8 w-full flex flex-col items-center">
        {camState === "denied" && (
          <div className="flex flex-col items-center gap-4 py-14 text-center">
            <div className="grid grid-cols-2 gap-2 opacity-35">
              {COLORS.map(([r, g, b], i) => (
                <div
                  key={i}
                  style={{
                    width: 60, height: 60,
                    background: `rgb(${r},${g},${b})`,
                    borderRadius: 2,
                    transform: `rotate(${(i % 2 === 0 ? 1 : -1) * 3}deg)`,
                  }}
                />
              ))}
            </div>
            <p className="text-sm text-[#999] mt-2">Allow camera access to see your reflection.</p>
          </div>
        )}

        {camState === "requesting" && (
          <p className="py-12 text-sm text-[#bbb]">Waiting for camera…</p>
        )}

        <canvas
          ref={displayRef}
          width={CW}
          height={CH}
          className={camState === "active" ? "block" : "hidden"}
        />

        {/* Divider */}
        <div className="w-10 h-px bg-[#ddd] my-7" />

        {/* Live paragraph — updates when you move */}
        <p
          className="text-[0.88rem] leading-[1.85] text-[#444] font-light italic text-center max-w-md transition-opacity duration-200"
          style={{ opacity: paraVisible ? 1 : 0 }}
        >
          "{paragraph}"
        </p>

        {/* Hint */}
        <p className="text-[0.58rem] tracking-[0.25em] uppercase text-[#c0c0c0] font-medium mt-8 mb-10">
          move to scatter · still to reform
        </p>
      </div>

      {/* Hidden webcam elements */}
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={sampleRef} width={COLS} height={ROWS} className="hidden" />
    </main>
  );
}
