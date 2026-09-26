import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { safeHttps } from "@/lib/productMedia";
import type { Tables } from "@/integrations/supabase/types";

type Waitlist = Tables<"product_waitlists">;
interface Props { courseId: string; }

const WaitlistAction = ({ courseId }: Props) => {
  const [waitlist, setWaitlist] = useState<Waitlist | null>(null);
  const [status, setStatus] = useState<"none" | "active" | "joined" | "phone" | "error">("none");
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase.from("product_waitlists").select("*").eq("course_id", courseId).eq("status", "active").limit(1).maybeSingle();
      if (!data || cancelled) return;
      const { data: state, error } = await supabase.rpc("get_product_waitlist_state", { _waitlist_id: data.id });
      if (cancelled || error || !state?.[0] || state[0].waitlist_status !== "active" || state[0].product_available_for_sale) return;
      setWaitlist(data);
      setStatus(state[0].membership_status === "active" ? "joined" : state[0].phone_missing ? "phone" : "active");
    };
    load(); return () => { cancelled = true; };
  }, [courseId]);
  if (!waitlist || status === "none") return <p className="text-sm text-muted-foreground">Conteúdo indisponível no momento.</p>;
  const toggle = async () => {
    setSaving(true);
    const { error } = status === "joined"
      ? await supabase.rpc("leave_product_waitlist", { _waitlist_id: waitlist.id })
      : await supabase.rpc("join_product_waitlist", { _waitlist_id: waitlist.id, _consent: consent, _source: "members" });
    setSaving(false);
    if (error) setStatus("error");
    else { setStatus(status === "joined" ? "active" : "joined"); setConsent(false); }
  };
  return <div className="space-y-4">
    <h3 className="text-xl">{waitlist.name}</h3>
    {waitlist.description && <p className="text-sm text-muted-foreground">{waitlist.description}</p>}
    {status === "phone" ? <p className="text-sm text-muted-foreground">Adicione seu telefone em Minha Conta antes de entrar na lista.</p>
      : status === "joined" ? <><p className="text-sm text-primary">Você está na lista de espera.</p><Button variant="outline" disabled={saving} onClick={toggle}>Sair da lista</Button></>
      : <>
        <p className="text-sm text-muted-foreground">{waitlist.consent_text}</p>
        <label className="flex items-start gap-3 text-sm"><Checkbox checked={consent} onCheckedChange={(checked) => setConsent(checked === true)} /><span>Li e aceito as condições para participar desta lista de espera.</span></label>
        {safeHttps(waitlist.privacy_policy_url) && <a href={safeHttps(waitlist.privacy_policy_url) || "#"} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">Política de privacidade</a>}
        <p className="text-xs text-muted-foreground">A participação nesta lista não autoriza automaticamente comunicações de marketing.</p>
        <Button disabled={!consent || saving} onClick={toggle}>Entrar na lista</Button>
      </>}
    {status === "error" && <p role="alert" className="text-sm text-destructive">Não foi possível atualizar sua participação. Tente novamente.</p>}
  </div>;
};
export default WaitlistAction;
