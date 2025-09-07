create or replace view public.profiles_view as
select id, email, name, birthday, major, pronouns, year, commuter_status, bio,
       featured_tags, photo_url, photos, created_at, updated_at
from public.profiles;
