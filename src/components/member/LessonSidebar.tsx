import { ChevronUp, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

interface LessonSidebarProps {
  lessons: Tables<"lessons">[];
  currentLessonId: string;
  completedLessonIds: string[];
}

const LessonSidebar = ({ lessons, currentLessonId, completedLessonIds }: LessonSidebarProps) => {
  const navigate = useNavigate();
  const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);

  const goToPrev = () => {
    if (currentIndex > 0) navigate(`/aula/${lessons[currentIndex - 1].id}`);
  };

  const goToNext = () => {
    if (currentIndex < lessons.length - 1) navigate(`/aula/${lessons[currentIndex + 1].id}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full py-8 gap-0">
      {/* Up arrow */}
      <button
        onClick={goToPrev}
        disabled={currentIndex <= 0}
        className="text-primary disabled:text-muted-foreground/30 hover:scale-110 transition-transform mb-4"
      >
        <ChevronUp size={28} />
      </button>

      {/* Timeline nodes */}
      <div className="flex flex-col items-center gap-0 relative">
        {/* Dotted line behind */}
        <div
          className="absolute top-2 bottom-2 w-px border-l-2 border-dashed border-primary/50"
          style={{ left: "50%" }}
        />

        {lessons.map((lesson, idx) => {
          const isActive = lesson.id === currentLessonId;
          const isCompleted = completedLessonIds.includes(lesson.id);

          return (
            <div key={lesson.id} className="relative z-10 py-2">
              <button
                onClick={() => navigate(`/aula/${lesson.id}`)}
                title={lesson.title}
                className={`rounded-full transition-all duration-200 ${
                  isActive
                    ? "w-5 h-5 bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.6)]"
                    : isCompleted
                    ? "w-3.5 h-3.5 bg-[#6b7a2e]"
                    : "w-3.5 h-3.5 border-2 border-muted-foreground/40 bg-transparent hover:border-primary/60"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Down arrow */}
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
