import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import MemberLayout from "@/components/member/MemberLayout";
import CourseBanner from "@/components/member/CourseBanner";
import ModuleCarousel from "@/components/member/ModuleCarousel";
import type { Tables } from "@/integrations/supabase/types";

interface ModuleWithCount extends Tables<"course_modules"> {
  lessonCount: number;
}

const Course = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, student } = useAuth();
  const [course, setCourse] = useState<Tables<"courses"> | null>(null);
  const [modules, setModules] = useState<ModuleWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const studentId = student?.id || user?.id;
    if (!studentId || !courseId) return;

    const fetchData = async () => {
      setLoading(true);
      setDenied(false);

      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", studentId)
        .eq("course_id", courseId)
        .eq("status", "active")
        .maybeSingle();

      if (!enrollment) {
        setDenied(true);
        setLoading(false);
        return;
      }

      const [{ data: courseData }, { data: modulesData }, { data: lessons }] = await Promise.all([
        supabase.from("courses").select("*").eq("id", courseId).eq("status", "published").maybeSingle(),
        supabase.from("course_modules").select("*").eq("course_id", courseId).eq("status", "published").order("sort_order"),
        supabase.from("lessons").select("id, module_id").eq("course_id", courseId).eq("status", "published"),
      ]);

      if (!courseData) {
        setDenied(true);
        setLoading(false);
        return;
      }

      const lessonCounts: Record<string, number> = {};
      lessons?.forEach((lesson) => {
        lessonCounts[lesson.module_id] = (lessonCounts[lesson.module_id] || 0) + 1;
      });

      setCourse(courseData);
      setModules((modulesData || []).map((item) => ({
        ...item,
        lessonCount: lessonCounts[item.id] || 0,
      })));
      setLoading(false);
    };

    fetchData();
  }, [courseId, student?.id, user?.id]);

  if (denied) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </MemberLayout>
    );
  }

  if (!course) return <Navigate to="/" replace />;

  return (
    <MemberLayout logoUrl={course.logo_url} fullBleed={Boolean(course.banner_url)}>
      <CourseBanner bannerUrl={course.banner_url} title={course.title} logoUrl={course.logo_url} />
      <ModuleCarousel modules={modules} />
    </MemberLayout>
  );
};

export default Course;