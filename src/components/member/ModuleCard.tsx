import { Play, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ModuleCardProps {
  id: string;
  title: string;
  coverUrl?: string | null;
  lessonCount: number;
  isFirst?: boolean;
}

const ModuleCard = ({ id, title, coverUrl, lessonCount, isFirst }: ModuleCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/modulo/${id}`)}
      className="group flex-shrink-0 w-[240px] cursor-pointer"
    >
      <div className="relative w-[240px] h-[360px] rounded-xl overflow-hidden bg-secondary transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_0_20px_hsl(72_100%_47%/0.3)]">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={40} className="text-muted-foreground" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        {/* Badge top-left */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-foreground text-[11px] font-medium px-2.5 py-1 rounded-full">
          {lessonCount} {lessonCount === 1 ? "Aula" : "Aulas"}
        </div>

        {/* Title bottom-left */}
        <div className="absolute bottom-3 left-3 right-10">
          <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-2">
            {title}
          </h3>
        </div>

        {/* Play button */}
        <div className={`absolute bottom-3 right-3 transition-opacity ${isFirst ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <Play size={14} className="text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;
