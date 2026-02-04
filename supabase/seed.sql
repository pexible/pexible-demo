-- =============================================
-- pexible Demo — Seed Data for 3 Test Users
-- =============================================
-- Run this AFTER schema.sql in the Supabase SQL Editor.
-- This creates 3 test users with pre-populated searches and results.
--
-- Test users authenticate via the normal OTP flow OR
-- via password (set below) for convenience during testing.
--
-- IMPORTANT: These users are created directly in auth.users.
-- The handle_new_user trigger automatically creates their profiles.

-- ─── Test User 1: Sarah (paid, completed search) ───

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, role, aud, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'test-sarah@pexible.de',
  crypt('TestPasswort123!', gen_salt('bf')),
  now(),
  '{"first_name": "Sarah"}'::jsonb,
  'authenticated', 'authenticated', now(), now(),
  '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- Ensure profile exists and mark as test user
INSERT INTO public.profiles (id, first_name, is_test_user)
VALUES ('11111111-1111-1111-1111-111111111111', 'Sarah', true)
ON CONFLICT (id) DO UPDATE SET first_name = 'Sarah', is_test_user = true;

-- Sarah's search (paid)
INSERT INTO public.searches (id, user_id, job_title, postal_code, status, paid, total_results, created_at)
VALUES ('search-sarah-001', '11111111-1111-1111-1111-111111111111', 'Content Manager', '80331', 'completed', true, 8, now() - interval '2 days')
ON CONFLICT (id) DO NOTHING;

-- Sarah's results
INSERT INTO public.results (id, search_id, company_name, job_title, job_url, description, rank) VALUES
  ('res-sarah-01', 'search-sarah-001', 'Siemens AG', 'Content Manager (m/w/d)', 'https://careers.siemens.com/jobs/cm001', 'Verantwortung fuer die Content-Strategie und Erstellung von Inhalten fuer digitale Kanaele.', 1),
  ('res-sarah-02', 'search-sarah-001', 'BMW Group', 'Content & Social Media Manager', 'https://careers.bmw.com/jobs/csm002', 'Planung und Umsetzung von Content-Kampagnen fuer Social Media und Website.', 2),
  ('res-sarah-03', 'search-sarah-001', 'SAP SE', 'Senior Content Strategist', 'https://careers.sap.com/jobs/scs003', 'Entwicklung der globalen Content-Strategie und Fuehrung eines Content-Teams.', 3),
  ('res-sarah-04', 'search-sarah-001', 'Allianz', 'Digital Content Manager', 'https://careers.allianz.com/jobs/dcm004', 'Erstellung und Optimierung von digitalen Inhalten fuer die Unternehmenswebsite.', 4),
  ('res-sarah-05', 'search-sarah-001', 'Bosch', 'Content Marketing Manager', 'https://careers.bosch.com/jobs/cmm005', 'Verantwortung fuer Content Marketing Strategien und deren Umsetzung.', 5),
  ('res-sarah-06', 'search-sarah-001', 'Mercedes-Benz', 'Content Manager Digital', 'https://careers.mercedes-benz.com/jobs/cmd006', 'Steuerung der digitalen Content-Produktion und Qualitaetssicherung.', 6),
  ('res-sarah-07', 'search-sarah-001', 'Deutsche Bank', 'Content & Communications Manager', 'https://careers.deutsche-bank.de/jobs/ccm007', 'Interne und externe Kommunikation sowie Content-Erstellung.', 7),
  ('res-sarah-08', 'search-sarah-001', 'BASF', 'Content Specialist', 'https://careers.basf.com/jobs/cs008', 'Erstellung von Fachcontent fuer technische und wissenschaftliche Zielgruppen.', 8)
ON CONFLICT (id) DO NOTHING;

-- Sarah's conversation (completed)
INSERT INTO public.conversations (id, user_id, title, status, search_id, messages, created_at, updated_at)
VALUES (
  'conv-sarah-001',
  '11111111-1111-1111-1111-111111111111',
  'Content Manager',
  'completed',
  'search-sarah-001',
  '[{"id":"welcome","role":"assistant","content":"Hey Sarah! Schön, dass du da bist. Ich bin dein persönlicher Job-Makler. Was für eine Stelle suchst du?"},{"id":"u1","role":"user","content":"Ich suche eine Stelle als Content Manager in München"},{"id":"a1","role":"assistant","content":"Super! Content Manager in München – da habe ich 8 passende Stellen gefunden!"}]'::jsonb,
  now() - interval '2 days',
  now() - interval '2 days'
) ON CONFLICT (id) DO NOTHING;


