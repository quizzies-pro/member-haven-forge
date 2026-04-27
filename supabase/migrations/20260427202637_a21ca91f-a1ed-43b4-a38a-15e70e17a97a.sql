-- Migration 1: Criar schema privado e recriar funções SECURITY DEFINER fora do schema exposto

-- 1. Criar schema privado (não exposto pela API PostgREST)
CREATE SCHEMA IF NOT EXISTS private;

-- 2. Revogar qualquer acesso padrão
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO postgres, service_role;

-- 3. Recriar has_role em private
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Recriar is_admin em private
CREATE OR REPLACE FUNCTION private.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin_operacional')
  )
$$;

-- 5. Recriar masked_secret_token em private
CREATE OR REPLACE FUNCTION private.masked_secret_token(token text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN token IS NULL THEN NULL
    WHEN length(token) <= 4 THEN '****'
    ELSE repeat('*', length(token) - 4) || right(token, 4)
  END
$$;

-- 6. Revogar EXECUTE de qualquer role não privilegiado
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.is_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.masked_secret_token(text) FROM PUBLIC, anon, authenticated;

-- Nota: as funções SECURITY DEFINER rodam como owner (postgres) quando invocadas por policies,
-- então não precisam de EXECUTE para authenticated. Policies executam no contexto do planner.