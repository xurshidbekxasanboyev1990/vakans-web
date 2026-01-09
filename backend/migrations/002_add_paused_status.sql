-- Add 'paused' to jobs.status constraint for existing databases
-- Safe to run multiple times.

DO $$
DECLARE
  constraint_name text;
BEGIN
  -- Find an existing CHECK constraint on public.jobs that mentions status
  SELECT c.conname INTO constraint_name
  FROM pg_constraint c
  WHERE c.conrelid = 'public.jobs'::regclass
    AND c.contype = 'c'
    AND pg_get_constraintdef(c.oid) ILIKE '%status%'
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.jobs DROP CONSTRAINT %I', constraint_name);
  END IF;

  -- Recreate with paused included
  ALTER TABLE public.jobs
    ADD CONSTRAINT jobs_status_check
    CHECK (status IN ('pending','active','paused','rejected','closed','expired'));
EXCEPTION
  WHEN duplicate_object THEN
    -- If jobs_status_check already exists with correct definition, ignore
    NULL;
END $$;
