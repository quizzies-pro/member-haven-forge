import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import MemberLayout from "@/components/member/MemberLayout";
import { ArrowLeft, Play, Check, Clock } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const Module = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [module, setModule] = useState<Tables<"course_modules"> | null>(null);
  const [lessons, setLessons] = useState<Tables<"lessons">[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !moduleId) return;

    const fetchData = async () => {
      // Fetch module
      const { data: mod } = await supabase
        .from("course_modules")
        .select("*")
        .eq("id", moduleId)
        .single();

      setModule(mod);

      if (!mod) { setLoading(false); return; }

      // Fetch lessons
      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("*")
        .eq("module_id", moduleId)
        .eq("status", "published")
        .order("sort_order");

      setLessons(lessonsData || []);

      // Fetch completed lessons
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", user.id)
        .eq("course_id", mod.course_id)
        .eq("status", "active")
        .single();

      if (enrollment) {
        const { data: completed } = await supabase
          .from("enrollment_lessons")
          .select("lesson_id")
          .eq("enrollment_id", enrollment.id);

        if (completed) {
          setCompletedLessons(new Set(completed.map((c) => c.lesson_id)));
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [user, moduleId]);

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return null;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </MemberLayout>
    );
  }

  if (!module) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground text-lg">Módulo não encontrado.</p>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-[60px] py-8">
        {/* Header */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        {/* Module info */}
        <div className="flex items-start gap-6 mb-10">
          {module.cover_url && (
            <img
              src={module.cover_url}
              alt={module.title}
              className="w-32 h-44 rounded-xl object-cover flex-shrink-0"
            />
          )}
          <div>
            <h1 className="text-3xl font-extrabold text-foreground mb-2">{module.title}</h1>
            {module.description && (
              <p className="text-muted-foreground text-sm leading-relaxed">{module.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-3">
              {lessons.length} {lessons.length === 1 ? "aula" : "aulas"} · {completedLessons.size} concluída{completedLessons.size !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Lessons list */}
        <div className="space-y-2">
          {lessons.map((lesson, i) => {
            const isCompleted = completedLessons.has(lesson.id);
            return (
              <div
                key={lesson.id}
                onClick={() => navigate(`/aula/${lesson.id}`)}
                className="flex items-center gap-4 p-4 rounded-xl bg-card hover:bg-secondary/50 cursor-pointer transition-colors group"
              >
                {/* Number / Status */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isCompleted ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  {isCompleted ? <Check size={18} /> : i + 1}
                </div>

                {/* Thumbnail */}
                {lesson.thumbnail_url && (
                  <img
                    src={lesson.thumbnail_url}
                    alt={lesson.title}
                    className="w-24 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {lesson.title}
                  </h3>
                  {lesson.short_description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{lesson.short_description}</p>
                  )}
                </div>

                {/* Duration */}
                {lesson.duration_seconds && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                    <Clock size={14} />
                    {formatDuration(lesson.duration_seconds)}
                  </div>
                )}

                {/* Play */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <Play size={14} className="text-primary-foreground ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MemberLayout>
  );
};

export default Module;
