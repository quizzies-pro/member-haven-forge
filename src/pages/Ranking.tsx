import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import MemberLayout from "@/components/member/MemberLayout";
import { Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RankEntry {
  student_id: string;
  name: string;
  avatar_url: string | null;
  completed_count: number;
}

const Ranking = () => {
  const { user } = useAuth();
  const [ranking, setRanking] = useState<RankEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchRanking = async () => {
      // Get user's enrollment to find course_id
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", user.id)
        .eq("status", "active")
        .limit(1)
        .single();

      if (!enrollment) { setLoading(false); return; }

      // Get all enrollments for this course
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("id, student_id")
        .eq("course_id", enrollment.course_id)
        .eq("status", "active");

      if (!enrollments || !enrollments.length) { setLoading(false); return; }

      // Get completed lessons counts per enrollment
      const enrollmentIds = enrollments.map(e => e.id);
      const { data: completedData } = await supabase
        .from("enrollment_lessons")
        .select("enrollment_id")
        .in("enrollment_id", enrollmentIds);

      const countByEnrollment: Record<string, number> = {};
      completedData?.forEach(c => {
        countByEnrollment[c.enrollment_id] = (countByEnrollment[c.enrollment_id] || 0) + 1;
      });

      // Get student data
      const studentIds = [...new Set(enrollments.map(e => e.student_id))];
      const { data: students } = await supabase
        .from("students")
        .select("id, name, avatar_url")
        .in("id", studentIds);

      const studentMap: Record<string, { name: string; avatar_url: string | null }> = {};
      students?.forEach(s => { studentMap[s.id] = { name: s.name, avatar_url: s.avatar_url }; });

      // Build ranking
      const rankMap: Record<string, number> = {};
      enrollments.forEach(e => {
        rankMap[e.student_id] = (rankMap[e.student_id] || 0) + (countByEnrollment[e.id] || 0);
      });

      const result: RankEntry[] = Object.entries(rankMap)
        .map(([sid, count]) => ({
          student_id: sid,
          name: studentMap[sid]?.name || "Aluno",
          avatar_url: studentMap[sid]?.avatar_url || null,
          completed_count: count,
        }))
        .sort((a, b) => b.completed_count - a.completed_count)
        .slice(0, 50);

      setRanking(result);
      setLoading(false);
    };

    fetchRanking();
  }, [user]);

  const getMedalColor = (i: number) => {
    if (i === 0) return "text-yellow-400";
    if (i === 1) return "text-gray-300";
    if (i === 2) return "text-orange-400";
    return "text-muted-foreground";
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
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-[60px] py-10">
        <h1 className="text-3xl font-extrabold text-foreground mb-8 flex items-center gap-3">
          <Trophy size={32} className="text-primary" />
          Ranking
        </h1>

        {ranking.length === 0 ? (
          <p className="text-muted-foreground">Nenhum dado de ranking disponível ainda.</p>
        ) : (
          <div className="space-y-2">
            {ranking.map((entry, i) => {
              const initials = entry.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
              const isCurrentUser = entry.student_id === user?.id;

              return (
                <div
                  key={entry.student_id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                    isCurrentUser ? "bg-primary/10 border border-primary/30" : "bg-card"
                  }`}
                >
                  <span className={`text-2xl font-extrabold w-10 text-center ${getMedalColor(i)}`}>
                    {i < 3 ? "🏆" : i + 1}
                  </span>

                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.avatar_url || undefined} />
                    <AvatarFallback className="bg-secondary text-foreground text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {entry.name}
                      {isCurrentUser && <span className="text-primary ml-2 text-xs">(você)</span>}
                    </p>
                  </div>

                  <span className="text-sm font-bold text-primary">
                    {entry.completed_count} {entry.completed_count === 1 ? "aula" : "aulas"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MemberLayout>
  );
};

export default Ranking;
