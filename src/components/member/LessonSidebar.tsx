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
    <div className="flex flex-col items-center justify-center h-full py-8 gap-0">
      <button
        onClick={goToPrev}
        disabled={currentIndex <= 0}
        className="text-primary disabled:text-muted-foreground/30 hover:scale-110 transition-transform mb-4"
      >
        <ChevronUp size={28} />
      </button>

      <div className="flex flex-col items-center gap-0 relative">
        <div
          className="absolute top-2 bottom-2 w-px border-l-2 border-dashed border-primary/50"
          style={{ left: "50%" }}
        />

        {lessons.map((lesson) => {
          const isActive = lesson.id === currentLessonId;
          const isCompleted = completedLessonIds.includes(lesson.id);
          const isHovered = hoveredId === lesson.id;

          return (
            <div
              key={lesson.id}
              className="relative z-10 py-2"
              onMouseEnter={() => setHoveredId(lesson.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <button
                onClick={() => navigate(`/aula/${lesson.id}`)}
                className={`rounded-full transition-all duration-200 ${
                  isActive
                    ? "w-5 h-5 bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.6)]"
                    : isCompleted
                    ? "w-3.5 h-3.5 bg-primary/60"
                    : "w-3.5 h-3.5 border-2 border-muted-foreground/40 bg-transparent hover:border-primary/60"
                }`}
              />

              {/* Tooltip */}
              {isHovered && (
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 bg-card border border-border rounded-lg px-3 py-2 shadow-lg whitespace-nowrap pointer-events-none z-50">
                  <p className="text-xs font-semibold text-foreground">{lesson.title}</p>
                  <p className="text-[10px] text-muted-foreground">{lesson.moduleTitle}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={goToNext}
        disabled={currentIndex >= lessons.length - 1}
        className="text-primary disabled:text-muted-foreground/30 hover:scale-110 transition-transform mt-4"
      >
        <ChevronDown size={28} />
      </button>
    </div>
  );
};

export default LessonSidebar;
