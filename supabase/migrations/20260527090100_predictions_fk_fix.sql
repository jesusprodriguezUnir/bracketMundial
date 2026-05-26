-- Arregla el FK de predictions.user_id, que apunta a una tabla "users"
-- (probablemente public.users) en lugar de auth.users. Al borrar/recrear
-- usuarios de auth, la FK se rompe con:
--   23503 — Key is not present in table "users".
--
-- Solución: re-apuntar el FK a auth.users con ON DELETE CASCADE.

do $$
declare
  fk_name text;
begin
  select conname
  into fk_name
  from pg_constraint
  where conrelid = 'public.predictions'::regclass
    and contype = 'f'
    and conname like '%user_id%';

  if fk_name is not null then
    execute format('alter table public.predictions drop constraint %I', fk_name);
  end if;

  alter table public.predictions
    add constraint predictions_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;
exception
  when undefined_table then
    -- la tabla predictions no existe en este entorno, no hacemos nada.
    null;
end $$;
