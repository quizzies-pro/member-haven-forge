DROP POLICY IF EXISTS "Enrolled students can view materials" ON storage.objects;

DROP POLICY IF EXISTS "Students can upload own avatar" ON storage.objects;
CREATE POLICY "Students can upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'student-avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Students can update own avatar" ON storage.objects;
CREATE POLICY "Students can update own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'student-avatars' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'student-avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Students can delete own avatar" ON storage.objects;
CREATE POLICY "Students can delete own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'student-avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);