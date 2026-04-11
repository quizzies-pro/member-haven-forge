
-- Insert student record matching auth user
INSERT INTO public.students (id, name, email, status)
VALUES ('28f029e8-eb52-4397-8d94-524c5f3290b5', 'Gabriel Schubert', 'gabrielschuberts@gmail.com', 'active')
ON CONFLICT (id) DO NOTHING;

-- Create enrollment for TTS Academy
INSERT INTO public.enrollments (student_id, course_id, status, origin)
VALUES ('28f029e8-eb52-4397-8d94-524c5f3290b5', '089e355e-0cf9-44dc-98f1-44f87347c66f', 'active', 'manual')
ON CONFLICT DO NOTHING;
