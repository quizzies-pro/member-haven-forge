import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import MemberLayout from "@/components/member/MemberLayout";
import LessonSidebar from "@/components/member/LessonSidebar";
import ModuleAccordion from "@/components/member/ModuleAccordion";
import type { SidebarLesson } from "@/components/member/LessonSidebar";
import { Star, FileText, Send, CheckCircle, Play, Trophy, ChevronRight } from "lucide-react";
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
  const [sendingQuestion, setSendingQuestion] = useState(false);
  const [messages, setMessages] = useState<Tables<"lesson_messages">[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [savingRating, setSavingRating] = useState(false);
  const [allModules, setAllModules] = useState<Tables<"course_modules">[]>([]);
  const [allLessonsList, setAllLessonsList] = useState<{ id: string; title: string; module_id: string; sort_order: number }[]>([]);
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
        setAllModules(allModulesRes.data);
        const { data: allLessonsData } = await supabase
          .from("lessons")
          .select("id, title, module_id, sort_order, thumbnail_url")
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
            thumbnailUrl: l.thumbnail_url || null,
            moduleCoverUrl: moduleMap.get(l.module_id)?.cover_url || null,
          }))
        );

        setAllLessonsList(
          sorted.map((l) => ({
            id: l.id,
            title: l.title,
            module_id: l.module_id,
            sort_order: l.sort_order,
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

      // Fetch user's existing rating
      const { data: ratingData } = await supabase
        .from("lesson_ratings")
        .select("*")
        .eq("lesson_id", lessonId)
        .eq("student_id", user.id)
        .maybeSingle();
      if (ratingData) setUserRating(ratingData.rating);

      // Fetch messages for this lesson
      const { data: messagesData } = await supabase
        .from("lesson_messages")
        .select("*")
        .eq("lesson_id", lessonId)
        .eq("student_id", user.id)
        .order("created_at", { ascending: true });
      setMessages(messagesData || []);

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

  const handleSendQuestion = async () => {
    if (!question.trim() || !user || !lessonId || !lesson) return;
    setSendingQuestion(true);
    const { data, error } = await supabase
      .from("lesson_messages")
      .insert({
        student_id: user.id,
        lesson_id: lessonId,
        course_id: lesson.course_id,
        message: question.trim(),
        sender_type: "student",
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Erro", description: "Não foi possível enviar sua dúvida.", variant: "destructive" });
    } else {
      setQuestion("");
      if (data) setMessages((prev) => [...prev, data]);
      toast({ title: "Dúvida enviada! 📩" });
    }
    setSendingQuestion(false);
  };

  const handleRating = async (rating: number) => {
    if (!user || !lessonId || savingRating) return;
    setSavingRating(true);
    const { data: existing } = await supabase
      .from("lesson_ratings")
      .select("id")
      .eq("lesson_id", lessonId)
      .eq("student_id", user.id)
      .maybeSingle();

    if (existing) {
      await supabase.from("lesson_ratings").update({ rating }).eq("id", existing.id);
    } else {
      await supabase.from("lesson_ratings").insert({ student_id: user.id, lesson_id: lessonId, rating });
    }
    setUserRating(rating);
    setSavingRating(false);
    toast({ title: `Avaliação: ${rating} estrela${rating > 1 ? "s" : ""} ⭐` });
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
            <div className="hidden md:flex w-10 flex-shrink-0 relative z-30">
              <LessonSidebar
                lessons={allSidebarLessons}
                currentLessonId={lessonId || ""}
                completedLessonIds={completedIds}
              />
            </div>
          </div>

          {/* Lesson info + Stars + Complete - single row aligned with video */}
          <div className="flex items-center justify-between mb-6" style={{ marginRight: 'calc(40px + 1.5rem)' }}>
            {/* Left: module cover + lesson title */}
            <div className="flex items-center gap-3 min-w-0">
              {module?.cover_url ? (
                <img
                  src={module.cover_url}
                  alt={module.title || "Módulo"}
                  className="w-12 h-12 rounded-sm object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-sm bg-secondary flex items-center justify-center text-foreground font-bold text-lg flex-shrink-0">
                  {module?.title?.charAt(0)?.toUpperCase() || "M"}
                </div>
              )}
              <h1 className="text-xl md:text-2xl font-extrabold text-foreground leading-tight truncate">
                {lesson.title}
              </h1>
            </div>

            {/* Right: stars + complete button */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    onClick={() => handleRating(i)}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    disabled={savingRating}
                    className="transition-transform hover:scale-110 disabled:opacity-50"
                  >
                    <Star
                      size={20}
                      className={
                        (hoverRating || userRating) >= i
                          ? "text-primary fill-primary"
                          : "text-muted-foreground"
                      }
                    />
                  </button>
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
          </div>

          {/* Info Block - above columns */}
          <div className="mb-6" style={{ marginRight: 'calc(40px + 1.5rem)' }}>
            {lesson.tags && lesson.tags.length > 0 && (
              <p className="text-xs text-muted-foreground mb-2">
                {lesson.tags.join(" · ")}
              </p>
            )}
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

          {/* Two-column layout: Materials left + Accordion right */}
          <div className="flex gap-6 items-start" style={{ marginRight: 'calc(40px + 1.5rem)' }}>
            {/* Left column: materials, questions */}
            <div className="flex-1 min-w-0">
              {/* Materials */}
              {materials.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-foreground mb-4">Material da aula</h3>
                  <div className="space-y-3">
                    {materials.map((mat) => (
                      <button
                        key={mat.id}
                        type="button"
                        onClick={async () => {
                          const rawUrl = mat.file_url || mat.external_link;
                          if (!rawUrl) return;

                          const fileName = /\.[a-z0-9]{2,5}$/i.test(mat.title || "")
                            ? (mat.title || "material")
                            : `${mat.title || "material"}.pdf`;

                          let storagePath: string | null = null;

                          try {
                            const parsedUrl = new URL(rawUrl);
                            const markers = [
                              "/storage/v1/object/public/materials/",
                              "/storage/v1/object/authenticated/materials/",
                              "/storage/v1/object/sign/materials/",
                            ];
                            const matchedMarker = markers.find((marker) => parsedUrl.pathname.includes(marker));
                            if (matchedMarker) {
                              storagePath = decodeURIComponent(parsedUrl.pathname.split(matchedMarker)[1] || "");
                            }
                          } catch {
                            storagePath = null;
                          }

                          try {
                            let blob: Blob;

                            if (storagePath) {
                              const { data, error } = await supabase.storage.from("materials").download(storagePath);
                              if (error || !data) throw error || new Error("Download failed");
                              blob = data;
                            } else {
                              const response = await fetch(rawUrl);
                              if (!response.ok) throw new Error("Download failed");
                              blob = await response.blob();
                            }

                            const blobUrl = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = blobUrl;
                            link.download = fileName;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(blobUrl);
                          } catch {
                            if (!storagePath && rawUrl) {
                              window.open(rawUrl, "_blank", "noopener,noreferrer");
                              return;
                            }

                            toast({
                              title: "Não foi possível baixar o material",
                              description: "Esse arquivo precisa estar acessível no bucket materials.",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="flex items-center gap-3 group cursor-pointer text-left"
                      >
                        <div className="w-10 h-10 bg-destructive rounded flex items-center justify-center text-destructive-foreground text-xs font-bold flex-shrink-0">
                          PDF
                        </div>
                        <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                          {mat.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions Section */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-foreground mb-4">Tire suas dúvidas aqui</h3>

                {/* Previous messages */}
                {messages.length > 0 && (
                  <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-1">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`text-sm p-3 rounded-lg ${
                          msg.sender_type === "student"
                            ? "bg-secondary/50 text-foreground ml-4"
                            : "bg-primary/10 text-foreground mr-4 border border-primary/20"
                        }`}
                      >
                        <p className="text-xs text-muted-foreground mb-1">
                          {msg.sender_type === "student" ? "Você" : "Professor"} · {new Date(msg.created_at).toLocaleDateString("pt-BR")}
                        </p>
                        <p>{msg.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendQuestion()}
                    placeholder="Escreva seu texto aqui..."
                    className="flex-1 bg-transparent border-b border-muted-foreground/30 text-foreground text-sm py-2 focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50 mx-0 my-[40px]"
                  />
                  <button
                    onClick={handleSendQuestion}
                    disabled={sendingQuestion || !question.trim()}
                    className="border border-foreground/30 text-foreground text-sm font-bold uppercase tracking-wider px-5 py-2 rounded hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                  >
                    {sendingQuestion ? "..." : "Enviar"}
                  </button>
                </div>
              </div>

            </div>

            {/* Right column: Module accordion */}
            {allModules.length > 0 && (
              <div className="hidden md:block w-[340px] flex-shrink-0 pt-3">
                <h3 className="text-lg font-bold text-foreground mb-4">Conteúdo do curso</h3>
                <div className="max-h-[240px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                  <ModuleAccordion
                    modules={allModules}
                    lessonsByModule={allLessonsList.reduce<Record<string, { id: string; title: string; module_id: string; sort_order: number }[]>>((acc, l) => {
                      if (!acc[l.module_id]) acc[l.module_id] = [];
                      acc[l.module_id].push(l);
                      return acc;
                    }, {})}
                    currentLessonId={lessonId || ""}
                    completedLessonIds={completedIds}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Course Progress - full width below */}
          {allLessonsList.length > 0 && (
            <div className="mt-6 p-4 rounded-lg border border-primary/30 bg-card/20" style={{ marginRight: 'calc(40px + 1.5rem)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={18} className="text-primary" />
                <span className="text-sm font-bold text-foreground">Seu progresso</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((completedIds.length / allLessonsList.length) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {completedIds.length} de {allLessonsList.length} aulas concluídas ({Math.round((completedIds.length / allLessonsList.length) * 100)}%)
              </p>
            </div>
          )}
        </div>
      </div>
    </MemberLayout>
  );
};

export default Lesson;
