CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'update_pending_invoices',
  '*/5 * * * *',
  $$
  UPDATE invoices
  SET status = 'EXPIRED',
      updated_at = NOW(),
      updated_by = 'SYSTEM'
  WHERE status = 'PENDING'
    AND expiry_date <= NOW();
  $$
);
