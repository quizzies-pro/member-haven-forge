import { BookOpen, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ModuleCardProps {
  id: string;
  title: string;
  coverUrl?: string | null;
  lessonCount: number;
  isFirst?: boolean;
}

const ModuleCard = ({ id, title, coverUrl, lessonCount, isFirst }: ModuleCardProps) => {
  const navigate = useNavigate();
  const { user, student } = useAuth();

  const handleClick = async () => {
    if (!user) { navigate(`/modulo/${id}`); return; }
    const studentId = student?.id || user.id;

    // Fetch lessons for this module
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id, course_id")
      .eq("module_id", id)
      .eq("status", "published")
      .order("sort_order");

    if (!lessons || lessons.length === 0) { navigate(`/modulo/${id}`); return; }

    // Fetch enrollment
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", studentId)
      .eq("course_id", lessons[0].course_id)
      .eq("status", "active")
      .maybeSingle();

    if (!enrollment) {
      navigate("/");
      return;
    }

    // Fetch completed lessons
    const { data: completed } = await supabase
      .from("enrollment_lessons")
      .select("lesson_id")
      .eq("enrollment_id", enrollment.id);

    const completedIds = new Set(completed?.map((c) => c.lesson_id) || []);
    const firstUncompleted = lessons.find((l) => !completedIds.has(l.id));

    navigate(`/aula/${firstUncompleted ? firstUncompleted.id : lessons[0].id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group flex-shrink-0 w-[240px] cursor-pointer"
    >
      <div className="relative w-[240px] h-[360px] rounded-xl overflow-hidden bg-secondary transition-all duration-300">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={40} className="text-muted-foreground" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        <div className="absolute top-3 left-3 text-foreground/90 text-xs font-medium tracking-wide">
          {lessonCount} {lessonCount === 1 ? "Aula" : "Aulas"}
        </div>

        <div className="absolute bottom-8 left-5 right-14">
          <h3 className="text-xl font-extrabold text-foreground uppercase leading-tight">
            {title}
          </h3>
        </div>

        <div className="absolute bottom-8 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
          <Play size={17} fill="currentColor" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;
