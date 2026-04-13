import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, CheckCircle, CheckCircle2, Play } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface LessonItem {
  id: string;
  title: string;
  module_id: string;
  sort_order: number;
}

interface ModuleAccordionProps {
  modules: Tables<"course_modules">[];
  lessonsByModule: Record<string, LessonItem[]>;
  currentLessonId: string;
  completedLessonIds: string[];
}

const ModuleAccordion = ({
  modules,
  lessonsByModule,
  currentLessonId,
  completedLessonIds,
}: ModuleAccordionProps) => {
  const navigate = useNavigate();
  // Open the module that contains the current lesson by default
  const currentModuleId = modules.find((m) =>
    lessonsByModule[m.id]?.some((l) => l.id === currentLessonId)
  )?.id;

  const [openModuleId, setOpenModuleId] = useState<string | null>(currentModuleId || null);

  const toggle = (id: string) => {
    setOpenModuleId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-2">
      {modules.map((mod) => {
        const isOpen = openModuleId === mod.id;
        const lessons = lessonsByModule[mod.id] || [];
        const completedCount = lessons.filter((l) => completedLessonIds.includes(l.id)).length;
        const allCompleted = lessons.length > 0 && completedCount === lessons.length;
        return (
          <div
            key={mod.id}
            className="border border-border/40 rounded-lg overflow-hidden"
          >
            {/* Module Header */}
            <button
              onClick={() => toggle(mod.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-card/50 transition-colors"
            >
              {mod.cover_url ? (
                <img
                  src={mod.cover_url}
                  alt={mod.title}
                  className="w-10 h-10 rounded-sm object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-sm bg-secondary flex items-center justify-center text-foreground font-bold text-sm flex-shrink-0">
                  {mod.title.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {mod.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {lessons.length} {lessons.length === 1 ? "aula" : "aulas"}
                  {completedCount > 0 && ` · ${completedCount} concluída${completedCount > 1 ? "s" : ""}`}
                </p>
              </div>

              {allCompleted && (
                <CheckCircle2 size={18} className="text-primary fill-primary/20 flex-shrink-0" />
              )}

              <ChevronDown
                size={18}
                className={`text-muted-foreground transition-transform duration-200 flex-shrink-0 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Lessons List */}
            {isOpen && lessons.length > 0 && (
              <div className="border-t border-border/30">
                {lessons.map((lesson, idx) => {
                  const isCurrent = lesson.id === currentLessonId;
                  const isCompleted = completedLessonIds.includes(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => navigate(`/aula/${lesson.id}`)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isCurrent
                          ? "bg-primary/10 border-l-2 border-primary"
                          : "hover:bg-card/30 border-l-2 border-transparent"
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle size={16} className="text-primary" />
                        ) : isCurrent ? (
                          <Play size={16} className="text-primary fill-primary" />
                        ) : (
                          <span className="w-4 h-4 flex items-center justify-center text-xs text-muted-foreground">
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-sm truncate ${
                          isCurrent
                            ? "text-primary font-semibold"
                            : isCompleted
                              ? "text-foreground/70"
                              : "text-foreground"
                        }`}
                      >
                        {lesson.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ModuleAccordion;
