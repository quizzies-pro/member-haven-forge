import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import MemberLayout from "@/components/member/MemberLayout";
import ProductCard from "@/components/member/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { validEnrollment } from "@/lib/productMedia";
import type { Tables } from "@/integrations/supabase/types";
import homeHero from "@/assets/dive-home-hero-01.png.asset.json";

type Course = Tables<"courses">;
type Category = Tables<"storefront_categories">;
type Link = Tables<"storefront_category_courses">;

const Index = () => {
  const { user, student } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setFailed(false);
      const [categoriesResponse, linksResponse, coursesResponse, enrollmentsResponse] = await Promise.all([
        supabase.from("storefront_categories").select("*").eq("is_active", true).order("display_order"),
        supabase.from("storefront_category_courses").select("*").order("display_order"),
        supabase.from("courses").select("*").eq("status", "published").eq("storefront_visible", true),
        supabase.from("enrollments").select("course_id, status, expires_at").eq("student_id", student?.id || user.id).eq("status", "active"),
      ]);
      if (cancelled) return;
      if ([categoriesResponse, linksResponse, coursesResponse, enrollmentsResponse].some((result) => result.error)) {
        setFailed(true);
      } else {
        setCategories(categoriesResponse.data || []);
        setLinks(linksResponse.data || []);
        setCourses(coursesResponse.data || []);
        setEnrolledCourseIds((enrollmentsResponse.data || []).filter((enrollment) => validEnrollment(enrollment)).map((enrollment) => enrollment.course_id));
      }
      setLoading(false);
    };
    fetchData();
    return () => { cancelled = true; };
  }, [student?.id, user?.id]);

  const enrollmentSet = useMemo(() => new Set(enrolledCourseIds), [enrolledCourseIds]);
  const courseMap = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);
  const visibleCategoryIds = useMemo(() => new Set(categories.map((category) => category.id)), [categories]);
  const linkedIds = useMemo(() => new Set(links.filter((link) => visibleCategoryIds.has(link.category_id)).map((link) => link.course_id)), [links, visibleCategoryIds]);
  const ownedCourses = useMemo(() => courses.filter((course) => linkedIds.has(course.id) && enrollmentSet.has(course.id)), [courses, linkedIds, enrollmentSet]);
  const rows = useMemo(() => categories.map((category) => ({
    category,
    items: links.filter((link) => link.category_id === category.id)
      .map((link) => courseMap.get(link.course_id))
      .filter((course): course is Course => Boolean(course) && !enrollmentSet.has(course.id)),
  })).filter((row) => row.items.length), [categories, links, courseMap, enrollmentSet]);

  return (
    <MemberLayout fullBleed>
      <section className="relative min-h-[520px] overflow-hidden border-b border-border pt-[60px] md:min-h-[430px]">
        <img src={homeHero.url} alt="Paisagem digital azul sob um céu estrelado" className="absolute inset-0 h-full w-full object-cover object-[58%_center] md:object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/65 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/55 via-transparent to-background/15" />
        <div className="relative z-10 mx-auto flex min-h-[460px] max-w-[1280px] flex-col justify-center px-4 py-12 md:min-h-[370px] md:px-6 lg:px-[60px]">
          <div className="max-w-3xl">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.36em] text-muted-foreground md:text-xs">MAIS QUE CONTEÚD0 | UMA COMUNIDADE</p>
            <h1 className="max-w-3xl text-4xl font-medium leading-[1.02] text-foreground md:text-5xl lg:text-6xl">
              Dive Clube, crie ativos digitais&nbsp;<span className="text-primary">do seu jeito com IA.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-foreground/70 md:text-base">Aulas ao vivo todas as sextas as 20:00&nbsp;</p>
            <Button type="button" variant="outline" size="lg" onClick={() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })}
              className="mt-7 border-primary/80 bg-primary/10 text-foreground backdrop-blur-sm hover:bg-primary hover:text-primary-foreground">
              Lista de espera <ArrowRight aria-hidden="true" />
            </Button>
          </div>
          <div className="absolute bottom-7 right-4 flex items-center gap-3 text-xs text-foreground/70 md:right-6 lg:right-[60px]">
            <span className="h-px w-14 bg-primary" /><span>01 / 01</span>
          </div>
        </div>
      </section>
      <div id="catalogo" className="mx-auto max-w-[1280px] scroll-mt-[60px] px-4 py-10 md:px-6 lg:px-[60px] lg:py-14">
        {loading ? <div aria-label="Carregando produtos" className="space-y-6"><Skeleton className="h-8 w-48" /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((n) => <Skeleton key={n} className="aspect-[4/3] w-full" />)}</div></div>
          : failed ? <div className="border-y border-border py-16 text-center"><p>Não foi possível carregar os produtos.</p><p className="mt-2 text-sm text-muted-foreground">Atualize a página para tentar novamente.</p></div>
          : <>
            <section>
              <div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase text-muted-foreground">Sua biblioteca</p><h2 className="mt-1 text-2xl text-foreground">Seus produtos</h2></div><span className="text-sm text-muted-foreground">{ownedCourses.length} {ownedCourses.length === 1 ? "produto" : "produtos"}</span></div>
              {ownedCourses.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{ownedCourses.map((course) => <ProductCard key={course.id} course={course} hasAccess onOpen={() => navigate(`/produto/${course.id}`)} />)}</div>
                : <div className="border-y border-border py-12 text-center text-muted-foreground">Você ainda não possui produtos nesta vitrine.</div>}
            </section>
            {rows.map(({ category, items }) => <section key={category.id} className="mt-14 border-t border-border pt-10">
              <div className="mb-7"><p className="text-xs font-semibold uppercase text-muted-foreground">Descubra</p><h2 className="mt-1 text-2xl text-foreground">{category.name}</h2>{category.description && <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>}</div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((course) => <ProductCard key={course.id} course={course} hasAccess={false} onOpen={() => navigate(`/produto/${course.id}`)} />)}</div>
            </section>)}
            {!ownedCourses.length && !rows.length && <p className="mt-12 text-center text-muted-foreground">Nenhum produto disponível no momento.</p>}
          </>}
      </div>
    </MemberLayout>
  );
};
export default Index;
