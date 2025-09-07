alter table public.profiles
  add column if not exists photos text[] default '{}';

create or replace function public.keep_first_photo()
returns trigger language plpgsql as $$
begin
  if new.photos is not null and cardinality(new.photos) > 0 then
    new.photo_url := new.photos[1];
  end if;
  return new;
end $$;

drop trigger if exists trg_profiles_first_photo on public.profiles;
create trigger trg_profiles_first_photo
before insert or update on public.profiles
for each row execute function public.keep_first_photo();
