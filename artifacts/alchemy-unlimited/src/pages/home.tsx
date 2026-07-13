import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
  type ReactNode,
} from "react";
import { Link } from "wouter";

type VariableKey = "whatHow" | "who" | "why";
type MenuSectionKey = "about" | "lenses" | "works" | "contact";

interface VariableState {
  whatHow: number;
  who: number;
  why: number;
}

interface LockState {
  whatHow: string | null;
  who: string | null;
  why: string | null;
}

interface MenuSectionContent {
  key: MenuSectionKey;
  label: string;
}

interface MediaFragment {
  key: string;
  label: string;
  startAt: number;
  endAt: number;
  objectPosition: string;
  delay: string;
  style: CSSProperties;
}

type Rgb = readonly [number, number, number];

interface GradientMood {
  start: Rgb;
  mid: Rgb;
  end: Rgb;
}

const VALUE_BANKS: Record<VariableKey, string[]> = {
  whatHow: [
    "participatory cultural strategy",
    "creative producing frameworks",
    "public-facing narrative systems",
    "curatorial facilitation",
    "workshops and situated activations",
    "emerging technology translation",
    "interdisciplinary creative practice",
    "field-tested cultural programs",
    "collective design processes",
    "public engagement formats",
  ],
  who: [
    "creative communities",
    "impact-oriented institutions",
    "community organizations",
    "public-facing arts organizations",
    "academic institutions",
    "cultural institutions",
    "learners and students",
    "innovation institutions",
    "conveners",
    "artists and creatives",
    "early collaborators and alumni",
  ],
  why: [
    "deeper audience engagement",
    "public cultural connection",
    "equitable creative access",
    "shared creative momentum",
    "legible emerging worlds",
    "stronger collective imagination",
    "clearer cultural participation",
    "more generous public programs",
    "trusted creative collaboration",
  ],
};

const CATEGORY_ORDER: VariableKey[] = ["whatHow", "who", "why"];
const ACCENT_COLORS = ["#c65324", "#147f73", "#6b5bd6", "#9c6b00"];
const BRAND_GRADIENT_MOODS: GradientMood[] = [
  {
    start: [255, 255, 255],
    mid: [183, 239, 229],
    end: [218, 215, 255],
  },
  {
    start: [255, 252, 243],
    mid: [255, 199, 165],
    end: [255, 237, 167],
  },
  {
    start: [253, 251, 255],
    mid: [219, 216, 255],
    end: [255, 193, 172],
  },
];
const X_STEP_PX = 190;
const Y_STEP_PX = 150;
const CHANGE_COOLDOWN_MS = 1800;
const REVEAL_VIDEO_PATH = `${import.meta.env.BASE_URL}kaleidoscope-reveal.mp4`;
const MEDIA_FRAGMENTS: MediaFragment[] = [
  {
    key: "square-room",
    label: "Square footage fragment",
    startAt: 0.6,
    endAt: 1.8,
    objectPosition: "57% 48%",
    delay: "0s",
    style: {
      top: "clamp(6.75rem, 15vh, 9rem)",
      right: "clamp(11rem, 34vw, 28rem)",
      width: "clamp(7.5rem, 16vw, 14rem)",
      aspectRatio: "1 / 1",
    },
  },
  {
    key: "horizontal-room",
    label: "Horizontal footage fragment",
    startAt: 28,
    endAt: 29.4,
    objectPosition: "50% 52%",
    delay: "-12s",
    style: {
      left: "clamp(1.25rem, 8vw, 7rem)",
      bottom: "clamp(3.25rem, 9vh, 7rem)",
      width: "clamp(11.5rem, 28vw, 22rem)",
      aspectRatio: "16 / 9",
    },
  },
  {
    key: "vertical-conversation",
    label: "Vertical footage fragment",
    startAt: 44,
    endAt: 45.6,
    objectPosition: "52% 46%",
    delay: "-6s",
    style: {
      top: "clamp(18rem, 45vh, 28rem)",
      right: "clamp(12rem, 34vw, 32rem)",
      width: "clamp(7rem, 13vw, 12rem)",
      aspectRatio: "3 / 4",
    },
  },
];
const MISSION_BASE_FONT_SIZE_PX = 32;
const MISSION_MIN_FONT_SIZE_PX = 15;
const MISSION_LINE_GAP_EM = 0.2;
const MISSION_INTRO_LINE = "An assembly of creative producers specializing in";
const MISSION_WORKING_LINE = "working toward";
const MISSION_ANCHOR_WORD = "for";

