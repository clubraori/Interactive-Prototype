import React, { useEffect, useRef, useState, useCallback } from "react";

// ─── Phrase Banks ────────────────────────────────────────────────────────────
const WHAT_PHRASES = [
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

const WHY_PHRASES = [
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

const WHO_PHRASES = [
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

const HOW_PHRASES = [
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

function buildParagraph(what: string, why: string, who: string, how: string): string {
  return `We at Alchemy Unlimited are a collection of creative alchemists interested in ${what}. We are committed to ${why} for ${who}. We approach our work through ${how}, providing insight within and beyond the immediate brief.`;
}

function pickIndex(normalised: number, length: number): number {
  const clamped = Math.max(0, Math.min(1, normalised));
  return Math.min(Math.floor(clamped * length), length - 1);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

const ACCENT_COLORS = [
  "hsl(54, 100%, 88%)",   // pale yellow
  "hsl(340, 80%, 92%)",   // pale pink
  "hsl(210, 80%, 92%)",   // pale blue
  "hsl(138, 60%, 88%)",   // pale green
];

export function PosterStack() {
  const smoothX = useRef(0.5);
  const smoothY = useRef(0.5);
  const targetX = useRef(0.5);
  const targetY = useRef(0.5);
  const rafRef = useRef<number | null>(null);
  const hasMoved = useRef(false);

  const [indices, setIndices] = useState({ what: 0, why: 4, who: 1, how: 0 });
  const [fadeKey, setFadeKey] = useState(0);
  const prevIndicesRef = useRef(indices);
  const [accentIndex, setAccentIndex] = useState(0);

  const updateIndices = useCallback(() => {
    const x = smoothX.current;
    const y = smoothY.current;

    const whatIdx = pickIndex(x, WHAT_PHRASES.length);
    const whyIdx = pickIndex(y, WHY_PHRASES.length);
    const whoIdx = pickIndex((x * 0.4 + y * 0.6), WHO_PHRASES.length);
    const howIdx = pickIndex((x * 0.6 + (1 - y) * 0.4), HOW_PHRASES.length);

    const next = { what: whatIdx, why: whyIdx, who: whoIdx, how: howIdx };
    const prev = prevIndicesRef.current;

    const changed =
      next.what !== prev.what ||
      next.why !== prev.why ||
      next.who !== prev.who ||
      next.how !== prev.how;

    if (changed) {
      prevIndicesRef.current = next;
      setIndices(next);
      setFadeKey((k) => k + 1);
      setAccentIndex((i) => (i + 1) % ACCENT_COLORS.length);
    }
  }, []);

  useEffect(() => {
    const SPEED = 0.04; 
    const loop = () => {
      smoothX.current = lerp(smoothX.current, targetX.current, SPEED);
      smoothY.current = lerp(smoothY.current, targetY.current, SPEED);
      updateIndices();
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [updateIndices]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      hasMoved.current = true;
      targetX.current = e.clientX / window.innerWidth;
      targetY.current = e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const what = WHAT_PHRASES[indices.what];
  const why = WHY_PHRASES[indices.why];
  const who = WHO_PHRASES[indices.who];
  const how = HOW_PHRASES[indices.how];
  const paragraph = buildParagraph(what, why, who, how);

  return (
    <main
      style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
      className="min-h-screen bg-[#f7f6f3] text-[#111] flex flex-col items-center py-12 px-6 md:py-20 overflow-hidden"
    >
      <div className="w-full max-w-4xl flex flex-col min-h-[calc(100vh-6rem)]">
        
        {/* Header */}
        <header className="mb-20">
          <h1 className="text-[0.65rem] tracking-[0.3em] uppercase text-[#111] font-medium text-center md:text-left">
            Alchemy Unlimited
          </h1>
        </header>

        {/* Poster Stack Content */}
        <div className="flex-grow flex flex-col gap-16 md:gap-24 mb-24">
          <DisplaySection label="WHAT" text={what} color={ACCENT_COLORS[0]} />
          <DisplaySection label="WHY" text={why} color={ACCENT_COLORS[1]} />
          <DisplaySection label="WHO" text={who} color={ACCENT_COLORS[2]} />
          <DisplaySection label="HOW" text={how} color={ACCENT_COLORS[3]} />
        </div>

        {/* Divider */}
        <hr className="border-t border-[#d1d0cb] mb-12 w-full" />

        {/* Expanded paragraph */}
        <section className="mb-24 md:mb-16">
          <FadingParagraph text={paragraph} />
        </section>

        {/* Footer */}
        <footer className="mt-auto flex justify-center pb-8">
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-[#888] font-medium">
            move to generate
          </p>
        </footer>
      </div>
    </main>
  );
}

// Subcomponents

interface DisplaySectionProps {
  label: string;
  text: string;
  color: string;
}

function DisplaySection({ label, text, color }: DisplaySectionProps) {
  const [visible, setVisible] = useState(true);
  const [displayText, setDisplayText] = useState(text);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (displayText === text) return;

    setVisible(false);
    timerRef.current = setTimeout(() => {
      setDisplayText(text);
      setVisible(true);
    }, 200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, displayText]);

  return (
    <div className="flex flex-col items-start">
      <span 
        className="text-[0.65rem] tracking-[0.2em] font-semibold uppercase mb-4 px-2 py-1 inline-block"
        style={{ backgroundColor: color, color: '#111' }}
      >
        {label}
      </span>
      <h2 
        className="text-4xl md:text-5xl lg:text-7xl leading-[1.05] font-medium tracking-tight transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {displayText}
      </h2>
    </div>
  );
}

function FadingParagraph({ text }: { text: string }) {
  const [visible, setVisible] = useState(true);
  const [displayText, setDisplayText] = useState(text);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (displayText === text) return;

    setVisible(false);
    timerRef.current = setTimeout(() => {
      setDisplayText(text);
      setVisible(true);
    }, 250);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, displayText]);

  return (
    <p 
      className="text-sm md:text-base leading-relaxed text-[#555] max-w-2xl transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {displayText}
    </p>
  );
}
