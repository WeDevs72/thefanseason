import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { calculatePoints } from '@/lib/utils';

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

    // 2. Fetch all finished matches
    const { data: finishedMatches, error: matchesError } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('status', 'finished');

    if (matchesError) throw matchesError;
    if (!finishedMatches || finishedMatches.length === 0) {
      return NextResponse.json({ success: true, message: 'No finished matches to evaluate' });
    }

    const finishedMatchIds = finishedMatches.map(m => m.id);

    // 3. Fetch unevaluated predictions for finished matches
    const { data: unevaluatedPredictions, error: predsError } = await supabaseAdmin
      .from('predictions')
      .select('*')
      .in('match_id', finishedMatchIds)
      .is('is_correct', null);

    if (predsError) throw predsError;
    if (!unevaluatedPredictions || unevaluatedPredictions.length === 0) {
      return NextResponse.json({ success: true, message: 'No pending predictions to evaluate' });
    }

    let evaluatedCount = 0;

    // 4. Calculate and update each prediction
    for (const pred of unevaluatedPredictions) {
      const match = finishedMatches.find(m => m.id === pred.match_id);
      if (!match) continue;

      const { points, isCorrect } = calculatePoints(
        pred.predicted_winner,
        pred.predicted_home_score,
        pred.predicted_away_score,
        match.home_score,
        match.away_score
      );

      const { error: updateError } = await supabaseAdmin
        .from('predictions')
        .update({
          points_earned: points,
          is_correct: isCorrect,
        })
        .eq('id', pred.id);

      if (!updateError) {
        evaluatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      evaluatedCount,
      message: `Successfully evaluated ${evaluatedCount} predictions.`
    });
  } catch (error: any) {
    console.error('Error evaluating predictions:', error);
    return NextResponse.json({ error: error.message || 'Evaluation failed' }, { status: 500 });
  }
}
