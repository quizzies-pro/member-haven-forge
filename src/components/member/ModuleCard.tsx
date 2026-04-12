import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import playIcon from "@/assets/play-button.png";

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
        <div className="absolute top-3 left-3 text-white/90 text-xs font-medium tracking-wide">
          {lessonCount} {lessonCount === 1 ? "Aula" : "Aulas"}
        </div>

        {/* Title bottom-left */}
        <div className="absolute bottom-4 left-4 right-14">
          <h3 className="text-lg font-extrabold text-white uppercase leading-tight line-clamp-2">
            {title}
          </h3>
        </div>

        {/* Play button - hover only */}
        <div className="absolute bottom-4 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <img src={playIcon} alt="Play" className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;
