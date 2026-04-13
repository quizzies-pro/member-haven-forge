import { ChevronUp, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";

export interface SidebarLesson {
  id: string;
  title: string;
  moduleTitle: string;
  moduleId: string;
  thumbnailUrl?: string | null;
  moduleCoverUrl?: string | null;
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
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(8);

  const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);

  useEffect(() => {
    if (containerRef.current) {
      const h = containerRef.current.clientHeight;
      const nextVisibleCount = Math.min(
        Math.max(lessons.length, 1),
        Math.max(3, Math.floor(h / DOT_GAP))
      );
      setVisibleCount(nextVisibleCount);
    }
  }, [lessons.length]);

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

  const visibleLessons: { lesson: SidebarLesson; realIndex: number }[] = [];
  const startOffset = offset - Math.floor(visibleCount / 2);
  for (let i = 0; i < visibleCount; i++) {
    const realIdx = getWrappedIndex(startOffset + i);
    visibleLessons.push({ lesson: lessons[realIdx], realIndex: realIdx });
  }

  return (
    <div className="flex flex-col items-center h-full relative">
      <div
        ref={containerRef}
        className="flex-1 relative flex flex-col items-center justify-center overflow-visible"
        style={{ minHeight: 0 }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-24 pointer-events-none z-20"
          style={{ background: "linear-gradient(to bottom, hsl(var(--background)) 0%, transparent 100%)" }}
        />

        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-20"
          style={{ background: "linear-gradient(to top, hsl(var(--background)) 0%, transparent 100%)" }}
        />

        <div
          className="absolute bg-primary/40"
          style={{
            left: "calc(50% - 0.5px)",
            width: 1,
            top: DOT_GAP / 2,
            bottom: DOT_GAP / 2,
          }}
        />

        {visibleLessons.map(({ lesson }, idx) => {
          const hoverKey = `${lesson.id}-${idx}`;
          const isActive = lesson.id === currentLessonId;
          const isCompleted = completedLessonIds.includes(lesson.id);
          const isHovered = hoveredKey === hoverKey;

          return (
            <div
              key={hoverKey}
              className="relative flex items-center justify-center"
              style={{ height: DOT_GAP, zIndex: isHovered ? 9999 : isActive ? 1 : 10 }}
              onMouseEnter={() => setHoveredKey(hoverKey)}
              onMouseLeave={() => setHoveredKey(null)}
            >
              <button
                onClick={() => navigate(`/aula/${lesson.id}`)}
                className={`rounded-full transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? "bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)] ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : isCompleted
                      ? "bg-primary"
                      : "border-[1.5px] border-primary/70 bg-background hover:bg-primary/20"
                }`}
                style={{ width: DOT_SIZE, height: DOT_SIZE }}
              />

              {isHovered && (
                <div
                  className="absolute top-1/2 right-full mr-8 -translate-y-1/2 bg-black rounded-xl overflow-hidden shadow-xl pointer-events-none flex items-center gap-0 min-w-[320px]"
                  style={{ zIndex: 99999 }}
                >
                  {(lesson.thumbnailUrl || lesson.moduleCoverUrl) && (
                    <img
                      src={lesson.thumbnailUrl || lesson.moduleCoverUrl || ""}
                      alt={lesson.title}
                      className="w-32 h-24 object-cover flex-shrink-0"
                    />
                  )}
                  <div className="px-5 py-5 min-w-[180px]">
                    <p className="text-sm font-semibold text-white leading-tight">{lesson.title}</p>
                    <p className="text-xs text-gray-400 mt-1 leading-tight">{lesson.moduleTitle}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

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
