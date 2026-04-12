
-- Create storage bucket for student avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('student-avatars', 'student-avatars', true);

-- Anyone can view student avatars (public bucket)
CREATE POLICY "Student avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'student-avatars');

-- Students can upload their own avatar (folder = their user id)
CREATE POLICY "Students can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'student-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Students can update their own avatar
CREATE POLICY "Students can update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'student-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Students can delete their own avatar
CREATE POLICY "Students can delete own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'student-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
