-- =============================================================
-- PanelControl — Datos de prueba
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- =============================================================

-- ─── 1. ACTUALIZAR NOMBRES DE MÁQUINAS ───────────────────────
-- (asume que ya corriste SUPABASE_SETUP.sql y hay 12 máquinas)

do $$
declare
  maquinas text[][] := array[
    array['Prensa 1',       'Prensa hidráulica línea A'],
    array['Prensa 2',       'Prensa hidráulica línea B'],
    array['Mezcladora 1',   'Mezcladora de concreto principal'],
    array['Mezcladora 2',   'Mezcladora de concreto secundaria'],
    array['Cortadora 1',    'Sierra de corte longitudinal'],
    array['Cortadora 2',    'Sierra de corte transversal'],
    array['Moldeadora 1',   'Moldeadora de paneles 60 cm'],
    array['Moldeadora 2',   'Moldeadora de paneles 90 cm'],
    array['Vibradora 1',    'Mesa vibradora compactadora'],
    array['Vibradora 2',    'Mesa vibradora de acabado'],
    array['Pulidora',       'Pulidora de superficie'],
    array['Empacadora',     'Línea de empaque y etiquetado']
  ];
  ids uuid[];
  i int;
begin
  select array_agg(id order by created_at) into ids from factory_machines;
  for i in 1..array_length(ids, 1) loop
    update factory_machines
       set name        = maquinas[i][1],
           description = maquinas[i][2]
     where id = ids[i];
  end loop;
end $$;

-- ─── 2. CREAR USUARIOS OPERADORES ────────────────────────────
-- Crea los usuarios en auth.users con contraseña hasheada
-- y su perfil en factory_profiles

do $$
declare
  rec record;
  uid uuid;
  usuarios record[] := array[
    ('Carlos Ramírez',  'carlos@panelcontrol.mx',   'Panel2026!', 'operator')::record,
    ('Luis Hernández',  'luis@panelcontrol.mx',     'Panel2026!', 'operator')::record,
    ('José Martínez',   'jose@panelcontrol.mx',     'Panel2026!', 'operator')::record,
    ('Miguel Sánchez',  'miguel@panelcontrol.mx',   'Panel2026!', 'operator')::record,
    ('Andrés Torres',   'andres@panelcontrol.mx',   'Panel2026!', 'operator')::record,
    ('Roberto García',  'roberto@panelcontrol.mx',  'Panel2026!', 'operator')::record,
    ('Ana López',       'ana@panelcontrol.mx',      'Panel2026!', 'operator')::record,
    ('Admin Fábrica',   'admin@panelcontrol.mx',    'Admin2026!', 'admin')::record
  ];
begin
  foreach rec in array usuarios loop
    -- Omitir si el email ya existe
    if exists (select 1 from auth.users where email = rec.f2) then
      continue;
    end if;
    uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role,
      email, encrypted_password,
      email_confirmed_at,
      created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      uid, 'authenticated', 'authenticated',
      rec.f2, crypt(rec.f3, gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{}', '', ''
    );
    insert into factory_profiles (id, name, role, is_active)
    values (uid, rec.f1, rec.f4, true)
    on conflict (id) do nothing;
  end loop;
end $$;

-- ─── Verificar resultado ──────────────────────────────────────
select name, description from factory_machines order by created_at;
select p.name, p.role, u.email
  from factory_profiles p
  join auth.users u on u.id = p.id
 order by p.role desc, p.name;
