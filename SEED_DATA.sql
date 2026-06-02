-- =============================================================
-- PanelControl — Datos de prueba
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- =============================================================

-- Habilitar pgcrypto (necesario para crypt)
create extension if not exists pgcrypto;

-- ─── 1. ACTUALIZAR NOMBRES DE MÁQUINAS ───────────────────────
do $$
declare
  ids uuid[];
begin
  select array_agg(id order by created_at) into ids from factory_machines;
  if array_length(ids,1) >= 12 then
    update factory_machines set name='Prensa 1',      description='Prensa hidráulica línea A'         where id=ids[1];
    update factory_machines set name='Prensa 2',      description='Prensa hidráulica línea B'         where id=ids[2];
    update factory_machines set name='Mezcladora 1',  description='Mezcladora de concreto principal'  where id=ids[3];
    update factory_machines set name='Mezcladora 2',  description='Mezcladora de concreto secundaria' where id=ids[4];
    update factory_machines set name='Cortadora 1',   description='Sierra de corte longitudinal'      where id=ids[5];
    update factory_machines set name='Cortadora 2',   description='Sierra de corte transversal'       where id=ids[6];
    update factory_machines set name='Moldeadora 1',  description='Moldeadora de paneles 60 cm'       where id=ids[7];
    update factory_machines set name='Moldeadora 2',  description='Moldeadora de paneles 90 cm'       where id=ids[8];
    update factory_machines set name='Vibradora 1',   description='Mesa vibradora compactadora'       where id=ids[9];
    update factory_machines set name='Vibradora 2',   description='Mesa vibradora de acabado'         where id=ids[10];
    update factory_machines set name='Pulidora',      description='Pulidora de superficie'            where id=ids[11];
    update factory_machines set name='Empacadora',    description='Línea de empaque y etiquetado'     where id=ids[12];
  end if;
end $$;

-- ─── 2. CREAR USUARIOS ───────────────────────────────────────
-- Cada bloque crea un usuario si no existe

do $$
declare uid uuid := gen_random_uuid();
begin
  if not exists (select 1 from auth.users where email='admin@panelcontrol.mx') then
    insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token)
    values ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated','admin@panelcontrol.mx',crypt('Admin2026!',gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','','');
    insert into factory_profiles (id,name,role,is_active) values (uid,'Admin Fábrica','admin',true);
  end if;
end $$;

do $$
declare uid uuid := gen_random_uuid();
begin
  if not exists (select 1 from auth.users where email='carlos@panelcontrol.mx') then
    insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token)
    values ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated','carlos@panelcontrol.mx',crypt('Panel2026!',gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','','');
    insert into factory_profiles (id,name,role,is_active) values (uid,'Carlos Ramírez','operator',true);
  end if;
end $$;

do $$
declare uid uuid := gen_random_uuid();
begin
  if not exists (select 1 from auth.users where email='luis@panelcontrol.mx') then
    insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token)
    values ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated','luis@panelcontrol.mx',crypt('Panel2026!',gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','','');
    insert into factory_profiles (id,name,role,is_active) values (uid,'Luis Hernández','operator',true);
  end if;
end $$;

do $$
declare uid uuid := gen_random_uuid();
begin
  if not exists (select 1 from auth.users where email='jose@panelcontrol.mx') then
    insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token)
    values ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated','jose@panelcontrol.mx',crypt('Panel2026!',gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','','');
    insert into factory_profiles (id,name,role,is_active) values (uid,'José Martínez','operator',true);
  end if;
end $$;

do $$
declare uid uuid := gen_random_uuid();
begin
  if not exists (select 1 from auth.users where email='miguel@panelcontrol.mx') then
    insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token)
    values ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated','miguel@panelcontrol.mx',crypt('Panel2026!',gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','','');
    insert into factory_profiles (id,name,role,is_active) values (uid,'Miguel Sánchez','operator',true);
  end if;
end $$;

do $$
declare uid uuid := gen_random_uuid();
begin
  if not exists (select 1 from auth.users where email='andres@panelcontrol.mx') then
    insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token)
    values ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated','andres@panelcontrol.mx',crypt('Panel2026!',gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','','');
    insert into factory_profiles (id,name,role,is_active) values (uid,'Andrés Torres','operator',true);
  end if;
end $$;

do $$
declare uid uuid := gen_random_uuid();
begin
  if not exists (select 1 from auth.users where email='roberto@panelcontrol.mx') then
    insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token)
    values ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated','roberto@panelcontrol.mx',crypt('Panel2026!',gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','','');
    insert into factory_profiles (id,name,role,is_active) values (uid,'Roberto García','operator',true);
  end if;
end $$;

do $$
declare uid uuid := gen_random_uuid();
begin
  if not exists (select 1 from auth.users where email='ana@panelcontrol.mx') then
    insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token)
    values ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated','ana@panelcontrol.mx',crypt('Panel2026!',gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','','');
    insert into factory_profiles (id,name,role,is_active) values (uid,'Ana López','operator',true);
  end if;
end $$;

-- ─── Verificar ───────────────────────────────────────────────
select name, description from factory_machines order by created_at;
select p.name, p.role, u.email
  from factory_profiles p join auth.users u on u.id=p.id
 order by p.role desc, p.name;
