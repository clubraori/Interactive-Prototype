import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
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

interface NotePosition {
  x: number;
  y: number;
}

interface NoteSurfaceState {
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
}

interface MenuSectionContent {
  key: MenuSectionKey;
  label: string;
  eyebrow: string;
  body: string;
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
const ACCENT_COLORS = ["#ff8a47", "#55d6c2", "#9f94ff", "#ffd35a"];
const X_STEP_PX = 190;
const Y_STEP_PX = 150;
const CHANGE_COOLDOWN_MS = 1800;
const DESKTOP_NOTE_BREAKPOINT = 1024;
const NOTE_EDGE_PADDING = 24;
const REVEAL_VIDEO_PATH = `${import.meta.env.BASE_URL}kaleidoscope-reveal.mp4`;

const DEFAULT_NOTE_SURFACE: NoteSurfaceState = {
  rotateX: -2,
  rotateY: 4,
  rotateZ: -2.2,
  scale: 1,
  shadowX: 0,
  shadowY: 18,
  shadowBlur: 36,
};

const MENU_SECTIONS: MenuSectionContent[] = [
  {
    key: "about",
    label: "About",
    eyebrow: "Alchemy Unlimited",
    body:
      "A strategy-led creative studio building participatory systems, public-facing formats, and narrative structures for culture, learning, and emerging technology.",
  },
  {
    key: "lenses",
    label: "Lenses",
    eyebrow: "Multiple ways of seeing",
    body:
      "The page behaves like the practice: a field of lenses, filters, and layered readings that turn one set of material into many possible forms.",
  },
  {
    key: "works",
    label: "Works",
    eyebrow: "Lightweight portfolio",
    body:
      "A proof layer for projects where the work begins to read as Alchemy: polished, verifiable, and open enough for lightweight case-study treatment.",
  },
  {
    key: "contact",
    label: "Contact",
    eyebrow: "Outside perspective",
    body:
      "Regular third-party conversations help test whether Alchemy is legible beyond the collaboration and reveal what the work is asking to become.",
  },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function positiveMod(value: number, length: number): number {
  return ((value % length) + length) % length;
}

export default function Home() {
  const smoothX = useRef(0.38);
  const smoothY = useRef(0.42);
  const targetX = useRef(0.38);
  const targetY = useRef(0.42);
  const hasExplored = useRef(false);
  const rafRef = useRef<number | null>(null);
  const motionLayerRef = useRef<HTMLDivElement | null>(null);
  const stickyNoteRef = useRef<HTMLDivElement | null>(null);
  const stickyNoteDragRef = useRef({
    active: false,
    offsetX: 0,
    offsetY: 0,
  });
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
  const [pulseKey, setPulseKey] = useState(0);
  const [activeMenuSection, setActiveMenuSection] = useState<MenuSectionKey>("about");
  const [isDesktopNote, setIsDesktopNote] = useState(false);
  const [isDraggingNote, setIsDraggingNote] = useState(false);
  const [stickyNotePosition, setStickyNotePosition] = useState<NotePosition>({
    x: 0,
    y: 112,
  });
  const [stickyNoteSurface, setStickyNoteSurface] =
    useState<NoteSurfaceState>(DEFAULT_NOTE_SURFACE);

  const updateMotionVariables = useCallback((normalisedX: number, normalisedY: number) => {
    const x = Math.max(0, Math.min(1, normalisedX));
    const y = Math.max(0, Math.min(1, normalisedY));
    const layer = motionLayerRef.current;
    if (!layer) return;

    layer.style.setProperty("--clarity-x", `${x * 100}%`);
    layer.style.setProperty("--lens-x", `${x * 100}%`);
    layer.style.setProperty("--lens-y", `${y * 100}%`);
    layer.style.setProperty("--pixel-size", `${Math.round(5 + y * 19)}px`);
    layer.style.setProperty("--pixel-opacity", `${0.08 + y * 0.28}`);
    layer.style.setProperty("--scan-opacity", `${0.04 + y * 0.18}`);
    layer.style.setProperty("--hue-rotate", `${Math.round((y - 0.5) * 48)}deg`);
    layer.style.setProperty("--saturate", `${0.76 + y * 0.72}`);
    layer.style.setProperty("--contrast", `${0.94 + x * 0.16}`);
    layer.style.setProperty("--warm-opacity", `${Math.max(0, y - 0.22) * 0.42}`);
    layer.style.setProperty("--cool-opacity", `${Math.max(0, 0.78 - y) * 0.34}`);
  }, []);

  const clampStickyNotePosition = useCallback((position: NotePosition): NotePosition => {
    if (typeof window === "undefined") return position;

    const noteRect = stickyNoteRef.current?.getBoundingClientRect();
    const noteWidth = noteRect?.width ?? 288;
    const noteHeight = noteRect?.height ?? 360;
    const maxX = Math.max(NOTE_EDGE_PADDING, window.innerWidth - noteWidth - NOTE_EDGE_PADDING);
    const maxY = Math.max(NOTE_EDGE_PADDING, window.innerHeight - noteHeight - NOTE_EDGE_PADDING);

    return {
      x: Math.min(Math.max(position.x, NOTE_EDGE_PADDING), maxX),
      y: Math.min(Math.max(position.y, NOTE_EDGE_PADDING), maxY),
    };
  }, []);

  const updateStickyNoteSurface = useCallback(
    (clientX: number, clientY: number, dragging = false) => {
      const rect = stickyNoteRef.current?.getBoundingClientRect();
      if (!rect) return;

      const normalisedX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normalisedY = ((clientY - rect.top) / rect.height) * 2 - 1;
      const clampedX = Math.max(-1, Math.min(1, normalisedX));
      const clampedY = Math.max(-1, Math.min(1, normalisedY));

      setStickyNoteSurface({
        rotateX: -clampedY * (dragging ? 10 : 6),
        rotateY: clampedX * (dragging ? 11 : 7),
        rotateZ: clampedX * (dragging ? 3.2 : 1.8) - 1.5,
        scale: dragging ? 1.018 : 1.006,
        shadowX: clampedX * (dragging ? 28 : 18),
        shadowY: 18 + clampedY * (dragging ? 16 : 10),
        shadowBlur: dragging ? 44 : 34,
      });
    },
    [],
  );

  const resetStickyNoteSurface = useCallback(() => {
    setStickyNoteSurface(DEFAULT_NOTE_SURFACE);
  }, []);

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
    const changed = CATEGORY_ORDER.some((category) => next[category] !== previous[category]);

    if (changed) {
      previousValuesRef.current = next;
      setIndices(next);
      setAccentIndex((value) => (value + 1) % ACCENT_COLORS.length);
      setPulseKey((value) => value + 1);

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
    setIsDesktopNote(window.innerWidth >= DESKTOP_NOTE_BREAKPOINT);
    setStickyNotePosition(
      clampStickyNotePosition({
        x: window.innerWidth - 330,
        y: 118,
      }),
    );

    const onResize = () => {
      viewportRef.current = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      lastBucketRef.current = {
        x: Math.floor((smoothX.current * window.innerWidth) / X_STEP_PX),
        y: Math.floor((smoothY.current * window.innerHeight) / Y_STEP_PX),
      };
      setIsDesktopNote(window.innerWidth >= DESKTOP_NOTE_BREAKPOINT);
      setStickyNotePosition((current) =>
        clampStickyNotePosition(
          current.x === 0
            ? {
                x: window.innerWidth - 330,
                y: 118,
              }
            : current,
        ),
      );
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
  }, [clampStickyNotePosition, updateMotionVariables]);

  useEffect(() => {
    if (!isDesktopNote) {
      stickyNoteDragRef.current.active = false;
      setIsDraggingNote(false);
      resetStickyNoteSurface();
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!stickyNoteDragRef.current.active) return;

      const nextPosition = clampStickyNotePosition({
        x: event.clientX - stickyNoteDragRef.current.offsetX,
        y: event.clientY - stickyNoteDragRef.current.offsetY,
      });

      setStickyNotePosition(nextPosition);
      updateStickyNoteSurface(event.clientX, event.clientY, true);
    };

    const endDrag = () => {
      if (!stickyNoteDragRef.current.active) return;
      stickyNoteDragRef.current.active = false;
      setIsDraggingNote(false);
      resetStickyNoteSurface();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [
    clampStickyNotePosition,
    isDesktopNote,
    resetStickyNoteSurface,
    updateStickyNoteSurface,
  ]);

  const activeAccent = ACCENT_COLORS[accentIndex];
  const activeMenuContent =
    MENU_SECTIONS.find((section) => section.key === activeMenuSection) ?? MENU_SECTIONS[0];
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

  const startStickyNoteDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDesktopNote || !stickyNoteRef.current) return;

    const rect = stickyNoteRef.current.getBoundingClientRect();
    stickyNoteDragRef.current = {
      active: true,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    setIsDraggingNote(true);
    updateStickyNoteSurface(event.clientX, event.clientY, true);
  };

  return (
    <main
      style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
      className="relative min-h-screen overflow-hidden bg-[#11100f] text-[#f8f4ea]"
    >
      <div
        aria-hidden
        ref={motionLayerRef}
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        style={{
          ["--clarity-x" as string]: "38%",
          ["--lens-x" as string]: "38%",
          ["--lens-y" as string]: "42%",
          ["--pixel-size" as string]: "12px",
          ["--pixel-opacity" as string]: "0.16",
          ["--scan-opacity" as string]: "0.08",
          ["--hue-rotate" as string]: "0deg",
          ["--saturate" as string]: "1",
          ["--contrast" as string]: "1",
          ["--warm-opacity" as string]: "0.12",
          ["--cool-opacity" as string]: "0.18",
        }}
      >
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          src={REVEAL_VIDEO_PATH}
          style={{
            filter:
              "blur(11px) grayscale(0.2) hue-rotate(var(--hue-rotate)) saturate(var(--saturate)) contrast(var(--contrast)) brightness(0.72)",
            transform: "scale(1.05)",
          }}
        />
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{
            width: "var(--clarity-x)",
            WebkitMaskImage:
              "linear-gradient(90deg, #000 0%, #000 calc(100% - 96px), transparent 100%)",
            maskImage:
              "linear-gradient(90deg, #000 0%, #000 calc(100% - 96px), transparent 100%)",
          }}
        >
          <video
            className="h-full max-w-none object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            src={REVEAL_VIDEO_PATH}
            style={{
              width: "100vw",
              filter:
                "hue-rotate(var(--hue-rotate)) saturate(calc(var(--saturate) + 0.24)) contrast(calc(var(--contrast) + 0.06)) brightness(0.9)",
            }}
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(28,117,128,var(--cool-opacity)) 0%, transparent 48%, rgba(255,103,55,var(--warm-opacity)) 100%)",
            mixBlendMode: "screen",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
            backgroundSize: "var(--pixel-size) var(--pixel-size)",
            opacity: "var(--pixel-opacity)",
            mixBlendMode: "overlay",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(180deg, transparent 0, transparent 5px, rgba(255,255,255,0.22) 6px)",
            opacity: "var(--scan-opacity)",
            mixBlendMode: "soft-light",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at var(--lens-x) var(--lens-y), rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.12) 9%, transparent 24%), linear-gradient(90deg, rgba(17,16,15,0.1) 0%, rgba(17,16,15,0.36) 100%)",
          }}
        />
        <div
          className="absolute inset-y-0 w-px transition-[background-color,box-shadow] duration-150 ease-out"
          style={{
            left: "calc(var(--clarity-x) - 0.5px)",
            backgroundColor: pulseKey % 2 === 0 ? "rgba(248,244,234,0.34)" : activeAccent,
            boxShadow:
              pulseKey % 2 === 0
                ? "0 0 26px rgba(248,244,234,0.18)"
                : `0 0 36px ${activeAccent}`,
          }}
        />
      </div>

      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_42%_34%,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,rgba(17,16,15,0.24),rgba(17,16,15,0.7))]" />

      <div className="relative z-10 flex min-h-screen flex-col px-5 py-5 sm:px-7 md:px-10 md:py-8">
        <header className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 bg-[#ff6737]" />
            <Link href="/" className="text-[0.92rem] font-semibold text-[#fffaf0]">
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
                    color: isActive ? "#fffaf0" : "rgba(255,250,240,0.58)",
                  }}
                >
                  {section.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <section className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_18rem] lg:py-12">
          <div className="max-w-[58rem]">
            <p className="mb-5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[rgba(255,250,240,0.62)]">
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

          <div className="lg:hidden">
            <MenuNoteCard
              activeMenuSection={activeMenuSection}
              activeMenuContent={activeMenuContent}
              setActiveMenuSection={setActiveMenuSection}
            />
          </div>
        </section>
      </div>

      {isDesktopNote ? (
        <div
          ref={stickyNoteRef}
          className="fixed z-20 hidden w-[18rem] select-none lg:block"
          style={{
            left: stickyNotePosition.x,
            top: stickyNotePosition.y,
            transform: `perspective(1400px) rotateX(${stickyNoteSurface.rotateX}deg) rotateY(${stickyNoteSurface.rotateY}deg) rotateZ(${stickyNoteSurface.rotateZ}deg) scale(${stickyNoteSurface.scale})`,
            transformStyle: "preserve-3d",
            filter: isDraggingNote ? "saturate(1.04)" : "none",
          }}
          onPointerEnter={(event) =>
            updateStickyNoteSurface(event.clientX, event.clientY, isDraggingNote)
          }
          onPointerMove={(event) => {
            if (isDraggingNote) return;
            updateStickyNoteSurface(event.clientX, event.clientY, false);
          }}
          onPointerLeave={() => {
            if (isDraggingNote) return;
            resetStickyNoteSurface();
          }}
        >
          <MenuNoteCard
            activeMenuSection={activeMenuSection}
            activeMenuContent={activeMenuContent}
            setActiveMenuSection={setActiveMenuSection}
            onDragHandlePointerDown={startStickyNoteDrag}
            shadowStyle={{
              boxShadow: `${stickyNoteSurface.shadowX}px ${stickyNoteSurface.shadowY}px ${stickyNoteSurface.shadowBlur}px rgba(73, 60, 18, 0.24), 0 14px 24px rgba(20, 16, 10, 0.16)`,
            }}
          />
        </div>
      ) : null}
    </main>
  );
}

