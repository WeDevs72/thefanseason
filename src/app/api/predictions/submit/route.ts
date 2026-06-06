import { NextResponse } from 'next/server';
import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server';
import { evaluateFanCardTier } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const supabase = createServerComponentClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { matchId, predictedWinner, predictedHomeScore, predictedAwayScore } = await req.json();

    if (!matchId || !predictedWinner) {
      return NextResponse.json({ error: 'Missing required fields: matchId, predictedWinner' }, { status: 400 });
    }

    // 2. Fetch match to check date / kickoff status
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const matchDate = new Date(match.match_date).getTime();
    const now = Date.now();

    if (now >= matchDate) {
      return NextResponse.json({ error: 'Prediction locked. Match has already started.' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 3. Upsert prediction
    const { data: prediction, error: predictionError } = await supabaseAdmin
      .from('predictions')
      .upsert({
        user_id: user.id,
        match_id: matchId,
        predicted_winner: predictedWinner,
        predicted_home_score: predictedHomeScore !== undefined && predictedHomeScore !== null ? Number(predictedHomeScore) : null,
        predicted_away_score: predictedAwayScore !== undefined && predictedAwayScore !== null ? Number(predictedAwayScore) : null,
        points_earned: 0,
        is_correct: null
      }, { onConflict: 'user_id,match_id' })
      .select()
      .single();

    if (predictionError) {
      throw predictionError;
    }

    // 4. Update immediate user statistics and check for badges/tiers
    const { count: predictionCount, error: countError } = await supabaseAdmin
      .from('predictions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (!countError && predictionCount !== null) {
      // Award "First Prediction" badge (ID: 1)
      if (predictionCount === 1) {
        await supabaseAdmin
          .from('user_badges')
          .upsert({ user_id: user.id, badge_id: 1 }, { onConflict: 'user_id,badge_id' });
      }

      // Upgrade tier to "Follower" if predictions count >= 5
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile && profile.fan_card_tier === 'rookie' && predictionCount >= 5) {
        await supabaseAdmin
          .from('profiles')
          .update({ fan_card_tier: 'follower' })
          .eq('id', user.id);
      }

      // Update total predictions in leaderboard
      await supabaseAdmin
        .from('leaderboard')
        .update({ total_predictions: predictionCount })
        .eq('user_id', user.id);
    }

    return NextResponse.json({ success: true, prediction });
  } catch (error: any) {
    console.error('Error submitting prediction:', error);
    return NextResponse.json({ error: error.message || 'Submission failed' }, { status: 500 });
  }
}
