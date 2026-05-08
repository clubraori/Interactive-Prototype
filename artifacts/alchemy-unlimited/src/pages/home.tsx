import { useEffect, useRef, useState, useCallback } from "react";

interface CuratedStatement {
  id: number;
  what: string;
  why: string;
  who: string;
  how: string;
  statement: string;
}

type VariableKey = "what" | "why" | "who" | "how";

interface VariableState {
  what: number;
  why: number;
  who: number;
  how: number;
}

interface LockState {
  what: string | null;
  why: string | null;
  who: string | null;
  how: string | null;
}

type MenuSectionKey = "about" | "projects" | "ethos" | "contact";

const FALLBACK_STATEMENTS: CuratedStatement[] = [
  {
    id: 1,
    what: "interdisciplinary creative practice",
    why: "more equitable access to creative capital",
    who: "creative communities",
    how: "co-design",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in interdisciplinary creative practice. We are committed to more equitable access to creative capital for creative communities. We approach our work through co-design.",
  },
  {
    id: 2,
    what: "creative consulting",
    why: "meaningful action through creative strategies",
    who: "impact-oriented institutions",
    how: "creative consultation",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in creative consulting. We are committed to meaningful action through creative strategies for impact-oriented institutions. We approach our work through creative consultation.",
  },
  {
    id: 3,
    what: "community engagement",
    why: "re-engagement with our surroundings",
    who: "community organizations",
    how: "hands-on interactive processes",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in community engagement. We are committed to re-engagement with our surroundings for community organizations. We approach our work through hands-on interactive processes.",
  },
  {
    id: 4,
    what: "curatorial practice",
    why: "public connection across art, science, and culture",
    who: "public-facing arts organizations",
    how: "workshops, installations and situated activations",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in curatorial practice. We are committed to public connection across art, science, and culture for public-facing arts organizations. We approach our work through workshops, installations and situated activations.",
  },
  {
    id: 5,
    what: "programming",
    why: "education",
    who: "academic institutions",
    how: "facilitation",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in programming. We are committed to education for academic institutions. We approach our work through facilitation.",
  },
  {
    id: 6,
    what: "creative community building",
    why: "deeper audience engagement",
    who: "cultural institutions",
    how: "a creative producing framework",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in creative community building. We are committed to deeper audience engagement for cultural institutions. We approach our work through a creative producing framework.",
  },
  {
    id: 7,
    what: "art-based practices that solve or highlight issues",
    why: "sustainable and ethical practice",
    who: "nonprofits",
    how: "empathy and care",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in art-based practices that solve or highlight issues. We are committed to sustainable and ethical practice for nonprofits. We approach our work through empathy and care.",
  },
  {
    id: 8,
    what: "strategies for accessing creativity",
    why: "unblocking creative sticking points",
    who: "learners and students",
    how: "guiding",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in strategies for accessing creativity. We are committed to unblocking creative sticking points for learners and students. We approach our work through guiding.",
  },
  {
    id: 9,
    what: "thought leadership",
    why: "expanding boundaries of creative practice",
    who: "innovation institutions",
    how: "interdisciplinary thinking",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in thought leadership. We are committed to expanding boundaries of creative practice for innovation institutions. We approach our work through interdisciplinary thinking.",
  },
  {
    id: 10,
    what: "creative producing",
    why: "better organization of brainpower and creative energy",
    who: "startups",
    how: "process-oriented collaboration",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in creative producing. We are committed to better organization of brainpower and creative energy for startups. We approach our work through process-oriented collaboration.",
  },
  {
    id: 11,
    what: "creative consulting",
    why: "awareness",
    who: "advocacy groups",
    how: "stakeholder dialogue",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in creative consulting. We are committed to awareness for advocacy groups. We approach our work through stakeholder dialogue.",
  },
  {
    id: 12,
    what: "community engagement",
    why: "deeper audience engagement",
    who: "creative communities",
    how: "art thinking",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in community engagement. We are committed to deeper audience engagement for creative communities. We approach our work through art thinking.",
  },
  {
    id: 13,
    what: "curatorial practice",
    why: "entertainment",
    who: "conveners",
    how: "workshops, installations and situated activations",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in curatorial practice. We are committed to entertainment for conveners. We approach our work through workshops, installations and situated activations.",
  },
  {
    id: 14,
    what: "interdisciplinary creative practice",
    why: "public connection across art, science, and culture",
    who: "immersive and emerging technology studios",
    how: "interdisciplinary thinking",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in interdisciplinary creative practice. We are committed to public connection across art, science, and culture for immersive and emerging technology studios. We approach our work through interdisciplinary thinking.",
  },
  {
    id: 15,
    what: "creative community building",
    why: "more equitable access to creative capital",
    who: "artists and creatives",
    how: "facilitation",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in creative community building. We are committed to more equitable access to creative capital for artists and creatives. We approach our work through facilitation.",
  },
  {
    id: 16,
    what: "strategies for accessing creativity",
    why: "education",
    who: "learners and students",
    how: "co-design",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in strategies for accessing creativity. We are committed to education for learners and students. We approach our work through co-design.",
  },
  {
    id: 17,
    what: "art-based practices that solve or highlight issues",
    why: "awareness",
    who: "advocacy groups",
    how: "hands-on interactive processes",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in art-based practices that solve or highlight issues. We are committed to awareness for advocacy groups. We approach our work through hands-on interactive processes.",
  },
  {
    id: 18,
    what: "thought leadership",
    why: "sustainable and ethical practice",
    who: "innovation institutions",
    how: "stakeholder dialogue",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in thought leadership. We are committed to sustainable and ethical practice for innovation institutions. We approach our work through stakeholder dialogue.",
  },
  {
    id: 19,
    what: "programming",
    why: "meaningful action through creative strategies",
    who: "creative technology organizations",
    how: "design thinking",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in programming. We are committed to meaningful action through creative strategies for creative technology organizations. We approach our work through design thinking.",
  },
  {
    id: 20,
    what: "networking",
    why: "deeper audience engagement",
    who: "conveners",
    how: "facilitation",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in networking. We are committed to deeper audience engagement for conveners. We approach our work through facilitation.",
  },
  {
    id: 21,
    what: "creative producing",
    why: "expanding boundaries of creative practice",
    who: "immersive and emerging technology studios",
    how: "a creative producing framework",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in creative producing. We are committed to expanding boundaries of creative practice for immersive and emerging technology studios. We approach our work through a creative producing framework.",
  },
  {
    id: 22,
    what: "creative consulting",
    why: "better organization of brainpower and creative energy",
    who: "startups",
    how: "design thinking",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in creative consulting. We are committed to better organization of brainpower and creative energy for startups. We approach our work through design thinking.",
  },
  {
    id: 23,
    what: "community engagement",
    why: "re-engagement with each other",
    who: "creative communities",
    how: "empathy and care",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in community engagement. We are committed to re-engagement with each other for creative communities. We approach our work through empathy and care.",
  },
  {
    id: 24,
    what: "curatorial practice",
    why: "a more wholesome built environment",
    who: "public-facing arts organizations",
    how: "art thinking",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in curatorial practice. We are committed to a more wholesome built environment for public-facing arts organizations. We approach our work through art thinking.",
  },
  {
    id: 25,
    what: "interdisciplinary creative practice",
    why: "education",
    who: "academic institutions",
    how: "process-oriented collaboration",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in interdisciplinary creative practice. We are committed to education for academic institutions. We approach our work through process-oriented collaboration.",
  },
  {
    id: 26,
    what: "strategies for accessing creativity",
    why: "more equitable access to creative capital",
    who: "inclusive technology organizations",
    how: "guiding",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in strategies for accessing creativity. We are committed to more equitable access to creative capital for inclusive technology organizations. We approach our work through guiding.",
  },
  {
    id: 27,
    what: "art-based practices that solve or highlight issues",
    why: "meaningful action through creative strategies",
    who: "impact-oriented institutions",
    how: "co-design",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in art-based practices that solve or highlight issues. We are committed to meaningful action through creative strategies for impact-oriented institutions. We approach our work through co-design.",
  },
  {
    id: 28,
    what: "thought leadership",
    why: "awareness",
    who: "cultural institutions",
    how: "stakeholder dialogue",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in thought leadership. We are committed to awareness for cultural institutions. We approach our work through stakeholder dialogue.",
  },
  {
    id: 29,
    what: "creative community building",
    why: "re-engagement with our surroundings",
    who: "community organizations",
    how: "hands-on interactive processes",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in creative community building. We are committed to re-engagement with our surroundings for community organizations. We approach our work through hands-on interactive processes.",
  },
  {
    id: 30,
    what: "creative producing",
    why: "public connection across art, science, and culture",
    who: "artists and creatives",
    how: "art thinking",
    statement:
      "We at Alchemy Unlimited are a collection of creative alchemists who are interested in creative producing. We are committed to public connection across art, science, and culture for artists and creatives. We approach our work through art thinking.",
  },
];

