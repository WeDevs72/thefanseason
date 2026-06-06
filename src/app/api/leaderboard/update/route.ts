import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { evaluateFanCardTier } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    // 1. Authorize request
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && secret !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();

    // 2. Fetch all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, fan_card_tier');

    if (profilesError) throw profilesError;
    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ success: true, message: 'No profiles to update' });
    }

    // 3. Fetch all predictions to calculate user aggregates
    const { data: allPredictions, error: predsError } = await supabaseAdmin
      .from('predictions')
      .select('*, matches(match_date)')
      .order('created_at', { ascending: false });

    if (predsError) throw predsError;

    const userStatsList = [];

    // 4. Calculate stats for each user
    for (const profile of profiles) {
      const userPreds = allPredictions.filter(p => p.user_id === profile.id);
      
      const total_predictions = userPreds.length;
      const evaluatedPreds = userPreds.filter(p => p.is_correct !== null);
      const correct_predictions = evaluatedPreds.filter(p => p.is_correct === true).length;
      const total_points = evaluatedPreds.reduce((sum, p) => sum + (p.points_earned || 0), 0);
      
      const accuracy_percent = evaluatedPreds.length > 0 
        ? Number(((correct_predictions / evaluatedPreds.length) * 100).toFixed(2)) 
        : 0;

      // Calculate active win streak (consecutive correct predictions in evaluated matches sorted by date desc)
      let current_streak = 0;
      
      // Sort evaluated predictions by date desc to traverse most recent first
      const sortedEvaluated = [...evaluatedPreds].sort((a, b) => {
        const dateA = a.matches?.match_date ? new Date(a.matches.match_date).getTime() : 0;
        const dateB = b.matches?.match_date ? new Date(b.matches.match_date).getTime() : 0;
        return dateB - dateA; // Descending
      });

      for (const pred of sortedEvaluated) {
        if (pred.is_correct === true) {
          current_streak++;
        } else if (pred.is_correct === false) {
          break; // Streak broken!
        }
      }

      userStatsList.push({
        user_id: profile.id,
        total_points,
        correct_predictions,
        total_predictions,
        accuracy_percent,
        current_streak,
        fan_card_tier: profile.fan_card_tier
      });
    }

    // 5. Sort entries to assign global ranks
    // Rank logic: total_points desc, accuracy desc, streak desc, username/id asc
    userStatsList.sort((a, b) => {
      if (b.total_points !== a.total_points) {
        return b.total_points - a.total_points;
      }
      if (b.accuracy_percent !== a.accuracy_percent) {
        return b.accuracy_percent - a.accuracy_percent;
      }
      return b.current_streak - a.current_streak;
    });

    // 6. Save leaderboard entries with ranks and update tiers & badges
    const updatedLeaderboard = [];
    
    for (let i = 0; i < userStatsList.length; i++) {
      const stats = userStatsList[i];
      const rank = i + 1;

      // Update leaderboard table
      const { data: lbRow, error: lbError } = await supabaseAdmin
        .from('leaderboard')
        .upsert({
          user_id: stats.user_id,
          total_points: stats.total_points,
          correct_predictions: stats.correct_predictions,
          total_predictions: stats.total_predictions,
          accuracy_percent: stats.accuracy_percent,
          current_streak: stats.current_streak,
          rank,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (lbError) {
        console.error(`Error saving leaderboard for user ${stats.user_id}:`, lbError.message);
        continue;
      }

      updatedLeaderboard.push(lbRow);

      // Determine updated Fan Card Tier
      const newTier = evaluateFanCardTier({
        total_predictions: stats.total_predictions,
        accuracy_percent: stats.accuracy_percent,
        rank
      });

      if (newTier !== stats.fan_card_tier) {
        await supabaseAdmin
          .from('profiles')
          .update({ fan_card_tier: newTier })
          .eq('id', stats.user_id);
      }

      // Check and award achievements/badges
      // Badge 2: Sharp Eye - 3 correct in a row
      if (stats.current_streak >= 3) {
        await supabaseAdmin
          .from('user_badges')
          .upsert({ user_id: stats.user_id, badge_id: 2 }, { onConflict: 'user_id,badge_id' });
      }
      
      // Badge 3: Streak x5 - 5 correct in a row
      if (stats.current_streak >= 5) {
        await supabaseAdmin
          .from('user_badges')
          .upsert({ user_id: stats.user_id, badge_id: 3 }, { onConflict: 'user_id,badge_id' });
      }

      // Badge 4: Oracle - 80%+ accuracy with min 10 predictions
      if (stats.accuracy_percent >= 80 && stats.total_predictions >= 10) {
        await supabaseAdmin
          .from('user_badges')
          .upsert({ user_id: stats.user_id, badge_id: 4 }, { onConflict: 'user_id,badge_id' });
      }

      // Badge 5: Century - 100 points
      if (stats.total_points >= 100) {
        await supabaseAdmin
          .from('user_badges')
          .upsert({ user_id: stats.user_id, badge_id: 5 }, { onConflict: 'user_id,badge_id' });
      }

      // Badge 6: Top 10 - Reached rank <= 10
      if (rank <= 10) {
        await supabaseAdmin
          .from('user_badges')
          .upsert({ user_id: stats.user_id, badge_id: 6 }, { onConflict: 'user_id,badge_id' });
      }
    }

    return NextResponse.json({
      success: true,
      processedUsersCount: userStatsList.length,
      leaderboard: updatedLeaderboard
    });
  } catch (error: any) {
    console.error('Error updating leaderboard aggregates:', error);
    return NextResponse.json({ error: error.message || 'Leaderboard update failed' }, { status: 500 });
  }
}