interface MenuNoteCardProps {
  activeMenuSection: MenuSectionKey;
  activeMenuContent: MenuSectionContent;
  setActiveMenuSection: (value: MenuSectionKey) => void;
  onDragHandlePointerDown?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  shadowStyle?: CSSProperties;
}

function MenuNoteCard({
  activeMenuSection,
  activeMenuContent,
  setActiveMenuSection,
  onDragHandlePointerDown,
  shadowStyle,
}: MenuNoteCardProps) {
  return (
    <div
      data-testid="sticky-note"
      className="relative border border-[rgba(124,104,40,0.16)] bg-[rgba(252,229,145,0.96)] p-4 text-[#2d271d] backdrop-blur-sm md:p-5"
      style={{
        boxShadow: "0 16px 30px rgba(20, 16, 10, 0.18)",
        ...shadowStyle,
      }}
    >
      <span className="absolute left-1/2 top-3 h-5 w-24 -translate-x-1/2 rounded-[3px] bg-[rgba(247,236,192,0.78)] shadow-[0_1px_2px_rgba(112,96,44,0.08)]" />
      <div
        className={`mb-4 flex items-center justify-between pt-4 ${
          onDragHandlePointerDown ? "cursor-grab touch-none active:cursor-grabbing" : ""
        }`}
        onPointerDown={onDragHandlePointerDown}
      >
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#675c35]">
          Studio note
        </p>
        <span className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#8f8256]">
          {activeMenuContent.label}
        </span>
      </div>

      <div className="space-y-1">
        {MENU_SECTIONS.map((section) => {
          const isActive = section.key === activeMenuSection;

          return (
            <Link
              key={section.key}
              href={`/${section.key}`}
              onMouseEnter={() => setActiveMenuSection(section.key)}
              onFocus={() => setActiveMenuSection(section.key)}
              className="flex w-full items-center justify-between border border-transparent px-2 py-2 text-left transition-colors duration-150 hover:bg-white/45"
              style={{
                backgroundColor: isActive ? "rgba(255, 255, 255, 0.54)" : "transparent",
                borderColor: isActive ? "rgba(103, 92, 53, 0.16)" : "transparent",
              }}
            >
              <span className="text-[0.9rem] text-[#2f2a20]">{section.label}</span>
              <span className="text-[0.68rem] text-[#877b55]">{isActive ? "open" : ""}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-5 border-t border-[rgba(124,104,40,0.16)] pt-4">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#877b55]">
          {activeMenuContent.eyebrow}
        </p>
        <p className="mt-3 text-[0.84rem] leading-[1.62] text-[#3d3729]">
          {activeMenuContent.body}
        </p>
      </div>
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

    while (prefixLength < limit && current[prefixLength] === text[prefixLength]) {
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
        color: locked ? "#fffaf0" : accent,
        backgroundColor: "transparent",
        textShadow: "0 1px 18px rgba(0, 0, 0, 0.24)",
        textAlign: "inherit",
      }}
    >
      {displayText}
      <span
        className="ml-[1px] inline-block h-[0.82em] w-px translate-y-[2px] align-baseline animate-pulse"
        style={{ backgroundColor: locked ? "#fffaf0" : accent }}
      />
    </button>
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
  return (
    <h1
      data-testid="statement"
      className="max-w-[30ch] text-[1.7rem] font-semibold leading-[1.14] text-[#fffaf0] sm:text-[2.25rem] md:text-[2.85rem] lg:text-[3.25rem]"
    >
      An assembly of creative producers specializing in{" "}
      <TypedSlot
        text={whatHow}
        accent={accent}
        category="whatHow"
        locked={Boolean(locks.whatHow)}
        onToggleLock={onToggleLock}
      />{" "}
      <span className="inline-block w-[2.4ch] text-center text-[#fffaf0]">for</span>{" "}
      <TypedSlot
        text={who}
        accent={accent}
        category="who"
        locked={Boolean(locks.who)}
        onToggleLock={onToggleLock}
      />
      {", working toward"}
      <br />
      <TypedSlot
        text={why}
        accent={accent}
        category="why"
        locked={Boolean(locks.why)}
        onToggleLock={onToggleLock}
      />
      {"."}
    </h1>
  );
}
