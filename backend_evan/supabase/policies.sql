alter table public.profiles enable row level security;
alter table public.tags enable row level security;
alter table public.user_tags enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update to authenticated using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "profiles_select_all_safe" on public.profiles;
create policy "profiles_select_all_safe" on public.profiles
for select to authenticated
using (true);

drop policy if exists "tags_read" on public.tags;
create policy "tags_read" on public.tags
for select to authenticated using (true);

drop policy if exists "tags_insert" on public.tags;
create policy "tags_insert" on public.tags
for insert to authenticated with check (true);

drop policy if exists "user_tags_manage_own" on public.user_tags;
create policy "user_tags_manage_own" on public.user_tags
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "swipes_manage_own" on public.swipes;
create policy "swipes_manage_own" on public.swipes
for all to authenticated
using (swiper_id = auth.uid())
with check (swiper_id = auth.uid());

drop policy if exists "matches_select_participant" on public.matches;
create policy "matches_select_participant" on public.matches
for select to authenticated
using (user_a = auth.uid() or user_b = auth.uid());

drop policy if exists "messages_insert_participant" on public.messages;
create policy "messages_insert_participant" on public.messages
for insert to authenticated
with check (
  exists (
    select 1 from public.matches m
    where m.id = match_id and (m.user_a = auth.uid() or m.user_b = auth.uid())
  )
);

drop policy if exists "messages_select_participant" on public.messages;
create policy "messages_select_participant" on public.messages
for select to authenticated
using (
  exists (
    select 1 from public.matches m
    where m.id = match_id and (m.user_a = auth.uid() or m.user_b = auth.uid())
  )
);

drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own" on public.reports
for insert to authenticated
with check (reporter_id = auth.uid());

drop policy if exists "reports_read_own" on public.reports;
create policy "reports_read_own" on public.reports
for select to authenticated
using (reporter_id = auth.uid());

drop policy if exists "blocks_manage_own" on public.blocks;
create policy "blocks_manage_own" on public.blocks
for all to authenticated
using (blocker_id = auth.uid())
with check (blocker_id = auth.uid());