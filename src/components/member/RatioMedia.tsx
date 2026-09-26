import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { ratioClass, type MediaRatio } from "@/lib/productMedia";
import { cn } from "@/lib/utils";

interface Props {
  candidates: string[];
  ratio: MediaRatio;
  alt: string;
  className?: string;
  imageClassName?: string;
}

const RatioMedia = ({ candidates, ratio, alt, className, imageClassName }: Props) => {
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [candidates.join("|")]);
  return (
    <div className={cn("relative overflow-hidden bg-secondary", ratioClass[ratio], className)}>
      {candidates[index] ? (
        <img src={candidates[index]} alt={alt} loading="lazy" onError={() => setIndex((current) => current + 1)}
          className={cn("h-full w-full", index === 0 ? "object-cover" : "object-contain", imageClassName)} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground"><ImageOff aria-hidden="true" size={28} /></div>
      )}
    </div>
  );
};
export default RatioMedia;
