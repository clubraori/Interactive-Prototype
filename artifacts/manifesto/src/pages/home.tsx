import { useEffect, useRef, useState, useCallback } from "react";

// ─── Phrase banks ────────────────────────────────────────────────────────────
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

function buildParagraph(what: string, why: string, who: string, how: string) {
  return `We at Alchemy Unlimited are a collection of creative alchemists interested in ${what}. We are committed to ${why} for ${who}. We approach our work through ${how}, providing insight within and beyond the immediate brief.`;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function pickIndex(norm: number, len: number) {
  return Math.min(Math.floor(clamp(norm, 0, 1) * len), len - 1);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const ACCENT_COLORS = [
  "hsl(54,100%,87%)",   // pale yellow  — WHAT
  "hsl(340,75%,91%)",   // pale pink    — WHY
  "hsl(210,75%,91%)",   // pale blue    — WHO
  "hsl(138,55%,87%)",   // pale green   — HOW
];

// ─── Fading section label + big text ─────────────────────────────────────────
function DisplaySection({ label, text, color }: { label: string; text: string; color: string }) {
  const [visible, setVisible] = useState(true);
  const [shown,   setShown]   = useState(text);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (shown === text) return;
    if (timer.current) clearTimeout(timer.current);
    setVisible(false);
    timer.current = setTimeout(() => { setShown(text); setVisible(true); }, 200);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [text, shown]);

  return (
    <div className="flex flex-col items-start">
      <span
        className="text-[0.6rem] tracking-[0.22em] font-semibold uppercase mb-3 px-2 py-[3px] inline-block rounded-sm"
        style={{ backgroundColor: color, color: "#111" }}
      >
        {label}
      </span>
      <h2
        className="text-3xl sm:text-4xl md:text-5xl lg:text-[4.5rem] leading-[1.05] font-medium tracking-tight transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {shown}
      </h2>
    </div>
  );
}

// ─── Fading manifesto paragraph ───────────────────────────────────────────────
function FadingParagraph({ text }: { text: string }) {
  const [visible, setVisible] = useState(true);
  const [shown,   setShown]   = useState(text);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (shown === text) return;
    if (timer.current) clearTimeout(timer.current);
    setVisible(false);
    timer.current = setTimeout(() => { setShown(text); setVisible(true); }, 250);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [text, shown]);

  return (
    <p
      className="text-sm md:text-base leading-relaxed text-[#555] max-w-2xl transition-opacity duration-200"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {shown}
    </p>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Home() {
  // Smoothed pointer position (0–1 each axis)
  const smoothX = useRef(0.5);
  const smoothY = useRef(0.5);
  const targetX = useRef(0.5);
  const targetY = useRef(0.5);
  const rafRef  = useRef<number | null>(null);
  const hasMoved = useRef(false);

  const [indices, setIndices] = useState({ what: 0, why: 4, who: 1, how: 0 });
  const prevRef = useRef(indices);

  // Detect touch-capable device to show the right hint
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(window.matchMedia("(hover: none) and (pointer: coarse)").matches);
  }, []);

  // Recompute phrase indices from smoothed position
  const updateIndices = useCallback(() => {
    const x = smoothX.current;
    const y = smoothY.current;
    const next = {
      what: pickIndex(x,                      WHAT.length),
      why:  pickIndex(y,                      WHY.length),
      who:  pickIndex(x * 0.4 + y * 0.6,     WHO.length),
      how:  pickIndex(x * 0.6 + (1 - y) * 0.4, HOW.length),
    };
    const prev = prevRef.current;
    if (next.what !== prev.what || next.why !== prev.why ||
        next.who  !== prev.who  || next.how !== prev.how) {
      prevRef.current = next;
      setIndices(next);
    }
  }, []);

  // rAF loop — lerp toward target position
  useEffect(() => {
    const SPEED = 0.04;
    const loop = () => {
      smoothX.current = lerp(smoothX.current, targetX.current, SPEED);
      smoothY.current = lerp(smoothY.current, targetY.current, SPEED);
      updateIndices();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [updateIndices]);

  // Mouse input
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      hasMoved.current = true;
      targetX.current = e.clientX / window.innerWidth;
      targetY.current = e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Touch input — maps first touch point to the same 0–1 space
  useEffect(() => {
    const onTouch = (e: TouchEvent) => {
      hasMoved.current = true;
      const t = e.touches[0];
      targetX.current = t.clientX / window.innerWidth;
      targetY.current = t.clientY / window.innerHeight;
    };
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => window.removeEventListener("touchmove", onTouch);
  }, []);

  const what = WHAT[indices.what];
  const why  = WHY[indices.why];
  const who  = WHO[indices.who];
  const how  = HOW[indices.how];

  return (
    <main
      style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
      className="min-h-screen bg-[#f7f6f3] text-[#111] flex flex-col items-center py-12 px-6 md:py-20 overflow-x-hidden select-none touch-pan-y"
    >
      <div className="w-full max-w-4xl flex flex-col min-h-[calc(100dvh-6rem)]">

        {/* Header */}
        <header className="mb-16 md:mb-20">
          <h1 className="text-[0.65rem] tracking-[0.3em] uppercase text-[#111] font-medium text-center md:text-left">
            Alchemy Unlimited
          </h1>
        </header>

        {/* Four stacked variable sections */}
        <div className="flex-grow flex flex-col gap-12 md:gap-20 mb-20 md:mb-24">
          <DisplaySection label="WHAT" text={what} color={ACCENT_COLORS[0]} />
          <DisplaySection label="WHY"  text={why}  color={ACCENT_COLORS[1]} />
          <DisplaySection label="WHO"  text={who}  color={ACCENT_COLORS[2]} />
          <DisplaySection label="HOW"  text={how}  color={ACCENT_COLORS[3]} />
        </div>

        {/* Divider */}
        <hr className="border-t border-[#d1d0cb] mb-10 w-full" />

        {/* Assembled paragraph */}
        <section className="mb-20 md:mb-16">
          <FadingParagraph text={buildParagraph(what, why, who, how)} />
        </section>

        {/* Footer hint */}
        <footer className="mt-auto flex justify-center pb-6">
          <p className="text-[0.6rem] tracking-[0.28em] uppercase text-[#aaa] font-medium">
            {isTouch ? "drag to generate" : "move to generate"}
          </p>
        </footer>

      </div>
    </main>
  );
}
