import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import MemberLayout from "@/components/member/MemberLayout";
import ProductCard from "@/components/member/ProductCard";
import type { Tables } from "@/integrations/supabase/types";
import diveClubLogo from "@/assets/dive-club-logo-white.png.asset.json";

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
    <MemberLayout>
      <section className="border-b border-border bg-card/40 pt-16">
        <div className="mx-auto max-w-[1280px] px-4 py-12 md:px-6 lg:px-[60px] lg:py-16">
          <img
            src={diveClubLogo.url}
            alt="Dive Club"
            className="mb-6 h-auto w-44 object-contain md:w-52"
          />
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight text-foreground md:text-5xl">
            Seus produtos em um só lugar.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Acesse seus conteúdos ou descubra novas experiências disponíveis no clube.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-10 md:px-6 lg:px-[60px] lg:py-14">
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
