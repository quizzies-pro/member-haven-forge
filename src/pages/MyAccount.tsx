import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import MemberLayout from "@/components/member/MemberLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, Mail, Phone, CreditCard, User, Camera } from "lucide-react";

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
      <div className="min-h-screen pt-[80px] pb-12 px-4">
        <div className="max-w-xl mx-auto">
          {/* Profile card */}
          <div className="relative rounded-2xl bg-card/50 border border-border/30 p-8 mb-8">
            <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer mb-4">
                <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                  <AvatarImage src={student?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-foreground">{student?.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{student?.email}</p>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl bg-card/50 border border-border/30 p-8">
            <h3 className="text-lg font-bold text-foreground mb-6">Informações Pessoais</h3>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Nome completo</Label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-secondary/60 border-border/50 text-foreground h-12 pl-11 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Email</Label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    value={student?.email || ""}
                    disabled
                    className="bg-secondary/30 border-border/30 text-muted-foreground h-12 pl-11 rounded-xl cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Telefone</Label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="bg-secondary/60 border-border/50 text-foreground h-12 pl-11 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">CPF</Label>
                  <div className="relative">
                    <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="bg-secondary/60 border-border/50 text-foreground h-12 pl-11 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full h-12 text-base font-semibold rounded-xl"
                >
                  {saving ? (
                    <Loader2 className="animate-spin mr-2" size={18} />
                  ) : (
                    <Save className="mr-2" size={18} />
                  )}
                  Salvar alterações
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
};

export default MyAccount;
