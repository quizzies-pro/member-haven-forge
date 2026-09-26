import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import RatioMedia from "./RatioMedia";
import { coverCandidates } from "@/lib/productMedia";
import type { Tables } from "@/integrations/supabase/types";

type Pack = Tables<"courses">;
const PackDiscovery = ({ currentId }: { currentId: string }) => {
  const [packs, setPacks] = useState<Pack[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [categories, links, products] = await Promise.all([
        supabase.from("storefront_categories").select("id").eq("is_active", true).order("display_order"),
        supabase.from("storefront_category_courses").select("category_id, course_id, display_order").order("display_order"),
        supabase.from("courses").select("*").eq("status", "published").eq("storefront_visible", true).eq("product_type", "pack"),
      ]);
      if (cancelled || categories.error || links.error || products.error) return;
      const productMap = new Map((products.data || []).map((item) => [item.id, item]));
      const seen = new Set<string>([currentId]);
      const ordered = (categories.data || []).flatMap((category) => (links.data || [])
        .filter((link) => link.category_id === category.id)
        .map((link) => productMap.get(link.course_id))
        .filter((pack): pack is Pack => {
          if (!pack || seen.has(pack.id)) return false;
          seen.add(pack.id);
          return true;
        }));
      setPacks(ordered);
    };
    load();
    return () => { cancelled = true; };
  }, [currentId]);

  if (!packs.length) return null;
  return <section aria-labelledby="other-packs" className="border-b border-border bg-background">
    <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-6 lg:px-[60px]">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div><h2 id="other-packs" className="text-3xl text-foreground">Packs</h2><p className="mt-1 text-sm text-muted-foreground">Explore outros packs do Dive Club.</p></div>
        <div className="flex gap-2"><Button size="icon" variant="outline" aria-label="Ver packs anteriores" onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })}><ArrowLeft aria-hidden="true" /></Button><Button size="icon" variant="outline" aria-label="Ver próximos packs" onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })}><ArrowRight aria-hidden="true" /></Button></div>
      </div>
      <div ref={scrollRef} className="scrollbar-hide flex snap-x gap-4 overflow-x-auto pb-2">
        {packs.map((pack) => <Link key={pack.id} to={`/produto/${pack.id}`} className="group relative w-[170px] shrink-0 snap-start overflow-hidden rounded-md border border-border bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-[210px]" aria-label={`Conhecer Pack: ${pack.title}`}>
          <RatioMedia candidates={coverCandidates(pack, "3:4")} ratio="3:4" alt={pack.title} imageClassName="transition-transform duration-500 group-hover:scale-[1.03]" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/85 to-transparent px-4 pb-4 pt-16"><span className="text-[11px] uppercase text-primary">Pack</span><div className="mt-1 flex items-end justify-between gap-2"><h3 className="break-words text-lg text-foreground">{pack.title}</h3><ArrowUpRight size={18} className="shrink-0 text-foreground" aria-hidden="true" /></div></div>
        </Link>)}
      </div>
    </div>
  </section>;
};

export default PackDiscovery;