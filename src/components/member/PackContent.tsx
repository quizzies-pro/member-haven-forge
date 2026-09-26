import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import RatioMedia from "./RatioMedia";
import { safeHttps } from "@/lib/productMedia";
import type { Tables } from "@/integrations/supabase/types";

type Collection = Tables<"pack_collections">;
type Item = Pick<Tables<"pack_items">, "id" | "collection_id" | "format" | "title" | "description" | "cover_url" | "cover_ratio" | "tags" | "canva_template_url" | "textual_content" | "textual_example" | "drive_available">;
interface Props { collections: Collection[]; items: Item[]; format: Tables<"courses">["pack_format"]; }

const PackItem = ({ item, format }: { item: Item; format: Props["format"] }) => {
  const [copied, setCopied] = useState(false);
  const useCanva = format === "canva" && item.format === "canva" ? safeHttps(item.canva_template_url) : null;
  const copy = async () => {
    if (!item.textual_content) return;
    try { await navigator.clipboard.writeText(item.textual_content); setCopied(true); window.setTimeout(() => setCopied(false), 2500); }
    catch { toast.error("Não foi possível copiar o conteúdo."); }
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
    {format === "drive" && item.format === "drive" && <p className="mt-4 text-sm text-muted-foreground">Arquivo indisponível no momento.</p>}
    {(!format || format !== item.format) && <p className="mt-4 text-sm text-muted-foreground">Conteúdo indisponível no momento.</p>}
  </article>;
};

const PackContent = ({ collections, items, format }: Props) => {
  const topLevel = items.filter((item) => !item.collection_id);
  return <div className="mx-auto max-w-[1280px] space-y-12 px-4 py-12 md:px-6 lg:px-[60px]">
    {!collections.length && !items.length && <p className="border-y border-border py-12 text-center text-muted-foreground">Nenhum item disponível neste pack.</p>}
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
  </div>;
};
export default PackContent;
