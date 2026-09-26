import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import MemberLayout from "@/components/member/MemberLayout";
import CourseBanner from "@/components/member/CourseBanner";
import ModuleCarousel from "@/components/member/ModuleCarousel";
import PackContent from "@/components/member/PackContent";
import WaitlistAction from "@/components/member/WaitlistAction";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { safeHttps, validEnrollment, videoEmbed } from "@/lib/productMedia";
import type { Tables } from "@/integrations/supabase/types";

type CourseType = Tables<"courses">;
type ModuleWithCount = Tables<"course_modules"> & { lessonCount: number };
type PackItem = Pick<Tables<"pack_items">, "id" | "collection_id" | "format" | "title" | "description" | "cover_url" | "cover_ratio" | "tags" | "canva_template_url" | "textual_content" | "textual_example" | "drive_available">;
type PackData = {
  collections: Tables<"pack_collections">[];
  items: PackItem[];
  videos: Tables<"pack_videos">[];
};
const Course = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, student } = useAuth();
  const [course, setCourse] = useState<CourseType | null>(null);
  const [modules, setModules] = useState<ModuleWithCount[]>([]);
  const [pack, setPack] = useState<PackData>({ collections: [], items: [], videos: [] });
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!courseId || !user) return;
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true); setError(false); setHasAccess(false); setCourse(null);
      const [courseRes, enrollmentRes] = await Promise.all([
        supabase.from("courses").select("*").eq("id", courseId).eq("status", "published").maybeSingle(),
        supabase.from("enrollments").select("id, status, expires_at").eq("student_id", student?.id || user.id).eq("course_id", courseId).eq("status", "active"),
      ]);
      if (cancelled) return;
      if (courseRes.error || enrollmentRes.error) { setError(true); setLoading(false); return; }
      const access = (enrollmentRes.data || []).some((item) => validEnrollment(item));
      const product = courseRes.data;
      if (!product || (!access && !product.storefront_visible)) { setLoading(false); return; }
      setCourse(product);
      setHasAccess(access);
      if (!access) { setLoading(false); return; }
      if (product.product_type === "pack") {
        const [collections, items, videos] = await Promise.all([
          supabase.from("pack_collections").select("*").eq("course_id", courseId).eq("is_visible", true).order("sort_order"),
          supabase.from("pack_items").select("id, collection_id, format, title, description, cover_url, cover_ratio, tags, canva_template_url, textual_content, textual_example, drive_available").eq("course_id", courseId).eq("status", "published").order("sort_order"),
          supabase.from("pack_videos").select("*").eq("course_id", courseId).eq("status", "published").order("sort_order"),
        ]);
        if (cancelled) return;
        if (collections.error || items.error || videos.error) setError(true);
        else {
          const visibleIds = new Set((collections.data || []).map((item) => item.id));
          setPack({ collections: collections.data || [], items: (items.data || []).filter((item) => !item.collection_id || visibleIds.has(item.collection_id)), videos: videos.data || [] });
        }
      } else if (product.product_type === "course") {
        const [modulesRes, lessonsRes] = await Promise.all([
          supabase.from("course_modules").select("*").eq("course_id", courseId).eq("status", "published").order("sort_order"),
          supabase.from("lessons").select("id, module_id").eq("course_id", courseId).eq("status", "published"),
        ]);
        if (cancelled) return;
        if (modulesRes.error || lessonsRes.error) setError(true);
        else {
          const counts: Record<string, number> = {};
          lessonsRes.data?.forEach((lesson) => { counts[lesson.module_id] = (counts[lesson.module_id] || 0) + 1; });
          setModules((modulesRes.data || []).map((item) => ({ ...item, lessonCount: counts[item.id] || 0 })));
        }
      }
      setLoading(false);
    };
    fetchData();
    return () => { cancelled = true; };
  }, [courseId, student?.id, user]);

  if (loading) return <MemberLayout><div className="mx-auto max-w-[1280px] space-y-6 px-4 py-20 md:px-6 lg:px-[60px]"><Skeleton className="aspect-[16/5] w-full" /><Skeleton className="h-10 w-72" /><Skeleton className="h-24 w-full" /></div></MemberLayout>;
  if (!course) return <MemberLayout><div className="mx-auto max-w-[1280px] px-4 py-20 md:px-6 lg:px-[60px]"><p className="text-muted-foreground">{error ? "Não foi possível carregar este produto." : "Produto indisponível."}</p><Button asChild variant="outline" className="mt-5"><Link to="/">Voltar ao início</Link></Button></div></MemberLayout>;
  const customAction = course.presentation_button_enabled && course.presentation_button_text?.trim() && safeHttps(course.presentation_button_url);
  const checkout = !hasAccess && course.available_for_sale ? safeHttps(course.checkout_url) : null;
  const trailer = course.product_type === "course" && course.trailer_url ? videoEmbed(course.trailer_url) : null;
  return <MemberLayout fullBleed>
    <div className="pt-[60px]"><CourseBanner course={course} /></div>
    <div className="mx-auto max-w-[1280px] px-4 pb-8 pt-8 md:px-6 lg:px-[60px]">
      <Button asChild variant="ghost" className="mb-6 -ml-4 text-muted-foreground"><Link to="/"><ArrowLeft /> Início</Link></Button>
      <p className="mb-3 text-xs font-medium uppercase text-primary">{course.product_type === "pack" ? "Pack" : "Curso"}</p>
      <h1 className="max-w-3xl text-3xl text-foreground md:text-5xl">{course.title}</h1>
      {course.short_description && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{course.short_description}</p>}
      {course.full_description && <p className="mt-6 max-w-3xl whitespace-pre-wrap break-words text-sm leading-7 text-foreground/80">{course.full_description}</p>}
      {trailer && <div className="mt-8 aspect-video max-w-3xl overflow-hidden bg-secondary"><iframe src={trailer} title={`Apresentação de ${course.title}`} loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="h-full w-full" /></div>}
      <div className="mt-8 flex flex-wrap gap-3">
        {hasAccess && <Button asChild><a href="#conteudo">Ver conteúdo <ArrowUpRight /></a></Button>}
        {customAction && <Button asChild variant="outline"><a href={customAction} target="_blank" rel="noopener noreferrer">{course.presentation_button_text} <ArrowUpRight /></a></Button>}
        {checkout && <Button asChild><a href={checkout} target="_blank" rel="noopener noreferrer">Comprar produto <ArrowUpRight /></a></Button>}
      </div>
      {!hasAccess && <div className="mt-10 border-t border-border pt-8"><p className="mb-5 text-muted-foreground">Você ainda não possui acesso a este produto.</p>{!course.available_for_sale && courseId && <WaitlistAction courseId={courseId} />}{course.available_for_sale && !checkout && <p className="text-sm text-muted-foreground">Compra indisponível no momento.</p>}</div>}
    </div>
    {hasAccess && <section id="conteudo" className="scroll-mt-[72px] border-t border-border">
      {error ? <p className="mx-auto max-w-[1280px] px-4 py-12 text-muted-foreground md:px-6 lg:px-[60px]">Não foi possível carregar o conteúdo. Atualize a página para tentar novamente.</p>
        : course.product_type === "pack" ? <PackContent {...pack} format={course.pack_format} />
          : course.product_type === "course" ? modules.length ? <ModuleCarousel modules={modules} /> : <p className="mx-auto max-w-[1280px] px-4 py-12 text-muted-foreground md:px-6 lg:px-[60px]">Conteúdo indisponível no momento.</p>
            : <p className="mx-auto max-w-[1280px] px-4 py-12 text-muted-foreground md:px-6 lg:px-[60px]">Conteúdo indisponível no momento.</p>}
    </section>}
  </MemberLayout>;
};
export default Course;
