-- Add creator tracking columns to extrajudicial_notifications
ALTER TABLE public.extrajudicial_notifications
ADD COLUMN IF NOT EXISTS creator_ip text,
ADD COLUMN IF NOT EXISTS creator_hash text,
ADD COLUMN IF NOT EXISTS creditor_complement text,
ADD COLUMN IF NOT EXISTS debtor_complement text;