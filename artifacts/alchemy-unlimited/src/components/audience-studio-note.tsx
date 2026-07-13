import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

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

interface SketchPoint {
  x: number;
  y: number;
}

interface NoteCardProps {
  compact?: boolean;
  onDragHandlePointerDown?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  shadowStyle?: CSSProperties;
}

const DESKTOP_NOTE_BREAKPOINT = 1024;
const NOTE_EDGE_PADDING = 24;
const STUDIO_NOTE_STORAGE_KEY = "alchemy-audience-studio-note";
const STUDIO_NOTE_SKETCH_STORAGE_KEY = "alchemy-audience-studio-note-sketch";
const STUDIO_NOTE_POSITION_STORAGE_KEY =
  "alchemy-audience-studio-note-position";
const STUDIO_NOTE_PLACEHOLDER =
  "Write what you notice, want to keep, or might bring into the room.";
const STUDIO_NOTE_EXPORT_WIDTH = 900;
const STUDIO_NOTE_EXPORT_HEIGHT = 1200;

const DEFAULT_NOTE_SURFACE: NoteSurfaceState = {
  rotateX: -2,
  rotateY: 4,
  rotateZ: -2.2,
  scale: 1,
  shadowX: 0,
  shadowY: 18,
  shadowBlur: 36,
};

function readStoredPosition(): NotePosition | null {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(STUDIO_NOTE_POSITION_STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Partial<NotePosition>;
    if (typeof parsed.x !== "number" || typeof parsed.y !== "number")
      return null;
    return parsed as NotePosition;
  } catch {
    return null;
  }
}

function defaultDesktopPosition(): NotePosition {
  if (typeof window === "undefined") return { x: 0, y: 112 };

  return {
    x: window.innerWidth - 330,
    y: 118,
  };
}

