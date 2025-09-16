alter table storage.objects enable row level security;

drop policy if exists "avatars-read-public" on storage.objects;
create policy "avatars-read-public"
on storage.objects for select
to public
using (bucket_id = 'avatars');

drop policy if exists "avatars-insert-own-prefix" on storage.objects;
create policy "avatars-insert-own-prefix"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (split_part(name, '/', 1))::uuid = auth.uid()
);

drop policy if exists "avatars-update-own" on storage.objects;
create policy "avatars-update-own"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and (split_part(name, '/', 1))::uuid = auth.uid()
);

drop policy if exists "avatars-delete-own" on storage.objects;
create policy "avatars-delete-own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and (split_part(name, '/', 1))::uuid = auth.uid()
);