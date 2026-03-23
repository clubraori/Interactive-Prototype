import { useEffect, useRef, useState, useCallback } from "react";

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

// ─── Expanded paragraph fragments ────────────────────────────────────────────

function buildParagraph(what: string, why: string, who: string, how: string): string {
  return `We at Alchemy Unlimited are a collection of creative alchemists interested in ${what}. We are committed to ${why} for ${who}. We approach our work through ${how}, providing insight within and beyond the immediate brief.`;
}

// ─── Index mapping ────────────────────────────────────────────────────────────

function pickIndex(normalised: number, length: number): number {
  const clamped = Math.max(0, Math.min(1, normalised));
  return Math.min(Math.floor(clamped * length), length - 1);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GridManifesto() {
  const smoothX = useRef(0.5);
  const smoothY = useRef(0.5);
  const targetX = useRef(0.5);
  const targetY = useRef(0.5);
  const rafRef = useRef<number | null>(null);

  const [indices, setIndices] = useState({ what: 0, why: 4, who: 1, how: 0 });
  const [fadeKey, setFadeKey] = useState(0);
  const prevIndicesRef = useRef(indices);

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
      className="min-h-screen bg-[#f7f6f3] text-[#111] relative overflow-hidden flex flex-col items-center justify-center p-6 md:p-12 lg:p-16"
    >
      <div className="w-full max-w-4xl flex flex-col flex-1">
        
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-[0.65rem] tracking-[0.3em] uppercase text-[#666] font-medium text-center">
            Alchemy Unlimited
          </h1>
        </header>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16 flex-1">
          <Tile label="what we do" text={what} bgColor="hsl(54, 100%, 88%)" />
          <Tile label="why we do it" text={why} bgColor="hsl(340, 80%, 92%)" />
          <Tile label="who we serve" text={who} bgColor="hsl(210, 80%, 92%)" />
          <Tile label="how we work" text={how} bgColor="hsl(138, 60%, 88%)" />
        </div>

        {/* Divider & Paragraph */}
        <div className="mt-auto flex flex-col items-center max-w-2xl mx-auto text-center w-full">
          <div className="w-16 h-[1px] bg-black/10 mb-8" />
          <FadingParagraph text={paragraph} />
        </div>

        {/* Footer Hint */}
        <footer className="mt-16 text-center">
          <p className="text-[0.65rem] tracking-[0.25em] uppercase text-[#999] font-medium">
            move to generate
          </p>
        </footer>
      </div>
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Tile({ label, text, bgColor }: { label: string; text: string; bgColor: string }) {
  const [visible, setVisible] = useState(true);
  const [displayText, setDisplayText] = useState(text);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (displayText !== text) {
      setVisible(false);
      timerRef.current = setTimeout(() => {
        setDisplayText(text);
        setVisible(true);
      }, 150);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, displayText]);

  return (
    <div 
      className="flex flex-col rounded-2xl p-6 md:p-8 min-h-[160px] md:min-h-[200px]"
      style={{ backgroundColor: bgColor }}
    >
      <span className="text-[0.65rem] tracking-[0.15em] uppercase text-black/50 mb-4 font-semibold">
        {label}
      </span>
      <p 
        className="text-lg md:text-xl font-medium leading-[1.3] transition-opacity duration-200 mt-auto text-[#1a1a1a]"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {displayText}
      </p>
    </div>
  );
}

function FadingParagraph({ text }: { text: string }) {
  const [visible, setVisible] = useState(true);
  const [displayText, setDisplayText] = useState(text);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (displayText !== text) {
      setVisible(false);
      timerRef.current = setTimeout(() => {
        setDisplayText(text);
        setVisible(true);
      }, 200);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, displayText]);

  return (
    <p
      className="text-[0.95rem] md:text-base leading-[1.7] text-[#555] font-light italic transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      "{displayText}"
    </p>
  );
}
