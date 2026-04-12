import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import MemberLayout from "@/components/member/MemberLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

const MyAccount = () => {
  const { student, user } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (student) {
      setName(student.name || "");
      setPhone(student.phone || "");
      setCpf(student.cpf || "");
    }
  }, [student]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("students")
      .update({ name, phone, cpf })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil atualizado!" });
    }
  };

  const initials = student?.name
    ? student.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto p-6 md:p-10 pt-[80px] flex flex-col items-center">
        <h1 className="text-2xl font-bold text-foreground mb-8">Minha Conta</h1>

        <div className="flex items-center gap-5 mb-10">
          <Avatar className="h-20 w-20">
            <AvatarImage src={student?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold text-foreground">{student?.name}</p>
            <p className="text-sm text-muted-foreground">{student?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-foreground">Nome completo</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary border-border text-foreground h-12"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Email</Label>
            <Input
              value={student?.email || ""}
              disabled
              className="bg-secondary/50 border-border text-muted-foreground h-12"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-foreground">Telefone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="bg-secondary border-border text-foreground h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">CPF</Label>
              <Input
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="bg-secondary border-border text-foreground h-12"
              />
            </div>
          </div>

          <Button type="submit" disabled={saving} className="h-12 px-8 text-base font-semibold">
            {saving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
            Salvar alterações
          </Button>
        </form>
      </div>
    </MemberLayout>
  );
};

export default MyAccount;
