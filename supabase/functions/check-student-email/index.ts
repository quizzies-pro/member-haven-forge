import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.25.76";

const bodySchema = z.object({
  email: z.string().trim().email().max(254),
});

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Método não permitido." }, 405);
  }

  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonResponse({ error: "Informe um e-mail válido." }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Serviço indisponível." }, 503);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const normalizedEmail = parsed.data.email.toLowerCase();
    const { data, error } = await admin
      .from("students")
      .select("id")
      .ilike("email", normalizedEmail)
      .not("auth_user_id", "is", null)
      .limit(1);

    if (error) {
      console.error("Student email lookup failed", error.code);
      return jsonResponse({ error: "Não foi possível confirmar o e-mail." }, 500);
    }

    return jsonResponse({ exists: Boolean(data?.length) });
  } catch {
    return jsonResponse({ error: "Solicitação inválida." }, 400);
  }
});