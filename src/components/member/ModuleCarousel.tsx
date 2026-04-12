import { useRef, useState, useCallback } from "react";
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
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 5);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 5);
  }, []);

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
    <section className="px-4 md:px-6 lg:px-[60px] py-10 max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[28px] font-extrabold text-foreground">Conteúdo</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-1 text-primary hover:text-primary/80 transition-colors"
          >
            <ChevronLeft size={40} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1 text-primary hover:text-primary/80 transition-colors"
          >
            <ChevronRight size={40} />
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Fade left */}
        {!atStart && (
          <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity" />
        )}
        {/* Fade right */}
        {!atEnd && (
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity" />
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          onLoad={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        >
          {modules.map((mod, i) => (
            <ModuleCard
              key={mod.id}
              id={mod.id}
              title={mod.title}
              coverUrl={mod.cover_url}
              lessonCount={mod.lessonCount}
              isFirst={i === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModuleCarousel;