const ACCENT_COLORS = [
  "hsl(54, 100%, 88%)",
  "hsl(340, 80%, 92%)",
  "hsl(210, 80%, 92%)",
  "hsl(138, 60%, 88%)",
];

const CATEGORY_ORDER: VariableKey[] = ["what", "why", "who", "how"];
const X_STEP_PX = 220;
const CHANGE_COOLDOWN_MS = 700;

const MENU_SECTIONS: {
  key: MenuSectionKey;
  label: string;
  eyebrow: string;
  body: string;
}[] = [
  {
    key: "about",
    label: "About",
    eyebrow: "Alchemy Unlimited",
    body:
      "Placeholder copy for a concise introduction to the studio, its collaborators, and the kind of interdisciplinary creative practice you bring together.",
  },
  {
    key: "projects",
    label: "Projects",
    eyebrow: "Selected Work",
    body:
      "Placeholder copy for a short list or summary of previous commissions, activations, workshops, and collaborations across culture, education, and emerging technology.",
  },
  {
    key: "ethos",
    label: "Ethos",
    eyebrow: "Methodology",
    body:
      "Placeholder copy for the card-game-inspired framework Nick is developing, explaining how your design philosophy helps people locate themselves inside the work.",
  },
  {
    key: "contact",
    label: "Contact",
    eyebrow: "Get In Touch",
    body:
      "Placeholder copy for contact details, availability, studio location, or an invitation for potential collaborators, clients, and institutions to start a conversation.",
  },
];

