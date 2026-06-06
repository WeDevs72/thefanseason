-- Database schema for TheFanSeason (FIFA World Cup 2026)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  country text,
  supported_team text,
  fan_card_tier text default 'rookie',
  is_premium boolean default false,
  card_theme text default 'free',
  title_badge text,
  created_at timestamp with time zone default now()
);

-- 2. Matches Table
create table if not exists public.matches (
  id serial primary key,
  api_match_id integer unique,
  home_team text not null,
  away_team text not null,
  home_team_logo text,
  away_team_logo text,
  match_date timestamp with time zone not null,
  stage text,
  group_name text,
  venue text,
  status text default 'upcoming', -- 'upcoming', 'live', 'finished'
  home_score integer,
  away_score integer
);

-- 3. Predictions Table
create table if not exists public.predictions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  match_id integer references public.matches(id) on delete cascade,
  predicted_winner text not null, -- 'home', 'away', 'draw'
  predicted_home_score integer,
  predicted_away_score integer,
  points_earned integer default 0,
  is_correct boolean,
  created_at timestamp with time zone default now(),
  unique(user_id, match_id)
);

-- 4. Leaderboard Table
create table if not exists public.leaderboard (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  total_points integer default 0,
  correct_predictions integer default 0,
  total_predictions integer default 0,
  accuracy_percent numeric(5,2) default 0.00,
  current_streak integer default 0,
  rank integer,
  updated_at timestamp with time zone default now()
);

-- 5. Digital Products Table
create table if not exists public.digital_products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price_inr integer not null,
  file_url text,
  preview_image text,
  category text, -- 'Templates', 'Wallpapers', 'Tools', 'Bundles'
  is_active boolean default true
);

-- 6. Orders Table
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  product_id uuid references public.digital_products(id) on delete set null,
  razorpay_order_id text,
  razorpay_payment_id text,
  amount_inr integer,
  status text default 'pending', -- 'pending', 'paid', 'failed'
  created_at timestamp with time zone default now()
);

-- 7. Badges Table
create table if not exists public.badges (
  id serial primary key,
  name text not null,
  icon text not null,
  description text,
  condition_type text not null, -- 'first_prediction', 'streak_3', 'streak_5', 'accuracy_80', 'century_points', 'top_10'
  condition_value integer
);

-- 8. User Badges Table
create table if not exists public.user_badges (
  user_id uuid references public.profiles(id) on delete cascade,
  badge_id integer references public.badges(id) on delete cascade,
  earned_at timestamp with time zone default now(),
  primary key(user_id, badge_id)
);

-- Enable RLS for all tables
alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;
alter table public.leaderboard enable row level security;
alter table public.digital_products enable row level security;
alter table public.orders enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

-- Policies for public reading
create policy "Allow public read on profiles" on public.profiles for select using (true);
create policy "Allow public read on matches" on public.matches for select using (true);
create policy "Allow public read on leaderboard" on public.leaderboard for select using (true);
create policy "Allow public read on digital_products" on public.digital_products for select using (true);
create policy "Allow public read on badges" on public.badges for select using (true);
create policy "Allow public read on user_badges" on public.user_badges for select using (true);

-- Authenticated writes
create policy "Allow users to update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Allow users to read own predictions" on public.predictions for select using (auth.uid() = user_id);
create policy "Allow users to insert own predictions" on public.predictions for insert with check (auth.uid() = user_id);
create policy "Allow users to update own predictions before match starts" on public.predictions for update
  using (
    auth.uid() = user_id 
    and exists (
      select 1 from public.matches 
      where matches.id = predictions.match_id 
      and matches.match_date > now()
    )
  );

create policy "Allow users to read own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Allow users to insert own orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "Allow users to update own orders" on public.orders for update using (auth.uid() = user_id);

-- System Service Role Full Access (Default bypass in postgres, but added for clarity)
create policy "Service role full access on profiles" on public.profiles for all to service_role using (true);
create policy "Service role full access on matches" on public.matches for all to service_role using (true);
create policy "Service role full access on predictions" on public.predictions for all to service_role using (true);
create policy "Service role full access on leaderboard" on public.leaderboard for all to service_role using (true);
create policy "Service role full access on digital_products" on public.digital_products for all to service_role using (true);
create policy "Service role full access on orders" on public.orders for all to service_role using (true);
create policy "Service role full access on badges" on public.badges for all to service_role using (true);
create policy "Service role full access on user_badges" on public.user_badges for all to service_role using (true);


