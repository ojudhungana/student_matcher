create extension if not exists "uuid-ossp";

do $$ begin
  create type year as enum ('freshman','sophomore','junior','senior','graduate','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type commuter_status as enum ('commuter_other_city','commuter_huntsville','non_commuter');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  birthday date,
  major text,
  student_id_hash text not null,
  pronouns text,
  year year,
  commuter_status commuter_status,
  bio text,
  featured_tags text[] default '{}',
  photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
for each row execute function public.update_updated_at();

create table if not exists public.tags ( id bigserial primary key, name text unique not null );

create table if not exists public.user_tags (
  user_id uuid references public.profiles(id) on delete cascade,
  tag_id bigint references public.tags(id) on delete cascade,
  primary key (user_id, tag_id)
);

create table if not exists public.swipes (
  swiper_id uuid references public.profiles(id) on delete cascade,
  target_id uuid references public.profiles(id) on delete cascade,
  action text check (action in ('like','pass')) not null,
  created_at timestamptz default now(),
  primary key (swiper_id, target_id)
);

create table if not exists public.matches (
  id bigserial primary key,
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_a, user_b)
);

create or replace function public.normalize_match()
returns trigger language plpgsql as $$
begin
  if new.user_a > new.user_b then
    declare tmp uuid;
    begin
      tmp := new.user_a;
      new.user_a = new.user_b;
      new.user_b = tmp;
    end;
  end if;
  return new;
end; $$;

drop trigger if exists trg_normalize_match on public.matches;
create trigger trg_normalize_match before insert on public.matches
for each row execute function public.normalize_match();

create or replace function public.handle_like_create_match()
returns trigger language plpgsql as $$
begin
  if new.action = 'like' then
    if exists (select 1 from public.swipes s where s.swiper_id = new.target_id and s.target_id = new.swiper_id and s.action = 'like') then
      begin
        insert into public.matches (user_a, user_b) values (new.swiper_id, new.target_id)
        on conflict (user_a, user_b) do nothing;
      exception when others then null; end;
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists trg_swipes_like on public.swipes;
create trigger trg_swipes_like after insert on public.swipes
for each row execute function public.handle_like_create_match();

create table if not exists public.messages (
  id bigserial primary key,
  match_id bigint references public.matches(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) <= 2000),
  created_at timestamptz default now()
);

create table if not exists public.reports (
  id bigserial primary key,
  reporter_id uuid references public.profiles(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete cascade,
  reason text,
  details text,
  created_at timestamptz default now(),
  status text default 'open'
);

create table if not exists public.blocks (
  blocker_id uuid references public.profiles(id) on delete cascade,
  blocked_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (blocker_id, blocked_id)
);

create or replace view public.profiles_view as
select id, email, name, birthday, major, pronouns, year, commuter_status, bio, featured_tags, photo_url, created_at, updated_at
from public.profiles;

create or replace view public.user_tags_with_names as
select ut.user_id, t.name from public.user_tags ut join public.tags t on t.id = ut.tag_id;

create or replace view public.matches_with_profiles as
select m.id as match_id, m.created_at, m.user_a, m.user_b,
pa.name as user_a_name, pa.photo_url as user_a_photo,
pb.name as user_b_name, pb.photo_url as user_b_photo
from public.matches m
join public.profiles pa on pa.id = m.user_a
join public.profiles pb on pb.id = m.user_b;

create index if not exists idx_swipes_swiper on public.swipes(swiper_id);
create index if not exists idx_swipes_target on public.swipes(target_id);
create index if not exists idx_matches_a on public.matches(user_a);
create index if not exists idx_matches_b on public.matches(user_b);
create index if not exists idx_messages_match on public.messages(match_id);
create index if not exists idx_blocks_blocker on public.blocks(blocker_id);
create index if not exists idx_blocks_blocked on public.blocks(blocked_id);