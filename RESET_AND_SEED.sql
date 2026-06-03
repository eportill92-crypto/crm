-- RESET COMPLETO
truncate factory_pauses cascade;
truncate factory_sessions cascade;
truncate factory_machine_assignments cascade;
truncate factory_machines cascade;
truncate factory_pause_reasons cascade;
truncate factory_profiles cascade;

-- Borrar usuarios de prueba anteriores
delete from auth.users where email like '%@prueba.com' or email like '%@panelcontrol.mx' or email like '%@panel.com.mx';

-- 4 MÁQUINAS
insert into factory_machines (name, description) values
  ('Prensa 1',     'Prensa hidráulica línea A'),
  ('Mezcladora 1', 'Mezcladora de concreto principal'),
  ('Cortadora 1',  'Sierra de corte longitudinal'),
  ('Moldeadora 1', 'Moldeadora de paneles 60 cm');

-- MOTIVOS DE PAUSA
insert into factory_pause_reasons (name, color) values
  ('Mantenimiento',     '#E74C3C'),
  ('Falta de material', '#F39C12'),
  ('Descanso / Comida', '#27AE60'),
  ('Ajuste de máquina', '#3498DB'),
  ('Falla eléctrica',   '#9B59B6'),
  ('Falla mecánica',    '#E67E22'),
  ('Limpieza',          '#1ABC9C'),
  ('Otro',              '#95A5A6');

-- GERENTE
do $$ declare uid uuid := gen_random_uuid(); begin
  insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token,is_super_admin)
  values ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated','gerente@prueba.com',crypt('Gerente123',gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','','',false);
  insert into factory_profiles (id,name,role,is_active) values (uid,'Gerente General','gerente',true);
end $$;

-- 4 OPERADORES
do $$ declare uid uuid := gen_random_uuid(); begin
  insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token,is_super_admin)
  values ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated','op1@prueba.com',crypt('Oper123',gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','','',false);
  insert into factory_profiles (id,name,role,is_active) values (uid,'Carlos Ramírez','operador',true);
end $$;

do $$ declare uid uuid := gen_random_uuid(); begin
  insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token,is_super_admin)
  values ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated','op2@prueba.com',crypt('Oper123',gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','','',false);
  insert into factory_profiles (id,name,role,is_active) values (uid,'Luis Hernández','operador',true);
end $$;

do $$ declare uid uuid := gen_random_uuid(); begin
  insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token,is_super_admin)
  values ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated','op3@prueba.com',crypt('Oper123',gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','','',false);
  insert into factory_profiles (id,name,role,is_active) values (uid,'José Martínez','operador',true);
end $$;

do $$ declare uid uuid := gen_random_uuid(); begin
  insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data,confirmation_token,recovery_token,is_super_admin)
  values ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated','op4@prueba.com',crypt('Oper123',gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{}','','',false);
  insert into factory_profiles (id,name,role,is_active) values (uid,'Ana López','operador',true);
end $$;

-- Verificar
select p.name, p.role, u.email from factory_profiles p join auth.users u on u.id=p.id order by p.role, p.name;
select name from factory_machines;
