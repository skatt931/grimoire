-- ══════════════════════════════════════════
--  Anna's Grimoire — Database Schema
-- ══════════════════════════════════════════

-- Cards (seeded, read-only for users)
create table public.cards (
  id            integer primary key,
  name_uk       text    not null,
  name_en       text    not null,
  arcana        text    not null check (arcana in ('major', 'minor')),
  suit          text,                    -- null for major arcana
  number        integer,                 -- 0-21 for major, 1-14 for minor
  keywords      text[]  not null default '{}',
  meaning_up    text    not null,
  meaning_rev   text    not null,
  reflections   text[]  not null default '{}',
  image_url     text
);

-- Readings
create table public.readings (
  id             uuid    primary key default gen_random_uuid(),
  user_id        uuid    not null references auth.users(id) on delete cascade,
  title          text    not null,
  question       text,
  spread_type    text    not null check (spread_type in ('three_card', 'free_form')),
  notes          text,
  interpretation text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Cards within a reading
create table public.reading_cards (
  id           uuid    primary key default gen_random_uuid(),
  reading_id   uuid    not null references public.readings(id) on delete cascade,
  card_id      integer not null references public.cards(id),
  position     integer not null,
  position_name text,               -- e.g. "Минуле", "Теперішнє"
  is_reversed  boolean not null default false,
  note         text
);

-- Anna's personal notes per card
create table public.card_notes (
  id         uuid    primary key default gen_random_uuid(),
  user_id    uuid    not null references auth.users(id) on delete cascade,
  card_id    integer not null references public.cards(id),
  content    text    not null,
  updated_at timestamptz not null default now(),
  unique (user_id, card_id)
);

-- Favorites
create table public.favorites (
  user_id  uuid    not null references auth.users(id) on delete cascade,
  card_id  integer not null references public.cards(id),
  added_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

-- Daily horoscope cache
create table public.horoscope_cache (
  date   date    primary key,
  sign   text    not null default 'gemini',
  text   text    not null,
  source text
);

-- ── Indexes ──
create index readings_user_created on public.readings(user_id, created_at desc);
create index reading_cards_reading  on public.reading_cards(reading_id);
create index card_notes_user        on public.card_notes(user_id);
create index favorites_user         on public.favorites(user_id);

-- ── Updated_at trigger ──
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger readings_updated_at
  before update on public.readings
  for each row execute function update_updated_at();

create trigger card_notes_updated_at
  before update on public.card_notes
  for each row execute function update_updated_at();

-- ── Row Level Security ──
alter table public.readings     enable row level security;
alter table public.reading_cards enable row level security;
alter table public.card_notes   enable row level security;
alter table public.favorites    enable row level security;
alter table public.cards        enable row level security;
alter table public.horoscope_cache enable row level security;

-- Cards: readable by everyone authenticated
create policy "cards_read" on public.cards
  for select using (auth.role() = 'authenticated');

-- Horoscope cache: readable by everyone authenticated
create policy "horoscope_read" on public.horoscope_cache
  for select using (auth.role() = 'authenticated');
create policy "horoscope_insert" on public.horoscope_cache
  for insert with check (auth.role() = 'authenticated');
create policy "horoscope_update" on public.horoscope_cache
  for update using (auth.role() = 'authenticated');

-- Readings: own rows only
create policy "readings_select" on public.readings
  for select using (auth.uid() = user_id);
create policy "readings_insert" on public.readings
  for insert with check (auth.uid() = user_id);
create policy "readings_update" on public.readings
  for update using (auth.uid() = user_id);
create policy "readings_delete" on public.readings
  for delete using (auth.uid() = user_id);

-- Reading cards: via reading ownership
create policy "reading_cards_select" on public.reading_cards
  for select using (
    exists (select 1 from public.readings r where r.id = reading_id and r.user_id = auth.uid())
  );
create policy "reading_cards_insert" on public.reading_cards
  for insert with check (
    exists (select 1 from public.readings r where r.id = reading_id and r.user_id = auth.uid())
  );
create policy "reading_cards_delete" on public.reading_cards
  for delete using (
    exists (select 1 from public.readings r where r.id = reading_id and r.user_id = auth.uid())
  );

-- Card notes: own rows only
create policy "card_notes_select" on public.card_notes
  for select using (auth.uid() = user_id);
create policy "card_notes_insert" on public.card_notes
  for insert with check (auth.uid() = user_id);
create policy "card_notes_update" on public.card_notes
  for update using (auth.uid() = user_id);
create policy "card_notes_delete" on public.card_notes
  for delete using (auth.uid() = user_id);

-- Favorites: own rows only
create policy "favorites_select" on public.favorites
  for select using (auth.uid() = user_id);
create policy "favorites_insert" on public.favorites
  for insert with check (auth.uid() = user_id);
create policy "favorites_delete" on public.favorites
  for delete using (auth.uid() = user_id);
