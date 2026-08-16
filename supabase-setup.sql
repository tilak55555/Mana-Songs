-- Run this in Supabase Dashboard -> SQL Editor

create table if not exists songs (
  id bigint generated always as identity primary key,
  title text not null,
  artist text,
  category text not null,        -- one of: tractor, gym, 90s, bob, ride
  audio_url text not null,       -- public URL of the mp3 (Supabase Storage or external)
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table songs enable row level security;

-- Allow anyone to read songs (public jukebox, no auth needed)
create policy "Public read access"
  on songs for select
  using (true);

-- (Optional) allow only you to insert/update via the dashboard / service key,
-- so don't add an insert policy for the anon key — insert songs manually
-- from the Table Editor or via authenticated requests.

-- Example inserts:
-- insert into songs (title, artist, category, audio_url, sort_order) values
-- ('Basinga Balaalu', 'Singer Name', 'tractor', 'https://YOUR-PROJECT.supabase.co/storage/v1/object/public/audio/tractor-1.mp3', 1);
