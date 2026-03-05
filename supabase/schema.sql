-- Habitual – Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- HABITS
-- ─────────────────────────────────────────
create table if not exists habits (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  emoji       text not null default '✨',
  color       text not null default '#2d5a27',
  created_at  timestamptz not null default now(),
  archived_at timestamptz default null
);

-- RLS
alter table habits enable row level security;
create policy "Users manage own habits"
  on habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on habits (user_id, archived_at);

-- ─────────────────────────────────────────
-- HABIT COMPLETIONS
-- ─────────────────────────────────────────
create table if not exists habit_completions (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  habit_id       uuid not null references habits(id) on delete cascade,
  completed_date date not null,
  is_cheat_day   boolean not null default false,
  unique (habit_id, completed_date)
);

alter table habit_completions enable row level security;
create policy "Users manage own completions"
  on habit_completions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on habit_completions (user_id);
create index on habit_completions (habit_id, completed_date);

-- ─────────────────────────────────────────
-- GOALS
-- ─────────────────────────────────────────
create table if not exists goals (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  description  text default null,
  target_date  date default null,
  completed_at timestamptz default null,
  created_at   timestamptz not null default now()
);

alter table goals enable row level security;
create policy "Users manage own goals"
  on goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on goals (user_id, created_at desc);

-- ─────────────────────────────────────────
-- GOAL–HABIT LINKS
-- ─────────────────────────────────────────
create table if not exists goal_habits (
  goal_id  uuid not null references goals(id) on delete cascade,
  habit_id uuid not null references habits(id) on delete cascade,
  primary key (goal_id, habit_id)
);

alter table goal_habits enable row level security;
create policy "Users manage own goal_habits"
  on goal_habits for all
  using (
    exists (
      select 1 from goals g where g.id = goal_id and g.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from goals g where g.id = goal_id and g.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- USER SETTINGS
-- ─────────────────────────────────────────
create table if not exists user_settings (
  user_id                uuid primary key references auth.users(id) on delete cascade,
  notification_time      time default null,       -- e.g. '08:00'
  onboarding_completed   boolean not null default false
);

alter table user_settings enable row level security;
create policy "Users manage own settings"
  on user_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
