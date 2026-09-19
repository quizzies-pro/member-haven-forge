import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import MemberLayout from "@/components/member/MemberLayout";
import ProductCard from "@/components/member/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import homeHero from "@/assets/dive-home-hero-01.png.asset.json";

const Index = () => {
  const { user, student } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Tables<"courses">[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const studentId = student?.id || user?.id;
    if (!studentId) return;

    const fetchData = async () => {
      setLoading(true);
      setFailed(false);
      const [coursesResponse, enrollmentsResponse] = await Promise.all([
        supabase.from("courses").select("*").eq("status", "published").order("display_order"),
        supabase.from("enrollments").select("course_id").eq("student_id", studentId).eq("status", "active"),
      ]);

      if (coursesResponse.error || enrollmentsResponse.error) {
        setFailed(true);
      } else {
        setCourses(coursesResponse.data || []);
        setEnrolledCourseIds(enrollmentsResponse.data?.map((item) => item.course_id) || []);
      }
      setLoading(false);
    };

    fetchData();
  }, [student?.id, user?.id]);

  const enrollmentSet = useMemo(() => new Set(enrolledCourseIds), [enrolledCourseIds]);

  const openCourse = (course: Tables<"courses">) => {
    if (enrollmentSet.has(course.id)) {
      navigate(`/produto/${course.id}`);
      return;
    }
    if (course.checkout_url) {
      window.open(course.checkout_url, "_blank", "noopener,noreferrer");
    }
  };

  const scrollToCatalog = () => {
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
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

  return (
    <MemberLayout fullBleed>
      <section className="relative min-h-[520px] overflow-hidden border-b border-border pt-[60px] md:min-h-[430px]">
        <img
          src={homeHero.url}
          alt="Paisagem digital azul sob um céu estrelado"
          className="absolute inset-0 h-full w-full object-cover object-[58%_center] md:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/65 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/55 via-transparent to-background/15" />

        <div className="relative z-10 mx-auto flex min-h-[460px] max-w-[1450px] flex-col justify-center px-6 py-12 md:min-h-[370px] md:px-12 lg:px-[60px]">
          <div className="max-w-3xl">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.36em] text-muted-foreground md:text-xs">
              Mais que conteúdo
            </p>
            <h1 className="max-w-3xl text-4xl font-medium leading-[1.02] text-foreground md:text-5xl lg:text-6xl">
              Seu acervo, <span className="text-primary">do seu jeito.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-foreground/70 md:text-base">
              Descubra conteúdos, histórias, experiências e conexões que te levam mais longe.
            </p>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={scrollToCatalog}
              className="mt-7 border-primary/80 bg-primary/10 text-foreground backdrop-blur-sm hover:bg-primary hover:text-primary-foreground"
            >
              Explorar agora
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>

          <div className="absolute bottom-7 right-6 flex items-center gap-3 text-xs text-foreground/70 md:right-12 lg:right-[60px]">
            <span className="h-px w-14 bg-primary" />
            <span>01 / 01</span>
          </div>
        </div>
      </section>

      <section id="catalogo" className="mx-auto max-w-[1280px] scroll-mt-[60px] px-4 py-10 md:px-6 lg:px-[60px] lg:py-14">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Catálogo</p>
            <h2 className="mt-1 text-2xl font-extrabold text-foreground">Produtos Dive Club</h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {courses.length} {courses.length === 1 ? "produto" : "produtos"}
          </span>
        </div>

        {failed ? (
          <div className="border-y border-border py-16 text-center">
            <p className="text-foreground">Não foi possível carregar os produtos.</p>
            <p className="mt-2 text-sm text-muted-foreground">Atualize a página para tentar novamente.</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="border-y border-border py-16 text-center">
            <p className="text-muted-foreground">Nenhum produto disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <ProductCard
                key={course.id}
                course={course}
                hasAccess={enrollmentSet.has(course.id)}
                onOpen={() => openCourse(course)}
              />
            ))}
          </div>
        )}
      </section>
    </MemberLayout>
  );
};

export default Index;
