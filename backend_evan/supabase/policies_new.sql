-- Row Level Security Policies
-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;

-- Profiles: Users can read all completed profiles, but only update their own
create policy "Users can view completed profiles"
  on public.profiles for select
  using (is_profile_complete = true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Swipes: Users can only manage their own swipes
create policy "Users can view their own swipes"
  on public.swipes for select
  using (auth.uid() = swiper_id);

create policy "Users can create their own swipes"
  on public.swipes for insert
  with check (auth.uid() = swiper_id);

-- Matches: Users can view matches they're part of
create policy "Users can view their matches"
  on public.matches for select
  using (auth.uid() = user_a or auth.uid() = user_b);

-- Messages: Users can view and send messages in their matches
create policy "Users can view messages in their matches"
  on public.messages for select
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  );

create policy "Users can send messages in their matches"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.matches m
      where m.id = match_id
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  );

-- Reports: Users can create reports and view their own
create policy "Users can create reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "Users can view their own reports"
  on public.reports for select
  using (auth.uid() = reporter_id);

-- Blocks: Users can manage their own blocks
create policy "Users can view their blocks"
  on public.blocks for select
  using (auth.uid() = blocker_id);

create policy "Users can create blocks"
  on public.blocks for insert
  with check (auth.uid() = blocker_id);

create policy "Users can delete their blocks"
  on public.blocks for delete
  using (auth.uid() = blocker_id);

