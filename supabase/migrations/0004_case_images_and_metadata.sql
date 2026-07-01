alter table public.posts
  add column if not exists case_category text,
  add column if not exists case_location text,
  add column if not exists case_area text,
  add column if not exists case_cost text,
  add column if not exists video_url text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'posts_case_category_allowed'
      and conrelid = 'public.posts'::regclass
  ) then
    alter table public.posts
      add constraint posts_case_category_allowed check (
        case_category is null
        or case_category in (
          '완전 철거',
          '인테리어 철거',
          '석면 해체',
          '구조물 해체',
          '비계공사',
          '토공사',
          '기타'
        )
      );
  end if;
end $$;

create table if not exists public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  bucket text not null default 'case-images',
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint post_images_bucket_check check (bucket = 'case-images'),
  constraint post_images_storage_path_not_blank check (length(trim(storage_path)) > 0),
  constraint post_images_storage_path_unique unique (bucket, storage_path)
);

create index if not exists post_images_post_sort_idx
  on public.post_images (post_id, sort_order, created_at);

drop trigger if exists post_images_set_updated_at on public.post_images;
create trigger post_images_set_updated_at
before update on public.post_images
for each row execute function public.set_updated_at();

alter table public.post_images enable row level security;

drop policy if exists "Published post images are public" on public.post_images;
create policy "Published post images are public"
on public.post_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.posts
    where posts.id = post_images.post_id
      and posts.status = 'published'
  )
);

drop policy if exists "Admins can read post images" on public.post_images;
create policy "Admins can read post images"
on public.post_images
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert post images" on public.post_images;
create policy "Admins can insert post images"
on public.post_images
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update post images" on public.post_images;
create policy "Admins can update post images"
on public.post_images
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete post images" on public.post_images;
create policy "Admins can delete post images"
on public.post_images
for delete
to authenticated
using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'case-images',
  'case-images',
  true,
  10485760,
  array[
    'image/jpeg',
    'image/png'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Published case images are readable" on storage.objects;
create policy "Published case images are readable"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'case-images'
  and (
    public.is_admin()
    or exists (
      select 1
      from public.post_images
      join public.posts on posts.id = post_images.post_id
      where post_images.bucket = storage.objects.bucket_id
        and post_images.storage_path = storage.objects.name
        and posts.status = 'published'
    )
  )
);

drop policy if exists "Admins can upload case images" on storage.objects;
create policy "Admins can upload case images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'case-images'
  and public.is_admin()
);

drop policy if exists "Admins can update case images" on storage.objects;
create policy "Admins can update case images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'case-images'
  and public.is_admin()
)
with check (
  bucket_id = 'case-images'
  and public.is_admin()
);

drop policy if exists "Admins can delete case images" on storage.objects;
create policy "Admins can delete case images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'case-images'
  and public.is_admin()
);

grant select on public.post_images to anon, authenticated;
grant insert, update, delete on public.post_images to authenticated;
