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
const REPEATS = 5; // how many copies of the list to render for infinite illusion

const LessonSidebar = ({ lessons, currentLessonId, completedLessonIds }: LessonSidebarProps) => {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(8);
  const [logicalOffset, setLogicalOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const count = lessons.length;
  const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);
  const cycleHeight = count * DOT_GAP;

  useEffect(() => {
    if (containerRef.current) {
      const h = containerRef.current.clientHeight;
      setVisibleCount(Math.max(3, Math.floor(h / DOT_GAP)));
    }
  }, []);

  // Center on current lesson
  useEffect(() => {
    if (currentIndex >= 0) {
      setLogicalOffset(currentIndex);
    }
  }, [currentIndex, lessons.length]);

  // The middle copy starts at index REPEATS/2 * count
  const middleStart = Math.floor(REPEATS / 2) * count;
  const containerHeight = visibleCount * DOT_GAP;
  
  // translateY to center the logicalOffset dot in the viewport
  const targetDotPosition = (middleStart + logicalOffset) * DOT_GAP;
  const translateY = -(targetDotPosition - containerHeight / 2 + DOT_GAP / 2);

  // After transition ends, silently snap to keep logicalOffset in [0, count)
  const handleTransitionEnd = useCallback(() => {
    if (count === 0) return;
    const normalized = ((logicalOffset % count) + count) % count;
    if (normalized !== logicalOffset) {
      setIsTransitioning(true);
      setLogicalOffset(normalized);
      // Force reflow to skip transition
      requestAnimationFrame(() => {
        setIsTransitioning(false);
      });
    }
  }, [logicalOffset, count]);

  const scrollUp = useCallback(() => {
    setIsTransitioning(false);
    setLogicalOffset((prev) => prev - 1);
  }, []);

  const scrollDown = useCallback(() => {
    setIsTransitioning(false);
    setLogicalOffset((prev) => prev + 1);
  }, []);

  // Build repeated list
  const repeatedLessons: SidebarLesson[] = [];
  for (let r = 0; r < REPEATS; r++) {
    for (let i = 0; i < count; i++) {
      repeatedLessons.push(lessons[i]);
    }
  }

  return (
    <div className="flex flex-col items-center h-full relative">
      <div ref={containerRef} className="flex-1 relative flex flex-col items-center justify-center overflow-x-visible overflow-y-clip" style={{ minHeight: 0 }}>
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

        {/* Sliding strip */}
        <div
          ref={stripRef}
          className="relative flex flex-col items-center"
          style={{
            transform: `translateY(${translateY}px)`,
            transition: isTransitioning ? 'none' : 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
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

          {repeatedLessons.map((lesson, idx) => {
            const isActive = lesson.id === currentLessonId;
            const isCompleted = completedLessonIds.includes(lesson.id);
            const isHovered = hoveredId === `${lesson.id}-${idx}`;

            return (
              <div
                key={`${lesson.id}-${idx}`}
                className="relative flex items-center justify-center"
                style={{ height: DOT_GAP, zIndex: isHovered ? 9999 : isActive ? 1 : 10 }}
                onMouseEnter={() => setHoveredId(`${lesson.id}-${idx}`)}
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
                  <div className="absolute right-full top-1/2 -translate-y-1/2 mr-5 bg-card border border-border rounded-lg px-3 py-2 shadow-lg whitespace-nowrap pointer-events-none" style={{ zIndex: 9999 }}>
                    <p className="text-[11px] font-semibold text-foreground">{lesson.title}</p>
                    <p className="text-[9px] text-muted-foreground">{lesson.moduleTitle}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
