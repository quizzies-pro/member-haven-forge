import { ArrowUpRight, CheckCircle2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

interface ProductCardProps {
  course: Tables<"courses">;
  hasAccess: boolean;
  onOpen: () => void;
}

const ProductCard = ({ course, hasAccess, onOpen }: ProductCardProps) => {
  const canBuy = Boolean(course.checkout_url);

  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50">
      <button
        type="button"
        onClick={onOpen}
        disabled={!hasAccess && !canBuy}
        aria-label={`${hasAccess ? "Acessar" : canBuy ? "Conhecer" : "Produto indisponível"}: ${course.title}`}
        className="relative block aspect-[16/9] w-full overflow-hidden bg-secondary text-left disabled:cursor-not-allowed"
      >
        {course.cover_url || course.banner_url ? (
          <img
            src={course.cover_url || course.banner_url || ""}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl font-extrabold text-muted-foreground/30">
            {course.title.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
          {hasAccess ? (
            <>
              <CheckCircle2 className="text-primary" size={15} />
              <span className="text-foreground">Seu produto</span>
            </>
          ) : (
            <>
              <LockKeyhole className="text-muted-foreground" size={14} />
              <span className="text-muted-foreground">Conheça</span>
            </>
          )}
        </div>
      </button>

      <div className="p-5">
        <h2 className="text-xl font-extrabold text-foreground">{course.title}</h2>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-muted-foreground">
          {course.short_description || "Conteúdo exclusivo do Dive Club."}
        </p>
        <Button
          type="button"
          onClick={onOpen}
          disabled={!hasAccess && !canBuy}
          variant={hasAccess ? "default" : "outline"}
          className="mt-5 w-full justify-between"
        >
          <span>{hasAccess ? "Acessar produto" : canBuy ? "Quero conhecer" : "Em breve"}</span>
          {hasAccess || canBuy ? <ArrowUpRight size={17} /> : <LockKeyhole size={16} />}
        </Button>
      </div>
    </article>
  );
};

export default ProductCard;