import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

type Mode = "login" | "register" | "forgot";

const COURSE_LOGO = "https://res.cloudinary.com/dqsuj0pjy/image/upload/v1775933233/By_b_ktyfmv.png";
const COURSE_BANNER = "https://res.cloudinary.com/dqsuj0pjy/image/upload/v1775882373/freepik_coloca-duas-influencers-d_2761737175_n2faxh.png";
const COURSE_TITLE = "TTS Academy";

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
    } else {
      navigate("/");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Cadastro realizado!", description: "Verifique seu email para confirmar." });
      setMode("login");
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email enviado!", description: "Verifique sua caixa de entrada." });
      setMode("login");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left - cover */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden">
        <img 
          src={COURSE_BANNER} 
          alt={COURSE_TITLE}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
      </div>

      {/* Right - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-xs space-y-5">
          <div className="text-center space-y-4">
            <img 
              src="https://res.cloudinary.com/dqsuj0pjy/image/upload/v1776188570/TTS_4_drshty.png" 
              alt="Logo" 
              className="h-12 mx-auto object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {mode === "login" && "Entrar"}
                {mode === "register" && "Criar conta"}
                {mode === "forgot" && "Recuperar senha"}
              </h1>
              {mode !== "login" && (
                <p className="mt-2 text-muted-foreground text-sm">
                  {mode === "register" && "Preencha seus dados para começar"}
                  {mode === "forgot" && "Enviaremos um link para redefinir sua senha"}
                </p>
              )}
            </div>
          </div>

          <form
            onSubmit={mode === "login" ? handleLogin : mode === "register" ? handleRegister : handleForgot}
            className="space-y-3"
          >
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-foreground text-sm">Nome completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-9 text-sm"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-foreground text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-9 text-sm"
              />
            </div>

            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-foreground text-sm">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-9 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {mode === "login" && (
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-xs text-primary hover:underline"
              >
                Esqueceu sua senha?
              </button>
            )}

            <Button type="submit" disabled={loading} className="w-full h-9 text-sm font-semibold mt-2">
              {loading && <Loader2 className="animate-spin mr-2" size={16} />}
              {mode === "login" && "Login"}
              {mode === "register" && "Criar conta"}
              {mode === "forgot" && "Enviar link"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Não tem conta?{" "}
                <button onClick={() => setMode("register")} className="text-primary hover:underline font-medium">
                  Cadastre-se
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium">
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