-- 9. Trigger for automatic profile creation when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_username text;
begin
  default_username := coalesce(new.raw_user_meta_data->>'username', 'fan_' || substr(md5(new.id::text), 1, 8));
  
  insert into public.profiles (id, username, full_name, avatar_url, country, supported_team, fan_card_tier, is_premium)
  values (
    new.id,
    default_username,
    coalesce(new.raw_user_meta_data->>'full_name', 'World Cup Fan'),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'country', 'Unknown'),
    coalesce(new.raw_user_meta_data->>'supported_team', 'Neutral'),
    'rookie',
    false
  );

  insert into public.leaderboard (user_id, total_points, correct_predictions, total_predictions, accuracy_percent, current_streak, rank)
  values (
    new.id,
    0,
    0,
    0,
    0.00,
    0,
    null
  );

  return new;
exception
  when others then
    return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 10. Seed Default Badges
insert into public.badges (id, name, icon, description, condition_type, condition_value) values
  (1, 'First Prediction', '⚽', 'Made your first match prediction', 'first_prediction', 1),
  (2, 'Sharp Eye', '🎯', 'Predicted 3 correct outcomes in a row', 'streak_3', 3),
  (3, 'Streak x5', '🔥', 'Predicted 5 correct outcomes in a row', 'streak_5', 5),
  (4, 'Oracle', '🔮', 'Achieved 80%+ accuracy with at least 10 predictions', 'accuracy_80', 80),
  (5, 'Century', '💯', 'Reached 100 total prediction points', 'century_points', 100),
  (6, 'Top 10', '👑', 'Reached the Top 10 on the Global Leaderboard', 'top_10', 10)
on conflict (id) do nothing;

-- 11. Seed Digital Products
insert into public.digital_products (id, name, description, price_inr, file_url, preview_image, category, is_active) values
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', ' 2026 Bracket Tracker (Excel)', 'Interactive automated Excel workbook to track matches, group stages, and calculate knockout possibilities automatically as scores are updated.', 99, 'https://supabase.co/storage/v1/object/public/products/bracket_tracker_2026.xlsx', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60', 'Templates', true),
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'World Cup Wallpaper Pack (10 images)', 'Ultra-HD mobile and desktop football themed wallpapers showcasing World Cup stadiums, superstars, and neon team art.', 49, 'https://supabase.co/storage/v1/object/public/products/wallpaper_pack_2026.zip', 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=500&auto=format&fit=crop&q=60', 'Wallpapers', true),
  ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'All 48 Teams Stats Sheet', 'Deep statistical data analysis sheet for all 48 participating countries: qualifying goals, key tactical formations, expected goals, and history.', 79, 'https://supabase.co/storage/v1/object/public/products/team_stats_2026.pdf', 'https://images.unsplash.com/photo-1431324155629-1a6edd1d141d?w=500&auto=format&fit=crop&q=60', 'Tools', true),
  ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Prediction Strategy Guide (PDF)', 'Comprehensive statistics-based handbook outlining predictions optimization: historic host advantage, historical draws, and expected scores.', 129, 'https://supabase.co/storage/v1/object/public/products/prediction_strategy_2026.pdf', 'https://images.unsplash.com/photo-1540747737956-37872404af60?w=500&auto=format&fit=crop&q=60', 'Tools', true),
  ('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Complete Fan Bundle', 'Get the Ultimate Fan compilation including the Excel Bracket Tracker, 10x Wallpapers, 48 Teams stats sheet, and Prediction Strategy Guide at a discounted rate.', 299, 'https://supabase.co/storage/v1/object/public/products/complete_fan_bundle_2026.zip', 'https://images.unsplash.com/photo-1510563800743-aed2364902b9?w=500&auto=format&fit=crop&q=60', 'Bundles', true)
on conflict (id) do nothing;
