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
  const [animate, setAnimate] = useState(false);

  const count = lessons.length;
  const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);

  useEffect(() => {
    if (containerRef.current) {
      const h = containerRef.current.clientHeight;
      setVisibleCount(Math.max(3, Math.floor(h / DOT_GAP)));
    }
  }, []);

  useEffect(() => {
    if (currentIndex >= 0) {
      setOffset(currentIndex);
    }
  }, [currentIndex, count]);

  const getWrappedIndex = (i: number) => {
    if (count === 0) return 0;
    return ((i % count) + count) % count;
  };

  const scrollUp = useCallback(() => {
    setAnimate(true);
    setOffset((prev) => prev - 1);
  }, []);

  const scrollDown = useCallback(() => {
    setAnimate(true);
    setOffset((prev) => prev + 1);
  }, []);

  // We render visibleCount + 2 extra items (1 above, 1 below) for smooth entry/exit
  const totalRender = visibleCount + 2;
  const startOffset = offset - Math.floor(totalRender / 2);

  const visibleLessons: { lesson: SidebarLesson; realIndex: number; key: string }[] = [];
  for (let i = 0; i < totalRender; i++) {
    const realIdx = getWrappedIndex(startOffset + i);
    if (count > 0) {
      visibleLessons.push({
        lesson: lessons[realIdx],
        realIndex: realIdx,
        key: `${realIdx}-${startOffset + i}`,
      });
    }
  }

  // Reset animate flag after transition
  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [animate, offset]);

  return (
    <div className="flex flex-col items-center h-full relative">
      <div
        ref={containerRef}
        className="flex-1 relative flex flex-col items-center justify-center overflow-x-visible overflow-y-clip"
        style={{ minHeight: 0 }}
      >
        {/* Gradient mask - top */}
        <div
          className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-20"
          style={{ background: 'linear-gradient(to bottom, hsl(var(--background)) 0%, transparent 100%)' }}
        />

        {/* Gradient mask - bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-20"
          style={{ background: 'linear-gradient(to top, hsl(var(--background)) 0%, transparent 100%)' }}
        />

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

        {visibleLessons.map(({ lesson, realIndex, key }, idx) => {
          const isActive = lesson.id === currentLessonId;
          const isCompleted = completedLessonIds.includes(lesson.id);
          const isHovered = hoveredId === key;

          return (
            <div
              key={key}
              className="relative flex items-center justify-center transition-all duration-500 ease-in-out"
              style={{
                height: DOT_GAP,
                zIndex: isHovered ? 9999 : isActive ? 1 : 10,
              }}
              onMouseEnter={() => setHoveredId(key)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {isActive && (
                <div
                  className="absolute border-t-2 border-dashed border-primary/60"
                  style={{ right: "50%", width: 80, top: "50%", zIndex: 0 }}
                />
              )}

              <button
                onClick={() => navigate(`/aula/${lesson.id}`)}
                className={`rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
                    : isCompleted
                    ? "bg-primary"
                    : "border-[1.5px] border-primary/70 bg-background hover:bg-primary/20"
                }`}
                style={{ width: DOT_SIZE, height: DOT_SIZE }}
              />

              {isHovered && (
                <div
                  className="absolute right-full top-1/2 -translate-y-1/2 mr-5 bg-card border border-border rounded-lg px-3 py-2 shadow-lg whitespace-nowrap pointer-events-none"
                  style={{ zIndex: 9999 }}
                >
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
