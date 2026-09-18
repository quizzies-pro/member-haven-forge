CREATE OR REPLACE FUNCTION public.student_email_exists(_email text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_email text := lower(trim(COALESCE(_email, '')));
BEGIN
  IF length(normalized_email) < 3
     OR length(normalized_email) > 254
     OR normalized_email !~ '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' COLLATE "C" THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.students
    WHERE lower(email) = normalized_email
      AND auth_user_id IS NOT NULL
  );
END;
$$;

REVOKE ALL ON FUNCTION public.student_email_exists(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.student_email_exists(text) TO anon, authenticated;