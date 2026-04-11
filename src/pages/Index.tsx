import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import MemberLayout from "@/components/member/MemberLayout";
import CourseBanner from "@/components/member/CourseBanner";
import ModuleCarousel from "@/components/member/ModuleCarousel";
import type { Tables } from "@/integrations/supabase/types";

interface ModuleWithCount extends Tables<"course_modules"> {
  lessonCount: number;
}

const Index = () => {
  const { user } = useAuth();
  const [course, setCourse] = useState<Tables<"courses"> | null>(null);
  const [modules, setModules] = useState<ModuleWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", user.id)
        .eq("status", "active")
        .limit(1)
        .single();

      if (!enrollment) {
        setLoading(false);
        return;
      }

      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("id", enrollment.course_id)
        .single();

      setCourse(courseData);

      const { data: modulesData } = await supabase
        .from("course_modules")
        .select("*")
        .eq("course_id", enrollment.course_id)
        .eq("status", "published")
        .order("sort_order");

      if (modulesData) {
        const { data: lessons } = await supabase
          .from("lessons")
          .select("id, module_id")
          .eq("course_id", enrollment.course_id)
          .eq("status", "published");

        const lessonCounts: Record<string, number> = {};
        lessons?.forEach((l) => {
          lessonCounts[l.module_id] = (lessonCounts[l.module_id] || 0) + 1;
        });

        setModules(
          modulesData.map((m) => ({
            ...m,
            lessonCount: lessonCounts[m.id] || 0,
          }))
        );
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </MemberLayout>
    );
  }

  if (!course) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground text-lg">Nenhum curso encontrado.</p>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout logoUrl={course.logo_url}>
      <CourseBanner bannerUrl={course.banner_url} title={course.title} logoUrl={course.logo_url} />
      <ModuleCarousel modules={modules} />
    </MemberLayout>
  );
};

export default Index;
