-- Conceder USAGE no schema private para authenticated/anon
-- (necessário para que policies possam invocar as funções;
-- o schema continua não exposto pelo PostgREST)
GRANT USAGE ON SCHEMA private TO authenticated, anon;

-- Conceder EXECUTE nas 3 funções para authenticated
-- (policies chamam no contexto do usuário; SECURITY DEFINER mantém isolamento)
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.masked_secret_token(text) TO authenticated;