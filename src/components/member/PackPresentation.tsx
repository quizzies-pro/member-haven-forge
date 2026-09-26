import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Play, ImageOff, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import RatioMedia from "./RatioMedia";
import WaitlistAction from "./WaitlistAction";
import { coverCandidates, heroCandidates, safeHttps, videoEmbed, videoThumbnail } from "@/lib/productMedia";
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

const VideoThumbnailImage = ({ url, fallback }: { url: string; fallback: string[] }) => {
  const source = videoThumbnail(url);
  const [image, setImage] = useState(source?.image || "");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setImage(source?.image || "");
    setFailed(false);
    if (!source?.oembed) return;
    const controller = new AbortController();
    fetch(source.oembed, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("Thumbnail unavailable"); return response.json(); })
      .then((data: { thumbnail_url?: string }) => {
        const thumbnail = safeHttps(data.thumbnail_url);
        if (thumbnail && new URL(thumbnail).hostname.endsWith(".vimeocdn.com")) setImage(thumbnail);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [source?.image, source?.oembed]);
  return <div className="relative h-full w-full overflow-hidden bg-secondary">
    {image && !failed ? <img src={image} alt="" onError={() => setFailed(true)} className="h-full w-full object-cover" />
      : <RatioMedia candidates={fallback} ratio="16:9" alt="" className="h-full w-full" />}
  </div>;
};

const VideoPreview = ({ url, title, fallback, onPlay }: { url: string; title: string; fallback: string[]; onPlay: () => void }) => {
  return <div className="relative h-full w-full">
    <VideoThumbnailImage url={url} fallback={fallback} />
    <Button type="button" variant="ghost" onClick={onPlay} aria-label={`Reproduzir ${title} em tela ampliada`} className="absolute inset-0 h-full w-full rounded-none bg-background/20 text-foreground hover:bg-background/35 hover:text-foreground focus-visible:ring-inset">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform motion-safe:hover:scale-105"><Play aria-hidden="true" className="!h-7 !w-7 fill-current" /></span>
    </Button>
  </div>;
};

const PackPresentation = ({ course, hasAccess, videos }: Props) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
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
              {hasAccess && embed && selected ? <VideoPreview key={selected.id} url={selected.video_url} title={selected.title} fallback={coverCandidates(course, "16:9")} onPlay={() => setPlayerOpen(true)} />
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
                <span className="relative aspect-video w-20 shrink-0 overflow-hidden rounded-sm bg-secondary">
                  <VideoThumbnailImage url={video.video_url} fallback={coverCandidates(course, "16:9")} />
                  <span className="absolute inset-0 flex items-center justify-center bg-background/25"><Play size={16} aria-hidden="true" className="text-foreground drop-shadow-md" /></span>
                </span>
                <span className="min-w-0 flex-1"><span className="block text-xs text-muted-foreground">Vídeo {index + 1}</span><span className="mt-1 block break-words text-sm leading-snug text-foreground">{video.title}</span></span>
              </Button>)}
            </div>
          </div>}
        </div>
      </div>
    </section>
    <Dialog open={playerOpen && hasAccess && Boolean(embed)} onOpenChange={setPlayerOpen}>
      <DialogContent aria-describedby={undefined} className="max-h-[90vh] w-[calc(100vw-24px)] max-w-6xl gap-0 overflow-y-auto rounded-md border-border bg-background p-0 sm:rounded-md [&>button]:z-10 [&>button]:rounded-full [&>button]:bg-background/80 [&>button]:p-2 [&>button]:text-foreground">
        <DialogTitle className="sr-only">{selected?.title || "Vídeo do pack"}</DialogTitle>
        {playerOpen && embed && <div className="aspect-video w-full bg-secondary"><iframe src={`${embed}${embed.includes("?") ? "&" : "?"}autoplay=1`} title={selected?.title || "Vídeo do pack"} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="h-full w-full" /></div>}
        {selected && <div className="px-5 py-4 pr-14"><h3 className="text-lg text-foreground">{selected.title}</h3>{selected.description && <p className="mt-1 text-sm text-muted-foreground">{selected.description}</p>}</div>}
      </DialogContent>
    </Dialog>
  </>;
};

export const PackAbout = ({ description }: { description: string }) => {
  const [open, setOpen] = useState(false);
  return <section aria-labelledby="pack-about-title" className="border-t border-border bg-background">
    <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-6 lg:px-[60px]">
      <h2 id="pack-about-title" className="text-2xl text-foreground">Sobre o pack</h2>
      <Button variant="outline" className="mt-5" aria-label="Saiba mais sobre o pack" aria-expanded={open} aria-controls="pack-about-description" onClick={() => setOpen((value) => !value)}>
        Saiba mais <ChevronDown aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>
      {open && <div id="pack-about-description" className="pt-6">
        <p className="max-w-3xl whitespace-pre-wrap break-words text-sm leading-7 text-foreground/80">{description}</p>
      </div>}
    </div>
  </section>;
};

export default PackPresentation;