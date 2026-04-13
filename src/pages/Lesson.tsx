import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import MemberLayout from "@/components/member/MemberLayout";
import LessonSidebar from "@/components/member/LessonSidebar";
import type { SidebarLesson } from "@/components/member/LessonSidebar";
import { Star, FileText, Send, CheckCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

const Lesson = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [lesson, setLesson] = useState<Tables<"lessons"> | null>(null);
  const [module, setModule] = useState<Tables<"course_modules"> | null>(null);
  const [course, setCourse] = useState<Tables<"courses"> | null>(null);
  const [materials, setMaterials] = useState<Tables<"lesson_materials">[]>([]);
  const [siblings, setSiblings] = useState<Tables<"lessons">[]>([]);
  const [allSidebarLessons, setAllSidebarLessons] = useState<SidebarLesson[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [question, setQuestion] = useState("");

  useEffect(() => {
    if (!user || !lessonId) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: lessonData } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single();

      setLesson(lessonData);
      if (!lessonData) { setLoading(false); return; }

      // Fetch module, course, materials, siblings in parallel
      const [moduleRes, courseRes, matsRes, sibsRes, enrollmentRes, allModulesRes] = await Promise.all([
        supabase.from("course_modules").select("*").eq("id", lessonData.module_id).single(),
        supabase.from("courses").select("*").eq("id", lessonData.course_id).single(),
        supabase.from("lesson_materials").select("*").eq("lesson_id", lessonId).eq("is_visible", true).order("sort_order"),
        supabase.from("lessons").select("*").eq("module_id", lessonData.module_id).eq("status", "published").order("sort_order"),
        supabase.from("enrollments").select("id").eq("student_id", user.id).eq("course_id", lessonData.course_id).eq("status", "active").single(),
        supabase.from("course_modules").select("*").eq("course_id", lessonData.course_id).eq("status", "published").order("sort_order"),
      ]);

      setModule(moduleRes.data);
      setCourse(courseRes.data);
      setMaterials(matsRes.data || []);
      setSiblings(sibsRes.data || []);

      // Fetch ALL lessons across all modules for sidebar timeline
      if (allModulesRes.data && allModulesRes.data.length > 0) {
        const { data: allLessonsData } = await supabase
          .from("lessons")
          .select("id, title, module_id, sort_order")
          .eq("course_id", lessonData.course_id)
          .eq("status", "published")
          .order("sort_order");

        const moduleMap = new Map(allModulesRes.data.map((m) => [m.id, m]));
        const sorted = (allLessonsData || []).sort((a, b) => {
          const modA = moduleMap.get(a.module_id);
          const modB = moduleMap.get(b.module_id);
          const modOrder = (modA?.sort_order || 0) - (modB?.sort_order || 0);
          return modOrder !== 0 ? modOrder : a.sort_order - b.sort_order;
        });

        setAllSidebarLessons(
          sorted.map((l) => ({
            id: l.id,
            title: l.title,
            moduleTitle: moduleMap.get(l.module_id)?.title || "",
            moduleId: l.module_id,
          }))
        );
      }

      if (enrollmentRes.data) {
        setEnrollmentId(enrollmentRes.data.id);
        const { data: completedLessons } = await supabase
          .from("enrollment_lessons")
          .select("lesson_id")
          .eq("enrollment_id", enrollmentRes.data.id);

        const ids = completedLessons?.map((c) => c.lesson_id) || [];
        setCompletedIds(ids);
        setIsCompleted(ids.includes(lessonId));
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
      setCompletedIds((prev) => [...prev, lessonId]);
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
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 pt-4">
        <div className="py-6">
          {/* Breadcrumb */}
          <div className="mb-4">
            <h2 className="text-lg md:text-xl font-bold text-foreground">
              {module?.title || "Módulo"}
            </h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              {prevLesson && (
                <button
                  onClick={() => navigate(`/aula/${prevLesson.id}`)}
                  className="hover:text-foreground transition-colors truncate max-w-[200px]"
                >
                  {prevLesson.title}
                </button>
              )}
              {prevLesson && nextLesson && <span className="text-muted-foreground/50">|</span>}
              {nextLesson && (
                <button
                  onClick={() => navigate(`/aula/${nextLesson.id}`)}
                  className="hover:text-foreground transition-colors truncate max-w-[200px]"
                >
                  {nextLesson.title}
                </button>
              )}
            </div>
          </div>

          {/* Video Player + Sidebar row */}
          <div className="flex items-stretch gap-6 mb-6 relative overflow-visible">
            {embedUrl && (
              <div className="relative flex-1 aspect-video rounded-xl overflow-hidden bg-card z-10">
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={lesson.title}
                />
              </div>
            )}

            {/* Sidebar aligned to video height */}
            <div className="hidden md:flex w-10 flex-shrink-0">
              <LessonSidebar
                lessons={allSidebarLessons}
                currentLessonId={lessonId || ""}
                completedLessonIds={completedIds}
              />
            </div>
          </div>

          {/* Stars + Complete button right-aligned with video */}
          <div className="flex items-center justify-end gap-4 mb-6" style={{ marginRight: 'calc(40px + 1.5rem)' }}>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={20} className="text-primary fill-primary" />
              ))}
            </div>
            <button
              onClick={handleComplete}
              disabled={isCompleted || completing}
              className={`flex items-center gap-2 px-5 py-2.5 rounded text-sm font-bold uppercase tracking-wider transition-all ${
                isCompleted
                  ? "border border-primary/40 text-primary cursor-default"
                  : "border border-foreground/30 text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              <CheckCircle size={18} />
              {isCompleted ? "Concluída" : completing ? "..." : "Marcar como concluído"}
            </button>
          </div>

          {/* Info Block */}
          <div className="mb-8">
            <div className="flex-1 min-w-0">
              {lesson.tags && lesson.tags.length > 0 && (
                <p className="text-xs text-muted-foreground mb-2">
                  {lesson.tags.join(" · ")}
                </p>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-foreground font-bold text-lg flex-shrink-0">
                  {course?.instructor_name?.charAt(0)?.toUpperCase() || "T"}
                </div>
                <h1 className="text-xl md:text-2xl font-extrabold text-foreground leading-tight">
                  {lesson.title}
                </h1>
              </div>
              {lesson.short_description && (
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {lesson.short_description}
                </p>
              )}
              {lesson.content_html && (
                <div
                  className="prose prose-invert prose-sm max-w-none mt-4"
                  dangerouslySetInnerHTML={{ __html: lesson.content_html }}
                />
              )}
            </div>
          </div>

          {/* Materials */}
          {materials.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-foreground mb-4">Material da aula</h3>
              <div className="space-y-3">
                {materials.map((mat) => (
                  <a
                    key={mat.id}
                    href={mat.file_url || mat.external_link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 bg-destructive rounded flex items-center justify-center text-destructive-foreground text-xs font-bold flex-shrink-0">
                      PDF
                    </div>
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                      {mat.title}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Questions Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-foreground mb-4">Tire suas dúvidas aqui</h3>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Escreva seu texto aqui..."
                className="flex-1 bg-transparent border-b border-muted-foreground/30 text-foreground text-sm py-2 focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
              />
              <button className="border border-foreground/30 text-foreground text-sm font-bold uppercase tracking-wider px-5 py-2 rounded hover:border-primary hover:text-primary transition-colors">
                Enviar
              </button>
            </div>
          </div>
        </div>

      </div>
    </MemberLayout>
  );
};

export default Lesson;
