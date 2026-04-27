-- Habilita a extensão pg_cron (idempotente)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove job existente com mesmo nome (se houver) para evitar duplicata
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-keepalive-ping') THEN
    PERFORM cron.unschedule('daily-keepalive-ping');
  END IF;
END $$;

-- Agenda o job para rodar todo dia às 03:00 UTC
SELECT cron.schedule(
  'daily-keepalive-ping',
  '0 3 * * *',
  $$SELECT 1;$$
);