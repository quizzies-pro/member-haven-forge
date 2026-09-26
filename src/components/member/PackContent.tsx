import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RatioMedia from "./RatioMedia";
import { safeHttps } from "@/lib/productMedia";
import type { Tables } from "@/integrations/supabase/types";

type Collection = Tables<"pack_collections">;
type Item = Pick<Tables<"pack_items">, "id" | "collection_id" | "format" | "title" | "description" | "cover_url" | "cover_ratio" | "tags" | "canva_template_url" | "textual_content" | "textual_example" | "drive_available">;
interface Props { collections: Collection[]; items: Item[]; format: Tables<"courses">["pack_format"]; }

const PackItem = ({ item, format }: { item: Item; format: Props["format"] }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const useCanva = format === "canva" && item.format === "canva" ? safeHttps(item.canva_template_url) : null;
  const isTextual = format === "textual" && item.format === "textual";
  const copy = async () => {
    if (!item.textual_content) return;
    try { await navigator.clipboard.writeText(item.textual_content); setCopied(true); window.setTimeout(() => setCopied(false), 2500); }
    catch { toast.error("Não foi possível copiar o conteúdo."); }
  };

  return <article className="group flex w-[210px] shrink-0 snap-start flex-col overflow-hidden rounded-md border border-border bg-card transition-colors duration-200 hover:border-primary/60 focus-within:border-primary/60 sm:w-[232px] lg:w-[248px]">
    <Button type="button" variant="ghost" onClick={() => setOpen(true)} aria-label={`Ver detalhes de ${item.title}`} className="relative h-auto w-full rounded-none p-0 hover:bg-secondary focus-visible:ring-inset">
      <RatioMedia candidates={item.cover_url ? [item.cover_url] : []} ratio="3:4" alt={item.title} className="w-full" imageClassName="object-contain transition-transform duration-300 motion-safe:group-hover:scale-[1.03]" />
      <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/90 text-foreground" aria-hidden="true"><ArrowUpRight className="h-4 w-4" /></span>
    </Button>
    <div className="flex min-w-0 flex-1 flex-col px-4 pb-4 pt-3">
      {item.tags.length > 0 && <p className="mb-2 truncate text-xs text-primary">{item.tags.map((tag) => `#${tag}`).join("  ")}</p>}
      <h3 className="line-clamp-2 text-lg text-foreground">{item.title}</h3>
      {item.description && <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">{item.description}</p>}
      <div className="mt-auto pt-4">
        {useCanva ? <Button asChild variant="outline" size="sm" className="w-full justify-between"><a href={useCanva} target="_blank" rel="noopener noreferrer">Usar no Canva <ExternalLink className="h-4 w-4" /></a></Button>
          : <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} className="w-full justify-between">Ver detalhes <ArrowUpRight className="h-4 w-4" /></Button>}
      </div>
    </div>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-24px)] max-w-2xl overflow-y-auto rounded-md bg-background sm:rounded-md">
        <div className="grid gap-5 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)]">
          <RatioMedia candidates={item.cover_url ? [item.cover_url] : []} ratio={item.cover_ratio || "3:4"} alt={item.title} className="w-full max-w-[180px] rounded-sm" imageClassName="object-contain" />
          <div className="min-w-0 space-y-4">
            <div><DialogTitle className="break-words text-2xl text-foreground">{item.title}</DialogTitle><DialogDescription className="mt-2 whitespace-pre-wrap break-words">{item.description || "Detalhes do item"}</DialogDescription></div>
            {isTextual && (item.textual_content ? <><div className="max-h-64 overflow-y-auto whitespace-pre-wrap break-words border-l-2 border-primary pl-4 text-sm text-foreground">{item.textual_content}</div><Button type="button" variant="outline" onClick={copy}>{copied ? <Check /> : <Copy />}{copied ? "Copiado" : "Copiar conteúdo"}</Button></> : <p className="text-sm text-muted-foreground">Conteúdo indisponível.</p>)}
            {isTextual && item.textual_example && <div><p className="mb-2 text-xs uppercase text-muted-foreground">Exemplo</p><p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{item.textual_example}</p></div>}
            {useCanva && <Button asChild><a href={useCanva} target="_blank" rel="noopener noreferrer">Usar no Canva <ExternalLink /></a></Button>}
            {format === "canva" && item.format === "canva" && !useCanva && <p className="text-sm text-muted-foreground">Modelo indisponível.</p>}
            {format === "drive" && item.format === "drive" && <p className="text-sm text-muted-foreground">Arquivo indisponível no momento.</p>}
            {(!format || format !== item.format) && <p className="text-sm text-muted-foreground">Conteúdo indisponível no momento.</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </article>;
};

const PackContent = ({ collections, items, format }: Props) => {
  const [collectionId, setCollectionId] = useState("all");
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);
  const railRef = useRef<HTMLDivElement>(null);
  const selectedId = collectionId === "all" || collections.some((collection) => collection.id === collectionId) ? collectionId : "all";
  const visibleItems = selectedId === "all" ? items : items.filter((item) => item.collection_id === selectedId);

  const checkScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setAtStart(rail.scrollLeft <= 2);
    setAtEnd(rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2);
  }, []);
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollLeft = 0;
    checkScroll();
    const observer = new ResizeObserver(checkScroll);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [selectedId, visibleItems.length, checkScroll]);
  const scroll = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (rail) rail.scrollBy({ left: direction * Math.max(rail.clientWidth * 0.8, 210), behavior: "smooth" });
  };

  return <div className="mx-auto max-w-[1280px] px-4 py-12 md:px-6 lg:px-[60px]">
    <div className="mb-7 flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div><h2 className="text-2xl text-foreground md:text-3xl">Itens do pack</h2><p className="mt-2 text-sm text-muted-foreground">{visibleItems.length} {visibleItems.length === 1 ? "item" : "itens"}</p></div>
      {collections.length > 0 && <div className="w-full sm:w-[260px]"><label id="pack-collection-label" className="mb-2 block text-xs text-muted-foreground">Coleção</label>
        <Select value={selectedId} onValueChange={setCollectionId}><SelectTrigger aria-labelledby="pack-collection-label" className="bg-secondary"><SelectValue placeholder="Selecione uma coleção" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os itens</SelectItem>{collections.map((collection) => <SelectItem key={collection.id} value={collection.id}>{collection.title}</SelectItem>)}</SelectContent></Select>
      </div>}
    </div>
    {visibleItems.length ? <div className="relative">
      <div ref={railRef} onScroll={checkScroll} aria-label="Itens do pack" className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
        {visibleItems.map((item) => <PackItem key={item.id} item={item} format={format} />)}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" size="icon" aria-label="Itens anteriores" onClick={() => scroll(-1)} disabled={atStart}><ChevronLeft className="h-5 w-5" /></Button>
        <Button type="button" variant="outline" size="icon" aria-label="Próximos itens" onClick={() => scroll(1)} disabled={atEnd}><ChevronRight className="h-5 w-5" /></Button>
      </div>
    </div> : <p className="py-12 text-center text-muted-foreground">{selectedId === "all" ? "Nenhum item disponível neste pack." : "Nenhum item disponível nesta coleção."}</p>}
  </div>;
};
export default PackContent;