const MENU_SECTIONS: MenuSectionContent[] = [
  {
    key: "about",
    label: "About",
  },
  {
    key: "lenses",
    label: "Lenses",
  },
  {
    key: "works",
    label: "Works",
  },
  {
    key: "contact",
    label: "Contact",
  },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function positiveMod(value: number, length: number): number {
  return ((value % length) + length) % length;
}

function mixRgb(from: Rgb, to: Rgb, amount: number): Rgb {
  const t = Math.max(0, Math.min(1, amount));
  return [
    Math.round(lerp(from[0], to[0], t)),
    Math.round(lerp(from[1], to[1], t)),
    Math.round(lerp(from[2], to[2], t)),
  ];
}

function rgbVariable(value: Rgb): string {
  return `${value[0]} ${value[1]} ${value[2]}`;
}

function gradientMoodForY(y: number): GradientMood {
  const clampedY = Math.max(0, Math.min(1, y));
  const scaled = clampedY * (BRAND_GRADIENT_MOODS.length - 1);
  const index = Math.min(Math.floor(scaled), BRAND_GRADIENT_MOODS.length - 2);
  const amount = scaled - index;
  const from = BRAND_GRADIENT_MOODS[index];
  const to = BRAND_GRADIENT_MOODS[index + 1];

  return {
    start: mixRgb(from.start, to.start, amount),
    mid: mixRgb(from.mid, to.mid, amount),
    end: mixRgb(from.end, to.end, amount),
  };
}

export default function Home() {
  const smoothX = useRef(0.38);
  const smoothY = useRef(0.42);
  const targetX = useRef(0.38);
  const targetY = useRef(0.42);
  const hasExplored = useRef(false);
  const rafRef = useRef<number | null>(null);
  const motionLayerRef = useRef<HTMLDivElement | null>(null);
  const previousValuesRef = useRef<VariableState>({
    whatHow: 0,
    who: 1,
    why: 4,
  });
  const lastBucketRef = useRef({ x: -1, y: -1 });
  const lastChangeAtRef = useRef(0);
  const viewportRef = useRef({ width: 1440, height: 900 });

  const [indices, setIndices] = useState<VariableState>({
    whatHow: 0,
    who: 1,
    why: 4,
  });
  const [locks, setLocks] = useState<LockState>({
    whatHow: null,
    who: null,
    why: null,
  });
  const [accentIndex, setAccentIndex] = useState(0);
  const [activeMenuSection, setActiveMenuSection] =
    useState<MenuSectionKey>("about");

  const updateMotionVariables = useCallback(
    (normalisedX: number, normalisedY: number) => {
      const x = Math.max(0, Math.min(1, normalisedX));
      const y = Math.max(0, Math.min(1, normalisedY));
      const layer = motionLayerRef.current;
      if (!layer) return;

      const mood = gradientMoodForY(y);

      layer.style.setProperty("--gradient-start", rgbVariable(mood.start));
      layer.style.setProperty("--gradient-mid", rgbVariable(mood.mid));
      layer.style.setProperty("--gradient-end", rgbVariable(mood.end));
      layer.style.setProperty("--gradient-y", `${18 + y * 64}%`);
      layer.style.setProperty("--pixel-size", `${Math.round(18 - x * 11)}px`);
      layer.style.setProperty("--pixel-opacity", `${0.022 + x * 0.06}`);
      layer.style.setProperty("--fragment-saturate", `${0.26 + y * 0.12}`);
      layer.style.setProperty("--fragment-brightness", `${0.9 + x * 0.08}`);
      layer.style.setProperty("--fragment-contrast", `${0.82 + x * 0.1}`);
    },
    [],
  );

  const updateActiveValues = useCallback(() => {
    const viewportWidth = Math.max(viewportRef.current.width, 1);
    const viewportHeight = Math.max(viewportRef.current.height, 1);
    const bucketX = Math.floor((smoothX.current * viewportWidth) / X_STEP_PX);
    const bucketY = Math.floor((smoothY.current * viewportHeight) / Y_STEP_PX);
    const previousBucket = lastBucketRef.current;
    const now = Date.now();

    if (bucketX === previousBucket.x && bucketY === previousBucket.y) return;
    if (now - lastChangeAtRef.current < CHANGE_COOLDOWN_MS) return;

    lastBucketRef.current = { x: bucketX, y: bucketY };
    lastChangeAtRef.current = now;

    const next = {
      whatHow: positiveMod(bucketX + bucketY, VALUE_BANKS.whatHow.length),
      who: positiveMod(bucketX * 3 + bucketY, VALUE_BANKS.who.length),
      why: positiveMod(bucketX * 2 + bucketY * 3, VALUE_BANKS.why.length),
    };
    const previous = previousValuesRef.current;
    const changed = CATEGORY_ORDER.some(
      (category) => next[category] !== previous[category],
    );

    if (changed) {
      previousValuesRef.current = next;
      setIndices(next);
      setAccentIndex((value) => (value + 1) % ACCENT_COLORS.length);

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(8);
      }
    }
  }, []);

  useEffect(() => {
    const loop = (time: number) => {
      if (!hasExplored.current) {
        targetX.current = 0.43 + Math.sin(time / 1800) * 0.2;
        targetY.current = 0.47 + Math.cos(time / 2300) * 0.18;
      }

      smoothX.current = lerp(smoothX.current, targetX.current, 0.045);
      smoothY.current = lerp(smoothY.current, targetY.current, 0.045);
      updateMotionVariables(smoothX.current, smoothY.current);
      updateActiveValues();

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [updateActiveValues, updateMotionVariables]);

  useEffect(() => {
    viewportRef.current = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    lastBucketRef.current = {
      x: Math.floor((smoothX.current * window.innerWidth) / X_STEP_PX),
      y: Math.floor((smoothY.current * window.innerHeight) / Y_STEP_PX),
    };
    updateMotionVariables(targetX.current, targetY.current);

    const onResize = () => {
      viewportRef.current = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      lastBucketRef.current = {
        x: Math.floor((smoothX.current * window.innerWidth) / X_STEP_PX),
        y: Math.floor((smoothY.current * window.innerHeight) / Y_STEP_PX),
      };
    };

    const onMove = (event: MouseEvent) => {
      hasExplored.current = true;
      targetX.current = event.clientX / window.innerWidth;
      targetY.current = event.clientY / window.innerHeight;
      updateMotionVariables(targetX.current, targetY.current);
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      hasExplored.current = true;
      targetX.current = touch.clientX / window.innerWidth;
      targetY.current = touch.clientY / window.innerHeight;
      updateMotionVariables(targetX.current, targetY.current);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [updateMotionVariables]);

  const activeAccent = ACCENT_COLORS[accentIndex];
  const currentValues = {
    whatHow: locks.whatHow ?? VALUE_BANKS.whatHow[indices.whatHow],
    who: locks.who ?? VALUE_BANKS.who[indices.who],
    why: locks.why ?? VALUE_BANKS.why[indices.why],
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
      className="relative min-h-screen overflow-hidden bg-[#fffdf8] text-[#211d17]"
    >
      <div
        aria-hidden
        ref={motionLayerRef}
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        style={{
          ["--gradient-start" as string]: "255 252 243",
          ["--gradient-mid" as string]: "255 199 165",
          ["--gradient-end" as string]: "255 237 167",
          ["--gradient-y" as string]: "48%",
          ["--pixel-size" as string]: "14px",
          ["--pixel-opacity" as string]: "0.04",
          ["--fragment-saturate" as string]: "0.34",
          ["--fragment-brightness" as string]: "0.94",
          ["--fragment-contrast" as string]: "0.9",
        }}
      >
        <EditorialMediaField />
      </div>

      <div className="pointer-events-none fixed inset-0 z-[1] bg-[linear-gradient(180deg,rgba(255,255,255,0.26),rgba(255,252,246,0.5))]" />

      <div className="relative z-10 flex min-h-screen flex-col px-5 py-5 sm:px-7 md:px-10 md:py-8">
        <header className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 bg-[#ff6737]" />
            <Link
              href="/"
              className="text-[0.92rem] font-semibold text-[#211d17]"
            >
              Alchemy Unlimited
            </Link>
          </div>

          <nav className="hidden items-center gap-5 md:flex">
            {MENU_SECTIONS.map((section) => {
              const isActive = section.key === activeMenuSection;

              return (
                <Link
                  key={section.key}
                  href={`/${section.key}`}
                  onMouseEnter={() => setActiveMenuSection(section.key)}
                  onFocus={() => setActiveMenuSection(section.key)}
                  className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-150"
                  style={{
                    color: isActive ? "#211d17" : "rgba(33,29,23,0.48)",
                  }}
                >
                  {section.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <section className="grid min-w-0 flex-1 items-center gap-10 py-14 lg:py-12">
          <div className="w-full min-w-0 max-w-[58rem] lg:-translate-y-16 xl:-translate-y-20">
            <p className="mb-5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[rgba(33,29,23,0.52)]">
              Mission
            </p>
            <StatementParagraph
              whatHow={currentValues.whatHow}
              who={currentValues.who}
              why={currentValues.why}
              locks={locks}
              accent={activeAccent}
              onToggleLock={toggleLock}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function EditorialMediaField() {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, rgb(255 255 255 / 1) 0%, rgb(255 252 246 / 0.96) 42%, rgb(var(--gradient-start) / 0.9) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgb(var(--gradient-mid) / 0.42) 0%, transparent 44%, rgb(var(--gradient-end) / 0.4) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgb(var(--gradient-mid) / 0.32) var(--gradient-y), rgb(var(--gradient-end) / 0.22) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(33,29,23,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(33,29,23,0.12) 1px, transparent 1px)",
          backgroundSize: "var(--pixel-size) var(--pixel-size)",
          opacity: "var(--pixel-opacity)",
        }}
      />
      {MEDIA_FRAGMENTS.map((fragment) => (
        <MediaFragmentClip key={fragment.key} fragment={fragment} />
      ))}
    </>
  );
}

interface MediaFragmentClipProps {
  fragment: MediaFragment;
}

function MediaFragmentClip({ fragment }: MediaFragmentClipProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let intervalId = 0;

    const playSegment = () => {
      if (
        video.currentTime < fragment.startAt ||
        video.currentTime >= fragment.endAt
      ) {
        video.currentTime = fragment.startAt;
      }

      void video.play().catch(() => {
        // Browser autoplay policies can delay playback; muted inline video resumes once allowed.
      });
    };

    const onLoadedMetadata = () => {
      video.currentTime = fragment.startAt;
      playSegment();
    };

    const onTimeUpdate = () => {
      if (video.currentTime >= fragment.endAt) {
        video.currentTime = fragment.startAt;
      }
    };

    if (video.readyState >= 1) {
      onLoadedMetadata();
    } else {
      video.addEventListener("loadedmetadata", onLoadedMetadata, {
        once: true,
      });
    }

    video.addEventListener("timeupdate", onTimeUpdate);
    intervalId = window.setInterval(playSegment, 360);

    return () => {
      window.clearInterval(intervalId);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [fragment.endAt, fragment.startAt]);

  return (
    <div
      className={`alchemy-media-fragment alchemy-media-fragment--${fragment.key} ${
        fragment.key === MEDIA_FRAGMENTS[0].key
          ? "alchemy-media-fragment-primary"
          : ""
      }`}
      style={{
        ...fragment.style,
        ["--fragment-delay" as string]: fragment.delay,
      }}
    >
      <video
        ref={videoRef}
        aria-label={fragment.label}
        muted
        playsInline
        preload="metadata"
        src={REVEAL_VIDEO_PATH}
        style={{ objectPosition: fragment.objectPosition }}
      />
    </div>
  );
}

interface TypedSlotProps {
  text: string;
  accent: string;
  locked?: boolean;
  category: VariableKey;
  onToggleLock: (category: VariableKey, value: string) => void;
}

function TypedSlot({
  text,
  accent,
  locked = false,
  category,
  onToggleLock,
}: TypedSlotProps) {
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

    while (
      prefixLength < limit &&
      current[prefixLength] === text[prefixLength]
    ) {
      prefixLength += 1;
    }

    let deletingText = current;

    const deleteStep = () => {
      if (frameRef.current !== currentFrame) return;

      if (deletingText.length > prefixLength) {
        deletingText = deletingText.slice(0, -1);
        setDisplayText(deletingText);
        timerRef.current = setTimeout(deleteStep, 6);
        return;
      }

      let typedLength = prefixLength;
      const typeStep = () => {
        if (frameRef.current !== currentFrame) return;

        if (typedLength < text.length) {
          typedLength += 1;
          setDisplayText(text.slice(0, typedLength));
          timerRef.current = setTimeout(typeStep, 7);
        }
      };

      timerRef.current = setTimeout(typeStep, 18);
    };

    timerRef.current = setTimeout(deleteStep, 10);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text]);

  return (
    <button
      type="button"
      onClick={() => onToggleLock(category, text)}
      aria-pressed={locked}
      className="inline align-baseline font-bold transition-colors duration-150"
      style={{
        color: locked ? "#211d17" : accent,
        backgroundColor: "transparent",
        textShadow: "0 1px 12px rgba(255, 255, 255, 0.34)",
        textAlign: "inherit",
      }}
    >
      {displayText}
      <span
        className="ml-[1px] inline-block h-[0.82em] w-px translate-y-[2px] align-baseline animate-pulse"
        style={{ backgroundColor: locked ? "#211d17" : accent }}
      />
    </button>
  );
}

function useMissionFontSize(
  whatHowText: string,
  whoText: string,
  whyText: string,
) {
  const containerRef = useRef<HTMLHeadingElement | null>(null);
  const introMeasureRef = useRef<HTMLSpanElement | null>(null);
  const whatHowMeasureRef = useRef<HTMLSpanElement | null>(null);
  const anchorMeasureRef = useRef<HTMLSpanElement | null>(null);
  const whoMeasureRef = useRef<HTMLSpanElement | null>(null);
  const workingMeasureRef = useRef<HTMLSpanElement | null>(null);
  const whyMeasureRef = useRef<HTMLSpanElement | null>(null);
  const [fontSize, setFontSize] = useState(MISSION_BASE_FONT_SIZE_PX);

  useEffect(() => {
    const container = containerRef.current;
    const introMeasure = introMeasureRef.current;
    const whatHowMeasure = whatHowMeasureRef.current;
    const anchorMeasure = anchorMeasureRef.current;
    const whoMeasure = whoMeasureRef.current;
    const workingMeasure = workingMeasureRef.current;
    const whyMeasure = whyMeasureRef.current;

    if (
      !container ||
      !introMeasure ||
      !whatHowMeasure ||
      !anchorMeasure ||
      !whoMeasure ||
      !workingMeasure ||
      !whyMeasure
    ) {
      return;
    }

    let frameId = 0;

    const update = () => {
      const containerWidth = container.getBoundingClientRect().width;
      const widestLine = Math.max(
        introMeasure.getBoundingClientRect().width,
        whatHowMeasure.getBoundingClientRect().width,
        anchorMeasure.getBoundingClientRect().width,
        whoMeasure.getBoundingClientRect().width,
        workingMeasure.getBoundingClientRect().width,
        whyMeasure.getBoundingClientRect().width,
        1,
      );
      const scale = Math.min(1, containerWidth / widestLine);
      const nextFontSize = Math.max(
        MISSION_MIN_FONT_SIZE_PX,
        Math.min(MISSION_BASE_FONT_SIZE_PX, MISSION_BASE_FONT_SIZE_PX * scale),
      );

      setFontSize((current) =>
        Math.abs(current - nextFontSize) > 0.2 ? nextFontSize : current,
      );
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(update);
    };

    scheduleUpdate();

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(scheduleUpdate);
    observer?.observe(container);
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer?.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [whatHowText, whoText, whyText]);

  return {
    fontSize,
    containerRef,
    introMeasureRef,
    whatHowMeasureRef,
    anchorMeasureRef,
    whoMeasureRef,
    workingMeasureRef,
    whyMeasureRef,
  };
}

interface MeasurementTextProps {
  children: ReactNode;
  measureRef: RefObject<HTMLSpanElement | null>;
}

function MeasurementText({ children, measureRef }: MeasurementTextProps) {
  return (
    <span
      ref={measureRef}
      aria-hidden="true"
      className="pointer-events-none invisible absolute left-0 top-0 whitespace-nowrap font-bold"
      style={{ fontSize: `${MISSION_BASE_FONT_SIZE_PX}px` }}
    >
      {children}
    </span>
  );
}

interface StatementParagraphProps {
  whatHow: string;
  who: string;
  why: string;
  locks: LockState;
  accent: string;
  onToggleLock: (category: VariableKey, value: string) => void;
}

function StatementParagraph({
  whatHow,
  who,
  why,
  locks,
  accent,
  onToggleLock,
}: StatementParagraphProps) {
  const {
    fontSize,
    containerRef,
    introMeasureRef,
    whatHowMeasureRef,
    anchorMeasureRef,
    whoMeasureRef,
    workingMeasureRef,
    whyMeasureRef,
  } = useMissionFontSize(whatHow, `${who},`, `${why}.`);

  return (
    <h1
      ref={containerRef}
      data-testid="statement"
      className="relative flex w-[calc(100vw_-_2.5rem)] max-w-[42rem] flex-col items-start text-left font-semibold leading-[1.04] text-[#211d17] sm:w-[calc(100vw_-_3.5rem)] md:w-full"
      style={{ fontSize: `${fontSize}px`, gap: `${MISSION_LINE_GAP_EM}em` }}
    >
      <MeasurementText measureRef={introMeasureRef}>
        {MISSION_INTRO_LINE}
      </MeasurementText>
      <MeasurementText measureRef={whatHowMeasureRef}>
        {whatHow}
      </MeasurementText>
      <MeasurementText measureRef={anchorMeasureRef}>
        {MISSION_ANCHOR_WORD}
      </MeasurementText>
      <MeasurementText measureRef={whoMeasureRef}>{who},</MeasurementText>
      <MeasurementText measureRef={workingMeasureRef}>
        {MISSION_WORKING_LINE}
      </MeasurementText>
      <MeasurementText measureRef={whyMeasureRef}>{why}.</MeasurementText>
      <span className="block whitespace-nowrap">{MISSION_INTRO_LINE}</span>
      <span className="block whitespace-nowrap">
        <TypedSlot
          text={whatHow}
          accent={accent}
          category="whatHow"
          locked={Boolean(locks.whatHow)}
          onToggleLock={onToggleLock}
        />
      </span>
      <span className="block whitespace-nowrap">{MISSION_ANCHOR_WORD}</span>
      <span className="block whitespace-nowrap">
        <TypedSlot
          text={who}
          accent={accent}
          category="who"
          locked={Boolean(locks.who)}
          onToggleLock={onToggleLock}
        />
        {","}
      </span>
      <span className="block whitespace-nowrap">{MISSION_WORKING_LINE}</span>
      <span className="block whitespace-nowrap">
        <TypedSlot
          text={why}
          accent={accent}
          category="why"
          locked={Boolean(locks.why)}
          onToggleLock={onToggleLock}
        />
        {"."}
      </span>
    </h1>
  );
}
