import { useState } from "react";
import { Copy, Check, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import RatioMedia from "./RatioMedia";
import { safeHttps, videoEmbed } from "@/lib/productMedia";
import type { Tables } from "@/integrations/supabase/types";

type Collection = Tables<"pack_collections">;
type Item = Tables<"pack_items">;
type Video = Tables<"pack_videos">;
interface Props { collections: Collection[]; items: Item[]; videos: Video[]; format: Tables<"courses">["pack_format"]; }

const PackItem = ({ item, format }: { item: Item; format: Props["format"] }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadUnavailable, setDownloadUnavailable] = useState(false);
  const useCanva = format === "canva" && item.format === "canva" ? safeHttps(item.canva_template_url) : null;
  const copy = async () => {
    if (!item.textual_content) return;
    try { await navigator.clipboard.writeText(item.textual_content); setCopied(true); window.setTimeout(() => setCopied(false), 2500); }
    catch { toast.error("Não foi possível copiar o conteúdo."); }
  };
  const download = async () => {
    setDownloading(true);
    try {
      const { data, error } = await supabase.functions.invoke("pack-drive", { body: { action: "download", item_id: item.id } });
      if (error || !data || typeof data !== "object") throw new Error("indisponível");
      const payload = data as Record<string, unknown>;
      const url = typeof payload.url === "string" ? safeHttps(payload.url) : null;
      if (!url) throw new Error("indisponível");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch { setDownloadUnavailable(true); toast.error("Arquivo indisponível no momento."); }
    finally { setDownloading(false); }
  };
  return <article className="min-w-0 border-b border-border pb-8">
    <div className="max-w-[260px]"><RatioMedia candidates={item.cover_url ? [item.cover_url] : []} ratio={item.cover_ratio || "16:9"} alt={item.title} className="rounded-sm" /></div>
    <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">{item.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
    <h4 className="mt-2 text-xl text-foreground">{item.title}</h4>
    {item.description && <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>}
    {format === "canva" && (useCanva ? <Button asChild variant="outline" className="mt-4"><a href={useCanva} target="_blank" rel="noopener noreferrer">Usar no Canva <ExternalLink /></a></Button> : <p className="mt-4 text-sm text-muted-foreground">Modelo indisponível.</p>)}
    {format === "textual" && item.format === "textual" && <div className="mt-4 space-y-4">
      {item.textual_content ? <><div className="whitespace-pre-wrap break-words border-l-2 border-primary pl-4 text-sm text-foreground">{item.textual_content}</div><Button variant="outline" onClick={copy}>{copied ? <Check /> : <Copy />}{copied ? "Copiado" : "Copiar conteúdo"}</Button></> : <p className="text-sm text-muted-foreground">Conteúdo indisponível.</p>}
      {item.textual_example && <div><p className="mb-2 text-xs uppercase text-muted-foreground">Exemplo</p><p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{item.textual_example}</p></div>}
    </div>}
    {format === "drive" && item.format === "drive" && (item.drive_available && !downloadUnavailable ? <Button variant="outline" className="mt-4" onClick={download} disabled={downloading}><Download />{downloading ? "Abrindo..." : "Abrir arquivo"}</Button> : <p className="mt-4 text-sm text-muted-foreground">Arquivo indisponível no momento.</p>)}
    {(!format || format !== item.format) && <p className="mt-4 text-sm text-muted-foreground">Conteúdo indisponível no momento.</p>}
  </article>;
};

const PackContent = ({ collections, items, videos, format }: Props) => {
  const topLevel = items.filter((item) => !item.collection_id);
  return <div className="mx-auto max-w-[1280px] space-y-12 px-4 py-12 md:px-6 lg:px-[60px]">
    {!collections.length && !items.length && !videos.length && <p className="border-y border-border py-12 text-center text-muted-foreground">Conteúdo indisponível no momento.</p>}
    {collections.map((collection) => {
      const children = items.filter((item) => item.collection_id === collection.id);
      return <section key={collection.id} className="border-t border-border pt-8">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start">
          {collection.cover_url && <div className="w-full max-w-[220px] shrink-0"><RatioMedia candidates={[collection.cover_url]} ratio={collection.cover_ratio || "16:9"} alt={collection.title} /></div>}
          <div><h2 className="text-2xl text-foreground">{collection.title}</h2>{collection.description && <p className="mt-2 text-sm text-muted-foreground">{collection.description}</p>}
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">{collection.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div></div>
        </div>
        {children.length ? <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{children.map((item) => <PackItem key={item.id} item={item} format={format} />)}</div> : <p className="text-sm text-muted-foreground">Nenhum item disponível nesta coleção.</p>}
      </section>;
    })}
    {topLevel.length > 0 && <section className="border-t border-border pt-8"><h2 className="mb-8 text-2xl">Itens avulsos</h2><div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{topLevel.map((item) => <PackItem key={item.id} item={item} format={format} />)}</div></section>}
    {videos.length > 0 && <section className="border-t border-border pt-8"><h2 className="mb-8 text-2xl">Vídeos explicativos</h2><div className="grid gap-8 md:grid-cols-2">{videos.map((video) => {
      const embed = videoEmbed(video.video_url);
      return <article key={video.id}><div className="aspect-video overflow-hidden bg-secondary">{embed ? <iframe src={embed} title={video.title} loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="h-full w-full" referrerPolicy="strict-origin-when-cross-origin" /> : <div className="flex h-full items-center justify-center text-muted-foreground">Vídeo indisponível</div>}</div><h3 className="mt-4 text-xl">{video.title}</h3>{video.description && <p className="mt-2 text-sm text-muted-foreground">{video.description}</p>}</article>;
    })}</div></section>}
  </div>;
};
export default PackContent;
