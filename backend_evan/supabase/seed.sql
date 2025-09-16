insert into public.tags (name) values
('studying'),
('hiking'),
('coffee'),
('tea parties')
on conflict (name) do nothing;