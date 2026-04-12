import { ChevronUp, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

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

const DOT_GAP = 48; // px between dots

const LessonSidebar = ({ lessons, currentLessonId, completedLessonIds }: LessonSidebarProps) => {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);

  // Scroll to keep active dot visible
  useEffect(() => {
    if (scrollRef.current && currentIndex >= 0) {
      const scrollTop = Math.max(0, currentIndex * DOT_GAP - 60);
      scrollRef.current.scrollTo({ top: scrollTop, behavior: "smooth" });
    }
  }, [currentIndex]);

  const goToPrev = () => {
    if (currentIndex > 0) navigate(`/aula/${lessons[currentIndex - 1].id}`);
  };

  const goToNext = () => {
    if (currentIndex < lessons.length - 1) navigate(`/aula/${lessons[currentIndex + 1].id}`);
  };

  return (
    <div className="flex flex-col items-center h-full">
      {/* Scrollable timeline area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-visible scrollbar-hide relative"
        style={{ minHeight: 0 }}
      >
        <div
          className="relative flex flex-col items-center"
          style={{ paddingTop: 8, paddingBottom: 8 }}
        >
          {/* Vertical dotted line */}
          <div
            className="absolute border-l border-dashed border-primary/40"
            style={{
              left: "50%",
              top: 8 + 8,
              bottom: 8 + 8,
            }}
          />

          {lessons.map((lesson, idx) => {
            const isActive = lesson.id === currentLessonId;
            const isCompleted = completedLessonIds.includes(lesson.id);
            const isHovered = hoveredId === lesson.id;

            return (
              <div
                key={lesson.id}
                className="relative z-10 flex items-center justify-center"
                style={{ height: DOT_GAP }}
                onMouseEnter={() => setHoveredId(lesson.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Horizontal connector for active dot */}
                {isActive && (
                  <div
                    className="absolute border-t-2 border-dashed border-primary/60"
                    style={{
                      right: "50%",
                      width: 60,
                      top: "50%",
                    }}
                  />
                )}

                <button
                  onClick={() => navigate(`/aula/${lesson.id}`)}
                  className={`rounded-full transition-all duration-200 ${
                    isActive
                      ? "w-[18px] h-[18px] bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
                      : isCompleted
                      ? "w-[11px] h-[11px] bg-[#5a6623]"
                      : "w-[11px] h-[11px] border-[1.5px] border-primary/70 bg-transparent hover:bg-primary/20"
                  }`}
                />

                {/* Tooltip */}
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
      </div>

      {/* Navigation arrows - side by side below timeline */}
      <div className="flex items-center gap-4 pt-2 pb-2">
        <button
          onClick={goToPrev}
          disabled={currentIndex <= 0}
          className="text-primary disabled:text-muted-foreground/20 hover:scale-110 transition-transform"
        >
          <ChevronUp size={22} />
        </button>
        <button
          onClick={goToNext}
          disabled={currentIndex >= lessons.length - 1}
          className="text-primary disabled:text-muted-foreground/20 hover:scale-110 transition-transform"
        >
          <ChevronDown size={22} />
        </button>
      </div>
    </div>
  );
};

export default LessonSidebar;
