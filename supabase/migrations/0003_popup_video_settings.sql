create table if not exists public.popup_video_settings (
  id text primary key default 'home' check (id = 'home'),
  youtube_url text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint popup_video_settings_url_not_blank check (length(trim(youtube_url)) > 0)
);

drop trigger if exists popup_video_settings_set_updated_at on public.popup_video_settings;
create trigger popup_video_settings_set_updated_at
before update on public.popup_video_settings
for each row execute function public.set_updated_at();

insert into public.popup_video_settings (id, youtube_url, enabled)
values ('home', 'https://youtu.be/o2ogVKgrCS4?si=svNUnVizhhgcIEvz', true)
on conflict (id) do nothing;

alter table public.popup_video_settings enable row level security;

drop policy if exists "Enabled popup video settings are public" on public.popup_video_settings;
create policy "Enabled popup video settings are public"
on public.popup_video_settings
for select
to anon, authenticated
using (enabled is true);

drop policy if exists "Admins can read popup video settings" on public.popup_video_settings;
create policy "Admins can read popup video settings"
on public.popup_video_settings
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert popup video settings" on public.popup_video_settings;
create policy "Admins can insert popup video settings"
on public.popup_video_settings
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update popup video settings" on public.popup_video_settings;
create policy "Admins can update popup video settings"
on public.popup_video_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select on public.popup_video_settings to anon, authenticated;
grant insert, update on public.popup_video_settings to authenticated;
