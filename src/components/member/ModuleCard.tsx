import { BookOpen, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { validEnrollment } from "@/lib/productMedia";
import { Button } from "@/components/ui/button";

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
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, status, expires_at")
      .eq("student_id", studentId)
      .eq("course_id", lessons[0].course_id)
      .eq("status", "active");
    const enrollment = enrollments?.find((item) => validEnrollment(item));

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
    <Button variant="ghost"
      type="button"
      onClick={handleClick}
      className="group h-auto w-[240px] flex-shrink-0 cursor-pointer items-stretch whitespace-normal p-0 text-left hover:bg-transparent"
    >
      <div className="relative flex min-h-[360px] w-full flex-col justify-between overflow-hidden rounded-xl bg-secondary transition-all duration-300">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen size={40} className="text-muted-foreground" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        <div className="relative px-5 pt-3 text-xs font-medium text-foreground/90">
          {lessonCount} {lessonCount === 1 ? "Aula" : "Aulas"}
        </div>

        <div className="relative px-5 pb-8 pt-12">
          <h3 className="break-words text-xl font-medium uppercase leading-tight text-foreground [overflow-wrap:anywhere]">
            {title}
          </h3>
        </div>

        <div className="absolute right-4 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Play size={17} fill="currentColor" aria-hidden="true" />
        </div>
      </div>
    </Button>
  );
};

export default ModuleCard;
