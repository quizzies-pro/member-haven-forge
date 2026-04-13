CREATE POLICY "Students can delete own messages"
ON public.lesson_messages
FOR DELETE
TO authenticated
USING (student_id = auth.uid() AND sender_type = 'student');