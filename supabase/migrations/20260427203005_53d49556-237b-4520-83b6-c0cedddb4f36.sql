-- Migration 2: Recriar todas as policies e views apontando para private.*

-- ============================================================
-- SCHEMA: public (14 tabelas, 19 policies)
-- ============================================================

-- activity_logs
DROP POLICY IF EXISTS "Admins can create activity logs" ON public.activity_logs;
CREATE POLICY "Admins can create activity logs" ON public.activity_logs
  FOR INSERT TO authenticated WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view activity logs" ON public.activity_logs;
CREATE POLICY "Admins can view activity logs" ON public.activity_logs
  FOR SELECT TO authenticated USING (private.is_admin(auth.uid()));

-- course_modules
DROP POLICY IF EXISTS "Admins can do everything on modules" ON public.course_modules;
CREATE POLICY "Admins can do everything on modules" ON public.course_modules
  FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

-- courses
DROP POLICY IF EXISTS "Admins can do everything on courses" ON public.courses;
CREATE POLICY "Admins can do everything on courses" ON public.courses
  FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

-- enrollment_lessons
DROP POLICY IF EXISTS "Admins can do everything on enrollment_lessons" ON public.enrollment_lessons;
CREATE POLICY "Admins can do everything on enrollment_lessons" ON public.enrollment_lessons
  FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

-- enrollment_modules
DROP POLICY IF EXISTS "Admins can do everything on enrollment_modules" ON public.enrollment_modules;
CREATE POLICY "Admins can do everything on enrollment_modules" ON public.enrollment_modules
  FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

-- enrollments
DROP POLICY IF EXISTS "Admins can do everything on enrollments" ON public.enrollments;
CREATE POLICY "Admins can do everything on enrollments" ON public.enrollments
  FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

-- lesson_materials
DROP POLICY IF EXISTS "Admins can do everything on materials" ON public.lesson_materials;
CREATE POLICY "Admins can do everything on materials" ON public.lesson_materials
  FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

-- lesson_messages
DROP POLICY IF EXISTS "Admins can do everything on lesson_messages" ON public.lesson_messages;
CREATE POLICY "Admins can do everything on lesson_messages" ON public.lesson_messages
  FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins can delete lesson_messages" ON public.lesson_messages;
CREATE POLICY "Super admins can delete lesson_messages" ON public.lesson_messages
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'::public.app_role));

-- lesson_ratings
DROP POLICY IF EXISTS "Admins can do everything on lesson_ratings" ON public.lesson_ratings;
CREATE POLICY "Admins can do everything on lesson_ratings" ON public.lesson_ratings
  FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

-- lessons
DROP POLICY IF EXISTS "Admins can do everything on lessons" ON public.lessons;
CREATE POLICY "Admins can do everything on lessons" ON public.lessons
  FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

-- message_threads
DROP POLICY IF EXISTS "Admins can do everything on message_threads" ON public.message_threads;
CREATE POLICY "Admins can do everything on message_threads" ON public.message_threads
  FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

-- payments
DROP POLICY IF EXISTS "Admins can do everything on payments" ON public.payments;
CREATE POLICY "Admins can do everything on payments" ON public.payments
  FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

