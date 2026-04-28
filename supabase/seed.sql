-- ─── Demo seed data ────────────────────────────────────────────────────────
-- Run AFTER schema.sql.
-- Register two accounts via the app first (student + organiser),
-- then replace the UUIDs below with the ones from auth.users.
--
-- Or: in Supabase Dashboard → Authentication → Users → Add user
-- then copy the IDs here.

-- Replace these UUIDs with your actual user IDs:
-- \set student_id  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
-- \set organiser_id 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy'

-- Demo events (organiser_id must match a real profile row):
-- insert into public.events (title, description, date, time, location, category, capacity, organiser_name, organiser_id)
-- values
--   ('Tech Career Fair 2026', 'Meet over 30 top tech companies recruiting for internships and graduate roles.', '2026-05-10', '10:00', 'Main Hall, Block A', 'career', 200, 'Career Services', :'organiser_id'),
--   ('Python for Data Science Workshop', 'Hands-on workshop covering NumPy, Pandas, and Matplotlib.', '2026-05-15', '14:00', 'Lab 204, IT Building', 'workshop', 30, 'CS Society', :'organiser_id'),
--   ('End of Term Social Night', 'Celebrate the end of semester with music, food, and friends.', '2026-05-20', '19:00', 'Student Union Hall', 'social', 150, 'Student Union', :'organiser_id'),
--   ('Research Methods Seminar', 'Postgrad seminar on qualitative and quantitative research methods.', '2026-05-08', '11:00', 'Lecture Theatre 3', 'academic', 80, 'Research Office', :'organiser_id');
