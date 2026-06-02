-- Run this in Supabase SQL editor

create table if not exists factory_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'operator',
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists factory_machines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Insert the 12 machines
insert into factory_machines (name) values
  ('Máquina 1'),('Máquina 2'),('Máquina 3'),('Máquina 4'),
  ('Máquina 5'),('Máquina 6'),('Máquina 7'),('Máquina 8'),
  ('Máquina 9'),('Máquina 10'),('Máquina 11'),('Máquina 12');

create table if not exists factory_pause_reasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text default '#F39C12',
  is_active boolean default true,
  created_at timestamptz default now()
);

insert into factory_pause_reasons (name, color) values
  ('Mantenimiento', '#E74C3C'),
  ('Falta de material', '#F39C12'),
  ('Descanso / Comida', '#27AE60'),
  ('Ajuste de máquina', '#3498DB'),
  ('Falla eléctrica', '#9B59B6'),
  ('Falla mecánica', '#E67E22'),
  ('Limpieza', '#1ABC9C'),
  ('Otro', '#95A5A6');

create table if not exists factory_machine_assignments (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid references factory_machines(id) on delete cascade,
  operator_id uuid references factory_profiles(id) on delete cascade,
  assigned_at timestamptz default now(),
  unassigned_at timestamptz
);

create table if not exists factory_sessions (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid references factory_machines(id) on delete cascade,
  operator_id uuid references factory_profiles(id) on delete cascade,
  started_at timestamptz default now(),
  ended_at timestamptz
);

create table if not exists factory_pauses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references factory_sessions(id) on delete cascade,
  reason_id uuid references factory_pause_reasons(id),
  reason_name text,
  notes text,
  started_at timestamptz default now(),
  ended_at timestamptz
);

-- RLS: enable but allow all for authenticated users (adjust per security needs)
alter table factory_profiles enable row level security;
alter table factory_machines enable row level security;
alter table factory_pause_reasons enable row level security;
alter table factory_machine_assignments enable row level security;
alter table factory_sessions enable row level security;
alter table factory_pauses enable row level security;

create policy "auth read profiles" on factory_profiles for select to authenticated using (true);
create policy "auth insert profiles" on factory_profiles for insert to authenticated with check (auth.uid() = id);
create policy "auth update profiles" on factory_profiles for update to authenticated using (true);

create policy "auth read machines" on factory_machines for all to authenticated using (true) with check (true);
create policy "auth read reasons" on factory_pause_reasons for all to authenticated using (true) with check (true);
create policy "auth manage assignments" on factory_machine_assignments for all to authenticated using (true) with check (true);
create policy "auth manage sessions" on factory_sessions for all to authenticated using (true) with check (true);
create policy "auth manage pauses" on factory_pauses for all to authenticated using (true) with check (true);
