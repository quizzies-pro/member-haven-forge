import { ArrowUpRight, CheckCircle2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import RatioMedia from "./RatioMedia";
import { coverCandidates } from "@/lib/productMedia";
import type { Tables } from "@/integrations/supabase/types";

interface ProductCardProps {
  course: Tables<"courses">;
  hasAccess: boolean;
  onOpen: () => void;
}

const ProductCard = ({ course, hasAccess, onOpen }: ProductCardProps) => (
  <article className="group overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-primary/50">
    <Button type="button" variant="ghost" onClick={onOpen}
      aria-label={`Conhecer ${course.product_type === "pack" ? "Pack" : "Curso"}: ${course.title}`}
      className="relative block h-auto w-full overflow-hidden rounded-none p-0 text-left hover:bg-transparent">
      <RatioMedia candidates={coverCandidates(course, "16:9")} ratio="16:9" alt={course.title}
        imageClassName="transition-transform duration-500 group-hover:scale-[1.03]" />
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-sm border border-border bg-background/85 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
        {hasAccess ? <CheckCircle2 className="text-primary" size={15} /> : <LockKeyhole className="text-muted-foreground" size={14} />}
        <span className="text-foreground">{hasAccess ? "Seu produto" : course.product_type === "pack" ? "Pack" : "Curso"}</span>
      </div>
    </Button>
    <div className="p-5">
      <p className="text-xs text-primary">{course.product_type === "pack" ? "PACK" : "CURSO"}</p>
      <h3 className="mt-1 text-xl text-foreground">{course.title}</h3>
      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-muted-foreground">
        {course.short_description || "Conteúdo exclusivo do Dive Club."}
      </p>
      <Button type="button" onClick={onOpen} variant={hasAccess ? "default" : "outline"} className="mt-5 w-full justify-between">
        <span>{hasAccess ? "Acessar produto" : "Conhecer produto"}</span><ArrowUpRight size={17} />
      </Button>
    </div>
  </article>
);
export default ProductCard;
