-- Updated schema to match frontend requirements
create extension if not exists "uuid-ossp";

-- Profiles table matching frontend UserProfile type
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  age int not null check (age >= 16 and age <= 100),
  age_range_min int not null default 18 check (age_range_min >= 16 and age_range_min <= 100),
  age_range_max int not null default 24 check (age_range_max >= 16 and age_range_max <= 100),
  major text not null,
  year text not null check (year in ('Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate')),
  pronouns text,
  commuter_status text check (commuter_status in ('on-campus', 'off-campus', 'commuter')),
  profile_picture text,
  interests text[] default '{}',
  classes text[] default '{}',
  bio text,
  university text not null default 'UAH',
  is_profile_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
for each row execute function public.update_updated_at();

-- Swipes table for like/pass actions
create table if not exists public.swipes (
  swiper_id uuid references public.profiles(id) on delete cascade,
  target_id uuid references public.profiles(id) on delete cascade,
  action text check (action in ('like','pass')) not null,
  created_at timestamptz default now(),
  primary key (swiper_id, target_id)
);

-- Matches table for mutual likes
create table if not exists public.matches (
  id bigserial primary key,
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_a, user_b)
);

-- Normalize match so user_a < user_b (prevents duplicates)
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

-- Auto-create match when both users like each other
create or replace function public.handle_like_create_match()
returns trigger language plpgsql as $$
begin
  if new.action = 'like' then
    if exists (
      select 1 from public.swipes s 
      where s.swiper_id = new.target_id 
      and s.target_id = new.swiper_id 
      and s.action = 'like'
    ) then
      begin
        insert into public.matches (user_a, user_b) 
        values (new.swiper_id, new.target_id)
        on conflict (user_a, user_b) do nothing;
      exception when others then null; 
      end;
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists trg_swipes_like on public.swipes;
create trigger trg_swipes_like after insert on public.swipes
for each row execute function public.handle_like_create_match();

-- Messages table
create table if not exists public.messages (
  id bigserial primary key,
  match_id bigint references public.matches(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) <= 2000),
  created_at timestamptz default now()
);

-- Reports table for moderation
create table if not exists public.reports (
  id bigserial primary key,
  reporter_id uuid references public.profiles(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete cascade,
  reason text,
  details text,
  created_at timestamptz default now(),
  status text default 'open'
);

-- Blocks table
create table if not exists public.blocks (
  blocker_id uuid references public.profiles(id) on delete cascade,
  blocked_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (blocker_id, blocked_id)
);

-- Views for easier querying
create or replace view public.profiles_view as
select 
  id, 
  email, 
  name, 
  age,
  age_range_min as "ageRangeMin",
  age_range_max as "ageRangeMax",
  major, 
  year,
  pronouns,
  commuter_status as "commuterStatus",
  profile_picture as "profilePicture",
  interests,
  classes,
  bio, 
  university,
  is_profile_complete as "isProfileComplete",
  created_at as "createdAt", 
  updated_at as "updatedAt"
from public.profiles;

create or replace view public.matches_with_profiles as
select 
  m.id as match_id, 
  m.created_at,
  m.user_a, 
  m.user_b,
  pa.name as user_a_name, 
  pa.profile_picture as user_a_photo,
  pb.name as user_b_name, 
  pb.profile_picture as user_b_photo
from public.matches m
join public.profiles pa on pa.id = m.user_a
join public.profiles pb on pb.id = m.user_b;

-- Indexes for performance
create index if not exists idx_swipes_swiper on public.swipes(swiper_id);
create index if not exists idx_swipes_target on public.swipes(target_id);
create index if not exists idx_matches_a on public.matches(user_a);
create index if not exists idx_matches_b on public.matches(user_b);
create index if not exists idx_messages_match on public.messages(match_id);
create index if not exists idx_blocks_blocker on public.blocks(blocker_id);
create index if not exists idx_blocks_blocked on public.blocks(blocked_id);
create index if not exists idx_profiles_complete on public.profiles(is_profile_complete);
create index if not exists idx_profiles_university on public.profiles(university);