-- ─── Test User 2: Markus (freemium, unpaid search) ───

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, role, aud, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'test-markus@pexible.de',
  crypt('TestPasswort123!', gen_salt('bf')),
  now(),
  '{"first_name": "Markus"}'::jsonb,
  'authenticated', 'authenticated', now(), now(),
  '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, is_test_user)
VALUES ('22222222-2222-2222-2222-222222222222', 'Markus', true)
ON CONFLICT (id) DO UPDATE SET first_name = 'Markus', is_test_user = true;

-- Markus's search (not paid)
INSERT INTO public.searches (id, user_id, job_title, postal_code, status, paid, total_results, created_at)
VALUES ('search-markus-001', '22222222-2222-2222-2222-222222222222', 'Software Engineer', '10115', 'completed', false, 9, now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

-- Markus's results
INSERT INTO public.results (id, search_id, company_name, job_title, job_url, description, rank) VALUES
  ('res-markus-01', 'search-markus-001', 'SAP SE', 'Software Engineer (m/w/d)', 'https://careers.sap.com/jobs/se001', 'Entwicklung von Cloud-Applikationen im agilen Team.', 1),
  ('res-markus-02', 'search-markus-001', 'Siemens AG', 'Full Stack Developer', 'https://careers.siemens.com/jobs/fsd002', 'Entwicklung von Web-Applikationen mit React und Node.js.', 2),
  ('res-markus-03', 'search-markus-001', 'BMW Group', 'Backend Engineer', 'https://careers.bmw.com/jobs/be003', 'Design und Implementierung von Microservices-Architekturen.', 3),
  ('res-markus-04', 'search-markus-001', 'Deutsche Bank', 'Software Developer Java', 'https://careers.deutsche-bank.de/jobs/sdj004', 'Entwicklung von Finanzanwendungen in Java und Spring Boot.', 4),
  ('res-markus-05', 'search-markus-001', 'Bosch', 'Embedded Software Engineer', 'https://careers.bosch.com/jobs/ese005', 'Softwareentwicklung fuer IoT-Geraete und eingebettete Systeme.', 5),
  ('res-markus-06', 'search-markus-001', 'Volkswagen', 'DevOps Engineer', 'https://careers.volkswagen.de/jobs/doe006', 'Aufbau und Pflege von CI/CD-Pipelines und Cloud-Infrastruktur.', 6),
  ('res-markus-07', 'search-markus-001', 'Allianz', 'Platform Engineer', 'https://careers.allianz.com/jobs/pe007', 'Entwicklung und Betrieb der internen Entwicklerplattform.', 7),
  ('res-markus-08', 'search-markus-001', 'BASF', 'Data Engineer', 'https://careers.basf.com/jobs/de008', 'Aufbau von Datenpipelines und ETL-Prozessen in Python.', 8),
  ('res-markus-09', 'search-markus-001', 'Bayer AG', 'Software Architect', 'https://careers.bayer.com/jobs/sa009', 'Architektur und Design von Enterprise-Anwendungen.', 9)
ON CONFLICT (id) DO NOTHING;

-- Markus's conversation (active, unpaid)
INSERT INTO public.conversations (id, user_id, title, status, search_id, messages, created_at, updated_at)
VALUES (
  'conv-markus-001',
  '22222222-2222-2222-2222-222222222222',
  'Software Engineer',
  'active',
  'search-markus-001',
  '[{"id":"welcome","role":"assistant","content":"Hey Markus! Schön, dass du da bist. Ich bin dein persönlicher Job-Makler. Was für eine Stelle suchst du?"},{"id":"u1","role":"user","content":"Software Engineer in Berlin"},{"id":"a1","role":"assistant","content":"Perfekt! Ich habe 9 passende Stellen als Software Engineer in Berlin gefunden. Hier sind deine ersten 3 kostenlosen Ergebnisse..."}]'::jsonb,
  now() - interval '1 day',
  now() - interval '1 day'
) ON CONFLICT (id) DO NOTHING;


-- ─── Test User 3: Julia (paid, with second search started) ───

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, role, aud, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'test-julia@pexible.de',
  crypt('TestPasswort123!', gen_salt('bf')),
  now(),
  '{"first_name": "Julia"}'::jsonb,
  'authenticated', 'authenticated', now(), now(),
  '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, first_name, is_test_user)
VALUES ('33333333-3333-3333-3333-333333333333', 'Julia', true)
ON CONFLICT (id) DO UPDATE SET first_name = 'Julia', is_test_user = true;

-- Julia's first search (paid, completed)
INSERT INTO public.searches (id, user_id, job_title, postal_code, status, paid, total_results, created_at)
VALUES ('search-julia-001', '33333333-3333-3333-3333-333333333333', 'Marketing Manager', '50667', 'completed', true, 7, now() - interval '5 days')
ON CONFLICT (id) DO NOTHING;

-- Julia's results
INSERT INTO public.results (id, search_id, company_name, job_title, job_url, description, rank) VALUES
  ('res-julia-01', 'search-julia-001', 'Deutsche Bank', 'Marketing Manager (m/w/d)', 'https://careers.deutsche-bank.de/jobs/mm001', 'Leitung des Marketing-Teams und Entwicklung von Kampagnenstrategien.', 1),
  ('res-julia-02', 'search-julia-001', 'Allianz', 'Senior Marketing Manager', 'https://careers.allianz.com/jobs/smm002', 'Verantwortung fuer die Marketing-Strategie im B2B-Bereich.', 2),
  ('res-julia-03', 'search-julia-001', 'BMW Group', 'Brand Marketing Manager', 'https://careers.bmw.com/jobs/bmm003', 'Steuerung der Markenkommunikation und Kampagnenplanung.', 3),
  ('res-julia-04', 'search-julia-001', 'Siemens AG', 'Digital Marketing Manager', 'https://careers.siemens.com/jobs/dmm004', 'Planung und Umsetzung von digitalen Marketing-Kampagnen.', 4),
  ('res-julia-05', 'search-julia-001', 'Bosch', 'Performance Marketing Manager', 'https://careers.bosch.com/jobs/pmm005', 'Steuerung und Optimierung von Performance-Marketing-Kanaelen.', 5),
  ('res-julia-06', 'search-julia-001', 'Mercedes-Benz', 'Marketing Communications Manager', 'https://careers.mercedes-benz.com/jobs/mcm006', 'Entwicklung von Kommunikationsstrategien und PR-Massnahmen.', 6),
  ('res-julia-07', 'search-julia-001', 'Bayer AG', 'Product Marketing Manager', 'https://careers.bayer.com/jobs/pmm007', 'Go-to-Market-Strategien und Produktpositionierung.', 7)
ON CONFLICT (id) DO NOTHING;

-- Julia's first conversation (completed)
INSERT INTO public.conversations (id, user_id, title, status, search_id, messages, created_at, updated_at)
VALUES (
  'conv-julia-001',
  '33333333-3333-3333-3333-333333333333',
  'Marketing Manager',
  'completed',
  'search-julia-001',
  '[{"id":"welcome","role":"assistant","content":"Hey Julia! Schön, dass du da bist. Was für eine Stelle suchst du?"},{"id":"u1","role":"user","content":"Marketing Manager in Köln"},{"id":"a1","role":"assistant","content":"Ich habe 7 passende Stellen gefunden! Hier sind deine Ergebnisse."}]'::jsonb,
  now() - interval '5 days',
  now() - interval '5 days'
) ON CONFLICT (id) DO NOTHING;

-- Julia's second conversation (active, no search yet)
INSERT INTO public.conversations (id, user_id, title, status, search_id, messages, created_at, updated_at)
VALUES (
  'conv-julia-002',
  '33333333-3333-3333-3333-333333333333',
  'Neue Suche',
  'active',
  NULL,
  '[{"id":"welcome","role":"assistant","content":"Hey Julia! Schön, dass du wieder da bist. Wonach suchst du diesmal?"}]'::jsonb,
  now() - interval '1 hour',
  now() - interval '1 hour'
) ON CONFLICT (id) DO NOTHING;


-- ─── Create auth.identities entries (required by Supabase Auth) ───

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '{"sub":"11111111-1111-1111-1111-111111111111","email":"test-sarah@pexible.de"}'::jsonb, 'email', now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '{"sub":"22222222-2222-2222-2222-222222222222","email":"test-markus@pexible.de"}'::jsonb, 'email', now(), now(), now()),
  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '{"sub":"33333333-3333-3333-3333-333333333333","email":"test-julia@pexible.de"}'::jsonb, 'email', now(), now(), now())
ON CONFLICT (id, provider) DO NOTHING;
