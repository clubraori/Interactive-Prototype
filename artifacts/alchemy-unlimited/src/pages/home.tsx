import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

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

type MenuSectionKey = "about" | "projects" | "ethos" | "contact";

interface MenuSectionContent {
  key: MenuSectionKey;
  label: string;
  eyebrow: string;
  body: string;
}

interface FeaturedWorkCardData {
  title: string;
  category: string;
  summary: string;
  linkLabel: string;
  color: string;
  accent: "corner" | "pin" | "tape";
}

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
const DESKTOP_NOTE_BREAKPOINT = 1024;
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
      "Alchemy Unlimited is a strategy-led creative studio building participatory systems, public-facing formats, and narrative structures for institutions working across culture, learning, and emerging technology.",
  },
  {
    key: "projects",
    label: "Projects",
    eyebrow: "Selected Work",
    body:
      "Our work spans commissions, workshops, activations, curatorial structures, and experimental formats that help collaborators organise complex ideas into something people can enter, use, and remember.",
  },
  {
    key: "ethos",
    label: "Ethos",
    eyebrow: "Methodology",
    body:
      "We approach each project through care, clarity, and co-authorship: building systems that leave room for audiences, partners, and communities to recognise themselves inside the work.",
  },
  {
    key: "contact",
    label: "Contact",
    eyebrow: "Get In Touch",
    body:
      "We partner with cultural organisations, academic institutions, nonprofits, conveners, and emerging studios that want strategy, creative direction, and public engagement to work as one system.",
  },
];

const STUDIO_MARKERS = [
  "Strategy-led",
  "Participatory",
  "Public-facing",
];

