ALTER VIEW public.webhook_endpoints_secure SET (security_invoker = true);
ALTER VIEW public.webhook_endpoints_public SET (security_invoker = true);