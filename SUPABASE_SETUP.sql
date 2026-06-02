-- PanelControl - Factory Machine Management System
-- Run this entire file in the Supabase SQL editor

-- PROFILES
create table if not exists factory_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'operator',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table factory_profiles enable row level security;
drop policy if exists "profiles_select" on factory_profiles;
drop policy if exists "profiles_insert" on factory_profiles;
drop policy if exists "profiles_update" on factory_profiles;
create policy "profiles_select" on factory_profiles for select to authenticated using (true);
create policy "profiles_insert" on factory_profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update" on factory_profiles for update to authenticated using (true);

-- MACHINES
create table if not exists factory_machines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table factory_machines enable row level security;
drop policy if exists "machines_all" on factory_machines;
create policy "machines_all" on factory_machines for all to authenticated using (true) with check (true);

-- Seed 12 machines (only if table is empty)
insert into factory_machines (name)
select unnest(array['Máquina 1','Máquina 2','Máquina 3','Máquina 4','Máquina 5','Máquina 6',
                     'Máquina 7','Máquina 8','Máquina 9','Máquina 10','Máquina 11','Máquina 12'])
where not exists (select 1 from factory_machines limit 1);

-- PAUSE REASONS
create table if not exists factory_pause_reasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#F39C12',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table factory_pause_reasons enable row level security;
drop policy if exists "reasons_all" on factory_pause_reasons;
create policy "reasons_all" on factory_pause_reasons for all to authenticated using (true) with check (true);

insert into factory_pause_reasons (name, color)
select * from (values
  ('Mantenimiento','#E74C3C'),
  ('Falta de material','#F39C12'),
  ('Descanso / Comida','#27AE60'),
  ('Ajuste de máquina','#3498DB'),
  ('Falla eléctrica','#9B59B6'),
  ('Falla mecánica','#E67E22'),
  ('Limpieza','#1ABC9C'),
  ('Otro','#95A5A6')
) as v(name, color)
where not exists (select 1 from factory_pause_reasons limit 1);

-- MACHINE ASSIGNMENTS
create table if not exists factory_machine_assignments (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid not null references factory_machines(id) on delete cascade,
  operator_id uuid not null references factory_profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unassigned_at timestamptz
);
alter table factory_machine_assignments enable row level security;
drop policy if exists "assignments_all" on factory_machine_assignments;
create policy "assignments_all" on factory_machine_assignments for all to authenticated using (true) with check (true);

-- SESSIONS
create table if not exists factory_sessions (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid not null references factory_machines(id) on delete cascade,
  operator_id uuid not null references factory_profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);
alter table factory_sessions enable row level security;
drop policy if exists "sessions_all" on factory_sessions;
create policy "sessions_all" on factory_sessions for all to authenticated using (true) with check (true);

-- PAUSES
create table if not exists factory_pauses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references factory_sessions(id) on delete cascade,
  reason_id uuid references factory_pause_reasons(id),
  reason_name text,
  notes text,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);
alter table factory_pauses enable row level security;
drop policy if exists "pauses_all" on factory_pauses;
create policy "pauses_all" on factory_pauses for all to authenticated using (true) with check (true);
