DB Tweak 2a

-- If nothing depends on the view, this works:
DROP VIEW IF EXISTS public.profiles_view;

CREATE VIEW public.profiles_view AS
SELECT
  id, email, name, birthday, major, pronouns, year, commuter_status, bio,
  featured_tags, photo_url, photos, created_at, updated_at
FROM public.profiles;
