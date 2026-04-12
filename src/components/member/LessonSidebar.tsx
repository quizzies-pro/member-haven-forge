import { ChevronUp, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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

const LessonSidebar = ({ lessons, currentLessonId, completedLessonIds }: LessonSidebarProps) => {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);

  const goToPrev = () => {
    if (currentIndex > 0) navigate(`/aula/${lessons[currentIndex - 1].id}`);
  };

  const goToNext = () => {
    if (currentIndex < lessons.length - 1) navigate(`/aula/${lessons[currentIndex + 1].id}`);
  };

  return (
    <div className="flex flex-col items-center h-full relative">
      {/* Horizontal dotted connector from left to active dot */}
      <div
        className="absolute border-t-2 border-dashed border-primary/60"
        style={{
          left: "-40px",
          right: "50%",
          top: `${lessons.length > 0 ? (currentIndex * 36 + 12) : 12}px`,
        }}
      />

      {/* Timeline nodes */}
      <div className="flex flex-col items-center relative">
        {/* Vertical dotted line */}
        <div
          className="absolute w-px border-l border-dashed border-primary/50"
          style={{ left: "50%", top: "6px", bottom: "6px" }}
        />

        {lessons.map((lesson) => {
          const isActive = lesson.id === currentLessonId;
          const isCompleted = completedLessonIds.includes(lesson.id);
          const isHovered = hoveredId === lesson.id;

          return (
            <div
              key={lesson.id}
              className="relative z-10 flex items-center justify-center"
              style={{ height: "36px" }}
              onMouseEnter={() => setHoveredId(lesson.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <button
                onClick={() => navigate(`/aula/${lesson.id}`)}
                className={`rounded-full transition-all duration-200 ${
                  isActive
                    ? "w-[18px] h-[18px] bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.5)]"
                    : isCompleted
                    ? "w-[10px] h-[10px] bg-[#5a6623]"
                    : "w-[10px] h-[10px] border-[1.5px] border-primary/70 bg-transparent hover:bg-primary/20"
                }`}
              />

              {/* Tooltip */}
              {isHovered && (
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 bg-card border border-border rounded-lg px-3 py-2 shadow-lg whitespace-nowrap pointer-events-none z-50">
                  <p className="text-[11px] font-semibold text-foreground">{lesson.title}</p>
                  <p className="text-[9px] text-muted-foreground">{lesson.moduleTitle}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation arrows */}
      <div className="flex items-center gap-1 mt-3">
        <div className="flex flex-col items-center gap-0">
          <button
            onClick={goToPrev}
            disabled={currentIndex <= 0}
            className="text-primary disabled:text-muted-foreground/20 hover:scale-110 transition-transform p-0"
          >
            <ChevronUp size={22} />
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex >= lessons.length - 1}
            className="text-primary disabled:text-muted-foreground/20 hover:scale-110 transition-transform p-0"
          >
            <ChevronDown size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonSidebar;
