import { BookOpen } from "lucide-react";

interface ModuleCardProps {
  title: string;
  coverUrl?: string | null;
  lessonCount: number;
}

const ModuleCard = ({ title, coverUrl, lessonCount }: ModuleCardProps) => {
  return (
    <div className="group flex-shrink-0 w-48 cursor-pointer">
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary mb-3 border border-border transition-all group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/5">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={40} className="text-muted-foreground" />
          </div>
        )}

        {/* Badge */}
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-foreground text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <BookOpen size={12} />
          {lessonCount} {lessonCount === 1 ? "aula" : "aulas"}
        </div>
      </div>

      <h3 className="text-sm font-medium text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
    </div>
  );
};

export default ModuleCard;
