import { ChevronUp, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";

export interface SidebarLesson {
  id: string;
  title: string;
  moduleTitle: string;
  moduleId: string;
}

interface LessonSidebarProps {
  lessons: SidebarLesson[];
  currentLessonId: string;
  completedLessonIds: string[];
}

const DOT_SIZE = 18;
const DOT_GAP = 48;

const LessonSidebar = ({ lessons, currentLessonId, completedLessonIds }: LessonSidebarProps) => {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(8);

  const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);

  // Calculate how many dots fit
  useEffect(() => {
    if (containerRef.current) {
      const h = containerRef.current.clientHeight;
      setVisibleCount(Math.max(3, Math.floor(h / DOT_GAP)));
    }
  }, []);

  // Center active dot on mount
  useEffect(() => {
    if (currentIndex >= 0) {
      setOffset(currentIndex);
    }
  }, [currentIndex, lessons.length]);

  const getWrappedIndex = (i: number) => {
    const len = lessons.length;
    return ((i % len) + len) % len;
  };

  const scrollUp = useCallback(() => {
    setOffset((prev) => prev - 1);
  }, []);

  const scrollDown = useCallback(() => {
    setOffset((prev) => prev + 1);
  }, []);

  // Build visible list centered around offset
  const visibleLessons: { lesson: SidebarLesson; realIndex: number }[] = [];
  const startOffset = offset - Math.floor(visibleCount / 2);
  for (let i = 0; i < visibleCount; i++) {
    const realIdx = getWrappedIndex(startOffset + i);
    visibleLessons.push({ lesson: lessons[realIdx], realIndex: realIdx });
  }

  return (
    <div className="flex flex-col items-center h-full">
      <div ref={containerRef} className="flex-1 relative flex flex-col items-center justify-center" style={{ minHeight: 0 }}>
        {/* Vertical solid line */}
        <div
          className="absolute bg-primary/40"
          style={{
            left: "calc(50% - 0.5px)",
            width: 1,
            top: DOT_GAP / 2,
            bottom: DOT_GAP / 2,
          }}
        />

        {visibleLessons.map(({ lesson, realIndex }, idx) => {
          const isActive = lesson.id === currentLessonId;
          const isCompleted = completedLessonIds.includes(lesson.id);
          const isHovered = hoveredId === lesson.id;

          return (
            <div
              key={`${lesson.id}-${idx}`}
              className="relative z-10 flex items-center justify-center"
              style={{ height: DOT_GAP }}
              onMouseEnter={() => setHoveredId(lesson.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {isActive && (
                <div
                  className="absolute border-t-2 border-dashed border-primary/60"
                  style={{ right: "50%", width: 80, top: "50%", zIndex: -1 }}
                />
              )}

              <button
                onClick={() => navigate(`/aula/${lesson.id}`)}
                className={`rounded-full transition-all duration-200 w-[${DOT_SIZE}px] h-[${DOT_SIZE}px] ${
                  isActive
                    ? "bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
                    : isCompleted
                    ? "bg-primary"
                    : "border-[1.5px] border-primary/70 bg-background hover:bg-primary/20"
                }`}
                style={{ width: DOT_SIZE, height: DOT_SIZE }}
              />

              {isHovered && (
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-5 bg-card border border-border rounded-lg px-3 py-2 shadow-lg whitespace-nowrap pointer-events-none z-50">
                  <p className="text-[11px] font-semibold text-foreground">{lesson.title}</p>
                  <p className="text-[9px] text-muted-foreground">{lesson.moduleTitle}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation arrows */}
      <div className="flex items-center gap-4 pt-2 pb-2">
        <button
          onClick={scrollUp}
          className="text-primary hover:scale-110 transition-transform"
        >
          <ChevronUp size={22} />
        </button>
        <button
          onClick={scrollDown}
          className="text-primary hover:scale-110 transition-transform"
        >
          <ChevronDown size={22} />
        </button>
      </div>
    </div>
  );
};

export default LessonSidebar;