export function AudienceStudioNote() {
  const noteRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef({
    active: false,
    offsetX: 0,
    offsetY: 0,
  });

  const [isDesktopNote, setIsDesktopNote] = useState(
    () =>
      typeof window !== "undefined" &&
      window.innerWidth >= DESKTOP_NOTE_BREAKPOINT,
  );
  const [isDraggingNote, setIsDraggingNote] = useState(false);
  const [notePosition, setNotePosition] = useState<NotePosition>(
    () => readStoredPosition() ?? defaultDesktopPosition(),
  );
  const [noteSurface, setNoteSurface] =
    useState<NoteSurfaceState>(DEFAULT_NOTE_SURFACE);

  const clampNotePosition = useCallback(
    (position: NotePosition): NotePosition => {
      if (typeof window === "undefined") return position;

      const noteRect = noteRef.current?.getBoundingClientRect();
      const noteWidth = noteRect?.width ?? 288;
      const noteHeight = noteRect?.height ?? 360;
      const maxX = Math.max(
        NOTE_EDGE_PADDING,
        window.innerWidth - noteWidth - NOTE_EDGE_PADDING,
      );
      const maxY = Math.max(
        NOTE_EDGE_PADDING,
        window.innerHeight - noteHeight - NOTE_EDGE_PADDING,
      );

      return {
        x: Math.min(Math.max(position.x, NOTE_EDGE_PADDING), maxX),
        y: Math.min(Math.max(position.y, NOTE_EDGE_PADDING), maxY),
      };
    },
    [],
  );

  const persistPosition = useCallback(
    (position: NotePosition) => {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(
        STUDIO_NOTE_POSITION_STORAGE_KEY,
        JSON.stringify(clampNotePosition(position)),
      );
    },
    [clampNotePosition],
  );

  const updateNoteSurface = useCallback(
    (clientX: number, clientY: number, dragging = false) => {
      const rect = noteRef.current?.getBoundingClientRect();
      if (!rect) return;

      const normalisedX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normalisedY = ((clientY - rect.top) / rect.height) * 2 - 1;
      const clampedX = Math.max(-1, Math.min(1, normalisedX));
      const clampedY = Math.max(-1, Math.min(1, normalisedY));

      setNoteSurface({
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

  const resetNoteSurface = useCallback(() => {
    setNoteSurface(DEFAULT_NOTE_SURFACE);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const setInitialPosition = () => {
      const desktop = window.innerWidth >= DESKTOP_NOTE_BREAKPOINT;
      setIsDesktopNote(desktop);

      if (!desktop) return;

      const storedPosition = readStoredPosition();
      setNotePosition(
        clampNotePosition(storedPosition ?? defaultDesktopPosition()),
      );
    };

    setInitialPosition();

    const onResize = () => {
      const desktop = window.innerWidth >= DESKTOP_NOTE_BREAKPOINT;
      setIsDesktopNote(desktop);
      setNotePosition((current) =>
        clampNotePosition(current.x === 0 ? defaultDesktopPosition() : current),
      );
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampNotePosition]);

  useEffect(() => {
    if (!isDesktopNote) {
      dragRef.current.active = false;
      setIsDraggingNote(false);
      resetNoteSurface();
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!dragRef.current.active) return;

      const nextPosition = clampNotePosition({
        x: event.clientX - dragRef.current.offsetX,
        y: event.clientY - dragRef.current.offsetY,
      });

      setNotePosition(nextPosition);
      updateNoteSurface(event.clientX, event.clientY, true);
    };

    const endDrag = () => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      setIsDraggingNote(false);
      setNotePosition((current) => {
        persistPosition(current);
        return current;
      });
      resetNoteSurface();
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
    clampNotePosition,
    isDesktopNote,
    persistPosition,
    resetNoteSurface,
    updateNoteSurface,
  ]);

  const startNoteDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDesktopNote || !noteRef.current) return;

    const rect = noteRef.current.getBoundingClientRect();
    dragRef.current = {
      active: true,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    setIsDraggingNote(true);
    updateNoteSurface(event.clientX, event.clientY, true);
  };

  if (!isDesktopNote) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-30 max-h-[48vh] overflow-y-auto overscroll-contain">
        <AudienceNoteCard compact />
      </div>
    );
  }

  return (
    <div
      ref={noteRef}
      className="fixed z-30 w-[18rem] select-none"
      style={{
        left: notePosition.x,
        top: notePosition.y,
        transform: `perspective(1400px) rotateX(${noteSurface.rotateX}deg) rotateY(${noteSurface.rotateY}deg) rotateZ(${noteSurface.rotateZ}deg) scale(${noteSurface.scale})`,
        transformStyle: "preserve-3d",
        filter: isDraggingNote ? "saturate(1.04)" : "none",
      }}
      onPointerEnter={(event) =>
        updateNoteSurface(event.clientX, event.clientY, isDraggingNote)
      }
      onPointerMove={(event) => {
        if (isDraggingNote) return;
        updateNoteSurface(event.clientX, event.clientY, false);
      }}
      onPointerLeave={() => {
        if (isDraggingNote) return;
        resetNoteSurface();
      }}
    >
      <AudienceNoteCard
        onDragHandlePointerDown={startNoteDrag}
        shadowStyle={{
          boxShadow: `${noteSurface.shadowX}px ${noteSurface.shadowY}px ${noteSurface.shadowBlur}px rgba(73, 60, 18, 0.24), 0 14px 24px rgba(20, 16, 10, 0.16)`,
        }}
      />
    </div>
  );
}

function AudienceNoteCard({
  compact = false,
  onDragHandlePointerDown,
  shadowStyle,
}: NoteCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<SketchPoint | null>(null);
  const sketchDataUrlRef = useRef<string | null>(
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem(STUDIO_NOTE_SKETCH_STORAGE_KEY),
  );
  const [noteText, setNoteText] = useState(() =>
    typeof window === "undefined"
      ? ""
      : (window.localStorage.getItem(STUDIO_NOTE_STORAGE_KEY) ?? ""),
  );

  const restoreSketch = useCallback((dataUrl: string | null) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !dataUrl) return;

    const rect = canvas.getBoundingClientRect();
    const image = new Image();
    image.onload = () => {
      context.drawImage(image, 0, 0, rect.width, rect.height);
    };
    image.src = dataUrl;
  }, []);

  const persistSketch = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    const dataUrl = canvas.toDataURL("image/png");
    sketchDataUrlRef.current = dataUrl;
    window.localStorage.setItem(STUDIO_NOTE_SKETCH_STORAGE_KEY, dataUrl);
  }, []);

  const clearSketch = useCallback((persist = true) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();

    if (persist && typeof window !== "undefined") {
      sketchDataUrlRef.current = null;
      window.localStorage.removeItem(STUDIO_NOTE_SKETCH_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STUDIO_NOTE_STORAGE_KEY, noteText);
  }, [noteText]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * scale));
      canvas.height = Math.max(1, Math.floor(rect.height * scale));

      const context = canvas.getContext("2d");
      if (!context) return;
      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#211d17";
      context.lineWidth = 2;
      restoreSketch(sketchDataUrlRef.current);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [restoreSketch]);

  const pointFromEvent = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ): SketchPoint => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const beginSketch = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    lastPointRef.current = pointFromEvent(event);
  };

  const drawSketch = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    event.preventDefault();

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const previous = lastPointRef.current;
    const next = pointFromEvent(event);
    if (!context || !previous) return;

    context.beginPath();
    context.moveTo(previous.x, previous.y);
    context.lineTo(next.x, next.y);
    context.stroke();
    lastPointRef.current = next;
  };

  const endSketch = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    event.preventDefault();
    isDrawingRef.current = false;
    lastPointRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    persistSketch();
  };

  const resetNote = () => {
    setNoteText("");
    clearSketch();
  };

  const downloadNote = () => {
    if (typeof document === "undefined") return;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = STUDIO_NOTE_EXPORT_WIDTH;
    exportCanvas.height = STUDIO_NOTE_EXPORT_HEIGHT;
    const context = exportCanvas.getContext("2d");
    if (!context) return;

    context.fillStyle = "#fce591";
    context.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    context.fillStyle = "rgba(247, 236, 192, 0.92)";
    context.fillRect(330, 48, 240, 58);
    context.strokeStyle = "rgba(124, 104, 40, 0.28)";
    context.lineWidth = 3;
    context.strokeRect(0, 0, exportCanvas.width, exportCanvas.height);

    context.fillStyle = "#675c35";
    context.font = "700 28px Inter, Helvetica, Arial, sans-serif";
    context.fillText("ALCHEMY STUDIO NOTE", 72, 178);

    context.fillStyle = "#211d17";
    context.font = "700 48px Inter, Helvetica, Arial, sans-serif";
    context.fillText("What I am taking with me", 72, 268);

    context.font = "400 34px Inter, Helvetica, Arial, sans-serif";
    wrapCanvasText(
      context,
      noteText.trim() || STUDIO_NOTE_PLACEHOLDER,
      72,
      350,
      exportCanvas.width - 144,
      52,
      11,
    );

    const sketchCanvas = canvasRef.current;
    if (sketchCanvas) {
      context.fillStyle = "rgba(255, 250, 240, 0.42)";
      context.fillRect(72, 760, exportCanvas.width - 144, 300);
      context.drawImage(sketchCanvas, 72, 760, exportCanvas.width - 144, 300);
    }

    context.fillStyle = "#675c35";
    context.font = "600 24px Inter, Helvetica, Arial, sans-serif";
    context.fillText("clubraori.github.io/Interactive-Prototype", 72, 1120);

    const link = document.createElement("a");
    link.href = exportCanvas.toDataURL("image/png");
    link.download = "alchemy-studio-note.png";
    link.click();
  };

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
          onDragHandlePointerDown
            ? "cursor-grab touch-none active:cursor-grabbing"
            : ""
        }`}
        onPointerDown={onDragHandlePointerDown}
      >
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#675c35]">
          Studio note
        </p>
        <span className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#8f8256]">
          yours
        </span>
      </div>

      <div className="mt-5 border-t border-[rgba(124,104,40,0.16)] pt-4">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#877b55]">
          Field note
        </p>
        <textarea
          value={noteText}
          onChange={(event) => setNoteText(event.target.value)}
          placeholder={STUDIO_NOTE_PLACEHOLDER}
          className={`mt-3 w-full resize-none border border-[rgba(103,92,53,0.18)] bg-[rgba(255,250,240,0.36)] px-3 py-2 text-[0.86rem] leading-[1.5] text-[#211d17] outline-none transition-colors duration-150 placeholder:text-[#887a50] focus:border-[rgba(198,83,36,0.48)] focus:bg-[rgba(255,250,240,0.54)] ${
            compact ? "min-h-[5.25rem]" : "min-h-[7.5rem]"
          }`}
        />
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#877b55]">
            Sketch
          </p>
          <button
            type="button"
            onClick={() => clearSketch()}
            className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[#675c35] transition-colors duration-150 hover:text-[#c65324]"
          >
            Clear sketch
          </button>
        </div>
        <canvas
          ref={canvasRef}
          aria-label="Sketch on your studio note"
          className={`w-full touch-none border border-[rgba(103,92,53,0.18)] bg-[rgba(255,250,240,0.32)] ${
            compact ? "h-[5rem]" : "h-[7.25rem]"
          }`}
          onPointerDown={beginSketch}
          onPointerMove={drawSketch}
          onPointerUp={endSketch}
          onPointerCancel={endSketch}
          onPointerLeave={endSketch}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={resetNote}
          className="border border-[rgba(103,92,53,0.18)] bg-[rgba(255,250,240,0.24)] px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#675c35] transition-colors duration-150 hover:bg-[rgba(255,250,240,0.5)]"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={downloadNote}
          className="border border-[#c65324] bg-[#c65324] px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#fffaf0] transition-colors duration-150 hover:border-[#211d17] hover:bg-[#211d17]"
        >
          Download
        </button>
      </div>
    </div>
  );
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(/\s+/).filter(Boolean);
  let line = "";
  let lineCount = 0;

  words.forEach((word, index) => {
    if (lineCount >= maxLines) return;

    const testLine = line ? `${line} ${word}` : word;
    const width = context.measureText(testLine).width;
    const isLastWord = index === words.length - 1;

    if (width > maxWidth && line) {
      context.fillText(line, x, y + lineCount * lineHeight);
      line = word;
      lineCount += 1;
    } else {
      line = testLine;
    }

    if (isLastWord && lineCount < maxLines) {
      context.fillText(line, x, y + lineCount * lineHeight);
      lineCount += 1;
    }
  });
}
