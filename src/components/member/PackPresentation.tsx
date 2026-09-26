import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Play, ImageOff, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import RatioMedia from "./RatioMedia";
import WaitlistAction from "./WaitlistAction";
import { coverCandidates, heroCandidates, safeHttps, videoEmbed } from "@/lib/productMedia";
import type { Tables } from "@/integrations/supabase/types";

interface Props {
  course: Tables<"courses">;
  hasAccess: boolean;
  videos: Tables<"pack_videos">[];
}

const BackgroundImage = ({ candidates, alt }: { candidates: string[]; alt: string }) => {
  const [index, setIndex] = useState(0);
  return candidates[index] ? <img src={candidates[index]} alt={alt} onError={() => setIndex((current) => current + 1)} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground"><ImageOff aria-hidden="true" /></div>;
};

const PackPresentation = ({ course, hasAccess, videos }: Props) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = videos.find((video) => video.id === selectedId) || videos[0];
  const embed = selected ? videoEmbed(selected.video_url) : null;
  const customAction = course.presentation_button_enabled && course.presentation_button_text?.trim() ? safeHttps(course.presentation_button_url) : null;
  const checkout = !hasAccess && course.available_for_sale ? safeHttps(course.checkout_url) : null;

  return <>
    <section className="relative isolate overflow-hidden border-b border-border bg-background pt-[60px]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="h-full w-full md:hidden"><BackgroundImage key={`${course.id}-compact`} candidates={heroCandidates(course, true)} alt="" /></div>
        <div className="hidden h-full w-full md:block"><BackgroundImage key={`${course.id}-wide`} candidates={heroCandidates(course)} alt="" /></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-background/75 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/75 via-background/30 to-background/60" />
      </div>
      <div className="mx-auto max-w-[1280px] px-4 pb-10 pt-8 md:px-6 md:pb-12 lg:px-[60px] lg:pt-12">
        <Button asChild variant="ghost" className="-ml-4 mb-5 text-muted-foreground"><Link to="/"><ArrowLeft aria-hidden="true" /> Início</Link></Button>
        <div className={`grid items-start gap-8 lg:gap-6 ${hasAccess && videos.length > 1 ? "lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.3fr)_minmax(0,0.65fr)]" : "lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"}`}>
          <div className="min-w-0 lg:pt-2">
            <span className="inline-flex border border-primary/60 px-3 py-1 text-xs font-medium uppercase text-primary">Pack</span>
            <h1 className="mt-5 break-words text-4xl text-foreground md:text-5xl">{course.title}</h1>
            {course.short_description && <p className="mt-4 text-lg leading-relaxed text-foreground">{course.short_description}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              {hasAccess && <Button asChild><a href="#conteudo">Explorar o pack <ArrowUpRight aria-hidden="true" /></a></Button>}
              {checkout && <Button asChild><a href={checkout} target="_blank" rel="noopener noreferrer">Comprar pack <ArrowUpRight aria-hidden="true" /></a></Button>}
              {customAction && <Button asChild variant="outline"><a href={customAction} target="_blank" rel="noopener noreferrer">{course.presentation_button_text} <ArrowUpRight aria-hidden="true" /></a></Button>}
            </div>
            {!hasAccess && <div className="mt-6 border-t border-border pt-5">
              {!course.available_for_sale && <WaitlistAction courseId={course.id} />}
              {course.available_for_sale && !checkout && <p className="text-sm text-muted-foreground">Compra indisponível no momento.</p>}
            </div>}
          </div>

          <div className="min-w-0">
            <div className="aspect-video overflow-hidden rounded-md border border-border bg-secondary">
              {hasAccess && embed && selected ? <iframe key={selected.id} src={embed} title={selected.title} loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="h-full w-full" />
                : hasAccess && selected ? <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Vídeo indisponível</div>
                  : <RatioMedia candidates={coverCandidates(course, "16:9")} ratio="16:9" alt={course.title} className="h-full w-full" />}
            </div>
            {hasAccess && selected && <div aria-live="polite"><h2 className="mt-4 text-xl text-foreground">{selected.title}</h2>{selected.description && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{selected.description}</p>}</div>}
            {hasAccess && !selected && <p className="mt-4 text-sm text-muted-foreground">Nenhum vídeo disponível neste pack.</p>}
          </div>

          {hasAccess && videos.length > 1 && <div className="min-w-0 lg:pt-1">
            <h2 className="border-b border-border pb-3 text-lg text-foreground">Vídeos do pack</h2>
            <div className="scrollbar-hide mt-3 flex gap-3 overflow-x-auto pb-2 lg:max-h-[350px] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden" aria-label="Selecionar vídeo do pack">
              {videos.map((video, index) => <Button key={video.id} type="button" variant="ghost" onClick={() => setSelectedId(video.id)} aria-current={selected?.id === video.id ? "true" : undefined} aria-label={`Reproduzir ${video.title}`} className={`h-auto min-w-[190px] flex-1 justify-start gap-3 whitespace-normal rounded-sm border p-2 text-left lg:min-w-0 lg:w-full ${selected?.id === video.id ? "border-primary bg-secondary" : "border-border bg-background/50 hover:bg-secondary"}`}>
                <span className="flex h-12 w-16 shrink-0 items-center justify-center bg-secondary text-primary"><Play size={18} aria-hidden="true" /></span>
                <span className="min-w-0 flex-1"><span className="block text-xs text-muted-foreground">Vídeo {index + 1}</span><span className="mt-1 block break-words text-sm leading-snug text-foreground">{video.title}</span></span>
              </Button>)}
            </div>
          </div>}
        </div>
      </div>
    </section>
  </>;
};

export const PackAbout = ({ description }: { description: string }) => <section aria-labelledby="pack-about-title" className="border-t border-border bg-background">
  <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-6 lg:px-[60px]">
    <h2 id="pack-about-title" className="text-2xl text-foreground">Sobre o pack</h2>
    <Collapsible className="mt-5">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="group" aria-label="Saiba mais sobre o pack">Saiba mais <ChevronDown aria-hidden="true" className="transition-transform group-data-[state=open]:rotate-180" /></Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-6">
        <p className="max-w-3xl whitespace-pre-wrap break-words text-sm leading-7 text-foreground/80">{description}</p>
      </CollapsibleContent>
    </Collapsible>
  </div>
</section>;

export default PackPresentation;