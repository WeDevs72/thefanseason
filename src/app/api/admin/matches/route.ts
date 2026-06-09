import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server';
import { NextRequest } from 'next/server';
import { calculatePoints } from '@/lib/utils';

function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
}

// POST /api/admin/matches — create a new match
export async function POST(request: NextRequest) {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { home_team, away_team, match_date, stage, group_name, venue } = body;

  if (!home_team || !away_team || !match_date) {
    return Response.json({ error: 'home_team, away_team, and match_date are required' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from('matches')
    .insert({
      home_team,
      away_team,
      match_date,
      stage: stage || null,
      group_name: group_name || null,
      venue: venue || null,
      status: 'upcoming',
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true, match: data });
}

// PATCH /api/admin/matches — update score/status and trigger prediction scoring
export async function PATCH(request: NextRequest) {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { matchId, home_score, away_score, status } = body;

  if (!matchId) {
    return Response.json({ error: 'matchId is required' }, { status: 400 });
  }

  const admin = createAdminClient();

  const updates: Record<string, unknown> = {};
  if (typeof home_score === 'number') updates.home_score = home_score;
  if (typeof away_score === 'number') updates.away_score = away_score;
  if (status) updates.status = status;

  const { error: matchError } = await admin
    .from('matches')
    .update(updates)
    .eq('id', matchId);

  if (matchError) {
    return Response.json({ error: matchError.message }, { status: 500 });
  }

  // If the match is now finished and scores are provided, score all predictions
  if (status === 'finished' && typeof home_score === 'number' && typeof away_score === 'number') {
    const { data: predictions } = await admin
      .from('predictions')
      .select('*')
      .eq('match_id', matchId);

    if (predictions && predictions.length > 0) {
      const userPointsMap: Record<string, number> = {};

      for (const pred of predictions) {
        const { points, isCorrect } = calculatePoints(
          pred.predicted_winner,
          pred.predicted_home_score,
          pred.predicted_away_score,
          home_score,
          away_score
        );

        await admin
          .from('predictions')
          .update({ points_earned: points, is_correct: isCorrect })
          .eq('id', pred.id);

        if (!userPointsMap[pred.user_id]) {
          userPointsMap[pred.user_id] = 0;
        }
        userPointsMap[pred.user_id] += points;
      }

      // Update leaderboard totals for each affected user
      for (const [userId, addedPoints] of Object.entries(userPointsMap)) {
        const { data: lb } = await admin
          .from('leaderboard')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        const userPreds = predictions.filter(p => p.user_id === userId);
        const correctCount = userPreds.filter(p => {
          const { isCorrect } = calculatePoints(
            p.predicted_winner, p.predicted_home_score, p.predicted_away_score, home_score, away_score
          );
          return isCorrect;
        }).length;

        if (lb) {
          const newTotal = lb.total_points + addedPoints;
          const newCorrect = lb.correct_predictions + correctCount;
          const newTotalPreds = lb.total_predictions + userPreds.length;
          const newAccuracy = newTotalPreds > 0 ? (newCorrect / newTotalPreds) * 100 : 0;
          await admin
            .from('leaderboard')
            .update({
              total_points: newTotal,
              correct_predictions: newCorrect,
              total_predictions: newTotalPreds,
              accuracy_percent: newAccuracy,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
        } else {
          await admin.from('leaderboard').insert({
            user_id: userId,
            total_points: addedPoints,
            correct_predictions: correctCount,
            total_predictions: userPreds.length,
            accuracy_percent: userPreds.length > 0 ? (correctCount / userPreds.length) * 100 : 0,
            current_streak: 0,
          });
        }
      }
    }
  }

  return Response.json({ success: true });
}
