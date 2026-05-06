
-- Fix 1: Restrict secret_token column access on webhook_endpoints
-- Use column-level privileges so authenticated users (incl. operational admins) cannot read secret_token via PostgREST.
-- Service role bypasses these grants and retains full access for internal webhook verification.
REVOKE SELECT ON public.webhook_endpoints FROM authenticated, anon;
GRANT SELECT (id, name, source, slug, is_active, headers_config, event_mapping, description, created_at, updated_at)
  ON public.webhook_endpoints TO authenticated;

-- Fix 2: Restrict student access to published lessons only
DROP POLICY IF EXISTS "Enrolled students can view lessons" ON public.lessons;
CREATE POLICY "Enrolled students can view lessons"
ON public.lessons
FOR SELECT
USING (
  status = 'published'::lesson_status
  AND (
    is_preview = true
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = lessons.course_id
        AND e.student_id = auth.uid()
        AND e.status = 'active'::enrollment_status
    )
  )
);