const FEATURED_WORK: FeaturedWorkCardData[] = [
  {
    title: "Institutional Programmes",
    category: "Culture + public engagement",
    summary:
      "Frameworks, workshops, and activations designed to help institutions move from intention into visible public form.",
    linkLabel: "View direction",
    color: "rgba(205, 228, 248, 0.92)",
    accent: "corner",
  },
  {
    title: "Learning Partnerships",
    category: "Education + facilitation",
    summary:
      "Research translation, facilitation, and collaborative structures for organisations shaping learning through experience.",
    linkLabel: "View direction",
    color: "rgba(214, 236, 208, 0.92)",
    accent: "pin",
  },
  {
    title: "Emerging Worlds",
    category: "Prototype + narrative systems",
    summary:
      "Spatial, digital, and interdisciplinary concepts that help new technologies feel legible, human, and culturally grounded.",
    linkLabel: "View direction",
    color: "rgba(224, 216, 247, 0.95)",
    accent: "tape",
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
  const noteStageRef = useRef<HTMLDivElement | null>(null);
  const stickyNoteRef = useRef<HTMLDivElement | null>(null);
  const stickyNoteDragRef = useRef({
    active: false,
    offsetX: 0,
    offsetY: 0,
  });
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
  const [isDesktopNote, setIsDesktopNote] = useState(false);
  const [isDraggingNote, setIsDraggingNote] = useState(false);
  const [stickyNotePosition, setStickyNotePosition] = useState<NotePosition>({
    x: 0,
    y: 0,
  });
  const [stickyNoteSurface, setStickyNoteSurface] =
    useState<NoteSurfaceState>(DEFAULT_NOTE_SURFACE);

  const updateDividerPosition = useCallback((normalisedX: number) => {
    const clamped = Math.max(0, Math.min(1, normalisedX));
    motionLayerRef.current?.style.setProperty("--divider-x", `${clamped * 100}%`);
    motionLayerRef.current?.style.setProperty("--glow-x", `${clamped * 100}%`);
  }, []);

  const clampStickyNotePosition = useCallback((position: NotePosition): NotePosition => {
    const stageRect = noteStageRef.current?.getBoundingClientRect();
    const noteRect = stickyNoteRef.current?.getBoundingClientRect();
    const stageWidth = stageRect?.width ?? 360;
    const stageHeight = stageRect?.height ?? 460;
    const noteWidth = noteRect?.width ?? 304;
    const noteHeight = noteRect?.height ?? 344;
    const innerPadding = 12;
    const maxX = Math.max(innerPadding, stageWidth - noteWidth - innerPadding);
    const maxY = Math.max(innerPadding, stageHeight - noteHeight - innerPadding);

    return {
      x: Math.min(Math.max(position.x, innerPadding), maxX),
      y: Math.min(Math.max(position.y, innerPadding), maxY),
    };
  }, []);

  const getDefaultStickyNotePosition = useCallback((): NotePosition => {
    const stageRect = noteStageRef.current?.getBoundingClientRect();
    const noteRect = stickyNoteRef.current?.getBoundingClientRect();
    const stageWidth = stageRect?.width ?? 360;
    const noteWidth = noteRect?.width ?? 304;

    return clampStickyNotePosition({
      x: Math.max(Math.round((stageWidth - noteWidth) * 0.18), 18),
      y: 28,
    });
  }, [clampStickyNotePosition]);

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
    setIsDesktopNote(window.innerWidth >= DESKTOP_NOTE_BREAKPOINT);
    setStickyNotePosition(getDefaultStickyNotePosition());

    const onResize = () => {
      viewportWidthRef.current = window.innerWidth;
      lastBucketRef.current = Math.floor((smoothX.current * window.innerWidth) / X_STEP_PX);
      updateDividerPosition(targetX.current);
      setIsDesktopNote(window.innerWidth >= DESKTOP_NOTE_BREAKPOINT);
      setStickyNotePosition((current) =>
        current.x === 0 && current.y === 0
          ? getDefaultStickyNotePosition()
          : clampStickyNotePosition(current),
      );
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
  }, [clampStickyNotePosition, getDefaultStickyNotePosition, updateDividerPosition]);

  useEffect(() => {
    if (!isDesktopNote) {
      stickyNoteDragRef.current.active = false;
      setIsDraggingNote(false);
      resetStickyNoteSurface();
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!stickyNoteDragRef.current.active) return;

      const stageRect = noteStageRef.current?.getBoundingClientRect();
      if (!stageRect) return;

      const nextPosition = clampStickyNotePosition({
        x: event.clientX - stageRect.left - stickyNoteDragRef.current.offsetX,
        y: event.clientY - stageRect.top - stickyNoteDragRef.current.offsetY,
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

  useEffect(() => {
    if (!isDesktopNote) return;
    setStickyNotePosition((current) =>
      current.x === 0 && current.y === 0
        ? getDefaultStickyNotePosition()
        : clampStickyNotePosition(current),
    );
  }, [clampStickyNotePosition, getDefaultStickyNotePosition, isDesktopNote]);

  const activeAccent = ACCENT_COLORS[accentIndex];
  const activeMenuContent =
    MENU_SECTIONS.find((section) => section.key === activeMenuSection) ?? MENU_SECTIONS[0];
  const currentValues = {
    what: locks.what ?? VALUE_BANKS.what[indices.what],
    why: locks.why ?? VALUE_BANKS.why[indices.why],
    who: locks.who ?? VALUE_BANKS.who[indices.who],
    how: locks.how ?? VALUE_BANKS.how[indices.how],
  };
  const manifestoEntries = CATEGORY_ORDER.map((category, index) => ({
    key: category,
    number: `0${index + 1}`,
    label: category.toUpperCase(),
    text: currentValues[category],
    color: ACCENT_COLORS[index],
    locked: Boolean(locks[category]),
  }));
  const toggleLock = (category: VariableKey, value: string) => {
    setLocks((current) => ({
      ...current,
      [category]: current[category] === value ? null : value,
    }));
  };
  const startStickyNoteDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDesktopNote || !stickyNoteRef.current || !noteStageRef.current) return;

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
      style={{ fontFamily: "'Inter', 'Avenir Next', 'Helvetica Neue', Arial, sans-serif" }}
      className="relative min-h-screen overflow-hidden bg-[#efe9df] text-[#151311]"
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        ref={motionLayerRef}
        style={{
          ["--divider-x" as string]: "50%",
          ["--glow-x" as string]: "50%",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(243,238,228,0.96) 0%, rgba(236,229,217,0.96) 100%)",
          }}
        />
        <div
          className="absolute inset-y-0 left-0 bg-[rgba(255,255,255,0.74)]"
          style={{ width: "var(--divider-x)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at var(--glow-x) 18%, rgba(255,226,153,0.28) 0%, rgba(255,226,153,0.18) 12%, rgba(255,226,153,0.06) 22%, transparent 38%)",
          }}
        />
        <div
          className="absolute inset-y-0 w-px transition-[background-color,box-shadow] duration-150 ease-out"
          style={{
            left: "calc(var(--divider-x) - 0.5px)",
            backgroundColor:
              dividerFlashKey % 2 === 0 ? "rgba(21,19,17,0.18)" : "rgba(21,19,17,0.34)",
            boxShadow:
              dividerFlashKey % 2 === 0
                ? "0 0 0 transparent"
                : "0 0 18px rgba(21,19,17,0.12)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 py-4 md:px-6 md:py-8">
        <div className="relative overflow-hidden rounded-[30px] border border-[rgba(30,24,17,0.18)] bg-[rgba(249,246,238,0.84)] shadow-[0_24px_90px_rgba(48,38,22,0.12)]">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.44) 0%, rgba(249,246,238,0.82) 44%, rgba(245,240,231,0.96) 100%)",
            }}
          />

          <header className="relative z-10 flex items-center justify-between gap-6 border-b border-[rgba(30,24,17,0.12)] px-6 py-5 md:px-8 lg:px-10">
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-[#151311]" />
              <span className="text-[1rem] font-semibold tracking-[-0.03em] text-[#151311]">
                Alchemy Unlimited
              </span>
            </div>

            <nav className="hidden items-center gap-7 md:flex">
              {MENU_SECTIONS.map((section) => {
                const isActive = section.key === activeMenuSection;

                return (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => setActiveMenuSection(section.key)}
                    className="text-[0.9rem] transition-colors duration-150"
                    style={{
                      color: isActive ? "#151311" : "#61584f",
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    {section.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveMenuSection("contact")}
                className="rounded-full bg-[#ff6737] px-4 py-2 text-[0.85rem] font-semibold text-white shadow-[0_10px_24px_rgba(255,103,55,0.24)] transition-transform duration-150 hover:-translate-y-[1px]"
              >
                Let&apos;s talk
              </button>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(30,24,17,0.12)] bg-white/70 text-[#151311]"
                aria-label="Open navigation"
              >
                <span className="flex flex-col gap-[3px]">
                  <span className="h-[2px] w-4 rounded-full bg-current" />
                  <span className="h-[2px] w-4 rounded-full bg-current" />
                  <span className="h-[2px] w-4 rounded-full bg-current" />
                </span>
              </button>
            </div>
          </header>

          <section className="relative z-10 grid border-b border-[rgba(30,24,17,0.12)] lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
            <div className="border-b border-[rgba(30,24,17,0.12)] px-6 py-8 md:px-8 md:py-10 lg:border-b-0 lg:border-r lg:px-10 lg:py-12">
              <h1 className="max-w-[10ch] text-[clamp(3.5rem,8vw,6.4rem)] font-semibold leading-[0.94] tracking-[-0.07em] text-[#151311]">
                We build ideas that gather people around meaningful change.
              </h1>
              <p className="mt-6 max-w-[39rem] text-[1rem] leading-[1.72] text-[#5e564d] md:text-[1.05rem]">
                Alchemy Unlimited develops strategy, programmes, and narrative systems
                for collaborators who want their work to feel rigorous, generous, and
                publicly alive.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {STUDIO_MARKERS.map((marker) => (
                  <span
                    key={marker}
                    className="rounded-full border border-[rgba(30,24,17,0.12)] bg-white/56 px-3 py-1.5 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-[#5a544c]"
                  >
                    {marker}
                  </span>
                ))}
              </div>

              <div className="mt-10 max-w-[40rem] rounded-[24px] border border-[rgba(30,24,17,0.12)] bg-[rgba(255,255,255,0.68)] p-5 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#7a7369]">
                      Current manifesto
                    </p>
                    <p className="mt-1 text-[0.76rem] text-[#8b8478]">
                      A live statement generated from the four manifesto fields below.
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(30,24,17,0.1)] bg-white/80 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#4d473f]">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: activeAccent }}
                    />
                    Mouse-led
                  </span>
                </div>

                <StatementParagraph
                  what={currentValues.what}
                  why={currentValues.why}
                  who={currentValues.who}
                  how={currentValues.how}
                  className="mt-5 text-[0.92rem] leading-[1.72] text-[#433e36] md:text-[0.98rem]"
                />
              </div>
            </div>

            <div className="px-6 py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
              <div
                ref={noteStageRef}
                className="relative min-h-[430px] overflow-hidden rounded-[28px] border border-[rgba(30,24,17,0.08)] bg-[linear-gradient(180deg,rgba(255,251,242,0.94),rgba(246,240,229,0.92))]"
              >
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at 28% 32%, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.14) 26%, transparent 56%)",
                  }}
                />
                <div className="absolute inset-x-10 bottom-12 h-14 rounded-full bg-[radial-gradient(circle,rgba(122,104,58,0.14)_0%,rgba(122,104,58,0.04)_54%,transparent_78%)] blur-2xl" />

                {isDesktopNote ? (
                  <div
                    ref={stickyNoteRef}
                    className="absolute w-[18.25rem] max-w-[calc(100%-1.5rem)]"
                    style={{
                      transform: `translate(${stickyNotePosition.x}px, ${stickyNotePosition.y}px) perspective(1400px) rotateX(${stickyNoteSurface.rotateX}deg) rotateY(${stickyNoteSurface.rotateY}deg) rotateZ(${stickyNoteSurface.rotateZ}deg) scale(${stickyNoteSurface.scale})`,
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
                        boxShadow: `${stickyNoteSurface.shadowX}px ${stickyNoteSurface.shadowY}px ${stickyNoteSurface.shadowBlur}px rgba(73, 60, 18, 0.18), 0 14px 24px rgba(73, 60, 18, 0.1)`,
                      }}
                    />
                  </div>
                ) : (
                  <div className="absolute inset-x-4 top-14">
                    <MenuNoteCard
                      activeMenuSection={activeMenuSection}
                      activeMenuContent={activeMenuContent}
                      setActiveMenuSection={setActiveMenuSection}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="relative z-10 grid border-b border-[rgba(30,24,17,0.12)] md:grid-cols-4">
            {manifestoEntries.map((entry) => (
              <ManifestoBandItem
                key={entry.key}
                number={entry.number}
                label={entry.label}
                text={entry.text}
                color={entry.color}
                locked={entry.locked}
                onClick={() => toggleLock(entry.key, currentValues[entry.key])}
              />
            ))}
          </section>

          <section className="relative z-10 grid lg:grid-cols-[minmax(260px,0.86fr)_minmax(0,1.7fr)]">
            <div className="border-b border-[rgba(30,24,17,0.12)] px-6 py-8 md:px-8 md:py-10 lg:border-b-0 lg:border-r lg:px-10 lg:py-12">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#7a7369]">
                Featured work
              </p>
              <h2 className="mt-4 max-w-[11ch] text-[clamp(2.3rem,4.8vw,4.2rem)] font-semibold leading-[0.97] tracking-[-0.055em] text-[#151311]">
                Purposeful creative work with measurable public resonance.
              </h2>
              <div
                className="mt-6 h-[3px] w-28 rounded-full bg-[#161310]"
                style={{ transform: "rotate(-1.4deg)" }}
              />
              <p className="mt-6 max-w-[24rem] text-[0.92rem] leading-[1.72] text-[#5c564c]">
                We combine strategic framing, facilitation, narrative design, and
                public experience so each project can hold both conceptual depth and
                practical clarity.
              </p>
              <button
                type="button"
                className="mt-8 inline-flex items-center gap-3 text-[0.86rem] font-semibold text-[#151311]"
              >
                View our work
                <span className="text-[1.15rem]">→</span>
              </button>
            </div>

            <div className="grid gap-px bg-[rgba(30,24,17,0.12)] lg:grid-cols-3">
              {FEATURED_WORK.map((card) => (
                <FeaturedWorkCard key={card.title} card={card} />
              ))}
            </div>
          </section>
        </div>
      </div>
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
      className="relative border border-[rgba(124,104,40,0.16)] bg-[rgba(252,229,145,0.96)] p-4 backdrop-blur-sm md:p-5"
      style={{
        boxShadow: "0 16px 30px rgba(73, 60, 18, 0.12)",
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
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#675c35]">
          Studio note
        </p>
        <span className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#8f8256]">
          {activeMenuContent.label}
        </span>
      </div>

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
                borderColor: isActive ? "rgba(103, 92, 53, 0.16)" : "transparent",
              }}
            >
              <span className="text-[0.9rem] text-[#2f2a20]">{section.label}</span>
              <span className="text-[0.68rem] text-[#877b55]">{isActive ? "open" : ""}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 border-t border-[rgba(124,104,40,0.16)] pt-4">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#877b55]">
          {activeMenuContent.eyebrow}
        </p>
        <p className="mt-3 text-[0.84rem] leading-[1.65] text-[#3d3729]">
          {activeMenuContent.body}
        </p>
      </div>
    </div>
  );
}

interface ManifestoBandItemProps {
  number: string;
  label: string;
  text: string;
  color: string;
  locked?: boolean;
  onClick?: () => void;
}

function ManifestoBandItem({
  number,
  label,
  text,
  color,
  locked = false,
  onClick,
}: ManifestoBandItemProps) {
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
      className="group relative flex min-h-[180px] flex-col justify-between border-b border-[rgba(30,24,17,0.12)] px-5 py-5 text-left transition-colors duration-150 md:min-h-[208px] md:border-b-0 md:px-6 md:py-6"
      style={{
        backgroundColor: locked ? "rgba(244, 239, 229, 0.96)" : color,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.9rem] font-semibold tracking-[-0.03em] text-[#1b1814]">
            {number}
          </p>
          <p className="mt-1 text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#5e574c]">
            {label}
          </p>
        </div>

        <span
          className="mt-1 h-2.5 w-2.5 rounded-full border border-[rgba(21,19,17,0.18)]"
          style={{
            backgroundColor: locked ? "#151311" : "rgba(255,255,255,0.56)",
          }}
        />
      </div>

      <div className="mt-8">
        <h2
          className="max-w-[17ch] text-[1.16rem] font-medium leading-[1.08] tracking-[-0.045em] text-[#171411] transition-[opacity,color] duration-200 group-hover:text-[#5f584f] md:text-[1.34rem] lg:text-[1.52rem]"
          style={{
            opacity: visible ? 1 : 0,
            color: locked ? "#726b61" : "#171411",
          }}
        >
          {displayText}
        </h2>
        <span className="mt-5 inline-flex text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#8e8678] opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          {locked ? "locked" : "live"}
        </span>
      </div>
    </button>
  );
}

interface FeaturedWorkCardProps {
  card: FeaturedWorkCardData;
}

function FeaturedWorkCard({ card }: FeaturedWorkCardProps) {
  return (
    <article
      className="relative min-h-[320px] overflow-hidden px-5 py-6 md:px-6 md:py-7"
      style={{ backgroundColor: card.color }}
    >
      {card.accent === "corner" ? (
        <span className="absolute right-0 top-0 h-10 w-10 bg-[rgba(255,255,255,0.38)] [clip-path:polygon(0_0,100%_0,100%_100%)] shadow-[-6px_6px_10px_rgba(50,44,38,0.08)]" />
      ) : null}
      {card.accent === "pin" ? (
        <span className="absolute left-1/2 top-4 h-8 w-[2px] -translate-x-1/2 rounded-full bg-[rgba(30,24,17,0.68)] shadow-[0_0_0_6px_rgba(255,255,255,0.26)]" />
      ) : null}
      {card.accent === "tape" ? (
        <span className="absolute right-8 top-3 h-5 w-24 rotate-[0.8deg] rounded-[2px] bg-[rgba(244,236,202,0.82)] shadow-[0_1px_2px_rgba(50,44,38,0.06)]" />
      ) : null}

      <div className="relative flex h-full flex-col">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#656056]">
          {card.category}
        </p>
        <h3 className="mt-12 max-w-[12ch] text-[1.55rem] font-semibold leading-[1.02] tracking-[-0.05em] text-[#151311]">
          {card.title}
        </h3>
        <p className="mt-4 max-w-[18rem] text-[0.9rem] leading-[1.65] text-[#433d35]">
          {card.summary}
        </p>
        <button
          type="button"
          className="mt-auto inline-flex items-center gap-3 pt-10 text-[0.86rem] font-semibold text-[#151311]"
        >
          {card.linkLabel}
          <span className="text-[1.1rem]">→</span>
        </button>
      </div>
    </article>
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
  className?: string;
}

function StatementParagraph({
  what,
  why,
  who,
  how,
  className = "",
}: StatementParagraphProps) {
  return (
    <p
      className={`text-[0.82rem] font-light leading-[1.58] text-[#4a4a4a] md:text-[0.9rem] md:leading-[1.66] ${className}`}
    >
      We at Alchemy Unlimited are a collection of creative alchemists who are interested in{" "}
      <TypedSlot text={what} />. We are committed to <TypedSlot text={why} /> for{" "}
      <TypedSlot text={who} />. We approach our work through <TypedSlot text={how} />.
    </p>
  );
}
