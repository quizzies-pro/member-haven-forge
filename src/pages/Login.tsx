import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Check, Eye, EyeOff, Loader2, Mail } from "lucide-react";
import diveClubLogo from "@/assets/dive-club-logo-white.png.asset.json";
import loginBackground from "@/assets/dive-login-background.png.asset.json";

type Step = "email" | "password" | "forgot" | "reset-sent";

const emailSchema = z.string().trim().email("Informe um e-mail válido.").max(254, "E-mail muito longo.");

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const normalizedEmail = email.trim().toLowerCase();

  const handleEmailCheck = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");

    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      setErrorMessage(parsedEmail.error.issues[0]?.message ?? "Informe um e-mail válido.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.functions.invoke("check-student-email", {
      body: { email: parsedEmail.data.toLowerCase() },
    });
    setLoading(false);

    if (error) {
      setErrorMessage("Não foi possível confirmar seu e-mail. Tente novamente.");
      return;
    }

    if (!data?.exists) {
      setErrorMessage("E-mail não cadastrado. Entre em contato com o suporte.");
      return;
    }

    setEmail(parsedEmail.data.toLowerCase());
    setStep("password");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password.length < 6 || password.length > 128) {
      setErrorMessage("Digite uma senha válida.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    setLoading(false);
    if (error) {
      setErrorMessage("Senha incorreta. Tente novamente ou redefina sua senha.");
    } else {
      navigate("/");
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setErrorMessage("Não foi possível enviar o link. Tente novamente.");
    } else {
      toast.success("Link enviado com sucesso.");
      setStep("reset-sent");
    }
  };

  const returnToEmail = () => {
    setPassword("");
    setShowPassword(false);
    setErrorMessage("");
    setStep("email");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10 sm:px-8">
      <img
        src={loginBackground.url}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-background/35" />

      <section className="relative z-10 w-full max-w-sm rounded-lg border border-border/80 bg-background/80 px-6 py-8 shadow-2xl backdrop-blur-md sm:px-8 sm:py-10">
        <div className="mb-8 text-center">
          <img src={diveClubLogo.url} alt="Dive Club" className="mx-auto h-auto w-40 object-contain sm:w-48" />
          <div className="mt-7 flex items-center justify-center gap-2" aria-label={`Etapa ${step === "email" ? 1 : 2} de 2`}>
            <span className="h-1.5 w-10 rounded-full bg-primary" />
            <span className={`h-1.5 w-10 rounded-full transition-colors ${step === "email" ? "bg-muted" : "bg-primary"}`} />
          </div>
        </div>

        <div key={step} className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-2 motion-safe:duration-300">
          {step === "email" && (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-2xl text-foreground">Acesse sua conta</h1>
                <p className="mt-2 text-sm text-muted-foreground">Digite seu e-mail para continuar.</p>
              </div>
              <form onSubmit={handleEmailCheck} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    maxLength={254}
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setErrorMessage("");
                    }}
                    placeholder="seu@email.com"
                    required
                    autoFocus
                    aria-invalid={Boolean(errorMessage)}
                    aria-describedby={errorMessage ? "login-error" : undefined}
                    className="h-12 bg-secondary/90 px-4"
                  />
                </div>
                {errorMessage && <p id="login-error" role="alert" className="text-sm text-destructive">{errorMessage}</p>}
                <Button type="submit" disabled={loading} className="h-12 w-full">
                  {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                  Continuar
                </Button>
              </form>
            </>
          )}

          {step === "password" && (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-2xl text-foreground">Digite sua senha</h1>
                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Mail size={15} aria-hidden="true" />
                  <span className="max-w-[240px] truncate">{normalizedEmail}</span>
                </div>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setErrorMessage("");
                      }}
                      placeholder="Digite sua senha"
                      required
                      minLength={6}
                      maxLength={128}
                      autoComplete="current-password"
                      autoFocus
                      aria-invalid={Boolean(errorMessage)}
                      aria-describedby={errorMessage ? "login-error" : undefined}
                      className="h-12 bg-secondary/90 px-4 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      className="absolute right-1 top-1 h-10 w-10 text-muted-foreground hover:bg-transparent hover:text-foreground"
                    >
                      {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                    </Button>
                  </div>
                </div>
                {errorMessage && <p id="login-error" role="alert" className="text-sm text-destructive">{errorMessage}</p>}
                <div className="flex justify-end">
                  <Button type="button" variant="link" onClick={() => setStep("forgot")} className="h-auto p-0 text-xs">
                    Esqueceu sua senha?
                  </Button>
                </div>
                <Button type="submit" disabled={loading} className="h-12 w-full">
                  {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                  Entrar
                </Button>
                <Button type="button" variant="ghost" onClick={returnToEmail} className="w-full text-muted-foreground">
                  <ArrowLeft aria-hidden="true" /> Alterar e-mail
                </Button>
              </form>
            </>
          )}

          {step === "forgot" && (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-2xl text-foreground">Recuperar senha</h1>
                <p className="mt-2 text-sm text-muted-foreground">Enviaremos um link de redefinição para {normalizedEmail}.</p>
              </div>
              <form onSubmit={handleForgot} className="space-y-4">
                {errorMessage && <p role="alert" className="text-sm text-destructive">{errorMessage}</p>}
                <Button type="submit" disabled={loading} className="h-12 w-full">
                  {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                  Enviar link
                </Button>
                <Button type="button" variant="ghost" onClick={() => setStep("password")} className="w-full text-muted-foreground">
                  <ArrowLeft aria-hidden="true" /> Voltar
                </Button>
              </form>
            </>
          )}

          {step === "reset-sent" && (
            <div className="text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check aria-hidden="true" />
              </div>
              <h1 className="mt-5 text-2xl text-foreground">Confira seu e-mail</h1>
              <p className="mt-2 text-sm text-muted-foreground">Enviamos as instruções para {normalizedEmail}.</p>
              <Button type="button" variant="ghost" onClick={() => setStep("password")} className="mt-6 w-full text-muted-foreground">
                <ArrowLeft aria-hidden="true" /> Voltar para entrar
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Login;
