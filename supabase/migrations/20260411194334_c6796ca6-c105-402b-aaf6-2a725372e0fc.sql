
-- Allow students to INSERT into enrollment_lessons for their own enrollments
CREATE POLICY "Students can insert own enrollment_lessons"
ON public.enrollment_lessons
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.id = enrollment_lessons.enrollment_id
      AND e.student_id = auth.uid()
      AND e.status = 'active'::enrollment_status
  )
);

-- Allow students to INSERT into enrollment_modules for their own enrollments
CREATE POLICY "Students can insert own enrollment_modules"
ON public.enrollment_modules
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.id = enrollment_modules.enrollment_id
      AND e.student_id = auth.uid()
      AND e.status = 'active'::enrollment_status
  )
);
