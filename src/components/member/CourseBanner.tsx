import { useState } from "react";
import { ImageOff } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { heroCandidates } from "@/lib/productMedia";

interface CourseBannerProps { course: Tables<"courses">; }
const BannerImage = ({ candidates, title }: { candidates: string[]; title: string }) => {
  const [index, setIndex] = useState(0);
  return candidates[index] ? <img src={candidates[index]} alt={title} onError={() => setIndex((current) => current + 1)} className="h-full w-full object-cover" />
    : <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground"><ImageOff size={32} aria-hidden="true" /></div>;
};
const CourseBanner = ({ course }: CourseBannerProps) => {
  const wide = heroCandidates(course);
  const compact = heroCandidates(course, true);
  return <div className="relative h-[38vh] min-h-[260px] max-h-[480px] w-full overflow-hidden bg-secondary md:h-[48vh]">
    <div className="h-full w-full md:hidden"><BannerImage key={course.id + "compact"} candidates={compact} title={course.title} /></div>
    <div className="hidden h-full w-full md:block"><BannerImage key={course.id + "wide"} candidates={wide} title={course.title} /></div>
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
    {course.logo_url && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><img src={course.logo_url} alt={course.title} className="max-h-[20%] max-w-[25%] object-contain" /></div>}
  </div>;
};
export default CourseBanner;