-- platform_settings
DROP POLICY IF EXISTS "Admins can view settings" ON public.platform_settings;
CREATE POLICY "Admins can view settings" ON public.platform_settings
  FOR SELECT TO authenticated USING (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins can manage settings" ON public.platform_settings;
CREATE POLICY "Super admins can manage settings" ON public.platform_settings
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin'::public.app_role));

-- students
DROP POLICY IF EXISTS "Admins can do everything on students" ON public.students;
CREATE POLICY "Admins can do everything on students" ON public.students
  FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

-- user_roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only super admins can mutate user_roles" ON public.user_roles;
CREATE POLICY "Only super admins can mutate user_roles" ON public.user_roles
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Super admins can manage roles" ON public.user_roles;
CREATE POLICY "Super admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin'::public.app_role));

-- webhook_endpoints
DROP POLICY IF EXISTS "Operational admins can view webhook metadata" ON public.webhook_endpoints;
CREATE POLICY "Operational admins can view webhook metadata" ON public.webhook_endpoints
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin_operacional'::public.app_role));

DROP POLICY IF EXISTS "Super admins can do everything on webhook_endpoints" ON public.webhook_endpoints;
CREATE POLICY "Super admins can do everything on webhook_endpoints" ON public.webhook_endpoints
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin'::public.app_role));

-- webhook_logs
DROP POLICY IF EXISTS "Admins can view webhook logs" ON public.webhook_logs;
CREATE POLICY "Admins can view webhook logs" ON public.webhook_logs
  FOR SELECT TO authenticated USING (private.is_admin(auth.uid()));

-- ============================================================
-- SCHEMA: storage (9 policies em storage.objects)
-- ============================================================

DROP POLICY IF EXISTS "Admins can access materials" ON storage.objects;
CREATE POLICY "Admins can access materials" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'materials' AND private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete course covers" ON storage.objects;
CREATE POLICY "Admins can delete course covers" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'course-covers' AND private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete lesson thumbnails" ON storage.objects;
CREATE POLICY "Admins can delete lesson thumbnails" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'lesson-thumbnails' AND private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete materials" ON storage.objects;
CREATE POLICY "Admins can delete materials" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'materials' AND private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update course covers" ON storage.objects;
CREATE POLICY "Admins can update course covers" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'course-covers' AND private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update lesson thumbnails" ON storage.objects;
CREATE POLICY "Admins can update lesson thumbnails" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'lesson-thumbnails' AND private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update materials" ON storage.objects;
CREATE POLICY "Admins can update materials" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'materials' AND private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can upload course covers" ON storage.objects;
CREATE POLICY "Admins can upload course covers" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'course-covers' AND private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can upload lesson thumbnails" ON storage.objects;
CREATE POLICY "Admins can upload lesson thumbnails" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'lesson-thumbnails' AND private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can upload materials" ON storage.objects;
CREATE POLICY "Admins can upload materials" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'materials' AND private.is_admin(auth.uid()));

-- ============================================================
-- SCHEMA: realtime (2 policies em realtime.messages)
-- ============================================================

DROP POLICY IF EXISTS "Students can only subscribe to own topics" ON realtime.messages;
CREATE POLICY "Students can only subscribe to own topics" ON realtime.messages
  FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()) OR realtime.topic() LIKE (auth.uid()::text || '%'));

DROP POLICY IF EXISTS "Authenticated users can broadcast to own topics" ON realtime.messages;
CREATE POLICY "Authenticated users can broadcast to own topics" ON realtime.messages
  FOR INSERT TO authenticated
  WITH CHECK (private.is_admin(auth.uid()) OR realtime.topic() LIKE (auth.uid()::text || '%'));

-- ============================================================
-- VIEWS (2 views em public)
-- ============================================================

DROP VIEW IF EXISTS public.webhook_endpoints_secure;
CREATE VIEW public.webhook_endpoints_secure AS
SELECT 
  id, name, source, slug,
  CASE 
    WHEN private.has_role(auth.uid(), 'super_admin'::public.app_role) THEN secret_token
    ELSE private.masked_secret_token(secret_token)
  END AS secret_token,
  is_active, description, event_mapping, headers_config,
  created_at, updated_at
FROM public.webhook_endpoints;

DROP VIEW IF EXISTS public.webhook_endpoints_public;
CREATE VIEW public.webhook_endpoints_public AS
SELECT 
  id, slug, source, name, description, event_mapping, headers_config, is_active,
  private.masked_secret_token(secret_token) AS secret_token_masked,
  created_at, updated_at
FROM public.webhook_endpoints;