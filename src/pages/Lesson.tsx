import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import MemberLayout from "@/components/member/MemberLayout";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, FileText, Download, ExternalLink } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

const Lesson = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [lesson, setLesson] = useState<Tables<"lessons"> | null>(null);
  const [materials, setMaterials] = useState<Tables<"lesson_materials">[]>([]);
  const [siblings, setSiblings] = useState<Tables<"lessons">[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!user || !lessonId) return;

    const fetchData = async () => {
      setLoading(true);

      // Fetch lesson
      const { data: lessonData } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single();

      setLesson(lessonData);
      if (!lessonData) { setLoading(false); return; }

      // Fetch materials
      const { data: mats } = await supabase
        .from("lesson_materials")
        .select("*")
        .eq("lesson_id", lessonId)
        .eq("is_visible", true)
        .order("sort_order");

      setMaterials(mats || []);

      // Fetch sibling lessons for prev/next
      const { data: sibs } = await supabase
        .from("lessons")
        .select("*")
        .eq("module_id", lessonData.module_id)
        .eq("status", "published")
        .order("sort_order");

      setSiblings(sibs || []);

      // Check completion
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", user.id)
        .eq("course_id", lessonData.course_id)
        .eq("status", "active")
        .single();

      if (enrollment) {
        setEnrollmentId(enrollment.id);
        const { data: completed } = await supabase
          .from("enrollment_lessons")
          .select("id")
          .eq("enrollment_id", enrollment.id)
          .eq("lesson_id", lessonId);

        setIsCompleted(!!(completed && completed.length > 0));
      }

      setLoading(false);
    };

    fetchData();
  }, [user, lessonId]);

  const handleComplete = async () => {
    if (!enrollmentId || !lessonId || isCompleted) return;
    setCompleting(true);

    const { error } = await supabase
      .from("enrollment_lessons")
      .insert({ enrollment_id: enrollmentId, lesson_id: lessonId });

    if (error) {
      toast({ title: "Erro", description: "Não foi possível marcar como concluída.", variant: "destructive" });
    } else {
      setIsCompleted(true);
      toast({ title: "Aula concluída! ✅" });
    }

    setCompleting(false);
  };

  const getVimeoEmbedUrl = (url?: string | null) => {
    if (!url) return null;
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=0&title=0&byline=0&portrait=0` : null;
  };

  const currentIndex = siblings.findIndex((s) => s.id === lessonId);
  const prevLesson = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const nextLesson = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </MemberLayout>
    );
  }

  if (!lesson) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground text-lg">Aula não encontrada.</p>
        </div>
      </MemberLayout>
    );
  }

  const embedUrl = getVimeoEmbedUrl(lesson.video_url);

  return (
    <MemberLayout>
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-[60px] py-6">
        {/* Back */}
        <button
          onClick={() => navigate(`/modulo/${lesson.module_id}`)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Voltar ao módulo</span>
        </button>

        {/* Video Player */}
        {embedUrl && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-card mb-8">
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={lesson.title}
            />
          </div>
        )}

        {/* Title + Complete */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-1">{lesson.title}</h1>
            {lesson.short_description && (
              <p className="text-muted-foreground text-sm">{lesson.short_description}</p>
            )}
          </div>

          <button
            onClick={handleComplete}
            disabled={isCompleted || completing}
            className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              isCompleted
                ? "bg-primary/20 text-primary cursor-default"
                : "bg-primary text-primary-foreground hover:neon-glow"
            }`}
          >
            <CheckCircle size={18} />
            {isCompleted ? "Concluída" : completing ? "..." : "Marcar como concluída"}
          </button>
        </div>

        {/* Content HTML */}
        {lesson.content_html && (
          <div
            className="prose prose-invert prose-sm max-w-none mb-10"
            dangerouslySetInnerHTML={{ __html: lesson.content_html }}
          />
        )}

        {/* Materials */}
        {materials.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-extrabold text-foreground mb-4">Materiais de apoio</h2>
            <div className="space-y-2">
              {materials.map((mat) => (
                <a
                  key={mat.id}
                  href={mat.file_url || mat.external_link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl bg-card hover:bg-secondary/50 transition-colors group"
                >
                  <FileText size={20} className="text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{mat.title}</p>
                    {mat.description && (
                      <p className="text-xs text-muted-foreground truncate">{mat.description}</p>
                    )}
                  </div>
                  {mat.file_url ? (
                    <Download size={18} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  ) : (
                    <ExternalLink size={18} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Prev / Next navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          {prevLesson ? (
            <button
              onClick={() => navigate(`/aula/${prevLesson.id}`)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft size={20} />
              <span className="hidden md:inline">{prevLesson.title}</span>
              <span className="md:hidden">Anterior</span>
            </button>
          ) : <div />}

          {nextLesson ? (
            <button
              onClick={() => navigate(`/aula/${nextLesson.id}`)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="hidden md:inline">{nextLesson.title}</span>
              <span className="md:hidden">Próxima</span>
              <ChevronRight size={20} />
            </button>
          ) : <div />}
        </div>
      </div>
    </MemberLayout>
  );
};

export default Lesson;
