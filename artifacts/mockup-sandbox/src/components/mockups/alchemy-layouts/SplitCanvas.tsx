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

// ─── Accent colours (sticky-note palette) ────────────────────────────────────
const ACCENT_COLORS = [
  "hsl(54, 100%, 88%)",   // pale yellow
  "hsl(340, 80%, 92%)",   // pale pink
  "hsl(210, 80%, 92%)",   // pale blue
  "hsl(138, 60%, 88%)",   // pale green
];

// ─── Component ────────────────────────────────────────────────────────────────

export function SplitCanvas() {
  const smoothX = useRef(0.5);
  const smoothY = useRef(0.5);
  const targetX = useRef(0.5);
  const targetY = useRef(0.5);
  const rafRef = useRef<number | null>(null);
  const hasMoved = useRef(false);

  const [blobPos, setBlobPos] = useState({ x: 0.5, y: 0.5 });
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
    let frameCount = 0;

    const loop = () => {
      smoothX.current = lerp(smoothX.current, targetX.current, SPEED);
      smoothY.current = lerp(smoothY.current, targetY.current, SPEED);
      updateIndices();

      frameCount++;
      if (frameCount % 3 === 0) {
        setBlobPos({ x: smoothX.current, y: smoothY.current });
      }

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
  const accentColor = ACCENT_COLORS[accentIndex];

  return (
    <div
      style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
      className="min-h-screen bg-[#f7f6f3] text-[#111111] relative overflow-hidden flex flex-col md:flex-row"
    >
      {/* Background Blob */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse 65% 55% at ${blobPos.x * 100}% ${blobPos.y * 100}%, ${accentColor}44 0%, transparent 70%)`,
          transition: "background 0.8s ease-out",
        }}
      />

      {/* Left Column (40%) */}
      <div className="relative z-10 w-full md:w-[40%] flex flex-col min-h-screen border-r border-black/10 px-8 py-12 md:px-16 md:py-20">
        <header className="mb-auto">
          <span className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-[#888] font-medium block mb-16">
            Alchemy Unlimited
          </span>
        </header>

        <section className="my-auto">
          <p className="text-sm md:text-base leading-relaxed text-[#444] font-light tracking-wide">
            We at Alchemy Unlimited are a collection of creative alchemists who are interested in{" "}
            <HighlightedPhrase text={what} color={accentColor} fadeKey={fadeKey} seed={0} />.
            {" "}We are committed to{" "}
            <HighlightedPhrase text={why} color={accentColor} fadeKey={fadeKey} seed={1} />{" "}
            for{" "}
            <HighlightedPhrase text={who} color={accentColor} fadeKey={fadeKey} seed={2} />.
            {" "}We approach our work through{" "}
            <HighlightedPhrase text={how} color={accentColor} fadeKey={fadeKey} seed={3} />,
            {" "}providing our insights within and beyond the scope of our work.
          </p>
        </section>

        <footer className="mt-auto pt-16">
          <p className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#aaa] font-medium">
            move to generate
          </p>
        </footer>
      </div>

      {/* Right Column (60%) */}
      <div className="relative z-10 w-full md:w-[60%] flex items-center px-8 py-16 md:px-24 min-h-[50vh] md:min-h-screen">
        <div className="w-full max-w-4xl">
          <FadingParagraph text={paragraph} fadeKey={fadeKey} />
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface HighlightedPhraseProps {
  text: string;
  color: string;
  fadeKey: number;
  seed: number;
}

function HighlightedPhrase({ text, color, fadeKey, seed }: HighlightedPhraseProps) {
  const [visible, setVisible] = useState(true);
  const [displayText, setDisplayText] = useState(text);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const staggerDelay = seed * 40;

    timerRef.current = setTimeout(() => {
      setVisible(false);
      timerRef.current = setTimeout(() => {
        setDisplayText(text);
        setVisible(true);
      }, 160);
    }, staggerDelay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fadeKey, text]);

  return (
    <span
      className="inline transition-opacity duration-150 font-medium"
      style={{
        opacity: visible ? 1 : 0,
        backgroundColor: color + "55",
        paddingInline: "0.2em",
        borderRadius: "2px",
        color: "#111",
      }}
    >
      {displayText}
    </span>
  );
}

interface FadingParagraphProps {
  text: string;
  fadeKey: number;
}

function FadingParagraph({ text, fadeKey }: FadingParagraphProps) {
  const [visible, setVisible] = useState(true);
  const [displayText, setDisplayText] = useState(text);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setVisible(false);
    timerRef.current = setTimeout(() => {
      setDisplayText(text);
      setVisible(true);
    }, 220);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fadeKey, text]);

  return (
    <h1
      className="text-3xl md:text-5xl lg:text-[3.5rem] leading-[1.3] md:leading-[1.25] text-[#1a1a1a] font-light italic transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {displayText}
    </h1>
  );
}
