export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  country: string | null;
  supported_team: string | null;
  fan_card_tier: 'rookie' | 'follower' | 'analyst' | 'expert' | 'legend';
  is_premium: boolean;
  card_theme: 'free' | 'gold' | 'neon' | 'galaxy';
  title_badge: string | null;
  created_at: string;
}

export interface Match {
  id: number;
  api_match_id: number | null;
  home_team: string;
  away_team: string;
  home_team_logo: string | null;
  away_team_logo: string | null;
  match_date: string;
  stage: string | null;
  group_name: string | null;
  venue: string | null;
  status: 'upcoming' | 'live' | 'finished';
  home_score: number | null;
  away_score: number | null;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: number;
  predicted_winner: 'home' | 'away' | 'draw';
  predicted_home_score: number | null;
  predicted_away_score: number | null;
  points_earned: number;
  is_correct: boolean | null;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  total_points: number;
  correct_predictions: number;
  total_predictions: number;
  accuracy_percent: number;
  current_streak: number;
  rank: number | null;
  updated_at: string;
  profile?: Profile; // Populated via join query
}

export interface DigitalProduct {
  id: string;
  name: string;
  description: string | null;
  price_inr: number;
  file_url: string | null;
  preview_image: string | null;
  category: 'Templates' | 'Wallpapers' | 'Tools' | 'Bundles';
  is_active: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  product_id: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  amount_inr: number;
  status: 'pending' | 'paid' | 'failed';
  created_at: string;
}

export interface Badge {
  id: number;
  name: string;
  icon: string;
  description: string | null;
  condition_type: 'first_prediction' | 'streak_3' | 'streak_5' | 'accuracy_80' | 'century_points' | 'top_10';
  condition_value: number | null;
}

export interface UserBadge {
  user_id: string;
  badge_id: number;
  earned_at: string;
  badge?: Badge; // Populated via join query
}
