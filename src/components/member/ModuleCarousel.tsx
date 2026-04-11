import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ModuleCard from "./ModuleCard";

interface Module {
  id: string;
  title: string;
  cover_url: string | null;
  lessonCount: number;
}

interface ModuleCarouselProps {
  modules: Module[];
}

const ModuleCarousel = ({ modules }: ModuleCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 220;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (!modules.length) return null;

  return (
    <section className="px-4 md:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Conteúdo</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {modules.map((mod) => (
          <ModuleCard
            key={mod.id}
            title={mod.title}
            coverUrl={mod.cover_url}
            lessonCount={mod.lessonCount}
          />
        ))}
      </div>
    </section>
  );
};

export default ModuleCarousel;