function uniqueValues(
  statements: CuratedStatement[],
  key: VariableKey,
): string[] {
  return Array.from(new Set(statements.map((statement) => cleanPhrase(statement[key]))));
}

function cleanPhrase(value: string): string {
  return value.trim().replace(/\s+/g, " ").replace(/[.]+$/g, "");
}

function pickIndex(normalised: number, length: number): number {
  if (length <= 1) return 0;
  const clamped = Math.max(0, Math.min(1, normalised));
  return Math.min(Math.floor(clamped * length), length - 1);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

const VALUE_BANKS = {
  what: uniqueValues(FALLBACK_STATEMENTS, "what"),
  why: uniqueValues(FALLBACK_STATEMENTS, "why"),
  who: uniqueValues(FALLBACK_STATEMENTS, "who"),
  how: uniqueValues(FALLBACK_STATEMENTS, "how"),
};

export default function Home() {
  const smoothX = useRef(0.5);
  const targetX = useRef(0.5);
  const rafRef = useRef<number | null>(null);
  const motionLayerRef = useRef<HTMLDivElement | null>(null);
  const previousValuesRef = useRef<VariableState>({
    what: 0,
    why: 0,
    who: 0,
    how: 0,
  });
  const lastBucketRef = useRef(0);
  const lastChangeAtRef = useRef(0);
  const viewportWidthRef = useRef(1440);

  const [indices, setIndices] = useState<VariableState>({
    what: 0,
    why: 4,
    who: 1,
    how: 0,
  });
  const [locks, setLocks] = useState<LockState>({
    what: null,
    why: null,
    who: null,
    how: null,
  });
  const [accentIndex, setAccentIndex] = useState(0);
  const [dividerFlashKey, setDividerFlashKey] = useState(0);
  const [activeMenuSection, setActiveMenuSection] = useState<MenuSectionKey>("about");

  const updateDividerPosition = useCallback((normalisedX: number) => {
    const clamped = Math.max(0, Math.min(1, normalisedX));
    motionLayerRef.current?.style.setProperty("--divider-x", `${clamped * 100}%`);
  }, []);

  const updateActiveValues = useCallback(() => {
    const viewportWidth = Math.max(viewportWidthRef.current, 1);
    const xPx = smoothX.current * viewportWidth;
    const bucket = Math.floor(xPx / X_STEP_PX);
    const now = Date.now();

    if (bucket === lastBucketRef.current) return;
    if (now - lastChangeAtRef.current < CHANGE_COOLDOWN_MS) return;

    lastBucketRef.current = bucket;
    lastChangeAtRef.current = now;

    const next = {
      what: ((bucket % VALUE_BANKS.what.length) + VALUE_BANKS.what.length) % VALUE_BANKS.what.length,
      why:
        ((Math.floor(bucket / 2) % VALUE_BANKS.why.length) + VALUE_BANKS.why.length) %
        VALUE_BANKS.why.length,
      who:
        ((Math.floor(bucket / 3) % VALUE_BANKS.who.length) + VALUE_BANKS.who.length) %
        VALUE_BANKS.who.length,
      how:
        ((Math.floor(bucket / 4) % VALUE_BANKS.how.length) + VALUE_BANKS.how.length) %
        VALUE_BANKS.how.length,
    };
    const previous = previousValuesRef.current;

    const changed = CATEGORY_ORDER.some((category) => next[category] !== previous[category]);

    if (changed) {
      previousValuesRef.current = next;
      setIndices(next);
      setAccentIndex((value) => (value + 1) % ACCENT_COLORS.length);
      setDividerFlashKey((value) => value + 1);

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(10);
      }
    }
  }, []);

  useEffect(() => {
    const speed = 0.02;

    const loop = () => {
      smoothX.current = lerp(smoothX.current, targetX.current, speed);
      updateActiveValues();

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [updateActiveValues]);

  useEffect(() => {
    viewportWidthRef.current = window.innerWidth;
    lastBucketRef.current = Math.floor((smoothX.current * window.innerWidth) / X_STEP_PX);
    updateDividerPosition(targetX.current);

    const onResize = () => {
      viewportWidthRef.current = window.innerWidth;
      lastBucketRef.current = Math.floor((smoothX.current * window.innerWidth) / X_STEP_PX);
      updateDividerPosition(targetX.current);
    };

    const onMove = (event: MouseEvent) => {
      targetX.current = event.clientX / window.innerWidth;
      updateDividerPosition(targetX.current);
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      targetX.current = touch.clientX / window.innerWidth;
      updateDividerPosition(targetX.current);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [updateDividerPosition]);

  const accentColor = ACCENT_COLORS[accentIndex];
  const activeMenuContent =
    MENU_SECTIONS.find((section) => section.key === activeMenuSection) ?? MENU_SECTIONS[0];
  const currentValues = {
    what: locks.what ?? VALUE_BANKS.what[indices.what],
    why: locks.why ?? VALUE_BANKS.why[indices.why],
    who: locks.who ?? VALUE_BANKS.who[indices.who],
    how: locks.how ?? VALUE_BANKS.how[indices.how],
  };
  const toggleLock = (category: VariableKey, value: string) => {
    setLocks((current) => ({
      ...current,
      [category]: current[category] === value ? null : value,
    }));
  };

  return (
    <main
      style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
      className="min-h-screen bg-[#f7f6f3] text-[#111111] relative overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        ref={motionLayerRef}
        style={{ ["--divider-x" as string]: "50%" }}
      >
        <div
          className="absolute inset-y-0 left-0 bg-white"
          style={{ width: "var(--divider-x)" }}
        />
        <div
          className="absolute inset-y-0 w-px transition-[background-color,box-shadow] duration-150 ease-out"
          style={{
            left: "calc(var(--divider-x) - 0.5px)",
            backgroundColor: dividerFlashKey % 2 === 0 ? "rgba(17,17,17,0.18)" : "rgba(17,17,17,0.34)",
            boxShadow:
              dividerFlashKey % 2 === 0
                ? "0 0 0 transparent"
                : "0 0 18px rgba(17,17,17,0.12)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 md:px-10 md:py-10">
        <header className="mb-8 md:mb-10">
          <span className="text-[0.65rem] tracking-[0.3em] uppercase text-[#888] font-medium">
            Alchemy Unlimited
          </span>
        </header>

        <div className="flex flex-1 flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12">
          <div className="flex flex-1 flex-col">
            <section className="grid gap-6 sm:grid-cols-2 md:gap-x-10 md:gap-y-8">
              <DisplaySection
                label="WHAT"
                text={currentValues.what}
                color={ACCENT_COLORS[0]}
                locked={Boolean(locks.what)}
                onClick={() => toggleLock("what", currentValues.what)}
              />
              <DisplaySection
                label="WHY"
                text={currentValues.why}
                color={ACCENT_COLORS[1]}
                locked={Boolean(locks.why)}
                onClick={() => toggleLock("why", currentValues.why)}
              />
              <DisplaySection
                label="WHO"
                text={currentValues.who}
                color={ACCENT_COLORS[2]}
                locked={Boolean(locks.who)}
                onClick={() => toggleLock("who", currentValues.who)}
              />
              <DisplaySection
                label="HOW"
                text={currentValues.how}
                color={ACCENT_COLORS[3]}
                locked={Boolean(locks.how)}
                onClick={() => toggleLock("how", currentValues.how)}
              />
            </section>

            <div className="mt-8 h-px w-full border-t border-[#d7d5cf] md:mt-10" />

            <section className="mt-6 max-w-[36rem] md:mt-8">
              <StatementParagraph
                what={currentValues.what}
                why={currentValues.why}
                who={currentValues.who}
                how={currentValues.how}
              />
            </section>
          </div>

          <aside className="lg:pt-1">
            <div className="border border-[#d8d1b6] bg-[#fff0a8]/90 p-4 shadow-[0_12px_28px_rgba(73,60,18,0.08)] backdrop-blur-sm">
              <p className="mb-3 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#6d6547]">
                Menu
              </p>

              <div className="space-y-1">
                {MENU_SECTIONS.map((section) => {
                  const isActive = section.key === activeMenuSection;

                  return (
                    <button
                      key={section.key}
                      type="button"
                      onClick={() => setActiveMenuSection(section.key)}
                      className="flex w-full items-center justify-between border border-transparent px-2 py-2 text-left transition-colors duration-150 hover:bg-white/45"
                      style={{
                        backgroundColor: isActive ? "rgba(255, 255, 255, 0.54)" : "transparent",
                        borderColor: isActive ? "rgba(109, 101, 71, 0.24)" : "transparent",
                      }}
                    >
                      <span className="text-[0.9rem] text-[#353126]">{section.label}</span>
                      <span className="text-[0.68rem] text-[#8c8468]">
                        {isActive ? "open" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 border-t border-[#d8d1b6] pt-4">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#8c8468]">
                  {activeMenuContent.eyebrow}
                </p>
                <p className="mt-3 text-[0.83rem] leading-[1.6] text-[#403a2c]">
                  {activeMenuContent.body}
                </p>
              </div>
            </div>
          </aside>
        </div>

        <footer className="mt-auto pt-6 md:pt-8" />
      </div>
    </main>
  );
}

interface DisplaySectionProps {
  label: string;
  text: string;
  color: string;
  locked?: boolean;
  onClick?: () => void;
}

function DisplaySection({
  label,
  text,
  color,
  locked = false,
  onClick,
}: DisplaySectionProps) {
  const [visible, setVisible] = useState(true);
  const [displayText, setDisplayText] = useState(text);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (displayText === text) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    setVisible(false);
    timerRef.current = setTimeout(() => {
      setDisplayText(text);
      setVisible(true);
    }, 180);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, displayText]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={locked}
      className="group flex flex-col items-start gap-3 text-left"
    >
      <span
        className="rounded-sm px-2 py-[3px] text-[0.62rem] font-semibold uppercase tracking-[0.22em] transition-colors duration-150"
        style={{
          backgroundColor: locked ? "rgba(188, 188, 188, 0.72)" : color,
          color: locked ? "#5f5a54" : "#111",
        }}
      >
        {label}
      </span>
      <h2
        className="max-w-[18ch] text-[1.1rem] font-medium leading-[1.08] tracking-tight text-[#111] transition-[opacity,color] duration-200 group-hover:text-[#6f6a63] sm:text-[1.3rem] md:text-[1.7rem] lg:text-[2rem]"
        style={{
          opacity: visible ? 1 : 0,
          color: locked ? "#7d7872" : "#111111",
        }}
      >
        {displayText}
      </h2>
      <span className="text-[0.58rem] uppercase tracking-[0.18em] text-[#b4aea4] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {locked ? "click to unlock" : "click to lock"}
      </span>
    </button>
  );
}

interface TypedSlotProps {
  text: string;
}

function TypedSlot({ text }: TypedSlotProps) {
  const [displayText, setDisplayText] = useState(text);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef(0);
  const displayRef = useRef(text);

  useEffect(() => {
    displayRef.current = displayText;
  }, [displayText]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    frameRef.current += 1;
    const currentFrame = frameRef.current;

    if (displayRef.current === text) return;

    const current = displayRef.current;
    let prefixLength = 0;
    const limit = Math.min(current.length, text.length);

    while (prefixLength < limit && current[prefixLength] === text[prefixLength]) {
      prefixLength += 1;
    }

    let deletingText = current;

    const deleteStep = () => {
      if (frameRef.current !== currentFrame) return;

      if (deletingText.length > prefixLength) {
        deletingText = deletingText.slice(0, -1);
        setDisplayText(deletingText);
        timerRef.current = setTimeout(deleteStep, 12);
        return;
      }

      let typedLength = prefixLength;
      const typeStep = () => {
        if (frameRef.current !== currentFrame) return;

        if (typedLength < text.length) {
          typedLength += 1;
          setDisplayText(text.slice(0, typedLength));
          timerRef.current = setTimeout(typeStep, 14);
        }
      };

      timerRef.current = setTimeout(typeStep, 40);
    };

    timerRef.current = setTimeout(deleteStep, 20);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text]);

  return (
    <span className="text-[#3f3b36]">
      {displayText}
      <span className="ml-[1px] inline-block h-[0.95em] w-px translate-y-[2px] bg-[#8a8780] align-baseline animate-pulse" />
    </span>
  );
}

interface StatementParagraphProps {
  what: string;
  why: string;
  who: string;
  how: string;
}

function StatementParagraph({
  what,
  why,
  who,
  how,
}: StatementParagraphProps) {
  return (
    <p className="text-[0.82rem] leading-[1.58] text-[#4a4a4a] font-light md:text-[0.9rem] md:leading-[1.66]">
      We at Alchemy Unlimited are a collection of creative alchemists who are interested in{" "}
      <TypedSlot text={what} />. We are committed to <TypedSlot text={why} /> for{" "}
      <TypedSlot text={who} />. We approach our work through <TypedSlot text={how} />.
    </p>
  );
}
