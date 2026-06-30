create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  demolition_types text[] not null,
  region text,
  address text,
  area text,
  site_memo text,
  contact_name text,
  phone text not null,
  privacy_agreed boolean not null default false,
  attachment_bucket text,
  attachment_path text,
  attachment_name text,
  attachment_mime_type text,
  attachment_size_bytes integer,
  email_status text not null default 'pending' check (email_status in ('pending', 'sent', 'failed')),
  email_error text,
  created_at timestamptz not null default now(),
  constraint quote_requests_types_not_empty check (array_length(demolition_types, 1) > 0),
  constraint quote_requests_types_allowed check (
    demolition_types <@ array[
      'complete',
      'interior',
      'asbestos',
      'structure',
      'support_fund',
      'scaffold',
      'earthwork',
      'other'
    ]::text[]
  ),
  constraint quote_requests_phone_not_blank check (length(trim(phone)) > 0),
  constraint quote_requests_privacy_required check (privacy_agreed is true)
);

create index if not exists quote_requests_created_at_idx
  on public.quote_requests (created_at desc);

create index if not exists quote_requests_email_status_idx
  on public.quote_requests (email_status);

alter table public.quote_requests enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quote-attachments',
  'quote-attachments',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

grant usage on schema public to service_role;
grant select, insert, update on public.quote_requests to service_role;
