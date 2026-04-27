-- 1. RLS em realtime.messages
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can only subscribe to own topics" ON realtime.messages;
CREATE POLICY "Students can only subscribe to own topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR (realtime.topic() LIKE (auth.uid()::text || '%'))
);

DROP POLICY IF EXISTS "Authenticated users can broadcast to own topics" ON realtime.messages;
CREATE POLICY "Authenticated users can broadcast to own topics"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
  OR (realtime.topic() LIKE (auth.uid()::text || '%'))
);

-- 2. Proteger secret_token
DROP POLICY IF EXISTS "Operational admins can view webhook_endpoints" ON public.webhook_endpoints;

CREATE OR REPLACE VIEW public.webhook_endpoints_public
WITH (security_invoker = on) AS
SELECT
  id, slug, source, name, description,
  event_mapping, headers_config, is_active,
  public.masked_secret_token(secret_token) AS secret_token_masked,
  created_at, updated_at
FROM public.webhook_endpoints;

GRANT SELECT ON public.webhook_endpoints_public TO authenticated;

CREATE POLICY "Operational admins can view webhook metadata"
ON public.webhook_endpoints
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin_operacional'::app_role));

-- 3. Policy restritiva em user_roles (sintaxe correta: AS RESTRICTIVE antes de FOR)
DROP POLICY IF EXISTS "Only super admins can mutate user_roles" ON public.user_roles;
CREATE POLICY "Only super admins can mutate user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

-- 4. Revogar EXECUTE de anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.masked_secret_token(text) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.masked_secret_token(text) TO authenticated;